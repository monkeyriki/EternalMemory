import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // Fail fast for dev/test; on production, env vars must be provided.
  throw new Error("Missing STRIPE_SECRET_KEY");
}

// Stripe SDK types possono non accettare letterali "2024-06-20" in base alla versione installata.
// Manteniamo comunque la versione richiesta dal prompt.
export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20" as any
});

