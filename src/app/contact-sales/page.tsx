"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactForm() {
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [statusMessage, setStatusMessage] = useState("");

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(""); // Clear any previous status

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(contact),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      setStatusMessage(data.message || "Message sent successfully!");
      // Clear the form after successful submission
      setContact({ name: "", phone: "", email: "", message: "" });
    } catch (err: any) {
      setStatusMessage(err.message || "An unexpected error occurred.");
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4">
      {/* Back to Upgrade Link */}
      <div className="absolute top-4 left-4">
        <Link href="/upgrade" className="text-white hover:underline">
          ← Back to Upgrade
        </Link>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-white">Contact Us</h2>
      <form
        onSubmit={handleContactSubmit}
        className="flex flex-col gap-4 w-full max-w-lg"
      >
        <input
          type="text"
          placeholder="Your Name"
          value={contact.name}
          onChange={(e) =>
            setContact({ ...contact, name: e.target.value })
          }
          className="p-4 w-full rounded-md text-black outline-none"
          required
        />
        <input
          type="tel"
          placeholder="Your Phone Number"
          value={contact.phone}
          onChange={(e) =>
            setContact({ ...contact, phone: e.target.value })
          }
          className="p-4 w-full rounded-md text-black outline-none"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={contact.email}
          onChange={(e) =>
            setContact({ ...contact, email: e.target.value })
          }
          className="p-4 w-full rounded-md text-black outline-none"
          required
        />
        <textarea
          placeholder="Your Message"
          value={contact.message}
          onChange={(e) =>
            setContact({ ...contact, message: e.target.value })
          }
          className="p-4 w-full rounded-md text-black outline-none"
          rows={5}
          required
        />
        <button
          type="submit"
          className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition duration-300 text-lg"
        >
          Send Message
        </button>
      </form>
      {statusMessage && (
        <p className="mt-4 text-sm text-white">{statusMessage}</p>
      )}
    </div>
  );
}
