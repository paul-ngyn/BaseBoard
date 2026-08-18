# Baseboard — Hardwood Flooring Project Manager

A project-management tool for a hardwood flooring contractor: jobs tracked by
address, moved through an 11-stage pipeline (Lead / Estimate → Invoiced /
Paid). Two apps, one Supabase backend:

- **`web/`** — office/owner app (React + Vite): Projects, Dashboard,
  Schedule, Map, Admin.
- **`mobile/`** — crew app (Expo / React Native): Today's schedule, with
  Jobs / Map / More scaffolded for later.
- **`supabase/`** — schema, seed data, and the one server-side function
  (inviting a new team member).

Built from the design handoff in `design_handoff_baseboard/` (kept for
reference) — see that folder's `README.md` for the original design spec and
`Baseboard.dc.html` for exact colors/spacing/copy.

## Setup

1. **Supabase** — follow [`supabase/README.md`](supabase/README.md): create
   a project, run the migration + seed SQL, enable email/password auth,
   create your first (admin) user, and deploy the `invite-member` function.
2. **Web app**:
   ```bash
   cd web
   cp .env.local.example .env.local   # fill in your Supabase URL + anon key
   npm install
   npm run dev
   ```
3. **Mobile app**:
   ```bash
   cd mobile
   cp .env.example .env               # fill in your Supabase URL + anon key
   npm install
   npx expo start
   ```

## Design tokens

`design-tokens.json` at the repo root is the single source of truth for
colors, stage colors, and spacing — `web/src/index.css` (Tailwind `@theme`)
and `mobile/lib/theme.ts` both mirror it. If a color or stage changes, update
all three together.

## What's not built yet

- **Real map integration.** Map views (web and mobile) show the design's
  stylized placeholder SVG map with pins positioned from project lat/lng.
  Wiring a real provider (Mapbox / Google / Leaflet) needs you to pick one
  and supply an API key.
- **Stage rename/add/remove in Admin.** Drag-to-reorder works; renaming,
  recoloring, or adding stages doesn't have a UI yet (the "Edit" button is a
  placeholder).
- **Mobile Jobs / Map / More tabs** are placeholder screens — only Today's
  schedule is fully built, per the design handoff's scope.
- **Multi-tenant support.** Auth is single-company; see
  `supabase/README.md` for what that means for admin login.
