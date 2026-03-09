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
      .from("guests")
      .select("id, name, email, locale, invite_sent, invite_sent_at, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Guests fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ guests: data ?? [] });
  } catch (e) {
    console.error("Guests error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, locale } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    if (locale && !["en", "zh"].includes(locale)) {
      return NextResponse.json({ error: "Locale must be 'en' or 'zh'" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("guests")
      .insert({ name: String(name).trim(), email: String(email).trim().toLowerCase(), locale: locale || "en" })
      .select()
      .single();

    if (error) {
      console.error("Guest insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ guest: data });
  } catch (e) {
    console.error("Guest insert error:", e);
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
      return NextResponse.json({ error: "Missing guest id" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.from("guests").delete().eq("id", id);

    if (error) {
      console.error("Guest delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Guest delete error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
