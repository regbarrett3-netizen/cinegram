// Server-only access to the Cinegram database (Supabase) and file storage.
// Uses the service-role key, so this module must never be imported by browser code.

export const SUPABASE_URL = process.env.SUPABASE_URL || "https://maelbbhiikzkjyodbqoa.supabase.co";

function key(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it in your hosting settings.");
  return k;
}
const headers = () => ({ apikey: key(), Authorization: `Bearer ${key()}` });

export type SentCard = {
  id: string;
  created_at: string;
  kind: "quick" | "action" | "video";
  card_id: string;
  occasion: string;
  lang: string;
  to_name: string;
  to_email: string;
  deliver_by: "email" | "text";
  to_phone: string | null;
  from_name: string;
  photo_url: string | null;
  image_url: string | null;
  video_url: string | null;
  price_cents: number;
  stripe_session_id: string | null;
  paid_at: string | null;
  sent_at: string | null;
  opened_at: string | null;
  send_error: string | null;
};

/** Short, unguessable id for recipient links (12 chars, base62). */
export function newId(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => chars[b % 62]).join("");
}

async function fail(res: Response, what: string): Promise<never> {
  const body = (await res.text().catch(() => "")).slice(0, 300);
  console.error(`${what} failed`, res.status, body);
  if (res.status === 401 || res.status === 403) throw new Error("The database rejected SUPABASE_SERVICE_ROLE_KEY. Check the key in Vercel.");
  throw new Error(`${what} failed (${res.status}).`);
}

export async function insertCard(row: Partial<SentCard> & Pick<SentCard, "id" | "kind" | "card_id" | "occasion" | "to_name" | "to_email" | "from_name" | "price_cents">): Promise<SentCard> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sent_cards`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  if (!res.ok) await fail(res, "Saving the card");
  return ((await res.json()) as SentCard[])[0];
}

export async function getCard(id: string): Promise<SentCard | null> {
  if (!/^[0-9A-Za-z]{6,24}$/.test(id)) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sent_cards?id=eq.${id}&select=*`, { headers: headers(), cache: "no-store" });
  if (!res.ok) await fail(res, "Loading the card");
  return ((await res.json()) as SentCard[])[0] || null;
}

export async function getCardBySession(sessionId: string): Promise<SentCard | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sent_cards?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=*`, { headers: headers(), cache: "no-store" });
  if (!res.ok) await fail(res, "Loading the card");
  return ((await res.json()) as SentCard[])[0] || null;
}

export async function updateCard(id: string, patch: Partial<SentCard>): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sent_cards?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) await fail(res, "Updating the card");
}

/** Uploads a file to a public bucket and returns its public URL. */
export async function uploadPublic(bucket: "photos" | "cards", path: string, file: Blob, type: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": type, "x-upsert": "true", "Cache-Control": "max-age=31536000" },
    body: file,
  });
  if (!res.ok) await fail(res, "Uploading the image");
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/** Only our own storage URLs are accepted back from the browser. */
export const isOurStorageUrl = (u: unknown): u is string =>
  typeof u === "string" && u.startsWith(`${SUPABASE_URL}/storage/v1/object/public/`) && u.length < 400;
