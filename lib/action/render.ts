// Draws action-card frames (animation + greeting) and records them to a video file.
import { DUR, H, W, ease, seg, type Ctx } from "./engine";
import { SCENES1, type Scene } from "./scenes1";
import { SCENES2 } from "./scenes2";
import { ACTION_TEXT, type ActionId } from "./catalog";
import { CARD_UI } from "../cardsCatalog";
import type { Lang } from "../i18n";

const FACTORIES: Record<ActionId, () => Scene> = { ...SCENES1, ...SCENES2 };
const cache = new Map<ActionId, Scene>();
export function scene(id: ActionId): Scene {
  let s = cache.get(id);
  if (!s) {
    s = FACTORIES[id]();
    cache.set(id, s);
  }
  return s;
}

/** When the greeting starts to fade in, and the total video length including a short hold. */
export const TEXT_IN = 3.3;
export const VIDEO_LEN = DUR + 0.8;

export type FrameOpts = { lang: Lang; to?: string; from?: string; watermark?: string; fontFamily: string };

const isCjk = (l: Lang) => l === "zh" || l === "yue";

function wrap(c: Ctx, text: string, maxW: number, cjk: boolean): string[] {
  const toks = cjk ? Array.from(text) : text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const tk of toks) {
    const test = line ? line + (cjk ? "" : " ") + tk : tk;
    if (c.measureText(test).width > maxW && line) { lines.push(line); line = tk; } else line = test;
  }
  if (line) lines.push(line);
  if (cjk) for (let i = 1; i < lines.length; i++) if (/^[，。！？、；：」』）]/.test(lines[i])) { lines[i - 1] += lines[i][0]; lines[i] = lines[i].slice(1); }
  return lines.filter(Boolean);
}

function fit(c: Ctx, text: string, maxW: number, start: number, min: number, make: (px: number) => string) {
  let px = start;
  c.font = make(px);
  while (px > min && c.measureText(text).width > maxW) c.font = make(--px);
}

/** Draws frame t (seconds) of an action card into a 720×1280 coordinate space. */
export function drawFrame(c: Ctx, id: ActionId, t: number, o: FrameOpts) {
  const s = scene(id);
  c.save();
  s.draw(c, Math.min(t, DUR));
  c.restore();

  const a = ease.out(seg(t, TEXT_IN, TEXT_IN + 1));
  if (a > 0) {
    const txt = ACTION_TEXT[o.lang][id] || ACTION_TEXT.en[id];
    const ui = CARD_UI[o.lang];
    const cjk = isCjk(o.lang);
    const g = c.createLinearGradient(0, H * 0.6, 0, H);
    g.addColorStop(0, `rgba(${s.scrim},0)`);
    g.addColorStop(0.35, `rgba(${s.scrim},${0.78 * a})`);
    g.addColorStop(1, `rgba(${s.scrim},${0.92 * a})`);
    c.fillStyle = g;
    c.fillRect(0, H * 0.6, W, H * 0.4);

    c.save();
    c.globalAlpha = a;
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    c.fillStyle = s.ink;
    const rise = (1 - a) * 24;
    const to = (o.to || "").trim().slice(0, 40), from = (o.from || "").trim().slice(0, 40);
    if (to) {
      c.globalAlpha = a * 0.8;
      fit(c, ui.forLine(to), 600, 26, 16, (px) => `500 ${px}px ${o.fontFamily}`);
      c.fillText(cjk ? ui.forLine(to) : ui.forLine(to).toUpperCase(), 360, 950 + rise);
      c.globalAlpha = a;
    }
    fit(c, txt.h, 640, cjk ? 58 : 68, 34, (px) => `600 ${px}px ${o.fontFamily}`);
    c.fillText(txt.h, 360, 1020 + rise);
    c.strokeStyle = s.accent; c.fillStyle = s.accent; c.lineWidth = 2;
    c.beginPath(); c.moveTo(300, 1050 + rise); c.lineTo(348, 1050 + rise); c.moveTo(372, 1050 + rise); c.lineTo(420, 1050 + rise); c.stroke();
    c.beginPath(); c.moveTo(360, 1043 + rise); c.lineTo(367, 1050 + rise); c.lineTo(360, 1057 + rise); c.lineTo(353, 1050 + rise); c.fill();
    c.fillStyle = s.ink;
    let size = cjk ? 30 : 34, lines: string[] = [];
    for (; size >= 24; size--) { c.font = `${cjk ? "" : "italic "}500 ${size}px ${o.fontFamily}`; lines = wrap(c, txt.m, 600, cjk); if (lines.length <= 3) break; }
    const lh = size * 1.32;
    lines.slice(0, 3).forEach((l, i) => c.fillText(l, 360, 1100 + rise + i * lh));
    if (from) {
      c.globalAlpha = a * 0.9;
      fit(c, ui.fromLine(from), 600, 30, 18, (px) => `600 ${px}px ${o.fontFamily}`);
      c.fillText(ui.fromLine(from), 360, Math.min(1238, 1100 + rise + Math.min(3, lines.length) * lh + 22));
    }
    c.restore();
  }

  if (o.watermark) {
    c.save();
    c.translate(360, 560);
    c.rotate(-Math.PI / 6);
    c.font = `700 72px ${o.fontFamily}`;
    c.textAlign = "center";
    c.globalAlpha = 0.3;
    c.lineWidth = 3;
    c.strokeStyle = "#000";
    c.fillStyle = "#fff";
    for (const dy of [-300, 0, 300]) { c.strokeText(o.watermark, 0, dy); c.fillText(o.watermark, 0, dy); }
    c.restore();
  }
}

