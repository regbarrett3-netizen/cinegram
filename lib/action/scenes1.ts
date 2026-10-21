// Action scenes, part 1: balloons, roses, doves, lanterns, fireworks, hearts, butterflies, petals.
import { DUR, H, W, clamp, cloud, ease, glow, heartPath, leaf, lerp, rng, seg, shade, sky, sparkle, starPath, stars, type Ctx } from "./engine";

export type Scene = {
  /** Text colour for the greeting. */
  ink: string;
  /** RGB triple for the dark/light band behind the greeting, e.g. "20,10,30". */
  scrim: string;
  accent: string;
  draw: (c: Ctx, t: number) => void;
};
void DUR;

/* ---------------- balloon release ---------------- */

function balloon(c: Ctx, x: number, y: number, r: number, col: string) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r * 1.25);
  g.addColorStop(0, shade(col, 0.45));
  g.addColorStop(0.45, col);
  g.addColorStop(1, shade(col, -0.25));
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, r, r * 1.18, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = shade(col, -0.2);
  c.beginPath();
  c.moveTo(x - 6, y + r * 1.18 + 9);
  c.lineTo(x, y + r * 1.18 - 1);
  c.lineTo(x + 6, y + r * 1.18 + 9);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.5)";
  c.beginPath();
  c.ellipse(x - r * 0.4, y - r * 0.48, r * 0.14, r * 0.3, 0.5, 0, Math.PI * 2);
  c.fill();
}

const balloonsScene = (): Scene => {
  const r = rng(101);
  const cols = ["#ef6f6c", "#f6c445", "#5fb2a8", "#e98ab0", "#8b7cc4", "#f2945a", "#6aa8e8", "#ffffff"];
  const items = Array.from({ length: 24 }, (_, i) => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 175;
    return { x: 360 + Math.cos(a) * d * 1.1, y: 720 + Math.sin(a) * d * 0.8, rad: 34 + r() * 14, col: cols[i % cols.length], vy: 75 + r() * 55, drift: (r() - 0.5) * 50, ph: r() * 6.28, delay: r() * 0.35 };
  }).sort((a, b) => a.rad - b.rad);
  const REL = 1.4, HAND = { x: 360, y: 1120 };
  return {
    ink: "#2d2a4a", scrim: "255,246,236", accent: "#ef6f6c",
    draw(c, t) {
      sky(c, [[0, "#64aef0"], [0.5, "#bfe1ff"], [1, "#ffe9d8"]]);
      glow(c, 590, 170, 220, "rgba(255,247,214,.9)");
      cloud(c, 140 + t * 10, 220, 1.3, "#fff", 0.85);
      cloud(c, 560 + t * 6, 420, 1, "#fff", 0.7);
      cloud(c, 80 + t * 8, 620, 0.9, "#fff", 0.55);
      c.fillStyle = "#b8d8a6";
      c.beginPath(); c.moveTo(0, 1060); c.bezierCurveTo(200, 1000, 420, 1080, 720, 1020); c.lineTo(720, 1280); c.lineTo(0, 1280); c.fill();
      c.fillStyle = "#98c389";
      c.beginPath(); c.moveTo(0, 1130); c.bezierCurveTo(260, 1090, 480, 1160, 720, 1110); c.lineTo(720, 1280); c.lineTo(0, 1280); c.fill();
      for (const b of items) {
        const dt = Math.max(0, t - REL - b.delay);
        const bob = Math.sin(t * 2 + b.ph) * 6;
        const x = b.x + b.drift * dt * 0.7 + Math.sin(t * 1.6 + b.ph) * 14 * Math.min(1, dt);
        const y = b.y + (dt > 0 ? -(b.vy * dt + 6 * dt * dt) : bob);
        const by = y + b.rad * 1.18 + 9;
        c.strokeStyle = "rgba(90,80,70,.55)";
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(x, by);
        if (dt <= 0) c.bezierCurveTo(x, by + 120, HAND.x + (x - HAND.x) * 0.2, HAND.y - 140, HAND.x, HAND.y);
        else { const sw = Math.sin(t * 3 + b.ph) * 18; c.bezierCurveTo(x + sw, by + 40, x - sw, by + 80, x + sw * 0.5, by + 130); }
        c.stroke();
        balloon(c, x, y, b.rad, b.col);
      }
      const knot = 1 - seg(t, REL, REL + 0.4);
      if (knot > 0) {
        c.globalAlpha = knot;
        c.fillStyle = "#e76f6a";
        c.beginPath(); c.moveTo(HAND.x - 16, HAND.y - 8); c.lineTo(HAND.x + 16, HAND.y + 8); c.lineTo(HAND.x + 16, HAND.y - 8); c.lineTo(HAND.x - 16, HAND.y + 8); c.fill();
        c.globalAlpha = 1;
      }
      const burst = seg(t, REL, REL + 0.9);
      if (burst > 0 && burst < 1) for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; sparkle(c, HAND.x + Math.cos(a) * 90 * burst, HAND.y + Math.sin(a) * 60 * burst - 40, 9, "#fff6c8", 1 - burst); }
    },
  };
};

