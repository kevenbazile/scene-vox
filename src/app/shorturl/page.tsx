"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function FilmHubPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [genre, setGenre] = useState("")
  const [duration, setDuration] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!uploadedFile) return

    try {
      // 1) Create a unique file path in "new_shorts" folder
      const filePath = `new_shorts/${Date.now()}-${uploadedFile.name}`

      // 2) Upload to the "film_uploads" bucket at the "new_shorts" path
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("film_uploads")
        .upload(filePath, uploadedFile)

      if (uploadError) {
        throw uploadError
      }
      console.log("File uploaded:", uploadData?.path)

      // 3) Generate a public URL for the file
      const { data: urlData } = supabase.storage
        .from("film_uploads")
        .getPublicUrl(filePath)

      // 4) (Optional) Get current user info to associate with the film
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id  // If you want to store user_id

      // 5) Insert metadata into "short_films" table
      const { error: insertError } = await supabase
        .from("short_films")
        .insert({
          title: title || uploadedFile.name, // fallback to filename
          description: description || "",
          genre: genre || "",
          duration: duration ? parseInt(duration) : null,
          release_date: releaseDate || null,
          upload_date: new Date().toISOString(),
          file_url: urlData?.publicUrl,
          thumbnail_url: null, // update later if needed
          status: "pending",
          // user_id: userId, // uncomment if you have a user_id column
        })

      if (insertError) {
        console.error("Error saving film data:", insertError)
      } else {
        console.log("Film data saved to 'short_films' table successfully.")

        // 6) Reset the form
        setTitle("")
        setDescription("")
        setGenre("")
        setDuration("")
        setReleaseDate("")
        setUploadedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  const handleBackToDashboard = () => {
    window.location.href = "/hub"
  }

  return (
    <div>
      <h1>Upload Film</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Film title"
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Film description"
          />
        </div>
        <div>
          <label htmlFor="genre">Genre</label>
          <input
            id="genre"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
          />
        </div>
        <div>
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration in minutes"
          />
        </div>
        <div>
          <label htmlFor="releaseDate">Release Date</label>
          <input
            id="releaseDate"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="file">Film File</label>
          <input
            id="file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        <Button onClick={handleSubmit} disabled={!uploadedFile}>
          Upload Film
        </Button>
      </div>
      <button
        onClick={handleBackToDashboard}
        className="absolute top-4 right-4 text-white bg-blue-600 px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Back to Dashboard
      </button>
    </div>
  )
}
