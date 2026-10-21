// After Stripe sends the buyer back: confirms payment and emails the card (once).
import { NextRequest, NextResponse } from "next/server";
import { getCard, updateCard } from "../../../lib/db";
import { cardEmail, sendEmail } from "../../../lib/email";
import { appUrl, stripeSendPaid } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { order, sessionId } = (await req.json()) as { order?: string; sessionId?: string };
    const card = order ? await getCard(order) : null;
    if (!card || !sessionId || card.stripe_session_id !== sessionId) return NextResponse.json({ error: "We couldn't find that card." }, { status: 404 });
    if (!card.paid_at) {
      if (!(await stripeSendPaid(sessionId, card.id))) return NextResponse.json({ paid: false }, { status: 402 });
      await updateCard(card.id, { paid_at: new Date().toISOString() });
    }
    const link = `${appUrl(req)}/c/${card.id}`;
    const base = { paid: true, link, toName: card.to_name, toEmail: card.to_email, kind: card.kind, cardId: card.card_id };
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
