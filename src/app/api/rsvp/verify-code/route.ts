import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { token, code } = await request.json();
    if (!token || !code) {
      return NextResponse.json({ error: "Missing token or code" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: guest, error: guestErr } = await supabase
      .from("guests")
      .select("id, verify_code")
      .eq("rsvp_token", token)
      .limit(1)
      .single();

    if (guestErr || !guest) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (!guest.verify_code || guest.verify_code !== String(code).trim()) {
      return NextResponse.json({ error: "Invalid code" }, { status: 403 });
    }

    await supabase
      .from("guests")
      .update({ verify_code: null })
      .eq("id", guest.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Verify code error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
