import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { photoUrl, audioUrl } = await req.json();

    if (!photoUrl || !audioUrl) {
      return NextResponse.json({ error: "Missing photoUrl or audioUrl" }, { status: 400 });
    }

    // Call LivePortrait audio-driven face animation via Fal.ai
    const result: any = await fal.subscribe("fal-ai/live-portrait", {
      input: {
        image_url: photoUrl,
        audio_url: audioUrl,
      },
      logs: true,
    });

    return NextResponse.json({ videoUrl: result.video.url });
  } catch (err: any) {
    console.error("Video Generation Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate video card" }, { status: 500 });
  }
}
