// Original card artwork, drawn in code as SVG. Each scene paints a 500×700 card;
// the bottom of every card is left calm so the greeting can be set there.
// Pure functions, no browser APIs, so the same art renders on screen and in downloads.

export type Art = { paper: string; ink: string; accent: string; svg: string };

/* ---------------- tiny helpers ---------------- */

const n = (v: number) => Math.round(v * 10) / 10;

/** Deterministic random numbers, so a card looks the same every time. */
function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Stop = [number, string, number?];
const stops = (s: Stop[]) =>
  s.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op === undefined ? "" : ` stop-opacity="${op}"`}/>`).join("");
const lg = (id: string, s: Stop[], x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
const rg = (id: string, s: Stop[], cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
const blur = (id: string, sd: number) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
/** Watercolour-ish wobble for edges. */
const wobble = (id: string, scale = 6, freq = 0.02, seed = 3) =>
  `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="${scale}"/></filter>`;

const HEART = "M0 25 C-35 0 -46 -30 -22 -38 C-10 -42 0 -33 0 -24 C0 -33 10 -42 22 -38 C46 -30 35 0 0 25Z";
const heart = (x: number, y: number, s: number, fill: string, extra = "") =>
  `<path d="${HEART}" transform="translate(${n(x)} ${n(y)}) scale(${n(s / 50 * 100) / 100})" fill="${fill}" ${extra}/>`;

const leaf = (x: number, y: number, len: number, ang: number, fill: string, vein = "", w = 0.32) =>
  `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})"><path d="M0 0 Q${n(len * 0.45)} ${n(-len * w)} ${n(len)} 0 Q${n(len * 0.45)} ${n(len * w)} 0 0Z" fill="${fill}"/>${
    vein ? `<path d="M${n(len * 0.05)} 0 L${n(len * 0.85)} 0" stroke="${vein}" stroke-width="${n(Math.max(0.6, len * 0.03))}" stroke-linecap="round" opacity=".55"/>` : ""
  }</g>`;

const flower = (x: number, y: number, r: number, petals: number, fill: string, center: string, rot = 0, petalW = 0.3) => {
  let p = "";
  for (let i = 0; i < petals; i++)
    p += `<ellipse cx="0" cy="${n(-r * 0.52)}" rx="${n(r * petalW)}" ry="${n(r * 0.52)}" transform="rotate(${n(rot + (i * 360) / petals)})" fill="${fill}"/>`;
  return `<g transform="translate(${n(x)} ${n(y)})">${p}<circle r="${n(r * 0.22)}" fill="${center}"/></g>`;
};

/** A rose seen from above: a soft bloom with a spiral of darker petal edges. */
const rose = (x: number, y: number, r: number, light: string, dark: string, rot = 0) => {
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

const cloud = (x: number, y: number, s: number, fill: string, op = 1) =>
  `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s * 100) / 100})" fill="${fill}" opacity="${op}"><ellipse cx="0" cy="8" rx="46" ry="14"/><circle cx="-20" cy="0" r="16"/><circle cx="4" cy="-8" r="22"/><circle cx="26" cy="2" r="14"/></g>`;

const sparkle = (x: number, y: number, r: number, fill: string, op = 1) =>
  `<path d="M0 ${-r} Q0 0 ${r} 0 Q0 0 0 ${r} Q0 0 ${-r} 0 Q0 0 0 ${-r}Z" transform="translate(${n(x)} ${n(y)})" fill="${fill}" opacity="${op}"/>`;

const bird = (x: number, y: number, s: number, color: string, w = 1.6) =>
  `<path d="M${n(x - 10 * s)} ${n(y)} Q${n(x - 5 * s)} ${n(y - 6 * s)} ${n(x)} ${n(y)} Q${n(x + 5 * s)} ${n(y - 6 * s)} ${n(x + 10 * s)} ${n(y)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

function starfield(seed: number, count: number, y0: number, y1: number, color = "#fff", maxR = 1.5) {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < count; i++)
    s += `<circle cx="${n(r() * 500)}" cy="${n(y0 + r() * (y1 - y0))}" r="${n(0.3 + r() * maxR)}" fill="${color}" opacity="${n(0.35 + r() * 0.6)}"/>`;
  return s;
}

function confetti(seed: number, count: number, colors: string[], y0 = 0, y1 = 470, size = 1) {
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
function heartPoint(t: number, cx: number, cy: number, s: number) {
  const a = t * Math.PI * 2;
  const x = 16 * Math.sin(a) ** 3;
  const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
  return [cx + x * s, cy + y * s];
}

/* ---------------- card frame ---------------- */

/** Wraps a scene: fades it into the paper, adds grain and a thin deckle border. */
export function frame(art: Art): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700" viewBox="0 0 500 700">
<defs>${lg("fadeP", [[0, art.paper, 0], [1, art.paper, 1]])}
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .07 0"/></filter></defs>
<rect width="500" height="700" fill="${art.paper}"/>
${art.svg}
<rect y="400" width="500" height="80" fill="url(#fadeP)"/>
<rect y="479" width="500" height="221" fill="${art.paper}"/>
<rect width="500" height="700" filter="url(#grain)"/>
<rect x="14" y="14" width="472" height="672" rx="6" fill="none" stroke="${art.accent}" stroke-opacity=".45" stroke-width="1"/>
</svg>`;
}

/* ---------------- birthday ---------------- */

function bdayCandles(): Art {
  const r = rng(11);
  let sparks = "";
  for (let i = 0; i < 40; i++)
    sparks += `<circle cx="${n(120 + r() * 260)}" cy="${n(60 + r() * 220)}" r="${n(0.6 + r() * 1.8)}" fill="#ffd98a" opacity="${n(0.3 + r() * 0.6)}"/>`;
  let candles = "", flames = "", halos = "";
  const xs = [190, 220, 250, 280, 310];
  xs.forEach((x, i) => {
    const top = 214 + (i % 2) * 8;
    candles += `<rect x="${x - 4}" y="${top}" width="8" height="${270 - top}" rx="2" fill="#fbf1e6"/><path d="M${x - 4} ${top + 10} l8 -6 M${x - 4} ${top + 24} l8 -6 M${x - 4} ${top + 38} l8 -6" stroke="#e98fa6" stroke-width="2.4"/>`;
    halos += `<circle cx="${x}" cy="${top - 16}" r="26" fill="#ffcf73" opacity=".35" filter="url(#b8)"/>`;
    flames += `<path d="M${x} ${top - 30} C${x + 7} ${top - 18} ${x + 7} ${top - 8} ${x} ${top - 4} C${x - 7} ${top - 8} ${x - 7} ${top - 18} ${x} ${top - 30}Z" fill="url(#flame)"/><line x1="${x}" y1="${top - 4}" x2="${x}" y2="${top}" stroke="#3a2230" stroke-width="1.2"/>`;
  });
  const drip = (x0: number, x1: number, y: number) => {
    let d = `M${x0} ${y}`;
    const steps = 9, w = (x1 - x0) / steps;
    for (let i = 0; i < steps; i++) {
      const xa = x0 + i * w, len = 10 + ((i * 7) % 4) * 6;
      d += ` L${n(xa + w * 0.2)} ${y} Q${n(xa + w * 0.35)} ${y + len} ${n(xa + w * 0.5)} ${y + len} Q${n(xa + w * 0.65)} ${y + len} ${n(xa + w * 0.8)} ${y}`;
    }
    return d + ` L${x1} ${y} L${x1} ${y - 14} L${x0} ${y - 14}Z`;
  };
  return {
    paper: "#2a1830", ink: "#f8e7d4", accent: "#e9b872",
    svg: `<defs>${lg("sky", [[0, "#1c1230"], [0.55, "#5b2a4a"], [1, "#2a1830"]])}${rg("warm", [[0, "#ffb86b", 0.55], [1, "#ffb86b", 0]], 0.5, 0.5, 0.5)}
${lg("flame", [[0, "#fff6d6"], [0.5, "#ffd36b"], [1, "#ff9a3c"]])}${lg("tier", [[0, "#fbefe2"], [1, "#efd9c4"]])}${blur("b8", 8)}${blur("b30", 30)}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<ellipse cx="250" cy="280" rx="230" ry="200" fill="url(#warm)"/>
${sparks}
<ellipse cx="250" cy="432" rx="160" ry="16" fill="#1a0f1e" opacity=".6"/>
<ellipse cx="250" cy="426" rx="150" ry="14" fill="#d9c3b0"/>
<rect x="140" y="340" width="220" height="86" rx="8" fill="url(#tier)"/>
<path d="${drip(140, 360, 352)}" fill="#f2a7b8"/>
<rect x="175" y="270" width="150" height="72" rx="8" fill="url(#tier)"/>
<path d="${drip(175, 325, 282)}" fill="#f6c27a"/>
<g fill="#e46d8f">${[160, 200, 240, 280, 320, 340].map((x, i) => `<circle cx="${x}" cy="${396 + (i % 2) * 8}" r="3.2"/>`).join("")}</g>
<g fill="#fff" opacity=".85">${[190, 225, 260, 295].map((x) => `<circle cx="${x}" cy="318" r="2.6"/>`).join("")}</g>
${candles}${halos}${flames}`,
  };
}

function bdayBalloons(): Art {
  const balloons: [number, number, number, string, string][] = [
    [190, 170, 46, "#ef8a6f", "#c9604a"], [262, 128, 50, "#f2c45a", "#d29a2a"], [330, 186, 44, "#6fb3a8", "#468a80"],
    [150, 250, 38, "#e9a3b8", "#c97893"], [232, 228, 44, "#9c8ac9", "#7564a6"], [310, 268, 38, "#f0a35e", "#cd7b36"], [372, 116, 34, "#e9a3b8", "#c97893"],
  ];
  const knot = [250, 430];
  let strings = "", body = "";
  balloons.forEach(([x, y, r, c, d], i) => {
    const by = y + r * 1.18;
    strings += `<path d="M${x} ${n(by + 6)} C${n(x + (i % 2 ? 14 : -14))} ${n(by + 60)} ${n(knot[0] + (x - 250) * 0.3)} ${n(knot[1] - 70)} ${knot[0]} ${knot[1]}" stroke="#8a7a6e" stroke-width="1" fill="none" opacity=".7"/>`;
    body += `<g><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 1.18)}" fill="url(#bl${i})"/><path d="M${x - 5} ${n(by + 7)} L${x} ${n(by - 1)} L${x + 5} ${n(by + 7)}Z" fill="${d}"/><ellipse cx="${n(x - r * 0.38)}" cy="${n(y - r * 0.45)}" rx="${n(r * 0.16)}" ry="${n(r * 0.3)}" transform="rotate(25 ${n(x - r * 0.38)} ${n(y - r * 0.45)})" fill="#fff" opacity=".45"/></g>`;
  });
  const defs = balloons.map(([, , , c, d], i) => rg(`bl${i}`, [[0, c], [1, d]], 0.38, 0.32, 0.75)).join("");
  return {
    paper: "#fcf3ea", ink: "#5a3a3a", accent: "#e39a7c",
    svg: `<defs>${lg("sky", [[0, "#f9cdb8"], [0.6, "#fde7d8"], [1, "#fcf3ea"]])}${defs}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="400" cy="90" r="40" fill="#fff4e0" opacity=".8"/>
${cloud(90, 90, 1.1, "#fff", 0.75)}${cloud(420, 210, 0.8, "#fff", 0.6)}${cloud(70, 330, 0.7, "#fff", 0.5)}
${bird(420, 300, 0.8, "#b48a7c")}${bird(445, 285, 0.6, "#b48a7c")}
<path d="M0 420 C120 380 200 410 280 395 C360 380 430 400 500 385 L500 480 L0 480Z" fill="#c9d8b6"/>
<path d="M0 448 C110 425 230 455 330 435 C410 420 460 440 500 432 L500 480 L0 480Z" fill="#a9c193"/>
${strings}${body}
<path d="M242 430 l8 -6 l8 6 l-8 6Z" fill="#e39a7c"/>`,
  };
}

