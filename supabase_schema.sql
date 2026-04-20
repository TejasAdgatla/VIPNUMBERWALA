-- Run this SQL in your Supabase Dashboard → SQL Editor

-- VIP Numbers table
create table if not exists vip_numbers (
  id          text primary key default gen_random_uuid()::text,
  phone       text not null unique, -- Added unique constraint for bulk upsert
  price       text not null,
  numerology_total integer not null default 1,
  category    text not null default 'VVIP',
  energy      text not null default 'Sun',
  operator    text not null default 'Airtel',
  available   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- WhatsApp instances table
create table if not exists whatsapp_instances (
  id          text primary key,
  name        text not null,
  phone       text,
  status      text not null default 'disconnected',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Orders table (for future use)
create table if not exists orders (
  id          text primary key default gen_random_uuid()::text,
  number_id   text references vip_numbers(id),
  customer_wa text not null,
  amount      text,
  status      text not null default 'pending',
  screenshot_url text,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security (optional, for production)
-- alter table vip_numbers enable row level security;

-- Allow public read on vip_numbers (so frontend can list them)
create policy "Public can read numbers" on vip_numbers
  for select using (true);

-- Allow backend (service key) to do everything — done via anon key in dev
create policy "Service full access numbers" on vip_numbers
  for all using (true);

create policy "Service full access instances" on whatsapp_instances
  for all using (true);
