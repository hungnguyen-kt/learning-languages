import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Avoid throwing during Next.js build / SSR; the client hook
  // will surface a more helpful error when actually used.
  console.warn(
    "Supabase client is not fully configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.",
  );
}

export const supabaseBrowserClient =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

