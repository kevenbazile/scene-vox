"use client"

import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

export default function AnalyticsPage() {
  // --- Existing Data States ---
  const [tvmazeData, setTvmazeData] = useState<any[]>([])
  const [popularShows, setPopularShows] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<
    { name: string; [key: string]: number | string }[]
  >([])
  const [sortMetric, setSortMetric] = useState("rating")

  // --- Tab State for Entertainment Section ---
  const [activeTab, setActiveTab] = useState("news") // "news" or "game"
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [favorites, setFavorites] = useState<{ [key: number]: number }>({})

  // --- Game State for "Best Films" Quiz ---
  const [gameOptions, setGameOptions] = useState<any[]>([])
  const [correctAnswer, setCorrectAnswer] = useState<any | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<any | null>(null)
  const [gameResult, setGameResult] = useState<string>("")

  // --- Courses Module States (Filmmaker Courses) ---
  const [courseTab, setCourseTab] = useState("available")
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [completedCourses, setCompletedCourses] = useState<number[]>([])

  // Pool of questions for each course level
  const moduleQuestionsPool: {
    [key: string]: { question: string; options: string[]; correctAnswer: string }[]
  } = {
    Beginner: [
      {
        question: "What is the primary purpose of a storyboard in filmmaking?",
        options: ["Plan shots", "Develop script", "Choose location", "Edit film"],
        correctAnswer: "Plan shots",
      },
      {
        question: "What does a screenplay primarily provide?",
        options: ["Dialogue and actions", "Lighting design", "Camera angles", "Sound design"],
        correctAnswer: "Dialogue and actions",
      },
    ],
    Intermediate: [
      {
        question: "Which element is critical for maintaining continuity during editing?",
        options: ["Color grading", "Continuity", "Costume design", "Sound mixing"],
        correctAnswer: "Continuity",
      },
      {
        question: "What is a key benefit of using a green screen?",
        options: ["Flexible backgrounds", "Improved sound", "Lower budget", "Faster shooting"],
        correctAnswer: "Flexible backgrounds",
      },
    ],
    Expert: [
      {
        question: "What is the main function of color grading in post-production?",
        options: ["Enhance mood", "Script development", "Plan locations", "Direct actors"],
        correctAnswer: "Enhance mood",
      },
      {
        question: "Which aspect is essential in establishing a director's visual style?",
        options: ["Camera movement", "Budget management", "Script length", "Acting performance"],
        correctAnswer: "Camera movement",
      },
    ],
  }

  // State for the quiz within a selected course
  const [moduleQuestionsList, setModuleQuestionsList] = useState<
    { question: string; options: string[]; correctAnswer: string }[]
  >([])
  const [moduleCurrentQuestionIndex, setModuleCurrentQuestionIndex] = useState(0)
  const [moduleFeedback, setModuleFeedback] = useState("")

  // Fetch data from TV Maze
  useEffect(() => {
    const fetchTVMazeData = async () => {
      try {
        const url = "https://api.tvmaze.com/shows?page=1"
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error("Failed to fetch TV Maze data.")
        }
        const data = await res.json()
        setTvmazeData(data)
        setPopularShows(data)
      } catch (error) {
        console.error("Error fetching TV Maze data:", error)
      }
    }
    fetchTVMazeData()
  }, [])

  // Build chart data whenever tvmazeData or sortMetric changes
  useEffect(() => {
    const chartData = [...tvmazeData]
      .sort((a, b) => {
        if (sortMetric === "rating") {
          return (b.rating?.average || 0) - (a.rating?.average || 0)
        } else {
          return (b.runtime || 0) - (a.runtime || 0)
        }
      })
      .slice(0, 7)
      .map((show: any) => ({
        name: show.name,
        [sortMetric]:
          sortMetric === "rating"
            ? (show.rating?.average || 0)
            : (show.runtime || 0),
      }))
    setAnalyticsData(chartData)
  }, [tvmazeData, sortMetric])

  // Generate "Best Films" quiz question
  useEffect(() => {
    if (activeTab === "game") {
      generateGameQuestion()
    }
  }, [activeTab, tvmazeData])

  const generateGameQuestion = () => {
    if (tvmazeData.length < 3) return
    const indices = new Set<number>()
    while (indices.size < 3) {
      indices.add(Math.floor(Math.random() * tvmazeData.length))
    }
    const options = Array.from(indices).map((i) => tvmazeData[i])
    let maxRating = -Infinity
    let correct = null
    for (const show of options) {
      const rating = show.rating?.average || 0
      if (rating > maxRating) {
        maxRating = rating
        correct = show
      }
    }
    setGameOptions(options)
    setCorrectAnswer(correct)
    setSelectedAnswer(null)
    setGameResult("")
  }

  const handleGameAnswer = (show: any) => {
    setSelectedAnswer(show)
    if (correctAnswer && show.id === correctAnswer.id) {
      setGameResult("Correct! Great job.")
    } else {
      setGameResult(`Incorrect. The correct answer was "${correctAnswer?.name}".`)
    }
  }

  // Timer effect for locked courses
  useEffect(() => {
    const timer = setInterval(() => {
      setCourseList((prev) =>
        prev.map((course) => {
          if (!course.unlocked && course.unlockTimer > 0) {
            const newTimer = course.unlockTimer - 1
            return { ...course, unlockTimer: newTimer, unlocked: newTimer <= 0 }
          }
          return course
        })
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Initial courses
  const initialCourses = [
    {
      id: 1,
      title: "Filmmaking Basics",
      description: "Introduction to filmmaking fundamentals.",
      level: "Beginner",
      unlocked: true,
      unlockTimer: 0,
      content: "Module content for Filmmaking Basics.",
    },
    {
      id: 2,
      title: "Advanced Techniques",
      description: "Learn advanced filmmaking techniques.",
      level: "Intermediate",
      unlocked: false,
      unlockTimer: 30,
      content: "Module content for Advanced Techniques.",
    },
    {
      id: 3,
      title: "Masterclass in Filmmaking",
      description: "Expert strategies for filmmaking.",
      level: "Expert",
      unlocked: false,
      unlockTimer: 60,
      content: "Module content for Masterclass in Filmmaking.",
    },
  ]
  const [courseList, setCourseList] = useState(initialCourses)

  // Start a course
  const handleStartCourse = (course: any) => {
    if (course.unlocked) {
      setSelectedCourse(course)
      const shuffled = [...moduleQuestionsPool[course.level]].sort(() => Math.random() - 0.5)
      setModuleQuestionsList(shuffled)
      setModuleCurrentQuestionIndex(0)
      setModuleFeedback("")
    }
  }

  // Mark a course as completed
  const handleMarkCompleted = () => {
    if (selectedCourse) {
      setCompletedCourses((prev) => [...prev, selectedCourse.id])
      setSelectedCourse(null)
    }
  }

  // Retake a course
  const handleRetakeCourse = (course: any) => {
    setCompletedCourses((prev) => prev.filter((id) => id !== course.id))
    setCourseList((prev) =>
      prev.map((c) => {
        if (c.id === course.id) {
          const newTimer = c.level === "Intermediate" ? 30 : c.level === "Expert" ? 60 : 0
          return { ...c, unlocked: newTimer === 0, unlockTimer: newTimer }
        }
        return c
      })
    )
  }

  // Move to next question in the course
  const handleNextModuleQuestion = () => {
    if (moduleCurrentQuestionIndex < moduleQuestionsList.length - 1) {
      setModuleCurrentQuestionIndex(moduleCurrentQuestionIndex + 1)
      setModuleFeedback("")
    }
  }

  // Answer the current question
  const handleModuleAnswer = (option: string) => {
    const currentQuestion = moduleQuestionsList[moduleCurrentQuestionIndex]
    if (option === currentQuestion.correctAnswer) {
      setModuleFeedback("Correct!")
    } else {
      setModuleFeedback("Incorrect. Please try again.")
    }
  }

  // Navigation & File Download
  const handleBackToDashboard = () => {
    window.location.href = "/hub"
  }
  const downloadCourseOutline = () => {
    window.open("https://example.com/course_outline.pdf", "_blank")
  }

  // Handle metric change for the chart
  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortMetric(e.target.value)
  }

  // Favorite a show
  const handleFavorite = (showId: number) => {
    setFavorites((prev) => {
      const count = prev[showId] || 0
      return { ...prev, [showId]: count + 1 }
    })
  }

  // Genre filtering
  const allGenres = Array.from(new Set(tvmazeData.flatMap((show) => show.genres || [])))
  const filteredShows =
    selectedGenre === "All"
      ? popularShows
      : popularShows.filter((show) => show.genres && show.genres.includes(selectedGenre))

  return (
    <div className="relative p-4 custom-bg">
      <button
        onClick={handleBackToDashboard}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

      {/* Metric Selector and PDF Download */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <label htmlFor="metric" className="mr-2 font-medium">
            Select Metric:
          </label>
          <select
            id="metric"
            value={sortMetric}
            onChange={handleMetricChange}
            className="border border-gray-300 rounded p-1"
          >
            <option value="rating">Rating</option>
            <option value="runtime">Runtime</option>
          </select>
        </div>

      </div>

      {/* Chart and Entertainment */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Chart Area */}
        <div className="md:w-2/3 bg-white border rounded p-4 shadow-md h-96 chart-container">
          <h2 className="text-lg font-semibold mb-2">
            Show {sortMetric === "rating" ? "Rating" : "Runtime"}
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={sortMetric}
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Entertainment Section */}
        <aside className="md:w-1/3 bg-white border rounded p-4 shadow-md h-96 overflow-auto">
          <div className="mb-4 flex space-x-4">
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "news"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setActiveTab("news")}
            >
              Entertainment News
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "game"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setActiveTab("game")}
            >
              Best Films
            </button>
          </div>

          {activeTab === "news" ? (
            <>
              <div className="mb-4">
                <label htmlFor="genre" className="mr-2 font-medium">
                  Filter by Genre:
                </label>
                <select
                  id="genre"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="border border-gray-300 rounded p-1"
                >
                  <option value="All">All</option>
                  {allGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              <h2 className="text-lg font-semibold mb-2">TV Shows</h2>
              {filteredShows.length > 0 ? (
                <ul className="space-y-3">
                  {filteredShows.map((show) => (
                    <li key={show.id} className="border-b pb-2 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{show.name}</div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleFavorite(show.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ♥
                          </button>
                          <span className="text-sm text-gray-600">
                            {favorites[show.id] || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {sortMetric === "rating"
                          ? `Rating: ${
                              show.rating?.average
                                ? show.rating.average.toFixed(1)
                                : "N/A"
                            }`
                          : `Runtime: ${
                              show.runtime ? show.runtime + " min" : "N/A"
                            }`}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {show.summary
                          ? show.summary.replace(/<[^>]+>/g, "")
                          : "No summary available."}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No shows available right now.
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">Guess the Best Film!</h2>
              {gameOptions.length > 0 ? (
                <div className="space-y-4">
                  <p className="mb-2">Which show has the highest rating?</p>
                  <div className="flex flex-col space-y-2">
                    {gameOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleGameAnswer(option)}
                        className="border rounded p-2 text-left hover:bg-gray-100"
                        disabled={!!selectedAnswer}
                      >
                        {option.name} - Rating:{" "}
                        {option.rating?.average || "N/A"}
                      </button>
                    ))}
                  </div>
                  {selectedAnswer && (
                    <div>
                      <p className="font-medium">{gameResult}</p>
                      <button
                        onClick={generateGameQuestion}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Next Question
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading game question...</p>
              )}
            </>
          )}
        </aside>
      </div>

      {/* Filmmaker Courses Module */}
      <div className="mt-6 bg-white border rounded p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Filmmaker Courses</h2>
        <div className="mb-4 flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              courseTab === "available"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setCourseTab("available")}
          >
            Available Courses
          </button>
          <button
            className={`px-4 py-2 rounded ${
              courseTab === "completed"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setCourseTab("completed")}
          >
            Completed Courses
          </button>
        </div>
        {courseTab === "available" ? (
          <>
            {courseList.filter((course) => !completedCourses.includes(course.id))
              .length > 0 ? (
              <ul className="space-y-3">
                {courseList
                  .filter((course) => !completedCourses.includes(course.id))
                  .map((course) => (
                    <li key={course.id} className="border-b pb-2 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {course.title} ({course.level})
                          </div>
                          <div className="text-sm text-gray-600">
                            {course.description}
                          </div>
                        </div>
                        {course.unlocked ? (
                          <button
                            onClick={() => handleStartCourse(course)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          >
                            Start
                          </button>
                        ) : (
                          <span className="text-sm text-gray-600">
                            Unlocks in: {course.unlockTimer} sec
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No available courses at the moment.
              </p>
            )}
          </>
        ) : (
          <>
            {courseList.filter((course) => completedCourses.includes(course.id))
              .length > 0 ? (
              <ul className="space-y-3">
                {courseList
                  .filter((course) => completedCourses.includes(course.id))
                  .map((course) => (
                    <li key={course.id} className="border-b pb-2 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {course.title} ({course.level})
                        </div>
                        <button
                          onClick={() => handleRetakeCourse(course)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition"
                        >
                          Retake
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No completed courses yet.</p>
            )}
          </>
        )}

        {/* Selected Course: Quiz Module */}
        {selectedCourse && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">
              {selectedCourse.title} - {selectedCourse.level}
            </h3>
            {moduleQuestionsList.length > 0 &&
            moduleCurrentQuestionIndex < moduleQuestionsList.length ? (
              <div>
                <p className="mb-2">
                  {moduleQuestionsList[moduleCurrentQuestionIndex].question}
                </p>
                <div className="flex flex-col space-y-2">
                  {moduleQuestionsList[moduleCurrentQuestionIndex].options.map(
                    (option) => (
                      <button
                        key={option}
                        onClick={() => handleModuleAnswer(option)}
                        className="border rounded p-2 text-left hover:bg-gray-100"
                        disabled={moduleFeedback === "Correct!"}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
                {moduleFeedback && (
                  <p className="mt-2 font-medium">{moduleFeedback}</p>
                )}
                {moduleFeedback === "Correct!" && (
                  <div className="mt-2">
                    {moduleCurrentQuestionIndex <
                    moduleQuestionsList.length - 1 ? (
                      <button
                        onClick={() => {
                          setModuleCurrentQuestionIndex(
                            moduleCurrentQuestionIndex + 1
                          )
                          setModuleFeedback("")
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleMarkCompleted}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {moduleQuestionsList.length === 0
                  ? "Loading module questions..."
                  : "Course completed. You may retake the course."}
              </p>
            )}
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => {
                  // Retake course: re-randomize questions from the pool
                  const shuffled = [
                    ...moduleQuestionsPool[selectedCourse.level],
                  ].sort(() => Math.random() - 0.5)
                  setModuleQuestionsList(shuffled)
                  setModuleCurrentQuestionIndex(0)
                  setModuleFeedback("")
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Retake Course
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filmmaker Quick Tools */}
      <div className="mt-6 bg-white border rounded p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Filmmaker Quick Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <a
            href="https://www.finaldraft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded hover:bg-gray-100 transition shadow-sm"
          >
            Scriptwriting Software
          </a>
          <a
            href="https://www.celtx.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded hover:bg-gray-100 transition shadow-sm"
          >
            Pre-Production Planning
          </a>
          <a
            href="https://www.moviemaker.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded hover:bg-gray-100 transition shadow-sm"
          >
            Filmmaking Tips
          </a>
          <a
            href="https://www.filmindependent.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded hover:bg-gray-100 transition shadow-sm"
          >
            Indie Film Resources
          </a>
          <a
            href="https://www.videoblocks.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded hover:bg-gray-100 transition shadow-sm"
          >
            Stock Footage & Music
          </a>
          <a
            href="https://www.imdb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded hover:bg-gray-100 transition shadow-sm"
          >
            IMDb Insights
          </a>
        </div>
      </div>
    </div>
  )
}
