import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("gifts")
    .select("id, name, amount, method, note, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, amount, method, note } = await req.json();

  if (!name || !amount || !method) {
    return NextResponse.json({ error: "Name, amount, and method are required" }, { status: 400 });
  }

  const cents = Math.round(Number(amount) * 100);
  if (cents < 1) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from("gifts").insert({
    name: String(name).trim(),
    amount: cents,
    method: String(method),
    note: note ? String(note).trim() : null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from("gifts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
