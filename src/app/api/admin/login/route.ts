import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const COOKIE_NAME = "admin_session";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({}));
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
