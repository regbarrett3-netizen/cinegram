// Centerpiece motifs, part 2: occasion-specific objects.
import { bird, blur, burst, cloud, confetti, flower, heart, leaf, lg, n, rg, rng, rose, sparkle, star5 } from "./artKit";
import { snowflake, type Pal } from "./artScenes";
import type { Motif, Opt } from "./artMotifs1";

const pick = (P: Pal, o: Opt, i: number) => [o.c1, o.c2, o.c3][i] || P.c[i % P.c.length];
const GOLD = `${lg("gold2", [[0, "#f8e3a0"], [0.5, "#d4a23a"], [1, "#f3d07a"]], 0, 0, 1, 1)}`;
const shadow = (w = 130, y = 432) => `<ellipse cx="250" cy="${y}" rx="${w}" ry="11" fill="#000" opacity=".14"/>`;

/* celebrations */

export const trophy: Motif = (P, o) => `<defs>${GOLD}</defs><circle cx="250" cy="220" r="150" fill="#ffe7a0" opacity=".3" filter="url(#bgB)"/>${shadow(100)}
<path d="M170 120 L330 120 C330 230 290 270 250 276 C210 270 170 230 170 120Z" fill="url(#gold2)"/>
<path d="M172 140 C120 140 120 210 186 222 M328 140 C380 140 380 210 314 222" stroke="url(#gold2)" stroke-width="12" fill="none"/>
<rect x="236" y="274" width="28" height="60" fill="url(#gold2)"/><path d="M200 334 L300 334 L312 374 L188 374Z" fill="url(#gold2)"/><rect x="176" y="374" width="148" height="52" rx="6" fill="${o.c1 || "#5a3a2a"}"/>
<rect x="210" y="390" width="80" height="20" rx="3" fill="url(#gold2)" opacity=".8"/>${star5(250, 186, 34, "#fff6d8", 'opacity=".9"')}
<path d="M196 140 C196 200 216 236 236 250" stroke="#fff" stroke-width="5" opacity=".35" fill="none" stroke-linecap="round"/>${confetti(o.seed ?? 71, 40, P.c, 40, 300, 0.9)}`;

export const medal: Motif = (P, o) => `<defs>${GOLD}</defs><path d="M200 60 L250 230 L300 60 L270 60 L250 150 L230 60Z" fill="${pick(P, o, 0)}"/><path d="M160 60 L230 250 L270 250 L200 60Z" fill="${pick(P, o, 1)}"/><path d="M340 60 L270 250 L230 250 L300 60Z" fill="${pick(P, o, 0)}"/>
<circle cx="250" cy="300" r="100" fill="url(#gold2)"/><circle cx="250" cy="300" r="78" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>${star5(250, 300, 46, "#fff3c4", 'opacity=".9"')}
<path d="M178 260 A80 80 0 0 1 240 222" stroke="#fff" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>${sparkle(380, 220, 10, P.accent)}${sparkle(120, 330, 8, P.accent)}`;

export const rocket: Motif = (P, o) => {
  const r = rng(o.seed ?? 72);
  let smoke = "";
  for (let i = 0; i < 9; i++) smoke += `<circle cx="${n(250 + (r() - 0.5) * 120)}" cy="${n(420 + r() * 30)}" r="${n(20 + r() * 26)}" fill="#fff" opacity=".9"/>`;
  return `<path d="M250 360 C270 390 262 420 250 440 C238 420 230 390 250 360Z" fill="#ffb347"/><path d="M250 370 C260 390 256 408 250 420 C244 408 240 390 250 370Z" fill="#fff3b0"/>${smoke}
<path d="M250 80 C300 130 310 230 290 340 L210 340 C190 230 200 130 250 80Z" fill="${o.c1 || "#f4f1ea"}"/><path d="M250 80 C276 106 290 140 296 180 L204 180 C210 140 224 106 250 80Z" fill="${pick(P, o, 0)}"/>
<path d="M210 280 L170 350 L212 336Z M290 280 L330 350 L288 336Z" fill="${pick(P, o, 0)}"/><rect x="226" y="336" width="48" height="16" rx="3" fill="#8a8f9a"/>
<circle cx="250" cy="230" r="26" fill="#8fb6d8" stroke="#d8dde6" stroke-width="7"/><circle cx="242" cy="222" r="7" fill="#fff" opacity=".6"/>
<path d="M226 150 C220 200 222 260 228 320" stroke="#fff" stroke-width="5" opacity=".4" fill="none" stroke-linecap="round"/>${star5(110, 120, 12, P.accent)}${star5(390, 160, 10, P.accent)}${star5(380, 300, 8, P.accent)}${sparkle(130, 260, 7, "#fff")}`;
};

export const champagne: Motif = (P, o) => {
  const r = rng(o.seed ?? 73);
  let spray = "";
  for (let i = 0; i < 46; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 1.6, d = 40 + r() * 150; spray += `<circle cx="${n(300 + Math.cos(a) * d)}" cy="${n(150 + Math.sin(a) * d * 0.8)}" r="${n(1.5 + r() * 3)}" fill="#fff3c0" opacity=".9"/>`; }
  return `<g transform="rotate(24 250 330)"><path d="M228 160 L272 160 L272 210 C300 230 306 250 306 290 L306 430 C306 440 194 440 194 430 L194 290 C194 250 200 230 228 210Z" fill="${o.c1 || "#2f5a3e"}"/><path d="M226 150 L274 150 L274 214 L226 214Z" fill="#e6c26a"/><rect x="200" y="300" width="100" height="70" rx="6" fill="#f6ecd6"/><rect x="214" y="318" width="72" height="8" rx="3" fill="#c9a24a"/><rect x="222" y="336" width="56" height="6" rx="3" fill="#d8c08a"/><path d="M206 260 C204 300 206 360 210 420" stroke="#fff" stroke-width="6" opacity=".25" fill="none" stroke-linecap="round"/></g>
<g transform="translate(330 96) rotate(30)"><rect x="-14" y="-18" width="28" height="30" rx="6" fill="#d6b17a"/></g>${spray}${confetti(o.seed ?? 74, 30, P.c, 40, 260, 0.9)}`;
};

