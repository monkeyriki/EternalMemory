-- English blocklist for profanity / banned terms (admin-managed).
-- Used server-side: guestbook message, guest name, optional paid-tribute note.

CREATE TABLE IF NOT EXISTS public.blocked_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One row per term (single word or multi-word phrase). Compare case-insensitive via app or ilike.
CREATE UNIQUE INDEX IF NOT EXISTS blocked_words_word_lower_uidx
  ON public.blocked_words (lower(trim(word)));

ALTER TABLE public.blocked_words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blocked_words_select_all ON public.blocked_words;
CREATE POLICY blocked_words_select_all
  ON public.blocked_words FOR SELECT
  USING (true);

DROP POLICY IF EXISTS blocked_words_insert_admin ON public.blocked_words;
CREATE POLICY blocked_words_insert_admin
  ON public.blocked_words FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS blocked_words_update_admin ON public.blocked_words;
CREATE POLICY blocked_words_update_admin
  ON public.blocked_words FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS blocked_words_delete_admin ON public.blocked_words;
CREATE POLICY blocked_words_delete_admin
  ON public.blocked_words FOR DELETE
  USING (public.is_admin());

COMMENT ON TABLE public.blocked_words IS
  'EN banned terms; app blocks submission (no save). Extend via SQL or future admin UI.';