function bdayBouquet(): Art {
  const r = rng(5);
  let petals = "";
  for (let i = 0; i < 26; i++)
    petals += `<ellipse cx="${n(40 + r() * 420)}" cy="${n(30 + r() * 300)}" rx="3" ry="6" transform="rotate(${n(r() * 180)} ${n(40 + r() * 420)} ${n(30 + r() * 300)})" fill="${["#f2b5b0", "#f6d58e", "#c8d9c0"][i % 3]}" opacity=".8"/>`;
  const stems = [180, 205, 230, 250, 270, 295, 320].map((x) =>
    `<path d="M${x} 250 Q${n(250 + (x - 250) * 0.4)} 360 250 455" stroke="#7e9a6e" stroke-width="2.5" fill="none"/>`).join("");
  const euc = [[150, 215, -150], [355, 220, -30], [170, 160, -120], [335, 150, -60], [250, 120, -90]].map(([x, y, a]) => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      const rad = (a * Math.PI) / 180;
      const px = x + Math.cos(rad) * i * 14, py = y + Math.sin(rad) * i * 14;
      s += `<circle cx="${n(px + (i % 2 ? 6 : -6))}" cy="${n(py)}" r="${7 - i * 0.6}" fill="#9fb8a6"/>`;
    }
    return s;
  }).join("");
  return {
    paper: "#fbf3e8", ink: "#4e3b36", accent: "#d79a8f",
    svg: `<defs>${lg("wrap", [[0, "#e3c7a4"], [1, "#c9a47d"]], 0, 0, 1, 0)}</defs>
<rect width="500" height="480" fill="#fbf3e8"/>
<circle cx="250" cy="230" r="190" fill="#f6e3d6" opacity=".7"/>
${petals}${stems}${euc}
${leaf(170, 260, 60, 200, "#8fae84", "#5f7d55")}${leaf(330, 260, 60, -20, "#8fae84", "#5f7d55")}${leaf(200, 210, 50, 230, "#a6c29a", "#5f7d55")}${leaf(300, 205, 50, -50, "#a6c29a", "#5f7d55")}
${rose(250, 200, 44, "#f4b9b2", "#c9727a", 20)}${rose(190, 235, 34, "#f7cfc4", "#d4868a", 120)}${rose(312, 238, 36, "#f2a8a6", "#bf5f6a", 250)}
${flower(205, 165, 40, 12, "#fffdf8", "#f2c14e", 5, 0.2)}${flower(300, 160, 36, 12, "#fffdf8", "#f2c14e", 10, 0.2)}${flower(250, 268, 30, 11, "#fffdf8", "#f2c14e", 0, 0.2)}
${[[160, 190], [340, 195], [228, 130], [278, 128], [150, 260], [350, 268]].map(([x, y]) => [0, 1, 2].map((k) => flower(x + k * 8 - 8, y + (k % 2) * 7, 12, 5, "#8fb3d9", "#f6e7a8", k * 20, 0.38)).join("")).join("")}
<path d="M178 290 L322 290 L268 470 L232 470Z" fill="url(#wrap)"/>
<path d="M178 290 L232 470 L250 470 L215 290Z" fill="#fff" opacity=".15"/>
<path d="M250 372 C226 352 206 360 214 376 C222 390 244 380 250 372 C256 380 278 390 286 376 C294 360 274 352 250 372Z" fill="#d97f86"/>
<path d="M246 376 Q236 410 224 430 M254 376 Q266 410 278 428" stroke="#d97f86" stroke-width="5" fill="none" stroke-linecap="round"/>
<circle cx="250" cy="374" r="6" fill="#c46a72"/>`,
  };
}

/* ---------------- love ---------------- */

