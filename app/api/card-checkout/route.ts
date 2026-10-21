// Starts a $1.99 Stripe Checkout for one Quick Card.
import { NextRequest, NextResponse } from "next/server";
import { CARD_TEXT, cardById } from "../../../lib/cardsCatalog";
import { isLang } from "../../../lib/i18n";
import { appUrl, stripeCreateCardCheckout } from "../../../lib/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { cardId, lang } = (await req.json()) as { cardId?: string; lang?: string };
    const card = cardById(cardId);
    if (!card) return NextResponse.json({ error: "Unknown card." }, { status: 400 });
    const url = await stripeCreateCardCheckout({
      cardId: card.id,
      occasion: card.occasion,
      title: CARD_TEXT.en[card.id].h,
      lang: isLang(lang) ? lang : "en",
      appUrl: appUrl(req),
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Card checkout error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
