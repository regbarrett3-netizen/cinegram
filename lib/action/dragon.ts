// The fire-breathing dragon: flies in the distance, dives straight at the viewer, swoops round,
// then breathes fire that spells words. Used by the "dragon" Halloween card and the Halloween ad.
// Everything is deterministic in t, so the preview, the recorded video and the ad match frame for frame.
import { H, W, clamp, ease, glow, lerp, rng, seg, sky, stars, type Ctx } from "./engine";

type V3 = { x: number; y: number; z: number };
type P2 = { x: number; y: number; s: number };

/** One burst of fire that writes some lines of text. */
export type Breath = { start: number; sweep: number; lines: string[]; px: number; cy: number; weight?: number };

export type DragonShow = {
  /** When the dragon leaves (it flies up and away while the words keep burning). */
  exitAt: number;
  breaths: Breath[];
  fontFamily: string;
};

/* ---------------- flight path (world space, camera at z = 0 looking down +z) ---------------- */

const CX = 360, CY = 560, F = 760;
const ORBIT_END = 2.3, DIVE_END = 3.5, TURN_END = 4.2;
const DIVE_TO: V3 = { x: 0, y: -60, z: 240 };
const TURN_C: V3 = { x: -760, y: -120, z: 420 };
const HOVER: V3 = { x: -70, y: -330, z: 700 };

const add = (a: V3, b: V3, k = 1): V3 => ({ x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k });
const mix = (a: V3, b: V3, k: number): V3 => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) });
const bez = (a: V3, c: V3, b: V3, k: number): V3 => mix(mix(a, c, k), mix(c, b, k), k);
const dist = (a: V3, b: V3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

function orbit(t: number): V3 {
  const th = -2 + 1.9 * t;
  return { x: 520 * Math.sin(th), y: -260 + 70 * Math.sin(2 * th), z: 1500 + 420 * Math.cos(th) };
}
function hover(t: number): V3 {
  const u = Math.max(0, t - TURN_END);
  return add(HOVER, { x: 25 * Math.sin(1.6 * u) + 18 * u, y: 18 * Math.sin(2.4 * u), z: 0 });
}

export function flight(t: number, exitAt: number): V3 {
  if (t <= ORBIT_END) return orbit(t);
  if (t <= DIVE_END) { const k = seg(t, ORBIT_END, DIVE_END); return mix(orbit(ORBIT_END), DIVE_TO, k * k); }
  if (t <= TURN_END) return bez(DIVE_TO, TURN_C, HOVER, ease.inOut(seg(t, DIVE_END, TURN_END)));
  if (t <= exitAt) return hover(t);
  const from = hover(exitAt);
  return bez(from, { x: from.x + 700, y: from.y - 200, z: from.z + 100 }, { x: 1500, y: -1200, z: 1500 }, ease.in(seg(t, exitAt, exitAt + 1.7)));
}

const proj = (p: V3): P2 => {
  const z = Math.max(60, p.z);
  return { x: CX + (p.x * F) / z, y: CY + (p.y * F) / z, s: F / z };
};

/** The spine, head first: points spaced along where the dragon has just flown, so the body bends with the flight. */
const SEGS = 26, LEN = 340;
/** Head size relative to the body, and how far the mouth sits in front of the neck. */
const HEAD = 1.35, MOUTH = 54 * HEAD;
function spine(t: number, exitAt: number): V3[] {
  const gap = LEN / (SEGS - 1);
  const pts: V3[] = [flight(t, exitAt)];
  let prev = pts[0], acc = 0;
  for (let tt = t - 0.004; tt > t - 2.5 && pts.length < SEGS; tt -= 0.004) {
    const p = flight(Math.max(0, tt), exitAt);
    acc += dist(p, prev);
    while (acc >= gap && pts.length < SEGS) {
      const k = 1 - (acc - gap) / Math.max(1e-6, dist(p, prev));
      pts.push(mix(prev, p, k));
      acc -= gap;
    }
    prev = p;
    if (tt <= 0) break;
  }
  // Hovering or just starting: extend the tail straight back from the last bit of body, with a lazy wave.
  let dir: V3 = { x: -1, y: 0.15, z: 0 };
  if (pts.length >= 2) {
    const a = pts[pts.length - 1], b = pts[pts.length - 2], d = dist(a, b);
    if (d > 1e-3) dir = { x: (a.x - b.x) / d, y: (a.y - b.y) / d, z: (a.z - b.z) / d };
  }
  while (pts.length < SEGS) {
    const k = pts.length;
    const last = pts[pts.length - 1];
    pts.push(add(last, { x: dir.x * gap, y: dir.y * gap + Math.sin(k * 0.6 + t * 3) * 6, z: dir.z * gap }));
  }
  return pts;
}

/** Body half-thickness along the spine (world units). */
function girth(k: number): number {
  if (k < 3) return lerp(11, 17, k / 3);
  if (k < 10) return 22;
  return lerp(22, 2.5, (k - 10) / (SEGS - 11));
}

/* ---------------- drawing ---------------- */

function wing(c: Ctx, root: P2, back: P2, u: { x: number; y: number }, up: { x: number; y: number }, span: number, lift: number, fill: string, bone: string) {
  const at = (p: { x: number; y: number }, du: number, dv: number) => ({ x: p.x + u.x * du + up.x * dv, y: p.y + u.y * du + up.y * dv });
  const elbow = at(root, -span * 0.12, span * 0.5 * lift + span * 0.08);
  const tips = [at(elbow, span * 0.32, span * 0.38 * lift), at(elbow, -span * 0.08, span * 0.6 * lift), at(elbow, -span * 0.5, span * 0.42 * lift)];
  const g = c.createLinearGradient(root.x, root.y, tips[1].x, tips[1].y);
  g.addColorStop(0, fill); g.addColorStop(1, "rgba(255,120,60,0.55)");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(root.x, root.y);
  c.lineTo(elbow.x, elbow.y);
  c.lineTo(tips[0].x, tips[0].y);
  const scallop = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    c.quadraticCurveTo(mx + (elbow.x - mx) * 0.28, my + (elbow.y - my) * 0.28, b.x, b.y);
  };
  scallop(tips[0], tips[1]);
  scallop(tips[1], tips[2]);
  scallop(tips[2], back);
  c.closePath();
  c.fill();
  c.strokeStyle = bone; c.lineWidth = Math.max(1.5, span * 0.025); c.lineCap = "round";
  c.beginPath();
  c.moveTo(root.x, root.y); c.lineTo(elbow.x, elbow.y);
  for (const tp of tips) { c.moveTo(elbow.x, elbow.y); c.lineTo(tp.x, tp.y); }
  c.stroke();
  // little claw at the wrist
  c.fillStyle = "#e9d9b8";
  c.beginPath(); c.arc(elbow.x, elbow.y, Math.max(1.5, span * 0.02), 0, Math.PI * 2); c.fill();
}

