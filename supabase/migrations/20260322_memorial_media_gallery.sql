-- Gallery images for memorials (in addition to cover_image_url on memorials).

CREATE TABLE IF NOT EXISTS public.memorial_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES public.memorials (id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memorial_media_memorial_id_idx
  ON public.memorial_media (memorial_id);

ALTER TABLE public.memorial_media ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent if you already ran supabase-rls-all-tables.sql)
DROP POLICY IF EXISTS "memorial_media_select" ON public.memorial_media;
CREATE POLICY "memorial_media_select"
  ON public.memorial_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_media.memorial_id
        AND (
          m.visibility IN ('public', 'unlisted')
          OR m.owner_id = auth.uid()
        )
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "memorial_media_insert_owner_or_admin" ON public.memorial_media;
CREATE POLICY "memorial_media_insert_owner_or_admin"
  ON public.memorial_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_media.memorial_id AND m.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "memorial_media_update_owner_or_admin" ON public.memorial_media;
CREATE POLICY "memorial_media_update_owner_or_admin"
  ON public.memorial_media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_media.memorial_id AND m.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "memorial_media_delete_owner_or_admin" ON public.memorial_media;
CREATE POLICY "memorial_media_delete_owner_or_admin"
  ON public.memorial_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_media.memorial_id AND m.owner_id = auth.uid()
    )
    OR public.is_admin()
  );
