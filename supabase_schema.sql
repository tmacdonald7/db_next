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

drop table if exists public.song_suggestion_votes cascade;
drop table if exists public.song_member_statuses cascade;
drop table if exists public.songs cascade;
drop table if exists public.band_member_emails cascade;
drop table if exists public.band_members cascade;

create table if not exists public.band_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  display_name text not null,
  instrument text not null,
  email text unique,
  phone text unique,
  avatar_url text,
  is_admin boolean not null default false,
  constraint band_members_contact_required check (email is not null or phone is not null)
);

create or replace function public.current_band_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select member.id
  from public.band_members member
  where (
    auth.jwt() ->> 'email' is not null
    and member.email is not null
    and lower(member.email) = lower(auth.jwt() ->> 'email')
  ) or (
    auth.jwt() ->> 'phone' is not null
    and member.phone is not null
    and member.phone = auth.jwt() ->> 'phone'
  )
  limit 1;
$$;

create or replace function public.current_band_member_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.band_members member
    where member.id = public.current_band_member_id()
      and member.is_admin = true
  );
$$;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  artist text not null,
  status text not null check (status in ('active', 'selected', 'suggested', 'archived')),
  sort_order integer not null default 0,
  suggested_by_member_id uuid references public.band_members(id) on update cascade on delete set null,
  notes text
);

create table if not exists public.song_member_statuses (
  song_id uuid not null references public.songs(id) on delete cascade,
  member_id uuid not null references public.band_members(id) on update cascade on delete cascade,
  confidence text not null check (confidence in ('dont_know', 'kind_of_know', 'know_it')),
  updated_at timestamptz not null default now(),
  primary key (song_id, member_id)
);

create table if not exists public.song_suggestion_votes (
  song_id uuid not null references public.songs(id) on delete cascade,
  member_id uuid not null references public.band_members(id) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id, member_id)
);

create index if not exists songs_status_sort_order_idx on public.songs(status, sort_order);
create index if not exists song_member_statuses_song_id_idx on public.song_member_statuses(song_id);
create index if not exists song_suggestion_votes_song_id_idx on public.song_suggestion_votes(song_id);

alter table public.band_members enable row level security;
alter table public.songs enable row level security;
alter table public.song_member_statuses enable row level security;
alter table public.song_suggestion_votes enable row level security;

drop policy if exists "Allow authenticated users to read band members" on public.band_members;
create policy "Allow authenticated users to read band members"
  on public.band_members
  for select
  to authenticated
  using (public.current_band_member_id() is not null);

drop policy if exists "Allow admins to manage band members" on public.band_members;
create policy "Allow admins to manage band members"
  on public.band_members
  for all
  to authenticated
  using (public.current_band_member_is_admin())
  with check (public.current_band_member_is_admin());

drop policy if exists "Allow approved band members to read songs" on public.songs;
create policy "Allow approved band members to read songs"
  on public.songs
  for select
  to authenticated
  using (public.current_band_member_id() is not null);

drop policy if exists "Allow band members to suggest songs" on public.songs;
create policy "Allow band members to suggest songs"
  on public.songs
  for insert
  to authenticated
  with check (
    public.current_band_member_id() is not null
    and status = 'suggested'
    and suggested_by_member_id = public.current_band_member_id()
  );

drop policy if exists "Allow admins to manage songs" on public.songs;
create policy "Allow admins to manage songs"
  on public.songs
  for all
  to authenticated
  using (public.current_band_member_is_admin())
  with check (public.current_band_member_is_admin());

drop policy if exists "Allow approved band members to read song confidence" on public.song_member_statuses;
create policy "Allow approved band members to read song confidence"
  on public.song_member_statuses
  for select
  to authenticated
  using (public.current_band_member_id() is not null);

drop policy if exists "Allow members to set their own confidence" on public.song_member_statuses;
create policy "Allow members to set their own confidence"
  on public.song_member_statuses
  for insert
  to authenticated
  with check (member_id = public.current_band_member_id());

drop policy if exists "Allow members to update their own confidence" on public.song_member_statuses;
create policy "Allow members to update their own confidence"
  on public.song_member_statuses
  for update
  to authenticated
  using (member_id = public.current_band_member_id())
  with check (member_id = public.current_band_member_id());

drop policy if exists "Allow approved band members to read suggestion votes" on public.song_suggestion_votes;
create policy "Allow approved band members to read suggestion votes"
  on public.song_suggestion_votes
  for select
  to authenticated
  using (public.current_band_member_id() is not null);

drop policy if exists "Allow members to vote on suggestions" on public.song_suggestion_votes;
create policy "Allow members to vote on suggestions"
  on public.song_suggestion_votes
  for insert
  to authenticated
  with check (
    member_id = public.current_band_member_id()
    and exists (
      select 1
      from public.songs suggested_song
      where suggested_song.id = song_id
        and suggested_song.status = 'suggested'
    )
  );

drop policy if exists "Allow members to remove their suggestion votes" on public.song_suggestion_votes;
create policy "Allow members to remove their suggestion votes"
  on public.song_suggestion_votes
  for delete
  to authenticated
  using (member_id = public.current_band_member_id());

insert into public.band_members (display_name, instrument, email, phone, avatar_url, is_admin)
values
  ('Thomas', 'Guitar', 'tmacdonald7@gmail.com', '+19362831476', null, true),
  ('Dean', 'Drums', null, '+19366489384', null, false),
  ('Gunnar', 'Bass', null, '+17139335903', null, false),
  ('Anthony', 'Frontman', 'anthonyberdecio@gmail.com', '+12103632606', null, false)
on conflict do nothing;
