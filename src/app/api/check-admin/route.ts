import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const ok = password === adminPassword;

  return NextResponse.json({ ok });
}