export const popper: Motif = (P, o) => {
  let streams = "";
  P.c.forEach((c, i) => (streams += `<path d="M230 300 C${200 - i * 30} ${220 - i * 20} ${180 + i * 40} ${140 - i * 10} ${130 + i * 70} ${80 + (i % 2) * 40}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`));
  return `${streams}${confetti(o.seed ?? 75, 80, P.c, 40, 300, 1.1)}<g transform="rotate(30 260 360)"><path d="M220 300 L300 300 L270 440 L250 440Z" fill="${pick(P, o, 0)}"/><path d="M228 330 L292 330 M236 370 L284 370 M244 410 L276 410" stroke="#fff" stroke-width="8" opacity=".6"/><ellipse cx="260" cy="300" rx="40" ry="10" fill="${pick(P, o, 1)}"/></g>`;
};

export const fireworks: Motif = (P, o) => `<defs>${blur("b12", 12)}</defs>${burst(250, 190, 100, P.c[0], 28, 5)}${burst(130, 280, 60, P.c[1], 20, 6)}${burst(380, 250, 70, P.c[2] || P.accent, 22, 7)}${burst(300, 90, 40, P.c[3] || "#fff", 16, 8)}`;

/* graduation & learning */

export const diploma: Motif = (P, o) => `${shadow(150)}<g transform="rotate(-12 250 330)"><rect x="110" y="300" width="280" height="64" rx="32" fill="#fbf4e4"/><ellipse cx="110" cy="332" rx="20" ry="32" fill="#eadfc6"/><ellipse cx="110" cy="332" rx="10" ry="18" fill="#d9cba8"/><path d="M130 312 L370 312" stroke="#e4d8bf" stroke-width="2"/>
<rect x="236" y="300" width="28" height="64" fill="${pick(P, o, 0)}"/><path d="M250 364 L232 424 L246 414 L252 428 L262 364Z" fill="${pick(P, o, 0)}"/><circle cx="250" cy="372" r="14" fill="#c9343f"/></g>
<g transform="translate(260 170) rotate(-8) scale(1.4)"><path d="M-24 6 L-24 22 C-12 30 12 30 24 22 L24 6Z" fill="#1f2a44"/><path d="M0 -14 L48 4 L0 22 L-48 4Z" fill="#2b3a5c"/><circle cx="0" cy="4" r="3" fill="#e8b84a"/><path d="M0 4 Q30 10 34 30" stroke="#e8b84a" stroke-width="2.2" fill="none"/><path d="M30 30 L38 30 L37 46 L31 46Z" fill="#e8b84a"/></g>${confetti(o.seed ?? 76, 30, P.c, 40, 250, 0.9)}`;

export const books: Motif = (P, o) => {
  const book = (y: number, w: number, h: number, c: string, rot: number) => `<g transform="rotate(${rot} 250 ${y})"><rect x="${250 - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="4" fill="${c}"/><rect x="${250 - w / 2 + 8}" y="${y - h + 4}" width="${w - 16}" height="${h - 8}" fill="#fbf6ea"/><rect x="${250 - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="4" fill="none" stroke="${c}" stroke-width="6"/><line x1="${250 - w / 2 + 20}" y1="${y - h / 2}" x2="${250 + w / 2 - 20}" y2="${y - h / 2}" stroke="#e8dcc4" stroke-width="2"/></g>`;
  return `${shadow(140)}${book(432, 240, 40, pick(P, o, 0), 0)}${book(392, 210, 36, pick(P, o, 1), -3)}${book(356, 226, 34, P.c[2] || P.accent, 2)}
${o.alt ? `<path d="M250 322 C230 300 200 300 196 270 C226 266 248 286 250 322Z" fill="#8fbf74"/><path d="M250 322 C270 296 300 292 306 262 C276 260 252 282 250 322Z" fill="#7aae62"/><path d="M250 322 L250 260" stroke="#5b8a45" stroke-width="3"/>` : `<circle cx="250" cy="290" r="34" fill="#d9393f"/><circle cx="238" cy="280" r="9" fill="#fff" opacity=".35"/><path d="M250 258 C252 246 258 238 266 234" stroke="#6a4a2a" stroke-width="4" fill="none"/>${leaf(254, 250, 26, -30, "#7aae62", "#4e7a47")}`}
${sparkle(130, 200, 9, P.accent)}${sparkle(370, 180, 8, P.accent)}${sparkle(380, 300, 6, P.accent)}`;
};

export const bulb: Motif = (P, o) => {
  let rays = "";
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; rays += `<line x1="${n(250 + Math.cos(a) * 120)}" y1="${n(200 + Math.sin(a) * 120)}" x2="${n(250 + Math.cos(a) * 156)}" y2="${n(200 + Math.sin(a) * 156)}" stroke="${o.c1 || "#f6c95a"}" stroke-width="6" stroke-linecap="round"/>`; }
  return `<circle cx="250" cy="200" r="150" fill="#fff1b8" opacity=".5" filter="url(#bgB)"/>${rays}
<path d="M250 90 C310 90 350 136 350 190 C350 236 318 260 304 290 L196 290 C182 260 150 236 150 190 C150 136 190 90 250 90Z" fill="#fff6c8"/><path d="M250 90 C310 90 350 136 350 190 C350 236 318 260 304 290 L196 290 C182 260 150 236 150 190 C150 136 190 90 250 90Z" fill="none" stroke="#f0d27a" stroke-width="4"/>
<path d="M220 290 L226 220 L242 236 L250 214 L258 236 L274 220 L280 290" stroke="#d9a63a" stroke-width="3" fill="none"/>
<rect x="200" y="290" width="100" height="22" rx="4" fill="#a6abb5"/><rect x="206" y="312" width="88" height="18" rx="4" fill="#8f949e"/><rect x="214" y="330" width="72" height="16" rx="4" fill="#a6abb5"/><path d="M226 346 L274 346 L262 364 L238 364Z" fill="#6f747e"/>
<path d="M190 160 C196 136 214 120 236 114" stroke="#fff" stroke-width="7" fill="none" opacity=".7" stroke-linecap="round"/>`;
};

