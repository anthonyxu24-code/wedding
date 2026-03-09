import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerSupabase } from "@/lib/supabase/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import { buildInviteEmail } from "@/lib/email-templates";

const FROM_ADDRESS = process.env.RESEND_FROM || "Cindy & Anthony <onboarding@resend.dev>";

export async function POST(request: Request) {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });
  }

  try {
    const { guestIds } = await request.json();
    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json({ error: "Provide guestIds array" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: guests, error: fetchErr } = await supabase
      .from("guests")
      .select("id, name, email, locale")
      .in("id", guestIds);

    if (fetchErr || !guests) {
      return NextResponse.json({ error: fetchErr?.message || "Could not fetch guests" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const results: { id: string; status: "sent" | "failed"; error?: string }[] = [];

    for (const guest of guests) {
      try {
        const { subject, html } = buildInviteEmail({
          guestName: guest.name,
          locale: guest.locale as "en" | "zh",
        });

        const { error: sendErr } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: guest.email,
          subject,
          html,
        });

        if (sendErr) {
          results.push({ id: guest.id, status: "failed", error: sendErr.message });
          continue;
        }

        await supabase
          .from("guests")
          .update({ invite_sent: true, invite_sent_at: new Date().toISOString() })
          .eq("id", guest.id);

        results.push({ id: guest.id, status: "sent" });
      } catch (e) {
        results.push({ id: guest.id, status: "failed", error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    return NextResponse.json({ results });
  } catch (e) {
    console.error("Send invites error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
