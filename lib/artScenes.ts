// Palettes and background styles for card artwork. A card = background + centerpiece motif.
import { blur, cloud, confetti, flower, heart, leaf, lg, n, rg, rng, sparkle, star5, starfield } from "./artKit";

export type Pal = {
  paper: string;
  ink: string;
  accent: string;
  top: string;
  mid: string;
  dark: boolean;
  /** Decoration colours (confetti, blobs, flowers). */
  c: string[];
};

export const PAL = {
  blush: { paper: "#fbefea", ink: "#6a3a3e", accent: "#d98b8b", top: "#f5cfc6", mid: "#f9e2db", dark: false, c: ["#e7837f", "#f3bdb3", "#c94f5f", "#f6d58e"] },
  cream: { paper: "#fbf5ea", ink: "#4a3a2c", accent: "#d1a46b", top: "#f3dfc2", mid: "#f8ecd9", dark: false, c: ["#e2a35c", "#d97f86", "#8fae84", "#f2c14e"] },
  sage: { paper: "#f4f6ef", ink: "#3e4a3a", accent: "#a6b98f", top: "#d6e4cc", mid: "#e8efe1", dark: false, c: ["#8fae84", "#c9d9b4", "#f2c14e", "#e7a3a0"] },
  sky: { paper: "#f2f6fa", ink: "#2f3f5a", accent: "#8fb0d6", top: "#a9c8e6", mid: "#d6e5f2", dark: false, c: ["#8fb0d6", "#f2c66b", "#e88f7a", "#ffffff"] },
  lavender: { paper: "#f4f1f8", ink: "#4a4466", accent: "#b4a8d6", top: "#cfc6ea", mid: "#e5e0f2", dark: false, c: ["#b4a8d6", "#f2b8c6", "#f6dc9a", "#9cc3d9"] },
  peach: { paper: "#fcf2ea", ink: "#5a3a32", accent: "#e6a07c", top: "#f6c9ae", mid: "#fae1d0", dark: false, c: ["#ef8a6f", "#f2c45a", "#6fb3a8", "#e9a3b8"] },
  mint: { paper: "#f1f8f5", ink: "#2f4a42", accent: "#8fcbb6", top: "#c3e6d8", mid: "#ddf0e8", dark: false, c: ["#6fb3a8", "#f2b8a6", "#f6dc9a", "#9cc3d9"] },
  butter: { paper: "#fcf7e6", ink: "#4a3d1e", accent: "#e2b84a", top: "#f7e2a2", mid: "#faefc8", dark: false, c: ["#f0b347", "#e8796a", "#5fb2a8", "#8b7cc4"] },
  coral: { paper: "#fdf0ec", ink: "#5e2d2a", accent: "#ec8a74", top: "#f8c4b5", mid: "#fbdcd2", dark: false, c: ["#ec8a74", "#f6c565", "#5fb2a8", "#f3a6b4"] },
  pearl: { paper: "#f7f5f0", ink: "#3f4656", accent: "#c3c9d4", top: "#e3e6ec", mid: "#efefee", dark: false, c: ["#e7d8c9", "#f2c9c2", "#c9d6c4", "#ffffff"] },
  night: { paper: "#141a35", ink: "#f4e9d8", accent: "#e8c98a", top: "#0b1230", mid: "#262a55", dark: true, c: ["#f2c66b", "#f08fa6", "#7fd1c4", "#fff3d0"] },
  plum: { paper: "#24162e", ink: "#f6e4d6", accent: "#e2a9c0", top: "#1a0f24", mid: "#4a2346", dark: true, c: ["#f2a7c0", "#f6c27a", "#b9a0e6", "#fff0d6"] },
  forest: { paper: "#13281f", ink: "#f5ecd8", accent: "#e6c27a", top: "#0d1d16", mid: "#1f3d30", dark: true, c: ["#ffd27a", "#c43a3f", "#fff6dc", "#8fc29a"] },
  slate: { paper: "#1e2733", ink: "#ece6da", accent: "#b8b09e", top: "#2c3a4c", mid: "#243042", dark: true, c: ["#d8d2c4", "#9fb3c9", "#c9b98f", "#ffffff"] },
  dusk: { paper: "#1b2536", ink: "#f6e8d2", accent: "#e7b06a", top: "#26325a", mid: "#6a5276", dark: true, c: ["#ffb760", "#f2a7a0", "#fff1c4", "#9fb6e0"] },
  teal: { paper: "#10302f", ink: "#f1eadb", accent: "#e9c47a", top: "#0a2222", mid: "#1e4a48", dark: true, c: ["#e9c47a", "#f2a28a", "#9fd6c8", "#fff1d0"] },
  wine: { paper: "#2a1218", ink: "#f6e2da", accent: "#e3a0a8", top: "#1c0a10", mid: "#4c1d2a", dark: true, c: ["#e3a0a8", "#f6c27a", "#f8d6dc", "#c9474f"] },
  navy: { paper: "#172238", ink: "#f2ece0", accent: "#d9b26a", top: "#0f182b", mid: "#2b3d63", dark: true, c: ["#d9b26a", "#e6eef8", "#c43a3f", "#9fb6e0"] },
} satisfies Record<string, Pal>;
export type PalName = keyof typeof PAL;

