-- Public bucket for virtual tribute icons (SVG/PNG). Tune size/MIME limits in Dashboard if needed.
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-items', 'store-items', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies on storage.objects (RLS is enabled by default on Supabase Storage)
DROP POLICY IF EXISTS "store_items_public_read" ON storage.objects;
CREATE POLICY "store_items_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-items');

DROP POLICY IF EXISTS "store_items_admin_insert" ON storage.objects;
CREATE POLICY "store_items_admin_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'store-items' AND public.is_admin());

DROP POLICY IF EXISTS "store_items_admin_update" ON storage.objects;
CREATE POLICY "store_items_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'store-items' AND public.is_admin())
  WITH CHECK (bucket_id = 'store-items' AND public.is_admin());

DROP POLICY IF EXISTS "store_items_admin_delete" ON storage.objects;
CREATE POLICY "store_items_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'store-items' AND public.is_admin());
