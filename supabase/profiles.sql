-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Creates public.profiles linked to auth.users and RLS so users can manage their own row.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: users can read own row"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Profiles: users can insert own row"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Profiles: users can update own row"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
