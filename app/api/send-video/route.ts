// Delivers a paid AI video card. Normally the recipient was saved at checkout, so this only
// confirms payment and sends it; older sessions can still pass the recipient here.
import { NextRequest, NextResponse } from "next/server";
import { isCardOccasion } from "../../../lib/cardsCatalog";
import { getCardBySession, insertCard, newId, updateCard } from "../../../lib/db";
import { cardEmail, isEmail, sendEmail } from "../../../lib/email";
import { isLang } from "../../../lib/i18n";
import { PRICE } from "../../../lib/send";
import { appUrl, falVideoUrl, stripePaidRequestId } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as { sessionId?: string; toName?: string; toEmail?: string; fromName?: string; lang?: string; occasion?: string };
    const sessionId = String(b.sessionId || "");
    const requestId = await stripePaidRequestId(sessionId);
    if (!requestId) return NextResponse.json({ paid: false, error: "Payment not found." }, { status: 402 });

    let card = await getCardBySession(sessionId);
    if (!card) {
      // Older flow: recipient typed in after payment.
      const toName = String(b.toName || "").trim().slice(0, 60), fromName = String(b.fromName || "").trim().slice(0, 60);
      const toEmail = String(b.toEmail || "").trim().toLowerCase();
      if (!toName || !fromName) return NextResponse.json({ paid: true, needRecipient: true, error: "Please add both names." }, { status: 400 });
      if (!isEmail(toEmail)) return NextResponse.json({ paid: true, needRecipient: true, error: "That email address doesn't look right." }, { status: 400 });
      card = await insertCard({
        id: newId(), kind: "video", card_id: "video", occasion: isCardOccasion(b.occasion) ? b.occasion : "thinking", lang: isLang(b.lang) ? b.lang : "en",
        to_name: toName, to_email: toEmail, from_name: fromName, video_url: await falVideoUrl(requestId), price_cents: PRICE.video,
        stripe_session_id: sessionId, paid_at: new Date().toISOString(),
      });
    }
    if (!card.paid_at || !card.video_url) {
      const patch = { paid_at: card.paid_at || new Date().toISOString(), video_url: card.video_url || (await falVideoUrl(requestId)) };
      await updateCard(card.id, patch);
      card = { ...card, ...patch };
    }

    const link = `${appUrl(req)}/c/${card.id}`;
    const base = { paid: true, link, toName: card.to_name, toEmail: card.to_email, fromName: card.from_name, videoUrl: card.video_url };

    // Text or social: the sender shares the link from their own phone.
    if (card.deliver_by === "text") {
      if (!card.sent_at) await updateCard(card.id, { sent_at: new Date().toISOString(), send_error: null });
      return NextResponse.json({ ...base, sent: true, byText: true, toPhone: card.to_phone });
    }
    if (card.sent_at) return NextResponse.json({ ...base, sent: true });
    try {
      await sendEmail(card.to_email, cardEmail({ lang: card.lang, toName: card.to_name, fromName: card.from_name, link, kind: "video" }));
      await updateCard(card.id, { sent_at: new Date().toISOString(), send_error: null });
      return NextResponse.json({ ...base, sent: true });
    } catch (e) {
      await updateCard(card.id, { send_error: (e as Error).message.slice(0, 300) });
      return NextResponse.json({ ...base, sent: false, error: (e as Error).message });
    }
  } catch (err) {
    console.error("Send video error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
