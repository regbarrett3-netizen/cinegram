// Setup check: reports which Stripe key the server is using and whether it's live or test.
// Never returns key values, only variable names and the key's mode.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mode(k?: string) {
  if (!k) return "missing";
  if (/^(sk|rk)_live_/.test(k)) return "live";
  if (/^(sk|rk)_test_/.test(k)) return "test";
  return "unrecognized";
}

export async function GET() {
  const live = process.env.STRIPE_LIVE_SECRET_KEY;
  const regular = process.env.STRIPE_SECRET_KEY;
  return NextResponse.json({
    stripeInUse: live ? "STRIPE_LIVE_SECRET_KEY" : regular ? "STRIPE_SECRET_KEY" : "none",
    stripeMode: mode(live || regular),
    STRIPE_LIVE_SECRET_KEY: mode(live),
    STRIPE_SECRET_KEY: mode(regular),
    stripeVariableNames: Object.keys(process.env).filter((n) => /STRIPE/i.test(n)).sort(),
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
