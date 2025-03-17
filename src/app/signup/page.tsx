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

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // paymentStarted determines whether to show the PayPal payment flow.
  const [paymentStarted, setPaymentStarted] = useState(false);
  const router = useRouter();
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // When the user submits the form, validate inputs and then trigger the payment flow.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    // Trigger the payment flow; account creation happens after payment success.
    setPaymentStarted(true);
  };

  // This function is called after a successful PayPal payment.
  const completeSignup = async (subscriptionID: string) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Create the user account in Supabase Auth.
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
      // Insert user details into the users table (with the subscription ID).
      const { error: dbError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            email,
            password,
            role: "spotlight",
            subscription_id: subscriptionID,
          },
        ]);
      if (dbError) {
        console.error("Database Insert Error:", dbError.message);
        setError("Could not save user data.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Signup completed successfully! Your subscription is active.");
      // Optionally, navigate to another page.
      // router.push("/dashboard");
    } catch (err) {
      console.error("Unexpected Error:", err);
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  // Load the PayPal SDK and render the subscription button when paymentStarted is true.
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
                plan_id: "P-1GR60857FX8222220M7KVVGA",
              });
            },
            onApprove: function (data: any, actions: any) {
              // Payment completed; proceed with user signup.
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
          {/* Signup Form Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Signup Form Page</h1>
            <p className="text-gray-400">Welcome to the Sign-up form section.</p>
          </div>

          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-4xl font-extrabold text-white">
                Unlimited movies, TV shows, and more
              </h2>
              <p className="mt-2 text-sm text-gray-400">Watch anywhere. Cancel anytime.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {loading ? "Processing..." : "Sign up"}
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
          <div
            ref={paypalContainerRef}
            id="paypal-button-container-P-1GR60857FX8222220M7KVVGA"
          ></div>
        </div>
      )}
    </div>
  );
}
