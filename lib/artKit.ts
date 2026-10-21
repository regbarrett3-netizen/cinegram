// Shared drawing tools for card artwork: colours, gradients, flowers, leaves, hearts, stars…
// Pure string builders (no browser APIs).

export type Art = { paper: string; ink: string; accent: string; svg: string };

/* ---------------- tiny helpers ---------------- */

export const n = (v: number) => Math.round(v * 10) / 10;

/** Deterministic random numbers, so a card looks the same every time. */
export function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Stop = [number, string, number?];
export const stops = (s: Stop[]) =>
  s.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op === undefined ? "" : ` stop-opacity="${op}"`}/>`).join("");
export const lg = (id: string, s: Stop[], x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
export const rg = (id: string, s: Stop[], cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
export const blur = (id: string, sd: number) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
/** Watercolour-ish wobble for edges. */
export const wobble = (id: string, scale = 6, freq = 0.02, seed = 3) =>
  `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="${scale}"/></filter>`;

export const HEART = "M0 25 C-35 0 -46 -30 -22 -38 C-10 -42 0 -33 0 -24 C0 -33 10 -42 22 -38 C46 -30 35 0 0 25Z";
export const heart = (x: number, y: number, s: number, fill: string, extra = "") =>
  `<path d="${HEART}" transform="translate(${n(x)} ${n(y)}) scale(${n(s / 50 * 100) / 100})" fill="${fill}" ${extra}/>`;

export const leaf = (x: number, y: number, len: number, ang: number, fill: string, vein = "", w = 0.32) =>
  `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})"><path d="M0 0 Q${n(len * 0.45)} ${n(-len * w)} ${n(len)} 0 Q${n(len * 0.45)} ${n(len * w)} 0 0Z" fill="${fill}"/>${
    vein ? `<path d="M${n(len * 0.05)} 0 L${n(len * 0.85)} 0" stroke="${vein}" stroke-width="${n(Math.max(0.6, len * 0.03))}" stroke-linecap="round" opacity=".55"/>` : ""
  }</g>`;

export const flower = (x: number, y: number, r: number, petals: number, fill: string, center: string, rot = 0, petalW = 0.3) => {
  let p = "";
  for (let i = 0; i < petals; i++)
    p += `<ellipse cx="0" cy="${n(-r * 0.52)}" rx="${n(r * petalW)}" ry="${n(r * 0.52)}" transform="rotate(${n(rot + (i * 360) / petals)})" fill="${fill}"/>`;
  return `<g transform="translate(${n(x)} ${n(y)})">${p}<circle r="${n(r * 0.22)}" fill="${center}"/></g>`;
};

/** A rose seen from above: a soft bloom with a spiral of darker petal edges. */
export const rose = (x: number, y: number, r: number, light: string, dark: string, rot = 0) => {
  let arcs = "";
  for (let i = 0; i < 4; i++) {
    const rr = r * (0.82 - i * 0.19);
    const a0 = ((rot + i * 97) * Math.PI) / 180;
    const a1 = a0 + (250 * Math.PI) / 180;
    const p0 = [Math.cos(a0) * rr, Math.sin(a0) * rr];
    const p1 = [Math.cos(a1) * rr, Math.sin(a1) * rr];
    arcs += `<path d="M${n(p0[0])} ${n(p0[1])} A${n(rr)} ${n(rr)} 0 1 1 ${n(p1[0])} ${n(p1[1])}" fill="none" stroke="${dark}" stroke-width="${n(r * 0.09)}" stroke-linecap="round" opacity=".75"/>`;
  }
  return `<g transform="translate(${n(x)} ${n(y)})"><circle r="${n(r)}" fill="${light}"/><circle r="${n(r)}" fill="${dark}" opacity=".12"/>${arcs}<circle cx="${n(-r * 0.3)}" cy="${n(-r * 0.35)}" r="${n(r * 0.28)}" fill="#fff" opacity=".18"/></g>`;
};

export const cloud = (x: number, y: number, s: number, fill: string, op = 1) =>
  `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s * 100) / 100})" fill="${fill}" opacity="${op}"><ellipse cx="0" cy="8" rx="46" ry="14"/><circle cx="-20" cy="0" r="16"/><circle cx="4" cy="-8" r="22"/><circle cx="26" cy="2" r="14"/></g>`;

export const sparkle = (x: number, y: number, r: number, fill: string, op = 1) =>
  `<path d="M0 ${-r} Q0 0 ${r} 0 Q0 0 0 ${r} Q0 0 ${-r} 0 Q0 0 0 ${-r}Z" transform="translate(${n(x)} ${n(y)})" fill="${fill}" opacity="${op}"/>`;

export const bird = (x: number, y: number, s: number, color: string, w = 1.6) =>
  `<path d="M${n(x - 10 * s)} ${n(y)} Q${n(x - 5 * s)} ${n(y - 6 * s)} ${n(x)} ${n(y)} Q${n(x + 5 * s)} ${n(y - 6 * s)} ${n(x + 10 * s)} ${n(y)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

export function starfield(seed: number, count: number, y0: number, y1: number, color = "#fff", maxR = 1.5) {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < count; i++)
    s += `<circle cx="${n(r() * 500)}" cy="${n(y0 + r() * (y1 - y0))}" r="${n(0.3 + r() * maxR)}" fill="${color}" opacity="${n(0.35 + r() * 0.6)}"/>`;
  return s;
}

export function confetti(seed: number, count: number, colors: string[], y0 = 0, y1 = 470, size = 1) {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < count; i++) {
    const c = colors[Math.floor(r() * colors.length)];
    const x = n(r() * 500), y = n(y0 + r() * (y1 - y0)), a = n(r() * 180);
    s += r() < 0.5
      ? `<rect x="${x}" y="${y}" width="${n(4 * size)}" height="${n(9 * size)}" rx="1" fill="${c}" transform="rotate(${a} ${x} ${y})" opacity=".9"/>`
      : `<circle cx="${x}" cy="${y}" r="${n((1.5 + r() * 2.5) * size)}" fill="${c}" opacity=".85"/>`;
  }
  return s;
}

/** Points along a heart outline, t in [0,1). */
export function heartPoint(t: number, cx: number, cy: number, s: number) {
  const a = t * Math.PI * 2;
  const x = 16 * Math.sin(a) ** 3;
  const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
  return [cx + x * s, cy + y * s];
}

export const star5 = (x: number, y: number, r: number, fill: string, extra = "") => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${n(x + Math.cos(a) * rr)} ${n(y + Math.sin(a) * rr)} `;
  }
  return `<path d="${d}Z" fill="${fill}" stroke-linejoin="round" ${extra}/>`;
};

export function burst(x: number, y: number, r: number, color: string, rays = 22, seed = 1) {
  const rand = rng(seed);
  let s = `<circle cx="${x}" cy="${y}" r="${r * 0.9}" fill="${color}" opacity=".18" filter="url(#b12)"/>`;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + rand() * 0.1, l = r * (0.65 + rand() * 0.35);
    const x1 = x + Math.cos(a) * r * 0.2, y1 = y + Math.sin(a) * r * 0.2, x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/><circle cx="${n(x2)}" cy="${n(y2 + 3)}" r="2" fill="${color}"/>`;
  }
  return s;
}