export const compass: Motif = (P, o) => {
  let ticks = "";
  for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2, r1 = i % 8 === 0 ? 112 : 120; ticks += `<line x1="${n(250 + Math.cos(a) * r1)}" y1="${n(240 + Math.sin(a) * r1)}" x2="${n(250 + Math.cos(a) * 130)}" y2="${n(240 + Math.sin(a) * 130)}" stroke="${P.dark ? "#e8dcc4" : "#6a5a4a"}" stroke-width="2"/>`; }
  const pt = (a: number, l: number, c: string) => { const r = (a * Math.PI) / 180; return `<path d="M250 240 L${n(250 + Math.cos(r - 0.18) * 30)} ${n(240 + Math.sin(r - 0.18) * 30)} L${n(250 + Math.cos(r) * l)} ${n(240 + Math.sin(r) * l)} L${n(250 + Math.cos(r + 0.18) * 30)} ${n(240 + Math.sin(r + 0.18) * 30)}Z" fill="${c}"/>`; };
  return `<circle cx="250" cy="240" r="150" fill="${o.c1 || "#f6ecd6"}"/><circle cx="250" cy="240" r="150" fill="none" stroke="#c9a24a" stroke-width="10"/>${ticks}
${[45, 135, 225, 315].map((a) => pt(a, 70, "#b9a98a")).join("")}${pt(-90, 112, pick(P, o, 0))}${pt(90, 112, P.dark ? "#d8d0c0" : "#5a4a3a")}${pt(0, 100, "#8a7a6a")}${pt(180, 100, "#8a7a6a")}<circle cx="250" cy="240" r="10" fill="#c9a24a"/>`;
};

/* wedding & anniversary */

export const weddingCake: Motif = (P, o) => {
  const tier = (y: number, w: number, h: number) => `<rect x="${250 - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="6" fill="#fffdf8"/><rect x="${250 - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="6" fill="#000" opacity=".04"/><path d="M${250 - w / 2} ${y - h + 10} ${Array.from({ length: 8 }, (_, i) => `Q${n(250 - w / 2 + (i + 0.5) * (w / 8))} ${y - h + 24} ${n(250 - w / 2 + (i + 1) * (w / 8))} ${y - h + 10}`).join(" ")}" stroke="#e9dfcf" stroke-width="3" fill="none"/>`;
  const r = rng(o.seed ?? 81);
  let fl = "";
  for (let i = 0; i < 9; i++) fl += rose(170 + i * 20 + r() * 6, i % 2 ? 342 : 346, 9, pick(P, o, 0), P.accent, r() * 360);
  return `${shadow(150)}<ellipse cx="250" cy="426" rx="150" ry="12" fill="#e9e1d2"/>${tier(422, 220, 80)}${tier(342, 170, 70)}${tier(272, 120, 60)}
${fl}${rose(224, 264, 11, pick(P, o, 1), P.accent, 30)}${rose(250, 258, 13, pick(P, o, 0), P.accent, 90)}${rose(276, 264, 11, pick(P, o, 1), P.accent, 200)}${leaf(206, 268, 18, 200, "#9fb59a")}${leaf(294, 268, 18, -20, "#9fb59a")}
${heart(250, 190, 24, P.accent)}${sparkle(130, 200, 8, P.accent)}${sparkle(370, 180, 8, P.accent)}`;
};

export const bells: Motif = (P, o) => {
  const bell = (x: number, rot: number) => `<g transform="rotate(${rot} ${x} 170)"><path d="M${x} 170 C${x - 34} 170 ${x - 40} 210 ${x - 44} 270 C${x - 46} 290 ${x - 62} 300 ${x - 62} 310 L${x + 62} 310 C${x + 62} 300 ${x + 46} 290 ${x + 44} 270 C${x + 40} 210 ${x + 34} 170 ${x} 170Z" fill="url(#gold2)"/><circle cx="${x}" cy="320" r="12" fill="#c9952e"/><path d="M${x - 24} 200 C${x - 30} 230 ${x - 32} 260 ${x - 36} 290" stroke="#fff" stroke-width="5" opacity=".4" fill="none" stroke-linecap="round"/></g>`;
  return `<defs>${GOLD}</defs>${bell(200, 14)}${bell(300, -14)}
<path d="M250 160 C210 120 170 130 180 156 C190 176 236 166 250 160 C264 166 310 176 320 156 C330 130 290 120 250 160Z" fill="${pick(P, o, 0)}"/><path d="M246 164 C236 200 222 220 210 236 M254 164 C264 200 278 220 290 236" stroke="${pick(P, o, 0)}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="250" cy="160" r="10" fill="${pick(P, o, 0)}"/>
${leaf(220, 160, 30, 200, "#9fb59a", "#5f7d55")}${leaf(280, 160, 30, -20, "#9fb59a", "#5f7d55")}${sparkle(130, 260, 9, P.accent)}${sparkle(380, 250, 9, P.accent)}${sparkle(250, 380, 7, P.accent)}`;
};

