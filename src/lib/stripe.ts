import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Creates Stripe client lazily so unrelated routes/pages can build
 * even when STRIPE_SECRET_KEY is not set in that environment.
 */
export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  // Stripe SDK types possono non accettare letterali "2024-06-20" in base alla versione installata.
  // Manteniamo comunque la versione richiesta dal prompt.
  stripeClient = new Stripe(secretKey, {
    apiVersion: "2024-06-20" as any
  });
  return stripeClient;
}

/**
 * Backward-compatible export: existing imports can keep using `stripe`.
 * The real client is resolved only when a property/method is accessed.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe() as any;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  }
}) as Stripe;

