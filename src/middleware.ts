import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  console.log("⚡ Middleware triggered for:", req.nextUrl.pathname);

  // ✅ Get access token from cookies
  const authToken = req.cookies.get("sb-access-token")?.value;

  // ✅ Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Fetch user session properly
  const { data: { user } = {}, error } = await supabase.auth.getUser(authToken || "");
  
  if (error) {
    console.error("❌ Error fetching user:", error.message);
  }

  console.log("🟢 Authenticated user:", user ? user.email : "No user found");

  // ✅ Define protected routes
  const protectedRoutes = ["/hub", "/agent", "/dashboard", "/profile"];

  // ✅ If user is logged in and tries to visit /signin, redirect them to /hub
  if (user && req.nextUrl.pathname === "/signin") {
    console.log("🔄 User already signed in, redirecting to /hub...");
    return NextResponse.redirect(new URL("/hub", req.url));
  }

  // ✅ Allow unauthenticated users to access home & sign-in pages
  if (!user && (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/signin")) {
    console.log("✅ Allowing unauthenticated access to:", req.nextUrl.pathname);
    return NextResponse.next();
  }

  // ✅ If user is authenticated, allow them to access protected routes
  if (user && protectedRoutes.includes(req.nextUrl.pathname)) {
    console.log("✅ Authorized user accessing:", req.nextUrl.pathname);
    return NextResponse.next();
  }

  // 🚨 Unauthorized users trying to access protected routes -> Redirect to /signin
  if (!user && protectedRoutes.includes(req.nextUrl.pathname)) {
    console.log("🚨 Unauthorized access to", req.nextUrl.pathname, "Redirecting to /signin...");
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

// ✅ Apply middleware to specific routes only
export const config = {
  matcher: ["/hub/:path*", "/agent/:path*", "/dashboard/:path*", "/profile/:path*", "/", "/signin"],
};