/* ---------------- a dozen roses ---------------- */

function petal(c: Ctx, len: number, w: number, inner: string, outer: string) {
  const g = c.createLinearGradient(0, 0, 0, -len);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(-w, -len * 0.35, -w * 0.9, -len * 0.95, 0, -len);
  c.bezierCurveTo(w * 0.9, -len * 0.95, w, -len * 0.35, 0, 0);
  c.fill();
}

export function rose(c: Ctx, x: number, y: number, r: number, p: number, hue: [string, string, string] = ["#5e0716", "#b3122e", "#ef4a64"]) {
  if (p <= 0) return;
  const s = 0.3 + 0.7 * ease.out(p);
  c.save();
  c.translate(x, y);
  for (let l = 3; l >= 0; l--) {
    const lp = clamp((p - (3 - l) * 0.12) / 0.6);
    if (lp <= 0) continue;
    const len = r * s * (0.42 + 0.2 * l) * (0.55 + 0.45 * lp);
    const n = 5;
    for (let k = 0; k < n; k++) {
      c.save();
      c.rotate((k / n) * Math.PI * 2 + l * 0.63);
      petal(c, len, len * 0.7, hue[0], l === 3 ? shade(hue[2], 0.1) : l === 2 ? hue[2] : hue[1]);
      c.restore();
    }
  }
  c.fillStyle = hue[0];
  c.beginPath(); c.arc(0, 0, r * s * 0.24, 0, Math.PI * 2); c.fill();
  c.strokeStyle = hue[2];
  c.lineWidth = Math.max(1.5, r * 0.05);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, r * s * (0.2 - i * 0.05), i * 2 + 0.4, i * 2 + 4.6); c.stroke(); }
  c.restore();
}

