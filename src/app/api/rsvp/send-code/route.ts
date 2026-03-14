import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildVerifyCodeEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/send-email";

export async function POST(request: Request) {
  try {
    const { token, email: providedEmail } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: guest, error: guestErr } = await supabase
      .from("guests")
      .select("id, name, email, locale")
      .eq("rsvp_token", token)
      .limit(1)
      .single();

    if (guestErr || !guest) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    let emailToUse = guest.email;

    if (!emailToUse && providedEmail) {
      const cleaned = String(providedEmail).trim().toLowerCase();
      if (!cleaned || !cleaned.includes("@")) {
        return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
      }
      const { error: emailErr } = await supabase
        .from("guests")
        .update({ email: cleaned })
        .eq("id", guest.id);

      if (emailErr) {
        console.error("Failed to save guest email:", emailErr);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
      emailToUse = cleaned;
    }

    if (!emailToUse) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    const { error: updateErr } = await supabase
      .from("guests")
      .update({ verify_code: code })
      .eq("id", guest.id);

    if (updateErr) {
      console.error("Failed to save verify code:", updateErr);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { subject, html, text } = buildVerifyCodeEmail({
      guestName: guest.name,
      locale: (guest.locale as "en" | "zh") || "en",
      code,
    });

    await sendEmail({ to: emailToUse, subject, html, text });

    const masked = emailToUse.replace(/^(.{2})(.*)(@.*)$/, (_m: string, a: string, b: string, c: string) => a + b.replace(/./g, "*") + c);

    return NextResponse.json({ ok: true, email: masked });
  } catch (e) {
    console.error("Send code error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
