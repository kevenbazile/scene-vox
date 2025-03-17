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
      // 1) Create a unique file path in the "new_releases" folder of the "film_uploads" bucket
      const filePath = `new_releases/${Date.now()}-${uploadedFile.name}`

      // 2) Upload the file to the "film_uploads" bucket at the "new_releases" subfolder
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("film_uploads")
        .upload(filePath, uploadedFile)

      if (uploadError) {
        throw uploadError
      }
      console.log("File uploaded:", uploadData?.path)

      // 3) Get a public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("film_uploads")
        .getPublicUrl(filePath)

      // 4) (Optional) Get the current user if needed
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      // 5) Insert metadata into the "new_movies" table,
      // including the file_url generated from the public URL.
      const { error: insertError } = await supabase
        .from("new_movies")
        .insert({
          title: title || uploadedFile.name, // fallback to file name
          description: description || "",
          genre: genre || "",
          duration: duration ? parseInt(duration) : null,
          release_date: releaseDate || null,
          upload_date: new Date().toISOString(),
          file_url: urlData?.publicUrl, // file URL from storage
          thumbnail_url: null,          // update later if needed
          status: "pending",
          // user_id: userId,           // uncomment if you track who uploaded the film
        })

      if (insertError) {
        console.error("Error saving film data:", insertError)
      } else {
        console.log("Film data saved to 'new_movies' table successfully.")
        // Reset the form fields
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