function loveConstellation(): Art {
  const pts: number[][] = [];
  for (let i = 0; i < 12; i++) pts.push(heartPoint(i / 12, 250, 190, 7.2));
  const wob = rng(9);
  const jit = pts.map(([x, y]) => [x + (wob() - 0.5) * 8, y + (wob() - 0.5) * 8]);
  const path = jit.map(([x, y], i) => `${i ? "L" : "M"}${n(x)} ${n(y)}`).join(" ") + "Z";
  const nodes = jit.map(([x, y], i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${i % 3 === 0 ? 3.4 : 2.2}" fill="#fff6dc"/><circle cx="${n(x)}" cy="${n(y)}" r="10" fill="#ffe6a8" opacity=".35" filter="url(#b4)"/>`).join("");
  return {
    paper: "#141a35", ink: "#f4e9d8", accent: "#e8c98a",
    svg: `<defs>${lg("night", [[0, "#0b1230"], [0.6, "#222453"], [1, "#141a35"]])}${blur("b4", 4)}${rg("mg", [[0, "#fff3d0", 0.5], [1, "#fff3d0", 0]])}</defs>
<rect width="500" height="480" fill="url(#night)"/>
${starfield(21, 160, 0, 420)}
<circle cx="410" cy="80" r="60" fill="url(#mg)"/>
<path d="M410 52 A28 28 0 1 0 430 100 A22 22 0 1 1 410 52Z" fill="#fff1cc"/>
<path d="${path}" fill="none" stroke="#e8c98a" stroke-width="1.2" stroke-dasharray="1 0" opacity=".85"/>
${nodes}
${sparkle(80, 120, 7, "#fff", 0.9)}${sparkle(120, 330, 5, "#fff", 0.7)}${sparkle(380, 300, 6, "#fff", 0.8)}
<path d="M0 470 L0 420 C80 400 150 395 230 405 C300 414 380 430 500 412 L500 470Z" fill="#0d1129"/>
<g fill="#0d1129"><circle cx="232" cy="378" r="9"/><path d="M219 408 Q220 386 232 386 Q244 386 245 408Z"/><circle cx="256" cy="382" r="8"/><path d="M245 408 Q246 390 256 390 Q266 390 268 408Z"/></g>`,
  };
}

function lovePaperHearts(): Art {
  const strings: [number, number, number, string, string][] = [
    [90, 160, 34, "#e7837f", "#c95e5d"], [160, 250, 44, "#f0a6a0", "#d27b78"], [240, 140, 30, "#c94f5f", "#a63847"],
    [310, 290, 50, "#e7837f", "#c95e5d"], [385, 190, 38, "#f3bdb3", "#d9938a"], [440, 300, 26, "#c94f5f", "#a63847"],
    [60, 330, 28, "#f3bdb3", "#d9938a"], [200, 380, 24, "#c94f5f", "#a63847"],
  ];
  let s = "";
  strings.forEach(([x, y, size, light, dark], i) => {
    s += `<line x1="${x}" y1="0" x2="${x}" y2="${y - size * 0.75}" stroke="#b8908a" stroke-width="1"/>`;
    const sc = size / 50;
    const sway = (i % 2 ? 6 : -6);
    s += `<g transform="translate(${x} ${y}) rotate(${sway}) scale(${n(sc * 100) / 100})"><path d="${HEART}" fill="${light}"/><path d="M0 25 C35 0 46 -30 22 -38 C10 -42 0 -33 0 -24Z" fill="${dark}"/><path d="M0 -24 L0 25" stroke="#fff" stroke-opacity=".35" stroke-width="1"/></g>`;
  });
  return {
    paper: "#fbebe7", ink: "#6b2f36", accent: "#d9837f",
    svg: `<defs>${lg("bg", [[0, "#f8dcd6"], [1, "#fbebe7"]])}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
${confetti(4, 30, ["#f3bdb3", "#e7837f", "#fff"], 20, 440, 0.8)}
${s}`,
  };
}

function loveRoseWreath(): Art {
  let s = "";
  const N = 44;
  for (let i = 0; i < N; i++) {
    const [x, y] = heartPoint(i / N, 250, 212, 11);
    const [x2, y2] = heartPoint((i + 0.5) / N, 250, 212, 11);
    const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
    s += leaf(x, y, 30, ang + 45, "#8aa67f", "#56704d") + leaf(x, y, 26, ang - 45 + 180, "#a7bf98", "#56704d");
  }
  for (let i = 0; i < 20; i++) {
    const [x, y] = heartPoint(i / 20 + 0.012, 250, 212, 11);
    const k = i % 4;
    s += k === 0 ? rose(x, y, 23, "#e9a0a0", "#b5525f", i * 40) : k === 1 ? flower(x, y, 20, 5, "#fff8f0", "#f0c86a", i * 30, 0.36) : k === 2 ? rose(x, y, 17, "#f6cfc6", "#d08a8a", i * 60) : flower(x, y, 13, 5, "#a9c3e0", "#f6e7a8", i * 17, 0.38);
  }
  return {
    paper: "#fcf4ec", ink: "#6a2e37", accent: "#c97b7f",
    svg: `<rect width="500" height="480" fill="#fcf4ec"/>
<circle cx="250" cy="215" r="150" fill="#f8e4dc" opacity=".8"/>
${s}
${heart(250, 222, 26, "#d06e76", 'opacity=".85"')}`,
  };
}

/* ---------------- anniversary ---------------- */

function annivTrees(): Art {
  const r = rng(31);
  const greens = ["#7e9b62", "#93ad72", "#6c8a56", "#a8bd82", "#d9b45a"];
  let canopy = "";
  let placed = 0;
  while (placed < 520) {
    const u = r() * 2.6 - 1.3, v = r() * 2.6 - 1.3; // heart: (x²+y²−1)³ − x²y³ ≤ 0
    if ((u * u + v * v - 1) ** 3 - u * u * v ** 3 > 0) continue;
    placed++;
    const x = 250 + u * 118, y = 175 - v * 118;
    canopy += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(5 + r() * 7)}" fill="${greens[Math.floor(r() * greens.length)]}" opacity="${n(0.8 + r() * 0.2)}"/>`;
  }
  let falling = "";
  for (let i = 0; i < 12; i++) falling += leaf(60 + r() * 380, 300 + r() * 130, 10, r() * 360, r() < 0.4 ? "#d9b45a" : "#93ad72");
  return {
    paper: "#fbf2e4", ink: "#4d3a2a", accent: "#c9a25b",
    svg: `<defs>${lg("sky", [[0, "#f6d6a6"], [0.7, "#fae8cc"], [1, "#fbf2e4"]])}${rg("sun", [[0, "#fff6dc"], [1, "#fff6dc", 0]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="250" cy="200" r="190" fill="url(#sun)"/>
<path d="M222 440 C225 380 215 330 200 290 C192 270 200 250 215 240 M278 440 C275 380 285 330 300 290 C308 270 300 250 285 240" stroke="#6e5240" stroke-width="16" fill="none" stroke-linecap="round"/>
<path d="M205 310 C222 296 234 282 246 262 M295 310 C278 296 266 282 254 262" stroke="#6e5240" stroke-width="7" fill="none" stroke-linecap="round"/>
${canopy}
<path d="M0 440 C150 430 350 432 500 440 L500 480 L0 480Z" fill="#c8b98a"/>
${falling}`,
  };
}

function annivLanterns(): Art {
  const lantern = (x: number, y: number, s: number) => `
<g transform="translate(${x} ${y}) scale(${s})">
<circle r="60" cy="-10" fill="#ffb760" opacity=".35" filter="url(#b14)"/>
<path d="M-18 -30 L18 -30 L22 10 L-22 10Z" fill="url(#lant)"/>
<path d="M-22 10 L22 10 L18 16 L-18 16Z" fill="#7a4a2a"/><path d="M-18 -30 L18 -30 L14 -36 L-14 -36Z" fill="#7a4a2a"/>
<path d="M-6 -30 L-7 10 M6 -30 L7 10" stroke="#e08a3a" stroke-width="1" opacity=".6"/></g>`;
  const refl = (x: number, s: number) => `<ellipse cx="${x}" cy="${n(340 + 34 * s)}" rx="${n(16 * s)}" ry="${n(42 * s)}" fill="#ffb760" opacity=".4" filter="url(#b6)"/>`;
  let ripples = "";
  const r = rng(8);
  for (let i = 0; i < 28; i++) {
    const y = 300 + i * 6 + r() * 3, w = 30 + r() * 140, x = r() * 500;
    ripples += `<line x1="${n(x)}" y1="${n(y)}" x2="${n(x + w)}" y2="${n(y)}" stroke="#f7d9b0" stroke-width=".8" opacity="${n(0.08 + r() * 0.18)}"/>`;
  }
  return {
    paper: "#1b2536", ink: "#f6e8d2", accent: "#e7b06a",
    svg: `<defs>${lg("dusk", [[0, "#26325a"], [0.45, "#7a5a7c"], [0.62, "#e9a17a"], [0.63, "#3a4a66"], [1, "#1b2536"]])}${lg("lant", [[0, "#fff1c4"], [1, "#ffa24a"]])}${blur("b14", 14)}${blur("b6", 6)}</defs>
<rect width="500" height="480" fill="url(#dusk)"/>
${starfield(3, 50, 0, 160, "#fff", 1)}
<path d="M0 300 L60 262 L110 284 L170 240 L240 288 L300 258 L360 280 L430 236 L500 274 L500 302 L0 302Z" fill="#3c4566"/>
<rect y="300" width="500" height="4" fill="#f2b88a" opacity=".5"/>
${ripples}
${refl(215, 1)}${refl(292, 0.85)}
${lantern(215, 270, 1)}${lantern(292, 282, 0.85)}`,
  };
}

function annivRings(): Art {
  let wreath = "";
  for (let side of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const a = Math.PI / 2 + side * (0.25 + i * 0.19);
      const x = 250 + Math.cos(a) * 150, y = 220 + Math.sin(a) * 150;
      const tang = (a * 180) / Math.PI + side * 90;
      wreath += leaf(x, y, 26, tang + side * 35 + 180, "#8a9a6a", "#5d6b45", 0.28) + leaf(x, y, 22, tang - side * 35 + 180, "#a3b283", "#5d6b45", 0.28);
      if (i % 4 === 2) wreath += `<circle cx="${n(x + Math.cos(a) * 10)}" cy="${n(y + Math.sin(a) * 10)}" r="3.5" fill="#d9b45a"/>`;
    }
  }
  return {
    paper: "#faf5ec", ink: "#4a3b2a", accent: "#c7a052",
    svg: `<defs>${lg("gold", [[0, "#f6e2a8"], [0.5, "#c99a3c"], [1, "#f1d58d"]], 0, 0, 1, 1)}${rg("halo", [[0, "#fbefd2"], [1, "#fbefd2", 0]])}</defs>
<rect width="500" height="480" fill="#faf5ec"/>
<circle cx="250" cy="220" r="170" fill="url(#halo)"/>
${wreath}
<circle cx="224" cy="222" r="46" fill="none" stroke="url(#gold)" stroke-width="10"/>
<circle cx="276" cy="222" r="46" fill="none" stroke="url(#gold)" stroke-width="10"/>
<path d="M241 182 A46 46 0 0 1 266 177" fill="none" stroke="url(#gold)" stroke-width="10"/>
<circle cx="224" cy="222" r="46" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="40 250"/>
${sparkle(300, 160, 9, "#e5c06a")}${sparkle(190, 280, 6, "#e5c06a", 0.8)}${sparkle(320, 290, 5, "#e5c06a", 0.7)}`,
  };
}

/* ---------------- wedding ---------------- */

function weddingArch(): Art {
  const r = rng(14);
  let blooms = "";
  const pts: number[][] = [];
  for (let i = 0; i < 8; i++) pts.push([100, 440 - i * 18]);
  for (let i = 0; i < 46; i++) { const a = Math.PI + (i / 45) * Math.PI; pts.push([250 + Math.cos(a) * 150, 300 + Math.sin(a) * 210]); }
  for (let i = 0; i < 8; i++) pts.push([400, 300 + i * 18]);
  for (const [px, py] of [...pts, ...pts]) {
    const i = r() < 0.55 ? 0 : 1;
    const x = px + (r() - 0.5) * 18, y = py + (r() - 0.5) * 18;
    blooms += leaf(x, y, 22, r() * 360, r() < 0.5 ? "#9fb59a" : "#7f9a7a", "#56704f");
    if (i === 0) blooms += r() < 0.6 ? rose(x, y, 12 + r() * 6, "#fffaf3", "#d9c7b4", r() * 360) : flower(x, y, 17, 6, "#f7d9d2", "#e8b86a", r() * 60, 0.34);
  }
  let petals = "";
  for (let i = 0; i < 30; i++) {
    const y = 400 + r() * 60, x = 120 + r() * 260;
    petals += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="3" ry="5" transform="rotate(${n(r() * 180)} ${n(x)} ${n(y)})" fill="${r() < 0.5 ? "#f2c9c2" : "#fff"}" opacity=".9"/>`;
  }
  return {
    paper: "#f7f4ee", ink: "#3f4a3c", accent: "#a9b79f",
    svg: `<defs>${lg("bg", [[0, "#e7ecdf"], [1, "#f7f4ee"]])}${lg("aisle", [[0, "#efe3d2"], [1, "#f7f4ee"]])}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<path d="M100 470 L100 300 A150 210 0 0 1 400 300 L400 470" fill="#fbf8f2" opacity=".9"/>
<ellipse cx="250" cy="452" rx="190" ry="22" fill="#e9e3d6"/>
<path d="M100 470 L100 300 A150 210 0 0 1 400 300 L400 470" fill="none" stroke="#c9b9a0" stroke-width="5"/>
${blooms}
${petals}`,
  };
}

function weddingDoves(): Art {
  const dove = (flip: boolean) => `
<g transform="translate(${flip ? 330 : 170} 210) scale(${flip ? -1 : 1} 1)">
<path d="M-70 10 C-40 -20 0 -10 30 -5 C45 -3 55 -12 62 -10 C70 -8 72 0 66 4 C58 10 50 14 40 22 C20 40 -20 42 -50 30 C-62 26 -74 20 -96 26 C-84 16 -76 14 -70 10Z" fill="#fffdf9" stroke="#d9d2c6" stroke-width="1.2"/>
<path d="M-20 0 C-40 -60 -10 -110 40 -120 C20 -90 30 -60 10 -10Z" fill="#fffdf9" stroke="#d9d2c6" stroke-width="1.2"/>
<path d="M-10 -10 C-14 -50 6 -86 30 -100 M0 -8 C0 -40 14 -66 34 -80 M10 -6 C14 -30 22 -46 36 -58" stroke="#e5ded2" stroke-width="1.2" fill="none"/>
<circle cx="58" cy="-6" r="2.4" fill="#3a3330"/><path d="M68 -4 L78 -1 L68 2Z" fill="#e8b07a"/></g>`;
  const ribbon = `<path d="M247 207 L249 262 M253 207 L251 262" stroke="#d99a9a" stroke-width="2" fill="none"/><path d="${HEART}" transform="translate(250 296) scale(1.5)" fill="#f3d3d0" fill-opacity=".5" stroke="#d99a9a" stroke-width="2.4"/>`;
  let olive = "";
  for (let i = 0; i < 7; i++) olive += leaf(250 + (i - 3) * 12, 380 + Math.abs(i - 3) * 4, 18, i < 3 ? 200 - i * 8 : -20 + (i - 3) * 8, "#8fa07a", "#5d6b4a");
  return {
    paper: "#f6f5f0", ink: "#3d4656", accent: "#b8c4d6",
    svg: `<defs>${lg("sky", [[0, "#dfe8f2"], [0.8, "#f3f2ec"], [1, "#f6f5f0"]])}${rg("glow", [[0, "#fff"], [1, "#fff", 0]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="250" cy="200" r="180" fill="url(#glow)"/>
${cloud(80, 330, 1, "#fff", 0.8)}${cloud(430, 360, 0.9, "#fff", 0.8)}${cloud(400, 80, 0.7, "#fff", 0.7)}
${ribbon}${dove(false)}${dove(true)}
<path d="M200 382 Q250 370 300 382" stroke="#7d8d68" stroke-width="2" fill="none"/>${olive}
${sparkle(250, 150, 8, "#e9c27a")}`,
  };
}

