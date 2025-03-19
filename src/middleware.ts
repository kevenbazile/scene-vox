import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // ✅ Get access token from cookies
  const authToken = req.cookies.get("sb-access-token")?.value; 

  // ✅ Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Fetch user session properly
  const { data, error } = await supabase.auth.getUser(authToken || "");
  const user = data?.user; // ✅ Extract the actual user

  // ✅ Define protected routes
  const protectedRoutes = ["/hub", "/agent", "/dashboard", "/profile"];

  // ✅ If user is logged in, prevent access to /signin and redirect them
  if (user && req.nextUrl.pathname === "/signin") {
    console.log("User already signed in, redirecting to /hub...");
    return NextResponse.redirect(new URL("/hub", req.url));
  }

  // ✅ Allow unauthenticated access to home & sign-in pages
  if (!user && (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/signin")) {
    return res;
  }

  // ✅ Redirect unauthorized users trying to access protected routes
  if (!user && protectedRoutes.includes(req.nextUrl.pathname)) {
    console.log("Unauthorized access, redirecting to login...");
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return res;
}

// ✅ Apply middleware to specific routes only
export const config = {
  matcher: ["/hub/:path*", "/agent/:path*", "/dashboard/:path*", "/profile/:path*", "/", "/signin"],
};
