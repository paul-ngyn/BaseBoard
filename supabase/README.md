# Supabase setup

1. Create a project at https://supabase.com (free tier is fine).
2. In the SQL editor, run `migrations/0001_init.sql`, then `migrations/0002_realtime.sql`,
   then `seed/seed.sql`. (Already ran `0001` before `0002` existed? Just run
   `0002` on its own — it's additive.)
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

Every other team member should sign up (or be invited) through the app; they
land as 'Field only' by default until an admin changes their access level and
crew in Admin > Team & crews.

## Deploy the invite-member Edge Function

The "+ Invite member" button in Admin calls a server-side function (creating
an auth user needs the service-role key, which must never ship to the
browser):

```bash
supabase functions deploy invite-member
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided automatically to Edge
Functions; only the service-role key needs to be set explicitly.
