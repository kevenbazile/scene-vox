"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function FilmFestivalPage() {
  // State for form fields
  const [festivalName, setFestivalName] = useState("")
  const [description, setDescription] = useState("")
  const [venue, setVenue] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [ticketPrice, setTicketPrice] = useState("")
  const [maxAttendees, setMaxAttendees] = useState("")
  const [festivalImage, setFestivalImage] = useState<File | null>(null)
  const [promoVideo, setPromoVideo] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const startDateInputRef = useRef<HTMLInputElement | null>(null)
  const endDateInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFestivalImage(e.target.files[0])
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPromoVideo(e.target.files[0])
    }
  }

  // Function to focus on date inputs when calendar icon is clicked
  const handleCalendarClick = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (inputRef.current) {
      inputRef.current.showPicker()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      
      if (!userId) {
        throw new Error("You must be logged in to create a film festival")
      }

      // Initialize metadata object
      const festivalData: any = {
        name: festivalName,
        description,
        venue,
        start_date: startDate,
        end_date: endDate,
        ticket_price: ticketPrice ? parseFloat(ticketPrice) : null,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        created_at: new Date().toISOString(),
        user_id: userId,
        status: "upcoming"
      }

      // Upload festival image if provided
      if (festivalImage) {
        const imageName = `${Date.now()}-${festivalImage.name}`
        const imagePath = `film_festival/${imageName}`
        
        const { data: imageData, error: imageError } = await supabase.storage
          .from("film_uploads")
          .upload(imagePath, festivalImage)
          
        if (imageError) throw imageError
        
        const { data: imageUrlData } = supabase.storage
          .from("film_uploads")
          .getPublicUrl(imageData.path)
          
        festivalData.image_url = imageUrlData.publicUrl
      }

      // Upload promo video if provided
      if (promoVideo) {
        const videoName = `${Date.now()}-${promoVideo.name}`
        const videoPath = `film_festival/${videoName}`
        
        const { data: videoData, error: videoError } = await supabase.storage
          .from("film_uploads")
          .upload(videoPath, promoVideo)
          
        if (videoError) throw videoError
        
        const { data: videoUrlData } = supabase.storage
          .from("film_uploads")
          .getPublicUrl(videoData.path)
          
        festivalData.promo_video_url = videoUrlData.publicUrl
      }

      // Save festival metadata to the database
      const { error: insertError } = await supabase
        .from("film_festivals")
        .insert(festivalData)

      if (insertError) throw insertError

      // Success!
      setSuccessMessage("Your film festival has been created successfully!")
      
      // Reset form
      setFestivalName("")
      setDescription("")
      setVenue("")
      setStartDate("")
      setEndDate("")
      setTicketPrice("")
      setMaxAttendees("")
      setFestivalImage(null)
      setPromoVideo(null)
      if (imageInputRef.current) imageInputRef.current.value = ""
      if (videoInputRef.current) videoInputRef.current.value = ""
      
    } catch (error: any) {
      console.error("Error creating film festival:", error)
      setErrorMessage(error.message || "Failed to create film festival")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create Your Film Festival</h1>
        <Button 
          onClick={() => window.location.href = "/hub"}
          variant="outline"
          className="flex items-center gap-2"
        >
          Back to Dashboard
        </Button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="festivalName" className="block text-sm font-medium">
              Festival Name *
            </label>
            <input
              id="festivalName"
              type="text"
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Your Film Festival Name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="venue" className="block text-sm font-medium">
              Venue *
            </label>
            <input
              id="venue"
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Venue Location"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium">
              Start Date *
            </label>
            <div className="relative">
              <input
                id="startDate"
                type="date"
                ref={startDateInputRef}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <Calendar 
                className="absolute right-2 top-2 h-5 w-5 text-gray-400 cursor-pointer" 
                onClick={() => handleCalendarClick(startDateInputRef)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium">
              End Date *
            </label>
            <div className="relative">
              <input
                id="endDate"
                type="date"
                ref={endDateInputRef}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <Calendar 
                className="absolute right-2 top-2 h-5 w-5 text-gray-400 cursor-pointer" 
                onClick={() => handleCalendarClick(endDateInputRef)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="ticketPrice" className="block text-sm font-medium">
              Ticket Price ($)
            </label>
            <input
              id="ticketPrice"
              type="number"
              step="0.01"
              min="0"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="maxAttendees" className="block text-sm font-medium">
              Maximum Attendees
            </label>
            <input
              id="maxAttendees"
              type="number"
              min="1"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Number of available tickets"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Festival Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 min-h-32"
            placeholder="Describe your film festival, featured films, and special events..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="festivalImage" className="block text-sm font-medium">
              Festival Banner Image
            </label>
            <input
              id="festivalImage"
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Recommended size: 1200 x 600px. Max file size: 5MB
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="promoVideo" className="block text-sm font-medium">
              Promotional Video
            </label>
            <input
              id="promoVideo"
              type="file"
              ref={videoInputRef}
              onChange={handleVideoChange}
              accept="video/*"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Max file size: 100MB. Supported formats: MP4, MOV
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium"
          >
            {isSubmitting ? "Creating Festival..." : "Create Film Festival"}
          </Button>
        </div>
      </form>
    </div>
  )
}