export type BgKind = "halo" | "stars" | "confetti" | "hills" | "bokeh" | "rays" | "snow" | "pattern" | "corners" | "wash" | "sea" | "clouds";
export type BgOpt = { moon?: boolean; tile?: "heart" | "star" | "dot" | "snow" | "leaf" | "flower"; hills?: [string, string]; seed?: number; sun?: boolean };

const sky = (P: Pal) => `<defs>${lg("bgG", [[0, P.top], [0.62, P.mid], [1, P.paper]])}${rg("bgH", [[0, P.dark ? "#ffffff" : "#ffffff", P.dark ? 0.12 : 0.75], [1, "#ffffff", 0]])}${blur("bgB", 14)}</defs><rect width="500" height="480" fill="url(#bgG)"/>`;

function snowflake(x: number, y: number, r: number, color: string, op = 1, w = 1.6) {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r;
    s += `<line x1="${n(x)}" y1="${n(y)}" x2="${n(ex)}" y2="${n(ey)}"/>`;
    for (const k of [0.45, 0.7]) {
      const bx = x + Math.cos(a) * r * k, by = y + Math.sin(a) * r * k, l = r * 0.28;
      for (const d of [-0.6, 0.6]) s += `<line x1="${n(bx)}" y1="${n(by)}" x2="${n(bx + Math.cos(a + d) * l)}" y2="${n(by + Math.sin(a + d) * l)}"/>`;
    }
  }
  return `<g stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}">${s}</g>`;
}
export { snowflake };

