"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"
import { Search, Filter, MoreHorizontal, Eye, DollarSign, Award, Calendar, MapPin, Users } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

export default function FilmHubPage() {
  const [films, setFilms] = useState<any[]>([])
  const [shortFilms, setShortFilms] = useState<any[]>([])
  const [festivals, setFestivals] = useState<any[]>([])
  const [newMovies, setNewMovies] = useState<any[]>([])

  const [shortFilmIndex, setShortFilmIndex] = useState(0)
  const shortFilmIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [festivalIndex, setFestivalIndex] = useState(0)
  const festivalIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ----------------------------------------------------------------
  // 1) Fetch your data from the DB – corrected table names
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TV Shows
        const { data: filmsData, error: filmsError } = await supabase
          .from("tv_shows")
          .select("*")
        if (filmsError) console.error("Error fetching TV Shows:", filmsError)
        else setFilms(filmsData || [])

        // New Movies
        const { data: newMoviesData, error: newMoviesError } = await supabase
          .from("new_movies")
          .select("*")
        if (newMoviesError) console.error("Error fetching New Movies:", newMoviesError)
        else setNewMovies(newMoviesData || [])

        // Short Films - updated to use new_shorts table
        const { data: shortFilmsData, error: shortFilmsError } = await supabase
          .from("short_films")
          .select("*")
        if (shortFilmsError) console.error("Error fetching Short Films:", shortFilmsError)
        else setShortFilms(shortFilmsData || [])

        // Film Festivals remain unchanged
        const { data: festivalsData, error: festivalsError } = await supabase
          .from("film_festivals")
          .select("*")
        if (festivalsError) console.error("Error fetching Film Festivals:", festivalsError)
        else setFestivals(festivalsData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
      }
    }
    fetchData()
  }, [])

  // Auto-rotation logic remains the same
  useEffect(() => {
    if (shortFilmIntervalRef.current) {
      clearInterval(shortFilmIntervalRef.current)
      shortFilmIntervalRef.current = null
    }
    if (shortFilms.length > 0) {
      shortFilmIntervalRef.current = setInterval(() => {
        setShortFilmIndex((prev) => (prev + 1) % shortFilms.length)
      }, 5000)
    }
    return () => {
      if (shortFilmIntervalRef.current) {
        clearInterval(shortFilmIntervalRef.current)
        shortFilmIntervalRef.current = null
      }
    }
  }, [shortFilms])

  useEffect(() => {
    if (festivalIntervalRef.current) {
      clearInterval(festivalIntervalRef.current)
      festivalIntervalRef.current = null
    }
    if (festivals.length > 0) {
      festivalIntervalRef.current = setInterval(() => {
        setFestivalIndex((prev) => (prev + 1) % festivals.length)
      }, 5000)
    }
    return () => {
      if (festivalIntervalRef.current) {
        clearInterval(festivalIntervalRef.current)
        festivalIntervalRef.current = null
      }
    }
  }, [festivals])

  // Navigation function remains the same
  const navigateCarousel = (
    direction: "prev" | "next",
    items: any[],
    currentIndex: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    intervalRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (items.length === 0) return
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (direction === "prev") {
      setIndex((prev) => (prev - 1 + items.length) % items.length)
    } else {
      setIndex((prev) => (prev + 1) % items.length)
    }
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, 5000)
  }

  // ----------------------------------------------------------------
  // 5) Improved carousel item with proper video handling for short films
  // ----------------------------------------------------------------
  const renderVideoCarouselItem = (items: any[], index: number) => {
    if (!items || items.length === 0 || index < 0 || index >= items.length) return null
    const item = items[index]
    
    // Check if file_url exists and is not empty
    if (!item.file_url) {
      console.error("Missing file_url for item:", item)
      return null
    }
    
    return (
      <div className="w-full transition-all duration-500 ease-in-out">
        <Card className="overflow-hidden rounded-lg shadow-md border">
          {/* Updated video element with better fallback handling */}
          <video 
            controls 
            className="w-full aspect-video object-cover" 
            preload="metadata"
            poster={item.thumbnail_url || ""}
          >
            <source src={item.file_url} type="video/mp4" />
            <source src={item.file_url} type="video/webm" />
            <source src={item.file_url} type="video/x-matroska" />
            Your browser does not support the video tag.
          </video>
          <CardHeader className="p-4">
            <CardTitle className="line-clamp-1 font-semibold">{item.name || item.title || "Untitled"}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{item.year || ""}</span>
              {item.duration && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.duration}</span>
                </>
              )}
              {item.genre && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.genre}</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm">
            <p className="line-clamp-2 text-muted-foreground">
              {item.description || ""}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground">
                  <Eye className="mr-1 h-3 w-3" />
                  <span>Views</span>
                </div>
                <span className="font-medium">{item.views || "0"}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="mr-1 h-3 w-3" />
                  <span>Revenue</span>
                </div>
                <span className="font-medium">{item.revenue || "$0"}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground">
                  <Award className="mr-1 h-3 w-3" />
                  <span>Awards</span>
                </div>
                <span className="font-medium">{item.awards || "0"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // NEW: Festival carousel item that displays event information
  // ----------------------------------------------------------------
  const renderFestivalCarouselItem = (items: any[], index: number) => {
    if (!items || items.length === 0 || index < 0 || index >= items.length) return null
    const festival = items[index]
    
    return (
      <div className="w-full transition-all duration-500 ease-in-out">
        <Card className="overflow-hidden rounded-lg shadow-md border">
          {/* Festival image instead of video */}
          <div className="relative">
            <img 
              src={festival.image_url || "/api/placeholder/400/200"} 
              alt={festival.name || "Festival"} 
              className="w-full aspect-video object-cover"
            />
            {festival.status && (
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                festival.status === "Open" ? "bg-green-500 text-white" : 
                festival.status === "Coming Soon" ? "bg-yellow-500 text-black" : 
                "bg-red-500 text-white"
              }`}>
                {festival.status}
              </div>
            )}
          </div>
          <CardHeader className="p-4">
            <CardTitle className="line-clamp-1 font-semibold">{festival.name || "Untitled Festival"}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{festival.location || ""}</span>
              {festival.date_range && (
                <>
                  <span className="mx-2">•</span>
                  <span>{festival.date_range}</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm">
            <p className="line-clamp-2 text-muted-foreground">
              {festival.description || ""}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>Deadline</span>
                </div>
                <span className="font-medium">{festival.submission_deadline || "N/A"}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span>Venue</span>
                </div>
                <span className="font-medium">{festival.venue || "TBA"}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-1 h-3 w-3" />
                  <span>Attendees</span>
                </div>
                <span className="font-medium">{festival.attendees || "N/A"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button variant="outline" size="sm">
              {festival.status === "Open" ? "Submit Film" : "View Details"}
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // Updated video rendering for grid items
  // ----------------------------------------------------------------
  interface VideoItem {
    file_url: string;
    thumbnail_url?: string;
    name?: string;
    title?: string;
    year?: string;
    duration?: string;
    genre?: string;
    views?: string | number;
    revenue?: string;
    awards?: string | number;
  }

  interface VideoCardProps {
    item: VideoItem;
    index: number;
  }

  const renderVideoCard = ({ item, index }: VideoCardProps): React.ReactElement => {
    return (
      <Card key={index} className="overflow-hidden rounded-lg shadow-md border">
        <video 
          controls 
          className="w-full aspect-[3/4] object-cover" 
          preload="metadata"
          poster={item.thumbnail_url || ""}
        >
          <source src={item.file_url} type="video/mp4" />
          <source src={item.file_url} type="video/webm" />
          <source src={item.file_url} type="video/x-matroska" />
          Your browser does not support the video tag.
        </video>
        <CardHeader className="p-4">
          <CardTitle className="line-clamp-1 font-semibold">{item.name || item.title || "Untitled"}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{item.year || ""}</span>
            {item.duration && (
              <>
                <span className="mx-2">•</span>
                <span>{item.duration}</span>
              </>
            )}
            {item.genre && (
              <>
                <span className="mx-2">•</span>
                <span>{item.genre}</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm">
          <div className="grid grid-cols-3 gap-7 text-sm">
            <div className="flex flex-col items-center">
              <div className="flex items-center text-muted-foreground">
                <Eye className="mr-1 h-3 w-3" />
                <span>Views</span>
              </div>
              <span className="font-medium">{item.views || "0"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="mr-1 h-3 w-3" />
                <span>Revenue</span>
              </div>
              <span className="font-medium">{item.revenue || "$0"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-muted-foreground">
                <Award className="mr-1 h-3 w-3" />
                <span>Awards</span>
              </div>
              <span className="font-medium">{item.awards || "0"}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // ----------------------------------------------------------------
  // NEW: Festival Card component for grid display
  // ----------------------------------------------------------------
  interface FestivalItem {
    name: string;
    image_url?: string;
    location?: string;
    date_range?: string;
    description?: string;
    submission_deadline?: string;
    venue?: string;
    attendees?: string | number;
    status?: string;
    category?: string;
  }

  interface FestivalCardProps {
    item: FestivalItem;
    index: number;
  }

  const renderFestivalCard = ({ item, index }: FestivalCardProps): React.ReactElement => {
    return (
      <Card key={index} className="overflow-hidden rounded-lg shadow-md border">
        <div className="relative">
          <img 
            src={item.image_url || "/api/placeholder/400/200"} 
            alt={item.name} 
            className="w-full h-48 object-cover" 
          />
          {item.status && (
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
              item.status === "Open" ? "bg-green-500 text-white" : 
              item.status === "Coming Soon" ? "bg-yellow-500 text-black" : 
              "bg-red-500 text-white"
            }`}>
              {item.status}
            </div>
          )}
        </div>
        <CardHeader className="p-4">
          <CardTitle className="line-clamp-1 font-semibold">{item.name || "Untitled Festival"}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{item.location || ""}</span>
            {item.date_range && (
              <>
                <span className="mx-2">•</span>
                <span>{item.date_range}</span>
              </>
            )}
            {item.category && (
              <>
                <span className="mx-2">•</span>
                <span>{item.category}</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm">
          <p className="line-clamp-2 text-muted-foreground mb-4">
            {item.description || ""}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                <span>Deadline</span>
              </div>
              <span className="font-medium">{item.submission_deadline || "N/A"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                <span>Venue</span>
              </div>
              <span className="font-medium">{item.venue || "TBA"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-1 h-3 w-3" />
                <span>Attendees</span>
              </div>
              <span className="font-medium">{item.attendees || "N/A"}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button variant="outline" size="sm">
            {item.status === "Open" ? "Submit Film" : "View Details"}
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // ----------------------------------------------------------------
  // The main UI
  // ----------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6">
        <div className="text-2xl font-bold mb-6">FilmHub</div>
        <nav>
          <ul className="space-y-4">
            <li><a href="/hub" className="block text-lg">Movie Studio</a></li>
            <li><a href="/upload" className="block text-lg">Upload Your Film</a></li>
            <li><a href="/upcoming" className="block text-lg">Upload Upcoming Releases</a></li>
            <li><a href="/shorturl" className="block text-lg">Upload Short Film</a></li>
            <li><a href="/tvurl" className="block text-lg">Upload Tv Show</a></li>
            <li><a href="/insight" className="block text-lg">Analytics & Insights</a></li>
            <li><a href="/submission" className="block text-lg">Host Your Film Festival</a></li>
            <li><a href="/tax" className="block text-lg">Taxes & Documents</a></li>
            <li><a href="/upgrade" className="block text-lg">Upgrade your plan</a></li>
            <li><a href="/payments" className="block text-lg">Wallet and Payments</a></li>
            <li><a href="/referrals" className="block text-lg">Referrals and More!!</a></li>
            <li><a href="/feedback" className="block text-lg">Feedback to improve App</a></li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Studio</h1>
            <div>
              <Button className="bg-primary text-white rounded-lg">
                <a href="/signin" className="block text-lg">Sign Out</a>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="text" placeholder="Search titles..." className="flex-1" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">Sort by: Recent</Button>
            </div>
          </div>

          {/* TV Shows section displayed by default */}
          <div>
            <h2 className="text-xl font-bold mb-4">TV Shows</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {films.length > 0 ? (
                films.map((film, index) => renderVideoCard({ item: film, index }))
              ) : (
                <div className="col-span-full bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-lg text-gray-600">No TV shows added yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add your first TV show to see it here</p>
                </div>
              )}
            </div>
          </div>

          {/* Short Films */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Short Films</h2>
            <div className="relative">
              {shortFilms.length > 0 ? (
                <>
                  {renderVideoCarouselItem(shortFilms, shortFilmIndex)}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/70 ml-2"
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
                      <span className="text-lg font-bold">←</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/70 mr-2"
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
                      <span className="text-lg font-bold">→</span>
                    </Button>
                  </div>
                  <div className="flex justify-center mt-4">
                    {shortFilms.map((_, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="icon"
                        className={`h-2 w-2 rounded-full mx-1 ${idx === shortFilmIndex ? "bg-primary" : "bg-gray-300"}`}
                        onClick={() => {
                          if (shortFilmIntervalRef.current) {
                            clearInterval(shortFilmIntervalRef.current)
                            shortFilmIntervalRef.current = null
                          }
                          setShortFilmIndex(idx)
                          shortFilmIntervalRef.current = setInterval(() => {
                            setShortFilmIndex((prev) => (prev + 1) % shortFilms.length)
                          }, 5000)
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-lg text-gray-600">No short films yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add your first short film to see it here</p>
                </div>
              )}
            </div>
          </div>

          {/* New Movies */}
          <div>
            <h2 className="text-xl font-bold mb-4">New Movies</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {newMovies.length > 0 ? (
                newMovies.map((film, index) => renderVideoCard({ item: film, index }))
              ) : (
                <div className="col-span-full bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-lg text-gray-600">No new movies added yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add your first movie to see it here</p>
                </div>
              )}
            </div>
          </div>

          {/* Film Festivals */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Film Festivals</h2>
            <div className="relative">
              {festivals.length > 0 ? (
                <>
                  {renderFestivalCarouselItem(festivals, festivalIndex)}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/70 ml-2"
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
                      <span className="text-lg font-bold">←</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/70 mr-2"
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
                      <span className="text-lg font-bold">→</span>
                    </Button>
                  </div>
                  <div className="flex justify-center mt-4">
                    {festivals.map((_, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="icon"
                        className={`h-2 w-2 rounded-full mx-1 ${idx === festivalIndex ? "bg-primary" : "bg-gray-300"}`}
                        onClick={() => {
                          if (festivalIntervalRef.current) {
                            clearInterval(festivalIntervalRef.current)
                            festivalIntervalRef.current = null
                          }
                          setFestivalIndex(idx)
                          festivalIntervalRef.current = setInterval(() => {
                            setFestivalIndex((prev) => (prev + 1) % festivals.length)
                          }, 5000)
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-lg text-gray-600">No film festivals added yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add your first film festival to see it here</p>
                </div>
              )}
            </div>
            
            {festivals.length > 0 && (
              <>
                <h2 className="text-xl font-bold mb-4 mt-8">Upcoming Film Festivals</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {festivals.map((festival, index) => renderFestivalCard({ item: festival, index }))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}