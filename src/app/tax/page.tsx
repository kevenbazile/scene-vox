"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
// Import your configured Supabase client
import { supabase } from "@/lib/supabase"

export default function TaxAndDocumentsPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [cityOrTown, setCityOrTown] = useState("")
  const [stateOrProvince, setStateOrProvince] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")
  const [entityType, setEntityType] = useState("")

  const handleBackToDashboard = () => {
    window.location.href = "/hub"
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 1) Get the current user (requires the user to be logged in)
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const userId = userData?.user?.id
      if (!userId) {
        alert("No user is logged in. Please log in first.")
        return
      }

      // 2) Insert data into the 'tax_filings' table
      const { error: insertError } = await supabase
        .from("tax_filings")
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          email,
          street_address: streetAddress,
          city: cityOrTown,
          state_province: stateOrProvince,
          postal_code: postalCode,
          country,
          entity_type: entityType,
        })

      if (insertError) {
        console.error("Error inserting data into tax_filings:", insertError)
        alert("An error occurred while saving your tax info.")
        return
      }

      alert("Your tax information has been submitted!")

      // (Optional) Reset fields
      setFirstName("")
      setLastName("")
      setEmail("")
      setStreetAddress("")
      setCityOrTown("")
      setStateOrProvince("")
      setPostalCode("")
      setCountry("")
      setEntityType("")
    } catch (error) {
      console.error("Could not submit tax info:", error)
      alert("Something went wrong while submitting your tax info.")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tax & Documents</h1>
      <p>
        <strong>Disclaimer:</strong> The information below is provided for
        general informational purposes only and is not intended to be legal or
        tax advice. For specific tax advice, please consult a qualified tax
        professional.
      </p>

      {/* Instructions / Info Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How to File Your Taxes</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Gather all required documents (W-9, 1099, etc.).</li>
          <li>Complete the necessary IRS forms for your filing status.</li>
          <li>Submit returns by the appropriate deadlines.</li>
        </ol>
        <p>
          For more details, see the official IRS guide on{" "}
          <a
            href="https://www.irs.gov/businesses/small-businesses-self-employed/how-to-file-a-tax-return"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            How to File a Tax Return
          </a>
          .
        </p>
      </section>

      {/* Important IRS Forms */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">IRS Forms & Documents</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <a
              href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              W-9 Form
            </a>{" "}
            (Request for Taxpayer Identification Number)
          </li>
          <li>
            <a
              href="https://www.irs.gov/pub/irs-pdf/f1099msc.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              1099-MISC Form
            </a>{" "}
            (Miscellaneous Income)
          </li>
          <li>
            <a
              href="https://www.irs.gov/pub/irs-pdf/f1040.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              1040 Form
            </a>{" "}
            (U.S. Individual Income Tax Return)
          </li>
        </ul>
      </section>

      {/* Tax Info Form */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Tax Info</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block font-medium" htmlFor="firstName">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="lastName">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="email">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="streetAddress">
              Permanent Residence Address <span className="text-red-600">*</span>
            </label>
            <input
              id="streetAddress"
              type="text"
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Street, apt. or suite no., or rural route"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="cityOrTown">
              City or Town <span className="text-red-600">*</span>
            </label>
            <input
              id="cityOrTown"
              type="text"
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Your city or town"
              value={cityOrTown}
              onChange={(e) => setCityOrTown(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="stateOrProvince">
              State or Province
            </label>
            <input
              id="stateOrProvince"
              type="text"
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Your state or province"
              value={stateOrProvince}
              onChange={(e) => setStateOrProvince(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="postalCode">
              Postal Code <span className="text-red-600">*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="ZIP or postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="country">
              Country <span className="text-red-600">*</span>
            </label>
            <input
              id="country"
              type="text"
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="USA, Canada, etc."
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium" htmlFor="entityType">
              Entity Type <span className="text-red-600">*</span>
            </label>
            <select
              id="entityType"
              required
              className="border border-gray-300 rounded p-2 w-full"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Individual">Individual / Sole Proprietor</option>
              <option value="SingleMemberLLC">Single-Member LLC</option>
              <option value="MultiMemberLLC">Multi-Member LLC</option>
              <option value="Partnership">Partnership</option>
              <option value="Corporation">Corporation</option>
              <option value="NonProfit">Non-Profit</option>
              {/* Add more if needed */}
            </select>
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </section>

      {/* Existing Documents or Links */}
      <section>
        <h2 className="text-xl font-semibold">Your Documents</h2>
        <p className="italic text-gray-500">
          (Here you could list or link the user’s saved W-9, 1099, etc. if stored.)
        </p>
      </section>

      <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
    </div>
  )
}
