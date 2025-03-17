"use client"; // ✅ Ensure this is a Client Component

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./ServiceWorkerRegistration";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase"; // ✅ Ensure correct Supabase import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔥 List of protected pages (users MUST be logged in to access these)
const protectedRoutes = ["/hub", "/agent", "/dashboard", "/profile"];

export default function RootLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get the current route
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    }

    checkUserSession();
  }, []);

  // 🔥 Redirect users trying to access protected routes
  useEffect(() => {
    if (!loading && !user && protectedRoutes.includes(pathname)) {
      console.log("Unauthorized access attempt! Redirecting to login...");
      router.push("/");
    }
  }, [pathname, user, loading, router]);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ServiceWorkerRegistration />
        {!loading && children} {/* Don't show UI until session is checked */}
      </body>
    </html>
  );
}
