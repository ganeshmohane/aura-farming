import { NextResponse } from "next/server";

import { getUsers } from "@/lib/db";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
