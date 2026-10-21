// Emails a paid AI video card to its recipient.
import { NextRequest, NextResponse } from "next/server";
import { isCardOccasion } from "../../../lib/cardsCatalog";
import { getCardBySession, insertCard, newId, updateCard } from "../../../lib/db";
import { cardEmail, isEmail, sendEmail } from "../../../lib/email";
import { isLang } from "../../../lib/i18n";
import { PRICE } from "../../../lib/send";
import { appUrl, falVideoUrl, stripePaidRequestId } from "../../../lib/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as { sessionId?: string; toName?: string; toEmail?: string; fromName?: string; lang?: string; occasion?: string };
    const sessionId = String(b.sessionId || "");
    const toName = String(b.toName || "").trim().slice(0, 60), fromName = String(b.fromName || "").trim().slice(0, 60);
    const toEmail = String(b.toEmail || "").trim().toLowerCase();
    if (!toName || !fromName) return NextResponse.json({ error: "Please add both names." }, { status: 400 });
    if (!isEmail(toEmail)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
    const requestId = await stripePaidRequestId(sessionId);
    if (!requestId) return NextResponse.json({ error: "Payment not found." }, { status: 402 });

    let card = await getCardBySession(sessionId);
    if (!card) {
      card = await insertCard({
        id: newId(), kind: "video", card_id: "video", occasion: isCardOccasion(b.occasion) ? b.occasion : "thinking", lang: isLang(b.lang) ? b.lang : "en",
        to_name: toName, to_email: toEmail, from_name: fromName, video_url: await falVideoUrl(requestId), price_cents: PRICE.video,
        stripe_session_id: sessionId, paid_at: new Date().toISOString(),
      });
    }
    const link = `${appUrl(req)}/c/${card.id}`;
    if (card.sent_at) return NextResponse.json({ sent: true, link, toEmail: card.to_email });
    await sendEmail(card.to_email, cardEmail({ lang: card.lang, toName: card.to_name, fromName: card.from_name, link, kind: "video" }));
    await updateCard(card.id, { sent_at: new Date().toISOString() });
    return NextResponse.json({ sent: true, link, toEmail: card.to_email });
  } catch (err) {
    console.error("Send video error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