export const swans: Motif = (P, o) => {
  const swan = (flip: number) => `<g transform="translate(${flip > 0 ? 196 : 304} 300) scale(${flip} 1)"><path d="M-90 30 C-90 0 -40 -10 0 0 C30 6 40 20 30 40 C10 60 -70 60 -90 30Z" fill="#fffdf8" stroke="#ddd5c8"/><path d="M-60 6 C-40 -30 0 -20 10 6" fill="#f3efe6" stroke="#ddd5c8"/>
<path d="M24 10 C60 -10 70 -80 50 -120 C38 -144 10 -140 6 -118 C4 -104 18 -100 24 -108" fill="none" stroke="#fffdf8" stroke-width="14" stroke-linecap="round"/><path d="M24 10 C60 -10 70 -80 50 -120 C38 -144 10 -140 6 -118" fill="none" stroke="#ddd5c8" stroke-width="1"/>
<path d="M6 -118 L-8 -110 L6 -108Z" fill="#e8933a"/><circle cx="16" cy="-122" r="2.4" fill="#2b2522"/></g>`;
  const r = rng(o.seed ?? 82);
  let w = "";
  for (let i = 0; i < 12; i++) w += `<path d="M${n(60 + r() * 380)} ${n(350 + r() * 70)} q16 -5 32 0" stroke="${P.dark ? "#ffffff" : P.accent}" stroke-width="1.4" fill="none" opacity=".5"/>`;
  return `${heart(250, 150, 30, pick(P, o, 0), 'opacity=".8"')}${w}${swan(1)}${swan(-1)}<ellipse cx="250" cy="352" rx="160" ry="8" fill="${P.accent}" opacity=".25"/>`;
};

export const ringBox: Motif = (P, o) => `${shadow(120)}<defs>${GOLD}</defs><circle cx="250" cy="230" r="120" fill="#ffffff" opacity="${P.dark ? 0.08 : 0.5}" filter="url(#bgB)"/>
<path d="M160 260 L340 260 L340 420 L160 420Z" fill="${pick(P, o, 0)}"/><path d="M160 260 L340 260 L330 180 L170 180Z" fill="${pick(P, o, 0)}"/><path d="M174 196 L326 196 L334 252 L166 252Z" fill="#f6efe6"/>
<rect x="176" y="268" width="148" height="70" rx="10" fill="#f3ebe0"/><path d="M220 300 C220 270 280 270 280 300" stroke="#e7e0d6" stroke-width="10" fill="none"/>
<circle cx="250" cy="262" r="30" fill="none" stroke="url(#gold2)" stroke-width="8"/><path d="M236 236 L250 214 L264 236 L250 246Z" fill="#e7f3ff" stroke="#b6d4ee" stroke-width="1.5"/>
${sparkle(276, 210, 12, "#fff")}${sparkle(200, 200, 6, P.accent)}${sparkle(320, 150, 8, P.accent)}`;

export const hourglass: Motif = (P, o) => `<defs>${GOLD}</defs>${shadow(100)}
<rect x="170" y="100" width="160" height="18" rx="6" fill="${o.c1 || "#8a5a3a"}"/><rect x="170" y="410" width="160" height="18" rx="6" fill="${o.c1 || "#8a5a3a"}"/><rect x="176" y="118" width="10" height="292" fill="url(#gold2)"/><rect x="314" y="118" width="10" height="292" fill="url(#gold2)"/>
<path d="M196 118 L304 118 C304 200 262 230 262 264 C262 298 304 328 304 410 L196 410 C196 328 238 298 238 264 C238 230 196 200 196 118Z" fill="#ffffff" fill-opacity=".35" stroke="#e7e0d6" stroke-width="2"/>
<path d="M210 170 L290 170 C284 210 256 230 252 250 L248 250 C244 230 216 210 210 170Z" fill="${pick(P, o, 0)}"/><path d="M250 250 L250 380" stroke="${pick(P, o, 0)}" stroke-width="2"/><path d="M206 410 C214 370 236 352 250 350 C264 352 286 370 294 410Z" fill="${pick(P, o, 0)}"/>
${heart(250, 330, 14, P.accent)}${sparkle(140, 200, 8, P.accent)}${sparkle(360, 300, 7, P.accent)}`;

export const infinity: Motif = (P, o) => `<defs>${lg("inf", [[0, pick(P, o, 0)], [1, pick(P, o, 1)]], 0, 0, 1, 0)}</defs>
<path d="M250 240 C210 170 120 170 120 240 C120 310 210 310 250 240 C290 170 380 170 380 240 C380 310 290 310 250 240Z" fill="none" stroke="url(#inf)" stroke-width="22" stroke-linecap="round"/>
<path d="M250 240 C210 170 120 170 120 240" fill="none" stroke="#fff" stroke-width="4" opacity=".35"/>${heart(250, 240, 20, P.accent)}
${sparkle(250, 150, 10, P.accent)}${sparkle(130, 330, 7, P.accent)}${sparkle(370, 330, 7, P.accent)}`;

export const bench: Motif = (P, o) => {
  const r = rng(o.seed ?? 83);
  let leaves = "";
  for (let i = 0; i < 200; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 90; leaves += `<circle cx="${n(140 + Math.cos(a) * d * 1.2)}" cy="${n(150 + Math.sin(a) * d * 0.8)}" r="${n(5 + r() * 7)}" fill="${[o.c1 || "#e3a24a", o.c2 || "#d9693e", o.c3 || "#f2c45a"][i % 3]}"/>`; }
  let fall = "";
  for (let i = 0; i < 10; i++) fall += leaf(200 + r() * 260, 230 + r() * 180, 10, r() * 360, [o.c1 || "#e3a24a", o.c2 || "#d9693e"][i % 2]);
  const ink = "#5a4434";
  return `<path d="M140 430 C136 330 144 260 140 200 M140 260 C120 230 100 210 86 190" stroke="${ink}" stroke-width="12" fill="none" stroke-linecap="round"/>${leaves}
<rect x="220" y="330" width="200" height="12" rx="3" fill="${ink}"/><rect x="220" y="350" width="200" height="12" rx="3" fill="${ink}"/><rect x="214" y="380" width="212" height="14" rx="3" fill="${ink}"/><path d="M232 394 L228 432 M408 394 L412 432 M236 330 L236 394 M404 330 L404 394" stroke="${ink}" stroke-width="7"/>${fall}${heart(320, 290, 18, P.accent)}`;
};

