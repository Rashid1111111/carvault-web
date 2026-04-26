-- Run in Supabase SQL Editor (adds name + optional avatar for profile completion).
-- Safe to run if columns already exist (IF NOT EXISTS).

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists avatar_url text;
