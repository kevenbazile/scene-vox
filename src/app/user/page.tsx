"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation" // For page navigation

export default function NetflixProfiles() {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<any[]>([]) // State to store profiles
  const [isAddingProfile, setIsAddingProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("") // Track selected avatar
  const [isKids, setIsKids] = useState(false)

  // Predefined avatar options
  const avatarOptions = [
    { id: "1", avatar: "/girl1.png" },
    { id: "2", avatar: "/girl2.png" },
    { id: "3", avatar: "/girl3.png" },
    { id: "4", avatar: "/girl4.png" },
    { id: "5", avatar: "/girl5.png" },
    { id: "6", avatar: "/girl6.png" },
    { id: "7", avatar: "/guy1.png" },
    { id: "8", avatar: "/guy2.png" },
    { id: "10", avatar: "/guy3.png" },
    { id: "11", avatar: "/guy4.png" },
    { id: "12", avatar: "/guy5.png" },
  ]

  const fetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id) // Fetch profiles based on the authenticated user

    if (error) {
      console.error('Error fetching profiles:', error)
    } else {
      setProfiles(data)
    }
  }

  const addProfile = async () => {
    if (!selectedAvatar || !newProfileName) {
      alert("Please provide both a name and avatar.")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id: user?.id,
        name: newProfileName,
        avatar: selectedAvatar,
        is_kids: isKids
      }])

    if (error) {
      console.error('Error adding profile:', error)
    } else {
      fetchProfiles() // Refresh profiles after adding
      setIsAddingProfile(false) // Close the form
    }
  }

  const deleteProfile = async (profileId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (error) {
      console.error('Error deleting profile:', error)
    } else {
      fetchProfiles() // Refresh profiles after deletion
    }
  }

  const handleProfileSelection = (profileId: string) => {
    setSelectedProfile(profileId)
    // Redirect to /userhome when a profile is clicked
    router.push("/userhome")
  }

  const handleAddProfileClick = () => {
    setIsAddingProfile(true) // Open the form to add a new profile
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/signin") // Redirect to the /signin page after signing out
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        fetchProfiles() // Fetch profiles when the user is logged in
      }
    }
    checkUser()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-5xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-medium mb-8">Who's watching?</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center mb-12">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex flex-col items-center relative">
              <button
                className="group relative w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-md overflow-hidden border-2 border-transparent hover:border-white transition-colors duration-200"
                onClick={() => handleProfileSelection(profile.id)}
              >
                <img
                  src={profile.avatar || "/placeholder.svg"}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </button>
              <span className="mt-2 text-sm md:text-base text-gray-300">
                {profile.name}
              </span>
              {profile.is_kids && <span className="text-xs text-blue-400 mt-1">Kids</span>}
              <button
                onClick={() => deleteProfile(profile.id)}
                className="absolute top-1 right-1 text-red-500 hover:text-white"
              >
                <span className="text-xl">X</span>
              </button>
            </div>
          ))}
          {profiles.length < 3 && (
            <div className="flex flex-col items-center">
              <button
                className="group relative w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-md flex items-center justify-center border-2 border-gray-600 hover:border-white transition-colors duration-200"
                onClick={handleAddProfileClick}
              >
                <PlusCircle className="w-16 h-16 text-gray-600 group-hover:text-white transition-colors duration-200" />
              </button>
              <span className="mt-2 text-sm md:text-base text-gray-400">Add Profile</span>
            </div>
          )}
        </div>

        {isAddingProfile && (
          <div className="flex flex-col items-center mt-8">
            <input
              type="text"
              placeholder="Enter profile name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="mb-4 px-4 py-2 text-black"
            />

            <div className="mb-4">
              <h2 className="text-lg text-gray-400 mb-2">Select Avatar</h2>
              <div className="grid grid-cols-3 gap-4">
                {avatarOptions.map((avatarOption) => (
                  <button
                    key={avatarOption.id}
                    onClick={() => setSelectedAvatar(avatarOption.avatar)}
                    className={`w-[80px] h-[80px] rounded-full overflow-hidden border-2 ${selectedAvatar === avatarOption.avatar ? "border-white" : "border-gray-600"} hover:border-white`}
                  >
                    <img
                      src={avatarOption.avatar}
                      alt={`Avatar ${avatarOption.id}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="text-gray-400">
              Is Kids Profile?
              <input
                type="checkbox"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="ml-2"
              />
            </label>
            <Button
              variant="outline"
              className="mt-4 border border-gray-600 text-gray-400 hover:text-white hover:border-white bg-transparent px-6 py-2"
              onClick={addProfile}
            >
              Save Profile
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          className="mt-8 border border-gray-600 text-gray-400 hover:text-white hover:border-white bg-transparent px-6 py-2"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}
