// After Stripe sends the buyer back: confirms the Action Card payment.
import { NextRequest, NextResponse } from "next/server";
import { stripePaidActionId } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id") || "";
  try {
    const actionId = await stripePaidActionId(sessionId);
    if (!actionId) return NextResponse.json({ paid: false }, { status: 402 });
    return NextResponse.json({ paid: true, actionId });
  } catch (err) {
    console.error("Action unlock error:", err);
    return NextResponse.json({ paid: false, error: (err as Error).message }, { status: 500 });
  }
}
