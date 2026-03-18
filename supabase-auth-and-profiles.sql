-- =============================================================================
-- EternalMemory: profiles + RLS + trigger auth.users → profiles
-- Esegui questo script nel SQL Editor di Supabase (una sola volta).
-- =============================================================================

-- 1) Tabella PROFILES (estende auth.users)
-- Se la tabella esiste già, "if not exists" la salta.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'b2b', 'admin')),
  created_at timestamptz not null default now()
);

-- 2) Abilita RLS su profiles
alter table public.profiles enable row level security;

-- 3) Rimuovi eventuali policy esistenti (per rieseguire lo script senza errori)
drop policy if exists "Public profiles are readable" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile on signup" on public.profiles;

-- 4) RLS Policies su profiles
-- Chi può leggere: tutti (per mostrare display_name su memoriali/guestbook)
create policy "Public profiles are readable"
  on public.profiles
  for select
  using (true);

-- Chi può aggiornare: solo il proprio profilo
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT: non dare policy agli utenti; solo il trigger inserisce (SECURITY DEFINER)

-- 5) Funzione: crea profilo al signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$;

-- 6) Trigger su auth.users (dopo INSERT)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fine script.
