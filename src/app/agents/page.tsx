"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase"; // Import your supabase client
import { useRouter } from "next/navigation";

type UserRole = "spotlight" | "agent" | "filmmaker";

export default function AgentSignup() {
  const router = useRouter();

  // State Variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserRole>("agent"); // Default user type is "agent"
  const [paymentStarted, setPaymentStarted] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // Handle form submission: validate inputs then trigger payment flow.
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate email format.
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setError("Invalid email address.");
      return;
    }
    if (!email || !password || !linkedin || !portfolio) {
      setError("Please fill in all required fields.");
      return;
    }

    // Trigger payment flow. Authentication will happen after payment approval.
    setPaymentStarted(true);
  };

  // Complete signup after successful PayPal payment.
  const completeSignup = async (subscriptionID: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Clear any previous session.
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();

      // Check if user already exists.
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .eq("role", userType)
        .single();

      if (userError && userError.code !== "PGRST116") {
        setError("An error occurred while checking for existing user.");
        setIsLoading(false);
        return;
      }
      if (existingUser) {
        setError("A user with this email and role already exists.");
        setIsLoading(false);
        return;
      }

      // Sign up user in Supabase Auth.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) {
        setError(
          authError.message.includes("Email not confirmed")
            ? "Your email is not confirmed. Resending confirmation email..."
            : "Invalid email or password."
        );
        if (authError.message.includes("Email not confirmed")) {
          await supabase.auth.resend({ type: "signup", email });
          setSuccessMessage("A new confirmation email has been sent. Please check your inbox.");
        }
        setIsLoading(false);
        return;
      }
      if (!authData.user) {
        setError("Signup failed. Please try again.");
        setIsLoading(false);
        return;
      }
      const userId = authData.user.id;

      // Insert agent details (with subscription ID) into the users table.
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          role: "agent",
          linkedin,
          portfolio,
          subscription_id: subscriptionID,
        },
      ]);
      if (dbError) {
        setError("Could not save user data.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Signup successful! You will receive an email about the decision in 48-72 business hours.");
      // Optionally, navigate to another page.
      // router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  // Load the PayPal SDK and render the subscription button when paymentStarted becomes true.
  useEffect(() => {
    if (!paymentStarted) return;

    const renderPayPalButton = () => {
      if (window.paypal && paypalContainerRef.current) {
        window.paypal
          .Buttons({
            style: {
              shape: "rect",
              color: "gold",
              layout: "vertical",
              label: "subscribe",
            },
            createSubscription: function (data: any, actions: any) {
              // Creates the subscription using your live plan ID.
              return actions.subscription.create({
                plan_id: "P-40A31000CN823930HM7KWEVA",
              });
            },
            onApprove: function (data: any, actions: any) {
              // Payment completed; proceed with the signup process.
              completeSignup(data.subscriptionID);
            },
            onError: function (err: any) {
              console.error("PayPal Button Error:", err);
              setError("Payment failed. Please try again.");
            },
          })
          .render(paypalContainerRef.current);
      }
    };

    const scriptId = "paypal-sdk";
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=ASbICYpUnCyOx0RJZONVZxaSE9NlGPbBpeVc7ZQTxljGckVrD10IkSe-2ajCnZrQ9FJAvTEt-iN1PUB4&vault=true&intent=subscription";
      script.id = scriptId;
      script.setAttribute("data-sdk-integration-source", "button-factory");
      script.async = true;
      script.onload = () => {
        renderPayPalButton();
      };
      document.body.appendChild(script);
    } else {
      renderPayPalButton();
    }
  }, [paymentStarted]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {!paymentStarted && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Agents Signup Form</h1>
            <p className="text-gray-400">Welcome to the Sign-up form for agents.</p>
          </div>

          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-xl font-extrabold text-white">
                Unlimited Data on movies, TV shows, and Negotiating deals with filmmakers
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Analytics and reports at the click of a button. Cancel anytime.
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSignup}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <Label htmlFor="email-address" className="sr-only">
                    Email address
                  </Label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="sr-only">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin" className="sr-only">
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 sm:text-sm"
                    placeholder="LinkedIn Profile URL"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio" className="sr-only">
                    Portfolio Link
                  </Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 sm:text-sm"
                    placeholder="Portfolio Link"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>
              </div>
            </form>
            <p className="mt-2 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/signin" className="font-medium text-red-600 hover:text-red-500">
                Sign in
              </a>
            </p>
          </div>
        </>
      )}

      {paymentStarted && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white text-center">Complete your payment</h3>
          <div ref={paypalContainerRef} id="paypal-button-container-P-40A31000CN823930HM7KWEVA"></div>
        </div>
      )}
    </div>
  );
}
