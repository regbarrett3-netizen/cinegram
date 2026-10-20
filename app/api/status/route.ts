// Polled by the page every few seconds while the video renders.
import { NextRequest, NextResponse } from "next/server";
import { falStatus } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  try {
    return NextResponse.json(await falStatus(id));
  } catch (err) {
    // A failed check is not a failed video; the page just asks again.
    return NextResponse.json({ state: "rendering", note: (err as Error).message });
  }
}
