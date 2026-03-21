-- B2B Partner: memorials managed_by_partner_id + RLS + unique subscription id for upserts
-- Run in Supabase SQL Editor (or via CLI) before testing.

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS managed_by_partner_id UUID REFERENCES auth.users (id);

CREATE INDEX IF NOT EXISTS idx_memorials_managed_by_partner
  ON public.memorials (managed_by_partner_id);

-- One row per Stripe subscription id (partial: allow legacy NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS b2b_subscriptions_provider_subscription_id_uidx
  ON public.b2b_subscriptions (provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

-- INSERT: owner must be self; partner column only self or null (prevents spoofing)
DROP POLICY IF EXISTS memorials_insert_authenticated ON public.memorials;
CREATE POLICY memorials_insert_authenticated
  ON public.memorials FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND (managed_by_partner_id IS NULL OR managed_by_partner_id = auth.uid())
  );

-- SELECT: partner can read memorials they manage (e.g. future owner != partner)
DROP POLICY IF EXISTS memorials_select_managed_by_partner ON public.memorials;
CREATE POLICY memorials_select_managed_by_partner
  ON public.memorials FOR SELECT
  TO authenticated
  USING (managed_by_partner_id = auth.uid());

-- UPDATE / DELETE: partner can manage client memorials
DROP POLICY IF EXISTS memorials_update_owner_or_admin ON public.memorials;
CREATE POLICY memorials_update_owner_or_admin
  ON public.memorials FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR managed_by_partner_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR managed_by_partner_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS memorials_delete_owner_or_admin ON public.memorials;
CREATE POLICY memorials_delete_owner_or_admin
  ON public.memorials FOR DELETE
  USING (
    owner_id = auth.uid()
    OR managed_by_partner_id = auth.uid()
    OR public.is_admin()
  );
