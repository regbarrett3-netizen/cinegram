import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("requestId");

  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  try {
    const status = await fal.queue.status("fal-ai/sadtalker", { requestId });

    if (status.status !== "COMPLETED") {
      return NextResponse.json({ status: status.status });
    }

    const result = await fal.queue.result("fal-ai/sadtalker", { requestId });
    return NextResponse.json({ status: "COMPLETED", videoUrl: result.data.video.url });
  } catch (err: any) {
    console.error("Card Status Error:", err);
    return NextResponse.json({ error: err.message || "Failed to check video status" }, { status: 500 });
  }
}
