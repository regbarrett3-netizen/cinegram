// Saves a card the sender has finished choosing, then starts Stripe Checkout.
// The email goes out from /api/deliver once payment is confirmed.
import { NextRequest, NextResponse } from "next/server";
import { ACTION_TEXT, isActionId } from "../../../lib/action/catalog";
import { CARD_TEXT, cardById, isCardOccasion } from "../../../lib/cardsCatalog";
import { insertCard, isOurStorageUrl, newId, updateCard, uploadPublic } from "../../../lib/db";
import { isEmail } from "../../../lib/email";
import { isLang } from "../../../lib/i18n";
import { cleanPhone, isPhone } from "../../../lib/textSend";
import { PRICE } from "../../../lib/send";
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
    const toEmail = clean(f.get("toEmail"), 254).toLowerCase();
    const fromName = clean(f.get("fromName"), 60);
    const deliverBy = clean(f.get("deliverBy"), 6) === "text" ? "text" : "email";
    const toPhone = clean(f.get("toPhone"), 30);
    const photoUrl = clean(f.get("photoUrl"), 400) || null;
    const image = f.get("image");

    if (kind !== "quick" && kind !== "action") return NextResponse.json({ error: "Unknown card type." }, { status: 400 });
    if (kind === "quick" ? !cardById(cardId) : !isActionId(cardId)) return NextResponse.json({ error: "Unknown card." }, { status: 400 });
    if (!isCardOccasion(occasion)) return NextResponse.json({ error: "Unknown occasion." }, { status: 400 });
    if (!toName || !fromName) return NextResponse.json({ error: "Please add both names." }, { status: 400 });
    if (deliverBy === "email" && !isEmail(toEmail)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
    if (deliverBy === "text" && !isPhone(toPhone)) return NextResponse.json({ error: "That mobile number doesn't look right." }, { status: 400 });
    if (photoUrl && !isOurStorageUrl(photoUrl)) return NextResponse.json({ error: "Please add the photo again." }, { status: 400 });

    const id = newId();
    let imageUrl: string | null = null;
    if (image instanceof Blob && image.size > 0 && image.size < 3 * MB && image.type === "image/jpeg") imageUrl = await uploadPublic("cards", `${id}.jpg`, image, "image/jpeg");

    const cents = PRICE[kind];
    await insertCard({ id, kind, card_id: cardId, occasion, lang: isLang(lang) ? lang : "en", to_name: toName, to_email: deliverBy === "email" ? toEmail : "", deliver_by: deliverBy, to_phone: deliverBy === "text" ? cleanPhone(toPhone) : null, from_name: fromName, photo_url: photoUrl, image_url: imageUrl, price_cents: cents });
    const title = kind === "quick" ? CARD_TEXT.en[cardId].h : `${ACTION_TEXT.en[cardId as keyof typeof ACTION_TEXT.en].name} (animated)`;
    const session = await stripeCreateSendCheckout({ orderId: id, title, cents, appUrl: appUrl(req), toName });
    await updateCard(id, { stripe_session_id: session.id });
    return NextResponse.json({ url: session.url, order: id });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