const rosesScene = (): Scene => {
  const pos: [number, number][] = [[360, 440], [248, 478], [472, 478], [160, 570], [292, 556], [428, 556], [560, 570], [210, 664], [360, 650], [510, 664], [286, 748], [434, 748]];
  const r = rng(202);
  const bokeh = Array.from({ length: 22 }, () => ({ x: r() * W, y: r() * H, r: 20 + r() * 50, sp: 8 + r() * 20, a: 0.05 + r() * 0.12 }));
  const fall = Array.from({ length: 6 }, (_, i) => ({ x: 120 + r() * 480, t0: 4 + i * 0.55, sp: 70 + r() * 40, ph: r() * 6 }));
  return {
    ink: "#fbe7e3", scrim: "26,6,14", accent: "#e8b86a",
    draw(c, t) {
      sky(c, [[0, "#1a050d"], [0.5, "#4a1022"], [1, "#22060f"]]);
      for (const b of bokeh) glow(c, b.x, (b.y - t * b.sp + H) % H, b.r, "rgba(255,140,160,1)", b.a);
      glow(c, 360, 600, 420, "rgba(255,120,140,.35)");
      c.lineCap = "round";
      for (const [x, y] of pos) {
        c.strokeStyle = "#3f6b3a"; c.lineWidth = 6;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + 360) / 2, (y + 960) / 2 + 30, 360, 980); c.stroke();
      }
      c.strokeStyle = "#3f6b3a"; c.lineWidth = 7;
      for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(360 + i * 5, 980); c.lineTo(360 + i * 9, 1110); c.stroke(); }
      for (let i = 0; i < 14; i++) { const a = i * 0.45; leaf(c, 360 + Math.cos(a * 3) * 220, 620 + Math.sin(a * 2) * 160, 70, a * 4, i % 2 ? "#4f7d45" : "#3c6636", 0.3); }
      pos.forEach(([x, y], i) => rose(c, x, y, 66, seg(t, 0.25 + i * 0.2, 2.0 + i * 0.2)));
      // satin ribbon
      c.fillStyle = "#e8c98a";
      c.beginPath(); c.moveTo(360, 980); c.bezierCurveTo(300, 930, 250, 960, 270, 990); c.bezierCurveTo(290, 1015, 340, 995, 360, 980); c.bezierCurveTo(380, 995, 430, 1015, 450, 990); c.bezierCurveTo(470, 960, 420, 930, 360, 980); c.fill();
      c.fillRect(352, 975, 16, 20);
      c.beginPath(); c.moveTo(352, 990); c.lineTo(320, 1080); c.lineTo(338, 1072); c.lineTo(346, 1090); c.lineTo(362, 994); c.fill();
      c.beginPath(); c.moveTo(368, 990); c.lineTo(402, 1078); c.lineTo(384, 1072); c.lineTo(376, 1090); c.lineTo(358, 994); c.fill();
      for (const f of fall) {
        const dt = t - f.t0;
        if (dt < 0) continue;
        c.save();
        c.translate(f.x + Math.sin(dt * 2 + f.ph) * 40, 700 + dt * f.sp);
        c.rotate(dt * 1.5 + f.ph);
        c.scale(1, Math.cos(dt * 3 + f.ph));
        c.globalAlpha = 1 - seg(dt, 2.5, 3.5);
        petal(c, 26, 18, "#7a0c20", "#e0314f");
        c.restore();
      }
      for (let i = 0; i < 12; i++) { const k = (t * 0.6 + i * 0.37) % 1; sparkle(c, 120 + ((i * 97) % 480), 380 + ((i * 61) % 420), 8, "#ffe6b0", Math.sin(k * Math.PI) * 0.9); }
    },
  };
};

/* ---------------- dove release ---------------- */

