"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Extend the global Window type to include the PayPal object.
declare global {
  interface Window {
    paypal: any;
  }
}

export default function FilmmakerSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [imdb, setImdb] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Determines if the payment flow should start.
  const [paymentStarted, setPaymentStarted] = useState(false);
  const router = useRouter();
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // Form submission: validate filmmaker inputs then trigger payment flow.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate basic inputs
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setError("Invalid email address.");
      return;
    }
    if (!password || !linkedin || !imdb || !portfolio) {
      setError("Please fill in all required fields.");
      return;
    }

    // Trigger the payment flow (authentication happens after payment)
    setPaymentStarted(true);
  };

  // Called after a successful PayPal payment.
  const completeSignup = async (subscriptionID: string) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Step 1: Create the user in Supabase Auth.
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error("Signup Error:", error.message);
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Insert filmmaker details (with subscription ID) into the users table.
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email,
          role: "filmmaker",
          linkedin,
          imdb,
          portfolio,
          subscription_id: subscriptionID,
        },
      ]);
      if (dbError) {
        console.error("Database Insert Error:", dbError.message);
        setError("Could not save user data.");
        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Signup successful! You will receive an email about your application status in 48-72 business hours."
      );
      // Optionally, navigate to a different page.
      // router.push("/dashboard");
    } catch (err) {
      console.error("Unexpected Error:", err);
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  // Load the PayPal SDK and render the subscription button once payment is started.
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
                plan_id: "P-2JP41033WJ989973RM7KV7CI",
              });
            },
            onApprove: function (data: any, actions: any) {
              // Payment completed; complete signup process.
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
      {/* Render the signup form only if payment hasn't started */}
      {!paymentStarted && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Filmmaker Signup Form</h1>
            <p className="text-gray-400">Welcome to the sign-up form for filmmakers.</p>
          </div>

          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-md font-extrabold text-white">
                Be your own Film Festival! Get paid to share your vision and negotiate deals with agents.
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                You'll receive an email with your application status in 48-72 business hours.
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                {/* Email */}
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
                {/* Password */}
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
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {/* LinkedIn */}
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
                {/* IMDb */}
                <div>
                  <Label htmlFor="imdb" className="sr-only">
                    IMDb Profile URL
                  </Label>
                  <Input
                    id="imdb"
                    name="imdb"
                    type="url"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 sm:text-sm"
                    placeholder="IMDb Profile URL"
                    value={imdb}
                    onChange={(e) => setImdb(e.target.value)}
                  />
                </div>
                {/* Portfolio */}
                <div>
                  <Label htmlFor="portfolio" className="sr-only">
                    Portfolio Link
                  </Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md sm:text-sm"
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
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {loading ? "Signing up..." : "Sign up"}
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

      {/* Show the PayPal payment flow once form is submitted */}
      {paymentStarted && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white text-center">Complete your payment</h3>
          <div
            ref={paypalContainerRef}
            id="paypal-button-container-P-2JP41033WJ989973RM7KV7CI"
          ></div>
        </div>
      )}
    </div>
  );
}
