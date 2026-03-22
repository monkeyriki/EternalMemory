-- Premium memorials: no ads when ads_free = true
-- Fixed ad slots for AdSense (or other) snippets; toggled via platform_settings.ads_enabled

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS ads_free boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.ad_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key text NOT NULL UNIQUE,
  adsense_code text,
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ad_slots_select ON public.ad_slots;
CREATE POLICY ad_slots_select
  ON public.ad_slots FOR SELECT
  USING (true);

DROP POLICY IF EXISTS ad_slots_insert_admin ON public.ad_slots;
CREATE POLICY ad_slots_insert_admin
  ON public.ad_slots FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS ad_slots_update_admin ON public.ad_slots;
CREATE POLICY ad_slots_update_admin
  ON public.ad_slots FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS ad_slots_delete_admin ON public.ad_slots;
CREATE POLICY ad_slots_delete_admin
  ON public.ad_slots FOR DELETE
  USING (public.is_admin());

INSERT INTO public.ad_slots (slot_key, description, is_active, adsense_code)
VALUES
  ('memorial_top', 'Below header on public memorial pages', true, NULL),
  ('memorial_bottom', 'Above share/footer on public memorial pages', true, NULL)
ON CONFLICT (slot_key) DO NOTHING;
