// Centerpiece motifs, part 1: general-purpose (hearts, stars, balloons, gifts, flowers, birds, skies).
// Each motif draws around the card's upper centre (x≈250, y≈60–440).
import { HEART, bird, blur, cloud, confetti, flower, heart, leaf, lg, n, rg, rng, rose, sparkle, star5 } from "./artKit";
import type { Pal } from "./artScenes";

export type Opt = { c1?: string; c2?: string; c3?: string; k?: number; seed?: number; alt?: boolean; sym?: string };
export type Motif = (P: Pal, o: Opt) => string;

const pick = (P: Pal, o: Opt, i: number) => [o.c1, o.c2, o.c3][i] || P.c[i % P.c.length];

export const heartBig: Motif = (P, o) => {
  const c1 = pick(P, o, 0), c2 = o.c2 || P.accent;
  return `<defs>${rg("mhb", [[0, c1], [1, c2]], 0.4, 0.35, 0.8)}${blur("mhbB", 16)}</defs>
<g transform="translate(250 250) scale(2.7)"><path d="${HEART}" fill="${c1}" opacity=".35" filter="url(#mhbB)"/><path d="${HEART}" fill="url(#mhb)"/>
<path d="M-24 -30 C-34 -26 -38 -14 -32 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/></g>
${sparkle(150, 140, 9, P.dark ? "#fff" : P.accent)}${sparkle(360, 150, 7, P.dark ? "#fff" : P.accent, 0.8)}${sparkle(345, 340, 6, P.dark ? "#fff" : P.accent, 0.7)}`;
};

export const heartCluster: Motif = (P, o) => {
  const r = rng(o.seed ?? 3);
  let s = "";
  const spots: [number, number, number][] = [[250, 230, 70], [168, 180, 40], [334, 176, 46], [190, 300, 34], [318, 300, 38], [250, 128, 28], [130, 260, 22], [372, 252, 24], [250, 350, 26]];
  spots.forEach(([x, y, z], i) => (s += `<g transform="rotate(${n((r() - 0.5) * 30)} ${x} ${y})">${heart(x, y, z, P.c[i % P.c.length])}</g>`));
  return s;
};

export const starBig: Motif = (P, o) => {
  const c = o.c1 || P.accent;
  return `<defs>${rg("msb", [[0, "#fff6d8"], [1, c]], 0.45, 0.4, 0.7)}${blur("msbB", 20)}</defs>
<circle cx="250" cy="236" r="130" fill="${c}" opacity=".3" filter="url(#msbB)"/>
${star5(250, 240, 112, "url(#msb)")}${star5(250, 240, 70, "#fff", 'opacity=".18"')}
${star5(120, 130, 16, c)}${star5(380, 120, 12, c)}${star5(400, 330, 14, c)}${star5(110, 340, 10, c)}
${sparkle(170, 90, 7, "#fff")}${sparkle(330, 400, 6, "#fff", 0.8)}`;
};

export const balloons: Motif = (P, o) => {
  const r = rng(o.seed ?? 5);
  const knot = [250, 436];
  const cols = [pick(P, o, 0), pick(P, o, 1), pick(P, o, 2), P.c[3] || P.accent, P.accent];
  let strings = "", body = "", defs = "";
  const count = o.k ?? 6;
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (i - (count - 1) / 2) * 0.42;
    const d = 150 + r() * 50;
    const x = 250 + Math.cos(a) * d * 0.95, y = 300 + Math.sin(a) * d * 0.85, rr = 34 + r() * 14;
    const c = cols[i % cols.length];
    defs += rg(`mbl${i}`, [[0, "#ffffff", 0.0], [0.15, c], [1, c]], 0.35, 0.3, 0.8);
    const by = y + rr * 1.18;
    strings += `<path d="M${n(x)} ${n(by + 6)} C${n(x + (i % 2 ? 12 : -12))} ${n(by + 60)} ${n(knot[0] + (x - 250) * 0.25)} ${n(knot[1] - 70)} ${knot[0]} ${knot[1]}" stroke="${P.dark ? "#d8cfc0" : "#8a7a6e"}" stroke-width="1" fill="none" opacity=".7"/>`;
    body += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rr)}" ry="${n(rr * 1.18)}" fill="url(#mbl${i})"/><ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rr)}" ry="${n(rr * 1.18)}" fill="#000" opacity=".06"/><path d="M${n(x - 5)} ${n(by + 7)} L${n(x)} ${n(by - 1)} L${n(x + 5)} ${n(by + 7)}Z" fill="${c}"/><ellipse cx="${n(x - rr * 0.38)}" cy="${n(y - rr * 0.45)}" rx="${n(rr * 0.15)}" ry="${n(rr * 0.3)}" transform="rotate(25 ${n(x - rr * 0.38)} ${n(y - rr * 0.45)})" fill="#fff" opacity=".45"/>`;
  }
  return `<defs>${defs}</defs>${strings}${body}`;
};

export const heartBalloon: Motif = (P, o) => {
  const c = pick(P, o, 0);
  return `<defs>${rg("mhbl", [[0, "#ffffff", 0.3], [0.3, c], [1, o.c2 || P.accent]], 0.35, 0.3, 0.8)}</defs>
<path d="M250 330 C240 370 268 390 252 440" stroke="${P.dark ? "#d8cfc0" : "#8a7a6e"}" stroke-width="1.2" fill="none"/>
<g transform="translate(250 230) scale(2.2)"><path d="${HEART}" fill="url(#mhbl)"/><path d="M-26 -28 C-34 -22 -36 -12 -30 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/></g>
<path d="M245 288 L250 280 L255 288Z" fill="${c}"/>
${heart(130, 140, 22, P.c[1])}${heart(380, 110, 18, P.c[2] || P.c[1])}${heart(380, 330, 14, P.c[1])}
${cloud(100, 360, 0.8, "#fff", P.dark ? 0.15 : 0.6)}`;
};

export const giftBox: Motif = (P, o) => {
  const box = pick(P, o, 0), rib = o.c2 || P.accent;
  return `<defs>${lg("mgb", [[0, box], [1, box]], 0, 0, 1, 0)}</defs>
<ellipse cx="250" cy="430" rx="130" ry="12" fill="#000" opacity=".12"/>
<rect x="150" y="270" width="200" height="160" rx="6" fill="${box}"/><rect x="150" y="270" width="200" height="160" rx="6" fill="#000" opacity=".08"/>
<rect x="138" y="236" width="224" height="44" rx="6" fill="${box}"/>
<rect x="234" y="236" width="32" height="194" fill="${rib}"/><rect x="138" y="250" width="224" height="16" fill="${rib}" opacity=".0"/>
<path d="M250 236 C210 180 160 196 176 226 C186 246 230 240 250 236 C270 240 314 246 324 226 C340 196 290 180 250 236Z" fill="${rib}"/>
<path d="M250 236 C226 206 198 210 200 226 M250 236 C274 206 302 210 300 226" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>
<circle cx="250" cy="236" r="12" fill="${rib}"/><circle cx="250" cy="236" r="12" fill="#000" opacity=".12"/>
${confetti(o.seed ?? 9, 30, P.c, 60, 220, 0.9)}${sparkle(130, 180, 8, P.accent)}${sparkle(370, 170, 7, P.accent)}`;
};

