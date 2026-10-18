import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Cloning + TTS + uploads can take a while; the video itself renders on fal's queue.
export const maxDuration = 60;

fal.config({
  credentials: process.env.FAL_KEY,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || "",
});

const MAX_MESSAGE_LENGTH = 500;

export async function POST(req: NextRequest) {
  let voiceId: string | null = null;

  try {
    const formData = await req.formData();
    const photo = formData.get("photo") as File | null;
    const voiceSample = formData.get("voice") as File | null;
    const message = ((formData.get("message") as string | null) || "").trim();

    if (!photo || !voiceSample || !message) {
      return NextResponse.json({ error: "Missing photo, voice sample or message" }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` }, { status: 400 });
    }

    // 1. Create a temporary Instant Voice Clone from the recorded sample
    const voice = await elevenlabs.voices.ivc.create({
      name: `Cinegram_User_${Date.now()}`,
      files: [voiceSample],
      description: "Temporary instant clone for Cinegram card generation",
    });
    voiceId = voice.voiceId;

    // 2. Speak the card message in the cloned voice (multilingual model detects the language from the text)
    const speechStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: message,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });
    const speech = await new Response(speechStream).blob();

    // 3. Upload the photo and generated speech to fal storage
    const [imageUrl, audioUrl] = await Promise.all([
      fal.storage.upload(photo),
      fal.storage.upload(new File([speech], "message.mp3", { type: "audio/mpeg" })),
    ]);

    // 4. Queue the audio-driven talking-head render; the client polls /api/card-status
    const { request_id } = await fal.queue.submit("fal-ai/sadtalker", {
      input: {
        source_image_url: imageUrl,
        driven_audio_url: audioUrl,
      },
    });

    return NextResponse.json({ requestId: request_id });
  } catch (err: any) {
    console.error("Card Generation Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate video card" }, { status: 500 });
  } finally {
    // The clone is only needed for this one message
    if (voiceId) {
      await elevenlabs.voices.delete(voiceId).catch((err) => console.error("Voice Cleanup Error:", err));
    }
  }
}
