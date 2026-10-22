// Setup check: reports which Stripe key the server is using and whether it's live or test.
// Never returns key values, only variable names and the key's mode.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Describes a key without revealing it: its type prefix, length, and common paste problems. */
function mode(raw?: string) {
  if (!raw) return "missing";
  const k = raw.trim(), notes: string[] = [];
  if (k !== raw) notes.push("has spaces or line breaks around it");
  if (/\s/.test(k)) notes.push("has spaces inside");
  if (/^["'].*["']$/.test(k)) notes.push("wrapped in quotes");
  const m = k.replace(/^["']/, "").match(/^([a-z]+_(?:live|test))_/);
  const kind = !m ? "not a Stripe key"
    : m[1].startsWith("sk_") || m[1].startsWith("rk_") ? (m[1].endsWith("live") ? "live" : "test")
    : m[1].startsWith("pk_") ? "PUBLISHABLE key (wrong one: need the SECRET key)"
    : `${m[1]} key (wrong type)`;
  return `${kind}; ${k.length} characters${notes.length ? "; " + notes.join(", ") : ""}`;
}

export async function GET() {
  const live = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIKE_LIVE_SECRET_KEY;
  const regular = process.env.STRIPE_SECRET_KEY;
  return NextResponse.json({
    stripeInUse: process.env.STRIPE_LIVE_SECRET_KEY ? "STRIPE_LIVE_SECRET_KEY" : process.env.STRIKE_LIVE_SECRET_KEY ? "STRIKE_LIVE_SECRET_KEY" : regular ? "STRIPE_SECRET_KEY" : "none",
    stripeMode: mode(live || regular),
    STRIPE_LIVE_SECRET_KEY: mode(process.env.STRIPE_LIVE_SECRET_KEY),
    STRIKE_LIVE_SECRET_KEY: mode(process.env.STRIKE_LIVE_SECRET_KEY),
    STRIPE_SECRET_KEY: mode(regular),
    stripeVariableNames: Object.keys(process.env).filter((n) => /STRIPE|STRIKE/i.test(n)).sort(),
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
