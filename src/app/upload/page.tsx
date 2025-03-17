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
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!uploadedFile) return

    try {
      // 1) Generate a unique file name to avoid collisions
      const fileName = `${Date.now()}-${uploadedFile.name}`

      // 2) Define the upload path (adjust folder name if needed)
      const path = `film_uploads/${fileName}`

      // 3) Upload the file to the "film_uploads" bucket
      const { data, error } = await supabase.storage
        .from("film_uploads")
        .upload(path, uploadedFile)

      if (error) throw error
      console.log("File uploaded:", data.path)

      // 4) Get a public URL (or signed URL) to store in the DB
      const { data: urlData } = supabase.storage
        .from("film_uploads")
        .getPublicUrl(data.path)

      // 5) (Optional) Get the current user from Supabase Auth
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      // 6) Insert metadata into your table, including the film URL in the file_url column
      const { error: insertError } = await supabase
        .from("film_uploads")
        .insert({
          // Adjust these column names as needed:
          title: title || uploadedFile.name, // fallback to filename
          description: description || "",
          genre: genre || "",
          duration: duration ? parseInt(duration) : null,
          release_date: releaseDate || null,
          upload_date: new Date().toISOString(),
          file_url: urlData.publicUrl, // This is the film URL from the storage bucket
          user_id: userId,
          thumbnail_url: null, // Update later if needed
          status: "pending"
        })

      if (insertError) {
        console.error("Error saving film data:", insertError)
      } else {
        console.log("Film data saved to the 'film_uploads' table")
        // Clear the form
        setTitle("")
        setDescription("")
        setGenre("")
        setDuration("")
        setReleaseDate("")
        setUploadedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  const handleBackToDashboard = () => {
    // Navigate back to the dashboard
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
      <div>
        <button
          onClick={handleBackToDashboard}
          className="absolute top-4 right-4 text-white bg-blue-600 px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