function head(c: Ctx, p: P2, dir: { x: number; y: number }, jaw: number, t: number) {
  const s = p.s;
  c.save();
  c.translate(p.x, p.y);
  c.rotate(Math.atan2(dir.y, dir.x));
  if (dir.x < 0) c.scale(1, -1);
  c.scale(s * HEAD, s * HEAD);
  const open = jaw * 0.42;
  // horns
  c.fillStyle = "#e9d9b8";
  c.beginPath(); c.moveTo(-4, -20); c.quadraticCurveTo(-24, -34, -40, -50); c.quadraticCurveTo(-20, -30, -12, -14); c.fill();
  c.beginPath(); c.moveTo(6, -21); c.quadraticCurveTo(-8, -40, -18, -58); c.quadraticCurveTo(-4, -36, 2, -17); c.fill();
  // lower jaw, hinged near the cheek
  c.save();
  c.translate(8, 4); c.rotate(open); c.translate(-8, -4);
  c.fillStyle = "#3a1747";
  c.beginPath(); c.moveTo(-14, 4); c.lineTo(10, 6); c.lineTo(50, 8); c.lineTo(46, 15); c.lineTo(4, 17); c.lineTo(-16, 12); c.closePath(); c.fill();
  if (jaw > 0.05) { c.fillStyle = "#fff4e0"; for (let x = 18; x < 46; x += 7) { c.beginPath(); c.moveTo(x, 8); c.lineTo(x + 2.5, 3); c.lineTo(x + 5, 8); c.fill(); } }
  c.restore();
  // mouth glow when breathing
  if (jaw > 0.05) glow(c, 40, 8, 26, "rgba(255,170,60,0.9)", jaw);
  // skull and snout
  const g = c.createLinearGradient(0, -24, 0, 8);
  g.addColorStop(0, "#5b2a74"); g.addColorStop(1, "#2a0f36");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-18, -12); c.quadraticCurveTo(-8, -26, 12, -22); c.quadraticCurveTo(30, -16, 50, -9);
  c.quadraticCurveTo(60, -6, 56, 2); c.lineTo(12, 5); c.lineTo(-16, 10); c.closePath(); c.fill();
  // brow ridge, nostril, eye
  c.strokeStyle = "#7d3f99"; c.lineWidth = 2; c.beginPath(); c.moveTo(4, -19); c.quadraticCurveTo(16, -22, 26, -15); c.stroke();
  glow(c, 52, -4, 7, "rgba(255,120,40,0.9)", 0.6 + 0.4 * Math.sin(t * 7));
  glow(c, 18, -11, 14, "rgba(255,210,63,0.75)");
  c.fillStyle = "#ffd23f"; c.beginPath(); c.ellipse(18, -11, 5.5, 3.6, -0.15, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#1a0606"; c.beginPath(); c.ellipse(19, -11, 1.2, 3.2, 0, 0, Math.PI * 2); c.fill();
  // spines down the back of the head
  c.fillStyle = "#7d3f99";
  for (let k = 0; k < 3; k++) { const x = -8 - k * 9; c.beginPath(); c.moveTo(x, -10 + k * 2); c.lineTo(x - 5, -22 + k * 3); c.lineTo(x - 9, -8 + k * 2); c.fill(); }
  c.restore();
}

