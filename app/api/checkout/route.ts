// Creates a $2.99 Stripe Checkout session tied to one finished video.
import { NextRequest, NextResponse } from "next/server";
import { appUrl, falStatus, stripeCreateCheckout } from "../../../lib/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { requestId } = (await req.json()) as { requestId?: string };
    if (!requestId) return NextResponse.json({ error: "Missing video id." }, { status: 400 });
    // Only sell videos that actually finished.
    const status = await falStatus(requestId);
    if (status.state !== "done") return NextResponse.json({ error: "That video isn't ready." }, { status: 400 });
    const url = await stripeCreateCheckout(requestId, appUrl(req));
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