/* baby */

export const teddy: Motif = (P, o) => {
  const c = o.c1 || "#c98f62", d = o.c2 || "#e7bf96";
  return `${shadow(120)}<circle cx="250" cy="330" r="86" fill="${c}"/><ellipse cx="250" cy="346" rx="54" ry="60" fill="${d}"/>
<circle cx="174" cy="400" r="30" fill="${c}"/><circle cx="326" cy="400" r="30" fill="${c}"/><circle cx="174" cy="404" r="16" fill="${d}"/><circle cx="326" cy="404" r="16" fill="${d}"/>
<circle cx="176" cy="300" r="26" fill="${c}"/><circle cx="324" cy="300" r="26" fill="${c}"/>
<circle cx="250" cy="200" r="70" fill="${c}"/><circle cx="196" cy="146" r="26" fill="${c}"/><circle cx="304" cy="146" r="26" fill="${c}"/><circle cx="196" cy="146" r="13" fill="${d}"/><circle cx="304" cy="146" r="13" fill="${d}"/>
<ellipse cx="250" cy="222" rx="30" ry="22" fill="${d}"/><ellipse cx="250" cy="212" rx="10" ry="7" fill="#3a2a22"/><path d="M250 220 L250 230 M240 234 Q250 242 260 234" stroke="#3a2a22" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="226" cy="190" r="6" fill="#3a2a22"/><circle cx="274" cy="190" r="6" fill="#3a2a22"/><circle cx="214" cy="214" r="8" fill="#f29c9c" opacity=".45"/><circle cx="286" cy="214" r="8" fill="#f29c9c" opacity=".45"/>
<path d="M214 270 C232 284 268 284 286 270 L280 290 C264 300 236 300 220 290Z" fill="${pick(P, o, 2)}"/>${heart(250, 330, 22, pick(P, o, 0))}${star5(120, 150, 12, P.accent)}${star5(380, 170, 14, P.accent)}`;
};

export const clothesline: Motif = (P, o) => {
  const onesie = (x: number, c: string) => `<path d="M${x - 40} 190 L${x - 18} 180 C${x - 10} 192 ${x + 10} 192 ${x + 18} 180 L${x + 40} 190 L${x + 50} 214 L${x + 30} 222 L${x + 30} 270 C${x + 30} 290 ${x + 16} 300 ${x + 8} 300 L${x - 8} 300 C${x - 16} 300 ${x - 30} 290 ${x - 30} 270 L${x - 30} 222 L${x - 50} 214Z" fill="${c}"/>${heart(x, 236, 12, "#fff", 'opacity=".7"')}`;
  const sock = (x: number, c: string) => `<path d="M${x - 10} 190 L${x + 10} 190 L${x + 10} 236 C${x + 10} 250 ${x + 30} 250 ${x + 30} 262 C${x + 30} 274 ${x} 274 ${x - 10} 262Z" fill="${c}"/>`;
  const hat = (x: number, c: string) => `<path d="M${x - 34} 230 C${x - 34} 190 ${x + 34} 190 ${x + 34} 230Z" fill="${c}"/><rect x="${x - 36}" y="226" width="72" height="12" rx="5" fill="#fff" opacity=".7"/><circle cx="${x}" cy="188" r="9" fill="${c}"/>`;
  const pin = (x: number) => `<rect x="${x - 3}" y="176" width="6" height="18" rx="2" fill="#c7a17a"/>`;
  return `<path d="M-10 178 Q250 200 510 178" stroke="${P.dark ? "#ddd" : "#8a7a6a"}" stroke-width="1.6" fill="none"/>
${onesie(120, pick(P, o, 0))}${sock(214, pick(P, o, 1))}${sock(244, pick(P, o, 1))}${hat(318, P.c[2] || P.accent)}${onesie(410, P.c[3] || pick(P, o, 1))}${pin(100)}${pin(140)}${pin(214)}${pin(244)}${pin(318)}${pin(390)}${pin(430)}
${star5(250, 360, 16, P.accent)}${star5(150, 380, 10, P.accent)}${star5(350, 380, 12, P.accent)}`;
};

export const rattle: Motif = (P, o) => `<g transform="rotate(-30 250 260)"><rect x="240" y="270" width="20" height="150" rx="10" fill="${pick(P, o, 1)}"/><circle cx="250" cy="430" r="22" fill="${pick(P, o, 0)}"/>
<circle cx="250" cy="200" r="82" fill="${pick(P, o, 0)}"/><circle cx="250" cy="200" r="82" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="20 18" opacity=".6"/>${star5(250, 200, 34, "#fff", 'opacity=".85"')}<circle cx="220" cy="170" r="14" fill="#fff" opacity=".35"/></g>
${sparkle(370, 140, 10, P.accent)}${sparkle(130, 330, 8, P.accent)}${sparkle(380, 380, 6, P.accent)}`;

export const footprints: Motif = (P, o) => {
  const foot = (x: number, y: number, flip: number, c: string) => `<g transform="translate(${x} ${y}) scale(${flip} 1) rotate(${flip * 8})"><path d="M0 -40 C26 -40 34 -10 30 20 C26 50 14 64 0 64 C-18 64 -26 44 -24 20 C-22 -6 -22 -40 0 -40Z" fill="${c}"/>${[[-14, -58, 9], [2, -64, 8], [16, -60, 7], [27, -50, 6], [34, -38, 5]].map(([tx, ty, r]) => `<circle cx="${tx}" cy="${ty}" r="${r}" fill="${c}"/>`).join("")}</g>`;
  return `${heart(250, 160, 40, P.accent, 'opacity=".9"')}${foot(208, 300, -1, pick(P, o, 0))}${foot(292, 300, 1, pick(P, o, 0))}${star5(120, 140, 12, pick(P, o, 1))}${star5(380, 130, 14, pick(P, o, 1))}${sparkle(130, 380, 7, P.accent)}${sparkle(370, 380, 7, P.accent)}`;
};