function weddingToast(): Art {
  const r = rng(17);
  let bokeh = "";
  for (let i = 0; i < 26; i++)
    bokeh += `<circle cx="${n(r() * 500)}" cy="${n(r() * 420)}" r="${n(8 + r() * 26)}" fill="${r() < 0.5 ? "#f2c879" : "#f6dcae"}" opacity="${n(0.08 + r() * 0.18)}" filter="url(#b3)"/>`;
  let bubbles = "";
  for (let i = 0; i < 40; i++) {
    const left = i % 2 === 0;
    const x = left ? 175 + r() * 40 : 285 + r() * 40, y = 220 + r() * 130;
    bubbles += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.8 + r() * 1.8)}" fill="#fff8e0" opacity=".85"/>`;
  }
  const flute = (x: number, rot: number) => `
<g transform="rotate(${rot} ${x} 430)">
<path d="M${x - 26} 170 L${x + 26} 170 C${x + 24} 260 ${x + 12} 330 ${x + 3} 345 L${x + 3} 405 L${x + 28} 420 L${x - 28} 420 L${x - 3} 405 L${x - 3} 345 C${x - 12} 330 ${x - 24} 260 ${x - 26} 170Z" fill="#fff" fill-opacity=".14" stroke="#fdf3d8" stroke-width="2"/>
<path d="M${x - 24} 205 L${x + 24} 205 C${x + 22} 270 ${x + 11} 328 ${x + 3} 340 L${x - 3} 340 C${x - 11} 328 ${x - 22} 270 ${x - 24} 205Z" fill="url(#bubbly)"/>
<path d="M${x - 18} 180 C${x - 17} 250 ${x - 10} 300 ${x - 4} 330" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/></g>`;
  return {
    paper: "#24180f", ink: "#f6e7c8", accent: "#d9ad5f",
    svg: `<defs>${lg("bg", [[0, "#1a120c"], [0.6, "#4a3220"], [1, "#24180f"]])}${lg("bubbly", [[0, "#f8dc8e"], [1, "#d9a441"]])}${blur("b3", 3)}${blur("b10", 10)}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
${bokeh}
${flute(215, 10)}${flute(285, -10)}
${bubbles}
<circle cx="250" cy="176" r="30" fill="#ffeab0" opacity=".5" filter="url(#b10)"/>
${sparkle(250, 172, 16, "#fff6d8")}${sparkle(228, 150, 6, "#fff1c4", 0.8)}${sparkle(276, 146, 7, "#fff1c4", 0.8)}
${confetti(23, 18, ["#f2c879", "#fff1c4"], 40, 160, 0.7)}`,
  };
}

/* ---------------- new baby ---------------- */

