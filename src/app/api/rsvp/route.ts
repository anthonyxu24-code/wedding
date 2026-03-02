import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      primary_name,
      email,
      attending,
      guest_count = 1,
      guest_names = [],
      message,
    } = body;

    if (!primary_name || !email || typeof attending !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: primary_name, email, attending" },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server configuration error. RSVP is not available yet." },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from("rsvps").insert({
      primary_name: String(primary_name).trim(),
      email: String(email).trim().toLowerCase(),
      attending: !!attending,
      guest_count: Math.max(1, Math.min(20, Number(guest_count) || 1)),
      guest_names: Array.isArray(guest_names) ? guest_names : [],
      message: message ? String(message).trim() : null,
    });

    if (error) {
      console.error("RSVP insert error:", error);
      return NextResponse.json(
        { error: error.message || "Could not save RSVP" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("RSVP API error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