/** Draws the dragon at time t. Returns where its mouth is on screen (for the fire). */
export function drawDragon(c: Ctx, t: number, exitAt: number, jaw: number): { mouth: { x: number; y: number }; dir: { x: number; y: number }; s: number } {
  const sp = spine(t, exitAt).map(proj);
  const tan = (k: number) => {
    const a = sp[Math.max(0, k - 1)], b = sp[Math.min(SEGS - 1, k + 1)];
    const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 1;
    return { x: dx / d, y: dy / d };
  };
  const upOf = (v: { x: number; y: number }) => { const n = { x: v.y, y: -v.x }; return n.y > 0 ? { x: -n.x, y: -n.y } : n; };

  const fast = t > ORBIT_END - 0.2 && t < DIVE_END ? 0.45 : 1;
  const flap = Math.sin(t * Math.PI * 2 * (t > TURN_END && t < exitAt ? 1.6 : 2.4));
  const sh = sp[5], back = sp[11], u = tan(5), up = upOf(u);
  const span = 270 * sh.s * fast;

  // far wing (behind the body)
  wing(c, { ...sh, x: sh.x + up.x * 4 * sh.s, y: sh.y + up.y * 4 * sh.s }, back, u, up, span * 0.82, flap * 0.95 + 0.1, "rgba(70,16,34,0.95)", "#1d0714");

  // body: a tapered ribbon, dark back, ember belly, spikes along the top
  const top: { x: number; y: number }[] = [], bot: { x: number; y: number }[] = [], belly: { x: number; y: number }[] = [];
  for (let k = 0; k < SEGS; k++) {
    const p = sp[k], n = upOf(tan(k)), w = girth(k) * Math.min(p.s, k > 12 ? 1.6 : 4);
    top.push({ x: p.x + n.x * w, y: p.y + n.y * w });
    bot.push({ x: p.x - n.x * w, y: p.y - n.y * w });
    belly.push({ x: p.x - n.x * w * 0.15, y: p.y - n.y * w * 0.15 });
  }
  c.fillStyle = "#2b1036";
  c.beginPath(); top.forEach((q, i) => (i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); for (let i = SEGS - 1; i >= 0; i--) c.lineTo(bot[i].x, bot[i].y); c.closePath(); c.fill();
  c.fillStyle = "#c95a22";
  c.beginPath(); belly.forEach((q, i) => (i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); for (let i = SEGS - 2; i >= 1; i--) c.lineTo(bot[i].x, bot[i].y); c.closePath(); c.fill();
  c.strokeStyle = "rgba(60,15,10,0.55)"; c.lineWidth = Math.max(1, 1.4 * sp[6].s);
  for (let k = 2; k < SEGS - 3; k++) { c.beginPath(); c.moveTo(belly[k].x, belly[k].y); c.lineTo(bot[k].x, bot[k].y); c.stroke(); }
  c.strokeStyle = "#6e3a8c"; c.lineWidth = Math.max(1, 2.2 * sp[6].s);
  c.beginPath(); top.forEach((q, i) => (i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.stroke();
  c.fillStyle = "#7d3f99";
  for (let k = 3; k < SEGS - 2; k += 2) {
    const n = upOf(tan(k)), q = top[k], h = girth(k) * Math.min(sp[k].s, k > 12 ? 1.6 : 4) * 0.8, a = tan(k);
    c.beginPath(); c.moveTo(q.x + a.x * h * 0.5, q.y + a.y * h * 0.5); c.lineTo(q.x + n.x * h - a.x * h * 0.3, q.y + n.y * h - a.y * h * 0.3); c.lineTo(q.x - a.x * h * 0.6, q.y - a.y * h * 0.6); c.fill();
  }
  // tail spade
  const tip = sp[SEGS - 1], ta = tan(SEGS - 1), tn = upOf(ta), ts = 16 * Math.min(tip.s, 1.4);
  c.fillStyle = "#7d3f99";
  c.beginPath(); c.moveTo(tip.x + tn.x * ts, tip.y + tn.y * ts); c.lineTo(tip.x - ta.x * ts * 2, tip.y - ta.y * ts * 2); c.lineTo(tip.x - tn.x * ts, tip.y - tn.y * ts); c.closePath(); c.fill();
  // legs tucked under the belly
  c.strokeStyle = "#2b1036"; c.lineCap = "round";
  for (const k of [7, 13]) {
    const q = bot[k], a = tan(k), n = upOf(a), l = 26 * sp[k].s;
    c.lineWidth = Math.max(2, 8 * sp[k].s);
    c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - n.x * l * 0.6 - a.x * l * 0.5, q.y - n.y * l * 0.6 - a.y * l * 0.5); c.lineTo(q.x - n.x * l * 0.5 + a.x * l * 0.2, q.y - n.y * l * 0.5 + a.y * l * 0.2); c.stroke();
  }

  // near wing
  wing(c, sh, back, u, up, span, flap, "rgba(150,36,48,0.92)", "#3b0d1d");

  // head
  const hd = tan(0);
  head(c, sp[0], hd, jaw, t);
  const s0 = sp[0].s;
  const along = (a: number, b: number) => ({ x: sp[0].x + hd.x * a * s0 + upOf(hd).x * b * s0, y: sp[0].y + hd.y * a * s0 + upOf(hd).y * b * s0 });
  // chest glows while the fire builds
  if (jaw > 0.05) glow(c, sp[4].x, sp[4].y, 60 * sp[4].s, "rgba(255,120,30,0.55)", jaw);
  return { mouth: along(MOUTH, -2 * HEAD), dir: hd, s: s0 };
}

/* ---------------- fire that writes ---------------- */

let hotSprite: HTMLCanvasElement | null = null, emberSprite: HTMLCanvasElement | null = null;
function sprite(stops: [number, string][]): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [o, col] of stops) gr.addColorStop(o, col);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return cv;
}
function sprites() {
  if (!hotSprite) hotSprite = sprite([[0, "rgba(255,255,240,1)"], [0.25, "rgba(255,230,120,0.95)"], [0.55, "rgba(255,140,30,0.55)"], [1, "rgba(255,60,0,0)"]]);
  if (!emberSprite) emberSprite = sprite([[0, "rgba(255,210,110,1)"], [0.35, "rgba(255,110,20,0.85)"], [0.7, "rgba(200,30,0,0.35)"], [1, "rgba(120,0,0,0)"]]);
  return { hot: hotSprite, ember: emberSprite };
}

type Target = { x: number; y: number; launch: number; j: number };
const targetCache = new Map<string, Target[]>();

/** Points that fill the letters, each with the moment the fire reaches it (left to right). */
function targets(b: Breath, fontFamily: string): Target[] {
  const key = `${b.lines.join("\n")}|${b.px}|${b.cy}|${b.start}|${b.sweep}|${fontFamily}`;
  const hit = targetCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d", { willReadFrequently: true } as CanvasRenderingContext2DSettings)!;
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff";
  let px = b.px;
  const font = (n: number) => `${b.weight ?? 800} ${n}px ${fontFamily}`;
  g.font = font(px);
  while (px > 30 && Math.max(...b.lines.map((l) => g.measureText(l).width)) > 640) g.font = font(--px);
  const lh = px * 1.08;
  b.lines.forEach((l, i) => g.fillText(l, W / 2, b.cy + (i - (b.lines.length - 1) / 2) * lh));
  const data = g.getImageData(0, 0, W, H).data;
  const step = Math.max(5, Math.round(px / 16));
  const r = rng(b.lines.join("").length * 131 + px);
  const pts: Target[] = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    if (data[(y * W + x) * 4 + 3] > 120) pts.push({ x: x + (r() - 0.5) * step * 0.6, y: y + (r() - 0.5) * step * 0.6, launch: 0, j: r() });
  }
  const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
  for (const p of pts) p.launch = b.start + ((p.x - minX) / Math.max(1, maxX - minX)) * b.sweep + p.j * 0.08;
  targetCache.set(key, pts);
  return pts;
}