const star5 = (x: number, y: number, r: number, fill: string, extra = "") => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${n(x + Math.cos(a) * rr)} ${n(y + Math.sin(a) * rr)} `;
  }
  return `<path d="${d}Z" fill="${fill}" stroke-linejoin="round" ${extra}/>`;
};

function babyMoon(): Art {
  return {
    paper: "#f4f1f8", ink: "#4a4466", accent: "#b9b0d9",
    svg: `<defs>${lg("sky", [[0, "#c8cdea"], [0.65, "#e8e4f3"], [1, "#f4f1f8"]])}${lg("moon", [[0, "#fff6d8"], [1, "#f6dc9a"]], 0, 0, 1, 1)}${rg("mh", [[0, "#fff8e2", 0.8], [1, "#fff8e2", 0]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
${starfield(41, 40, 0, 300, "#fff", 1.6)}
<circle cx="250" cy="200" r="150" fill="url(#mh)"/>
<path d="M290 80 A120 120 0 1 0 330 300 A96 96 0 1 1 290 80Z" fill="url(#moon)"/>
<path d="M214 186 Q226 198 238 186" stroke="#8a7458" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="222" cy="214" r="10" fill="#f4b6a6" opacity=".55"/>
<path d="M224 236 Q232 242 240 236" stroke="#8a7458" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<line x1="330" y1="0" x2="330" y2="128" stroke="#a79fca" stroke-width="1.2"/>${star5(330, 146, 20, "#f6dc9a")}
<line x1="380" y1="0" x2="380" y2="200" stroke="#a79fca" stroke-width="1.2"/>${star5(380, 214, 14, "#fbe6b4")}
<line x1="140" y1="0" x2="140" y2="70" stroke="#a79fca" stroke-width="1.2"/>${star5(140, 84, 13, "#fbe6b4")}
${cloud(150, 340, 1.6, "#fff", 0.95)}${cloud(330, 360, 1.9, "#fff", 0.95)}${cloud(250, 390, 2.2, "#fdfbff", 1)}
${sparkle(90, 200, 6, "#fff")}${sparkle(420, 120, 7, "#fff")}`,
  };
}

function babyNest(): Art {
  const r = rng(51);
  let blossoms = "";
  const spots = [[90, 120], [150, 96], [210, 130], [330, 116], [390, 150], [440, 110], [120, 170], [275, 98]];
  spots.forEach(([x, y]) => (blossoms += flower(x, y, 22, 5, "#f7c6cf", "#e58a9b", r() * 70, 0.42) + `<circle cx="${x}" cy="${y}" r="3" fill="#f6e3a0"/>`));
  for (let i = 0; i < 18; i++) { const px = n(r() * 500), py = n(180 + r() * 220); blossoms += `<ellipse cx="${px}" cy="${py}" rx="3" ry="5" transform="rotate(${n(r() * 180)} ${px} ${py})" fill="#f7c6cf" opacity=".8"/>`; }
  const birdy = (x: number, y: number, c: string, flip = 1) => `
<g transform="translate(${x} ${y}) scale(${flip} 1)"><ellipse cx="0" cy="0" rx="26" ry="22" fill="${c}"/><path d="M-6 -2 C6 -14 22 -6 22 6 C10 4 0 6 -6 -2Z" fill="#fff" opacity=".25"/>
<circle cx="-10" cy="-6" r="3" fill="#3b3430"/><path d="M-24 -4 L-34 0 L-24 3Z" fill="#e9a35c"/><circle cx="-12" cy="4" r="5" fill="#f2a7a7" opacity=".5"/></g>`;
  return {
    paper: "#f6f8f2", ink: "#3f4f45", accent: "#a9c4b0",
    svg: `<defs>${lg("bg", [[0, "#dcebe1"], [1, "#f6f8f2"]])}${lg("nest", [[0, "#b98a5e"], [1, "#8a6240"]])}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<path d="M0 160 C100 140 160 180 250 190 C340 200 420 170 500 150" stroke="#7a5a44" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M120 152 C140 120 150 110 160 96 M330 196 C350 170 370 160 390 150 M260 188 C266 150 270 120 275 98" stroke="#7a5a44" stroke-width="5" fill="none" stroke-linecap="round"/>
${leaf(180, 172, 30, 30, "#a6c49a", "#5e7a55")}${leaf(300, 196, 30, 150, "#a6c49a", "#5e7a55")}${leaf(420, 160, 28, 20, "#a6c49a", "#5e7a55")}
${blossoms}
${birdy(225, 238, "#9cc3d9")}${birdy(280, 240, "#f2c38a", -1)}
<path d="M170 256 C180 300 320 300 330 256 Z" fill="url(#nest)"/>
<path d="M172 258 Q250 276 328 258 M178 272 Q250 292 322 272 M190 286 Q250 302 310 286" stroke="#d1a97c" stroke-width="2" fill="none"/>
<path d="M168 256 Q250 244 332 256" stroke="#6e4c30" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  };
}

function babyMobile(): Art {
  const hang = (x: number, len: number, shape: string) => `<line x1="${x}" y1="96" x2="${x}" y2="${96 + len}" stroke="#b9a08a" stroke-width="1.2"/>${shape}`;
  const crescent = (x: number, y: number, r: number) =>
    `<path d="M${x} ${y - r} A${r} ${r} 0 1 0 ${n(x + r * 0.5)} ${n(y + r * 0.87)} A${n(r * 0.8)} ${n(r * 0.8)} 0 1 1 ${x} ${y - r}Z" fill="#f6dc9a"/>`;
  return {
    paper: "#fbf4ef", ink: "#5a4540", accent: "#e6b8a4",
    svg: `<defs>${lg("bg", [[0, "#f8e0d5"], [1, "#fbf4ef"]])}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<line x1="250" y1="0" x2="250" y2="70" stroke="#b9a08a" stroke-width="1.5"/>
<path d="M110 100 Q250 60 390 100" stroke="#c49a78" stroke-width="6" fill="none" stroke-linecap="round"/>
${hang(130, 110, crescent(130, 236, 30))}
${hang(195, 170, star5(195, 286, 26, "#f2b8a6"))}
${hang(250, 90, cloud(250, 206, 1, "#ffffff"))}
${hang(305, 170, heart(305, 290, 30, "#e9a3a8"))}
${hang(370, 120, star5(370, 236, 24, "#a9c6dd"))}
${sparkle(80, 330, 6, "#e6b8a4")}${sparkle(420, 320, 7, "#e6b8a4")}${sparkle(250, 360, 5, "#e6b8a4")}
${starfield(61, 24, 300, 440, "#e6b8a4", 1.6)}`,
  };
}

/* ---------------- graduation ---------------- */

const mortar = (x: number, y: number, s: number, rot: number) => `
<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
<path d="M-24 6 L-24 22 C-12 30 12 30 24 22 L24 6Z" fill="#1f2a44"/>
<path d="M0 -14 L48 4 L0 22 L-48 4Z" fill="#2b3a5c"/><path d="M0 -14 L48 4 L0 6Z" fill="#fff" opacity=".08"/>
<circle cx="0" cy="4" r="3" fill="#e8b84a"/><path d="M0 4 Q30 10 34 30" stroke="#e8b84a" stroke-width="2.2" fill="none"/>
<path d="M30 30 L38 30 L37 46 L31 46Z" fill="#e8b84a"/></g>`;

function gradCaps(): Art {
  return {
    paper: "#f3f6f9", ink: "#24324f", accent: "#e1b54d",
    svg: `<defs>${lg("sky", [[0, "#8db5dc"], [0.6, "#cfe1f0"], [1, "#f3f6f9"]])}${rg("sun", [[0, "#fff8e2"], [1, "#fff8e2", 0]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="250" cy="440" r="260" fill="url(#sun)"/>
${cloud(90, 140, 1.2, "#fff", 0.8)}${cloud(410, 90, 1, "#fff", 0.75)}${cloud(380, 330, 1.3, "#fff", 0.7)}
${confetti(71, 60, ["#e1b54d", "#2b3a5c", "#fff", "#e88f7a"], 20, 420)}
${mortar(160, 210, 1.3, -18)}${mortar(300, 130, 1.6, 12)}${mortar(370, 250, 1.05, 30)}${mortar(230, 330, 0.9, -8)}`,
  };
}

function gradPath(): Art {
  return {
    paper: "#fbf3ea", ink: "#3d3550", accent: "#e3a76f",
    svg: `<defs>${lg("sky", [[0, "#f6c9a4"], [0.5, "#fbe4cc"], [1, "#fbf3ea"]])}${rg("sun", [[0, "#fff4d6"], [0.4, "#ffe2a8", 0.8], [1, "#ffe2a8", 0]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="250" cy="230" r="150" fill="url(#sun)"/>
<circle cx="250" cy="230" r="44" fill="#fff1cf"/>
<g stroke="#ffe6b5" stroke-width="2" opacity=".6">${Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return `<line x1="${n(250 + Math.cos(a) * 60)}" y1="${n(230 + Math.sin(a) * 60)}" x2="${n(250 + Math.cos(a) * 110)}" y2="${n(230 + Math.sin(a) * 110)}"/>`; }).join("")}</g>
<path d="M0 270 L70 200 L130 240 L200 170 L250 215 L310 160 L380 230 L440 190 L500 230 L500 480 L0 480Z" fill="#b7a2c4"/>
<path d="M0 320 L90 260 L170 300 L250 250 L340 300 L420 262 L500 300 L500 480 L0 480Z" fill="#8f7ba6"/>
<path d="M0 380 C120 340 200 360 260 345 C340 326 420 350 500 340 L500 480 L0 480Z" fill="#a3b98d"/>
<path d="M250 252 C262 280 230 300 244 320 C258 342 300 352 280 392 C266 420 220 440 210 480 L300 480 C300 440 340 420 330 392 C320 360 272 340 262 320 C252 300 268 282 256 252Z" fill="#f1e2c8"/>
${bird(170, 140, 0.9, "#6a5a7a")}${bird(196, 124, 0.7, "#6a5a7a")}${bird(330, 112, 0.8, "#6a5a7a")}`,
  };
}

function gradPlane(): Art {
  return {
    paper: "#f4f6f9", ink: "#2c3a55", accent: "#8fb0d6",
    svg: `<defs>${lg("sky", [[0, "#bcd3ea"], [0.7, "#e7eef6"], [1, "#f4f6f9"]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
${cloud(110, 330, 1.6, "#fff", 0.95)}${cloud(400, 380, 1.4, "#fff", 0.9)}${cloud(380, 150, 1, "#fff", 0.8)}
<path d="M40 420 C120 400 140 300 90 280 C40 260 50 340 130 330 C220 318 230 200 330 170" fill="none" stroke="#5f7fa8" stroke-width="2.2" stroke-dasharray="7 8" stroke-linecap="round"/>
<g transform="translate(360 150) rotate(-18)">
<path d="M-60 10 L60 -20 L-10 30Z" fill="#ffffff"/><path d="M-10 30 L60 -20 L-20 18Z" fill="#dfe7f1"/><path d="M-20 18 L60 -20 L-16 40Z" fill="#c6d4e6"/>
<path d="M-60 10 L60 -20" stroke="#9fb4cf" stroke-width="1"/></g>
${sparkle(430, 90, 8, "#f2c66b")}${sparkle(80, 120, 6, "#f2c66b", 0.8)}`,
  };
}

/* ---------------- congratulations ---------------- */

function burst(x: number, y: number, r: number, color: string, rays = 22, seed = 1) {
  const rand = rng(seed);
  let s = `<circle cx="${x}" cy="${y}" r="${r * 0.9}" fill="${color}" opacity=".18" filter="url(#b12)"/>`;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + rand() * 0.1, l = r * (0.65 + rand() * 0.35);
    const x1 = x + Math.cos(a) * r * 0.2, y1 = y + Math.sin(a) * r * 0.2, x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/><circle cx="${n(x2)}" cy="${n(y2 + 3)}" r="2" fill="${color}"/>`;
  }
  return s;
}

function congratsFireworks(): Art {
  let sky = "";
  const r = rng(81);
  let x = 0;
  while (x < 500) {
    const w = 24 + r() * 40, h = 40 + r() * 110;
    sky += `<rect x="${n(x)}" y="${n(470 - h)}" width="${n(w)}" height="${n(h)}" fill="#0c1026"/>`;
    for (let wy = 470 - h + 10; wy < 460; wy += 14)
      for (let wx = x + 6; wx < x + w - 6; wx += 10) if (r() < 0.35) sky += `<rect x="${n(wx)}" y="${n(wy)}" width="4" height="6" fill="#f6d78a" opacity=".7"/>`;
    x += w + 2;
  }
  return {
    paper: "#13162e", ink: "#f6ecd6", accent: "#e6c27a",
    svg: `<defs>${lg("night", [[0, "#0a0d24"], [0.7, "#262a55"], [1, "#13162e"]])}${blur("b12", 12)}</defs>
<rect width="500" height="480" fill="url(#night)"/>
${starfield(82, 70, 0, 300, "#fff", 1)}
${burst(160, 150, 80, "#f2c66b", 26, 1)}${burst(340, 110, 70, "#f08fa6", 22, 2)}${burst(330, 260, 54, "#7fd1c4", 18, 3)}${burst(110, 290, 40, "#fff3d0", 16, 4)}
<path d="M160 470 Q158 330 160 230" stroke="#f2c66b" stroke-width="1" opacity=".25" fill="none"/>
${sky}`,
  };
}

function congratsSummit(): Art {
  return {
    paper: "#fbf1e6", ink: "#3b3446", accent: "#e09a72",
    svg: `<defs>${lg("sky", [[0, "#f2b493"], [0.5, "#fbd9bd"], [1, "#fbf1e6"]])}${lg("rock", [[0, "#7f6f8f"], [1, "#5a4d6c"]], 0, 0, 1, 0)}${rg("sun", [[0, "#fff1d0"], [1, "#fff1d0", 0]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="360" cy="170" r="130" fill="url(#sun)"/><circle cx="360" cy="170" r="38" fill="#fff0cc"/>
${cloud(110, 300, 1.4, "#fff", 0.7)}${cloud(420, 330, 1.2, "#fff", 0.6)}
<path d="M0 400 L120 300 L180 340 L250 130 L320 300 L380 260 L500 360 L500 480 L0 480Z" fill="url(#rock)"/>
<path d="M250 130 L228 196 L242 186 L252 204 L266 184 L276 196Z" fill="#fff8f0"/>
<path d="M0 420 C120 390 240 410 330 400 C410 392 460 404 500 400 L500 480 L0 480Z" fill="#c9b6a6"/>
<line x1="250" y1="130" x2="250" y2="70" stroke="#3b3446" stroke-width="3"/>
<path d="M250 72 C270 66 285 82 306 74 L306 100 C285 108 270 92 250 98Z" fill="#e66f5c"/>
${bird(140, 160, 0.9, "#7a5a6a")}${bird(166, 146, 0.7, "#7a5a6a")}`,
  };
}

function congratsBurst(): Art {
  let rays = "";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2, a2 = a + Math.PI / 36;
    if (i % 2) continue;
    rays += `<path d="M250 220 L${n(250 + Math.cos(a) * 420)} ${n(220 + Math.sin(a) * 420)} L${n(250 + Math.cos(a2) * 420)} ${n(220 + Math.sin(a2) * 420)}Z" fill="#f3d58a" opacity=".35"/>`;
  }
  const streamer = (d: string, c: string) => `<path d="${d}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return {
    paper: "#fdf6e9", ink: "#43352a", accent: "#e0b354",
    svg: `<defs>${rg("core", [[0, "#fff8e0"], [1, "#fff8e0", 0]])}</defs>
<rect width="500" height="480" fill="#fdf3dc"/>
${rays}
<circle cx="250" cy="220" r="140" fill="url(#core)"/>
${streamer("M60 80 C120 120 80 180 140 200 C200 220 170 280 220 300", "#e8796a")}
${streamer("M440 70 C380 110 430 170 370 190 C310 210 340 270 290 296", "#5fb2a8")}
${streamer("M70 380 C110 330 170 360 190 310", "#8b7cc4")}
${streamer("M430 390 C390 340 330 370 310 318", "#f0b347")}
${confetti(91, 90, ["#e8796a", "#5fb2a8", "#8b7cc4", "#f0b347", "#e0b354"], 10, 450, 1.1)}
${star5(250, 220, 46, "#e9b949")}${star5(250, 220, 30, "#f6d27a")}
${sparkle(170, 140, 10, "#e9b949")}${sparkle(340, 150, 8, "#e9b949")}${sparkle(320, 320, 9, "#e9b949")}`,
  };
}

/* ---------------- thank you ---------------- */

function thanksTulips(): Art {
  const tulip = (x: number, y: number, c: string, d: string, rot: number) => `
<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-18 0 C-20 -26 -10 -38 -6 -40 L0 -28 L6 -40 C10 -38 20 -26 18 0 C14 12 -14 12 -18 0Z" fill="${c}"/>
<path d="M0 -28 C-8 -14 -8 0 0 10 C8 0 8 -14 0 -28Z" fill="${d}" opacity=".8"/></g>`;
  const stems: [number, number, number, string, string][] = [
    [205, 150, -14, "#ef8d7d", "#d5675a"], [250, 120, 0, "#f6c565", "#e2a43c"], [298, 150, 14, "#f3a6b4", "#d97e90"],
    [178, 200, -24, "#f3a6b4", "#d97e90"], [322, 196, 22, "#ef8d7d", "#d5675a"], [250, 180, 4, "#ef8d7d", "#d5675a"],
  ];
  let s = "";
  stems.forEach(([x, y, rot]) => (s += `<path d="M${x} ${y} Q${n((x + 250) / 2)} ${n((y + 330) / 2)} 250 330" stroke="#6f9a68" stroke-width="3" fill="none"/>`));
  s += leaf(232, 320, 90, 235, "#87b07e", "#557c4e", 0.18) + leaf(268, 320, 90, -55, "#87b07e", "#557c4e", 0.18) + leaf(240, 318, 70, 260, "#9cc292", "#557c4e", 0.18);
  stems.forEach(([x, y, rot, c, d]) => (s += tulip(x, y, c, d, rot)));
  return {
    paper: "#fcf6ea", ink: "#4a3a2c", accent: "#e3a563",
    svg: `<defs>${lg("bg", [[0, "#fbe8c6"], [1, "#fcf6ea"]])}${lg("vase", [[0, "#7fb3b0"], [1, "#4f8784"]], 0, 0, 1, 0)}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<circle cx="250" cy="230" r="170" fill="#fdf1d8"/>
${s}
<path d="M212 312 L288 312 C292 330 300 350 300 380 C300 420 280 436 250 436 C220 436 200 420 200 380 C200 350 208 330 212 312Z" fill="url(#vase)"/>
<path d="M210 312 L290 312 L288 322 L212 322Z" fill="#3f6f6c"/>
<path d="M216 340 C210 370 212 400 226 420" stroke="#fff" stroke-width="4" opacity=".25" fill="none" stroke-linecap="round"/>
<path d="M60 436 L440 436" stroke="#d9c3a2" stroke-width="2"/>`,
  };
}

function thanksTea(): Art {
  return {
    paper: "#f5f6ef", ink: "#3e4a3a", accent: "#a6b98f",
    svg: `<defs>${lg("bg", [[0, "#e1eadb"], [1, "#f5f6ef"]])}${lg("cup", [[0, "#fffdf8"], [1, "#e9e3d6"]], 0, 0, 1, 0)}${lg("tea", [[0, "#c98a4b"], [1, "#9c6230"]])}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<path d="M250 250 C230 220 270 200 250 170 C232 144 262 128 250 104" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
<path d="M220 240 C204 214 236 196 222 170" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
<path d="M282 238 C298 212 266 194 280 168" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
<g transform="translate(250 92) scale(.8)"><path d="${HEART}" fill="none" stroke="#fff" stroke-width="5"/></g>
<ellipse cx="250" cy="406" rx="150" ry="24" fill="#d9d1c0"/><ellipse cx="250" cy="400" rx="150" ry="22" fill="url(#cup)"/><ellipse cx="250" cy="398" rx="96" ry="12" fill="#e5ddcc"/>
<path d="M150 270 L350 270 C346 340 310 396 250 396 C190 396 154 340 150 270Z" fill="url(#cup)"/>
<path d="M346 290 C400 286 404 352 336 346" stroke="#ece5d6" stroke-width="12" fill="none"/>
<ellipse cx="250" cy="270" rx="100" ry="16" fill="#efe8da"/><ellipse cx="250" cy="272" rx="88" ry="11" fill="url(#tea)"/>
<path d="M176 310 C190 300 212 304 220 318 C206 330 186 326 176 310Z" fill="#a6b98f"/><circle cx="232" cy="318" r="4" fill="#e6a0a0"/><circle cx="244" cy="326" r="3" fill="#e6a0a0"/>
${leaf(110, 430, 40, -30, "#a6b98f", "#6c8256")}${leaf(390, 430, 40, 210, "#a6b98f", "#6c8256")}`,
  };
}

function thanksSunflowers(): Art {
  const sunflower = (x: number, y: number, r: number, rot: number) => {
    let p = "";
    for (let i = 0; i < 22; i++) p += `<ellipse cx="0" cy="${n(-r * 0.62)}" rx="${n(r * 0.16)}" ry="${n(r * 0.42)}" transform="rotate(${n(rot + (i * 360) / 22)})" fill="${i % 2 ? "#f2b632" : "#f7c948"}"/>`;
    let seeds = "";
    const rr = rng(Math.round(x));
    for (let i = 0; i < 40; i++) {
      const a = i * 2.4, d = Math.sqrt(i / 40) * r * 0.36;
      seeds += `<circle cx="${n(Math.cos(a) * d)}" cy="${n(Math.sin(a) * d)}" r="${n(1.2 + rr())}" fill="#3a2614" opacity=".6"/>`;
    }
    return `<g transform="translate(${x} ${y})">${p}<circle r="${n(r * 0.4)}" fill="#6b4220"/>${seeds}</g>`;
  };
  return {
    paper: "#fbf5e6", ink: "#463620", accent: "#e6b33f",
    svg: `<defs>${lg("sky", [[0, "#b9d7ea"], [0.6, "#e9f0e8"], [1, "#fbf5e6"]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="400" cy="90" r="36" fill="#fff4cf"/><circle cx="400" cy="90" r="60" fill="#fff4cf" opacity=".35"/>
${cloud(110, 100, 1.1, "#fff", 0.85)}
<path d="M150 470 Q160 340 160 230 M260 470 Q250 320 250 180 M360 470 Q350 360 350 260" stroke="#6f8f4a" stroke-width="7" fill="none"/>
${leaf(160, 330, 60, 200, "#7fa357", "#4f6f33", 0.3)}${leaf(250, 300, 64, -20, "#7fa357", "#4f6f33", 0.3)}${leaf(350, 380, 56, 210, "#7fa357", "#4f6f33", 0.3)}${leaf(160, 390, 54, -30, "#8fb366", "#4f6f33", 0.3)}
${sunflower(160, 230, 70, 0)}${sunflower(250, 172, 84, 8)}${sunflower(350, 260, 64, 4)}
<path d="M0 440 C120 420 380 424 500 440 L500 480 L0 480Z" fill="#a7bd7a"/>`,
  };
}

/* ---------------- get well ---------------- */

function getwellWindow(): Art {
  return {
    paper: "#fbf3e9", ink: "#4a3b33", accent: "#e2ad7f",
    svg: `<defs>${lg("bg", [[0, "#f6dcc6"], [1, "#fbf3e9"]])}${lg("view", [[0, "#a9cfe8"], [1, "#e4f0f6"]])}${lg("beam", [[0, "#fff4d6", 0.7], [1, "#fff4d6", 0]])}${lg("pot", [[0, "#d98b5f"], [1, "#b46a42"]], 0, 0, 1, 0)}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<path d="M150 360 L150 160 A100 100 0 0 1 350 160 L350 360Z" fill="url(#view)"/>
${cloud(210, 170, 0.9, "#fff", 0.95)}${cloud(310, 240, 0.7, "#fff", 0.9)}
<circle cx="300" cy="120" r="22" fill="#fff3c4"/>
<path d="M150 360 L150 160 A100 100 0 0 1 350 160 L350 360Z" fill="none" stroke="#fffaf2" stroke-width="12"/>
<path d="M250 62 L250 360 M150 240 L350 240" stroke="#fffaf2" stroke-width="8"/>
<path d="M150 140 C120 200 110 300 96 380 L150 380Z" fill="#f2b9a6" opacity=".7"/><path d="M350 140 C380 200 390 300 404 380 L350 380Z" fill="#f2b9a6" opacity=".7"/>
<path d="M170 360 L330 360 L460 480 L40 480Z" fill="url(#beam)" opacity=".7"/>
<rect x="120" y="358" width="260" height="14" rx="3" fill="#e9d6c0"/>
<path d="M214 312 L286 312 L278 358 L222 358Z" fill="url(#pot)"/><rect x="210" y="304" width="80" height="12" rx="3" fill="#c97a4f"/>
${leaf(250, 304, 60, -90, "#7fae76", "#4e7a47", 0.3)}${leaf(250, 304, 54, -125, "#93c08a", "#4e7a47", 0.3)}${leaf(250, 304, 54, -55, "#93c08a", "#4e7a47", 0.3)}${leaf(250, 304, 46, -155, "#7fae76", "#4e7a47", 0.3)}${leaf(250, 304, 46, -25, "#7fae76", "#4e7a47", 0.3)}
${flower(250, 238, 18, 6, "#fff", "#f2c14e", 0, 0.32)}`,
  };
}

function getwellRainbow(): Art {
  const bands = ["#f2a7a0", "#f6c38f", "#f5e19c", "#b8d9a8", "#a6c8e6", "#c3b1df"];
  let arcs = "";
  bands.forEach((c, i) => {
    const r = 180 - i * 16;
    arcs += `<path d="M${250 - r} 400 A${r} ${r} 0 0 1 ${250 + r} 400" stroke="${c}" stroke-width="16" fill="none"/>`;
  });
  let rain = "";
  const r = rng(101);
  for (let i = 0; i < 16; i++) {
    const x = 60 + r() * 90, y = 150 + r() * 120;
    rain += `<path d="M${n(x)} ${n(y)} q-3 8 0 10 q3 -2 0 -10Z" fill="#8fb6d8" opacity=".8"/>`;
  }
  return {
    paper: "#f7f6f2", ink: "#3f4a5a", accent: "#a6c8e6",
    svg: `<defs>${lg("sky", [[0, "#dbe8f3"], [1, "#f7f6f2"]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
${arcs}
${rain}
${cloud(100, 130, 1.5, "#ffffff")}${cloud(80, 395, 1.6, "#ffffff")}${cloud(420, 392, 1.5, "#ffffff")}
<circle cx="400" cy="120" r="30" fill="#fff0bf"/><g stroke="#fbe2a0" stroke-width="3" stroke-linecap="round">${Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5; return `<line x1="${n(400 + Math.cos(a) * 40)}" y1="${n(120 + Math.sin(a) * 40)}" x2="${n(400 + Math.cos(a) * 54)}" y2="${n(120 + Math.sin(a) * 54)}"/>`; }).join("")}</g>
<path d="M0 430 C140 405 360 410 500 430 L500 480 L0 480Z" fill="#bcd6a8"/>`,
  };
}

function getwellDaisies(): Art {
  const r = rng(111);
  let field = "";
  const daisies: [number, number, number][] = [[110, 250, 30], [190, 200, 36], [270, 260, 28], [340, 190, 40], [410, 270, 26], [150, 320, 22], [300, 330, 20], [230, 300, 18], [380, 330, 18]];
  daisies.forEach(([x, y, s]) => {
    field += `<path d="M${x} ${y} Q${n(x + (r() - 0.5) * 30)} ${n((y + 440) / 2)} ${n(x + (r() - 0.5) * 20)} 440" stroke="#7aa063" stroke-width="2.5" fill="none"/>`;
    field += leaf(x + (r() - 0.5) * 10, (y + 440) / 2 + 20, 26, r() < 0.5 ? 210 : -30, "#8bb370", "#55753f", 0.28);
  });
  daisies.forEach(([x, y, s]) => (field += flower(x, y, s, 14, "#ffffff", "#f2b93b", r() * 30, 0.17)));
  const butterfly = `<g transform="translate(250 120) rotate(-14)"><path d="M0 0 C-30 -40 -50 -10 -30 8 C-48 22 -26 44 0 10Z" fill="#f3a6a0"/><path d="M0 0 C30 -40 50 -10 30 8 C48 22 26 44 0 10Z" fill="#f6bfa9"/><ellipse cx="0" cy="6" rx="3" ry="14" fill="#5a4040"/><path d="M-1 -6 Q-8 -20 -12 -22 M1 -6 Q8 -20 12 -22" stroke="#5a4040" stroke-width="1.4" fill="none"/></g>`;
  return {
    paper: "#f7f8ef", ink: "#3d4a33", accent: "#b9cf8f",
    svg: `<defs>${lg("sky", [[0, "#e2efd3"], [1, "#f7f8ef"]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<path d="M0 400 C120 380 380 384 500 400 L500 480 L0 480Z" fill="#cfe0b4"/>
${field}${butterfly}
${sparkle(120, 110, 7, "#f2b93b", 0.8)}${sparkle(390, 100, 6, "#f2b93b", 0.8)}`,
  };
}

/* ---------------- sympathy ---------------- */

function sympathyLilies(): Art {
  const lily = (x: number, y: number, s: number, rot: number) => {
    let p = "";
    for (let i = 0; i < 6; i++)
      p += `<path d="M0 0 C${-10} -20 ${-8} -48 0 -64 C8 -48 10 -20 0 0Z" transform="rotate(${i * 60})" fill="${i % 2 ? "#f4efe6" : "#ffffff"}" stroke="#d8d0c2" stroke-width=".8"/><path d="M0 -6 L0 -50" transform="rotate(${i * 60})" stroke="#e7dccb" stroke-width="1.2"/>`;
    let st = "";
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 + 30) * (Math.PI / 180);
      st += `<line x1="0" y1="0" x2="${n(Math.cos(a) * 30)}" y2="${n(Math.sin(a) * 30)}" stroke="#c9b98f" stroke-width="1.2"/><ellipse cx="${n(Math.cos(a) * 31)}" cy="${n(Math.sin(a) * 31)}" rx="2" ry="4" transform="rotate(${i * 60 + 30} ${n(Math.cos(a) * 31)} ${n(Math.sin(a) * 31)})" fill="#c98e4a"/>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${p}${st}<circle r="5" fill="#d9e6c0"/></g>`;
  };
  return {
    paper: "#1e2733", ink: "#ece6da", accent: "#b8b09e",
    svg: `<defs>${lg("bg", [[0, "#2c3a4c"], [1, "#1e2733"]])}${rg("soft", [[0, "#ffffff", 0.14], [1, "#ffffff", 0]])}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<circle cx="250" cy="220" r="210" fill="url(#soft)"/>
<path d="M190 470 Q210 330 200 250 M250 470 Q250 320 260 200 M310 470 Q300 340 316 270" stroke="#6f8a6a" stroke-width="4" fill="none"/>
${leaf(205, 380, 80, -120, "#5f7a5c", "#3f553e", 0.18)}${leaf(250, 360, 90, -70, "#6f8a6a", "#3f553e", 0.18)}${leaf(306, 400, 70, -50, "#5f7a5c", "#3f553e", 0.18)}${leaf(250, 420, 70, -130, "#6f8a6a", "#3f553e", 0.18)}
${lily(200, 250, 1, 10)}${lily(262, 196, 1.15, -6)}${lily(318, 272, 0.9, 20)}
<path d="M224 300 C214 290 214 274 222 266 C232 276 232 292 224 300Z" fill="#e9e2d4"/>`,
  };
}

function sympathyCandle(): Art {
  return {
    paper: "#26232c", ink: "#efe6d8", accent: "#c9a46a",
    svg: `<defs>${lg("bg", [[0, "#1b1920"], [0.7, "#2e2a35"], [1, "#26232c"]])}${rg("glow", [[0, "#ffd99a", 0.55], [0.4, "#ffb86b", 0.18], [1, "#ffb86b", 0]])}${lg("flame", [[0, "#fffbe8"], [0.5, "#ffe08a"], [1, "#ff9f45"]])}${lg("glass", [[0, "#ffffff", 0.18], [0.5, "#ffffff", 0.04], [1, "#ffffff", 0.16]], 0, 0, 1, 0)}${lg("wax", [[0, "#fbf3e6"], [1, "#e6d6bf"]], 0, 0, 1, 0)}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<circle cx="250" cy="250" r="230" fill="url(#glow)"/>
<rect x="210" y="270" width="80" height="140" rx="6" fill="url(#wax)"/>
<ellipse cx="250" cy="270" rx="40" ry="8" fill="#f6ead6"/>
<path d="M250 200 C262 222 262 246 250 258 C238 246 238 222 250 200Z" fill="url(#flame)"/>
<path d="M250 230 C254 240 254 250 250 256 C246 250 246 240 250 230Z" fill="#fff" opacity=".85"/>
<line x1="250" y1="256" x2="250" y2="266" stroke="#3b2f2a" stroke-width="2"/>
<path d="M190 240 L310 240 L304 420 L196 420Z" fill="url(#glass)" stroke="#ffffff" stroke-opacity=".2"/>
<ellipse cx="250" cy="424" rx="90" ry="10" fill="#000" opacity=".25"/>
${starfield(121, 30, 0, 200, "#ffe6b8", 1)}`,
  };
}

function sympathyHorizon(): Art {
  let shimmer = "";
  const r = rng(131);
  for (let i = 0; i < 26; i++) {
    const y = 330 + i * 5.5, w = 20 + r() * (60 + i * 3);
    shimmer += `<line x1="${n(250 - w / 2)}" y1="${n(y)}" x2="${n(250 + w / 2)}" y2="${n(y)}" stroke="#f9dcc0" stroke-width="1.4" opacity="${n(0.25 + r() * 0.35)}"/>`;
  }
  return {
    paper: "#f2eee9", ink: "#45475a", accent: "#c3b6c9",
    svg: `<defs>${lg("sky", [[0, "#b9c2d6"], [0.5, "#e2cfd4"], [0.68, "#f3d9c6"], [0.681, "#9aa6bd"], [1, "#f2eee9"]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<path d="M200 326 A50 50 0 0 1 300 326Z" fill="#fbe6cc"/>
${shimmer}
${cloud(110, 140, 1.4, "#f5eef0", 0.6)}${cloud(400, 200, 1.1, "#f5eef0", 0.5)}
${bird(300, 200, 1, "#5d5e72")}${bird(330, 176, 0.8, "#5d5e72")}${bird(356, 160, 0.6, "#5d5e72")}${bird(378, 146, 0.5, "#5d5e72")}`,
  };
}

/* ---------------- thinking of you ---------------- */

function thinkingDandelion(): Art {
  const tuft = (len: number) =>
    [-60, -40, -20, 0, 20, 40, 60].map((d) => `<line x1="0" y1="0" x2="${n(Math.sin((d * Math.PI) / 180) * len)}" y2="${n(-Math.cos((d * Math.PI) / 180) * len)}"/>`).join("");
  let head = "";
  const cx = 200, cy = 196, R = 58;
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * 360;
    if (a > 300 && a < 350) continue; // a few seeds have already blown away
    const rad = ((a - 90) * Math.PI) / 180;
    const ex = cx + Math.cos(rad) * R, ey = cy + Math.sin(rad) * R;
    head += `<line x1="${cx}" y1="${cy}" x2="${n(ex)}" y2="${n(ey)}" stroke="#d6cfbf" stroke-width=".7"/>`;
    head += `<g transform="translate(${n(ex)} ${n(ey)}) rotate(${n(a)})" stroke="#ffffff" stroke-width=".8" stroke-linecap="round">${tuft(12)}</g>`;
  }
  let drift = "";
  const r = rng(141);
  for (let i = 0; i < 13; i++) {
    const x = 262 + i * 16 + r() * 12, y = 140 - i * 8 + (r() - 0.5) * 46, a = 20 + r() * 50;
    drift += `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(a)})"><line x1="0" y1="0" x2="0" y2="16" stroke="#d6cfbf" stroke-width=".8"/><ellipse cx="0" cy="17" rx="1.2" ry="2.4" fill="#9c8a68"/><g stroke="#fff" stroke-width=".8" stroke-linecap="round">${tuft(10)}</g></g>`;
  }
  return {
    paper: "#f1f3ee", ink: "#3b4440", accent: "#9fb0a6",
    svg: `<defs>${lg("sky", [[0, "#a9bcb6"], [0.6, "#d3ddd8"], [1, "#f1f3ee"]])}${rg("soft", [[0, "#ffffff", 0.55], [1, "#ffffff", 0]])}</defs>
<rect width="500" height="480" fill="url(#sky)"/>
<circle cx="${cx}" cy="${cy}" r="110" fill="url(#soft)"/>
<path d="M${cx} ${cy + 6} C${cx + 6} 300 ${cx - 10} 380 ${cx + 14} 470" stroke="#6f8a63" stroke-width="3.2" fill="none"/>
${leaf(206, 420, 74, -58, "#7f9b70", "#506a45", 0.2)}${leaf(204, 444, 64, -128, "#8ea67f", "#506a45", 0.2)}
${head}<circle cx="${cx}" cy="${cy}" r="8" fill="#b4a17a"/>
${drift}
${starfield(142, 18, 40, 320, "#ffffff", 1.2)}`,
  };
}

function thinkingLetter(): Art {
  let sprig = "";
  const r = rng(151);
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const x = 300 + t * 90 + (r() - 0.5) * 20, y = 150 - t * 70 + (r() - 0.5) * 20;
    sprig += flower(x, y, 13, 5, "#8fb6e0", "#f6e39a", r() * 70, 0.4);
  }
  return {
    paper: "#f1f4f8", ink: "#33405a", accent: "#9fb6d6",
    svg: `<defs>${lg("bg", [[0, "#dbe5f1"], [1, "#f1f4f8"]])}${lg("env", [[0, "#fffdf8"], [1, "#efe7d9"]])}${rg("wax", [[0, "#c9474f"], [1, "#8e2730"]], 0.4, 0.35, 0.7)}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<g transform="rotate(-8 250 280)">
<rect x="120" y="190" width="260" height="170" rx="6" fill="#000" opacity=".08" transform="translate(6 8)"/>
<rect x="120" y="190" width="260" height="170" rx="6" fill="url(#env)"/>
<path d="M120 360 L250 270 L380 360" fill="none" stroke="#e2d8c6" stroke-width="2"/>
<path d="M120 190 L250 290 L380 190Z" fill="#f7f1e6" stroke="#e2d8c6" stroke-width="1.5"/>
<circle cx="250" cy="288" r="22" fill="url(#wax)"/><circle cx="250" cy="288" r="22" fill="none" stroke="#7a1f28" stroke-width="2" stroke-dasharray="3 4" opacity=".6"/>
${heart(250, 291, 14, "#7a1f28", 'opacity=".55"')}</g>
<path d="M290 170 Q340 120 400 80" stroke="#7c946c" stroke-width="2" fill="none"/>
${leaf(330, 140, 24, -60, "#93ab83", "#5a7050")}${leaf(360, 114, 22, 20, "#93ab83", "#5a7050")}
${sprig}`,
  };
}

