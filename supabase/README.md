# Supabase setup

1. Create a project at https://supabase.com (free tier is fine).
2. In the SQL editor, run, in order: `migrations/0001_init.sql`,
   `migrations/0002_realtime.sql`, `migrations/0003_optional_team_login.sql`,
   then `seed/seed.sql`. (Already ran some of these before the later ones
   existed? Just run whichever you're missing — they're additive.)
3. In Authentication settings, enable Email/Password sign-in.
4. Create your first user (Authentication > Users > Add user, or sign up
   through the app once it's running) with your own email — this fires the
   `on_auth_user_created` trigger and creates a matching `team_members` row.
5. In the SQL editor, promote that user to owner/admin so you can manage the
   rest of the team from the Admin screen:
   ```sql
   update team_members
   set name = 'Rick Mallory', role = 'Owner', access_level = 'Full'
   where email = 'you@example.com';
   ```
6. Copy your project's URL and anon public key (Project Settings > API) into
   `web/.env.local` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Adding team members

Two ways, and they don't conflict:

- **Add directly** (Admin > + Invite member > Add directly, or straight in
  Supabase's Table Editor on the `team_members` table) — a roster entry,
  no login. Type name, email, role, crew, access level; done. Shows up in
  Admin > Team & crews with a "no login" note next to their email. This is
  the normal path for personal/small-team use.
- **Email invite** (Admin > + Invite member > Email invite, or the "Invite"
  link that appears next to any roster-only row) — sends a real email with
  a link to set a password. Only needed for someone who'll actually sign in
  themselves (e.g. to use the crew mobile view).

If someone was added as a roster-only entry and later gets an email invite
with the *same email*, they're automatically linked to that existing row
instead of creating a duplicate.

> **TODO — not done yet:** email invites won't work until you do the step
> below. Skippable for now — "Add directly" needs nothing extra and works
> immediately.

## Deploy the invite-member Edge Function

Only needed for the **Email invite** path — "Add directly" doesn't touch
this at all. Sending a real invite email requires the service-role key,
which must never ship to the browser, so it runs server-side:

```bash
supabase functions deploy invite-member
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided automatically to Edge
Functions; only the service-role key needs to be set explicitly.
