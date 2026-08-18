// Supabase's PostgrestError / FunctionsError objects carry a `message` but
// aren't real `instanceof Error` — a plain `err instanceof Error` check
// silently swallows their message and falls through to a generic fallback.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message;
  return fallback;
}
