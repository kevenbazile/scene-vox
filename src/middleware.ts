import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("⚡ Middleware triggered for:", req.nextUrl.pathname);

  // ✅ Always redirect from "/signin" to "/hub" after signing in
  if (req.nextUrl.pathname === "/signin") {
    console.log("🔄 Redirecting user to /hub after login...");
    return NextResponse.redirect(new URL("/hub", req.url));
  }

  // ✅ Allow access to everything else
  return NextResponse.next();
}

// ✅ Apply middleware to specific routes
export const config = {
  matcher: ["/signin"],
};
