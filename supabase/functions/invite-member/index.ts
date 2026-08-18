// Supabase Edge Function: invite-member
//
// Invites a new team member by email. Runs server-side because creating an
// auth user requires the service-role key, which must never reach the
// browser. The caller's own JWT is checked first so only 'Full' access
// members can invite; the new user lands as 'Field only' via the
// on_auth_user_created trigger and an admin promotes them afterward.
//
// Deploy: supabase functions deploy invite-member
// Secrets (set once): supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
// (SUPABASE_URL and SUPABASE_ANON_KEY are provided automatically.)

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Client scoped to the caller, to verify who's asking.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { data: caller } = await callerClient.from('team_members').select('access_level').eq('id', user.id).single();
  if (caller?.access_level !== 'Full') {
    return new Response(JSON.stringify({ error: 'Only Full-access members can invite' }), { status: 403 });
  }

  const { email, name, role } = await req.json();
  if (!email) {
    return new Response(JSON.stringify({ error: 'email is required' }), { status: 400 });
  }

  // Admin client with the service-role key, used only inside this function.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: invited, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { name, role },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ user: invited.user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
