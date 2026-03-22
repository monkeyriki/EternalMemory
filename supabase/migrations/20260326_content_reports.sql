-- Content reports: user-flagged memorials / guestbook entries (Global Moderation PRD).
-- RLS: anyone can INSERT (guest or logged-in); only admins SELECT/UPDATE.
--
-- Enum creation is idempotent: safe to re-run if types already exist (SQL Editor 42710).

DO $$
BEGIN
  CREATE TYPE public.content_report_reason AS ENUM (
    'spam',
    'offensive',
    'inappropriate',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.content_report_status AS ENUM (
    'open',
    'reviewed',
    'dismissed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  memorial_id uuid NOT NULL REFERENCES public.memorials (id) ON DELETE CASCADE,
  tribute_id uuid REFERENCES public.virtual_tributes (id) ON DELETE SET NULL,
  reason public.content_report_reason NOT NULL,
  custom_message text,
  status public.content_report_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status_created
  ON public.content_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_memorial
  ON public.content_reports (memorial_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_tribute
  ON public.content_reports (tribute_id)
  WHERE tribute_id IS NOT NULL;

COMMENT ON TABLE public.content_reports IS
  'User-submitted flags; admin queue at /admin/reports (app). Validate tribute belongs to memorial in application.';

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS content_reports_insert_any ON public.content_reports;
CREATE POLICY content_reports_insert_any
  ON public.content_reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS content_reports_select_admin ON public.content_reports;
CREATE POLICY content_reports_select_admin
  ON public.content_reports FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS content_reports_update_admin ON public.content_reports;
CREATE POLICY content_reports_update_admin
  ON public.content_reports FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS content_reports_delete_admin ON public.content_reports;
CREATE POLICY content_reports_delete_admin
  ON public.content_reports FOR DELETE
  USING (public.is_admin());