export const duck: Motif = (P, o) => {
  const r = rng(o.seed ?? 91);
  let bub = "";
  for (let i = 0; i < 18; i++) bub += `<circle cx="${n(90 + r() * 320)}" cy="${n(90 + r() * 230)}" r="${n(6 + r() * 16)}" fill="#ffffff" fill-opacity=".35" stroke="#ffffff" stroke-width="1.5"/>`;
  return `${bub}<path d="M0 380 C120 368 380 388 500 374 L500 480 L0 480Z" fill="${P.accent}" opacity=".3"/>
<path d="M140 330 C140 270 200 260 250 280 C300 290 350 270 370 250 C380 300 360 370 260 380 C190 384 140 370 140 330Z" fill="${o.c1 || "#f6cf3e"}"/><path d="M200 300 C240 330 300 320 330 300" stroke="#e6b42a" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="200" cy="230" r="58" fill="${o.c1 || "#f6cf3e"}"/><path d="M140 230 C110 228 104 246 120 254 C134 260 148 252 152 244Z" fill="#f08a3a"/><circle cx="190" cy="214" r="8" fill="#2b2522"/><circle cx="187" cy="211" r="2.5" fill="#fff"/><circle cx="210" cy="240" r="10" fill="#f29c7a" opacity=".45"/>
<path d="M110 384 Q250 396 390 384" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`;
};

