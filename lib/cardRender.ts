// Draws a finished card (artwork + greeting) onto a canvas. Used for the on-screen
// preview and for the downloaded image, so both always look the same.

import { cardArtSvg } from "./cardArt";
import { CARD_TEXT, CARD_UI } from "./cardsCatalog";
import type { Lang } from "./i18n";
import { polaroid } from "./polaroid";

export const CARD_W = 500;
export const CARD_H = 700;

const artCache = new Map<string, Promise<HTMLImageElement>>();
const colorCache = new Map<string, { ink: string; accent: string }>();

/** Artwork as a same-origin image (blob URL), so the canvas can still be exported. */
export function artImage(artKey: string): Promise<HTMLImageElement> {
  let p = artCache.get(artKey);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const { svg, art } = cardArtSvg(artKey);
      colorCache.set(artKey, { ink: art.ink, accent: art.accent });
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => {
        artCache.delete(artKey);
        reject(new Error("Card artwork failed to load."));
      };
      img.src = url;
    });
    artCache.set(artKey, p);
  }
  return p;
}

/** Plain data URL of the artwork, for simple <img> thumbnails. */
export function artDataUrl(artKey: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cardArtSvg(artKey).svg)}`;
}

const isCjk = (lang: Lang) => lang === "zh" || lang === "yue";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, cjk: boolean): string[] {
  const tokens = cjk ? Array.from(text) : text.split(" ");
  const joiner = cjk ? "" : " ";
  const lines: string[] = [];
  let line = "";
  for (const tok of tokens) {
    const test = line ? line + joiner + tok : tok;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = tok;
    } else line = test;
  }
  if (line) lines.push(line);
  // Don't leave a lone CJK punctuation mark at the start of a line.
  if (cjk) for (let i = 1; i < lines.length; i++) if (/^[，。！？、；：」』）]/.test(lines[i])) { lines[i - 1] += lines[i][0]; lines[i] = lines[i].slice(1); }
  return lines.filter(Boolean);
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, start: number, min: number, make: (px: number) => string) {
  let px = start;
  ctx.font = make(px);
  while (px > min && ctx.measureText(text).width > maxW) ctx.font = make(--px);
  return px;
}

export type DrawOptions = {
  artKey: string;
  lang: Lang;
  to?: string;
  from?: string;
  /** Watermark text for previews; omit for the paid download. */
  watermark?: string;
  /** Pixel scale: 1 = 500×700. */
  scale: number;
  /** CSS font-family list for the greeting. */
  fontFamily: string;
  /** Optional photo, shown as a polaroid on the artwork. */
  photo?: HTMLImageElement | null;
};

export async function drawCard(canvas: HTMLCanvasElement, o: DrawOptions): Promise<void> {
  const img = await artImage(o.artKey);
  const colors = colorCache.get(o.artKey) || { ink: "#333", accent: "#999" };
  const text = CARD_TEXT[o.lang][o.artKey] || CARD_TEXT.en[o.artKey];
  const ui = CARD_UI[o.lang];
  const cjk = isCjk(o.lang);
  const fam = o.fontFamily;
  try {
    await Promise.all([
      document.fonts.load(`600 38px ${fam}`, text.h),
      document.fonts.load(`italic 500 19px ${fam}`, text.m),
    ]);
  } catch {
    /* fall back to whatever font is available */
  }

  const w = Math.round(CARD_W * o.scale), h = Math.round(CARD_H * o.scale);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.setTransform(o.scale, 0, 0, o.scale, 0, 0);
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.drawImage(img, 0, 0, CARD_W, CARD_H);
  if (o.photo) polaroid(ctx, o.photo, 318, 236, 150, 0.09);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = colors.ink;

  const to = (o.to || "").trim().slice(0, 40);
  const from = (o.from || "").trim().slice(0, 40);

  if (to) {
    ctx.globalAlpha = 0.75;
    fitFont(ctx, ui.forLine(to), 400, 16, 11, (px) => `500 ${px}px ${fam}`);
    if (!cjk && "letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = "1.5px";
    ctx.fillText(ui.forLine(to).toUpperCase(), 250, 510);
    if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    ctx.globalAlpha = 1;
  }

  fitFont(ctx, text.h, 420, cjk ? 34 : 40, 22, (px) => `600 ${px}px ${fam}`);
  ctx.fillText(text.h, 250, 552);

  // small ornament
  ctx.strokeStyle = colors.accent;
  ctx.fillStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(206, 572); ctx.lineTo(242, 572); ctx.moveTo(258, 572); ctx.lineTo(294, 572);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(250, 567); ctx.lineTo(255, 572); ctx.lineTo(250, 577); ctx.lineTo(245, 572); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = colors.ink;

  let size = cjk ? 17 : 19, lines: string[] = [];
  for (; size >= 14; size--) {
    ctx.font = `${cjk ? "" : "italic "}500 ${size}px ${fam}`;
    lines = wrap(ctx, text.m, 380, cjk);
    if (lines.length <= 3) break;
  }
  const lh = size * 1.35;
  const maxLines = lines.slice(0, 4);
  const top = from ? 602 : 608;
  maxLines.forEach((l, i) => ctx.fillText(l, 250, top + i * lh));

  if (from) {
    ctx.globalAlpha = 0.85;
    fitFont(ctx, ui.fromLine(from), 400, 17, 11, (px) => `600 ${px}px ${fam}`);
    ctx.fillText(ui.fromLine(from), 250, Math.min(674, top + maxLines.length * lh + 14));
    ctx.globalAlpha = 1;
  }

  if (o.watermark) {
    ctx.save();
    // Tiled across the whole card (no clean corner to crop), with the site name between rows.
    ctx.translate(250, 350);
    ctx.rotate(-Math.PI / 6);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    for (let row = -5; row <= 5; row++) {
      const big = row % 2 === 0;
      ctx.font = big ? `700 40px ${fam}` : `600 18px ${fam}`;
      ctx.globalAlpha = big ? 0.32 : 0.4;
      const label = big ? o.watermark : "cinegramcards.com";
      const step = big ? 260 : 220;
      const shift = (row & 2 ? step / 2 : 0);
      for (let x = -700 + shift; x <= 700; x += step) {
        if (big) ctx.strokeText(label, x, row * 70);
        ctx.fillText(label, x, row * 70);
      }
    }
    ctx.restore();
  }
}

/** Renders the full-size card and returns it as a PNG file. */
export async function cardPng(o: Omit<DrawOptions, "scale" | "watermark">, fileName: string): Promise<File> {
  const c = document.createElement("canvas");
  await drawCard(c, { ...o, scale: 3 });
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
  if (!blob) throw new Error("Could not create the image.");
  return new File([blob], fileName, { type: "image/png" });
}

/** Renders the card as a JPEG (smaller, used for the email preview). */
export async function cardJpeg(o: Omit<DrawOptions, "scale" | "watermark">, scale = 1.6): Promise<Blob> {
  const c = document.createElement("canvas");
  await drawCard(c, { ...o, scale });
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/jpeg", 0.86));
  if (!blob) throw new Error("Could not create the image.");
  return blob;
}
