-- Add "Flowers" virtual tribute item (idempotent).
-- PRD-aligned: guests can purchase virtual tributes such as flowers.
insert into public.store_items (
  name,
  description,
  category,
  price_cents,
  currency,
  image_url,
  is_active,
  is_premium,
  highlight_duration_days
)
select
  'Flowers',
  'Lay a flower in memory.',
  'flowers',
  199,
  'usd',
  '/store-items/flowers.svg',
  true,
  false,
  30
where not exists (
  select 1
  from public.store_items
  where lower(name) = 'flowers'
);
