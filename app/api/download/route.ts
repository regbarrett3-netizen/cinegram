// Streams the paid video as a file download (phones save it instead of just playing it).
import { NextRequest, NextResponse } from "next/server";
import { falVideoUrl, stripePaidRequestId } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id") || "";
  const requestId = await stripePaidRequestId(sessionId);
  if (!requestId) return NextResponse.json({ error: "Payment not found." }, { status: 402 });

  const src = await fetch(await falVideoUrl(requestId));
  if (!src.ok || !src.body) return NextResponse.json({ error: "Video not available." }, { status: 502 });

  const headers = new Headers({
    "Content-Type": src.headers.get("content-type") || "video/mp4",
    "Content-Disposition": 'attachment; filename="cinegram.mp4"',
    "Cache-Control": "private, no-store",
  });
  const len = src.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  return new Response(src.body, { headers });
}
