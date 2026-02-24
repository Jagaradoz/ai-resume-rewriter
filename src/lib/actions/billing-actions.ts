"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe, PRO_PRICE_ID } from "@/lib/stripe";

/**
 * Create a Stripe Checkout session for Pro upgrade.
 * Redirects the user to Stripe's hosted checkout page.
 */
export async function createCheckoutSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const userId = session.user.id;

    // Get or create Stripe customer
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, stripeCustomerId: true },
    });

    if (!user) throw new Error("User not found");

    let customerId = user.stripeCustomerId;

    if (!customerId) {
        const customer = await getStripe().customers.create({
            email: user.email,
            metadata: { userId },
        });
        customerId = customer.id;

        await db.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
        });
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
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

/**
 * Create a Stripe Customer Portal session for managing subscription.
 * Redirects the user to Stripe's hosted portal.
 */
export async function createPortalSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
        throw new Error("No Stripe customer found");
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.AUTH_URL}/dashboard`,
    });

    redirect(portalSession.url);
}
