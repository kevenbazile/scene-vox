// pages/wallet.js
"use client"
import React from "react";
import Link from "next/link";

const WalletPage = () => {
  // Example data: user’s current wallet balance and activity records
  const balance = 123.45; // e.g. from your API
  const transactions = [
    { id: 1, date: "2025-02-10", description: "Project Payment", amount: 100.0 },
    { id: 2, date: "2025-02-15", description: "Withdrawal", amount: -50.0 },
    { id: 3, date: "2025-03-01", description: "Project Payment", amount: 75.0 },
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
        <h1 className="text-4xl font-bold">Your Wallet</h1>
        <p className="text-lg text-gray-600 mt-2">
          Manage your earnings and withdrawals.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Wallet Balance & Withdrawal Card */}
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-semibold mb-2">Current Balance</h2>
          <p className="text-4xl font-bold mb-6">${balance.toFixed(2)}</p>

          <div className="mb-4">
            <label className="block mb-2 text-gray-700 font-medium">
              Withdrawal Method
            </label>
            <select className="border rounded px-3 py-2 w-full">
              <option>PayPal</option>
              <option>Bank Transfer</option>
              <option>Check</option>
            </select>
          </div>

          <button
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            onClick={() => alert("Withdrawal flow to be implemented")}
          >
            Withdraw Funds
          </button>
        </div>

        {/* Activity/Statements Card */}
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-semibold mb-2">Activity / Statements</h2>
          <p className="text-gray-600 mb-4">
            Review your recent transactions or payments.
          </p>

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border-b font-medium text-gray-700 text-left">
                    Date
                  </th>
                  <th className="px-4 py-2 border-b font-medium text-gray-700 text-left">
                    Description
                  </th>
                  <th className="px-4 py-2 border-b font-medium text-gray-700 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {tx.date}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {tx.description}
                    </td>
                    <td
                      className={`px-4 py-2 border-b text-right ${
                        tx.amount < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
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

export default WalletPage;
