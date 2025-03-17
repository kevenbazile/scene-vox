"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function FilmHubPage() {
  // States for data fetched from Supabase
  const [films, setFilms] = useState<any[]>([]);
  const [shortFilms, setShortFilms] = useState<any[]>([]);
  const [festivals, setFestivals] = useState<any[]>([]);
  const [newMovies, setNewMovies] = useState<any[]>([]);

  // States for carousel indices (auto-rotation)
  const [shortFilmIndex, setShortFilmIndex] = useState(0);
  const shortFilmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [festivalIndex, setFestivalIndex] = useState(0);
  const festivalIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State for the selected video URL in the VOD player
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");

  // 1) Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TV Shows
        const { data: filmsData, error: filmsError } = await supabase
          .from("tv_shows")
          .select("*");
        if (filmsError) console.error("Error fetching TV Shows:", filmsError);
        else setFilms(filmsData || []);

        // New Movies
        const { data: newMoviesData, error: newMoviesError } = await supabase
          .from("new_movies")
          .select("*");
        if (newMoviesError)
          console.error("Error fetching New Movies:", newMoviesError);
        else setNewMovies(newMoviesData || []);

        // Short Films
        const { data: shortFilmsData, error: shortFilmsError } = await supabase
          .from("short_films")
          .select("*");
        if (shortFilmsError)
          console.error("Error fetching Short Films:", shortFilmsError);
        else setShortFilms(shortFilmsData || []);

        // Film Festivals
        const { data: festivalsData, error: festivalsError } = await supabase
          .from("film_festivals")
          .select("*");
        if (festivalsError)
          console.error("Error fetching Film Festivals:", festivalsError);
        else setFestivals(festivalsData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // 2) Auto-rotation for Short Films carousel
  useEffect(() => {
    if (shortFilmIntervalRef.current) {
      clearInterval(shortFilmIntervalRef.current);
      shortFilmIntervalRef.current = null;
    }
    if (shortFilms.length > 0) {
      shortFilmIntervalRef.current = setInterval(() => {
        setShortFilmIndex((prev) => (prev + 1) % shortFilms.length);
      }, 5000);
    }
    return () => {
      if (shortFilmIntervalRef.current) {
        clearInterval(shortFilmIntervalRef.current);
        shortFilmIntervalRef.current = null;
      }
    };
  }, [shortFilms]);

  // 3) Auto-rotation for Film Festivals carousel
  useEffect(() => {
    if (festivalIntervalRef.current) {
      clearInterval(festivalIntervalRef.current);
      festivalIntervalRef.current = null;
    }
    if (festivals.length > 0) {
      festivalIntervalRef.current = setInterval(() => {
        setFestivalIndex((prev) => (prev + 1) % festivals.length);
      }, 5000);
    }
    return () => {
      if (festivalIntervalRef.current) {
        clearInterval(festivalIntervalRef.current);
        festivalIntervalRef.current = null;
      }
    };
  }, [festivals]);

  // 4) Manual navigation for carousels
  const navigateCarousel = (
    direction: "prev" | "next",
    items: any[],
    currentIndex: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    intervalRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (items.length === 0) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (direction === "prev") {
      setIndex((prev) => (prev - 1 + items.length) % items.length);
    } else {
      setIndex((prev) => (prev + 1) % items.length);
    }
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
  };

  // 5) Set the selected video URL for the VOD player
  const handleSelectVideo = (file_url: string) => {
    setSelectedVideoUrl(file_url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 6) Render a single short film item in the carousel
  const renderVideoCarouselItem = (items: any[], index: number) => {
    if (!items || items.length === 0 || index < 0 || index >= items.length) return null;
    const item = items[index];
    if (!item.file_url) {
      console.error("Missing file_url for item:", item);
      return null;
    }
    return (
      <div onClick={() => handleSelectVideo(item.file_url)} style={{ cursor: "pointer" }}>
        <video controls preload="metadata" poster={item.thumbnail_url || ""} style={{ width: "100%", borderRadius: "4px" }}>
          <source src={item.file_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div style={{ marginTop: "0.5rem" }}>
          <p style={{ fontWeight: "bold", margin: 0 }}>{item.name || item.title || "Untitled"}</p>
          <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{item.description || ""}</p>
        </div>
      </div>
    );
  };

  // 7) Render a video card (for TV Shows, New Movies)
  const renderVideoCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <div
        key={index}
        onClick={() => handleSelectVideo(item.file_url)}
        style={{
          cursor: "pointer",
          width: "200px",
          flexShrink: 0,
          marginRight: "1rem",
        }}
      >
        <video controls preload="metadata" poster={item.thumbnail_url || ""} style={{ width: "100%", borderRadius: "4px" }}>
          <source src={item.file_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div style={{ marginTop: "0.5rem" }}>
          <p style={{ fontWeight: "bold", margin: 0 }}>{item.name || item.title || "Untitled"}</p>
          <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{item.description || ""}</p>
        </div>
      </div>
    );
  };

  // 8) Render a single festival item in the festival carousel
  const renderFestivalCarouselItem = (items: any[], index: number) => {
    if (!items || items.length === 0 || index < 0 || index >= items.length) return null;
    const festival = items[index];
    return (
      <div style={{ cursor: "pointer" }}>
        <div>
          <img
            src={festival.image_url || "/api/placeholder/400/200"}
            alt={festival.name || "Festival"}
            style={{ width: "100%", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <p style={{ fontWeight: "bold", margin: 0 }}>{festival.name || "Untitled Festival"}</p>
          <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{festival.description || ""}</p>
        </div>
      </div>
    );
  };

  // 9) Render a festival card (for grid display)
  const renderFestivalCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <div key={index} style={{ width: "200px", marginBottom: "1rem", marginRight: "1rem" }}>
        <img
          src={item.image_url || "/api/placeholder/400/200"}
          alt={item.name}
          style={{ width: "100%", borderRadius: "4px" }}
        />
        <p style={{ fontWeight: "bold", margin: "0.5rem 0 0" }}>{item.name || "Untitled Festival"}</p>
        <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{item.description || ""}</p>
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "radial-gradient(ellipse at center, #1a1a1a 0%, #000 100%)",
        color: "#fff",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      {/* UPDATED NAV BAR */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {/* Left side nav links - UPDATED with new navigation items */}
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link href="/userhome" style={{ color: "#fff", textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/found" style={{ color: "#fff", textDecoration: "none" }}>
            Discover
          </Link>
          <Link href="/invest" style={{ color: "#fff", textDecoration: "none" }}>
            Invest
          </Link>
          <Link href="/levels" style={{ color: "#fff", textDecoration: "none" }}>
            Upgrade
          </Link>
          <Link href="/reccomend" style={{ color: "#fff", textDecoration: "none" }}>
            Referral
          </Link>
          <Link href="/review" style={{ color: "#fff", textDecoration: "none" }}>
            Feedback
          </Link>
        </nav>
        {/* Sign Out button - renamed to "Signout" */}
        <Link
          href="/signin"
          style={{
            backgroundColor: "#e50914",
            border: "none",
            color: "#fff",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Signout
        </Link>
      </header>

      {/* Big VOD Player with cinematic dimensions (approx. 2.39:1 ratio) */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 1rem", fontSize: "2rem", letterSpacing: "0.05em" }}>
          Spotlight Theaters
        </h1>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1000px",
            height: 0,
            paddingBottom: "41.88%", // 2.39:1 ratio
            backgroundColor: "#000",
            margin: "0 auto",
            border: "8px solid #333",
            borderRadius: "8px",
            boxShadow: "0 0 20px rgba(0,0,0,0.8)",
          }}
        >
          {selectedVideoUrl ? (
            <video
              controls
              autoPlay
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            >
              <source src={selectedVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#aaa",
              }}
            >
              Click a video to start playing
            </div>
          )}
        </div>
      </div>

      {/* TV Shows Row */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>TV Shows</h2>
        {films.length > 0 ? (
          <div style={{ display: "flex", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {films.map((film, index) => renderVideoCard({ item: film, index }))}
          </div>
        ) : (
          <p style={{ color: "#ccc" }}>No TV shows added yet.</p>
        )}
      </div>

      {/* Short Films Carousel */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Short Films</h2>
        {shortFilms.length > 0 ? (
          <div>
            {/* Single item displayed (auto-rotating) */}
            <div style={{ maxWidth: "300px" }}>
              {renderVideoCarouselItem(shortFilms, shortFilmIndex)}
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <button
                style={{
                  backgroundColor: "#e50914",
                  border: "none",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  marginRight: "0.5rem",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigateCarousel(
                    "prev",
                    shortFilms,
                    shortFilmIndex,
                    setShortFilmIndex,
                    shortFilmIntervalRef
                  )
                }
              >
                Prev
              </button>
              <button
                style={{
                  backgroundColor: "#e50914",
                  border: "none",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigateCarousel(
                    "next",
                    shortFilms,
                    shortFilmIndex,
                    setShortFilmIndex,
                    shortFilmIntervalRef
                  )
                }
              >
                Next
              </button>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              {shortFilms.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (shortFilmIntervalRef.current) {
                      clearInterval(shortFilmIntervalRef.current);
                      shortFilmIntervalRef.current = null;
                    }
                    setShortFilmIndex(idx);
                    shortFilmIntervalRef.current = setInterval(() => {
                      setShortFilmIndex((prev) => (prev + 1) % shortFilms.length);
                    }, 5000);
                  }}
                  style={{
                    margin: "0 0.25rem",
                    background: idx === shortFilmIndex ? "#e50914" : "#333",
                    border: "none",
                    borderRadius: "50%",
                    width: "10px",
                    height: "10px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: "#ccc" }}>No short films yet.</p>
        )}
      </div>

      {/* New Movies Row */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>New Movies</h2>
        {newMovies.length > 0 ? (
          <div style={{ display: "flex", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {newMovies.map((film, index) => renderVideoCard({ item: film, index }))}
          </div>
        ) : (
          <p style={{ color: "#ccc" }}>No new movies added yet.</p>
        )}
      </div>

      {/* Film Festivals Carousel + Grid */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Film Festivals</h2>
        {festivals.length > 0 ? (
          <div>
            {/* Single item displayed (auto-rotating) */}
            <div style={{ maxWidth: "300px" }}>
              {renderFestivalCarouselItem(festivals, festivalIndex)}
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <button
                style={{
                  backgroundColor: "#e50914",
                  border: "none",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  marginRight: "0.5rem",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigateCarousel(
                    "prev",
                    festivals,
                    festivalIndex,
                    setFestivalIndex,
                    festivalIntervalRef
                  )
                }
              >
                Prev
              </button>
              <button
                style={{
                  backgroundColor: "#e50914",
                  border: "none",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigateCarousel(
                    "next",
                    festivals,
                    festivalIndex,
                    setFestivalIndex,
                    festivalIntervalRef
                  )
                }
              >
                Next
              </button>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              {festivals.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (festivalIntervalRef.current) {
                      clearInterval(festivalIntervalRef.current);
                      festivalIntervalRef.current = null;
                    }
                    setFestivalIndex(idx);
                    festivalIntervalRef.current = setInterval(() => {
                      setFestivalIndex((prev) => (prev + 1) % festivals.length);
                    }, 5000);
                  }}
                  style={{
                    margin: "0 0.25rem",
                    background: idx === festivalIndex ? "#e50914" : "#333",
                    border: "none",
                    borderRadius: "50%",
                    width: "10px",
                    height: "10px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            <hr style={{ margin: "1rem 0" }} />
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Upcoming Film Festivals</h3>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {festivals.map((festival, index) => renderFestivalCard({ item: festival, index }))}
            </div>
          </div>
        ) : (
          <p style={{ color: "#ccc" }}>No film festivals added yet.</p>
        )}
      </div>
    </div>
  );
}