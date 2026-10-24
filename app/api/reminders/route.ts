// Saves a birthday reminder: we email the sender a week before so they can send a card.
import { NextRequest, NextResponse } from "next/server";
import { isEmail } from "../../../lib/email";
import { addReminder, validDay } from "../../../lib/reminders";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as { email?: string; toName?: string; month?: number; day?: number; lang?: string };
    const email = String(b.email || "").trim().toLowerCase().slice(0, 254);
    const toName = String(b.toName || "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, 60);
    const month = Number(b.month), day = Number(b.day);
    if (!isEmail(email)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
    if (!toName) return NextResponse.json({ error: "Please add a name." }, { status: 400 });
    if (!validDay(month, day)) return NextResponse.json({ error: "Please pick a real date." }, { status: 400 });
    await addReminder({ email, toName, month, day, lang: String(b.lang || "en") });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reminder error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
