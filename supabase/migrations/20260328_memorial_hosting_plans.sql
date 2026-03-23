-- Consumer memorial hosting plans: Basic (default) / Premium (subscription) / Lifetime (one-time).
-- App + Stripe webhook update hosting_plan, plan_expires_at, stripe_subscription_id.

DO $$
BEGIN
  CREATE TYPE public.memorial_hosting_plan AS ENUM ('basic', 'premium', 'lifetime');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS hosting_plan public.memorial_hosting_plan NOT NULL DEFAULT 'basic';

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS last_hosting_checkout_session_id text;

COMMENT ON COLUMN public.memorials.hosting_plan IS
  'basic = free tier; premium = paid subscription; lifetime = one-time purchase.';
COMMENT ON COLUMN public.memorials.plan_expires_at IS
  'For premium: current period end from Stripe. NULL for basic/lifetime.';
COMMENT ON COLUMN public.memorials.stripe_subscription_id IS
  'Stripe subscription id when hosting_plan = premium.';
COMMENT ON COLUMN public.memorials.last_hosting_checkout_session_id IS
  'Idempotency for checkout.session.completed (hosting upgrades).';

CREATE INDEX IF NOT EXISTS idx_memorials_stripe_subscription
  ON public.memorials (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
