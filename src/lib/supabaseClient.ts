import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — add them to frontpage-app/.env.local",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase's query builders (.insert()/.update()/.delete()/.upsert()) are
// lazy thenables — the HTTP request is only actually sent once something
// calls `.then()` on them (or awaits them). `void builder` on its own
// discards the expression without ever triggering that, silently making the
// write a no-op. Every optimistic "update local state, then persist in the
// background" call in the remote hooks goes through this instead, so the
// request actually fires and failures at least reach the console.
export function fireAndForget(promise: PromiseLike<{ error: { message: string } | null }>): void {
  promise.then(({ error }) => {
    if (error) console.error("Supabase write failed:", error.message);
  });
}