function thinkingLighthouse(): Art {
  return {
    paper: "#141c2e", ink: "#f1e9da", accent: "#e8c47a",
    svg: `<defs>${lg("night", [[0, "#0c1324"], [0.7, "#24325a"], [1, "#141c2e"]])}${lg("beamL", [[0, "#fff1c4", 0], [1, "#fff1c4", 0.55]], 0, 0, 1, 0)}${lg("beamR", [[0, "#fff1c4", 0.55], [1, "#fff1c4", 0]], 0, 0, 1, 0)}${blur("b6", 6)}</defs>
<rect width="500" height="480" fill="url(#night)"/>
${starfield(161, 120, 0, 330)}
<path d="M0 120 L310 168 L310 184 L0 250Z" fill="url(#beamL)"/>
<path d="M330 168 L500 130 L500 230 L330 184Z" fill="url(#beamR)" opacity=".6"/>
<circle cx="320" cy="176" r="18" fill="#fff1c4" filter="url(#b6)"/>
<path d="M300 380 L306 196 L334 196 L340 380Z" fill="#f2ece2"/>
<path d="M302 320 L338 320 L339 344 L301 344Z M304 248 L336 248 L337 272 L303 272Z" fill="#c9474f"/>
<rect x="302" y="160" width="36" height="36" fill="#2b3550"/><rect x="306" y="166" width="28" height="26" fill="#ffe6a6"/>
<path d="M298 160 L320 138 L342 160Z" fill="#c9474f"/><rect x="296" y="194" width="48" height="6" fill="#2b3550"/>
<path d="M200 470 L240 380 L290 370 L360 372 L420 400 L470 470Z" fill="#0d1322"/>
<path d="M0 400 C80 396 160 404 220 410 L200 480 L0 480Z" fill="#1c2742"/><path d="M460 420 C480 418 490 420 500 420 L500 480 L470 480Z" fill="#1c2742"/>
<g stroke="#f6e6b8" stroke-width="1" opacity=".25">${Array.from({ length: 10 }, (_, i) => `<line x1="${20 + i * 22}" y1="${430 + i * 4}" x2="${60 + i * 22}" y2="${430 + i * 4}"/>`).join("")}</g>`,
  };
}

