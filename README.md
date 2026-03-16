# The Feedback Committee Website (`db_next`)

Production-oriented Next.js site for an upscale classic rock band targeting bookings in Montgomery, Conroe, and Houston.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (booking inquiry storage)
- Local content abstraction for blog (ready to swap to Strapi later)
- Netlify deployment target

## Routes

- `/` Home
- `/media` Media (Cloudflare Stream + photo placeholders)
- `/songs` Internal band repertoire board with confidence tracking, suggestions, and admin ordering
- `/shows` Upcoming shows (static data for MVP)
- `/contact` Contact page
- `/book` Booking inquiry form (Supabase insert)
- `/epk` EPK placeholders
- `/blog` Blog index
- `/blog/[slug]` Blog post page
- `/style-guide` Style guide (typography + colors)

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Future (Strapi phase):

```bash
STRAPI_URL=...
STRAPI_TOKEN=...
```

## Supabase Setup

1. Create a Supabase project.
2. For a fresh database, run [`supabase_schema.sql`](./supabase_schema.sql) in SQL editor.
3. For an existing live database that already has `band_members`, run [`supabase_member_updates.sql`](./supabase_member_updates.sql) after the base schema to add newer member-profile fields and backfill support/test accounts.
4. Confirm `booking_inquiries`, `contact_inquiries`, `band_members`, `songs`, `song_member_statuses`, and `song_suggestion_votes` exist.
5. Confirm RLS policies allow anonymous contact/booking inserts and authenticated approved band-member access to the internal songs board.
6. Add approved band members to `band_members`, for example:

```sql
insert into public.band_members (display_name, instrument, email, phone, avatar_url, is_admin)
values
  ('Thomas', 'Guitar', 'tmacdonald7@gmail.com', '+19362831476', null, true),
  ('Dean', 'Drums', null, '+19366489384', null, false),
  ('Gunnar', 'Bass', null, '+17139335903', null, false),
  ('Anthony', 'Frontman', null, '+12103632606', null, false);
```

7. In Supabase Auth, enable email OTP / magic links, phone auth, and configure your SMS provider if you want phone-based member login.
8. If you want Google sign-in, configure Google OAuth in Supabase Auth and make sure the Google account email also exists in `band_members`.
9. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` locally and in Netlify.
10. Visit `/members/sign-in` to test member access, then sign in as an admin band member and use the import button on `/songs` to seed the current repertoire into the `songs` table.

## Blog Data Abstraction

Blog data currently comes from local content under `src/content/blogPosts.ts`.
App-level abstraction lives in `src/lib/posts.ts`:

- `getPosts()`
- `getPostBySlug(slug)`

TODO markers are included where Strapi integration should replace local content.

## Netlify

This project includes `netlify.toml` with:

- build command: `npm run build`
- publish directory: `.next`
- plugin: `@netlify/plugin-nextjs`

Set environment variables in Netlify UI:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- (later) `STRAPI_URL`
- (later) `STRAPI_TOKEN`

## Netlify Site URL

Current Netlify URL:

- `https://thefeedbackcommittee.netlify.app/`

If you later attach a custom domain, update `metadataBase` in `src/app/layout.tsx`
to match the canonical production URL.
