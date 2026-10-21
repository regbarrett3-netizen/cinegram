// Small canvas toolkit for action cards: timing, easing, seeded randomness and shapes.
// Every scene is deterministic, so the preview and the recorded video match frame for frame.

export const W = 720;
export const H = 1280;
/** Length of the animation in seconds (the video holds the last frame briefly after). */
export const DUR = 8;

export type Ctx = CanvasRenderingContext2D;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/** Progress 0→1 of t through the window [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = {
  out: (k: number) => 1 - (1 - k) ** 3,
  in: (k: number) => k * k * k,
  inOut: (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2),
  outBack: (k: number) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * (k - 1) ** 3 + c1 * (k - 1) ** 2;
  },
};

export function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sky(c: Ctx, stops: [number, string][], y0 = 0, y1 = H) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  for (const [o, col] of stops) g.addColorStop(o, col);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

/** The same colour at zero opacity, so gradients fade cleanly instead of through grey. */
export function clear(color: string): string {
  if (color.startsWith("rgba(")) return color.replace(/,\s*[\d.]+\)$/, ",0)");
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", ",0)");
  if (color[0] === "#" && color.length === 7) {
    const n = parseInt(color.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
  }
  return "rgba(255,255,255,0)";
}

export function glow(c: Ctx, x: number, y: number, r: number, color: string, alpha = 1) {
  if (r <= 0 || alpha <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, clear(color));
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

export function heartPath(c: Ctx, x: number, y: number, s: number) {
  c.beginPath();
  c.moveTo(x, y + s * 0.35);
  c.bezierCurveTo(x - s * 0.7, y - s * 0.05, x - s * 0.55, y - s * 0.75, x, y - s * 0.38);
  c.bezierCurveTo(x + s * 0.55, y - s * 0.75, x + s * 0.7, y - s * 0.05, x, y + s * 0.35);
  c.closePath();
}

export function starPath(c: Ctx, x: number, y: number, r: number, points = 5, inner = 0.45, rot = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = rot + (i * Math.PI) / points, rr = i % 2 ? r * inner : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i) c.lineTo(px, py);
    else c.moveTo(px, py);
  }
  c.closePath();
}

export function sparkle(c: Ctx, x: number, y: number, r: number, color: string, alpha = 1) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x, y - r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y);
  c.quadraticCurveTo(x, y, x, y - r);
  c.fill();
  c.restore();
}

export function cloud(c: Ctx, x: number, y: number, s: number, color = "#ffffff", alpha = 0.9) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y + 12 * s, 70 * s, 22 * s, 0, 0, Math.PI * 2);
  c.arc(x - 30 * s, y, 26 * s, 0, Math.PI * 2);
  c.arc(x + 6 * s, y - 12 * s, 34 * s, 0, Math.PI * 2);
  c.arc(x + 40 * s, y + 4 * s, 22 * s, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

export function stars(c: Ctx, seed: number, count: number, y1: number, t: number, maxR = 2) {
  const r = rng(seed);
  c.save();
  c.fillStyle = "#ffffff";
  for (let i = 0; i < count; i++) {
    const x = r() * W, y = r() * y1, rad = 0.5 + r() * maxR, ph = r() * 6.28, sp = 1 + r() * 2;
    c.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * sp + ph));
    c.beginPath();
    c.arc(x, y, rad, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

/** A leaf shape pointing along +x. */
export function leaf(c: Ctx, x: number, y: number, len: number, ang: number, color: string, w = 0.32) {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(len * 0.45, -len * w, len, 0);
  c.quadraticCurveTo(len * 0.45, len * w, 0, 0);
  c.fill();
  c.restore();
}

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v: number) => Math.round(clamp(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt, 0, 255));
  r = f(r); g = f(g); b = f(b);
  return `rgb(${r},${g},${b})`;
}
