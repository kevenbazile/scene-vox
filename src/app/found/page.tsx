"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ----------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------
interface FilmFestival {
  id: number;
  name: string;
  image_url?: string;
  location?: string;
  start_date?: string; // Assumes a valid date string is stored here
  description?: string;
  submission_deadline?: string;
  venue?: string;
  attendees?: string | number;
  status?: string;
}

interface TriviaQuestion {
  question: string;
  answer: string;
}

// ----------------------------------------------------------
// Celebrity Trivia Component
// ----------------------------------------------------------
function CelebrityTrivia() {
  const [trivia, setTrivia] = useState<TriviaQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchTrivia = async () => {
    try {
      const res = await fetch("https://api.api-ninjas.com/v1/trivia", {
        headers: { "X-Api-Key": "puXdA8YEu9uYI6q1KbZ8kA==Gq5mDau8QPL2dWEt" },
      });
      const data = await res.json();
      if (data && data.length > 0) {
        // API returns an array with one object
        setTrivia(data[0]);
        setUserAnswer("");
        setFeedback("");
      }
    } catch (error) {
      console.error("Error fetching trivia:", error);
      setFeedback("Error fetching trivia question. Please try again.");
    }
  };

  useEffect(() => {
    fetchTrivia();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trivia) return;
    // Compare answers in a case-insensitive manner.
    if (userAnswer.trim().toLowerCase() === trivia.answer.trim().toLowerCase()) {
      setFeedback("Correct!");
    } else {
      setFeedback(`Incorrect! The correct answer is "${trivia.answer}".`);
    }
  };

  return (
    <div className="p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Celebrity Trivia</h2>
      {trivia ? (
        <div>
          <p className="mb-4">{trivia.question}</p>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Your answer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit Answer
            </button>
          </form>
          {feedback && <p className="mt-4 font-semibold">{feedback}</p>}
          <button
            onClick={fetchTrivia}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Next Question
          </button>
        </div>
      ) : (
        <p>Loading trivia...</p>
      )}
    </div>
  );
}

// ----------------------------------------------------------
// Main Events Page Component
// ----------------------------------------------------------
export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const [festivals, setFestivals] = useState<FilmFestival[]>([]);

  // Fetch film festivals from Supabase on mount
  useEffect(() => {
    const fetchFestivals = async () => {
      const { data, error } = await supabase
        .from("film_festivals")
        .select("*")
        .order("start_date", { ascending: true });
      if (error) {
        console.error("Error fetching film festivals:", error);
      } else {
        setFestivals(data || []);
      }
    };

    fetchFestivals();
  }, []);

  // Render a film festival card. The date is now formatted with toLocaleDateString.
  const renderFestivalCard = (festival: FilmFestival) => (
    <div key={festival.id} className="border rounded shadow p-4 bg-white">
      <img
        src={festival.image_url || "/placeholder.jpg"}
        alt={festival.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="font-bold text-xl mt-2">{festival.name}</h3>
      <p className="text-gray-600">
        {festival.start_date
          ? new Date(festival.start_date).toLocaleDateString()
          : "Date not available"}
      </p>
      <p className="text-gray-500">{festival.location}</p>
      <a
        href={`/film-festivals/${festival.id}`}
        className="mt-2 inline-block text-blue-500 hover:underline"
      >
        View Details
      </a>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Dashboard */}
      <div className="mb-4">
        <a href="/profile" className="text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </a>
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold">EventHub</h1>
        <p className="text-lg text-gray-600">
          Discover upcoming film festivals and enjoy celebrity trivia
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <button
          className={`mr-4 pb-2 transition-colors ${
            activeTab === "discover"
              ? "border-b-2 border-blue-500 font-bold text-black"
              : "text-gray-600 hover:text-black"
          }`}
          onClick={() => setActiveTab("discover")}
        >
          Discover
        </button>
        <button
          className={`pb-2 transition-colors ${
            activeTab === "trivia"
              ? "border-b-2 border-blue-500 font-bold text-black"
              : "text-gray-600 hover:text-black"
          }`}
          onClick={() => setActiveTab("trivia")}
        >
          Celebrity Trivia
        </button>
      </div>

      {/* Content */}
      {activeTab === "discover" && (
        <div>
          {festivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {festivals.map((festival) => renderFestivalCard(festival))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming film festivals found.</p>
          )}
        </div>
      )}

      {activeTab === "trivia" && <CelebrityTrivia />}
    </div>
  );
}
