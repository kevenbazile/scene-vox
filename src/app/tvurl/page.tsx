// /app/upload/page.tsx
"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Link } from "lucide-react"

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
    try {
      if (uploadedFile) {
        const fileName = `${Date.now()}-${uploadedFile.name}`
        const { data, error } = await supabase.storage.from('film_uploads').upload(fileName, uploadedFile)

        if (error) throw error

        console.log("File uploaded:", data.path)
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('film_uploads')
          .getPublicUrl(data.path)
          
        // Get the current user
        const { data: userData } = await supabase.auth.getUser()
        
        // Insert into your existing film_uploads table with the correct columns
        const { error: insertError } = await supabase
          .from('tv_shows')
          .insert({
            title: title || uploadedFile.name, // Use filename as title if not provided
            description: description || "",
            genre: genre || "",
            duration: duration ? parseInt(duration) : null,
            release_date: releaseDate || null,
            upload_date: new Date().toISOString(),
            file_url: urlData.publicUrl,
            thumbnail_url: null, // You can update this later
            status: "pending"
          })
          
        if (insertError) {
          console.error("Error saving film data:", insertError)
        } else {
          console.log("Film data saved to upcoming_releases table")
          
          // Reset form
          setTitle("")
          setDescription("")
          setGenre("")
          setDuration("")
          setReleaseDate("")
          setUploadedFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ""
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

    const handleBackToDashboard = () => {
        // Navigate back to the dashboard
        window.location.href = "/hub";
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
        <Button onClick={handleSubmit} disabled={!uploadedFile}>Upload Film</Button>
      </div>
      <div><button
        onClick={handleBackToDashboard}
        className="absolute top-4 right-4 text-white bg-blue-600 px-4 py-2 rounded hover:bg-red-700 transition"
      >
         Back to Dashboard
      </button>      </div>
    </div>
  )
}