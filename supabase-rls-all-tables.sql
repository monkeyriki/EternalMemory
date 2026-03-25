-- =============================================================================
-- Evermissed: RLS completo su tutte le 11 tabelle
-- Guest = solo lettura pubblico | User = propri dati | Admin = tutto
-- Esegui nel SQL Editor di Supabase (una sola volta).
-- =============================================================================

-- Helper: true se l'utente corrente è admin (usa SECURITY DEFINER per leggere profiles)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- -----------------------------------------------------------------------------
-- 1) PROFILES
-- -----------------------------------------------------------------------------
drop policy if exists "Public profiles are readable" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "profiles_select_all"
  on public.profiles for select using (true);

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- INSERT resta solo al trigger; DELETE: solo admin (o nessuno, a scelta)
create policy "profiles_delete_admin"
  on public.profiles for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2) MEMORIALS
-- -----------------------------------------------------------------------------
drop policy if exists "Public memorials readable by anyone" on public.memorials;
drop policy if exists "Owners manage own memorials" on public.memorials;
drop policy if exists "memorials_select_managed_by_partner" on public.memorials;

create policy "memorials_select_public_or_owner_or_admin"
  on public.memorials for select
  using (
    (visibility = 'public' or visibility = 'unlisted' or owner_id = auth.uid())
    or public.is_admin()
  );

create policy "memorials_insert_authenticated"
  on public.memorials for insert
  with check (
    auth.uid() = owner_id
    and (managed_by_partner_id is null or managed_by_partner_id = auth.uid())
  );

-- Partner can read memorials they manage (e.g. owner = client, managed_by_partner = B2B user)
create policy "memorials_select_managed_by_partner"
  on public.memorials for select
  to authenticated
  using (managed_by_partner_id = auth.uid());

create policy "memorials_update_owner_or_admin"
  on public.memorials for update
  using (
    owner_id = auth.uid()
    or managed_by_partner_id = auth.uid()
    or public.is_admin()
  )
  with check (
    owner_id = auth.uid()
    or managed_by_partner_id = auth.uid()
    or public.is_admin()
  );

create policy "memorials_delete_owner_or_admin"
  on public.memorials for delete
  using (
    owner_id = auth.uid()
    or managed_by_partner_id = auth.uid()
    or public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- 3) MEMORIAL_MEDIA
-- -----------------------------------------------------------------------------
drop policy if exists "Media readable by anyone" on public.memorial_media;

create policy "memorial_media_select"
  on public.memorial_media for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_media.memorial_id
        and (m.visibility in ('public','unlisted') or m.owner_id = auth.uid())
    )
    or public.is_admin()
  );

