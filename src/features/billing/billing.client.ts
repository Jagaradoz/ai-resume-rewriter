import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazy-initialized Stripe client.
 * Avoids crashing at build time when STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            typescript: true,
        });
    }
    return _stripe;
}

/**
 * Pro plan price ID from Stripe dashboard.
 * Create a recurring price ($3/mo) in Stripe and set this env var.
 */
export function getPriceId(): string {
    const id = process.env.STRIPE_PRO_PRICE_ID;
    if (!id) throw new Error("STRIPE_PRO_PRICE_ID is not set");
    return id;
}
