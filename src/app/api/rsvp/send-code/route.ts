import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildVerifyCodeEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/send-email";
import { generateToken } from "@/lib/generate-token";

export async function POST(request: Request) {
  try {
    const { token, email: providedEmail, name: providedName, locale: providedLocale } = await request.json();

    const cleanedEmail = providedEmail ? String(providedEmail).trim().toLowerCase() : "";
    const cleanedName = providedName ? String(providedName).trim() : "";

    const supabase = createServerSupabase();
    let guest: { id: string; name: string | null; email: string | null; locale: string; rsvp_token?: string } | null = null;
    let guestToken = token;

    if (token) {
      const { data, error } = await supabase
        .from("guests")
        .select("id, name, email, locale")
        .eq("rsvp_token", token)
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Invalid token" }, { status: 404 });
      }
      guest = data;
    } else if (cleanedEmail && cleanedEmail.includes("@")) {
      const { data: existingList } = await supabase
        .from("guests")
        .select("id, name, email, locale, rsvp_token")
        .eq("email", cleanedEmail)
        .limit(1);

      const existing = existingList?.[0];
      if (existing) {
        guest = existing;
        guestToken = existing.rsvp_token;
      } else {
        const newToken = generateToken();
        const { data: created, error: createErr } = await supabase
          .from("guests")
          .insert({
            name: cleanedName || null,
            email: cleanedEmail,
            locale: providedLocale || "en",
            rsvp_token: newToken,
          })
          .select("id, name, email, locale")
          .single();

        if (createErr || !created) {
          console.error("Create guest error:", createErr);
          return NextResponse.json({ error: "Server error" }, { status: 500 });
        }
        guest = created;
        guestToken = newToken;
      }
    } else {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    let emailToUse = guest.email;
    let nameToUse = guest.name;

    if (!emailToUse && providedEmail) {
      const cleaned = String(providedEmail).trim().toLowerCase();
      if (!cleaned || !cleaned.includes("@")) {
        return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
      }
      emailToUse = cleaned;
    }

    if (!emailToUse) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!nameToUse && providedName) {
      const cleaned = String(providedName).trim();
      if (cleaned) nameToUse = cleaned;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    const updatePayload: { verify_code: string; email?: string; name?: string } = { verify_code: code };
    if (emailToUse && !guest.email) updatePayload.email = emailToUse;
    if (nameToUse && !guest.name) updatePayload.name = nameToUse;

    const { error: updateErr } = await supabase
      .from("guests")
      .update(updatePayload)
      .eq("id", guest.id);

    if (updateErr) {
      console.error("Failed to save verify code:", updateErr);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { subject, html, text } = buildVerifyCodeEmail({
      guestName: nameToUse || "Guest",
      locale: (guest.locale as "en" | "zh") || "en",
      code,
    });

    await sendEmail({ to: emailToUse, subject, html, text });

    const masked = emailToUse.replace(/^(.{2})(.*)(@.*)$/, (_m: string, a: string, b: string, c: string) => a + b.replace(/./g, "*") + c);

    return NextResponse.json({ ok: true, email: masked, token: !token ? guestToken : undefined });
  } catch (e) {
    console.error("Send code error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
