// Short preview clips for the ready-made voices, so people can hear them before choosing.
import { NextResponse } from "next/server";
import { PRESET_VOICES } from "../../../lib/voices";

export const runtime = "nodejs";
export const revalidate = 86400; // previews rarely change; refresh once a day

export async function GET() {
  const previews: Record<string, string> = {};
  const key = process.env.ELEVENLABS_API_KEY;
  if (key) {
    await Promise.all(
      PRESET_VOICES.map(async (v) => {
        try {
          const res = await fetch(`https://api.elevenlabs.io/v1/voices/${v.id}`, { headers: { "xi-api-key": key } });
          if (!res.ok) return;
          const data = (await res.json()) as { preview_url?: string };
          if (data.preview_url) previews[v.id] = data.preview_url;
        } catch {
          /* previews are optional */
        }
      }),
    );
  }
  return NextResponse.json({ previews });
}
