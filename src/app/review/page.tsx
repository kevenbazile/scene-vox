// pages/feedback.js
"use client"
import React, { useState } from "react";
import Link from "next/link";

const FeedbackPage = () => {
  // State to store user input from the feedback form
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

interface FeedbackFormData {
    name: string;
    email: string;
    feedback: string;
}

const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // In a real app, you'd send this data to your API / server
    alert(
        `Thank you for your feedback!\n\nName: ${name}\nEmail: ${email}\nMessage: ${feedback}`
    );
    // Reset form fields
    setFeedback("");
    setName("");
    setEmail("");
};

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">
      {/* Back to Dashboard link with solid blue border */}
      <Link
        href="/profile"
        className="absolute top-4 right-4 border border-blue-600 p-2 rounded text-blue-600 hover:underline"
      >
        Back to Dashboard
      </Link>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Feedback & Community</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
          We want to hear from you! Let us know how we can make the platform
          better for your filmmaking workflow. Your feedback helps shape our
          roadmap and ensures you have a direct voice in our development process.
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white rounded-lg shadow p-6">
        {/* Intro / Explanation */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Help Us Improve</h2>
          <p className="text-gray-700 mb-4">
            As a filmmaker, your needs are constantly evolving. We’re building
            tools to simplify your distribution, enhance collaboration, and grow
            your audience. Share your ideas, frustrations, or dream features
            below—our CTO and team will read every message.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Community Governance:</strong> We believe in developing this
            platform with real input from our users. Whether it's new features,
            integrations, or workflow enhancements, your suggestions directly
            influence our roadmap. We want to build a true community around our
            tools, and your feedback is crucial to make that happen.
          </p>
          <p className="text-gray-700">
            <strong>Direct CTO Contact:</strong> If you prefer a one-on-one
            conversation, feel free to email our CTO at{" "}
            <a
              href="mailto:cto@example.com"
              className="text-blue-600 underline"
            >
              cto@example.com
            </a>
            . We value your unique perspective and look forward to hearing from
            you!
          </p>
        </section>

        {/* Feedback Form */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Send Us Your Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-1"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Your Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="feedback"
                className="block text-gray-700 font-medium mb-1"
              >
                Your Message
              </label>
              <textarea
                id="feedback"
                rows={5}
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Tell us what's on your mind..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Submit Feedback
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default FeedbackPage;
