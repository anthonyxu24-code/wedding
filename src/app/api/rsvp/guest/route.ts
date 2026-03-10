import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: guest, error: guestErr } = await supabase
      .from("guests")
      .select("id, name, email, locale")
      .eq("rsvp_token", token)
      .limit(1)
      .single();

    if (guestErr || !guest) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const { data: rsvp } = await supabase
      .from("rsvps")
      .select("attending, guest_count, guest_names, message, address")
      .eq("guest_id", guest.id)
      .limit(1)
      .single();

    return NextResponse.json({
      guest: { name: guest.name, email: guest.email, locale: guest.locale },
      rsvp: rsvp || null,
    });
  } catch (e) {
    console.error("Guest lookup error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
