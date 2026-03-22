-- =============================================================================
-- COMPLETE SETUP: blocked_words (EN) — run once in Supabase SQL Editor
-- Schema + RLS + starter blocklist (profanity, slurs, common variants).
-- Idempotent: safe to re-run; skips rows that already exist (case-insensitive).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.blocked_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

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
  'EN banned terms; app blocks submission (no save). Review and extend in Table Editor or SQL.';

-- -----------------------------------------------------------------------------
-- Seed list (English): strong profanity, common compounds, hate/slurs, leetspeak
-- -----------------------------------------------------------------------------

INSERT INTO public.blocked_words (word, is_active)
SELECT v, true
FROM (
  VALUES
    -- Strong profanity & compounds
    ('ass'),
    ('asses'),
    ('asshole'),
    ('assholes'),
    ('asshat'),
    ('bastard'),
    ('bastards'),
    ('bitch'),
    ('bitches'),
    ('bitching'),
    ('bitchy'),
    ('bollocks'),
    ('bullshit'),
    ('clusterfuck'),
    ('cock'),
    ('cocks'),
    ('cocksucker'),
    ('cocksuckers'),
    ('crap'),
    ('crappy'),
    ('cum'),
    ('cumming'),
    ('cums'),
    ('cunt'),
    ('cunts'),
    ('damn'),
    ('dammit'),
    ('dick'),
    ('dicks'),
    ('dickhead'),
    ('dickheads'),
    ('dickwad'),
    ('dipshit'),
    ('douche'),
    ('douchebag'),
    ('douchebags'),
    ('dumbass'),
    ('dumb ass'),
    ('fuck'),
    ('fucks'),
    ('fucked'),
    ('fucker'),
    ('fuckers'),
    ('fucking'),
    ('fuckface'),
    ('fuckwit'),
    ('fuck off'),
    ('fuck you'),
    ('goddamn'),
    ('god damn'),
    ('handjob'),
    ('hand job'),
    ('hell'),
    ('jackass'),
    ('jackasses'),
    ('jerk off'),
    ('jerkoff'),
    ('jizz'),
    ('kike'),
    ('kikes'),
    ('motherfucker'),
    ('motherfuckers'),
    ('motherfucking'),
    ('nutsack'),
    ('ballsack'),
    ('nigger'),
    ('niggers'),
    ('nigga'),
    ('niggas'),
    ('piss'),
    ('pissed'),
    ('pissing'),
    ('porn'),
    ('porno'),
    ('pornography'),
    ('prick'),
    ('pricks'),
    ('pussy'),
    ('pussies'),
    ('retard'),
    ('retarded'),
    ('retards'),
    ('shit'),
    ('shits'),
    ('shitting'),
    ('shitty'),
    ('shithead'),
    ('shitheads'),
    ('shitbag'),
    ('shitfuck'),
    ('slut'),
    ('sluts'),
    ('slutty'),
    ('spic'),
    ('spics'),
    ('twat'),
    ('twats'),
    ('wank'),
    ('wanker'),
    ('wankers'),
    ('whore'),
    ('whores'),
    ('whoring'),
    ('fag'),
    ('fags'),
    ('faggot'),
    ('faggots'),
    ('dyke'),
    ('dykes'),
    ('tranny'),
    ('trannies'),
    ('chink'),
    ('chinks'),
    ('gook'),
    ('gooks'),
    ('wetback'),
    ('wetbacks'),
    ('coon'),
    ('coons'),
    ('raghead'),
    ('towelhead'),
    ('terrorist scum'),
    -- Phrases / harassment
    ('kill yourself'),
    ('kys'),
    ('neck yourself'),
    ('die in a fire'),
    -- Common obfuscations (still match whole-token in app where applicable)
    ('fuk'),
    ('fck'),
    ('sh1t'),
    ('shyt'),
    ('b1tch'),
    ('azz'),
    ('biatch'),
    ('phuck'),
    ('fcuk')
) AS t(v)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.blocked_words b
  WHERE lower(trim(b.word)) = lower(trim(t.v))
);
