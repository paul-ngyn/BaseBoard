import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy web/.env.local.example to web/.env.local and fill in your Supabase project values.'
  );
}

// Not typed with the generic `Database` param: our hand-written minimal
// Database type doesn't match the shape supabase-js expects (Relationships,
// Views, Functions, etc.) closely enough for insert/update inference to
// work. Query hooks in src/hooks/useData.ts cast results to the row types in
// src/types/database.ts instead. Run `supabase gen types typescript` once
// the project is live and wire it back in here for full inference.
// Fall back to a syntactically valid placeholder so the client can construct
// (and the rest of the app can render/redirect to login) even before a real
// Supabase project is configured; real calls will simply fail until it is.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key');
