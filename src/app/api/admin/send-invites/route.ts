import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { createServerSupabase } from "@/lib/supabase/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import { buildInviteEmail } from "@/lib/email-templates";

const FROM_ADDRESS = process.env.SENDGRID_FROM || "wedding@example.com";

export async function POST(request: Request) {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SENDGRID_API_KEY not configured" }, { status: 503 });
  }

  try {
    sgMail.setApiKey(apiKey);

    const { guestIds } = await request.json();
    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json({ error: "Provide guestIds array" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: guests, error: fetchErr } = await supabase
      .from("guests")
      .select("id, name, email, locale, rsvp_token")
      .in("id", guestIds);

    if (fetchErr || !guests) {
      return NextResponse.json({ error: fetchErr?.message || "Could not fetch guests" }, { status: 500 });
    }

    const results: { id: string; status: "sent" | "failed"; error?: string }[] = [];

    for (const guest of guests) {
      try {
        const { subject, html } = buildInviteEmail({
          guestName: guest.name,
          locale: guest.locale as "en" | "zh",
          rsvpToken: guest.rsvp_token,
        });

        await sgMail.send({
          to: guest.email,
          from: FROM_ADDRESS,
          subject,
          html,
        });

        await supabase
          .from("guests")
          .update({ invite_sent: true, invite_sent_at: new Date().toISOString() })
          .eq("id", guest.id);

        results.push({ id: guest.id, status: "sent" });
      } catch (e) {
        console.error(`SendGrid error for ${guest.email}:`, e);
        const message = e instanceof Error ? e.message : "Unknown error";
        results.push({ id: guest.id, status: "failed", error: message });
      }
    }

    return NextResponse.json({ results });
  } catch (e) {
    console.error("Send invites error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
