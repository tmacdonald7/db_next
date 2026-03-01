# The Decibels Website (`db_next`)

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
- `/songs` Song list by category
- `/shows` Upcoming shows (static data for MVP)
- `/book` Booking inquiry form (Supabase insert)
- `/epk` EPK placeholders
- `/blog` Blog index
- `/blog/[slug]` Blog post page

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
```

Future (Strapi phase):

```bash
STRAPI_URL=...
STRAPI_TOKEN=...
```

## Supabase Setup

1. Create a Supabase project.
2. Run [`supabase_schema.sql`](./supabase_schema.sql) in SQL editor.
3. Confirm `booking_inquiries` table exists and RLS policy allows anonymous inserts.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` locally and in Netlify.

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
- (later) `STRAPI_URL`
- (later) `STRAPI_TOKEN`

## Domain + Netlify Setup

Target production domain:

- `thedecibels.thomasgrantmacdonald.com`

Steps:

1. In Netlify, add custom domain `thedecibels.thomasgrantmacdonald.com` to this site.
2. In Cloudflare DNS for `thomasgrantmacdonald.com`, add a DNS record for subdomain `thedecibels`.
3. Preferred record style: `CNAME` from `thedecibels` to your Netlify subdomain target (for example `<site-name>.netlify.app`).
4. Alternate approach: if Netlify provides A record instructions for apex-like handling, follow Netlify docs, but for this subdomain a `CNAME` is the typical path.
5. Wait for DNS propagation and verify Netlify marks the domain as active.
6. SSL certificate issuance is handled by Netlify automatically after DNS validates.

Notes:

- The root/apex domain `thomasgrantmacdonald.com` does not need to change for this subdomain launch.
- No separate landing page on `www.thomasgrantmacdonald.com` is required for subdomain hosting.
