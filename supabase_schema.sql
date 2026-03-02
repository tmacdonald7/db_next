create extension if not exists "pgcrypto";

create table if not exists public.booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  venue_name text not null,
  event_type text not null,
  date date not null,
  start_time text not null,
  duration_hours numeric not null,
  location text not null,
  expected_attendance integer not null,
  budget_range text not null,
  contact_name text not null,
  phone text not null,
  email text not null,
  notes text,
  status text not null default 'new'
);

alter table public.booking_inquiries enable row level security;

drop policy if exists "Allow anonymous inserts for booking inquiries" on public.booking_inquiries;
create policy "Allow anonymous inserts for booking inquiries"
  on public.booking_inquiries
  for insert
  to anon
  with check (true);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_name text not null,
  email text not null,
  phone text not null,
  event_type text,
  city text,
  message text not null,
  status text not null default 'new'
);

alter table public.contact_inquiries enable row level security;

drop policy if exists "Allow anonymous inserts for contact inquiries" on public.contact_inquiries;
create policy "Allow anonymous inserts for contact inquiries"
  on public.contact_inquiries
  for insert
  to anon
  with check (true);
