// Daily (Vercel Cron): emails everyone whose reminder date is a week away. Each reminder sends once a year,
// so running this twice in a day sends nothing new.
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../../lib/email";
import { markReminder, reminderEmail, remindersDue, weekAhead } from "../../../../lib/reminders";
import { appUrl } from "../../../../lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function allowed(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get("authorization") === `Bearer ${secret}`;
  // Without a secret set, only Vercel's scheduler may call this (and sending is once per reminder per year).
  return (req.headers.get("user-agent") || "").startsWith("vercel-cron/");
}

export async function GET(req: NextRequest) {
  if (!allowed(req)) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const { month, days, year } = weekAhead();
  const due = await remindersDue(month, days, year);
  const base = appUrl(req);
  let sent = 0;
  const failed: string[] = [];
  for (const r of due) {
    try {
      await sendEmail(r.email, reminderEmail(r, base));
      await markReminder(r.id, { last_sent_year: year });
      sent++;
    } catch (e) {
      failed.push(`${r.id}: ${(e as Error).message}`);
    }
  }
  return NextResponse.json({ date: `${year}-${month}-${days.join("/")}`, due: due.length, sent, failed });
}
