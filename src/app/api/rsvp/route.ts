import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildConfirmationEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/send-email";

async function sendConfirmation(email: string, name: string, attending: boolean, guestCount: number, locale: "en" | "zh", rsvpToken: string) {
  try {
    const { subject, html, text } = buildConfirmationEmail({
      guestName: name,
      locale,
      attending,
      guestCount,
      rsvpToken,
    });

    await sendEmail({ to: email, subject, html, text });
  } catch (e) {
    console.error("Confirmation email error (non-blocking):", e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      token,
      attending,
      guest_count = 1,
      guest_names = [],
      message,
      address,
    } = body;

    if (!token || typeof attending !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: token, attending" },
        { status: 400 }
      );
    }

    const trimmedAddress = address ? String(address).trim() : "";
    if (!trimmedAddress) {
      return NextResponse.json(
        { error: "Mailing address is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    const { data: guest, error: guestErr } = await supabase
      .from("guests")
      .select("id, name, email, locale")
      .eq("rsvp_token", token)
      .limit(1)
      .single();

    if (guestErr || !guest) {
      return NextResponse.json({ error: "Invalid RSVP token" }, { status: 403 });
    }

    const isAttending = !!attending;
    const count = Math.max(1, Math.min(20, Number(guest_count) || 1));

    const { error } = await supabase
      .from("rsvps")
      .upsert(
        {
          guest_id: guest.id,
          primary_name: guest.name,
          email: guest.email,
          attending: isAttending,
          guest_count: count,
          guest_names: Array.isArray(guest_names) ? guest_names : [],
          message: message ? String(message).trim() : null,
          address: trimmedAddress,
        },
        { onConflict: "guest_id" }
      );

    if (error) {
      console.error("RSVP upsert error:", error);
      return NextResponse.json(
        { error: error.message || "Could not save RSVP" },
        { status: 500 }
      );
    }

    await sendConfirmation(guest.email, guest.name, isAttending, count, guest.locale as "en" | "zh", token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("RSVP API error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
