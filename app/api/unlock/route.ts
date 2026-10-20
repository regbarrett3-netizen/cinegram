// After Stripe sends the buyer back: confirms payment and returns the video.
import { NextRequest, NextResponse } from "next/server";
import { falVideoUrl, stripePaidRequestId } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id") || "";
  try {
    const requestId = await stripePaidRequestId(sessionId);
    if (!requestId) return NextResponse.json({ paid: false }, { status: 402 });
    const videoUrl = await falVideoUrl(requestId);
    return NextResponse.json({ paid: true, videoUrl });
  } catch (err) {
    console.error("Unlock error:", err);
    return NextResponse.json({ paid: false, error: (err as Error).message }, { status: 500 });
  }
}
