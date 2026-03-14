import { NextResponse } from "next/server";

import { giveAura } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      fromUserId?: number | null;
      toUserId?: number;
      amount?: number;
      reason?: string;
    };

    if (!payload.toUserId || !payload.amount) {
      return NextResponse.json(
        { error: "Recipient and aura amount are required." },
        { status: 400 },
      );
    }

    if (payload.amount < -500 || payload.amount > 500 || payload.amount === 0) {
      return NextResponse.json(
        { error: "Aura amount must be between -500 and 500, excluding 0." },
        { status: 400 },
      );
    }

    await giveAura(
      payload.fromUserId ?? null,
      payload.toUserId,
      payload.amount,
      payload.reason?.trim() ?? "",
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit aura event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
