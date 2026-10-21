// Starts a $2.99 Stripe Checkout for one Action Card.
import { NextRequest, NextResponse } from "next/server";
import { ACTION_TEXT, isActionId } from "../../../lib/action/catalog";
import { isLang } from "../../../lib/i18n";
import { appUrl, stripeCreateActionCheckout } from "../../../lib/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { actionId, lang } = (await req.json()) as { actionId?: string; lang?: string };
    if (!isActionId(actionId)) return NextResponse.json({ error: "Unknown card." }, { status: 400 });
    const url = await stripeCreateActionCheckout({ actionId, title: ACTION_TEXT.en[actionId].name, lang: isLang(lang) ? lang : "en", appUrl: appUrl(req) });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Action checkout error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
