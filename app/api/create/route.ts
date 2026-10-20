// Starts a Cinegram: uploads the selfie, clones the voice, speaks the message,
// deletes the cloned voice, and queues the talking-face video. Returns a job id to poll.
import { NextRequest, NextResponse } from "next/server";
import { isLang, isOccasion, MAX_MESSAGE, OCCASION_SCENE } from "../../../lib/i18n";
import { elevenCloneVoice, elevenDeleteVoice, elevenSpeak, falSubmitAvatar, falUpload } from "../../../lib/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MB = 1024 * 1024;

export async function POST(req: NextRequest) {
  let voiceId: string | null = null;
  try {
    const form = await req.formData();
    const photo = form.get("photo");
    const voice = form.get("voice");
    const lang = form.get("lang");
    const occasion = form.get("occasion");
    const message = String(form.get("message") || "").trim();
    const scene = String(form.get("scene") || "").trim().slice(0, 300);

    if (form.get("consent") !== "yes") {
      return NextResponse.json({ error: "Please confirm you have permission to use this face and voice." }, { status: 400 });
    }
    if (!(photo instanceof Blob) || photo.size === 0 || photo.size > 4 * MB || !photo.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please add a photo (under 4 MB)." }, { status: 400 });
    }
    if (!(voice instanceof Blob) || voice.size < 10_000 || voice.size > 4 * MB) {
      return NextResponse.json({ error: "Please record a voice sample of at least 10 seconds." }, { status: 400 });
    }
    if (!isLang(lang) || !isOccasion(occasion)) {
      return NextResponse.json({ error: "Missing language or occasion." }, { status: 400 });
    }
    if (!message || message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: `Your message must be 1–${MAX_MESSAGE} characters.` }, { status: 400 });
    }

    // Upload the photo while the voice is being cloned.
    const photoUrlP = falUpload(photo, "selfie.jpg");
    photoUrlP.catch(() => undefined); // avoid an unhandled rejection if cloning fails first
    voiceId = await elevenCloneVoice(voice);
    const speech = await elevenSpeak(voiceId, message, lang);
    await elevenDeleteVoice(voiceId);
    voiceId = null;

    const [photoUrl, audioUrl] = await Promise.all([photoUrlP, falUpload(speech, "message.mp3")]);
    const prompt = [OCCASION_SCENE[occasion], scene].filter(Boolean).join(". ");
    const requestId = await falSubmitAvatar(photoUrl, audioUrl, prompt);

    return NextResponse.json({ requestId });
  } catch (err) {
    console.error("Create error:", err);
    return NextResponse.json({ error: (err as Error).message || "Could not start your Cinegram." }, { status: 500 });
  } finally {
    if (voiceId) await elevenDeleteVoice(voiceId);
  }
}
