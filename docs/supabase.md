# Supabase Sync Setup

This project syncs data across the PWA and iOS apps using Supabase. It uses a **last-write-wins** strategy based on `updated_at` and **soft deletes** with `deleted_at`.

## 1) Create tables

Run this SQL in the Supabase SQL editor:

```sql
create table if not exists public.categories (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  icon text not null,
  color text not null,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  primary key (user_id, id)
);

create table if not exists public.items (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  quantity integer not null,
  unit text not null,
  category_id text not null,
  expiration_date timestamptz null,
  added_date timestamptz not null,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  primary key (user_id, id)
);

create index if not exists categories_user_updated_idx
  on public.categories (user_id, updated_at);

create index if not exists items_user_updated_idx
  on public.items (user_id, updated_at);
```

## 2) Enable Row Level Security (RLS)

```sql
alter table public.categories enable row level security;
alter table public.items enable row level security;
```

## 3) Add RLS policies

```sql
create policy "Categories: read own" on public.categories
  for select using (auth.uid() = user_id);

create policy "Categories: insert own" on public.categories
  for insert with check (auth.uid() = user_id);

create policy "Categories: update own" on public.categories
  for update using (auth.uid() = user_id);

create policy "Categories: delete own" on public.categories
  for delete using (auth.uid() = user_id);

create policy "Items: read own" on public.items
  for select using (auth.uid() = user_id);

create policy "Items: insert own" on public.items
  for insert with check (auth.uid() = user_id);

create policy "Items: update own" on public.items
  for update using (auth.uid() = user_id);

create policy "Items: delete own" on public.items
  for delete using (auth.uid() = user_id);
```

## 4) Configure Auth providers

Enable **Sign in with Apple** and **Email (magic link)** in Supabase Auth.

Add redirect URLs:
- PWA dev: `http://localhost:5173/auth/callback`
- PWA prod: `https://YOUR_DOMAIN/auth/callback`
- iOS: `womfreezer://auth-callback`

## 5) Configure the PWA

Set environment variables (local `.env` or your hosting provider’s env):

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

## Notes

- Sync uses `updated_at` to decide “latest” changes.
- Deletes are soft (`deleted_at`), so deletions sync across devices.
- Upserts must use the composite conflict key: `user_id,id`.