export const giftStack: Motif = (P, o) => {
  const g = (x: number, y: number, w: number, h: number, c: string, rib: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/><rect x="${x - 6}" y="${y - 16}" width="${w + 12}" height="20" rx="4" fill="${c}"/><rect x="${x - 6}" y="${y - 16}" width="${w + 12}" height="20" rx="4" fill="#fff" opacity=".12"/><rect x="${x + w / 2 - 8}" y="${y - 16}" width="16" height="${h + 16}" fill="${rib}"/><path d="M${x + w / 2} ${y - 16} C${x + w / 2 - 30} ${y - 50} ${x + w / 2 - 48} ${y - 26} ${x + w / 2} ${y - 16} C${x + w / 2 + 30} ${y - 50} ${x + w / 2 + 48} ${y - 26} ${x + w / 2} ${y - 16}Z" fill="${rib}"/>`;
  return `<ellipse cx="250" cy="432" rx="160" ry="12" fill="#000" opacity=".12"/>${g(120, 330, 130, 100, P.c[0], P.c[3] || P.accent)}${g(262, 350, 110, 80, P.c[2] || P.c[1], P.c[1])}${g(180, 230, 120, 90, P.c[1], P.accent)}${sparkle(380, 220, 9, P.accent)}${sparkle(120, 250, 7, P.accent)}${confetti(o.seed ?? 4, 20, P.c, 60, 200, 0.8)}`;
};

export const cupcake: Motif = (P, o) => {
  const icing = pick(P, o, 0), liner = o.c2 || P.accent;
  let pleats = "";
  for (let i = 0; i < 9; i++) pleats += `<line x1="${n(176 + i * 18.5)}" y1="320" x2="${n(196 + i * 13.5)}" y2="430" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`;
  return `<ellipse cx="250" cy="432" rx="110" ry="10" fill="#000" opacity=".12"/>
<path d="M170 320 L330 320 L310 430 L190 430Z" fill="${liner}"/>${pleats}
<ellipse cx="250" cy="318" rx="96" ry="30" fill="${icing}"/><ellipse cx="250" cy="286" rx="78" ry="30" fill="${icing}"/><ellipse cx="250" cy="256" rx="58" ry="26" fill="${icing}"/><ellipse cx="250" cy="232" rx="36" ry="20" fill="${icing}"/>
<path d="M190 300 Q250 318 310 300 M204 270 Q250 284 296 270" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>
${confetti(o.seed ?? 6, 26, P.c, 230, 320, 0.6).replace(/<rect/g, '<rect').slice(0)}
${o.alt ? `<rect x="246" y="168" width="8" height="46" rx="2" fill="#fbf1e6"/><path d="M250 140 C258 152 258 162 250 166 C242 162 242 152 250 140Z" fill="#ffd36b"/><circle cx="250" cy="156" r="24" fill="#ffcf73" opacity=".3" filter="url(#bgB)"/>` : `<circle cx="250" cy="206" r="16" fill="#c9343f"/><path d="M250 192 C254 176 266 168 276 166" stroke="#5a7a3a" stroke-width="3" fill="none"/><circle cx="244" cy="200" r="4" fill="#fff" opacity=".5"/>`}`;
};

export const cakeSimple: Motif = (P, o) => {
  const cake = o.c1 || "#f6e3cf", icing = o.c2 || P.c[0];
  const k = o.k ?? 3;
  let drips = "M150 300", candles = "";
  for (let i = 0; i < 10; i++) { const x = 150 + i * 20; drips += ` L${x + 6} 300 Q${x + 10} ${318 + (i % 3) * 9} ${x + 14} 300`; }
  drips += " L350 300 L350 284 L150 284Z";
  for (let i = 0; i < k; i++) {
    const x = 250 + (i - (k - 1) / 2) * 34;
    candles += `<rect x="${x - 5}" y="226" width="10" height="56" rx="2" fill="${P.c[(i + 1) % P.c.length]}"/><path d="M${x} 196 C${x + 8} 208 ${x + 8} 218 ${x} 222 C${x - 8} 218 ${x - 8} 208 ${x} 196Z" fill="#ffd36b"/><circle cx="${x}" cy="210" r="20" fill="#ffcf73" opacity=".3" filter="url(#bgB)"/>`;
  }
  return `<ellipse cx="250" cy="430" rx="150" ry="14" fill="#000" opacity=".12"/><ellipse cx="250" cy="424" rx="140" ry="12" fill="${P.dark ? "#d9c3b0" : "#ffffff"}"/>
<rect x="150" y="284" width="200" height="136" rx="10" fill="${cake}"/><path d="${drips}" fill="${icing}"/>
<path d="M150 360 L350 360" stroke="${icing}" stroke-width="6" opacity=".5"/>${candles}
${confetti(o.seed ?? 12, 24, P.c, 100, 260, 0.8)}`;
};

export const partyHats: Motif = (P, o) => {
  const hat = (x: number, y: number, rot: number, c: string, s: string) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 -120 L60 40 L-60 40Z" fill="${c}"/><path d="M-30 -40 L30 -40 M-45 0 L45 0" stroke="${s}" stroke-width="10" opacity=".9"/><path d="M0 -120 L60 40 L-60 40Z" fill="none" stroke="#000" stroke-opacity=".06"/><circle cy="-124" r="14" fill="${s}"/><path d="M-62 40 Q0 56 62 40" stroke="${s}" stroke-width="6" fill="none"/></g>`;
  const streamer = (d: string, c: string) => `<path d="${d}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  return `${streamer("M60 120 C110 150 70 200 120 220 C170 240 140 300 190 320", P.c[2] || P.accent)}${streamer("M440 110 C390 140 430 190 380 210 C330 230 360 290 310 316", P.c[3] || P.accent)}
${hat(200, 330, -14, pick(P, o, 0), "#fff7e6")}${hat(310, 320, 12, pick(P, o, 1), "#fff7e6")}${confetti(o.seed ?? 21, 50, P.c, 30, 430, 1)}`;
};

export const bunting: Motif = (P, o) => {
  let s = "";
  [[60, 80, 30], [120, 140, 24], [180, 210, 20]].forEach(([y0, sag, size], row) => {
    s += `<path d="M-10 ${y0} Q250 ${y0 + sag} 510 ${y0}" stroke="${P.dark ? "#e6dccb" : "#a08d7c"}" stroke-width="1.4" fill="none"/>`;
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12, x = -10 + t * 520, y = y0 + 2 * sag * t * (1 - t) * 1;
      s += `<path d="M${n(x - size * 0.7)} ${n(y)} L${n(x + size * 0.7)} ${n(y)} L${n(x)} ${n(y + size * 1.3)}Z" fill="${P.c[(i + row) % P.c.length]}"/>`;
    }
  });
  return s + star5(250, 330, 50, pick(P, o, 0)) + `<circle cx="250" cy="330" r="80" fill="${P.accent}" opacity=".15" filter="url(#bgB)"/>` + confetti(o.seed ?? 31, 30, P.c, 260, 440, 0.9);
};

