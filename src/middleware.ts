import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ Read the auth token from cookies
  const authToken = req.cookies.get("sb-access-token");

  // ✅ Create Supabase client with token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${authToken}` } } }
  );

  // ✅ Get session details
  const { data: { session } } = await supabase.auth.getSession();

  const protectedRoutes = ["/hub", "/agent", "/dashboard", "/profile"];

  if (session) {
    // ✅ Calculate session expiration timestamp (fixing the error)
    const sessionExpiresAt = Math.floor(Date.now() / 1000) + session.expires_in;

    const currentTime = Math.floor(Date.now() / 1000); // Current timestamp

    if (sessionExpiresAt < currentTime) {
      console.log("🚨 Session expired! Redirecting to re-auth...");
      return NextResponse.redirect(new URL("/re-auth", req.url));
    }
  }

  // ✅ Redirect users to sign in only if they try to access a protected route without a session
  if (!session && protectedRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/hub/:path*", "/agent/:path*", "/dashboard/:path*", "/profile/:path*"],
};
