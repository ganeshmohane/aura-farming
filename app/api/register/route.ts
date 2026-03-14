import { NextResponse } from "next/server";

import { registerUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email } = (await request.json()) as { name?: string; email?: string };

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await registerUser(name.trim(), normalizedEmail);

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
