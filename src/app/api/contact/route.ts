import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔍 Incoming Contact Form Data:", body);

    // ✅ Check if all required fields are present
    if (!body.name || !body.email || !body.message) {
      console.error("❌ Missing required fields:", body);
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    // ✅ Insert into Supabase
    const { data, error } = await supabase
      .from("contact_requests")
      .insert([{ name: body.name, email: body.email, phone: body.phone || null, message: body.message }])
      .select("*");

    if (error) {
      console.error("❌ Supabase Insert Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Data Stored Successfully!", data);
    return NextResponse.json({ message: "Your message has been sent!", data }, { status: 200 });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