export function background(kind: BgKind, P: Pal, o: BgOpt = {}): string {
  const seed = o.seed ?? 7;
  const r = rng(seed);
  const halo = `<circle cx="250" cy="230" r="190" fill="url(#bgH)"/>`;
  switch (kind) {
    case "halo":
      return sky(P) + halo;
    case "stars":
      return sky(P) + starfield(seed, 140, 0, 420, "#fff", 1.4) + (o.moon ? `<circle cx="405" cy="88" r="56" fill="#fff3d0" opacity=".18" filter="url(#bgB)"/><path d="M405 58 A30 30 0 1 0 427 110 A24 24 0 1 1 405 58Z" fill="#fff1cc"/>` : "") + sparkle(80, 110, 6, "#fff", 0.8) + sparkle(430, 300, 5, "#fff", 0.7);
    case "confetti":
      return sky(P) + halo + confetti(seed, 70, P.c, 10, 450, 1);
    case "hills": {
      const [h1, h2] = o.hills || ["#c9d8b6", "#a9c193"];
      return sky(P) + (o.sun !== false ? `<circle cx="380" cy="120" r="70" fill="#fff6dc" opacity=".55" filter="url(#bgB)"/><circle cx="380" cy="120" r="30" fill="#fff4d6"/>` : "") +
        cloud(100, 110, 1, "#fff", 0.7) + `<path d="M0 400 C120 360 210 395 290 378 C370 362 440 385 500 370 L500 480 L0 480Z" fill="${h1}"/><path d="M0 438 C110 412 230 444 330 424 C410 410 460 430 500 422 L500 480 L0 480Z" fill="${h2}"/>`;
    }
    case "bokeh": {
      let b = "";
      for (let i = 0; i < 26; i++) b += `<circle cx="${n(r() * 500)}" cy="${n(r() * 430)}" r="${n(8 + r() * 26)}" fill="${P.c[i % P.c.length]}" opacity="${n(0.07 + r() * 0.16)}" filter="url(#bgB)"/>`;
      return sky(P) + b;
    }
    case "rays": {
      let s = "";
      for (let i = 0; i < 36; i += 2) {
        const a = (i / 36) * Math.PI * 2, a2 = a + Math.PI / 36;
        s += `<path d="M250 230 L${n(250 + Math.cos(a) * 420)} ${n(230 + Math.sin(a) * 420)} L${n(250 + Math.cos(a2) * 420)} ${n(230 + Math.sin(a2) * 420)}Z" fill="${P.accent}" opacity="${P.dark ? 0.1 : 0.18}"/>`;
      }
      return sky(P) + s + halo;
    }
    case "snow": {
      let s = "";
      for (let i = 0; i < 100; i++) s += `<circle cx="${n(r() * 500)}" cy="${n(r() * 470)}" r="${n(0.8 + r() * 2.2)}" fill="#fff" opacity="${n(0.4 + r() * 0.5)}"/>`;
      return sky(P) + (o.moon ? `<circle cx="400" cy="90" r="26" fill="#fff4d2"/><circle cx="400" cy="90" r="60" fill="#fff4d2" opacity=".15" filter="url(#bgB)"/>` : "") + `<path d="M0 440 C120 428 380 432 500 440 L500 480 L0 480Z" fill="#eef2f8"/>` + s;
    }
    case "pattern": {
      const t = o.tile || "dot";
      let s = "";
      for (let y = 30; y < 460; y += 52) for (let x = (y / 52) % 2 ? 50 : 24; x < 500; x += 52) {
        const c = P.accent;
        s += t === "heart" ? heart(x, y, 9, c) : t === "star" ? star5(x, y, 6, c) : t === "snow" ? snowflake(x, y, 7, c, 1, 1) : t === "leaf" ? leaf(x - 6, y, 13, -30, c) : t === "flower" ? flower(x, y, 11, 5, c, P.paper, 0, 0.38) : `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`;
      }
      return sky(P) + `<g opacity="${P.dark ? 0.22 : 0.3}">${s}</g>` + `<circle cx="250" cy="230" r="170" fill="${P.paper}" opacity=".85"/>`;
    }
    case "corners": {
      const cluster = (x: number, y: number, flip: number) => {
        let s = "";
        for (let i = 0; i < 7; i++) s += leaf(x, y, 46 + r() * 30, (flip > 0 ? 10 : 170) + flip * (i * 14 - 10), i % 2 ? "#8fae84" : "#a9c49b", "#5f7d55", 0.3);
        s += flower(x + flip * 38, y + 30, 22, 5, P.c[1], "#f6e7a8", 10, 0.4) + flower(x + flip * 70, y + 8, 16, 5, P.c[0], "#f6e7a8", 30, 0.4) + flower(x + flip * 18, y + 66, 14, 6, "#ffffff", P.c[3], 0, 0.32);
        return s;
      };
      return sky(P) + halo + cluster(-6, -6, 1) + cluster(506, -6, -1);
    }
    case "wash": {
      let s = "";
      for (let i = 0; i < 7; i++) s += `<ellipse cx="${n(60 + r() * 380)}" cy="${n(60 + r() * 330)}" rx="${n(60 + r() * 70)}" ry="${n(40 + r() * 60)}" fill="${P.c[i % P.c.length]}" opacity="${P.dark ? 0.18 : 0.22}" filter="url(#bgB)"/>`;
      return sky(P) + s;
    }
    case "sea": {
      let s = "";
      for (let i = 0; i < 26; i++) {
        const y = 312 + i * 6 + r() * 3, w = 30 + r() * 140, x = r() * 500;
        s += `<line x1="${n(x)}" y1="${n(y)}" x2="${n(x + w)}" y2="${n(y)}" stroke="#ffffff" stroke-width=".9" opacity="${n(0.12 + r() * 0.2)}"/>`;
      }
      return `<defs>${lg("bgS", [[0, P.top], [0.64, P.mid], [0.641, P.accent], [1, P.paper]])}${blur("bgB", 14)}${rg("bgH", [[0, "#ffffff", 0.5], [1, "#ffffff", 0]])}</defs><rect width="500" height="480" fill="url(#bgS)"/>` + s;
    }
    case "clouds":
      return sky(P) + cloud(90, 100, 1.2, "#fff", 0.85) + cloud(410, 70, 0.9, "#fff", 0.75) + cloud(430, 300, 1.2, "#fff", 0.65) + cloud(70, 330, 1, "#fff", 0.6);
  }
}