export const blocks: Motif = (P, o) => {
  const block = (x: number, y: number, s: number, c: string, sym: string, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="8" fill="${c}"/><rect x="${-s / 2 + 10}" y="${-s / 2 + 10}" width="${s - 20}" height="${s - 20}" rx="5" fill="#fff" opacity=".85"/>${sym === "heart" ? heart(0, 4, s * 0.32, c) : sym === "star" ? star5(0, 2, s * 0.26, c) : `<path d="M${n(s * 0.06)} ${n(-s * 0.24)} A${n(s * 0.24)} ${n(s * 0.24)} 0 1 0 ${n(s * 0.2)} ${n(s * 0.16)} A${n(s * 0.19)} ${n(s * 0.19)} 0 1 1 ${n(s * 0.06)} ${n(-s * 0.24)}Z" fill="${c}"/>`}</g>`;
  return `${shadow(150)}${block(180, 370, 110, pick(P, o, 0), "heart")}${block(310, 372, 110, pick(P, o, 1), "star", 4)}${block(246, 262, 104, P.c[2] || P.accent, "moon", -6)}${sparkle(130, 200, 9, P.accent)}${sparkle(380, 190, 8, P.accent)}`;
};

/* get well & comfort */

export const soup: Motif = (P, o) => `${shadow(150, 430)}<path d="M250 230 C230 200 270 180 250 150 M200 230 C186 206 214 190 202 166 M300 230 C314 206 286 190 298 166" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
<ellipse cx="250" cy="418" rx="150" ry="18" fill="#e8dfd0"/><path d="M110 270 L390 270 C386 360 330 414 250 414 C170 414 114 360 110 270Z" fill="${o.c1 || "#f4f1ea"}"/><path d="M110 270 L390 270" stroke="${pick(P, o, 0)}" stroke-width="10"/>
<ellipse cx="250" cy="270" rx="140" ry="22" fill="#e9c27a"/><circle cx="210" cy="268" r="9" fill="#f29a4a"/><circle cx="280" cy="272" r="8" fill="#f29a4a"/><path d="M230 262 l14 6 M300 264 l12 4" stroke="#7fae62" stroke-width="5" stroke-linecap="round"/>
<path d="M330 250 L420 160" stroke="#b9bec8" stroke-width="10" stroke-linecap="round"/>${heart(250, 340, 22, pick(P, o, 0))}`;

export const bandageHeart: Motif = (P, o) => `<g transform="translate(250 240) scale(2.4)"><path d="M0 25 C-35 0 -46 -30 -22 -38 C-10 -42 0 -33 0 -24 C0 -33 10 -42 22 -38 C46 -30 35 0 0 25Z" fill="${pick(P, o, 0)}"/></g>
<g transform="rotate(-35 250 220)"><rect x="160" y="196" width="180" height="50" rx="25" fill="#f2d6b8"/><rect x="220" y="196" width="60" height="50" fill="#e8c6a2"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${232 + (i % 3) * 18}" cy="${210 + Math.floor(i / 3) * 22}" r="2.4" fill="#d1a882"/>`).join("")}</g>
${sparkle(130, 140, 9, P.accent)}${sparkle(380, 130, 8, P.accent)}${sparkle(370, 360, 7, P.accent)}`;

export const bookTea: Motif = (P, o) => `${shadow(170)}<path d="M100 400 C160 380 220 384 250 404 C280 384 340 380 400 400 L400 330 C340 310 280 314 250 334 C220 314 160 310 100 330Z" fill="#fbf6ea" stroke="#e5d9c4" stroke-width="2"/><path d="M250 334 L250 404" stroke="#e5d9c4" stroke-width="2"/>
${[0, 1, 2].map((i) => `<path d="M${120} ${348 + i * 14} Q180 ${336 + i * 14} 236 ${352 + i * 14} M${264} ${352 + i * 14} Q320 ${336 + i * 14} ${380} ${348 + i * 14}" stroke="#e0d3bc" stroke-width="2" fill="none"/>`).join("")}
<path d="M200 300 L300 300 C298 330 280 344 250 344 C220 344 202 330 200 300Z" fill="${pick(P, o, 0)}" transform="translate(0 -110)"/><path d="M298 200 C326 200 326 228 296 226" stroke="${pick(P, o, 0)}" stroke-width="7" fill="none"/><ellipse cx="250" cy="190" rx="50" ry="7" fill="#9c6230"/>
<path d="M240 170 C228 150 252 138 240 118 M262 170 C274 150 250 138 262 118" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>${leaf(110, 300, 40, -40, "#a6b98f", "#6c8256")}${leaf(390, 300, 40, 220, "#a6b98f", "#6c8256")}`;

export const sunbeams: Motif = (P, o) => {
  let beams = "";
  for (let i = 0; i < 7; i++) beams += `<path d="M${200 + i * 16} 170 L${80 + i * 60} 470 L${110 + i * 60} 470 L${210 + i * 16} 170Z" fill="#fff6d8" opacity="${P.dark ? 0.12 : 0.35}"/>`;
  return `${beams}<circle cx="250" cy="160" r="60" fill="#fff4d0" opacity=".9"/>${cloud(200, 160, 2.2, P.dark ? "#d8d6e0" : "#ffffff")}${cloud(310, 150, 1.8, P.dark ? "#c8c6d4" : "#fbfbff")}${bird(330, 300, 1, P.dark ? "#ddd" : "#6a6a7a")}${bird(360, 280, 0.7, P.dark ? "#ddd" : "#6a6a7a")}`;
};

export const lotus: Motif = (P, o) => {
  const c = pick(P, o, 0);
  let petals = "";
  for (const [a, s, op] of [[-60, 1, 0.85], [60, 1, 0.85], [-30, 1.1, 1], [30, 1.1, 1], [0, 1.2, 1]] as [number, number, number][])
    petals += `<path d="M0 0 C-30 -30 -26 -86 0 -110 C26 -86 30 -30 0 0Z" transform="translate(250 330) rotate(${a}) scale(${s})" fill="${c}" opacity="${op}" stroke="#ffffff" stroke-opacity=".5"/>`;
  return `<path d="M0 360 C120 350 380 366 500 356 L500 480 L0 480Z" fill="${P.accent}" opacity=".25"/><ellipse cx="160" cy="356" rx="60" ry="14" fill="#7fa06c"/><ellipse cx="350" cy="364" rx="70" ry="15" fill="#6f9060"/>${petals}<circle cx="250" cy="300" r="120" fill="${c}" opacity=".15" filter="url(#bgB)"/>`;
};

export const cocoa: Motif = (P, o) => `${shadow(150)}<path d="M250 210 C230 186 270 166 250 140 M210 210 C196 190 222 176 210 154" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
<path d="M150 236 L350 236 L336 410 C334 424 166 424 164 410Z" fill="${pick(P, o, 0)}"/><path d="M346 270 C400 270 400 350 340 350" stroke="${pick(P, o, 0)}" stroke-width="16" fill="none"/><ellipse cx="250" cy="236" rx="100" ry="16" fill="#6b3f26"/>
<rect x="210" y="222" width="22" height="20" rx="6" fill="#fff"/><rect x="246" y="228" width="22" height="18" rx="6" fill="#fff"/><rect x="226" y="218" width="20" height="18" rx="6" fill="#fffaf0"/>
${snowflake(250, 320, 34, "#fff", 0.8, 3)}<path d="M330 236 L360 120 C364 104 384 104 386 120" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M342 190 L352 196 M348 166 L358 172 M354 142 L364 148" stroke="#c43a3f" stroke-width="7"/>`;

/* holidays */

export const snowflakeBig: Motif = (P, o) => `<circle cx="250" cy="230" r="150" fill="#ffffff" opacity="${P.dark ? 0.08 : 0.4}" filter="url(#bgB)"/>${snowflake(250, 230, 120, o.c1 || (P.dark ? "#ffffff" : P.accent), 1, 7)}${snowflake(250, 230, 50, o.c1 || (P.dark ? "#ffffff" : P.accent), 0.8, 4)}${snowflake(100, 120, 24, "#fff", 0.7, 2)}${snowflake(400, 140, 30, "#fff", 0.7, 2)}${snowflake(390, 360, 20, "#fff", 0.6, 2)}${snowflake(110, 350, 18, "#fff", 0.6, 2)}`;

export const ornaments: Motif = (P, o) => {
  const orn = (x: number, len: number, r: number, c: string, k: number) => `<line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="${P.dark ? "#d8cfc0" : "#a08d7c"}" stroke-width="1"/><rect x="${x - 8}" y="${len}" width="16" height="12" rx="2" fill="#d4a845"/>
<defs>${rg(`orn${k}`, [[0, "#ffffff", 0.4], [0.25, c], [1, c]], 0.35, 0.3, 0.8)}</defs><circle cx="${x}" cy="${len + 12 + r}" r="${r}" fill="url(#orn${k})"/><path d="M${x - r} ${len + 12 + r} Q${x} ${len + 12 + r + 14} ${x + r} ${len + 12 + r}" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`;
  return orn(120, 120, 44, pick(P, o, 0), 0) + orn(250, 70, 62, pick(P, o, 1), 1) + orn(380, 140, 40, P.c[2] || P.accent, 2) + orn(190, 260, 30, P.c[3] || P.accent, 3) + orn(320, 280, 28, pick(P, o, 0), 4) + sparkle(250, 380, 8, P.accent) + sparkle(110, 300, 6, P.accent);
};

export const snowman: Motif = (P, o) => `<circle cx="250" cy="370" r="80" fill="#ffffff"/><circle cx="250" cy="250" r="60" fill="#ffffff"/><circle cx="250" cy="160" r="44" fill="#ffffff"/><circle cx="250" cy="370" r="80" fill="#c9d6e6" opacity=".25"/>
<rect x="210" y="96" width="80" height="12" rx="3" fill="#2b2b2b"/><rect x="222" y="40" width="56" height="62" rx="4" fill="#2b2b2b"/><rect x="222" y="86" width="56" height="10" fill="#c43a3f"/>
<circle cx="234" cy="152" r="5" fill="#2b2b2b"/><circle cx="266" cy="152" r="5" fill="#2b2b2b"/><path d="M250 162 L290 170 L250 174Z" fill="#f08a3a"/>
<path d="M200 200 C230 214 270 214 300 200 L304 222 C276 236 224 236 196 222Z" fill="${pick(P, o, 0)}"/><path d="M280 218 L296 270 L276 268Z" fill="${pick(P, o, 0)}"/>
${[230, 258, 286].map((y) => `<circle cx="250" cy="${y + 10}" r="5" fill="#2b2b2b"/>`).join("")}<path d="M190 250 L120 200 M130 208 L112 196 M310 250 L380 196 M370 204 L392 194" stroke="#6a4a32" stroke-width="5" stroke-linecap="round"/>`;

export const mittens: Motif = (P, o) => {
  const m = (x: number, c: string, flip: number) => `<g transform="translate(${x} 280) scale(${flip} 1) rotate(-8)"><path d="M-40 60 L-40 -40 C-40 -80 40 -80 40 -40 L40 60Z" fill="${c}"/><path d="M-40 -10 C-70 -20 -76 20 -48 30" fill="${c}" stroke="${c}" stroke-width="12"/><rect x="-46" y="56" width="92" height="30" rx="8" fill="#fff"/>${snowflake(0, -10, 18, "#fff", 0.8, 2)}</g>`;
  return `<path d="M120 196 C160 120 340 120 380 196" stroke="${pick(P, o, 1)}" stroke-width="4" fill="none"/>${m(170, pick(P, o, 0), 1)}${m(330, pick(P, o, 0), -1)}${snowflake(250, 120, 14, P.accent, 0.8, 2)}`;
};

export const gingerHouse: Motif = (P, o) => `${shadow(150)}<path d="M150 300 L250 200 L350 300 L350 420 L150 420Z" fill="#c98a4f"/><path d="M130 310 L250 180 L370 310" stroke="#fff" stroke-width="16" fill="none" stroke-linejoin="round"/><path d="M130 310 L250 180 L370 310" stroke="${pick(P, o, 0)}" stroke-width="5" fill="none" stroke-dasharray="6 10"/>
<rect x="226" y="350" width="48" height="70" rx="22" fill="#7a4a2a"/><rect x="170" y="320" width="40" height="36" rx="4" fill="#ffd27a"/><rect x="290" y="320" width="40" height="36" rx="4" fill="#ffd27a"/><path d="M190 320 L190 356 M170 338 L210 338 M310 320 L310 356 M290 338 L330 338" stroke="#fff" stroke-width="3"/>
${[160, 190, 310, 340].map((x, i) => `<circle cx="${x}" cy="404" r="7" fill="${P.c[i % P.c.length]}"/>`).join("")}<path d="M150 300 L350 300" stroke="#fff" stroke-width="8"/><circle cx="250" cy="260" r="12" fill="${pick(P, o, 1)}"/>`;

export const holly: Motif = (P, o) => {
  const hl = (x: number, y: number, a: number) => `<path d="M0 0 C10 -10 20 -6 26 -16 C30 -6 40 -8 46 -2 C40 4 42 14 34 18 C30 10 18 14 10 8 C8 14 2 12 0 0Z" transform="translate(${x} ${y}) rotate(${a}) scale(1.6)" fill="#2f6b48"/>`;
  return `<circle cx="250" cy="240" r="140" fill="#fff" opacity="${P.dark ? 0.06 : 0.4}" filter="url(#bgB)"/>${hl(250, 240, -160)}${hl(250, 240, -20)}${hl(250, 240, 80)}${hl(250, 240, 200)}${hl(250, 240, 120)}
<g transform="translate(160 300) rotate(-20)"><ellipse rx="26" ry="36" fill="#9c6b40"/><path d="M-22 -14 L22 -14 M-26 2 L26 2 M-22 18 L22 18" stroke="#6e4628" stroke-width="3"/></g><g transform="translate(340 300) rotate(20)"><ellipse rx="24" ry="32" fill="#a9784a"/><path d="M-20 -12 L20 -12 M-24 2 L24 2 M-20 16 L20 16" stroke="#6e4628" stroke-width="3"/></g>
${[[240, 232], [256, 244], [246, 252], [262, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#c43a3f"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="#fff" opacity=".5"/>`).join("")}`;
};

export const cat: Motif = (P, o) => {
  const c = o.c1 || "#6b5a52";
  return `${shadow(110)}<ellipse cx="250" cy="370" rx="110" ry="60" fill="${c}"/><path d="M350 380 C420 380 420 300 380 300" stroke="${c}" stroke-width="18" fill="none" stroke-linecap="round"/>
<circle cx="200" cy="320" r="52" fill="${c}"/><path d="M162 292 L170 246 L196 278Z M238 292 L230 246 L204 278Z" fill="${c}"/><path d="M168 284 L172 258 L186 276Z M232 284 L228 258 L214 276Z" fill="#e9a3a8"/>
<path d="M176 316 Q184 324 192 316 M208 316 Q216 324 224 316" stroke="#2b2522" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M196 332 L204 332 L200 337Z" fill="#e9a3a8"/>
<path d="M170 336 L140 330 M170 342 L140 346 M230 336 L260 330 M230 342 L260 346" stroke="#fff" stroke-width="1.5" opacity=".7"/>${heart(330, 230, 18, pick(P, o, 0))}${heart(366, 196, 12, pick(P, o, 1))}`;
};

