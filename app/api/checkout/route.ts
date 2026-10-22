// Creates a $2.99 Stripe Checkout session for one finished video, and saves who it's going to
// so it can be delivered automatically (by email, or by the sender's own text) once paid.
import { NextRequest, NextResponse } from "next/server";
import { isCardOccasion } from "../../../lib/cardsCatalog";
import { insertCard, newId } from "../../../lib/db";
import { isEmail } from "../../../lib/email";
import { isLang } from "../../../lib/i18n";
import { PRICE } from "../../../lib/send";
import { appUrl, falStatus, stripeCreateCheckout } from "../../../lib/server";
import { cleanPhone, isPhone } from "../../../lib/textSend";

export const runtime = "nodejs";

const clean = (v: unknown, max: number) => String(v || "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Record<string, unknown>;
    const requestId = clean(b.requestId, 120);
    if (!requestId) return NextResponse.json({ error: "Missing video id." }, { status: 400 });

    const toName = clean(b.toName, 60), fromName = clean(b.fromName, 60);
    const deliverBy = b.deliverBy === "text" ? "text" : "email";
    const toEmail = clean(b.toEmail, 254).toLowerCase(), toPhone = clean(b.toPhone, 30);
    const hasRecipient = !!(toName && fromName);
    if (hasRecipient) {
      if (deliverBy === "email" && !isEmail(toEmail)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
      if (deliverBy === "text" && toPhone && !isPhone(toPhone)) return NextResponse.json({ error: "That mobile number doesn't look right." }, { status: 400 });
    }

    // Only sell videos that actually finished.
    const status = await falStatus(requestId);
    if (status.state !== "done") return NextResponse.json({ error: "That video isn't ready." }, { status: 400 });

    const session = await stripeCreateCheckout(requestId, appUrl(req), hasRecipient ? toName : undefined);
    if (hasRecipient) {
      await insertCard({
        id: newId(), kind: "video", card_id: "video", occasion: isCardOccasion(b.occasion) ? b.occasion : "thinking",
        lang: isLang(b.lang) ? b.lang : "en", to_name: toName, from_name: fromName,
        to_email: deliverBy === "email" ? toEmail : "", deliver_by: deliverBy, to_phone: deliverBy === "text" && toPhone ? cleanPhone(toPhone) : null,
        video_url: status.videoUrl || null, price_cents: PRICE.video, stripe_session_id: session.id,
      });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