/** Sizes a canvas for drawing at the given pixel scale and returns its context, already scaled. */
export function prep(canvas: HTMLCanvasElement, scale: number): Ctx {
  const w = Math.round(W * scale), h = Math.round(H * scale);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas unavailable");
  c.setTransform(scale, 0, 0, scale, 0, 0);
  return c;
}

export async function loadFonts(id: ActionId, o: FrameOpts) {
  const txt = ACTION_TEXT[o.lang][id];
  try {
    await Promise.all([document.fonts.load(`600 68px ${o.fontFamily}`, txt.h), document.fonts.load(`italic 500 34px ${o.fontFamily}`, txt.m)]);
  } catch {
    /* use fallback font */
  }
}

export function videoSupport(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement === "undefined" || !("captureStream" in HTMLCanvasElement.prototype)) return null;
  const options = [
    // H.264 first: plays everywhere, including iPhone Photos and Messages.
    { mime: "video/mp4;codecs=avc1.42E01F", ext: "mp4" },
    { mime: "video/mp4;codecs=avc1.4D401F", ext: "mp4" },
    { mime: "video/mp4;codecs=avc1.640028", ext: "mp4" },
    { mime: "video/mp4;codecs=avc1", ext: "mp4" },
    { mime: "video/mp4", ext: "mp4" },
    { mime: "video/webm;codecs=vp9", ext: "webm" },
    { mime: "video/webm;codecs=vp8", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
  ];
  return options.find((x) => MediaRecorder.isTypeSupported(x.mime)) || null;
}

/** Plays the card in real time on a hidden canvas and records it. Takes about 9 seconds. */
export async function recordVideo(id: ActionId, o: FrameOpts, onProgress: (pct: number) => void): Promise<File> {
  const sup = videoSupport();
  if (!sup) throw new Error("NO_VIDEO");
  await loadFonts(id, o);
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;left:-10000px;top:0;width:360px;height:640px;pointer-events:none;opacity:0";
  document.body.appendChild(canvas);
  try {
    const c = prep(canvas, 1);
    drawFrame(c, id, 0, o);
    const stream = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: sup.mime, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise<void>((res, rej) => { rec.onstop = () => res(); rec.onerror = () => rej(new Error("Recording failed")); });
    rec.start(250);
    const start = performance.now();
    await new Promise<void>((res) => {
      const tick = () => {
        const t = (performance.now() - start) / 1000;
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, W, H);
        drawFrame(c, id, t, o);
        onProgress(Math.min(99, Math.round((t / VIDEO_LEN) * 100)));
        if (t < VIDEO_LEN) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    rec.stop();
    stream.getTracks().forEach((tr) => tr.stop());
    await done;
    onProgress(100);
    const type = sup.mime.split(";")[0];
    return new File([new Blob(chunks, { type })], `cinegram-${id}.${sup.ext}`, { type });
  } finally {
    canvas.remove();
  }
}
