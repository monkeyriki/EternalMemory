-- IP bans (PRD super-admin) + allow admins to list all memorials for takedown UI.
-- Run in Supabase SQL Editor after previous migrations.

-- ---------------------------------------------------------------------------
-- memorials: admins can SELECT any row (for /admin/memorials takedown list)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS memorials_select_admin_all ON public.memorials;
CREATE POLICY memorials_select_admin_all
  ON public.memorials
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- ip_bans: block site access by IPv4/IPv6 or CIDR (e.g. 203.0.113.5 or 10.0.0.0/24)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ip_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cidr cidr NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ip_bans_expires ON public.ip_bans (expires_at);

COMMENT ON TABLE public.ip_bans IS
  'Super-admin IP/CIDR blocks; enforced in Next middleware + sensitive server actions/API.';

ALTER TABLE public.ip_bans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ip_bans_select_admin ON public.ip_bans;
CREATE POLICY ip_bans_select_admin
  ON public.ip_bans FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS ip_bans_insert_admin ON public.ip_bans;
CREATE POLICY ip_bans_insert_admin
  ON public.ip_bans FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS ip_bans_update_admin ON public.ip_bans;
CREATE POLICY ip_bans_update_admin
  ON public.ip_bans FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS ip_bans_delete_admin ON public.ip_bans;
CREATE POLICY ip_bans_delete_admin
  ON public.ip_bans FOR DELETE
  USING (public.is_admin());

-- Callable with anon key from middleware: checks bans without exposing the table.
CREATE OR REPLACE FUNCTION public.is_ip_address_banned(check_ip text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ip inet;
BEGIN
  IF check_ip IS NULL OR btrim(check_ip) = '' THEN
    RETURN false;
  END IF;
  BEGIN
    ip := split_part(btrim(check_ip), ',', 1)::inet;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN false;
  END;
  RETURN EXISTS (
    SELECT 1
    FROM public.ip_bans b
    WHERE (b.expires_at IS NULL OR b.expires_at > now())
      AND ip <<= b.cidr
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_ip_address_banned(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_ip_address_banned(text) TO anon, authenticated, service_role;
