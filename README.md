# Baseboard — Hardwood Flooring Project Manager

A project-management tool for a hardwood flooring contractor: jobs tracked by
address, moved through an 11-stage pipeline (Lead / Estimate → Invoiced /
Paid). One web app, one Supabase backend:

- **`web/`** — React + Vite app with two layouts:
  - Office/owner desktop views: Projects, Dashboard, Schedule, Map, Admin.
  - A mobile-only crew view at `/m/today` — see [Crew mobile view](#crew-mobile-view-m)
    below — installable as a home-screen shortcut, no app store needed.
- **`supabase/`** — schema, seed data, and the one server-side function
  (inviting a new team member).

Realtime is wired up so a stage change or new job shows up on an
already-open crew phone with no refresh needed.

Built from the design handoff in `design_handoff_baseboard/` (kept for
reference) — see that folder's `README.md` for the original design spec and
`Baseboard.dc.html` for exact colors/spacing/copy.

## Setup

1. **Supabase** — follow [`supabase/README.md`](supabase/README.md): create
   a project, run the migration + seed SQL, enable email/password auth, and
   create your first (admin) user. (Deploying the `invite-member` function
   is optional — only needed if you want to send real email invites.)
2. **Web app**:
   ```bash
   cd web
   cp .env.local.example .env.local   # fill in your Supabase URL + anon key
   npm install
   npm run dev
   ```

## Crew mobile view (`/m`)

The web app has a second, mobile-only layout at `/m/today` — the crew's
"Today's schedule" screen, but as a web page instead of a native app. No
build, no store, no account.

**To install it as a home-screen shortcut:**

1. On the crew member's phone, open `https://<your-deployed-web-url>/m/today`
   in Safari (iOS) or Chrome (Android).
2. Tap the browser's share/menu button → **Add to Home Screen**.
3. It now has a real "Baseboard" icon that opens full-screen, no browser
   address bar — same as a native app to the person using it.

Opening it always loads whatever's currently deployed (see
[Deploying to production](#deploying-to-production) below) — no reinstall,
no update prompt. And because of Realtime, if it's already open when an
admin changes something, it updates on its own.

`/m/jobs`, `/m/map`, and `/m/more` are scaffolded (More has profile + sign
out); Jobs and Map are placeholders for now.

## Deploying to production

`npm run dev` is for local development only. To get a real, shareable URL:

1. Go to [vercel.com](https://vercel.com) → **New Project** → import
   `paul-ngyn/BaseBoard`.
2. Set **Root Directory** to `web`. Vercel auto-detects the Vite build
   command (`npm run build`) and output directory (`dist`) — leave those as
   default.
3. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   (same values as your `web/.env.local`).
4. Deploy. You get a real `https://…vercel.app` URL immediately, and a
   custom domain can be attached in Project Settings → Domains.

(Netlify works the same way: base directory `web`, build command
`npm run build`, publish directory `web/dist`.)

That URL is also what crew members open on their phone to install the
`/m/today` shortcut above.

### Supabase Edge Function

Already covered in [`supabase/README.md`](supabase/README.md) — `supabase
functions deploy invite-member` plus setting the service-role key as a
secret.

## Design tokens

`design-tokens.json` at the repo root is the single source of truth for
colors and spacing — `web/src/index.css` (Tailwind `@theme`) mirrors it. If a
color changes, update both together.

Pipeline stages are different: `stages` is a live database table, seeded
with the design's 11 stages as a starting point, but from then on it's
editable directly in Admin → Project stages (rename, recolor, add, delete,
reorder) — not something you edit in code.

## What's not built yet

- **TODO: clickable job detail view with a timeline.** Right now editing a
  project happens inline in the Projects list/cards. A dedicated per-job page
  (click a row/card to open it) showing a timeline — stage history, schedule
  events, notes — would give more room than the table/card view allows.
- **Real map integration.** The Map view shows the design's stylized
  placeholder SVG map with pins positioned from project lat/lng. Wiring a
  real provider (Mapbox / Google / Leaflet) needs you to pick one and
  supply an API key.
- **`/m/jobs` and `/m/map`** are placeholder screens — only Today's
  schedule is fully built on the crew view so far.
- **Phone-number sign-in.** Auth is email/password only. Supabase supports
  SMS OTP login instead (no password, just a texted code), but it needs a
  third-party SMS provider wired up (Twilio, Vonage, etc. — costs per text)
  and changes to the login screen, schema (`team_members.email` would need
  to allow phone-only), and the invite flow.
- **Multi-tenant support.** Auth is single-company; see
  `supabase/README.md` for what that means for admin login.
