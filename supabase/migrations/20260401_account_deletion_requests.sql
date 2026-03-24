-- Track user account deletion requests (GDPR/CCPA workflow)
create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'completed', 'rejected')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  admin_note text
);

alter table public.account_deletion_requests enable row level security;

-- Requester can create and read only own requests
drop policy if exists adr_insert_own on public.account_deletion_requests;
create policy adr_insert_own
  on public.account_deletion_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists adr_select_own on public.account_deletion_requests;
create policy adr_select_own
  on public.account_deletion_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin can view and process all requests
drop policy if exists adr_admin_select_all on public.account_deletion_requests;
create policy adr_admin_select_all
  on public.account_deletion_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists adr_admin_update_all on public.account_deletion_requests;
create policy adr_admin_update_all
  on public.account_deletion_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create index if not exists idx_adr_user_id on public.account_deletion_requests(user_id);
create index if not exists idx_adr_status_requested_at on public.account_deletion_requests(status, requested_at desc);
