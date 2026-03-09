import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sgMail from "@sendgrid/mail";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildConfirmationEmail } from "@/lib/email-templates";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FROM_ADDRESS = process.env.SENDGRID_FROM || "wedding@example.com";

async function sendConfirmation(email: string, name: string, attending: boolean, guestCount: number) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return;

  try {
    sgMail.setApiKey(apiKey);

    let locale: "en" | "zh" = "en";
    try {
      const supabase = createServerSupabase();
      const { data } = await supabase
        .from("guests")
        .select("locale")
        .eq("email", email.toLowerCase())
        .limit(1)
        .single();
      if (data?.locale === "zh") locale = "zh";
    } catch {
      // Guest may not be in the guests table — default to EN
    }

    const { subject, html } = buildConfirmationEmail({
      guestName: name,
      locale,
      attending,
      guestCount,
    });

    await sgMail.send({ to: email, from: FROM_ADDRESS, subject, html });
  } catch (e) {
    console.error("Confirmation email error (non-blocking):", e);
  }
}

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

    const trimmedName = String(primary_name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const isAttending = !!attending;
    const count = Math.max(1, Math.min(20, Number(guest_count) || 1));

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from("rsvps").insert({
      primary_name: trimmedName,
      email: trimmedEmail,
      attending: isAttending,
      guest_count: count,
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

    sendConfirmation(trimmedEmail, trimmedName, isAttending, count);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("RSVP API error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