export const lanterns: Motif = (P, o) => {
  let s = "";
  const spots: [number, number, number][] = [[110, 160, 44], [200, 230, 56], [300, 190, 50], [395, 250, 40], [160, 340, 34], [340, 360, 36]];
  spots.forEach(([x, y, r], i) => {
    const c = P.c[i % P.c.length];
    s += `<line x1="${x}" y1="0" x2="${x}" y2="${y - r}" stroke="${P.dark ? "#d8cfc0" : "#9a8a7a"}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="${c}" opacity="${P.dark ? 0.25 : 0.12}" filter="url(#bgB)"/>
<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.9)}" fill="${c}"/>${[0.35, 0.7].map((k) => `<ellipse cx="${x}" cy="${y}" rx="${n(r * k)}" ry="${n(r * 0.9)}" fill="none" stroke="#000" stroke-opacity=".1"/>`).join("")}
<rect x="${n(x - r * 0.35)}" y="${n(y - r * 0.98)}" width="${n(r * 0.7)}" height="6" rx="2" fill="${P.dark ? "#2b2b2b" : "#6a5a4a"}"/><rect x="${n(x - r * 0.3)}" y="${n(y + r * 0.86)}" width="${n(r * 0.6)}" height="6" rx="2" fill="${P.dark ? "#2b2b2b" : "#6a5a4a"}"/>`;
  });
  return s + (o.alt ? confetti(o.seed ?? 2, 20, P.c, 300, 440, 0.7) : "");
};

export const garlandStars: Motif = (P, o) => {
  let s = "";
  const xs = [70, 130, 190, 250, 310, 370, 430];
  xs.forEach((x, i) => {
    const y = 140 + ((i * 53) % 5) * 40;
    s += `<line x1="${x}" y1="0" x2="${x}" y2="${y - 22}" stroke="${P.dark ? "#d8cfc0" : "#a89a8a"}" stroke-width="1"/>`;
    s += o.sym === "heart" ? heart(x, y, 26, P.c[i % P.c.length]) : star5(x, y, 24, P.c[i % P.c.length]);
  });
  return s + sparkle(250, 400, 8, P.accent) + sparkle(140, 420, 6, P.accent, 0.7) + sparkle(360, 410, 6, P.accent, 0.7);
};

/** Hand-tied bouquet with a paper wrap. */
export const bouquet: Motif = (P, o) => {
  const r = rng(o.seed ?? 8);
  const main = pick(P, o, 0), dark = o.c2 || P.accent;
  let s = "";
  for (const x of [190, 215, 240, 260, 285, 310]) s += `<path d="M${x} 250 Q${n(250 + (x - 250) * 0.4)} 360 250 455" stroke="#7e9a6e" stroke-width="2.5" fill="none"/>`;
  for (let i = 0; i < 8; i++) s += leaf(250 + (r() - 0.5) * 160, 180 + r() * 90, 46 + r() * 20, r() * 360, i % 2 ? "#8fae84" : "#a6c29a", "#5f7d55");
  const heads: [number, number, number][] = [[250, 196, 40], [196, 228, 32], [306, 230, 34], [222, 160, 28], [282, 158, 30], [250, 262, 26]];
  heads.forEach(([x, y, z], i) => (s += i % 3 === 1 ? flower(x, y, z * 1.2, 12, "#fffdf8", "#f2c14e", r() * 30, 0.2) : rose(x, y, z, i % 2 ? main : P.c[1], dark, r() * 360)));
  for (let i = 0; i < 6; i++) s += flower(160 + r() * 180, 150 + r() * 130, 11, 5, P.c[3] || "#8fb3d9", "#f6e7a8", r() * 60, 0.38);
  return s + `<path d="M178 290 L322 290 L268 470 L232 470Z" fill="${o.c3 || "#e3c7a4"}"/><path d="M178 290 L232 470 L250 470 L215 290Z" fill="#fff" opacity=".15"/>
<path d="M250 372 C226 352 206 360 214 376 C222 390 244 380 250 372 C256 380 278 390 286 376 C294 360 274 352 250 372Z" fill="${dark}"/><circle cx="250" cy="374" r="6" fill="${dark}"/>`;
};

