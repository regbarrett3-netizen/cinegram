// After Stripe sends the buyer back: confirms the Quick Card payment.
import { NextRequest, NextResponse } from "next/server";
import { stripePaidCardId } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id") || "";
  try {
    const cardId = await stripePaidCardId(sessionId);
    if (!cardId) return NextResponse.json({ paid: false }, { status: 402 });
    return NextResponse.json({ paid: true, cardId });
  } catch (err) {
    console.error("Card unlock error:", err);
    return NextResponse.json({ paid: false, error: (err as Error).message }, { status: 500 });
  }
}
