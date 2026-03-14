import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import { buildInviteEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/send-email";

export async function POST(request: Request) {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
        const { subject, html, text } = buildInviteEmail({
          guestName: guest.name,
          locale: guest.locale as "en" | "zh",
          rsvpToken: guest.rsvp_token,
        });

        await sendEmail({ to: guest.email, subject, html, text });

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
