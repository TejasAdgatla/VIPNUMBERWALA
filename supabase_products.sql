-- Additional schema for products and professional services

-- Products table (Gemstones, Rudrakshas, etc.)
create table if not exists products (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  description text,
  price       text not null, -- e.g. "₹5,000"
  category    text not null, -- 'Gemstone', 'Rudraksha', 'Service'
  image_url   text,
  available   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Policy to allow public read
create policy "Public can read products" on products
  for select using (true);

-- Policy for backend management
create policy "Service full access products" on products
  for all using (true);