const TRAVEL = 0.42;

/** Whether the dragon is breathing at t (jaw open), 0..1. */
export function breathing(t: number, breaths: Breath[]): number {
  let v = 0;
  for (const b of breaths) v = Math.max(v, seg(t, b.start - 0.25, b.start) * (1 - seg(t, b.start + b.sweep + 0.25, b.start + b.sweep + 0.5)));
  return v;
}

export function drawFire(c: Ctx, t: number, show: DragonShow, mouthAt: (tt: number) => { x: number; y: number }, mouthNow: { x: number; y: number }, scale: number) {
  const { hot, ember } = sprites();
  c.save();
  c.globalCompositeOperation = "lighter";
  for (const b of show.breaths) {
    if (t < b.start - 0.3) continue;
    const pts = targets(b, show.fontFamily);
    // the stream leaving the mouth while this breath lasts
    const live = seg(t, b.start - 0.25, b.start) * (1 - seg(t, b.start + b.sweep + 0.1, b.start + b.sweep + 0.45));
    if (live > 0) {
      const prog = clamp((t - b.start) / b.sweep);
      const aim = { x: lerp(60, 660, prog), y: b.cy };
      const dx = aim.x - mouthNow.x, dy = aim.y - mouthNow.y, d = Math.hypot(dx, dy) || 1;
      for (let j = 0; j < 46; j++) {
        const life = (t * 3.2 + j / 46) % 1;
        const reach = life * Math.min(d, 260 + 140 * scale);
        const wob = Math.sin(j * 12.7 + t * 30) * (6 + life * 26);
        const x = mouthNow.x + (dx / d) * reach - (dy / d) * wob, y = mouthNow.y + (dy / d) * reach + (dx / d) * wob;
        const size = (10 + life * 46) * scale * 0.7;
        c.globalAlpha = live * (1 - life) * 0.8;
        c.drawImage(life < 0.35 ? hot : ember, x - size / 2, y - size / 2, size, size);
      }
    }
    // each point of each letter: flies from the mouth, lands, then smoulders
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (t < p.launch) continue;
      const age = t - p.launch;
      if (age < TRAVEL) {
        const k = ease.out(age / TRAVEL);
        const m = mouthAt(p.launch);
        const cx = (m.x + p.x) / 2 + Math.sin(i) * 30, cy = Math.min(m.y, p.y) - 70;
        const x = lerp(lerp(m.x, cx, k), lerp(cx, p.x, k), k), y = lerp(lerp(m.y, cy, k), lerp(cy, p.y, k), k);
        const size = lerp(34, 16, k);
        c.globalAlpha = 0.85;
        c.drawImage(hot, x - size / 2, y - size / 2, size, size);
      } else {
        const a = age - TRAVEL;
        const flick = 0.7 + 0.3 * Math.sin(t * 11 + i * 1.7) * Math.sin(t * 7.3 + i * 0.9);
        const size = 15 + 3 * Math.sin(t * 5 + i);
        c.globalAlpha = flick * 0.85;
        c.drawImage(ember, p.x - size / 2, p.y - size / 2, size, size);
        const heat = Math.exp(-a * 2.4);
        if (heat > 0.02) { c.globalAlpha = heat * 0.9; c.drawImage(hot, p.x - 11, p.y - 11, 22, 22); }
        if (i % 11 === 0) {
          const f = (a * 0.6 + p.j) % 1;
          c.globalAlpha = (1 - f) * 0.7;
          c.drawImage(hot, p.x + Math.sin(i + a * 3) * 8 - 3, p.y - f * 70 - 3, 6, 6);
        }
      }
    }
  }
  c.restore();
}

