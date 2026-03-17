alter table public.band_members
  add column if not exists avatar_label text,
  add column if not exists avatar_theme text not null default 'default' check (avatar_theme in ('default', 'investor')),
  add column if not exists counts_toward_votes boolean not null default true,
  add column if not exists is_hidden_from_band boolean not null default false;

update public.band_members
set
  display_name = case
    when lower(coalesce(email, '')) = 'tmacdonald7@gmail.com' then 'Thomas MacDonald'
    when lower(coalesce(email, '')) = 'dbouch9077@yahoo.com' then 'Dean Bouchard'
    when lower(coalesce(email, '')) = 'anthonyberdecio@gmail.com' then 'Anthony Berdecio'
    when phone = '+19362831476' then 'Thomas MacDonald'
    when phone = '+19366489384' then 'Dean Bouchard'
    when phone = '+17139335903' then 'Anthony Berdecio'
    when phone = '+12103632606' then 'Gunnar Seaburg'
    else display_name
  end,
  avatar_label = null,
  avatar_theme = 'default',
  can_vote = true,
  counts_toward_votes = true,
  is_hidden_from_band = false
where lower(coalesce(email, '')) in (
  'tmacdonald7@gmail.com',
  'dbouch9077@yahoo.com',
  'anthonyberdecio@gmail.com'
)
or phone in (
  '+19362831476',
  '+19366489384',
  '+17139335903',
  '+12103632606'
);

update public.band_members
set
  display_name = case
    when lower(coalesce(email, '')) = 'sgmacdonald1987@gmail.com' then 'Stephen MacDonald'
    when lower(coalesce(email, '')) = 'giorgio.villani@spindletop.digital' then 'Giorgio Villani'
    else display_name
  end,
  avatar_label = null,
  avatar_theme = 'default',
  can_vote = false,
  counts_toward_votes = false,
  is_hidden_from_band = false
where lower(coalesce(email, '')) in (
  'sgmacdonald1987@gmail.com',
  'giorgio.villani@spindletop.digital'
);

insert into public.band_members (
  display_name,
  instrument,
  email,
  phone,
  avatar_url,
  avatar_label,
  avatar_theme,
  is_admin,
  can_vote,
  counts_toward_votes,
  is_hidden_from_band
)
values (
  'Giorgio Villani',
  'Support',
  'giorgio.villani@spindletop.digital',
  null,
  null,
  null,
  'default',
  false,
  false,
  false,
  false
)
on conflict (email) do update
set
  display_name = excluded.display_name,
  instrument = excluded.instrument,
  avatar_label = excluded.avatar_label,
  avatar_theme = excluded.avatar_theme,
  is_admin = excluded.is_admin,
  can_vote = excluded.can_vote,
  counts_toward_votes = excluded.counts_toward_votes,
  is_hidden_from_band = excluded.is_hidden_from_band;

insert into public.band_members (
  display_name,
  instrument,
  email,
  phone,
  avatar_url,
  avatar_label,
  avatar_theme,
  is_admin,
  can_vote,
  counts_toward_votes,
  is_hidden_from_band
)
values (
  'Daniel Batal',
  'Support',
  'daniel@danielbatal.com',
  null,
  null,
  'DB',
  'investor',
  false,
  true,
  false,
  true
)
on conflict (email) do update
set
  display_name = excluded.display_name,
  instrument = excluded.instrument,
  avatar_label = excluded.avatar_label,
  avatar_theme = excluded.avatar_theme,
  is_admin = excluded.is_admin,
  can_vote = excluded.can_vote,
  counts_toward_votes = excluded.counts_toward_votes,
  is_hidden_from_band = excluded.is_hidden_from_band;