/* ---------------- holidays ---------------- */

function holidayVillage(): Art {
  const house = (x: number, w: number, h: number, roof: string, wall: string) => `
<g><rect x="${x}" y="${440 - h}" width="${w}" height="${h}" fill="${wall}"/>
<path d="M${x - 8} ${440 - h} L${x + w / 2} ${440 - h - w * 0.55} L${x + w + 8} ${440 - h}Z" fill="${roof}"/>
<path d="M${x - 8} ${440 - h} L${x + w / 2} ${440 - h - w * 0.55} L${x + w + 8} ${440 - h} L${x + w + 4} ${446 - h} L${x + w / 2} ${446 - h - w * 0.5} L${x - 4} ${446 - h}Z" fill="#fff"/>
<rect x="${x + w * 0.2}" y="${440 - h * 0.62}" width="${w * 0.22}" height="${h * 0.26}" fill="#ffd27a"/><rect x="${x + w * 0.58}" y="${440 - h * 0.62}" width="${w * 0.22}" height="${h * 0.26}" fill="#ffd27a"/>
<circle cx="${x + w * 0.31}" cy="${440 - h * 0.49}" r="${w * 0.3}" fill="#ffd27a" opacity=".2" filter="url(#b8)"/><circle cx="${x + w * 0.69}" cy="${440 - h * 0.49}" r="${w * 0.3}" fill="#ffd27a" opacity=".2" filter="url(#b8)"/></g>`;
  const pine = (x: number, s: number) => `<g transform="translate(${x} 440) scale(${s})"><path d="M0 -90 L22 -50 L12 -50 L30 -18 L18 -18 L36 12 L-36 12 L-18 -18 L-30 -18 L-12 -50 L-22 -50Z" fill="#2f5b4c"/><path d="M0 -90 L10 -72 L-10 -72Z M-14 -46 L14 -46 L8 -40 L-8 -40Z" fill="#fff" opacity=".85"/></g>`;
  let snow = "";
  const r = rng(171);
  for (let i = 0; i < 110; i++) snow += `<circle cx="${n(r() * 500)}" cy="${n(r() * 470)}" r="${n(0.8 + r() * 2.2)}" fill="#fff" opacity="${n(0.5 + r() * 0.5)}"/>`;
  return {
    paper: "#1a2438", ink: "#f4ecdc", accent: "#e6c27a",
    svg: `<defs>${lg("night", [[0, "#111a30"], [0.7, "#34446c"], [1, "#1a2438"]])}${blur("b8", 8)}${rg("moon", [[0, "#fff5d6", 0.6], [1, "#fff5d6", 0]])}</defs>
<rect width="500" height="480" fill="url(#night)"/>
<circle cx="380" cy="100" r="80" fill="url(#moon)"/><circle cx="380" cy="100" r="30" fill="#fff4d2"/>
<path d="M0 380 C100 350 200 360 260 340 C340 316 420 340 500 330 L500 480 L0 480Z" fill="#c8d4e6" opacity=".35"/>
${pine(60, 1.1)}${pine(450, 1.2)}
${house(110, 80, 70, "#8c3b42", "#e9dcc8")}${house(210, 96, 90, "#3b5a7a", "#f1e6d4")}${house(330, 74, 64, "#6c4a3a", "#e3d4bf")}
${pine(190, 0.7)}${pine(318, 0.6)}
<path d="M0 438 C120 432 380 434 500 438 L500 480 L0 480Z" fill="#eef2f8"/>
${snow}`,
  };
}

