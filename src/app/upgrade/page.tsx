"use client";
import React, { useEffect } from "react";
import Link from "next/link";

// Replace this with your actual logic to determine the user's current plan.
function getCurrentUserPlan(): "pro" | "plus" | "none" {
  // For demonstration, assume the user is on the $50 (Pro) plan.
  return "pro";
}

// For demonstration, we set a placeholder user email.
// In a real app, retrieve the logged-in user's email.
const userEmail = "user@example.com";

const UpgradePage = () => {
  // Example boolean indicating whether the user already has the Pro ($50) plan.
  const isProActive = getCurrentUserPlan() === "pro";

  // Function to save subscription details (email, subscriptionID, plan) to Supabase "plans" table.
  const savePlan = (subscriptionID: string, plan: string) => {
    fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send the email, subscriptionID, and plan to your API route.
      body: JSON.stringify({ email: userEmail, subscriptionID, plan }),
    })
      .then((res) => res.json())
      .then((result) => {
        alert(
          `Upgrade to ${
            plan === "plus" ? "$125" : "$50"
          } successful. Subscription ID: ${subscriptionID}\n${result.message}`
        );
      })
      .catch((err) => {
        console.error("Error saving plan info:", err);
      });
  };

  useEffect(() => {
    if (isProActive) {
      // Function to render the PayPal button for the $125 upgrade.
      const renderPlusPayPalButton = () => {
        if (window.paypal) {
          window.paypal
            .Buttons({
              style: {
                shape: "rect",
                color: "gold",
                layout: "vertical",
                label: "subscribe",
              },
              createSubscription: function (data: any, actions: any): Promise<string> {
                return actions.subscription.create({
                  plan_id: "P-7AY16000YN7190133M7KWIVI", // $125 plan ID
                });
              },
              onApprove: function (data: any, actions: any): void {
                // Save the subscription info to Supabase when the $125 upgrade is approved.
                savePlan(data.subscriptionID, "plus");
              },
              onError: function (err: any): void {
                console.error("PayPal Button Error:", err);
              },
            })
            .render("#paypal-plus-container");
        }
      };

      // Load the PayPal SDK if it isn’t already available.
      if (!window.paypal) {
        const script = document.createElement("script");
        script.src =
          "https://www.paypal.com/sdk/js?client-id=ASbICYpUnCyOx0RJZONVZxaSE9NlGPbBpeVc7ZQTxljGckVrD10IkSe-2ajCnZrQ9FJAvTEt-iN1PUB4&vault=true&intent=subscription";
        script.setAttribute("data-sdk-integration-source", "button-factory");
        script.async = true;
        script.onload = renderPlusPayPalButton;
        document.body.appendChild(script);
      } else {
        renderPlusPayPalButton();
      }
    }
  }, [isProActive]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">
      {/* Back to Dashboard with solid blue border */}
      <Link
        href="/hub"
        className="absolute top-4 right-4 border border-blue-600 p-2 rounded text-blue-600 hover:underline"
      >
        Back to Dashboard
      </Link>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Upgrade Your Plan</h1>
        <p className="text-lg text-gray-600 mt-2">
          Select the plan that best suits your needs.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Distribution Pro Card */}
        <div
          className={`bg-white rounded-lg shadow p-6 flex-1 flex flex-col ${
            isProActive ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">Distribution Pro</h2>
          <p className="text-3xl font-bold mb-4">$50</p>
          <ul className="flex-1 mb-6 space-y-2 text-gray-700">
            <li>Basic distribution features</li>
            <li>Email support</li>
            <li>Basic analytics</li>
          </ul>
          {isProActive ? (
            // Show a label if the user already has this plan.
            <p className="mt-2 text-center text-green-600 font-semibold">
              Currently Active
            </p>
          ) : (
            <Link
              href="/payment/pro"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>

        {/* Distribution Plus Card */}
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Distribution Plus</h2>
          <p className="text-3xl font-bold mb-4">$125</p>
          <ul className="flex-1 mb-6 space-y-2 text-gray-700">
            <li>Advanced distribution features</li>
            <li>Priority support</li>
            <li>Enhanced analytics</li>
            <li>Custom branding</li>
          </ul>
          {isProActive ? (
            // If the user is on the $50 plan, render the PayPal button for the $125 upgrade.
            <div id="paypal-plus-container"></div>
          ) : (
            <Link
              href="/payment/plus"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Upgrade to Plus
            </Link>
          )}
        </div>

        {/* Distribution Enterprise Card */}
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Distribution Enterprise</h2>
          <p className="text-3xl font-bold mb-4">Contact Us</p>
          <ul className="flex-1 mb-6 space-y-2 text-gray-700">
            <li>All Plus features</li>
            <li>Dedicated account manager</li>
            <li>Custom integrations</li>
            <li>Enterprise-level support</li>
          </ul>
          <Link
            href="/contact-sales"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
          >
            Contact Sales
          </Link>
        </div>
      </main>
    </div>
  );
};

export default UpgradePage;
