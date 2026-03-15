import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { authorizeAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("rsvps")
      .select("id, guest_id, primary_name, email, attending, guest_count, guest_names, message, address, created_at")
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

export async function DELETE(request: Request) {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing RSVP id" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.from("rsvps").delete().eq("id", id);

    if (error) {
      console.error("Admin RSVP delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin RSVP delete error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
