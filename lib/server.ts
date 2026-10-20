// Server-only helpers: fal.ai (storage + queue), ElevenLabs (voice clone + speech), Stripe.
// Plain fetch calls, so there are no SDK versions to break the build.

export const AVATAR_MODEL = "fal-ai/kling-video/ai-avatar/v2/standard";
// Status and result URLs use only owner/app, not the full model path.
const AVATAR_APP = "fal-ai/kling-video";

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Server is missing ${name}. Add it in your hosting settings.`);
  return v;
}

/** Turns the providers' billing and permission errors into plain fixes. */
function explain(url: string, status: number, body: string): string | null {
  const b = body.toLowerCase();
  if (url.includes("fal.")) {
    if (b.includes("balance") || b.includes("locked") || b.includes("billing") || status === 402)
      return "The video service (fal.ai) is out of credit. Add credit at fal.ai/dashboard/billing, then try again.";
    if (status === 401 || status === 403) return "The video service (fal.ai) rejected the FAL_KEY. Check the key in Vercel.";
  }
  if (url.includes("elevenlabs")) {
    if (b.includes("voice_cloning") || b.includes("instant voice") || b.includes("paid_plan") || b.includes("subscription"))
      return "Your ElevenLabs plan doesn't include voice cloning (it needs Starter or higher). Upgrade at elevenlabs.io, or use \"Pick a voice\" for now.";
    if (b.includes("quota") || b.includes("credits") || status === 402)
      return "ElevenLabs is out of credits for this month. Add credits at elevenlabs.io, then try again.";
    if (b.includes("missing_permissions") || b.includes("permission"))
      return "The ElevenLabs key is missing a permission. It needs Text to Speech (Access) and Voices (Write).";
    if (status === 401) return "ElevenLabs rejected the ELEVENLABS_API_KEY. Check the key in Vercel.";
  }
  if (url.includes("stripe.com") && status === 401) return "Stripe rejected the STRIPE_SECRET_KEY. Check the key in Vercel.";
  return null;
}

async function failText(res: Response, what: string): Promise<never> {
  let detail = "";
  try {
    detail = (await res.text()).slice(0, 500);
  } catch {
    /* ignore */
  }
  console.error(`${what} failed`, res.status, res.url, detail);
  throw new Error(explain(res.url, res.status, detail) || `${what} failed (${res.status}) ${detail.slice(0, 200)}`.trim());
}

/* ---------------- fal.ai ---------------- */

const falHeaders = () => ({ Authorization: `Key ${need("FAL_KEY")}` });

/** Uploads a file to the fal CDN and returns its public URL. */
export async function falUpload(file: Blob, fileName: string): Promise<string> {
  const contentType = file.type || "application/octet-stream";
  const init = await fetch("https://rest.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3", {
    method: "POST",
    headers: { ...falHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ content_type: contentType, file_name: fileName }),
  });
  if (!init.ok) await failText(init, "File upload");
  const { upload_url, file_url } = (await init.json()) as { upload_url: string; file_url: string };
  const put = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
  if (!put.ok) await failText(put, "File upload");
  return file_url;
}

export async function falSubmitAvatar(imageUrl: string, audioUrl: string, prompt: string): Promise<string> {
  const res = await fetch(`https://queue.fal.run/${AVATAR_MODEL}`, {
    method: "POST",
    headers: { ...falHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, audio_url: audioUrl, prompt: prompt || "." }),
  });
  if (!res.ok) await failText(res, "Starting the video");
  const data = (await res.json()) as { request_id: string };
  return data.request_id;
}

export type JobStatus =
  | { state: "queued"; position?: number }
  | { state: "rendering" }
  | { state: "done"; videoUrl: string }
  | { state: "failed"; error: string };

const safeId = (id: string) => /^[A-Za-z0-9-]{8,80}$/.test(id);

export async function falVideoUrl(requestId: string): Promise<string> {
  if (!safeId(requestId)) throw new Error("Bad request id");
  const res = await fetch(`https://queue.fal.run/${AVATAR_APP}/requests/${requestId}`, { headers: falHeaders() });
  if (!res.ok) await failText(res, "Getting the video");
  const data = (await res.json()) as { video?: { url?: string } };
  if (!data.video?.url) throw new Error("The video service returned no video.");
  return data.video.url;
}

export async function falStatus(requestId: string): Promise<JobStatus> {
  if (!safeId(requestId)) return { state: "failed", error: "Bad request id" };
  const res = await fetch(`https://queue.fal.run/${AVATAR_APP}/requests/${requestId}/status`, {
    headers: falHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await failText(res, "Checking the video");
  const s = (await res.json()) as { status: string; queue_position?: number; error?: string };
  if (s.status === "IN_QUEUE") return { state: "queued", position: s.queue_position };
  if (s.status === "IN_PROGRESS") return { state: "rendering" };
  if (s.status === "COMPLETED") {
    if (s.error) return { state: "failed", error: s.error };
    try {
      return { state: "done", videoUrl: await falVideoUrl(requestId) };
    } catch (e) {
      return { state: "failed", error: (e as Error).message };
    }
  }
  return { state: "rendering" };
}

/* ---------------- ElevenLabs ---------------- */

const xi = () => ({ "xi-api-key": need("ELEVENLABS_API_KEY") });

/** Makes a temporary instant voice clone. Delete it with elevenDeleteVoice when done. */
export async function elevenCloneVoice(sample: Blob): Promise<string> {
  const form = new FormData();
  form.append("name", `Cinegram_${Date.now()}`);
  form.append("description", "Temporary clone for one Cinegram card (deleted after use)");
  form.append("remove_background_noise", "true");
  form.append("files", sample, "sample.wav");
  const res = await fetch("https://api.elevenlabs.io/v1/voices/add", { method: "POST", headers: xi(), body: form });
  if (!res.ok) await failText(res, "Voice cloning");
  const data = (await res.json()) as { voice_id: string };
  return data.voice_id;
}

export async function elevenSpeak(voiceId: string, text: string, lang: string): Promise<Blob> {
  // Multilingual v2 covers English, Spanish, French, Portuguese and Mandarin; v3 adds Cantonese.
  const model = lang === "yue" ? "eleven_v3" : "eleven_multilingual_v2";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { ...xi(), "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
    }),
  });
  if (!res.ok) await failText(res, "Making the speech");
  return new Blob([await res.arrayBuffer()], { type: "audio/mpeg" });
}

export async function elevenDeleteVoice(voiceId: string): Promise<void> {
  try {
    await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, { method: "DELETE", headers: xi() });
  } catch {
    /* best effort */
  }
}

/* ---------------- Stripe ---------------- */

const stripeAuth = () => ({ Authorization: `Bearer ${need("STRIPE_SECRET_KEY")}` });

export const PRICE_CENTS = 299;

export async function stripeCreateCheckout(requestId: string, appUrl: string): Promise<string> {
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": "Cinegram HD Video Card",
    "line_items[0][price_data][product_data][description]": "Download your video card without the preview watermark",
    "metadata[request_id]": requestId,
    success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?status=cancelled`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { ...stripeAuth(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) await failText(res, "Checkout");
  const data = (await res.json()) as { url: string };
  return data.url;
}

/** Returns the paid card's request id, or null if the session isn't paid. */
export async function stripePaidRequestId(sessionId: string): Promise<string | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: stripeAuth(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const s = (await res.json()) as { payment_status?: string; metadata?: { request_id?: string } };
  if (s.payment_status !== "paid") return null;
  return s.metadata?.request_id || null;
}

export function appUrl(req: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}