/* ---------------- the scene ---------------- */

export function drawBackdrop(c: Ctx, t: number) {
  sky(c, [[0, "#0b0618"], [0.45, "#2a0f3d"], [0.72, "#6b1f2e"], [0.86, "#c2541b"], [1, "#2a0a12"]]);
  stars(c, 911, 120, 700, t, 2.2);
  glow(c, 540, 250, 300, "rgba(255,226,170,0.35)");
  c.fillStyle = "#ffe8b0"; c.beginPath(); c.arc(540, 250, 104, 0, Math.PI * 2); c.fill();
  c.fillStyle = "rgba(210,180,120,0.35)"; c.beginPath(); c.arc(505, 225, 20, 0, Math.PI * 2); c.arc(575, 290, 14, 0, Math.PI * 2); c.fill();
  // mountains and a castle on the ridge
  c.fillStyle = "#170816";
  c.beginPath(); c.moveTo(0, 980); c.lineTo(110, 880); c.lineTo(200, 940); c.lineTo(330, 830); c.lineTo(450, 930); c.lineTo(560, 860); c.lineTo(720, 950); c.lineTo(720, H); c.lineTo(0, H); c.fill();
  c.fillStyle = "#0e0410";
  c.fillRect(250, 760, 170, 120); c.fillRect(230, 700, 46, 180); c.fillRect(395, 690, 46, 190); c.fillRect(310, 730, 50, 150);
  for (const [x, y, w] of [[230, 700, 46], [395, 690, 46], [310, 730, 50]] as [number, number, number][]) { c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + w / 2, y - 60); c.lineTo(x + w + 6, y); c.fill(); }
  for (const [x, y] of [[250, 740], [412, 730], [328, 770], [290, 800], [370, 800]] as [number, number][]) {
    c.fillStyle = `rgba(255,190,80,${0.6 + 0.4 * Math.sin(t * 3 + x)})`; c.fillRect(x, y, 9, 14);
  }
  c.fillStyle = "#08020a"; c.fillRect(0, 960, W, H - 960);
}

