import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase URL or Anon Key is missing. Check `.env.local`.");
  throw new Error("Supabase credentials missing. Ensure `.env.local` is set up correctly.");
}

// ✅ Ensure Supabase Auth works across all browsers (including mobile Safari)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ Ensures sessions persist across page reloads
    autoRefreshToken: true, // ✅ Automatically refreshes session tokens
    detectSessionInUrl: true, // ✅ Helps with OAuth login flows
    storage: typeof window !== "undefined" ? localStorage : undefined, // ✅ Fixes mobile storage issues
  },
});

// ✅ Debugging: Log if Supabase is correctly configured
console.log("🔍 Supabase Initialized:", { supabaseUrl });
