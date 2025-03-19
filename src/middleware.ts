import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ Fix: Read auth token from cookies
  const authToken = req.cookies.get("sb-access-token");

  // ✅ Fix: Create Supabase client with headers
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${authToken}` } } }
  );

  const { data: session } = await supabase.auth.getSession();
  const protectedRoutes = ["/hub", "/agent", "/dashboard", "/profile"];

  // ✅ Fix: Allow new customers to visit home & signin freely
  if (!session && (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/signin")) {
    return res;
  }

  // ✅ Fix: Redirect unauthorized users only if they try to access protected routes
  if (!session && protectedRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/hub/:path*", "/agent/:path*", "/dashboard/:path*", "/profile/:path*", "/", "/signin"],
};
