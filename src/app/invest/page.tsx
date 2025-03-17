"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function InvestPage() {
  const [amount, setAmount] = useState("");
  const [selectedFilm, setSelectedFilm] = useState("");
  const [films, setFilms] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [showPaypal, setShowPaypal] = useState(false);

  // Fetch films from multiple tables and combine them.
  useEffect(() => {
    async function fetchFilms() {
      try {
        const { data: filmsData, error: filmsError } = await supabase
          .from("films")
          .select("*");
        const { data: festivalsData, error: festivalsError } = await supabase
          .from("film_festivals")
          .select("*");
        const { data: newMoviesData, error: newMoviesError } = await supabase
          .from("new_movies")
          .select("*");
        const { data: shortFilmsData, error: shortFilmsError } = await supabase
          .from("short_films")
          .select("*");
        const { data: tvShowsData, error: tvShowsError } = await supabase
          .from("tv_shows")
          .select("*");

        if (filmsError) console.error("Films error:", filmsError);
        if (festivalsError) console.error("Film festivals error:", festivalsError);
        if (newMoviesError) console.error("New movies error:", newMoviesError);
        if (shortFilmsError) console.error("Short films error:", shortFilmsError);
        if (tvShowsError) console.error("TV shows error:", tvShowsError);

        // Combine arrays and filter out duplicates using film.id (or index as fallback)
        const combined = [
          ...(filmsData || []),
          ...(festivalsData || []),
          ...(newMoviesData || []),
          ...(shortFilmsData || []),
          ...(tvShowsData || []),
        ];
        const uniqueFilms = Array.from(
          new Map(combined.map((film, i) => [film.id || i, film])).values()
        );
        setFilms(uniqueFilms);
      } catch (error) {
        console.error("Error fetching films:", error);
      }
    }
    fetchFilms();
  }, []);

  // Load and render the PayPal Hosted Button when the user clicks Invest Now.
  useEffect(() => {
    if (!showPaypal) return;

    const renderHostedButton = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        window.paypal.HostedButtons({
          hostedButtonId: "EMUMV68UX4RFW",
        }).render("#paypal-container-EMUMV68UX4RFW");
      }
    };

    const scriptId = "paypal-hosted-buttons";
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      // Removed disableFunding=applepay parameter
      script.src =
        "https://www.paypal.com/sdk/js?client-id=BAAThW59X6PA4gPumpcNWCFXXhhe6UKnDYCtiKHrJEbyxZeTZC4NvHT2RPoFuBONS2Ts3vZk1qpiBQGr18&components=hosted-buttons&enable-funding=venmo&currency=USD";
      script.crossOrigin = "anonymous";
      script.async = true;
      script.onload = renderHostedButton;
      document.body.appendChild(script);
    } else {
      renderHostedButton();
    }
  }, [showPaypal]);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/invest-background.jpg')" }} // Ensure this image exists in your public folder
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl font-bold text-white mb-4">
          Invest in Films
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Be part of the cinematic revolution. Invest any amount in any film and
          watch your dreams come to life.
        </p>

        <div className="max-w-md mx-auto bg-white bg-opacity-90 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Invest in Your Favorite Film
          </h2>
          <p className="text-gray-700 mb-4">
            Our investment platform is under construction. For now, select a
            film, enter the amount you wish to invest, and then click "Invest Now".
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="Enter Amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="p-3 border border-gray-300 rounded"
            />
            <select
              value={selectedFilm}
              onChange={(e) => setSelectedFilm(e.target.value)}
              className="p-3 border border-gray-300 rounded"
            >
              <option value="">Select Film</option>
              {films.map((film, index) => (
                <option key={film.id || index} value={film.id}>
                  {film.title || film.name || "Untitled Film"}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
              onClick={() => {
                setMessage("Processing your investment...");
                setShowPaypal(true);
              }}
            >
              Invest Now
            </button>
          </div>
        </div>

        {/* Render PayPal Hosted Button only when Invest Now is clicked */}
        {showPaypal && (
          <div className="mt-8" id="paypal-container-EMUMV68UX4RFW"></div>
        )}

        {message && <p className="text-white mt-8">{message}</p>}
        <Link href="/profile" className="mt-4 inline-block text-blue-300 underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