function dove(c: Ctx, x: number, y: number, s: number, flap: number, dir: number) {
  c.save();
  c.translate(x, y);
  c.scale(s * dir, s);
  const wing = (back: boolean) => {
    c.save();
    c.translate(-4, -6);
    c.rotate(-0.2 - flap * 0.9 * (back ? 0.8 : 1));
    c.fillStyle = back ? "#dfe7ee" : "#ffffff";
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-10, -30, -40, -70, -78, -78);
    c.bezierCurveTo(-60, -52, -52, -30, -46, -12);
    c.bezierCurveTo(-30, -6, -14, -2, 0, 0);
    c.fill();
    c.strokeStyle = "rgba(160,175,190,.6)"; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-20, -18); c.lineTo(-56, -58); c.moveTo(-28, -12); c.lineTo(-58, -36); c.stroke();
    c.restore();
  };
  wing(true);
  c.fillStyle = "#ffffff";
  c.beginPath(); c.ellipse(0, 0, 44, 16, -0.15, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(-36, 2); c.lineTo(-74, -6); c.lineTo(-70, 14); c.lineTo(-38, 10); c.fill();
  c.beginPath(); c.arc(40, -10, 12, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#e8933a"; c.beginPath(); c.moveTo(51, -11); c.lineTo(62, -8); c.lineTo(51, -5); c.fill();
  c.fillStyle = "#2b2522"; c.beginPath(); c.arc(44, -13, 2.2, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(170,180,195,.7)"; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 2, 40, 13, -0.15, 0.2, 2.6); c.stroke();
  wing(false);
  c.restore();
}

const dovesScene = (): Scene => {
  const r = rng(303);
  const birds = Array.from({ length: 11 }, (_, i) => ({ x0: 300 + r() * 120, t0: 0.35 + i * 0.13, vx: (r() - 0.5) * 220, vy: -(190 + r() * 60), ph: r() * 6.28, s: 0.75 + r() * 0.45 }));
  const feathers = Array.from({ length: 7 }, () => ({ x: 160 + r() * 400, t0: 1.6 + r() * 2.5, ph: r() * 6.28 }));
  return {
    ink: "#2f3f5a", scrim: "246,250,255", accent: "#9fb6d8",
    draw(c, t) {
      sky(c, [[0, "#8fc6f2"], [0.55, "#e4f2fd"], [1, "#fff7ea"]]);
      c.save(); c.translate(360, 260);
      for (let i = 0; i < 14; i++) { c.rotate(Math.PI / 7); c.fillStyle = "rgba(255,250,225,.18)"; c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, -900); c.lineTo(40, -900); c.fill(); }
      c.restore();
      glow(c, 360, 260, 260, "rgba(255,250,225,.95)");
      cloud(c, 120 + t * 9, 520, 1.4, "#fff", 0.9);
      cloud(c, 600 - t * 7, 700, 1.2, "#fff", 0.8);
      cloud(c, 380 + t * 5, 900, 1.6, "#fff", 0.85);
      for (const f of feathers) {
        const dt = t - f.t0;
        if (dt < 0) continue;
        c.save(); c.translate(f.x + Math.sin(dt * 1.8 + f.ph) * 50, 520 + dt * 70); c.rotate(Math.sin(dt * 1.8 + f.ph) * 0.6);
        c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); c.ellipse(0, 0, 6, 18, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = "#cfd8e2"; c.beginPath(); c.moveTo(0, -18); c.lineTo(0, 22); c.stroke(); c.restore();
      }
      const list = birds.map((b) => {
        const dt = t - b.t0;
        return { b, dt, x: b.x0 + b.vx * dt + Math.sin(dt * 2 + b.ph) * 18, y: 1320 + b.vy * dt + 6 * dt * dt, s: b.s * (1.15 - 0.05 * Math.max(0, dt)) };
      }).filter((d) => d.dt > 0).sort((a, b) => a.s - b.s);
      for (const d of list) dove(c, d.x, d.y, d.s, Math.sin(t * 11 + d.b.ph), d.b.vx >= 0 ? 1 : -1);
    },
  };
};

/* ---------------- sky lanterns ---------------- */

function lantern(c: Ctx, x: number, y: number, s: number, flick: number) {
  glow(c, x, y, 90 * s, "rgba(255,170,80,1)", 0.45 * flick);
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(0, -30, 0, 26);
  g.addColorStop(0, "#fff3c8"); g.addColorStop(1, "#ff9d45");
  c.fillStyle = g;
  c.beginPath(); c.moveTo(-20, -30); c.lineTo(20, -30); c.lineTo(26, 22); c.lineTo(-26, 22); c.closePath(); c.fill();
  c.fillStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.moveTo(-14, -28); c.lineTo(-6, -28); c.lineTo(-8, 20); c.lineTo(-18, 20); c.fill();
  c.fillStyle = "#8a4a22"; c.fillRect(-26, 22, 52, 5);
  glow(c, 0, 18, 14, "rgba(255,240,180,1)", flick);
  c.restore();
}

const lanternsScene = (): Scene => {
  const r = rng(404);
  const ls = Array.from({ length: 24 }, () => { const s = 0.55 + r() * 0.8; return { x: 90 + r() * 540, y0: 900 + s * 160, s, t0: r() * 3, sp: 55 + r() * 60, ph: r() * 6.28 }; }).sort((a, b) => a.s - b.s);
  const HOR = 900;
  return {
    ink: "#f8e9d2", scrim: "16,20,40", accent: "#ffb760",
    draw(c, t) {
      sky(c, [[0, "#121735"], [0.45, "#4a3a6a"], [0.69, "#e0907a"], [0.7, "#2a3150"], [1, "#151a2e"]]);
      stars(c, 41, 90, 520, t, 1.5);
      c.fillStyle = "#34395a";
      c.beginPath(); c.moveTo(0, HOR); c.lineTo(90, 840); c.lineTo(180, 875); c.lineTo(280, 820); c.lineTo(390, 870); c.lineTo(500, 830); c.lineTo(620, 868); c.lineTo(720, 840); c.lineTo(720, HOR); c.fill();
      c.fillStyle = "rgba(255,200,160,.35)"; c.fillRect(0, HOR, W, 3);
      for (let i = 0; i < 26; i++) { const y = HOR + 12 + i * 14, w = 60 + ((i * 53) % 200); c.fillStyle = "rgba(255,220,190,.08)"; c.fillRect(((i * 131 + t * 20) % 900) - 150, y, w, 2); }
      for (const l of ls) {
        const dt = Math.max(0, t - l.t0);
        const x = l.x + Math.sin(t * 0.7 + l.ph) * 16 * Math.min(1, dt);
        const y = l.y0 - l.sp * dt - 8 * dt * dt * l.s;
        const flick = 0.85 + 0.15 * Math.sin(t * 9 + l.ph);
        if (y < HOR - 10) { c.save(); c.globalAlpha = 0.3; glow(c, x, 2 * HOR - y + 20, 40 * l.s, "rgba(255,170,80,1)", 0.6); c.restore(); }
        lantern(c, x, y, l.s, flick);
      }
    },
  };
};

/* ---------------- fireworks ---------------- */

const fireworksScene = (): Scene => {
  const r = rng(505);
  const cols = ["#ffd36b", "#ff7aa2", "#7fe0d0", "#b9a0ff", "#ffffff", "#ff9d5c"];
  const shows = [0.2, 0.9, 1.5, 2.2, 2.8, 3.5, 4.2, 4.9, 5.5, 6.2].map((t0, i) => ({
    t0, x: 140 + r() * 440, yb: 220 + r() * 360, col: cols[i % cols.length], col2: cols[(i + 2) % cols.length],
    parts: Array.from({ length: 70 }, (_, k) => ({ a: (k / 70) * Math.PI * 2 + r() * 0.08, v: 230 + r() * 140 })),
  }));
  const bld: { x: number; w: number; h: number; win: [number, number][] }[] = [];
  for (let x = 0; x < W; ) { const w = 50 + r() * 70, h = 120 + r() * 220, win: [number, number][] = []; for (let wy = 14; wy < h - 10; wy += 22) for (let wx = 10; wx < w - 12; wx += 16) if (r() < 0.35) win.push([wx, wy]); bld.push({ x, w, h, win }); x += w + 3; }
  return {
    ink: "#f6ecd6", scrim: "8,10,28", accent: "#ffd36b",
    draw(c, t) {
      sky(c, [[0, "#050816"], [0.6, "#1b1f4a"], [1, "#0d0f24"]]);
      stars(c, 51, 110, 700, t, 1.2);
      let flash = 0;
      for (const s of shows) {
        const dt = t - s.t0;
        if (dt < 0) continue;
        if (dt < 0.9) {
          const k = ease.out(dt / 0.9), y = lerp(1100, s.yb, k);
          glow(c, s.x, y, 16, "rgba(255,230,180,1)", 0.9);
          for (let i = 1; i < 8; i++) { c.fillStyle = `rgba(255,210,150,${0.6 - i * 0.07})`; c.beginPath(); c.arc(s.x + Math.sin(i + t * 20) * 2, y + i * 12, 2, 0, Math.PI * 2); c.fill(); }
          continue;
        }
        const b = dt - 0.9;
        if (b > 2.4) continue;
        flash = Math.max(flash, 1 - seg(b, 0, 0.5));
        glow(c, s.x, s.yb, 160, s.col, 0.5 * (1 - seg(b, 0, 0.6)));
        const f = (1 - Math.exp(-2.6 * b)) / 2.6;
        const fp = (1 - Math.exp(-2.6 * Math.max(0, b - 0.06))) / 2.6;
        const alpha = 1 - seg(b, 1.1, 2.4);
        c.lineCap = "round";
        for (let i = 0; i < s.parts.length; i++) {
          const p = s.parts[i];
          const x = s.x + Math.cos(p.a) * p.v * f, y = s.yb + Math.sin(p.a) * p.v * f + 55 * b * b;
          const px = s.x + Math.cos(p.a) * p.v * fp, py = s.yb + Math.sin(p.a) * p.v * fp + 55 * Math.max(0, b - 0.06) ** 2;
          c.strokeStyle = i % 3 ? s.col : s.col2;
          c.globalAlpha = alpha * (b > 1.4 ? 0.6 + 0.4 * Math.sin(t * 40 + i) : 1);
          c.lineWidth = 3;
          c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
        }
        c.globalAlpha = 1;
      }
      for (const bd of bld) {
        c.fillStyle = "#080a1a"; c.fillRect(bd.x, 1100 - bd.h, bd.w, bd.h + 200);
        c.fillStyle = `rgba(255,214,140,${0.55 + flash * 0.3})`;
        for (const [wx, wy] of bd.win) c.fillRect(bd.x + wx, 1100 - bd.h + wy, 7, 10);
      }
      c.fillStyle = "#080a1a"; c.fillRect(0, 1100, W, 200);
    },
  };
};

/* ---------------- floating hearts ---------------- */

const heartsScene = (): Scene => {
  const r = rng(606);
  const cols = ["#ff5c7a", "#ff8fa8", "#ffffff", "#e03a5c", "#ffc2d1"];
  const hs = Array.from({ length: 46 }, () => ({ x: r() * W, start: 1350 + r() * 900, sp: 140 + r() * 140, s: 18 + r() * 34, ph: r() * 6.28, col: cols[Math.floor(r() * cols.length)] }));
  return {
    ink: "#6a1f33", scrim: "255,240,244", accent: "#ff5c7a",
    draw(c, t) {
      sky(c, [[0, "#ff8fab"], [0.55, "#ffc9d6"], [1, "#fff1f4"]]);
      for (const h of hs) {
        const y = h.start - h.sp * t;
        if (y < -60 || y > 1400) continue;
        c.save();
        c.globalAlpha = 0.85 * clamp((y + 60) / 400);
        c.translate(h.x + Math.sin(t * 1.4 + h.ph) * 26, y);
        c.rotate(Math.sin(t * 1.2 + h.ph) * 0.3);
        heartPath(c, 0, 0, h.s);
        c.fillStyle = h.col; c.fill();
        c.restore();
      }
      const grow = ease.outBack(seg(t, 0.3, 1.5));
      const beatPh = (t * 1.25) % 1;
      const beat = Math.exp(-((beatPh - 0.1) ** 2) / 0.004) * 0.08 + Math.exp(-((beatPh - 0.3) ** 2) / 0.004) * 0.05;
      const s = 300 * grow * (1 + beat);
      if (s > 1) {
        glow(c, 360, 540, s * 1.2, "rgba(255,90,120,.8)", 0.6);
        heartPath(c, 360, 560, s);
        const g = c.createRadialGradient(300, 470, 10, 360, 560, s);
        g.addColorStop(0, "#ff8fa6"); g.addColorStop(0.6, "#ef3b62"); g.addColorStop(1, "#b81d45");
        c.fillStyle = g; c.fill();
        c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 8; c.lineCap = "round";
        c.beginPath(); c.arc(360 - s * 0.3, 560 - s * 0.25, s * 0.18, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
      }
      for (let i = 0; i < 8; i++) { const k = (t * 0.5 + i / 8) % 1; sparkle(c, 360 + Math.cos(i * 0.8) * 230, 540 + Math.sin(i * 1.3) * 200, 10, "#fff", Math.sin(k * Math.PI)); }
    },
  };
};

/* ---------------- butterfly release ---------------- */

function butterfly(c: Ctx, x: number, y: number, s: number, flap: number, rot: number, c1: string, c2: string) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (const side of [-1, 1]) {
    c.save(); c.scale(side * (0.25 + 0.75 * Math.abs(flap)), 1);
    c.fillStyle = c1;
    c.beginPath(); c.moveTo(0, -2); c.bezierCurveTo(14, -36, 46, -34, 40, -8); c.bezierCurveTo(36, 4, 14, 4, 0, 2); c.fill();
    c.fillStyle = c2;
    c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(16, 6, 36, 14, 26, 32); c.bezierCurveTo(16, 40, 6, 22, 0, 6); c.fill();
    c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(30, -16, 4, 0, Math.PI * 2); c.arc(18, 20, 3, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  c.fillStyle = "#2b2420"; c.beginPath(); c.ellipse(0, 2, 3, 16, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#2b2420"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-1, -12); c.quadraticCurveTo(-6, -24, -10, -26); c.moveTo(1, -12); c.quadraticCurveTo(6, -24, 10, -26); c.stroke();
  c.restore();
}

const butterfliesScene = (): Scene => {
  const r = rng(707);
  const pairs: [string, string][] = [["#f28c28", "#d9611c"], ["#6aa8e8", "#3f7fc9"], ["#f3a6c8", "#e07aa8"], ["#f6d04d", "#e9a92a"], ["#b79be6", "#8f74cf"]];
  const bs = Array.from({ length: 15 }, (_, i) => ({ x0: 330 + r() * 60, y0: 1010 + r() * 40, t0: 0.9 + i * 0.12, drift: (r() - 0.5) * 120, wan: 50 + r() * 80, ph: r() * 6.28, s: 0.7 + r() * 0.5, col: pairs[i % pairs.length] }));
  const flowers = Array.from({ length: 26 }, () => ({ x: r() * W, y: 1050 + r() * 200, col: ["#ffffff", "#f6d04d", "#f3a6c8", "#b79be6"][Math.floor(r() * 4)], s: 8 + r() * 8 }));
  return {
    ink: "#2f4a3a", scrim: "246,252,246", accent: "#f28c28",
    draw(c, t) {
      sky(c, [[0, "#a9dcf7"], [0.7, "#effaff"], [1, "#e6f5e6"]]);
      glow(c, 560, 200, 200, "rgba(255,248,215,.9)");
      cloud(c, 160 + t * 8, 260, 1.2, "#fff", 0.85);
      c.fillStyle = "#a9cf8f"; c.beginPath(); c.moveTo(0, 1030); c.bezierCurveTo(240, 990, 480, 1060, 720, 1010); c.lineTo(720, 1280); c.lineTo(0, 1280); c.fill();
      for (const f of flowers) { c.fillStyle = f.col; for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.28; c.beginPath(); c.arc(f.x + Math.cos(a) * f.s * 0.6, f.y + Math.sin(a) * f.s * 0.6, f.s * 0.5, 0, 6.28); c.fill(); } c.fillStyle = "#e9a92a"; c.beginPath(); c.arc(f.x, f.y, f.s * 0.35, 0, 6.28); c.fill(); }
      for (const b of bs) {
        const dt = t - b.t0;
        const x = dt <= 0 ? b.x0 : b.x0 + b.drift * dt + Math.sin(dt * 1.3 + b.ph) * b.wan * Math.min(1, dt);
        const y = dt <= 0 ? b.y0 : b.y0 - 85 * dt - Math.sin(dt * 3 + b.ph) * 22;
        butterfly(c, x, y, b.s, dt <= 0 ? 0.3 : Math.sin(t * 13 + b.ph), Math.sin(dt * 1.3 + b.ph) * 0.35, b.col[0], b.col[1]);
      }
      // glass jar
      c.fillStyle = "rgba(220,240,255,.35)"; c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 3;
      c.beginPath(); c.moveTo(300, 960); c.lineTo(420, 960); c.quadraticCurveTo(440, 960, 440, 990); c.lineTo(440, 1080); c.quadraticCurveTo(440, 1110, 410, 1110); c.lineTo(310, 1110); c.quadraticCurveTo(280, 1110, 280, 1080); c.lineTo(280, 990); c.quadraticCurveTo(280, 960, 300, 960); c.fill(); c.stroke();
      c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(292, 990, 8, 90);
      const lt = seg(t, 0.75, 2.2);
      c.save(); c.translate(360 + 260 * lt, 950 - 420 * lt + 600 * lt * lt); c.rotate(lt * 5);
      c.fillStyle = "#c9a24a"; c.fillRect(-66, -14, 132, 26); c.fillStyle = "#e6c26a"; c.fillRect(-66, -14, 132, 8);
      c.restore();
    },
  };
};

/* ---------------- rose petals → heart ---------------- */

const petalsScene = (): Scene => {
  const r = rng(808);
  const ps = Array.from({ length: 110 }, () => {
    const a = r() * Math.PI * 2, k = Math.sqrt(0.15 + r() * 0.85);
    const hx = 16 * Math.sin(a) ** 3, hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    return { x: r() * W, y0: -60 - r() * 900, sp: 150 + r() * 120, ph: r() * 6.28, tx: 360 + hx * 15 * k, ty: 560 + hy * 15 * k, d: r(), col: r() < 0.7 ? ["#7a0c20", "#e0314f"] : ["#d97a8a", "#ffd0d8"], s: 0.8 + r() * 0.6 };
  });
  return {
    ink: "#5a2230", scrim: "255,244,240", accent: "#d06b7a",
    draw(c, t) {
      sky(c, [[0, "#fde3df"], [0.6, "#fff4ee"], [1, "#fffaf6"]]);
      for (let i = 0; i < 14; i++) glow(c, (i * 173) % W, (i * 241) % 900, 70, "rgba(255,200,190,1)", 0.25);
      const form = (p: (typeof ps)[number]) => ease.inOut(seg(t, 2.5 + p.d * 0.8, 5.2 + p.d * 0.6));
      if (t > 4.6) glow(c, 360, 540, 330, "rgba(255,140,160,.7)", 0.5 * seg(t, 4.6, 6));
      for (const p of ps) {
        const fy = p.y0 + p.sp * t, fx = p.x + Math.sin(t * 1.6 + p.ph) * 40;
        const k = form(p);
        const x = lerp(fx, p.tx, k), y = lerp(fy, p.ty, k);
        if (y < -40 && k === 0) continue;
        c.save();
        c.translate(x, y);
        c.rotate(lerp(t * 1.4 + p.ph, p.ph, k));
        c.scale(p.s, p.s * lerp(Math.cos(t * 2.4 + p.ph), 1, k));
        petal(c, 28, 20, p.col[0], p.col[1]);
        c.restore();
      }
    },
  };
};

export const SCENES1 = { balloons: balloonsScene, roses: rosesScene, doves: dovesScene, lanterns: lanternsScene, fireworks: fireworksScene, hearts: heartsScene, butterflies: butterfliesScene, petals: petalsScene };
export { petal, dove, butterfly, balloon };
