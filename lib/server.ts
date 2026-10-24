// Server-only helpers: fal.ai (storage + queue), ElevenLabs (voice clone + speech), Stripe.
// Plain fetch calls, so there are no SDK versions to break the build.

import { CARD_PRICE_CENTS } from "./cardsCatalog";
import { ACTION_PRICE_CENTS } from "./action/catalog";

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

const LIVE_KEY_VARS = ["STRIPE_LIVE_SECRET_KEY", "STRIKE_LIVE_SECRET_KEY"] as const;
let picked: { key: string; source: string; at: number } | null = null;

/** Asks Stripe whether a key works, without creating anything. */
export async function stripeAccepts(key: string): Promise<{ ok: boolean; status: number; livemode?: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions?limit=1", { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as { data?: { livemode?: boolean }[]; error?: { code?: string; type?: string } };
    return { ok: res.ok, status: res.status, livemode: body.data?.[0]?.livemode, error: body.error?.code || body.error?.type };
  } catch (e) {
    return { ok: false, status: 0, error: (e as Error).message };
  }
}

/**
 * Uses the live key only if Stripe actually accepts it; otherwise falls back to STRIPE_SECRET_KEY,
 * so a bad paste can never break checkout. The choice is re-checked every 10 minutes.
 */
export async function stripeKeyChoice(): Promise<{ key: string; source: string }> {
  if (picked && Date.now() - picked.at < 10 * 60 * 1000) return picked;
  for (const name of LIVE_KEY_VARS) {
    const k = process.env[name]?.trim().replace(/^["']|["']$/g, "");
    if (k && (await stripeAccepts(k)).ok) { picked = { key: k, source: name, at: Date.now() }; return picked; }
  }
  picked = { key: need("STRIPE_SECRET_KEY"), source: "STRIPE_SECRET_KEY", at: Date.now() };
  return picked;
}
const stripeAuth = async () => ({ Authorization: `Bearer ${(await stripeKeyChoice()).key}` });

export const PRICE_CENTS = 299;

// Cards are delivered the moment payment clears, so every sale is final.
const FINAL_SALE_EN = "All sales are final. Your card is delivered instantly after payment, so it can't be refunded.";

export async function stripeCreateCheckout(requestId: string, appUrl: string, toName?: string): Promise<{ url: string; id: string }> {
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": "Cinegram Video Card",
    "line_items[0][price_data][product_data][description]": toName ? `Your talking video card, sent to ${toName} as soon as payment completes` : "Your talking video card, without the preview watermark",
    "metadata[request_id]": requestId,
    "custom_text[submit][message]": FINAL_SALE_EN,
    success_url: `${appUrl}/video?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/video?status=cancelled`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { ...(await stripeAuth()), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) await failText(res, "Checkout");
  const data = (await res.json()) as { url: string; id: string };
  return { url: data.url, id: data.id };
}

/** Returns the paid card's request id, or null if the session isn't paid. */
export async function stripePaidRequestId(sessionId: string): Promise<string | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: await stripeAuth(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const s = (await res.json()) as { payment_status?: string; metadata?: { request_id?: string } };
  if (s.payment_status !== "paid") return null;
  return s.metadata?.request_id || null;
}

/* ---------------- Quick Cards ($1.99, no AI) ---------------- */

export async function stripeCreateCardCheckout(o: {
  cardId: string;
  occasion: string;
  title: string;
  lang: string;
  appUrl: string;
}): Promise<string> {
  const back = `${o.appUrl}/cards/${o.occasion}?card=${encodeURIComponent(o.cardId)}&lang=${encodeURIComponent(o.lang)}`;
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(CARD_PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": `Cinegram Quick Card: ${o.title}`,
    "line_items[0][price_data][product_data][description]": "Ready-made art card, full-size download without the watermark",
    "metadata[kind]": "card",
    "metadata[card_id]": o.cardId,
    "custom_text[submit][message]": FINAL_SALE_EN,
    success_url: `${back}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${back}&status=cancelled`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { ...(await stripeAuth()), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) await failText(res, "Checkout");
  const data = (await res.json()) as { url: string };
  return data.url;
}

/** Returns the paid Quick Card's id, or null if the session isn't a paid card purchase. */
export async function stripePaidCardId(sessionId: string): Promise<string | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: await stripeAuth(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const s = (await res.json()) as { payment_status?: string; metadata?: { kind?: string; card_id?: string } };
  if (s.payment_status !== "paid" || s.metadata?.kind !== "card") return null;
  return s.metadata?.card_id || null;
}

/* ---------------- Action Cards ($2.99 video) ---------------- */

export async function stripeCreateActionCheckout(o: { actionId: string; title: string; lang: string; appUrl: string }): Promise<string> {
  const back = `${o.appUrl}/action?card=${encodeURIComponent(o.actionId)}&lang=${encodeURIComponent(o.lang)}`;
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(ACTION_PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": `Cinegram Action Card: ${o.title}`,
    "line_items[0][price_data][product_data][description]": "Animated video card, downloadable without the watermark",
    "metadata[kind]": "action",
    "metadata[action_id]": o.actionId,
    "custom_text[submit][message]": FINAL_SALE_EN,
    success_url: `${back}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${back}&status=cancelled`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { ...(await stripeAuth()), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) await failText(res, "Checkout");
  const data = (await res.json()) as { url: string };
  return data.url;
}

/** Returns the paid action card's id, or null if the session isn't a paid action-card purchase. */
export async function stripePaidActionId(sessionId: string): Promise<string | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, { headers: await stripeAuth(), cache: "no-store" });
  if (!res.ok) return null;
  const s = (await res.json()) as { payment_status?: string; metadata?: { kind?: string; action_id?: string } };
  if (s.payment_status !== "paid" || s.metadata?.kind !== "action") return null;
  return s.metadata?.action_id || null;
}

/* ---------------- 1-2-3 send flow ---------------- */

export async function stripeCreateSendCheckout(o: { orderId: string; title: string; cents: number; appUrl: string; toName: string }): Promise<{ url: string; id: string }> {
  const back = `${o.appUrl}/?order=${encodeURIComponent(o.orderId)}`;
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(o.cents),
    "line_items[0][price_data][product_data][name]": `Cinegram: ${o.title}`,
    "line_items[0][price_data][product_data][description]": `Emailed to ${o.toName.slice(0, 60)} as soon as payment completes`,
    "metadata[kind]": "send",
    "metadata[order_id]": o.orderId,
    "custom_text[submit][message]": FINAL_SALE_EN,
    success_url: `${back}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${back}&status=cancelled`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { ...(await stripeAuth()), "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!res.ok) await failText(res, "Checkout");
  const data = (await res.json()) as { url: string; id: string };
  return { url: data.url, id: data.id };
}

/** True only when the session is paid and belongs to this order. */
export async function stripeSendPaid(sessionId: string, orderId: string): Promise<boolean> {
  return (await stripeSendSession(sessionId, orderId)).paid;
}

/** Whether the session is paid for this order, plus the buyer's email (used to route replies back to them). */
export async function stripeSendSession(sessionId: string, orderId: string): Promise<{ paid: boolean; email: string | null }> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { paid: false, email: null };
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, { headers: await stripeAuth(), cache: "no-store" });
  if (!res.ok) return { paid: false, email: null };
  const s = (await res.json()) as { payment_status?: string; metadata?: { kind?: string; order_id?: string }; customer_details?: { email?: string | null } | null };
  const paid = s.payment_status === "paid" && s.metadata?.kind === "send" && s.metadata?.order_id === orderId;
  return { paid, email: paid ? (s.customer_details?.email || null) : null };
}

export function appUrl(req: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}