/** Flowers in a vase. k: 0 tulips, 1 roses, 2 daisies, 3 lavender, 4 lilies. */
export const vase: Motif = (P, o) => {
  const k = o.k ?? 0;
  const r = rng(o.seed ?? 14);
  const vc = o.c3 || P.accent;
  let stems = "", heads = "";
  const tips: [number, number][] = [[200, 160], [250, 120], [300, 160], [176, 210], [324, 206], [250, 186], [224, 136], [278, 140]];
  const count = k === 3 ? 8 : 6;
  for (let i = 0; i < count; i++) {
    const [x, y] = tips[i];
    stems += `<path d="M${x} ${y} Q${n((x + 250) / 2)} ${n((y + 320) / 2)} 250 320" stroke="#6f9a68" stroke-width="2.6" fill="none"/>`;
    const c = i % 2 ? pick(P, o, 0) : pick(P, o, 1);
    if (k === 0) heads += `<g transform="translate(${x} ${y}) rotate(${n((x - 250) / 4)})"><path d="M-17 0 C-19 -25 -10 -36 -6 -38 L0 -27 L6 -38 C10 -36 19 -25 17 0 C13 11 -13 11 -17 0Z" fill="${c}"/><path d="M0 -27 C-7 -13 -7 0 0 9 C7 0 7 -13 0 -27Z" fill="#000" opacity=".1"/></g>`;
    else if (k === 1) heads += leaf(x, y + 6, 22, 200, "#7fa06c") + leaf(x, y + 6, 22, -20, "#7fa06c") + rose(x, y - 6, 28, c, o.c2 || P.accent, r() * 360);
    else if (k === 2) heads += flower(x, y - 6, 30, 13, "#ffffff", "#f2b93b", r() * 30, 0.17);
    else if (k === 3) { for (let j = 0; j < 7; j++) heads += `<ellipse cx="${n(x + (j % 2 ? 3 : -3))}" cy="${n(y - j * 7)}" rx="4" ry="6" fill="${j % 2 ? "#9c8ac9" : "#b4a3dd"}"/>`; }
    else { let p = ""; for (let j = 0; j < 6; j++) p += `<path d="M0 0 C-7 -14 -6 -32 0 -42 C6 -32 7 -14 0 0Z" transform="rotate(${j * 60})" fill="#fffdf8" stroke="#e2d8c6" stroke-width=".7"/>`; heads += `<g transform="translate(${x} ${y - 6}) scale(.8)">${p}<circle r="4" fill="#d9b45a"/></g>`; }
  }
  const lv = leaf(232, 318, 80, 235, "#87b07e", "#557c4e", 0.18) + leaf(268, 318, 80, -55, "#87b07e", "#557c4e", 0.18);
  return `${stems}${lv}${heads}
<path d="M210 312 L290 312 C296 336 306 356 306 386 C306 422 284 436 250 436 C216 436 194 422 194 386 C194 356 204 336 210 312Z" fill="${vc}"/><path d="M206 310 L294 310 L292 322 L208 322Z" fill="#000" opacity=".12"/>
<path d="M214 342 C206 372 210 402 224 420" stroke="#fff" stroke-width="5" opacity=".25" fill="none" stroke-linecap="round"/><path d="M60 436 L440 436" stroke="${P.dark ? "#ffffff33" : "#00000022"}" stroke-width="2"/>`;
};

export const singleRose: Motif = (P, o) => {
  const c = pick(P, o, 0), d = o.c2 || P.accent;
  return `<path d="M250 250 C246 320 258 380 248 450" stroke="#5f7d4f" stroke-width="5" fill="none"/>
${leaf(250, 330, 60, -30, "#7fa06c", "#4f6b3e", 0.32)}${leaf(250, 372, 54, 200, "#8fb07a", "#4f6b3e", 0.32)}
<path d="M254 300 l8 -4 M246 350 l-8 -4 M253 405 l8 -3" stroke="#5f7d4f" stroke-width="3" stroke-linecap="round"/>
<path d="M200 220 C200 280 300 280 300 220 C300 250 200 250 200 220Z" fill="${d}" opacity=".85"/>
${rose(250, 210, 52, c, d, 30)}
<path d="M206 214 C190 180 214 160 232 168 M294 214 C310 180 286 160 268 168" stroke="${d}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
${sparkle(160, 130, 7, P.accent)}${sparkle(350, 150, 6, P.accent, 0.8)}`;
};

/** Leaf wreath with flowers around a small central symbol (o.sym). */
export const wreath: Motif = (P, o) => {
  const r = rng(o.seed ?? 18);
  let s = "";
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2, d = 120 + (r() - 0.5) * 22;
    const x = 250 + Math.cos(a) * d, y = 230 + Math.sin(a) * d;
    s += leaf(x, y, 22 + r() * 12, (a * 180) / Math.PI + 90 + (r() - 0.5) * 70, ["#8aa67f", "#a7bf98", "#6f8f62"][i % 3], "#56704d", 0.3);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2, x = 250 + Math.cos(a) * 120, y = 230 + Math.sin(a) * 120;
    s += i % 2 ? flower(x, y, 18, 5, P.c[i % P.c.length], "#f6e7a8", r() * 70, 0.4) : rose(x, y, 14, pick(P, o, 0), o.c2 || P.accent, r() * 360);
  }
  return s + symbol(o.sym || "heart", 250, 230, P, o);
};

/** Small centred symbol used inside wreaths and frames. */
export function symbol(sym: string, x: number, y: number, P: Pal, o: Opt): string {
  const c = o.c1 || P.accent;
  switch (sym) {
    case "star": return star5(x, y, 30, c);
    case "rings": return `<circle cx="${x - 16}" cy="${y}" r="26" fill="none" stroke="#d4a845" stroke-width="6"/><circle cx="${x + 16}" cy="${y}" r="26" fill="none" stroke="#e6c06a" stroke-width="6"/>`;
    case "dove": return `<g transform="translate(${x} ${y}) scale(.7)"><path d="M-50 10 C-20 -14 20 -6 34 0 C44 2 52 -6 58 -4 C64 -2 64 6 58 8 C40 20 0 34 -36 24 C-46 22 -58 18 -70 22 C-62 14 -56 12 -50 10Z" fill="#fff" stroke="#d9d2c6"/><path d="M-6 2 C-20 -36 0 -64 30 -70 C16 -50 22 -30 10 -2Z" fill="#fff" stroke="#d9d2c6"/><circle cx="52" cy="-1" r="2" fill="#333"/></g>`;
    case "moon": return `<path d="M${x + 8} ${y - 30} A30 30 0 1 0 ${x + 26} ${y + 20} A24 24 0 1 1 ${x + 8} ${y - 30}Z" fill="#f6dc9a"/>`;
    case "candle": return `<rect x="${x - 10}" y="${y - 10}" width="20" height="44" rx="3" fill="#fbf3e6"/><path d="M${x} ${y - 40} C${x + 8} ${y - 28} ${x + 8} ${y - 18} ${x} ${y - 14} C${x - 8} ${y - 18} ${x - 8} ${y - 28} ${x} ${y - 40}Z" fill="#ffd36b"/>`;
    case "snow": return `<g stroke="${c}" stroke-width="3" stroke-linecap="round">${[0, 60, 120].map((a) => `<line x1="${n(x - Math.cos((a * Math.PI) / 180) * 30)}" y1="${n(y - Math.sin((a * Math.PI) / 180) * 30)}" x2="${n(x + Math.cos((a * Math.PI) / 180) * 30)}" y2="${n(y + Math.sin((a * Math.PI) / 180) * 30)}"/>`).join("")}</g>`;
    case "none": return "";
    default: return heart(x, y + 4, 34, c);
  }
}

export const flowerRing: Motif = (P, o) => {
  const r = rng(o.seed ?? 22);
  let s = "";
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2, d = 110 + (r() - 0.5) * 50;
    s += leaf(250 + Math.cos(a) * d, 230 + Math.sin(a) * d, 26, r() * 360, i % 2 ? "#8fae84" : "#a9c49b", "#5f7d55");
  }
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2, d = 110 + (r() - 0.5) * 40;
    const x = 250 + Math.cos(a) * d, y = 230 + Math.sin(a) * d, c = P.c[i % P.c.length];
    s += i % 3 === 0 ? rose(x, y, 16 + r() * 6, c, P.accent, r() * 360) : flower(x, y, 16 + r() * 10, i % 2 ? 6 : 5, c, "#fff3c4", r() * 60, 0.36);
  }
  return s;
};

