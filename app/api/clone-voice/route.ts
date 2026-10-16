import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    const voice = await elevenlabs.voices.add({
      name: `Cinegram_User_${Date.now()}`,
      files: [audioFile],
      description: "Temporary instant clone for Cinegram card generation",
    });

    return NextResponse.json({ success: true, voiceId: voice.voice_id });
  } catch (err: any) {
    console.error("Voice Clone Error:", err);
    return NextResponse.json({ error: err.message || "Failed to clone voice" }, { status: 500 });
  }
}
