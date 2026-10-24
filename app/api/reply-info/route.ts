// What the send flow needs to start a reply: names, language, and whether it's free. Never the email address.
import { NextRequest, NextResponse } from "next/server";
import { freeRepliesTo, getCard } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id") || "";
    const card = await getCard(id);
    if (!card || !card.paid_at) return NextResponse.json({ error: "We couldn't find that card." }, { status: 404 });
    const direct = !!card.sender_email;
    return NextResponse.json({
      id: card.id,
      // The reply goes from the person who received the card back to the person who sent it.
      toName: card.from_name,
      fromName: card.to_name,
      occasion: card.occasion,
      lang: card.lang,
      direct,
      free: direct && (await freeRepliesTo(card.id)) === 0,
    });
  } catch (err) {
    console.error("Reply info error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