/** Where the mouth was at an earlier moment (for fire already in flight). Cached in 20 ms steps. */
const mouthCache = new Map<string, { x: number; y: number }>();
function mouthAt(tt: number, exitAt: number): { x: number; y: number } {
  const q = Math.round(tt * 50);
  const key = `${exitAt}|${q}`;
  const hit = mouthCache.get(key);
  if (hit) return hit;
  const sp = spine(q / 50, exitAt).map(proj);
  const dx = sp[0].x - sp[1].x, dy = sp[0].y - sp[1].y, dd = Math.hypot(dx, dy) || 1;
  const m = { x: sp[0].x + (dx / dd) * MOUTH * sp[0].s, y: sp[0].y + (dy / dd) * MOUTH * sp[0].s };
  if (mouthCache.size > 4000) mouthCache.clear();
  mouthCache.set(key, m);
  return m;
}

export function drawShow(c: Ctx, t: number, show: DragonShow) {
  // a jolt when the dragon reaches the screen
  const jolt = seg(t, DIVE_END - 0.12, DIVE_END) * (1 - seg(t, DIVE_END, DIVE_END + 0.35));
  c.save();
  if (jolt > 0) c.translate(Math.sin(t * 90) * 10 * jolt, Math.cos(t * 77) * 8 * jolt);
  drawBackdrop(c, t);
  const roar = seg(t, DIVE_END - 0.45, DIVE_END - 0.1) * (1 - seg(t, DIVE_END + 0.1, DIVE_END + 0.4));
  const jaw = Math.max(breathing(t, show.breaths), roar);
  const d = drawDragon(c, t, show.exitAt, jaw);
  drawFire(c, t, show, (tt) => mouthAt(tt, show.exitAt), d.mouth, Math.min(2, d.s));
  if (jolt > 0) { c.globalAlpha = jolt * 0.25; c.fillStyle = "#ff9a3c"; c.fillRect(-20, -20, W + 40, H + 40); c.globalAlpha = 1; }
  c.restore();
}
