import { createClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase URL or Anon Key is missing. Check `.env.local`.");
  throw new Error("Supabase credentials missing. Ensure `.env.local` is set up correctly.");
}

// ✅ Use IndexedDB for PWA login persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ Ensures users stay logged in
    autoRefreshToken: true, // ✅ Automatically refreshes tokens
    detectSessionInUrl: true, // ✅ Needed for OAuth logins
    storage: typeof window !== "undefined" ? window.indexedDB : undefined, // ✅ Fixes iOS PWA login issue
  },
});

// ✅ Debugging: Log if Supabase is correctly configured
console.log("🔍 Supabase Initialized:", { supabaseUrl });
