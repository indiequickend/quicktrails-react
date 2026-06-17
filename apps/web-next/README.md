# QuickTrails -- Next.js + MongoDB + Cloudinary

Rebuilt from the original Vite/React + PocketBase SPA to fix the core SEO/GEO
problem: that app shipped an empty HTML shell and fetched all content
client-side, which search engines render unreliably and AI-agent crawlers
(GPTBot, ClaudeBot, PerplexityBot, etc.) don't render at all.

This app uses the Next.js App Router with Server Components, so every page
(home, property/package listings and detail pages) is rendered to full HTML
on the server -- either at build time (SSG) or on a background interval
(ISR, `revalidate`), and is readable by any crawler with zero JavaScript.

## Stack

- **Next.js 16** (App Router, Turbopack) -- SSR/SSG/ISR
- **MongoDB** (via Mongoose) -- replaces PocketBase
- **Cloudinary** -- image storage/CDN, replaces PocketBase file storage
- Custom JWT-cookie admin auth (`src/lib/session.js`) -- no PocketBase admin UI;
  a `/admin` dashboard ships in this app instead. Built with a `role` field
  on `User` so customer login/registration can be added later without
  touching the session/proxy plumbing.

## Local development

1. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` -- a MongoDB Atlas connection string (or local `mongod`)
   - `SESSION_SECRET` -- `openssl rand -base64 32`
   - `CLOUDINARY_*` -- from your Cloudinary dashboard
2. Install dependencies (from the repo root, this is an npm workspace):
   ```
   npm install
   ```
3. Create the first admin user:
   ```
   node --env-file=.env.local scripts/seed-admin.mjs admin@quicktrails.com "SomeStrongPassword123"
   ```
4. Run the dev server:
   ```
   npm run dev --prefix apps/web-next
   ```
5. Visit `/admin/login` and sign in to add properties/packages.

## Deploying (Vercel)

1. Import the repo into Vercel, set the project root to `apps/web-next`.
2. Add the same environment variables from `.env.example` in the Vercel
   project settings (use your production MongoDB Atlas + Cloudinary
   credentials, and the real production `NEXT_PUBLIC_SITE_URL`).
3. Deploy. ISR/on-demand revalidation works out of the box on Vercel.
4. Run the seed script once against production `MONGODB_URI` to create the
   admin account (or insert a `User` document with `role: "admin"` directly
   in Atlas -- `passwordHash` must be a bcrypt hash).

## What's intentionally trimmed vs. the old app

To keep this "lightweight" per the original goal, a few things from the old
Vite app were dropped rather than ported 1:1:

- `framer-motion` and the full Radix UI suite -- replaced with plain Tailwind
  + a handful of dependency-free components (`src/components/ui`). Less JS
  shipped to the browser.
- The image lightbox/gallery modal on property pages -- images render inline
  instead; reintroduce as a small client component if needed.
- Client-side property filtering (category/price/location) on the listings
  page -- a good follow-up is to implement this as `searchParams`-driven
  server filtering so filtered views stay crawlable URLs, rather than the
  old client-only `useState` filtering (which produced pages no crawler
  could ever see a filtered result for).

## Content model changes vs. PocketBase

Several fields that were JSON-stringified inside PocketBase text fields
(`roomTypes`, `itinerary`, `reviews`, comma-joined `amenities`/`highlights`)
are now real nested arrays/documents in the Mongoose schemas
(`src/models/*.js`). This makes them queryable/sortable and removes a class
of `JSON.parse` footguns the old codebase had throughout.
