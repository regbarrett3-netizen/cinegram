// Setup check: which Stripe key the server uses and whether Stripe accepts it.
// Never returns key values: only variable names, the key's type prefix, length and Stripe's verdict.
import { NextResponse } from "next/server";
import { stripeAccepts, stripeKeyChoice } from "../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function describe(raw?: string) {
  if (!raw) return { set: false };
  const k = raw.trim().replace(/^["']|["']$/g, "");
  const type = k.match(/^([a-z]{2,4}_(?:live|test))_/)?.[1] || "unrecognized prefix";
  const verdict = await stripeAccepts(k);
  return { set: true, type, length: k.length, spacesAround: k !== raw.trim() || raw !== raw.trim(), stripeAccepts: verdict.ok, stripeStatus: verdict.status, stripeError: verdict.error };
}

export async function GET() {
  const choice = await stripeKeyChoice();
  return NextResponse.json({
    stripeInUse: choice.source,
    stripeMode: /_live_/.test(choice.key) ? "live" : /_test_/.test(choice.key) ? "test" : "unknown",
    STRIPE_LIVE_SECRET_KEY: await describe(process.env.STRIPE_LIVE_SECRET_KEY),
    STRIKE_LIVE_SECRET_KEY: await describe(process.env.STRIKE_LIVE_SECRET_KEY),
    stripeVariableNames: Object.keys(process.env).filter((n) => /STRIPE|STRIKE/i.test(n)).sort(),
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
