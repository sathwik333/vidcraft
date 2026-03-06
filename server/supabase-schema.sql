-- VidCraft Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ─── Users ──────────────────────────────────────────────────────────────────

create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  clerk_id text unique not null,
  email text not null,
  display_name text,
  avatar_url text,
  tier text default 'free' not null,
  credits integer default 1 not null,
  preferences jsonb default '{
    "inAppNotifications": true,
    "emailNotifications": true,
    "generationCompleteEmail": true,
    "marketingEmails": false
  }'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── Generations ────────────────────────────────────────────────────────────

create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  model text not null,
  style text not null,
  prompt text not null,
  duration integer not null,
  aspect_ratio text not null,
  image_url text not null,
  video_url text,
  thumbnail_url text,
  status text default 'pending' not null,
  progress integer default 0 not null,
  task_id text,
  credit_cost integer not null,
  error_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── Credit Transactions ────────────────────────────────────────────────────

create table if not exists credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  amount integer not null,
  balance_after integer not null,
  type text not null,
  description text not null,
  generation_id uuid references generations(id) on delete set null,
  created_at timestamptz default now() not null
);

-- ─── Notifications ──────────────────────────────────────────────────────────

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  message text not null,
  type text not null,
  read boolean default false not null,
  metadata jsonb,
  created_at timestamptz default now() not null
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

create index if not exists idx_generations_user_id on generations(user_id);
create index if not exists idx_generations_status on generations(status);
create index if not exists idx_credit_transactions_user_id on credit_transactions(user_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(user_id, read);

-- ─── RLS (Row Level Security) ───────────────────────────────────────────────
-- Using service_role key on server, so RLS is bypassed.
-- Enable if you ever use anon key from client directly.

alter table users enable row level security;
alter table generations enable row level security;
alter table credit_transactions enable row level security;
alter table notifications enable row level security;

-- ─── Storage Buckets ────────────────────────────────────────────────────────
-- Photos uploaded by users before generation; Videos returned by Kie.ai

insert into storage.buckets (id, name, public)
values
  ('photos', 'photos', true),
  ('videos', 'videos', true)
on conflict (id) do nothing;

-- ─── updated_at Trigger ──────────────────────────────────────────────────────
-- Automatically keeps updated_at in sync on every row update

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_users_updated_at
  before update on users
  for each row execute function update_updated_at();

create or replace trigger trg_generations_updated_at
  before update on generations
  for each row execute function update_updated_at();
