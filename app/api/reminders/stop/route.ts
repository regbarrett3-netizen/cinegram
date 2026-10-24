// One-tap unsubscribe from a birthday reminder (linked from every reminder email).
import { NextRequest } from "next/server";
import { stopReminder } from "../../../../lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const page = (msg: string) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Cinegram</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#1a1022;color:#fdf2f8;font-family:Georgia,serif;text-align:center;padding:24px"><div><p style="font-size:22px">${msg}</p><p><a href="/" style="color:#f9a8d4">cinegramcards.com</a></p></div></body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

export async function GET(req: NextRequest) {
  try {
    const ok = await stopReminder(req.nextUrl.searchParams.get("id") || "", req.nextUrl.searchParams.get("t") || "");
    return page(ok ? "Done. You won't get this reminder again." : "That link has already been used or has expired.");
  } catch {
    return page("Something went wrong. Please try the link again.");
  }
}