function holidayWreath(): Art {
  const r = rng(181);
  let needles = "";
  for (let i = 0; i < 480; i++) {
    const a = r() * Math.PI * 2, d = 112 + (r() - 0.5) * 50;
    const x = 250 + Math.cos(a) * d, y = 220 + Math.sin(a) * d;
    needles += leaf(x, y, 14 + r() * 10, (a * 180) / Math.PI + 90 + (r() - 0.5) * 80, ["#2f5d46", "#3d7254", "#24503b", "#4f8564"][Math.floor(r() * 4)], "", 0.18);
  }
  let berries = "";
  for (let i = 0; i < 30; i++) {
    const a = r() * Math.PI * 2, d = 112 + (r() - 0.5) * 34;
    const x = 250 + Math.cos(a) * d, y = 220 + Math.sin(a) * d;
    berries += `<circle cx="${n(x)}" cy="${n(y)}" r="5" fill="#c43a3f"/><circle cx="${n(x + 4)}" cy="${n(y + 3)}" r="4" fill="#d9484d"/><circle cx="${n(x - 1.5)}" cy="${n(y - 1.5)}" r="1.4" fill="#fff" opacity=".6"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4, x = 250 + Math.cos(a) * 112, y = 220 + Math.sin(a) * 112;
    berries += `<g transform="translate(${n(x)} ${n(y)}) rotate(${n((a * 180) / Math.PI)})"><ellipse rx="9" ry="12" fill="#a9784a"/><path d="M-8 -4 L8 -4 M-9 2 L9 2 M-7 8 L7 8" stroke="#7a5230" stroke-width="2"/></g>`;
  }
  return {
    paper: "#faf5ec", ink: "#3a3a2e", accent: "#c43a3f",
    svg: `<defs>${lg("ribbon", [[0, "#d9484d"], [1, "#a82a33"]])}</defs>
<rect width="500" height="480" fill="#faf5ec"/>
<circle cx="250" cy="220" r="180" fill="#f3ead9" opacity=".8"/>
${needles}${berries}
<path d="M250 330 L230 420 L246 410 L254 424 L262 342Z" fill="url(#ribbon)"/><path d="M252 330 L280 416 L264 408 L258 422 L246 342Z" fill="url(#ribbon)"/>
<path d="M250 332 C222 300 186 310 194 334 C200 356 236 346 250 332 C264 346 300 356 306 334 C314 310 278 300 250 332Z" fill="url(#ribbon)"/>
<ellipse cx="250" cy="332" rx="11" ry="9" fill="#a82a33"/>
${sparkle(110, 90, 7, "#d9b45a")}${sparkle(400, 80, 6, "#d9b45a")}${sparkle(420, 380, 6, "#d9b45a", 0.8)}`,
  };
}

function holidayTree(): Art {
  const r = rng(191);
  let lights = "";
  for (let i = 0; i < 170; i++) {
    const t = Math.sqrt(r());
    const y = 90 + t * 330, half = t * 150;
    const x = 250 + (r() * 2 - 1) * half;
    const c = ["#ffd27a", "#ffe9b0", "#ffb86b", "#fff6dc"][Math.floor(r() * 4)];
    const rad = 2 + r() * 6;
    lights += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(rad * 2.4)}" fill="${c}" opacity=".18" filter="url(#b5)"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(rad * 0.6)}" fill="${c}" opacity=".95"/>`;
  }
  let snow = "";
  for (let i = 0; i < 50; i++) snow += `<circle cx="${n(r() * 500)}" cy="${n(r() * 460)}" r="${n(0.8 + r() * 1.6)}" fill="#fff" opacity="${n(0.3 + r() * 0.4)}"/>`;
  return {
    paper: "#13281f", ink: "#f5ecd8", accent: "#e6c27a",
    svg: `<defs>${lg("bg", [[0, "#0d1d16"], [0.7, "#1f3d30"], [1, "#13281f"]])}${blur("b5", 5)}${rg("glow", [[0, "#ffd27a", 0.25], [1, "#ffd27a", 0]])}</defs>
<rect width="500" height="480" fill="url(#bg)"/>
<ellipse cx="250" cy="280" rx="200" ry="220" fill="url(#glow)"/>
${snow}
<path d="M250 90 L400 420 L100 420Z" fill="#1b3a2c" opacity=".55"/>
${lights}
<rect x="236" y="420" width="28" height="30" fill="#5a3a26"/>
<circle cx="250" cy="78" r="26" fill="#ffe08a" opacity=".35" filter="url(#b5)"/>${star5(250, 80, 20, "#ffe08a")}`,
  };
}

export const ART: Record<string, () => Art> = {
  getwellWindow, getwellRainbow, getwellDaisies,
  sympathyLilies, sympathyCandle, sympathyHorizon,
  thinkingDandelion, thinkingLetter, thinkingLighthouse,
  holidayVillage, holidayWreath, holidayTree,
  bdayCandles, bdayBalloons, bdayBouquet,
  loveConstellation, lovePaperHearts, loveRoseWreath,
  annivTrees, annivLanterns, annivRings,
  weddingArch, weddingDoves, weddingToast,
  babyMoon, babyNest, babyMobile,
  gradCaps, gradPath, gradPlane,
  congratsFireworks, congratsSummit, congratsBurst,
  thanksTulips, thanksTea, thanksSunflowers,
};

/** Full SVG for a card's artwork (no text). */
export function cardArtSvg(artKey: string): { svg: string; art: Art } {
  const fn = ART[artKey];
  const art = fn();
  return { svg: frame(art), art };
}