export const sunflowerBig: Motif = (P, o) => {
  let p = "";
  for (let i = 0; i < 28; i++) p += `<ellipse cx="0" cy="-70" rx="15" ry="42" transform="rotate(${n(i * 12.86)})" fill="${i % 2 ? "#f2b632" : "#f7c948"}"/>`;
  let seeds = "";
  for (let i = 0; i < 90; i++) { const a = i * 2.4, d = Math.sqrt(i / 90) * 40; seeds += `<circle cx="${n(Math.cos(a) * d)}" cy="${n(Math.sin(a) * d)}" r="1.8" fill="#3a2614" opacity=".55"/>`; }
  return `<path d="M250 260 C256 330 244 390 252 450" stroke="#6f8f4a" stroke-width="8" fill="none"/>${leaf(250, 360, 80, -25, "#7fa357", "#4f6f33", 0.32)}${leaf(250, 400, 70, 200, "#8fb366", "#4f6f33", 0.32)}
<g transform="translate(250 220)">${p}<circle r="46" fill="#6b4220"/>${seeds}</g>${sparkle(120, 120, 8, "#f2b632")}${sparkle(390, 140, 7, "#f2b632")}`;
};

export const butterflies: Motif = (P, o) => {
  const bf = (x: number, y: number, s: number, rot: number, c1: string, c2: string) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C-30 -40 -54 -10 -32 8 C-50 22 -26 46 0 10Z" fill="${c1}"/><path d="M0 0 C30 -40 54 -10 32 8 C50 22 26 46 0 10Z" fill="${c2}"/><circle cx="-26" cy="-8" r="5" fill="#fff" opacity=".5"/><circle cx="26" cy="-8" r="5" fill="#fff" opacity=".5"/><ellipse cx="0" cy="6" rx="3" ry="15" fill="#4a3a3a"/><path d="M-1 -8 Q-8 -22 -13 -24 M1 -8 Q8 -22 13 -24" stroke="#4a3a3a" stroke-width="1.4" fill="none"/></g>`;
  const trail = `<path d="M90 380 C140 330 120 280 180 260 C230 244 220 200 270 180" stroke="${P.accent}" stroke-width="1.5" stroke-dasharray="4 6" fill="none"/>`;
  return trail + bf(290, 160, 1.5, -12, pick(P, o, 0), pick(P, o, 1)) + bf(170, 270, 1.05, 18, P.c[2] || P.c[0], P.c[3] || P.c[1]) + bf(350, 320, 0.8, -24, P.c[1], P.c[0]) +
    flower(110, 420, 22, 6, "#fff", "#f2b93b", 0, 0.32) + flower(390, 430, 18, 5, P.c[0], "#fff3c4", 10, 0.4) + leaf(110, 440, 30, -60, "#8fae84") + leaf(390, 446, 26, 240, "#8fae84");
};

export const birdsBranch: Motif = (P, o) => {
  const b = (x: number, y: number, c: string, flip: number) => `<g transform="translate(${x} ${y}) scale(${flip} 1)"><ellipse rx="34" ry="28" fill="${c}"/><path d="M-6 -4 C8 -18 30 -8 30 6 C14 4 0 6 -6 -4Z" fill="#fff" opacity=".25"/><path d="M26 6 C44 2 52 10 60 6 C52 16 40 18 26 14Z" fill="${c}"/><circle cx="-14" cy="-8" r="3.4" fill="#2b2522"/><path d="M-32 -6 L-44 -1 L-32 3Z" fill="#e9a35c"/><circle cx="-16" cy="4" r="6" fill="#f2a7a7" opacity=".5"/><path d="M-4 26 L-6 36 M6 26 L8 36" stroke="#8a6a4a" stroke-width="2"/></g>`;
  return `<path d="M0 300 C120 290 200 310 290 302 C380 294 440 310 500 300" stroke="#7a5a44" stroke-width="9" fill="none" stroke-linecap="round"/>
${leaf(110, 296, 40, 210, "#8fae84", "#5f7d55")}${leaf(400, 300, 40, -30, "#8fae84", "#5f7d55")}${leaf(150, 298, 30, 140, "#a6c29a")}${flower(70, 290, 18, 5, P.c[1], "#f6e3a0", 0, 0.42)}${flower(440, 296, 16, 5, P.c[1], "#f6e3a0", 20, 0.42)}
${b(212, 262, pick(P, o, 0), 1)}${b(288, 262, pick(P, o, 1), -1)}${heart(250, 170, 34, P.accent)}${heart(214, 130, 14, P.c[0])}${heart(290, 120, 12, P.c[1])}`;
};

export const birdsWire: Motif = (P, o) => {
  const b = (x: number, c: string, flip = 1, tilt = 0) => `<g transform="translate(${x} 240) rotate(${tilt}) scale(${flip} 1)"><ellipse cx="0" cy="-20" rx="18" ry="16" fill="${c}"/><circle cx="-10" cy="-34" r="10" fill="${c}"/><circle cx="-13" cy="-36" r="2" fill="#222"/><path d="M-20 -34 L-28 -31 L-20 -29Z" fill="#e9a35c"/><path d="M14 -16 L30 -8 L14 -8Z" fill="${c}"/></g>`;
  const ink = P.dark ? "#cfc6b8" : "#4a4440";
  return `<path d="M-10 236 Q250 262 510 236" stroke="${ink}" stroke-width="1.6" fill="none"/><path d="M-10 300 Q250 320 510 300" stroke="${ink}" stroke-width="1.2" fill="none" opacity=".5"/>
${b(90, ink)}${b(150, ink, 1, -6)}${b(232, pick(P, o, 0), -1)}${b(268, pick(P, o, 1), 1)}${b(380, ink, -1)}${b(440, ink, 1, 8)}${heart(250, 160, 26, P.accent)}`;
};

export const envelope: Motif = (P, o) => {
  const e = o.c1 || "#fffaf2";
  return `<g transform="rotate(-6 250 330)"><rect x="140" y="270" width="220" height="150" rx="6" fill="#000" opacity=".1" transform="translate(6 8)"/>
<rect x="140" y="270" width="220" height="150" rx="6" fill="${e}"/>
<path d="M140 270 L250 190 L360 270Z" fill="${e}" stroke="#e2d8c6" stroke-width="1.5"/>
<rect x="166" y="190" width="168" height="130" rx="4" fill="#ffffff" stroke="#eee5d6"/>
<path d="M188 222 L312 222 M188 244 L300 244 M188 266 L280 266" stroke="#d8cdbb" stroke-width="3" stroke-linecap="round"/>
<path d="M140 270 L250 350 L360 270 L360 420 L140 420Z" fill="${e}" stroke="#e2d8c6" stroke-width="1.5"/></g>
${heart(250, 150, 30, pick(P, o, 0))}${heart(200, 112, 14, P.c[1])}${heart(300, 104, 16, P.c[2] || P.c[1])}${sparkle(370, 170, 7, P.accent)}`;
};

