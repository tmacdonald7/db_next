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
- `/songs` Song list by category
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

## Netlify Site URL

Current Netlify URL:

- `https://thefeedbackcommittee.netlify.app/`

If you later attach a custom domain, update `metadataBase` in `src/app/layout.tsx`
to match the canonical production URL.
