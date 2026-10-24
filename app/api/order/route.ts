// Saves a card the sender has finished choosing, then starts Stripe Checkout.
// The email goes out from /api/deliver once payment is confirmed.
// A reply to a card goes to that card's sender without anyone seeing their address, and the first reply is free.
import { NextRequest, NextResponse } from "next/server";
import { ACTION_TEXT, isActionId } from "../../../lib/action/catalog";
import { CARD_TEXT, cardById, isCardOccasion } from "../../../lib/cardsCatalog";
import { freeRepliesTo, getCard, insertCard, isOurStorageUrl, newId, updateCard, uploadPublic } from "../../../lib/db";
import { isEmail } from "../../../lib/email";
import { isLang } from "../../../lib/i18n";
import { cleanPhone, isPhone } from "../../../lib/textSend";
import { priceFor } from "../../../lib/send";
import { appUrl, stripeCreateSendCheckout } from "../../../lib/server";

export const runtime = "nodejs";
const MB = 1024 * 1024;
const clean = (v: FormDataEntryValue | null, max: number) => String(v || "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  try {
    const f = await req.formData();
    const kind = clean(f.get("kind"), 10);
    const cardId = clean(f.get("cardId"), 40);
    const occasion = clean(f.get("occasion"), 20);
    const lang = clean(f.get("lang"), 4);
    const toName = clean(f.get("toName"), 60);
    let toEmail = clean(f.get("toEmail"), 254).toLowerCase();
    const fromName = clean(f.get("fromName"), 60);
    let deliverBy: "email" | "text" = clean(f.get("deliverBy"), 6) === "text" ? "text" : "email";
    const toPhone = clean(f.get("toPhone"), 30);
    const photoUrl = clean(f.get("photoUrl"), 400) || null;
    const replyTo = clean(f.get("replyTo"), 24) || null;
    const image = f.get("image");

    if (kind !== "quick" && kind !== "action") return NextResponse.json({ error: "Unknown card type." }, { status: 400 });
    if (kind === "quick" ? !cardById(cardId) : !isActionId(cardId)) return NextResponse.json({ error: "Unknown card." }, { status: 400 });
    if (!isCardOccasion(occasion)) return NextResponse.json({ error: "Unknown occasion." }, { status: 400 });

    // Replies: the original card must exist and be paid. When we know its sender's email, we deliver there.
    let free = false;
    let original = null;
    if (replyTo) {
      original = await getCard(replyTo);
      if (!original || !original.paid_at) return NextResponse.json({ error: "We couldn't find the card you're replying to." }, { status: 400 });
      if (original.sender_email) {
        toEmail = original.sender_email;
        deliverBy = "email";
        free = (await freeRepliesTo(original.id)) === 0;
      }
    }

    if (!toName || !fromName) return NextResponse.json({ error: "Please add both names." }, { status: 400 });
    if (deliverBy === "email" && !isEmail(toEmail)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
    if (deliverBy === "text" && toPhone && !isPhone(toPhone)) return NextResponse.json({ error: "That mobile number doesn't look right." }, { status: 400 });
    if (photoUrl && !isOurStorageUrl(photoUrl)) return NextResponse.json({ error: "Please add the photo again." }, { status: 400 });

    const id = newId();
    let imageUrl: string | null = null;
    if (image instanceof Blob && image.size > 0 && image.size < 3 * MB && image.type === "image/jpeg") imageUrl = await uploadPublic("cards", `${id}.jpg`, image, "image/jpeg");

    const cents = free ? 0 : priceFor(kind, cardId);
    await insertCard({
      id, kind, card_id: cardId, occasion, lang: isLang(lang) ? lang : "en", to_name: toName, to_email: deliverBy === "email" ? toEmail : "",
      deliver_by: deliverBy, to_phone: deliverBy === "text" && toPhone ? cleanPhone(toPhone) : null, from_name: fromName, photo_url: photoUrl,
      image_url: imageUrl, price_cents: cents, reply_to: original ? original.id : null,
      // A reply's sender is the original card's recipient; their address lets the conversation keep going.
      sender_email: original && original.deliver_by === "email" && original.to_email ? original.to_email : null,
      paid_at: free ? new Date().toISOString() : null,
    });
    if (free) return NextResponse.json({ free: true, order: id });

    const title = kind === "quick" ? CARD_TEXT.en[cardId].h : `${ACTION_TEXT.en[cardId as keyof typeof ACTION_TEXT.en].name} (animated)`;
    const session = await stripeCreateSendCheckout({ orderId: id, title, cents, appUrl: appUrl(req), toName });
    await updateCard(id, { stripe_session_id: session.id });
    return NextResponse.json({ url: session.url, order: id });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
