"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";

// Replace this with your actual logic to determine the agent's current plan.
// For agents, we use "basic" for the $25 plan and "upgrade" for the $50 plan.
function getCurrentUserPlan(): "basic" | "upgrade" | "none" {
  // For demonstration, assume the agent is currently on the $25 (basic) plan.
  return "basic";
}

// Placeholder user email; in a real app, retrieve the logged-in user's email.
const userEmail = "agent@example.com";

const AgentsUpgradePage = () => {
  const currentPlan = getCurrentUserPlan();
  const isBasicActive = currentPlan === "basic"; // Agent is on the $25 plan.
  const isUpgradeActive = currentPlan === "upgrade"; // Agent is on the $50 plan.
  
  // Ref to track whether the PayPal button has been rendered.
  const paypalRendered = useRef(false);

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
            plan === "upgrade" ? "$50" : "$25"
          } successful. Subscription ID: ${subscriptionID}\n${result.message}`
        );
      })
      .catch((err) => {
        console.error("Error saving plan info:", err);
      });
  };

  useEffect(() => {
    // Only render the $50 upgrade button if the agent is on the basic ($25) plan.
    if (isBasicActive && !paypalRendered.current) {
      const renderUpgradeButton = () => {
        if (window.paypal) {
          window.paypal
            .Buttons({
              style: {
                shape: "rect",
                color: "gold",
                layout: "vertical",
                label: "subscribe",
              },
              createSubscription: (data: any, actions: any): Promise<string> => {
                return actions.subscription.create({
                  plan_id: "P-64582999G40395126M7KWO3Q", // $50 plan ID
                });
              },
              onApprove: (data: any, actions: any): void => {
                // Save the upgrade subscription details.
                savePlan(data.subscriptionID, "upgrade");
              },
              onError: (err: any): void => {
                console.error("PayPal Upgrade Button Error:", err);
              },
            })
            .render("#paypal-upgrade-container");
          paypalRendered.current = true;
        }
      };

      // Load the PayPal SDK if it isn't already loaded.
      const scriptId = "paypal-sdk";
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement("script");
        script.src =
          "https://www.paypal.com/sdk/js?client-id=ASbICYpUnCyOx0RJZONVZxaSE9NlGPbBpeVc7ZQTxljGckVrD10IkSe-2ajCnZrQ9FJAvTEt-iN1PUB4&vault=true&intent=subscription";
        script.id = scriptId;
        script.setAttribute("data-sdk-integration-source", "button-factory");
        script.async = true;
        script.onload = renderUpgradeButton;
        document.body.appendChild(script);
      } else {
        renderUpgradeButton();
      }
    }
  }, [isBasicActive]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">
      {/* Back to Dashboard */}
      <Link
        href="/profile"
        className="absolute top-4 right-4 border border-blue-600 p-2 rounded text-blue-600 hover:underline"
      >
        Back to Dashboard
      </Link>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Upgrade Your Plan</h1>
        <p className="text-lg text-gray-600 mt-2">
          Select the plan that best suits your needs.
        </p>
        <p className="text-gray-700 mt-2">
          Current plan:{" "}
          {currentPlan === "none"
            ? "No Plan"
            : currentPlan === "basic"
            ? "$25 (Basic)"
            : "$50 (Upgrade)"}
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Distribution Basic Card ($25 plan) */}
        <div
          className={`bg-white rounded-lg shadow p-6 flex-1 flex flex-col ${
            isBasicActive ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">Distribution Basic</h2>
          <p className="text-3xl font-bold mb-4">$25</p>
          <ul className="flex-1 mb-6 space-y-2 text-gray-700">
            <li>Basic distribution features</li>
            <li>Email support</li>
            <li>Basic analytics</li>
          </ul>
          {isBasicActive ? (
            <p className="mt-2 text-center text-green-600 font-semibold">
              Currently Active
            </p>
          ) : (
            <Link
              href="/payment/basic"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Subscribe to Basic
            </Link>
          )}
        </div>

        {/* Distribution Upgrade Card ($50 plan) */}
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Distribution Upgrade</h2>
          <p className="text-3xl font-bold mb-4">$50</p>
          <ul className="flex-1 mb-6 space-y-2 text-gray-700">
            <li>Advanced distribution features</li>
            <li>Priority support</li>
            <li>Enhanced analytics</li>
            <li>Custom branding</li>
          </ul>
          {isBasicActive ? (
            // If the agent is on the $25 plan, render the PayPal button for the $50 upgrade.
            <div id="paypal-upgrade-container"></div>
          ) : (
            <Link
              href="/payment/upgrade"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Upgrade to $50
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
            href="/candy"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
          >
            Contact Sales
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AgentsUpgradePage;
