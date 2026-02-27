"use server";

import { redirect } from "next/navigation";

import { auth } from "@/features/auth/auth.config";
import { getUserById, updateStripeCustomerId } from "@/features/auth/auth.dal";
import { getStripe, getPriceId } from "@/features/billing/billing.client";

export async function createCheckoutSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const userId = session.user.id;

    const user = await getUserById(userId);
    if (!user) throw new Error("User not found");

    let customerId = user.stripeCustomerId;

    if (!customerId) {
        const customer = await getStripe().customers.create({
            email: user.email,
            metadata: { userId },
        });
        customerId = customer.id;

        await updateStripeCustomerId(userId, customerId);
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: getPriceId(), quantity: 1 }],
        success_url: `${process.env.AUTH_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.AUTH_URL}/pricing`,
        subscription_data: {
            metadata: { userId },
        },
        metadata: { userId },
    });

    if (!checkoutSession.url) {
        throw new Error("Failed to create checkout session");
    }

    redirect(checkoutSession.url);
}

export async function createPortalSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const user = await getUserById(session.user.id);
    if (!user?.stripeCustomerId) {
        throw new Error("No Stripe customer found");
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.AUTH_URL}/dashboard`,
    });

    redirect(portalSession.url);
}