create policy "memorial_media_insert_owner_or_admin"
  on public.memorial_media for insert
  with check (
    exists (select 1 from public.memorials m where m.id = memorial_media.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

create policy "memorial_media_update_owner_or_admin"
  on public.memorial_media for update
  using (
    exists (select 1 from public.memorials m where m.id = memorial_media.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

create policy "memorial_media_delete_owner_or_admin"
  on public.memorial_media for delete
  using (
    exists (select 1 from public.memorials m where m.id = memorial_media.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- 4) GUESTBOOK_ENTRIES
-- -----------------------------------------------------------------------------
drop policy if exists "Approved or own entries readable" on public.guestbook_entries;
drop policy if exists "Anyone logged-in can insert guestbook entry" on public.guestbook_entries;

create policy "guestbook_select"
  on public.guestbook_entries for select
  using (
    status = 'approved'
    or author_id = auth.uid()
    or exists (select 1 from public.memorials m where m.id = guestbook_entries.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

-- Guest (anon) e User possono lasciare un messaggio; author_id null = anon
create policy "guestbook_insert"
  on public.guestbook_entries for insert
  with check (author_id = auth.uid() or author_id is null);

-- Solo owner del memorial o admin possono aggiornare (es. status pending -> approved)
create policy "guestbook_update_owner_or_admin"
  on public.guestbook_entries for update
  using (
    exists (select 1 from public.memorials m where m.id = guestbook_entries.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

create policy "guestbook_delete_owner_or_admin"
  on public.guestbook_entries for delete
  using (
    exists (select 1 from public.memorials m where m.id = guestbook_entries.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- 5) STORE_ITEMS
-- -----------------------------------------------------------------------------
drop policy if exists "Store items readable by anyone" on public.store_items;

create policy "store_items_select"
  on public.store_items for select
  using (is_active = true or public.is_admin());

create policy "store_items_insert_admin"
  on public.store_items for insert with check (public.is_admin());

create policy "store_items_update_admin"
  on public.store_items for update using (public.is_admin());

create policy "store_items_delete_admin"
  on public.store_items for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6) ORDERS
-- -----------------------------------------------------------------------------
drop policy if exists "User can see own orders" on public.orders;

create policy "orders_select_own_or_admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "orders_insert_authenticated"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Update (es. status dopo pagamento) tipicamente da webhook/service; anon key: solo admin
create policy "orders_update_admin"
  on public.orders for update using (public.is_admin());

create policy "orders_delete_admin"
  on public.orders for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7) VIRTUAL_TRIBUTES
-- -----------------------------------------------------------------------------
drop policy if exists "Virtual tributes readable by anyone" on public.virtual_tributes;

create policy "virtual_tributes_select"
  on public.virtual_tributes for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = virtual_tributes.memorial_id
        and (m.visibility in ('public','unlisted') or m.owner_id = auth.uid())
    )
    or public.is_admin()
  );

create policy "virtual_tributes_insert_authenticated_or_admin"
  on public.virtual_tributes for insert
  with check (purchaser_id = auth.uid() or public.is_admin());

create policy "virtual_tributes_guest_insert"
  on public.virtual_tributes for insert
  to anon
  with check (purchaser_id is null and is_approved = false);

create policy "virtual_tributes_update_admin"
  on public.virtual_tributes for update using (public.is_admin());

-- Memorial owner can update tributes on their memorial (e.g. approve guest messages)
create policy "virtual_tributes_update_memorial_owner"
  on public.virtual_tributes for update
  using (
    exists (
      select 1 from public.memorials m
      where m.id = virtual_tributes.memorial_id and m.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.memorials m
      where m.id = virtual_tributes.memorial_id and m.owner_id = auth.uid()
    )
  );

create policy "virtual_tributes_delete_admin"
  on public.virtual_tributes for delete using (public.is_admin());

-- Memorial owner can delete tributes on their memorial
create policy "virtual_tributes_delete_memorial_owner"
  on public.virtual_tributes for delete
  using (
    exists (
      select 1 from public.memorials m
      where m.id = virtual_tributes.memorial_id and m.owner_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 8) B2B_SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
drop policy if exists "Account can see own subscription" on public.b2b_subscriptions;

create policy "b2b_subscriptions_select_own_or_admin"
  on public.b2b_subscriptions for select
  using (account_id = auth.uid() or public.is_admin());

create policy "b2b_subscriptions_insert_admin"
  on public.b2b_subscriptions for insert with check (public.is_admin());

create policy "b2b_subscriptions_update_admin"
  on public.b2b_subscriptions for update using (public.is_admin());

create policy "b2b_subscriptions_delete_admin"
  on public.b2b_subscriptions for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 9) QR_CODES
-- -----------------------------------------------------------------------------
create policy "qr_codes_select"
  on public.qr_codes for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = qr_codes.memorial_id
        and (m.visibility in ('public','unlisted') or m.owner_id = auth.uid())
    )
    or public.is_admin()
  );

create policy "qr_codes_insert_owner_or_admin"
  on public.qr_codes for insert
  with check (
    exists (select 1 from public.memorials m where m.id = qr_codes.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

create policy "qr_codes_update_owner_or_admin"
  on public.qr_codes for update
  using (
    exists (select 1 from public.memorials m where m.id = qr_codes.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

create policy "qr_codes_delete_owner_or_admin"
  on public.qr_codes for delete
  using (
    exists (select 1 from public.memorials m where m.id = qr_codes.memorial_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- 10) AD_SLOTS
-- -----------------------------------------------------------------------------
drop policy if exists "Ad slots readable by anyone" on public.ad_slots;

create policy "ad_slots_select"
  on public.ad_slots for select using (true);

create policy "ad_slots_insert_admin"
  on public.ad_slots for insert with check (public.is_admin());

create policy "ad_slots_update_admin"
  on public.ad_slots for update using (public.is_admin());

create policy "ad_slots_delete_admin"
  on public.ad_slots for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 11) PLATFORM_SETTINGS
-- -----------------------------------------------------------------------------
drop policy if exists "Platform settings readable by anyone" on public.platform_settings;

create policy "platform_settings_select"
  on public.platform_settings for select using (true);

create policy "platform_settings_insert_admin"
  on public.platform_settings for insert with check (public.is_admin());

create policy "platform_settings_update_admin"
  on public.platform_settings for update using (public.is_admin());

create policy "platform_settings_delete_admin"
  on public.platform_settings for delete using (public.is_admin());

-- Fine script RLS.
