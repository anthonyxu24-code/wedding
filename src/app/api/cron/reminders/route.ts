import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildReminderEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/send-email";

export const dynamic = "force-dynamic";

const WEDDING_DATE = new Date("2026-04-10T00:00:00Z");
const MILESTONES = [30, 14, 7];

function getDaysUntilWedding(): number {
  const now = new Date();
  const diff = WEDDING_DATE.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const daysUntil = getDaysUntilWedding();

  const matchedMilestone = MILESTONES.find((m) => daysUntil <= m && daysUntil > m - 1);
  if (!matchedMilestone) {
    return NextResponse.json({
      ok: true,
      message: `No milestone today (${daysUntil} days until wedding)`,
    });
  }

  const milestoneKey = `${matchedMilestone}-days`;

  try {
    const supabase = createServerSupabase();

    const { data: existing } = await supabase
      .from("sent_reminders")
      .select("milestone")
      .eq("milestone", milestoneKey)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: `Milestone "${milestoneKey}" already sent`,
      });
    }

    const { data: rsvps, error: rsvpErr } = await supabase
      .from("rsvps")
      .select("guest_id, primary_name, email")
      .eq("attending", true);

    if (rsvpErr || !rsvps || rsvps.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No attending RSVPs to remind",
      });
    }

    const guestIds = rsvps.map((r) => r.guest_id).filter(Boolean);
    const { data: guests } = await supabase
      .from("guests")
      .select("id, locale, rsvp_token")
      .in("id", guestIds);

    const guestMap = new Map(
      (guests || []).map((g) => [g.id, { locale: g.locale, rsvp_token: g.rsvp_token }])
    );

    let sentCount = 0;
    let failCount = 0;

    for (const rsvp of rsvps) {
      const guestInfo = guestMap.get(rsvp.guest_id);
      if (!guestInfo) continue;

      try {
        const { subject, html, text } = buildReminderEmail({
          guestName: rsvp.primary_name,
          locale: (guestInfo.locale as "en" | "zh") || "en",
          daysUntil: matchedMilestone,
          rsvpToken: guestInfo.rsvp_token,
        });

        await sendEmail({ to: rsvp.email, subject, html, text });
        sentCount++;
      } catch (e) {
        console.error(`Reminder send error for ${rsvp.email}:`, e);
        failCount++;
      }
    }

    await supabase.from("sent_reminders").insert({ milestone: milestoneKey });

    return NextResponse.json({
      ok: true,
      milestone: milestoneKey,
      sent: sentCount,
      failed: failCount,
    });
  } catch (e) {
    console.error("Reminder cron error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