export const mugsTwo: Motif = (P, o) => {
  const mug = (x: number, c: string, flip: number) => `<g transform="translate(${x} 330) scale(${flip} 1)"><path d="M-50 -60 L50 -60 L44 60 C42 70 -42 70 -44 60Z" fill="${c}"/><path d="M48 -30 C84 -30 84 26 46 26" stroke="${c}" stroke-width="12" fill="none"/><ellipse cx="0" cy="-60" rx="50" ry="10" fill="#5a3a26"/><path d="M-36 -40 L-34 40" stroke="#fff" stroke-width="5" opacity=".25" stroke-linecap="round"/></g>`;
  const steam = (x: number) => `<path d="M${x} 250 C${x - 14} 230 ${x + 14} 214 ${x} 194" stroke="${P.dark ? "#ffffff" : "#ffffff"}" stroke-width="4" fill="none" opacity=".8" stroke-linecap="round"/>`;
  return `${steam(186)}${steam(314)}<g transform="translate(250 162) scale(.9)"><path d="${HEART}" fill="none" stroke="#fff" stroke-width="5"/></g>
${mug(186, pick(P, o, 0), 1)}${mug(314, pick(P, o, 1), -1)}<ellipse cx="250" cy="402" rx="170" ry="10" fill="#000" opacity=".1"/>`;
};

export const kite: Motif = (P, o) => {
  let bows = "";
  for (let i = 0; i < 6; i++) {
    const t = i / 5, x = 260 - t * 120 + Math.sin(t * 6) * 30, y = 260 + t * 160;
    bows += `<path d="M${n(x - 10)} ${n(y - 6)} L${n(x)} ${n(y)} L${n(x - 10)} ${n(y + 6)}Z M${n(x + 10)} ${n(y - 6)} L${n(x)} ${n(y)} L${n(x + 10)} ${n(y + 6)}Z" fill="${P.c[i % P.c.length]}"/>`;
  }
  return `<path d="M260 260 C240 300 170 330 180 380 C190 420 150 430 140 420" stroke="${P.dark ? "#ddd" : "#7a6a5a"}" stroke-width="1.3" fill="none"/>${bows}
<g transform="rotate(-14 270 170)"><path d="M270 60 L340 170 L270 270 L200 170Z" fill="${pick(P, o, 0)}"/><path d="M270 60 L340 170 L270 170Z" fill="${pick(P, o, 1)}"/><path d="M270 170 L200 170 L270 270Z" fill="${pick(P, o, 1)}"/><path d="M270 60 L270 270 M200 170 L340 170" stroke="#fff" stroke-width="1.5" opacity=".6"/></g>
<path d="M180 380 C200 420 230 440 250 470" stroke="${P.dark ? "#ddd" : "#7a6a5a"}" stroke-width="1" fill="none" opacity=".6"/>`;
};

export const hotAir: Motif = (P, o) => {
  const hb = (x: number, y: number, s: number, c1: string, c2: string) => {
    let stripes = "";
    for (let i = -2; i <= 2; i++) stripes += `<path d="M0 -60 C${i * 18 - 8} -60 ${i * 22 - 10} -10 ${i * 8} 40 L${i * 8 + 6} 40 C${i * 22 + 10} -10 ${i * 18 + 8} -60 0 -60Z" fill="${i % 2 ? c2 : c1}" opacity="${i === 0 ? 1 : 0.9}"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -62 C-58 -62 -62 0 -14 42 L14 42 C62 0 58 -62 0 -62Z" fill="${c1}"/>${stripes}<path d="M-12 42 L-10 62 M12 42 L10 62" stroke="#6a5040" stroke-width="1.5"/><rect x="-11" y="62" width="22" height="16" rx="3" fill="#a77a52"/></g>`;
  };
  return hb(250, 190, 1.6, pick(P, o, 0), pick(P, o, 1)) + hb(110, 300, 0.8, P.c[2] || P.accent, P.c[3] || P.c[0]) + hb(392, 270, 0.95, P.c[1], P.c[2] || P.accent) + cloud(160, 400, 1.2, "#fff", 0.8) + cloud(380, 410, 1, "#fff", 0.75);
};

export const paperBoat: Motif = (P, o) => {
  const r = rng(o.seed ?? 33);
  let w = "";
  for (let i = 0; i < 14; i++) w += `<path d="M${n(r() * 460)} ${n(380 + i * 6)} q20 -6 40 0" stroke="${P.dark ? "#ffffff" : P.accent}" stroke-width="1.4" fill="none" opacity=".4"/>`;
  return `<path d="M0 370 C120 362 380 378 500 368 L500 480 L0 480Z" fill="${P.accent}" opacity=".25"/>${w}
<g transform="translate(250 330)"><path d="M-110 0 L110 0 L80 40 L-80 40Z" fill="${o.c1 || "#ffffff"}" stroke="#bdb3a2" stroke-width="1.5" stroke-linejoin="round"/><path d="M-110 0 L0 0 L-20 -110Z" fill="#f6f2ea" stroke="#bdb3a2" stroke-width="1.5" stroke-linejoin="round"/><path d="M0 0 L110 0 L-20 -110Z" fill="#ddd5c6" stroke="#bdb3a2" stroke-width="1.5" stroke-linejoin="round"/><path d="M-80 40 L80 40 L110 0 L-110 0Z" fill="#000" opacity=".05"/></g>
<path d="M150 384 Q250 396 350 384" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>`;
};

export const umbrella: Motif = (P, o) => {
  const r = rng(o.seed ?? 41);
  let rain = "";
  for (let i = 0; i < 40; i++) { const x = r() * 500, y = r() * 300; if (Math.abs(x - 250) < 140 && y > 120) continue; rain += `<line x1="${n(x)}" y1="${n(y)}" x2="${n(x - 6)}" y2="${n(y + 16)}" stroke="${P.dark ? "#cfe0f0" : "#8fb0d6"}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`; }
  const c1 = pick(P, o, 0), c2 = pick(P, o, 1);
  return `${rain}<path d="M250 200 L250 400 C250 420 226 420 226 404" stroke="#4a3a3a" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M110 220 C110 120 390 120 390 220 C370 204 344 204 320 220 C298 204 272 204 250 220 C228 204 202 204 180 220 C156 204 130 204 110 220Z" fill="${c1}"/>
<path d="M180 220 C186 150 230 126 250 126 C230 150 228 190 250 220 C228 204 202 204 180 220Z M320 220 C314 150 270 126 250 126 C270 150 272 190 250 220 C272 204 298 204 320 220Z" fill="${c2}"/>
<circle cx="250" cy="124" r="6" fill="#4a3a3a"/>${heart(250, 300, 24, P.accent)}`;
};

