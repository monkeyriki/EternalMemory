-- Configurable premium spotlight duration (days) per virtual tribute product; default 30 (PRD).

ALTER TABLE public.store_items
  ADD COLUMN IF NOT EXISTS highlight_duration_days integer NOT NULL DEFAULT 30;

ALTER TABLE public.store_items
  DROP CONSTRAINT IF EXISTS store_items_highlight_duration_days_check;

ALTER TABLE public.store_items
  ADD CONSTRAINT store_items_highlight_duration_days_check
  CHECK (highlight_duration_days >= 1 AND highlight_duration_days <= 365);

COMMENT ON COLUMN public.store_items.highlight_duration_days IS
  'When is_premium, purchaser gets top-of-page spotlight for this many days after payment.';
