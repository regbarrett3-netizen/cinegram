// Sends card emails through Resend (https://resend.com). Server-only.
import { isLang, type Lang } from "./i18n";

const FROM = process.env.EMAIL_FROM || "Cinegram <cards@cinegramcards.com>";

type T = { subject: (from: string) => string; hi: (to: string) => string; body: (from: string) => string; action: string; video: string; open: string; footer: string };

const TEXT: Record<Lang, T> = {
  en: { subject: (f) => `${f} sent you a card 💌`, hi: (t) => `Hi ${t},`, body: (f) => `${f} sent you a Cinegram card.`, action: "It moves and plays music, so turn your sound on.", video: "It's a video message made just for you.", open: "Open your card", footer: "Sent with Cinegram · cinegramcards.com" },
  es: { subject: (f) => `${f} te envió una tarjeta 💌`, hi: (t) => `Hola, ${t}:`, body: (f) => `${f} te envió una tarjeta de Cinegram.`, action: "Se mueve y tiene música: activa el sonido.", video: "Es un mensaje en video hecho solo para ti.", open: "Abrir tu tarjeta", footer: "Enviada con Cinegram · cinegramcards.com" },
  fr: { subject: (f) => `${f} t'a envoyé une carte 💌`, hi: (t) => `Bonjour ${t},`, body: (f) => `${f} t'a envoyé une carte Cinegram.`, action: "Elle bouge et joue de la musique : active le son.", video: "C'est un message vidéo rien que pour toi.", open: "Ouvrir ta carte", footer: "Envoyée avec Cinegram · cinegramcards.com" },
  pt: { subject: (f) => `${f} enviou-te um cartão 💌`, hi: (t) => `Olá, ${t},`, body: (f) => `${f} enviou-te um cartão Cinegram.`, action: "Mexe-se e tem música: liga o som.", video: "É uma mensagem em vídeo feita só para ti.", open: "Abrir o teu cartão", footer: "Enviado com Cinegram · cinegramcards.com" },
  zh: { subject: (f) => `${f} 给你寄了一张贺卡 💌`, hi: (t) => `${t}，你好：`, body: (f) => `${f} 给你寄了一张 Cinegram 贺卡。`, action: "贺卡会动，还有音乐，记得打开声音。", video: "这是专门为你制作的视频祝福。", open: "打开你的贺卡", footer: "由 Cinegram 发送 · cinegramcards.com" },
  yue: { subject: (f) => `${f} 寄咗張賀卡俾你 💌`, hi: (t) => `${t}，你好：`, body: (f) => `${f} 寄咗張 Cinegram 賀卡俾你。`, action: "張賀卡識郁，仲有音樂，記得開聲。", video: "呢段係專登為你整嘅影片祝福。", open: "打開你張賀卡", footer: "由 Cinegram 寄出 · cinegramcards.com" },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function cardEmail(o: { lang: string; toName: string; fromName: string; link: string; kind: "quick" | "action" | "video"; imageUrl?: string | null }) {
  const t = TEXT[isLang(o.lang) ? o.lang : "en"];
  const to = esc(o.toName), from = esc(o.fromName);
  const extra = o.kind === "action" ? t.action : o.kind === "video" ? t.video : "";
  const img = o.imageUrl
    ? `<a href="${o.link}" style="display:block;margin:24px auto 8px;max-width:320px"><img src="${o.imageUrl}" width="320" alt="" style="display:block;width:100%;max-width:320px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25)"></a>`
    : `<div style="margin:24px auto 8px;width:120px;height:84px;border-radius:10px;background:linear-gradient(135deg,#ec4899,#9333ea);line-height:84px;font-size:40px;text-align:center">💌</div>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:Georgia,'Times New Roman',serif;color:#2b2233">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;padding:32px 28px;text-align:center">
<tr><td>
<div style="font-family:Arial,sans-serif;font-weight:900;letter-spacing:2px;font-size:14px;color:#c026d3">CINEGRAM</div>
<p style="font-size:22px;margin:22px 0 6px">${t.hi(to)}</p>
<p style="font-size:18px;margin:0">${t.body(from)}</p>
${extra ? `<p style="font-family:Arial,sans-serif;font-size:14px;color:#6b5b73;margin:10px 0 0">${esc(extra)}</p>` : ""}
${img}
<a href="${o.link}" style="display:inline-block;margin-top:18px;padding:14px 28px;border-radius:999px;background:linear-gradient(90deg,#ec4899,#9333ea);color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:16px">${esc(t.open)}</a>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#9a8ca3;margin:28px 0 0">${esc(t.footer)}</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = `${t.hi(o.toName)}\n\n${t.body(o.fromName)} ${extra}\n\n${t.open}: ${o.link}\n\n${t.footer}`;
  return { subject: t.subject(o.fromName), html, text };
}

export async function sendEmail(to: string, msg: { subject: string; html: string; text: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Server is missing RESEND_API_KEY. Add it in your hosting settings.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject: msg.subject, html: msg.html, text: msg.text }),
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 300);
    console.error("Email failed", res.status, body);
    if (res.status === 401 || res.status === 403) {
      if (/domain/i.test(body)) throw new Error("Email isn't set up yet: the sending domain still needs to be verified in Resend.");
      throw new Error("Resend rejected RESEND_API_KEY. Check the key in Vercel.");
    }
    if (res.status === 422) throw new Error("That email address doesn't look right.");
    throw new Error(`Email failed (${res.status}).`);
  }
}

export { isEmail } from "./emailCheck";
