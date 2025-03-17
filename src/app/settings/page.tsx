"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("user_feedback")
        .insert([{ feedback }]);
      if (error) {
        console.error("Error submitting feedback:", error);
      } else {
        console.log("Feedback submitted:", data);
        setSubmitted(true);
        setFeedback("");
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      {/* Back to Home Button */}
      <div className="flex justify-end mb-4">
        <Link href="/userhome">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      {/* Feedback Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Feedback</h2>
        <p className="mb-4">
          We value your feedback. Please share any comments on how to make the app better.
        </p>
        <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4">
          <textarea
            className="p-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="Your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
          <Button type="submit">Submit Feedback</Button>
        </form>
        {submitted && (
          <p className="mt-4 text-green-500">Thank you for your feedback!</p>
        )}
      </section>
      
      {/* Membership Cancellation Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Membership</h2>
        <p className="mb-4">
          To cancel your membership, please click the button below. (This action will be handled on a separate page.)
        </p>
        <Link href="/cancel-membership">
          <Button variant="outline">Cancel Membership</Button>
        </Link>
      </section>
    </div>
  );
}
