import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

const COOKIE_NAME = "admin_session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || token !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("rsvps")
      .select("id, primary_name, email, attending, guest_count, guest_names, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin RSVPs fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rsvps: data ?? [] });
  } catch (e) {
    console.error("Admin RSVPs error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
