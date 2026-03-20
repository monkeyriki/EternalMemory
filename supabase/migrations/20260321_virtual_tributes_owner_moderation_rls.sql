-- Memorial owner can update (e.g. approve) and delete virtual_tributes on their memorial.
-- Complements existing admin-only policies.

DROP POLICY IF EXISTS "virtual_tributes_update_memorial_owner" ON public.virtual_tributes;
CREATE POLICY "virtual_tributes_update_memorial_owner"
  ON public.virtual_tributes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.memorials m
      WHERE m.id = virtual_tributes.memorial_id
        AND m.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.memorials m
      WHERE m.id = virtual_tributes.memorial_id
        AND m.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "virtual_tributes_delete_memorial_owner" ON public.virtual_tributes;
CREATE POLICY "virtual_tributes_delete_memorial_owner"
  ON public.virtual_tributes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.memorials m
      WHERE m.id = virtual_tributes.memorial_id
        AND m.owner_id = auth.uid()
    )
  );
