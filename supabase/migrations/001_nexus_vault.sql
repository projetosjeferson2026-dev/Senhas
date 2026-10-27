create extension if not exists pgcrypto;

-- Esta tabela é a autorização real do cofre. Insira somente o UID do seu usuário
-- pelo SQL Editor; clientes autenticados podem conferir, mas nunca alterar, a lista.
create table if not exists public.vault_authorized_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.vault_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt text not null,
  verifier_ciphertext text not null,
  verifier_iv text not null,
  crypto_version smallint not null default 1 check (crypto_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  crypto_version smallint not null default 1 check (crypto_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vault_items_user_updated_idx
  on public.vault_items (user_id, updated_at desc);

alter table public.vault_profiles enable row level security;
alter table public.vault_items enable row level security;
alter table public.vault_authorized_users enable row level security;

revoke all on table public.vault_authorized_users from anon, authenticated;
revoke all on table public.vault_profiles from anon;
revoke all on table public.vault_items from anon;
grant select on table public.vault_authorized_users to authenticated;
grant select, insert, update, delete on table public.vault_profiles to authenticated;
grant select, insert, update, delete on table public.vault_items to authenticated;

drop policy if exists "Users can verify their own vault authorization" on public.vault_authorized_users;
create policy "Users can verify their own vault authorization"
  on public.vault_authorized_users
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users manage only their vault profile" on public.vault_profiles;
create policy "Users manage only their vault profile"
  on public.vault_profiles
  for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vault_authorized_users authorized
      where authorized.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vault_authorized_users authorized
      where authorized.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users manage only their encrypted vault items" on public.vault_items;
create policy "Users manage only their encrypted vault items"
  on public.vault_items
  for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vault_authorized_users authorized
      where authorized.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vault_authorized_users authorized
      where authorized.user_id = (select auth.uid())
    )
  );
