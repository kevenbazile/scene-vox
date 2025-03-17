// pages/referrals.js
"use client"
import React from "react";
import Link from "next/link";

const ReferralsPage = () => {
  // Example data
  const referralLink = "https://example.com/signup?ref=yourReferralCode";
  const referrals = [
    {
      id: 1,
      date: "2025-03-05",
      referralType: "Regular",
      status: "Signed Up",
      earnings: 10.0,
    },
    {
      id: 2,
      date: "2025-03-07",
      referralType: "Guerrilla",
      status: "Pending",
      earnings: 20.0,
    },
  ];

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
        <h1 className="text-4xl font-bold">Referrals & Brand Ambassador</h1>
        <p className="text-lg text-gray-600 mt-2">
          Earn money by referring new users &amp; promoting us online.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Instructions & Referral Link */}
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>

          <p className="text-gray-700 mb-4">
            Share your referral link below to earn <strong>$10</strong> for each
            new sign-up. For <strong>guerrilla-style marketing</strong> (like
            graffiti or posting flyers on walls), you can earn{" "}
            <strong>$20</strong> per sign-up. Simply scan or share a special QR
            code, and we’ll track each new user who joins.
          </p>

          <p className="text-gray-700 mb-4">
            <strong>Brand Ambassador Tip:</strong> To use guerrilla marketing,
            message{" "}
            <a
              href="https://instagram.com/kevenbazile"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              @kevenbazile
            </a>{" "}
            on Instagram for approval. Then you’ll receive your custom QR
            materials to post in strategic locations.
          </p>

          <h3 className="text-xl font-medium mb-2">Your Referral Link</h3>
          <div className="border border-gray-300 rounded p-3 bg-gray-50 mb-6 break-words">
            {referralLink}
          </div>
          <p className="text-gray-600 mb-6">
            Share this link via social media, email, or direct messaging. Every
            new user who signs up through this link earns you <strong>$10</strong>.
          </p>

          <button
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              alert("Referral link copied to clipboard!");
            }}
          >
            Copy Referral Link
          </button>
        </div>

        {/* Referral Activity / Earnings */}
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Your Referral Activity</h2>
          <p className="text-gray-600 mb-4">
            Track your referrals, status, and earnings.
          </p>

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border-b font-medium text-gray-700 text-left">
                    Date
                  </th>
                  <th className="px-4 py-2 border-b font-medium text-gray-700 text-left">
                    Referral Type
                  </th>
                  <th className="px-4 py-2 border-b font-medium text-gray-700 text-left">
                    Status
                  </th>
                  <th className="px-4 py-2 border-b font-medium text-gray-700 text-right">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id}>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {ref.date}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {ref.referralType}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {ref.status}
                    </td>
                    <td
                      className={`px-4 py-2 border-b text-right ${
                        ref.earnings > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      +${ref.earnings.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferralsPage;
