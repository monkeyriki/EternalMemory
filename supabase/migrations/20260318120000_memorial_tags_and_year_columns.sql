-- PRD: directory filter by tags + birth/death years
-- Requires date_of_birth / date_of_death castable to date (standard Supabase date columns).

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_memorials_tags ON public.memorials USING GIN (tags);

-- Generated years for indexed filtering (kept in sync when dates change)
ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS birth_year integer
  GENERATED ALWAYS AS (
    CASE
      WHEN date_of_birth IS NULL THEN NULL
      ELSE EXTRACT(YEAR FROM date_of_birth::date)::integer
    END
  ) STORED;

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS death_year integer
  GENERATED ALWAYS AS (
    CASE
      WHEN date_of_death IS NULL THEN NULL
      ELSE EXTRACT(YEAR FROM date_of_death::date)::integer
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_memorials_birth_year ON public.memorials (birth_year);
CREATE INDEX IF NOT EXISTS idx_memorials_death_year ON public.memorials (death_year);
