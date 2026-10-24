// Birthday reminders: stored in Supabase, emailed a week ahead by a daily cron. Server-only.
import { SUPABASE_URL, fail, headers, newId } from "./db";
import { isLang, type Lang } from "./i18n";

export type Reminder = {
  id: string;
  created_at: string;
  email: string;
  to_name: string;
  month: number;
  day: number;
  lang: string;
  occasion: string;
  token: string;
  active: boolean;
  last_sent_year: number | null;
};

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const validDay = (month: number, day: number) =>
  Number.isInteger(month) && Number.isInteger(day) && month >= 1 && month <= 12 && day >= 1 && day <= DAYS_IN_MONTH[month - 1];

export async function addReminder(r: { email: string; toName: string; month: number; day: number; lang: string }): Promise<Reminder> {
  // Cap per address so the form can't be used to flood someone.
  const existing = await fetch(`${SUPABASE_URL}/rest/v1/reminders?email=eq.${encodeURIComponent(r.email)}&active=eq.true&select=id`, { headers: headers(), cache: "no-store" });
  if (!existing.ok) await fail(existing, "Checking reminders");
  if (((await existing.json()) as unknown[]).length >= 30) throw new Error("That email already has the most reminders we allow.");

  const token = newId() + newId();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reminders`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ id: newId(), email: r.email, to_name: r.toName, month: r.month, day: r.day, lang: isLang(r.lang) ? r.lang : "en", occasion: "birthday", token, active: true }),
  });
  if (!res.ok) await fail(res, "Saving the reminder");
  return ((await res.json()) as Reminder[])[0];
}

/** Active reminders for a date that haven't been sent for that year yet. */
export async function remindersDue(month: number, days: number[], year: number): Promise<Reminder[]> {
  const q = `month=eq.${month}&day=in.(${days.join(",")})&active=eq.true&or=(last_sent_year.is.null,last_sent_year.lt.${year})&select=*`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reminders?${q}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) await fail(res, "Loading reminders");
  return (await res.json()) as Reminder[];
}

export async function markReminder(id: string, patch: Partial<Pick<Reminder, "active" | "last_sent_year">>): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reminders?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) await fail(res, "Updating the reminder");
}

export async function stopReminder(id: string, token: string): Promise<boolean> {
  if (!/^[0-9A-Za-z]{6,24}$/.test(id) || !/^[0-9A-Za-z]{12,48}$/.test(token)) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reminders?id=eq.${id}&token=eq.${token}`, {
    method: "PATCH",
    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ active: false }),
  });
  if (!res.ok) await fail(res, "Stopping the reminder");
  return ((await res.json()) as unknown[]).length > 0;
}

/** The date a week from `now` (UTC), with Feb 29 birthdays covered on Feb 28 in other years. */
export function weekAhead(now = new Date()): { month: number; days: number[]; year: number } {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7));
  const month = d.getUTCMonth() + 1, day = d.getUTCDate(), year = d.getUTCFullYear();
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const days = month === 2 && day === 28 && !leap ? [28, 29] : [day];
  return { month, days, year };
}

type T = { subject: (n: string) => string; body: (n: string) => string; cta: (n: string) => string; stop: string; footer: string };
const TEXT: Record<Lang, T> = {
  en: { subject: (n) => `${n}'s birthday is in a week 🎂`, body: (n) => `Just a heads-up: ${n}'s birthday is one week from today. There's still time to send a card in your own voice.`, cta: (n) => `Send ${n} a card`, stop: "Stop this reminder", footer: "You asked Cinegram to remind you · cinegramcards.com" },
  es: { subject: (n) => `El cumpleaños de ${n} es en una semana 🎂`, body: (n) => `Un aviso: el cumpleaños de ${n} es dentro de una semana. Aún hay tiempo para enviarle una tarjeta con tu propia voz.`, cta: (n) => `Enviar una tarjeta a ${n}`, stop: "No volver a avisarme", footer: "Pediste a Cinegram que te lo recordara · cinegramcards.com" },
  fr: { subject: (n) => `L'anniversaire de ${n} est dans une semaine 🎂`, body: (n) => `Petit rappel : l'anniversaire de ${n} est dans une semaine. Il est encore temps d'envoyer une carte avec ta propre voix.`, cta: (n) => `Envoyer une carte à ${n}`, stop: "Arrêter ce rappel", footer: "Tu as demandé à Cinegram de te le rappeler · cinegramcards.com" },
  pt: { subject: (n) => `O aniversário de ${n} é daqui a uma semana 🎂`, body: (n) => `Só um lembrete: o aniversário de ${n} é daqui a uma semana. Ainda há tempo para enviar um cartão com a tua própria voz.`, cta: (n) => `Enviar um cartão a ${n}`, stop: "Parar este lembrete", footer: "Pediste à Cinegram para te lembrar · cinegramcards.com" },
  zh: { subject: (n) => `${n}的生日还有一周 🎂`, body: (n) => `提醒一下：${n}的生日就在一周后。现在还来得及用你自己的声音寄一张贺卡。`, cta: (n) => `给${n}寄贺卡`, stop: "不再提醒", footer: "你让 Cinegram 提醒你 · cinegramcards.com" },
  yue: { subject: (n) => `${n}生日仲有一個禮拜 🎂`, body: (n) => `提提你：${n}生日就係一個禮拜之後。而家仲趕得切用你自己把聲寄張賀卡。`, cta: (n) => `寄張賀卡俾${n}`, stop: "唔使再提我", footer: "你叫 Cinegram 提你 · cinegramcards.com" },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function reminderEmail(r: Reminder, appUrl: string) {
  const lang: Lang = isLang(r.lang) ? r.lang : "en";
  const t = TEXT[lang];
  const send = `${appUrl}/?occasion=birthday&to=${encodeURIComponent(r.to_name)}&lang=${lang}`;
  const stop = `${appUrl}/api/reminders/stop?id=${r.id}&t=${r.token}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:Georgia,'Times New Roman',serif;color:#2b2233">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;padding:32px 28px;text-align:center"><tr><td>
<div style="font-family:Arial,sans-serif;font-weight:900;letter-spacing:2px;font-size:14px;color:#c026d3">CINEGRAM</div>
<div style="font-size:48px;margin:18px 0 6px">🎂</div>
<p style="font-size:18px;margin:0">${esc(t.body(r.to_name))}</p>
<a href="${send}" style="display:inline-block;margin-top:22px;padding:14px 28px;border-radius:999px;background:linear-gradient(90deg,#ec4899,#9333ea);color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:16px">${esc(t.cta(r.to_name))}</a>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#9a8ca3;margin:28px 0 0">${esc(t.footer)} · <a href="${stop}" style="color:#9a8ca3">${esc(t.stop)}</a></p>
</td></tr></table></td></tr></table></body></html>`;
  const text = `${t.body(r.to_name)}\n\n${t.cta(r.to_name)}: ${send}\n\n${t.stop}: ${stop}`;
  return { subject: t.subject(r.to_name), html, text };
}
