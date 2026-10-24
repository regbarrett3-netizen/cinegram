// After Stripe sends the buyer back: confirms payment and emails the card (once).
// Free replies are already marked paid by /api/order and need no Stripe session.
import { NextRequest, NextResponse } from "next/server";
import { getCard, updateCard } from "../../../lib/db";
import { cardEmail, sendEmail } from "../../../lib/email";
import { appUrl, stripeSendSession } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { order, sessionId } = (await req.json()) as { order?: string; sessionId?: string };
    const card = order ? await getCard(order) : null;
    const freeReply = !!card && card.price_cents === 0 && !!card.reply_to && !!card.paid_at;
    if (!card || (!freeReply && (!sessionId || card.stripe_session_id !== sessionId))) return NextResponse.json({ error: "We couldn't find that card." }, { status: 404 });
    if (!card.paid_at) {
      const s = await stripeSendSession(sessionId as string, card.id);
      if (!s.paid) return NextResponse.json({ paid: false }, { status: 402 });
      await updateCard(card.id, { paid_at: new Date().toISOString(), ...(s.email && !card.sender_email ? { sender_email: s.email.toLowerCase() } : {}) });
    }
    const link = `${appUrl(req)}/c/${card.id}`;
    // A reply goes to an address the replier never saw, so it isn't sent back to them.
    const shownEmail = card.reply_to ? "" : card.to_email;
    const base = { paid: true, link, toName: card.to_name, toEmail: shownEmail, kind: card.kind, cardId: card.card_id, reply: !!card.reply_to };
    // Text delivery: the buyer sends the link from their own phone, so there's nothing to send here.
    if (card.deliver_by === "text") {
      if (!card.sent_at) await updateCard(card.id, { sent_at: new Date().toISOString(), send_error: null });
      return NextResponse.json({ ...base, sent: true, byText: true, toPhone: card.to_phone, fromName: card.from_name });
    }
    if (card.sent_at) return NextResponse.json({ ...base, sent: true });
    try {
      await sendEmail(card.to_email, cardEmail({ lang: card.lang, toName: card.to_name, fromName: card.from_name, link, kind: card.kind, imageUrl: card.image_url }));
      await updateCard(card.id, { sent_at: new Date().toISOString(), send_error: null });
      return NextResponse.json({ ...base, sent: true });
    } catch (e) {
      await updateCard(card.id, { send_error: (e as Error).message.slice(0, 300) });
      return NextResponse.json({ ...base, sent: false, error: (e as Error).message });
    }
  } catch (err) {
    console.error("Deliver error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