export const moonStars: Motif = (P, o) => {
  return `<circle cx="250" cy="220" r="150" fill="#fff6d8" opacity="${P.dark ? 0.1 : 0.4}" filter="url(#bgB)"/>
<path d="M280 90 A120 120 0 1 0 330 300 A98 98 0 1 1 280 90Z" fill="${o.c1 || "#f6dc9a"}"/>
${[[330, 0, 128, 20], [380, 0, 210, 14], [150, 0, 96, 14], [420, 0, 120, 10]].map(([x, , y, z]) => `<line x1="${x}" y1="0" x2="${x}" y2="${y - z}" stroke="${P.dark ? "#d8cfc0" : "#a79fca"}" stroke-width="1"/>${star5(x, y, z, o.c2 || "#fbe6b4")}`).join("")}
${sparkle(110, 260, 8, "#fff")}${sparkle(390, 330, 7, "#fff")}${sparkle(200, 380, 5, "#fff", 0.8)}`;
};

export const moonPhases: Motif = (P, o) => {
  let s = "";
  const c = o.c1 || "#f6dc9a", sh = P.dark ? P.mid : "#ffffff";
  for (let i = 0; i < 5; i++) {
    const x = 90 + i * 80, y = 230 + (i === 2 ? -10 : 0), r = i === 2 ? 34 : 26;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
    if (i !== 2) s += `<circle cx="${x + (i < 2 ? -1 : 1) * r * (i % 2 ? 0.55 : 1.05)}" cy="${y}" r="${r}" fill="${sh}" opacity="${P.dark ? 1 : 0.9}"/>`;
  }
  return `<circle cx="250" cy="220" r="80" fill="${c}" opacity=".18" filter="url(#bgB)"/>${s}<path d="M90 300 Q250 340 410 300" stroke="${P.accent}" stroke-width="1.2" stroke-dasharray="3 6" fill="none"/>${star5(250, 360, 12, c)}${star5(180, 130, 8, c)}${star5(330, 130, 9, c)}`;
};

export const rainbowCloud: Motif = (P, o) => {
  const bands = ["#f2a7a0", "#f6c38f", "#f5e19c", "#b8d9a8", "#a6c8e6", "#c3b1df"];
  let s = "";
  bands.forEach((c, i) => { const r = 130 - i * 14; s += `<path d="M${180 - r} 330 A${r} ${r} 0 0 1 ${180 + r} 330" stroke="${c}" stroke-width="14" fill="none" transform="translate(70 0)"/>`; });
  return s + cloud(130, 330, 1.4, "#fff") + cloud(370, 330, 1.4, "#fff") + `<circle cx="380" cy="130" r="28" fill="#fff0bf"/>` + sparkle(250, 140, 9, P.accent) + sparkle(140, 190, 6, P.accent);
};

export const sunRays: Motif = (P, o) => {
  let rays = "";
  for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8; rays += `<path d="M${n(250 + Math.cos(a - 0.08) * 90)} ${n(220 + Math.sin(a - 0.08) * 90)} L${n(250 + Math.cos(a) * 150)} ${n(220 + Math.sin(a) * 150)} L${n(250 + Math.cos(a + 0.08) * 90)} ${n(220 + Math.sin(a + 0.08) * 90)}Z" fill="${o.c1 || "#f6c95a"}"/>`; }
  return `<circle cx="250" cy="220" r="160" fill="#fff3c4" opacity=".5" filter="url(#bgB)"/>${rays}<circle cx="250" cy="220" r="78" fill="${o.c2 || "#fbd56a"}"/>
<path d="M222 210 Q230 202 238 210 M262 210 Q270 202 278 210" stroke="#a0662a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M226 238 Q250 258 274 238" stroke="#a0662a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="216" cy="232" r="9" fill="#f29c7a" opacity=".5"/><circle cx="284" cy="232" r="9" fill="#f29c7a" opacity=".5"/>` + cloud(140, 380, 1.2, "#fff", 0.85) + cloud(370, 390, 1, "#fff", 0.8);
};

export const sprout: Motif = (P, o) => {
  return `<ellipse cx="250" cy="432" rx="110" ry="10" fill="#000" opacity=".12"/>
<path d="M190 330 L310 330 L292 430 L208 430Z" fill="${o.c1 || "#d98b5f"}"/><rect x="182" y="316" width="136" height="22" rx="4" fill="${o.c2 || "#c97a4f"}"/>
<ellipse cx="250" cy="320" rx="58" ry="8" fill="#6a4a32"/>
<path d="M250 320 C250 280 246 250 252 210" stroke="#6f9a58" stroke-width="5" fill="none"/>
<path d="M252 236 C210 236 186 206 194 178 C228 176 252 200 252 236Z" fill="#8fbf74"/><path d="M252 222 C290 220 316 190 306 162 C272 162 250 186 252 222Z" fill="#7aae62"/>
<path d="M252 236 C236 222 218 204 200 184 M252 222 C268 208 286 190 300 172" stroke="#5b8a45" stroke-width="1.6" fill="none"/>
${sparkle(170, 150, 8, P.accent)}${sparkle(340, 130, 7, P.accent)}${sparkle(320, 270, 5, P.accent, 0.8)}`;
};

export const tree: Motif = (P, o) => {
  const r = rng(o.seed ?? 51);
  const cols = [o.c1 || "#7e9b62", o.c2 || "#93ad72", o.c3 || "#a8bd82"];
  let canopy = "", falling = "";
  for (let i = 0; i < 360; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 120; canopy += `<circle cx="${n(250 + Math.cos(a) * d * 1.1)}" cy="${n(190 + Math.sin(a) * d * 0.85)}" r="${n(6 + r() * 8)}" fill="${cols[i % 3]}"/>`; }
  for (let i = 0; i < 14; i++) falling += leaf(80 + r() * 340, 300 + r() * 140, 11, r() * 360, cols[i % 3]);
  return `<path d="M250 440 C246 380 252 330 248 280 M248 320 C230 300 214 290 200 270 M250 300 C270 284 286 270 300 256" stroke="#6e5240" stroke-width="12" fill="none" stroke-linecap="round"/>${canopy}<path d="M60 440 C180 432 320 432 440 440" stroke="${P.dark ? "#ffffff33" : "#00000022"}" stroke-width="3"/>${falling}`;
};

