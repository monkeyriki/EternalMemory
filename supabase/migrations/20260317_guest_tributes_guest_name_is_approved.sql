-- Guest tributes: guest_name and is_approved for moderation.
-- Guest inserts use purchaser_id = NULL and is_approved = false.

ALTER TABLE virtual_tributes
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;

-- Allow anonymous insert for guest tributes only (no purchaser, pending approval).
CREATE POLICY "virtual_tributes_guest_insert"
  ON virtual_tributes FOR INSERT
  TO anon
  WITH CHECK (
    purchaser_id IS NULL
    AND is_approved = false
  );
