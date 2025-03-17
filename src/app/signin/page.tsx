"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type UserRole = "spotlight" | "agent" | "filmmaker";

export default function SignInPage() {
  const router = useRouter();

  // State Variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserRole>("spotlight"); // Add this line to initialize `userType`

  // Handle Supabase Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("🔍 Attempting login for:", email);

      // Ensure previous session is cleared
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();

      // Step 1: Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("❌ Login Error:", authError.message);
        setError(authError.message.includes("Email not confirmed")
          ? "Your email is not confirmed. Resending confirmation email..."
          : "Invalid email or password.");

        if (authError.message.includes("Email not confirmed")) {
          await supabase.auth.resend({ type: "signup", email });
          setSuccessMessage("A new confirmation email has been sent. Please check your inbox.");
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
        return;
      }

      console.log("✅ User Logged In:", authData.user);
      const userId = authData.user.id;

      // Step 2: Fetch user role from `users` table, filtering by email and role
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, role")
        .eq("email", email)  // Filter by email
        .eq("role", userType)  // Filter by role
        .single(); // Ensure only one row is returned

      if (usersError || !usersData) {
        console.error("❌ Database Query Error:", usersError?.message);
        setError("User role could not be retrieved.");
        setIsLoading(false);
        return;
      }

      console.log("✅ Retrieved User Role:", usersData.role);

      // Step 3: Redirect based on user role
      const roleRedirects: Record<UserRole, string> = {
        spotlight: "/user",
        agent: "/profile",
        filmmaker: "/hub",
      };

      if (roleRedirects[usersData.role as UserRole]) {
        router.push(roleRedirects[usersData.role as UserRole]);
      } else {
        setError("Unauthorized access.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Unexpected Error:", err);
      setError("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-25%20040940-3N1cbNB3pOVoWNm842pCF7SHY0c3MB.png')`,
      }}
    >
      {/* Back to Home Button */}
      <div className="absolute top-6 left-8 z-10">
        <Link href="/">
          <button className="px-4 py-2 bg-black hover:bg-red-800 text-white font-bold rounded-sm transition duration-300">
            ← Back to Home
          </button>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6 p-8 bg-black bg-opacity-70 rounded-md">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Sign In</h1>

        {/* Toggle Buttons for Login Type */}
        <div className="flex justify-center space-x-4 mb-6">
          {["spotlight", "agent", "filmmaker"].map((type) => (
            <button
              key={type}
              type="button"
              className={`px-6 py-2 font-bold text-white rounded-md transition-all ${
                userType === type ? "bg-[#E50914]" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => setUserType(type as UserRole)} // Use the correct type here
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Login
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email Input */}
          <Input
            type="email"
            placeholder="Email or mobile number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-[#333333] border-0 text-white placeholder:text-gray-400"
            required
          />

          {/* Password Input */}
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-[#333333] border-0 text-white placeholder:text-gray-400"
            required
          />

          {/* Show Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Show Success Message */}
          {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

          {/* Sign In Button */}
          <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[#E50914] hover:bg-[#C11119] text-white">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="border-gray-400 data-[state=checked]:bg-[#E50914] data-[state=checked]:border-[#E50914]"
              />
              <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">Remember me</label>
            </div>
            <Link href="/forgot-password" className="text-sm text-gray-400 hover:underline">Forgot password?</Link>
          </div>

          {/* Sign Up Links */}
          {["signup", "film", "agents"].map((path, idx) => (
            <div key={idx} className="text-gray-400 text-sm">
              {idx === 0 ? "New to Spotlight?" : idx === 1 ? "Are you an Indie Filmmaker?" : "Are you a Film Agent?"}{" "}
              <Link href={`/${path}`} className="text-white hover:underline">Sign up now.</Link>
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}