export const feather: Motif = (P, o) => {
  const c = o.c1 || (P.dark ? "#f2ede4" : "#ffffff");
  let barbs = "";
  for (let i = 0; i < 26; i++) {
    const t = i / 25, x = 180 + t * 140, y = 400 - t * 300 + Math.sin(t * 3) * 10;
    const len = 50 * Math.sin(t * Math.PI) + 8;
    barbs += `<path d="M${n(x)} ${n(y)} q${n(-len * 0.8)} ${n(-len * 0.1)} ${n(-len)} ${n(-len * 0.6)}" stroke="${c}" stroke-width="3" fill="none"/><path d="M${n(x)} ${n(y)} q${n(len * 0.8)} ${n(len * 0.2)} ${n(len)} ${n(-len * 0.3)}" stroke="${c}" stroke-width="3" fill="none"/>`;
  }
  return `<circle cx="250" cy="250" r="160" fill="${P.accent}" opacity=".12" filter="url(#bgB)"/>${barbs}<path d="M170 430 C210 340 260 220 330 92" stroke="${o.c2 || P.accent}" stroke-width="3" fill="none" stroke-linecap="round"/>
<g transform="translate(380 330) rotate(30) scale(.25)">${barbs}</g>${sparkle(120, 160, 6, P.accent, 0.8)}`;
};

export const doveFly: Motif = (P, o) => {
  return `<circle cx="250" cy="220" r="150" fill="#ffffff" opacity="${P.dark ? 0.08 : 0.5}" filter="url(#bgB)"/>
<g transform="translate(250 230) scale(1.6)"><path d="M-70 10 C-40 -20 0 -10 30 -5 C45 -3 55 -12 62 -10 C70 -8 72 0 66 4 C58 10 50 14 40 22 C20 40 -20 42 -50 30 C-62 26 -74 20 -96 26 C-84 16 -76 14 -70 10Z" fill="#fffdf9" stroke="#d9d2c6" stroke-width="1"/>
<path d="M-20 0 C-46 -50 -20 -96 30 -108 C12 -80 24 -50 8 -8Z" fill="#fffdf9" stroke="#d9d2c6" stroke-width="1"/><path d="M-30 14 C-70 40 -90 70 -60 92 C-56 66 -36 44 -14 26Z" fill="#f4f1ea" stroke="#d9d2c6" stroke-width="1"/>
<circle cx="58" cy="-6" r="2.4" fill="#3a3330"/><path d="M68 -4 L78 -1 L68 2Z" fill="#e8b07a"/>
<path d="M76 0 C90 6 100 14 108 26" stroke="#6f8a5a" stroke-width="1.6" fill="none"/>${leaf(86, 6, 10, 40, "#8fa07a")}${leaf(94, 14, 10, 70, "#8fa07a")}${leaf(100, 22, 10, 30, "#8fa07a")}</g>`;
};

export const candleTrio: Motif = (P, o) => {
  const cand = (x: number, h: number) => `<circle cx="${x}" cy="${420 - h - 24}" r="44" fill="#ffcf7a" opacity=".3" filter="url(#bgB)"/><rect x="${x - 22}" y="${420 - h}" width="44" height="${h}" rx="4" fill="${o.c1 || "#fbf3e6"}"/><ellipse cx="${x}" cy="${420 - h}" rx="22" ry="5" fill="#fffaf0"/><path d="M${x} ${420 - h - 44} C${x + 10} ${420 - h - 28} ${x + 10} ${420 - h - 14} ${x} ${420 - h - 8} C${x - 10} ${420 - h - 14} ${x - 10} ${420 - h - 28} ${x} ${420 - h - 44}Z" fill="#ffd36b"/><path d="M${x} ${420 - h - 30} C${x + 4} ${420 - h - 20} ${x + 4} ${420 - h - 14} ${x} ${420 - h - 10} C${x - 4} ${420 - h - 14} ${x - 4} ${420 - h - 20} ${x} ${420 - h - 30}Z" fill="#fff" opacity=".85"/>`;
  return `${cand(170, 120)}${cand(250, 180)}${cand(330, 90)}<ellipse cx="250" cy="424" rx="150" ry="10" fill="#000" opacity=".2"/>${leaf(110, 424, 40, -10, "#6f8a6a")}${leaf(390, 424, 40, 190, "#6f8a6a")}`;
};

export const floatLanterns: Motif = (P, o) => {
  const l = (x: number, y: number, s: number) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="#ffb760" opacity=".35" filter="url(#bgB)"/><path d="M-16 -22 L16 -22 L20 18 L-20 18Z" fill="#ffc57a"/><path d="M-16 -22 L16 -22 L20 18 L-20 18Z" fill="#fff4cf" opacity=".4"/><path d="M-20 18 L20 18 L16 22 L-16 22Z" fill="#a0622e"/></g>`;
  return l(250, 200, 1.8) + l(150, 300, 1.1) + l(350, 280, 1.2) + l(190, 120, 0.8) + l(330, 120, 0.7) + l(410, 190, 0.6) + l(90, 190, 0.6) + l(260, 360, 0.7);
};

export const mountains: Motif = (P, o) => {
  return `<circle cx="250" cy="250" r="54" fill="${o.c1 || "#fff0cc"}"/><circle cx="250" cy="250" r="120" fill="#fff0cc" opacity=".35" filter="url(#bgB)"/>
<path d="M0 330 L80 240 L140 280 L210 200 L260 250 L320 190 L390 270 L450 230 L500 270 L500 480 L0 480Z" fill="${o.c2 || "#a99ac0"}"/>
<path d="M210 200 L196 222 L210 216 L222 230 L232 214Z M320 190 L306 212 L318 206 L330 220 L338 206Z" fill="#fff" opacity=".8"/>
<path d="M0 380 L90 310 L170 350 L260 300 L350 350 L430 310 L500 340 L500 480 L0 480Z" fill="${o.c3 || "#857aa3"}"/>
<path d="M0 420 C120 390 240 410 330 400 C410 392 460 404 500 400 L500 480 L0 480Z" fill="${P.dark ? "#2a3550" : "#c9b6a6"}"/>${bird(150, 170, 0.9, P.dark ? "#ddd" : "#6a5a7a")}${bird(176, 156, 0.7, P.dark ? "#ddd" : "#6a5a7a")}`;
};

export const confettiBurst: Motif = (P, o) => `<circle cx="250" cy="230" r="140" fill="${P.accent}" opacity=".2" filter="url(#bgB)"/>${confetti(o.seed ?? 61, 140, P.c, 60, 420, 1.2)}${star5(250, 230, 40, pick(P, o, 0))}`;
