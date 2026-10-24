// Halloween action scenes: pumpkin choir, skeleton disco, under the bed, broom donuts, graveyard rave, vampire selfie.
// The greeting fades in over the bottom of the card at 3.3 s, so the action stays in the top two-thirds.
import { H, W, clamp, ease, glow, lerp, rng, seg, sky, sparkle, stars, type Ctx } from "./engine";
import type { Scene } from "./scenes1";
import type { HalloweenId } from "./halloweenText";
import { drawShow, type DragonShow } from "./dragon";

const TAU = Math.PI * 2;
const frac = (x: number) => x - Math.floor(x);

function ell(c: Ctx, x: number, y: number, rx: number, ry: number, fill: string, rot = 0) {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU);
  c.fill();
}
function dot(c: Ctx, x: number, y: number, r: number, fill: string) { ell(c, x, y, r, r, fill); }
function rrect(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) {
  c.fillStyle = fill;
  c.beginPath();
  const rr = Math.min(r, w / 2, h / 2);
  c.moveTo(x + rr, y);
  c.arcTo(x + w, y, x + w, y + h, rr);
  c.arcTo(x + w, y + h, x, y + h, rr);
  c.arcTo(x, y + h, x, y, rr);
  c.arcTo(x, y, x + w, y, rr);
  c.closePath();
  c.fill();
}

/* ---------------- pumpkin choir ---------------- */

const PUMPKIN_BPM = 72;

function pumpkin(c: Ctx, x: number, y: number, r: number, lit: number, open: number, t: number, i: number) {
  ell(c, x, y, r * 1.12, r * 0.92, "#d9590c");
  ell(c, x - r * 0.45, y, r * 0.5, r * 0.9, "#ea7019");
  ell(c, x + r * 0.45, y, r * 0.5, r * 0.9, "#ea7019");
  ell(c, x, y, r * 0.45, r * 0.92, "#f7862a");
  rrect(c, x - r * 0.08, y - r * 1.08, r * 0.16, r * 0.3, 4, "#3e7a2a");
  const eye = lit > 0 ? `rgba(255,224,102,${0.35 + 0.65 * lit})` : "#3a1a05";
  if (lit > 0) glow(c, x, y - r * 0.1, r * 1.3, "rgba(255,200,80,0.35)", lit * (0.75 + 0.25 * Math.sin(t * 9 + i)));
  c.fillStyle = eye;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(x + s * r * 0.45, y - r * 0.45);
    c.lineTo(x + s * r * 0.2, y - r * 0.1);
    c.lineTo(x + s * r * 0.7, y - r * 0.1);
    c.fill();
  }
  ell(c, x, y + r * 0.35, r * 0.42, r * (0.08 + 0.38 * open), eye);
  ell(c, x, y + r * 0.35, r * 0.32, r * (0.02 + 0.3 * open), "#5a1d00");
}

const pumpkinsScene = (): Scene => ({
  ink: "#fff3e0", scrim: "22,8,34", accent: "#ff9a3c",
  draw(c, t) {
    sky(c, [[0, "#140726"], [0.55, "#3a1450"], [1, "#25081f"]]);
    stars(c, 31, 90, 640, t, 2.2);
    glow(c, 560, 250, 260, "rgba(255,240,200,0.35)");
    dot(c, 560, 250, 82, "#fff1c9");
    dot(c, 530, 230, 14, "rgba(220,200,150,.45)");
    dot(c, 585, 280, 10, "rgba(220,200,150,.4)");
    // fence
    c.fillStyle = "#12061d";
    for (let i = 0; i < 13; i++) {
      const x = i * 60 - 10;
      c.beginPath(); c.moveTo(x, 760); c.lineTo(x, 590); c.lineTo(x + 17, 565); c.lineTo(x + 34, 590); c.lineTo(x + 34, 760); c.fill();
    }
    c.fillRect(0, 620, W, 12); c.fillRect(0, 700, W, 12);
    ell(c, 360, 1300, 640, 540, "#1d0c12");
    const xs = [100, 228, 360, 492, 620], rs = [60, 70, 88, 70, 56];
    const singing = t >= 1.6;
    const b = t * (PUMPKIN_BPM / 60);
    for (let i = 0; i < 5; i++) {
      const lit = ease.out(seg(t, 0.3 + i * 0.24, 0.55 + i * 0.24));
      const lead = i === 2;
      const open = !singing ? 0 : lead ? Math.exp(-frac(b * 2) * 3.5) : Math.pow(Math.max(0, Math.sin(Math.PI * frac(b / 2 + i * 0.21))), 2);
      const r = rs[i];
      const y = 800 - r * 0.6 - Math.abs(Math.sin(b * Math.PI)) * 6 * open;
      pumpkin(c, xs[i], y, r, lit, open, t, i);
    }
    if (singing) {
      c.fillStyle = "#ffe9b0";
      c.font = "48px serif";
      c.textAlign = "center";
      for (let k = 0; k < 4; k++) {
        const f = frac(b / 2 + k / 4);
        c.globalAlpha = (1 - f) * clamp((t - 1.6) * 2);
        c.fillText(k % 2 ? "♪" : "♫", 360 + Math.sin(f * 6 + k) * 80, 640 - f * 380);
      }
      c.globalAlpha = 1;
    }
  },
});

/* ---------------- skeleton disco ---------------- */

const DISCO_BPM = 118;

function skeleton(c: Ctx, x: number, base: number, Hs: number, b: number, phase: number) {
  const bounce = Math.abs(Math.sin(b * Math.PI)) * Hs * 0.05;
  const y0 = base - Hs + bounce;
  const swing = Math.sin(b * Math.PI + phase);
  const point = Math.floor(b / 4 + phase) % 2 === 0;
  c.strokeStyle = "#fbfaf3"; c.lineCap = "round"; c.lineJoin = "round";
  const hip = { x: x + swing * Hs * 0.04, y: y0 + Hs * 0.58 }, neck = { x, y: y0 + Hs * 0.2 };
  c.lineWidth = 9; c.beginPath(); c.moveTo(neck.x, neck.y); c.lineTo(hip.x, hip.y); c.stroke();
  c.lineWidth = 6;
  for (let i = 0; i < 4; i++) {
    const ry = neck.y + Hs * (0.06 + i * 0.07), rw = Hs * (0.13 - i * 0.015);
    c.beginPath(); c.ellipse(x + swing * Hs * 0.01 * i, ry, rw, Hs * 0.02, 0, Math.PI * 1.05, Math.PI * 1.95, true); c.stroke();
  }
  ell(c, hip.x, hip.y, Hs * 0.09, Hs * 0.04, "#fbfaf3");
  c.lineWidth = 9;
  for (const side of [-1, 1]) {
    const k = Math.sin(b * Math.PI * 2 + phase + (side > 0 ? Math.PI : 0));
    const knee = { x: hip.x + side * Hs * 0.09 + k * Hs * 0.05, y: hip.y + Hs * 0.2 - Math.max(0, k) * Hs * 0.05 };
    const foot = { x: hip.x + side * Hs * 0.12, y: base };
    c.beginPath(); c.moveTo(hip.x + side * Hs * 0.05, hip.y); c.lineTo(knee.x, knee.y); c.lineTo(foot.x, foot.y); c.lineTo(foot.x + side * Hs * 0.06, foot.y); c.stroke();
  }
  for (const side of [-1, 1]) {
    const sh = { x: neck.x + side * Hs * 0.12, y: neck.y + Hs * 0.04 };
    let ang = side > 0 ? -0.6 + swing * 0.9 : Math.PI + 0.6 - swing * 0.9;
    if (point && side > 0) ang = -1.25 + Math.sin(b * Math.PI * 2) * 0.1;
    const el = { x: sh.x + Math.cos(ang) * Hs * 0.16, y: sh.y + Math.sin(ang) * Hs * 0.16 };
    const ang2 = ang + (side > 0 ? -0.5 : 0.5) * Math.sin(b * Math.PI + phase);
    const hand = { x: el.x + Math.cos(ang2) * Hs * 0.15, y: el.y + Math.sin(ang2) * Hs * 0.15 };
    c.beginPath(); c.moveTo(neck.x, neck.y + Hs * 0.03); c.lineTo(sh.x, sh.y); c.lineTo(el.x, el.y); c.lineTo(hand.x, hand.y); c.stroke();
  }
  const sx = x + swing * Hs * 0.03, sy = y0 + Hs * 0.08;
  ell(c, sx, sy, Hs * 0.1, Hs * 0.11, "#fbfaf3");
  rrect(c, sx - Hs * 0.06, sy + Hs * 0.05, Hs * 0.12, Hs * 0.07, 6, "#fbfaf3");
  ell(c, sx - Hs * 0.04, sy, Hs * 0.028, Hs * 0.034, "#14061f");
  ell(c, sx + Hs * 0.04, sy, Hs * 0.028, Hs * 0.034, "#14061f");
  c.fillStyle = "#14061f";
  c.beginPath(); c.moveTo(sx, sy + Hs * 0.03); c.lineTo(sx - Hs * 0.012, sy + Hs * 0.055); c.lineTo(sx + Hs * 0.012, sy + Hs * 0.055); c.fill();
  c.lineWidth = 3; c.strokeStyle = "#14061f";
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(sx + i * Hs * 0.02, sy + Hs * 0.075); c.lineTo(sx + i * Hs * 0.02, sy + Hs * 0.115); c.stroke(); }
}

const skeletonsScene = (): Scene => {
  const cols = ["#ff3fb4", "#3ff2ff", "#ffe23f", "#9b5bff"];
  const r = rng(707);
  const spots = Array.from({ length: 22 }, () => ({ rad: 0.25 + r() * 0.5, size: 14 + r() * 24, ph: r() * 6.28 }));
  const tiles = Array.from({ length: 64 }, () => r());
  return {
    ink: "#ffffff", scrim: "12,2,32", accent: "#ff5fc6",
    draw(c, t) {
      c.fillStyle = "#0c0220"; c.fillRect(0, 0, W, H);
      const b = t * (DISCO_BPM / 60);
      const on = ease.out(seg(t, 0.95, 1.15));
      spots.forEach((s, i) => {
        const a = t * 0.6 + i * 1.7;
        c.globalAlpha = on * (0.25 + 0.2 * Math.sin(b * Math.PI + i));
        dot(c, 360 + Math.cos(a) * s.rad * W, 420 + Math.sin(a * 1.3) * 300, s.size, cols[i % 4]);
      });
      c.globalAlpha = 1;
      // the disco ball drops in
      const by = lerp(-120, 220, ease.outBack(seg(t, 0, 0.9))), br = 66;
      c.strokeStyle = "#8a8aa0"; c.lineWidth = 3; c.beginPath(); c.moveTo(360, 0); c.lineTo(360, by - br); c.stroke();
      dot(c, 360, by, br, "#c9c9d9");
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        const px = 360 + i * br * 0.28, py = by + j * br * 0.28;
        if ((px - 360) ** 2 + (py - by) ** 2 > br * br * 0.85) continue;
        const lit = on > 0 && frac(Math.sin((i * 7 + j * 13 + Math.floor(t * 6)) * 12.9898) * 43758.5) > 0.6;
        c.fillStyle = lit ? "#ffffff" : (i + j) % 2 ? "#a7a7c4" : "#e3e3f0";
        c.fillRect(px - br * 0.12, py - br * 0.12, br * 0.24, br * 0.24);
      }
      if (on > 0) glow(c, 360, by, 200, "rgba(255,255,255,0.35)", on * (0.6 + 0.4 * Math.exp(-frac(b) * 5)));
      // light-up floor
      const fy = 640, rows = 4, nc = 6;
      for (let rr = 0; rr < rows; rr++) {
        const y1 = fy + (H - fy) * (rr / rows) ** 1.3, y2 = fy + (H - fy) * ((rr + 1) / rows) ** 1.3;
        const sp1 = 0.55 + 0.45 * (rr / rows), sp2 = 0.55 + 0.45 * ((rr + 1) / rows);
        for (let k = 0; k < nc; k++) {
          const xa = 360 + (k / nc - 0.5) * W * sp1 * 1.4, xb = 360 + ((k + 1) / nc - 0.5) * W * sp1 * 1.4;
          const xc = 360 + ((k + 1) / nc - 0.5) * W * sp2 * 1.4, xd = 360 + (k / nc - 0.5) * W * sp2 * 1.4;
          const lit = on > 0 && frac(tiles[(rr * nc + k) % 64] + Math.floor(b) * 0.37) > 0.45;
          c.fillStyle = lit ? cols[(rr + k + Math.floor(b)) % 4] : "#1d0f33";
          c.globalAlpha = lit ? 0.75 * on : 1;
          c.beginPath(); c.moveTo(xa, y1); c.lineTo(xb, y1); c.lineTo(xc, y2); c.lineTo(xd, y2); c.closePath(); c.fill();
          c.globalAlpha = 1;
        }
      }
      // skeletons pop up from below as the lights come on
      const rise = (k: number) => (t < 1.0 + k * 0.15 ? 1 : 1 - ease.outBack(seg(t, 1.0 + k * 0.15, 1.7 + k * 0.15))) * 900;
      skeleton(c, 180, 880 + rise(0), 300, b, 0);
      skeleton(c, 540, 880 + rise(2), 300, b, 2.8);
      skeleton(c, 360, 910 + rise(1), 360, b, 1.4);
    },
  };
};

/* ---------------- under the bed ---------------- */

function monster(c: Ctx, x: number, y: number, r: number, look: number, wave: number) {
  c.fillStyle = "#5ee26b";
  c.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = Math.PI + (i / 40) * Math.PI, rr = r * (1 + (i % 2 ? 0.07 : 0));
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9);
  }
  c.lineTo(x + r, y + r * 0.5); c.lineTo(x - r, y + r * 0.5); c.closePath(); c.fill();
  c.fillStyle = "#f2e9c9";
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.55, y - r * 0.7); c.lineTo(x + s * r * 0.8, y - r * 1.25); c.lineTo(x + s * r * 0.35, y - r * 0.82); c.fill(); }
  for (const s of [-1, 1]) { dot(c, x + s * r * 0.35, y - r * 0.35, r * 0.24, "#ffffff"); dot(c, x + s * r * 0.35 + look * r * 0.1, y - r * 0.33, r * 0.11, "#1a0b2e"); }
  c.strokeStyle = "#1a0b2e"; c.lineWidth = 6; c.beginPath(); c.arc(x, y - r * 0.05, r * 0.32, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  c.fillStyle = "#ffffff";
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.14, y + r * 0.22); c.lineTo(x + s * r * 0.2, y + r * 0.36); c.lineTo(x + s * r * 0.26, y + r * 0.2); c.fill(); }
  // the sign comes up and waves
  c.save();
  c.translate(x + r * 0.95, y - r * 0.2 - wave * r * 0.5);
  c.rotate(0.12 + Math.sin(wave * 12) * 0.12 * wave);
  rrect(c, -r * 0.05, -r * 0.5, r * 1.15, r * 0.55, 8, "#f6e7c1");
  c.fillStyle = "#7a1fa2"; c.font = `700 ${r * 0.36}px sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("BOO!", r * 0.52, -r * 0.22);
  c.fillStyle = "#8b5a2b"; c.fillRect(r * 0.45, 0, r * 0.12, r * 0.6);
  c.restore();
}

const monsterScene = (): Scene => ({
  ink: "#f3ffe8", scrim: "10,8,18", accent: "#a6ef5a",
  draw(c, t) {
    c.fillStyle = "#0a0812"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#141024"; c.fillRect(0, 0, W, 760);
    rrect(c, 430, 140, 210, 200, 10, "#2a3560");
    dot(c, 510, 210, 36, "#fff1c9");
    c.fillStyle = "#0a0812"; c.fillRect(532, 140, 8, 200); c.fillRect(430, 236, 210, 8);
    // bed
    rrect(c, 40, 470, 60, 340, 6, "#3b2340");
    rrect(c, 60, 560, 620, 64, 14, "#e9e1f2");
    const bg = c.createLinearGradient(0, 560, 0, 720);
    bg.addColorStop(0, "#7b3fb0"); bg.addColorStop(1, "#4a1f73");
    c.fillStyle = bg;
    c.beginPath(); c.moveTo(200, 570);
    for (let i = 0; i <= 10; i++) c.lineTo(200 + i * 49, 572 + 6 * Math.sin(i + t * 0.8));
    c.lineTo(690, 700);
    for (let i = 10; i >= 0; i--) c.lineTo(200 + i * 49, 690 + 12 * Math.sin(i * 1.7));
    c.closePath(); c.fill();
    rrect(c, 80, 540, 120, 56, 18, "#f6f0ff");
    c.fillStyle = "#2a1830"; c.fillRect(80, 624, 22, 190); c.fillRect(640, 624, 22, 190);
    c.fillStyle = "#05040a"; c.fillRect(102, 624, 538, 190);
    // eyes in the dark
    const found = seg(t, 2.4, 2.7);
    [[170, 690], [270, 760], [470, 700], [580, 770]].forEach(([ex, ey], i) => {
      if (frac(t * 0.35 + i * 0.37) < 0.05 || found >= 1) return;
      for (const s of [-1, 1]) ell(c, ex + s * 16, ey, 9, 7, `rgba(255,224,102,${1 - found})`);
    });
    // flashlight sweeps, finds the monster, then holds on it
    const bx = t < 1.3 ? lerp(140, 610, ease.inOut(seg(t, 0, 1.3))) : t < 2.6 ? lerp(610, 360, ease.out(seg(t, 1.3, 2.6))) : 360 + Math.sin((t - 2.6) * 1.4) * 22;
    const by = 730;
    c.save();
    c.globalAlpha = 0.18; c.fillStyle = "#fff6c4";
    c.beginPath(); c.moveTo(360, H); c.lineTo(bx - 130, by); c.lineTo(bx + 130, by); c.closePath(); c.fill();
    c.globalAlpha = 1;
    c.beginPath(); c.ellipse(bx, by, 130, 90, 0, 0, TAU); c.clip();
    c.fillStyle = "#4a3a2c"; c.fillRect(0, 624, W, 200);
    c.fillStyle = "#5a4634"; for (let i = 0; i < 9; i++) c.fillRect(0, 630 + i * 22, W, 2);
    const wave = ease.outBack(seg(t, 2.7, 3.2));
    monster(c, 340, 780, 74, clamp((bx - 340) / 140, -1, 1), wave);
    glow(c, bx, by, 130, "rgba(255,246,196,0.25)");
    c.restore();
    // hand and flashlight
    c.save();
    c.translate(360, 1250);
    c.rotate(Math.atan2(by - 1250, bx - 360) + Math.PI / 2);
    rrect(c, -16, -100, 32, 96, 6, "#3a3a48");
    rrect(c, -20, -114, 40, 18, 4, "#ffe066");
    c.restore();
    ell(c, 360, 1262, 40, 26, "#e0a982");
  },
});

/* ---------------- broom donuts ---------------- */

function witch(c: Ctx, x: number, y: number, dir: number, t: number) {
  c.save();
  c.translate(x, y); c.scale(dir * 2.2, 2.2); c.rotate(Math.sin(t * 3) * 0.08);
  c.strokeStyle = "#6b3d1f"; c.lineWidth = 4; c.beginPath(); c.moveTo(-34, 4); c.lineTo(30, -2); c.stroke();
  c.fillStyle = "#c8962e"; c.beginPath(); c.moveTo(-30, 4); c.lineTo(-52, -6); c.lineTo(-56, 6); c.lineTo(-52, 16); c.closePath(); c.fill();
  c.fillStyle = "#120820";
  c.beginPath(); c.moveTo(-12, 2); c.lineTo(8, 2); c.lineTo(2, -26); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-6, -14); c.quadraticCurveTo(-30, -20 + Math.sin(t * 8) * 4, -40, -6 + Math.sin(t * 8) * 3); c.lineTo(-8, -4); c.fill();
  dot(c, 2, -30, 6, "#8bd16a");
  c.fillStyle = "#120820";
  c.beginPath(); c.moveTo(-12, -32); c.lineTo(16, -32); c.lineTo(10, -36); c.lineTo(-4, -56); c.lineTo(-6, -36); c.closePath(); c.fill();
  c.restore();
}

const witchScene = (): Scene => {
  const path = (tt: number) => ({ x: 360 + 320 * Math.sin(1.15 * tt - 1.5), y: 430 + 170 * Math.sin(2.3 * tt) });
  return {
    ink: "#fff4dc", scrim: "24,8,36", accent: "#ffd36b",
    draw(c, t) {
      sky(c, [[0, "#08223a"], [0.6, "#3a1550"], [0.85, "#c2541b"], [1, "#ff7a1a"]]);
      stars(c, 55, 110, 760, t, 2.2);
      glow(c, 360, 430, 420, "rgba(255,230,160,0.35)");
      dot(c, 360, 430, 200, "#ffe6a6");
      ell(c, 300, 380, 34, 26, "rgba(200,170,110,.35)");
      ell(c, 420, 500, 44, 30, "rgba(200,170,110,.3)");
      // sparkle trail: the path sampled back in time
      for (let k = 46; k >= 1; k--) {
        const tt = t - k * 0.03;
        if (tt < 0) continue;
        const q = path(tt), f = 1 - k / 46;
        sparkle(c, q.x + Math.sin(k * 3.1) * 10, q.y + Math.cos(k * 2.3) * 10, 3 + f * 10, `hsl(${(t * 80 + k * 9) % 360} 95% 70%)`, f * 0.9);
      }
      const now = path(t), prev = path(t - 0.02);
      witch(c, now.x, now.y, now.x >= prev.x ? 1 : -1, t);
      // rooftops
      const roofs: [number, number, number][] = [[0, 840, 150], [130, 800, 140], [250, 860, 120], [360, 790, 150], [500, 830, 120], [600, 800, 140]];
      roofs.forEach(([x, y, w], i) => {
        c.fillStyle = "#0d0614";
        c.beginPath(); c.moveTo(x, H); c.lineTo(x, y); c.lineTo(x + w / 2, y - 70); c.lineTo(x + w, y); c.lineTo(x + w, H); c.fill();
        const on = frac(Math.sin((i + Math.floor(t * 0.7)) * 91.7) * 4375.5) > 0.3;
        rrect(c, x + w / 2 - 12, y + 30, 24, 28, 3, on ? "#ffcc4d" : "#2a1838");
      });
    },
  };
};

/* ---------------- graveyard rave ---------------- */

const RAVE_BPM = 128;
/** The beat drops at beat 2 (0.94 s). */
const DROP = 120 / RAVE_BPM;

function ghost(c: Ctx, x: number, y: number, r: number, b: number, phase: number, color: string, on: number) {
  const yb = y + Math.sin(b * Math.PI + phase) * r * 0.25;
  c.fillStyle = "rgba(245,248,255,.93)";
  c.beginPath(); c.arc(x, yb, r, Math.PI, 0);
  for (let i = 0; i <= 6; i++) {
    const xx = x + r - (i / 6) * 2 * r;
    c.lineTo(xx, yb + r * 1.2 + (i % 2 ? -r * 0.2 : 0) + Math.sin(b * Math.PI * 2 + i) * r * 0.06);
  }
  c.closePath(); c.fill();
  ell(c, x - r * 0.35, yb - r * 0.1, r * 0.14, r * 0.2, "#120a1f");
  ell(c, x + r * 0.35, yb - r * 0.1, r * 0.14, r * 0.2, "#120a1f");
  ell(c, x, yb + r * 0.3, r * 0.16, r * 0.2 * (0.5 + 0.5 * Math.abs(Math.sin(b * Math.PI))), "#120a1f");
  if (on <= 0) return;
  const up = Math.abs(Math.sin(b * Math.PI / 2 + phase));
  c.save();
  c.globalAlpha = on;
  c.shadowColor = color; c.shadowBlur = 24; c.strokeStyle = color; c.lineWidth = 10; c.lineCap = "round";
  for (const s of [-1, 1]) {
    const hx = x + s * r * 1.1, hy = yb + r * 0.2 - up * r * 0.9;
    c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + s * r * 0.25, hy - r * 0.55); c.stroke();
  }
  c.restore();
}

const graveyardScene = (): Scene => {
  const lc = ["#3ff2ff", "#ff3fb4", "#a6ef5a"];
  return {
    ink: "#e9fbff", scrim: "5,9,18", accent: "#3ff2ff",
    draw(c, t) {
      c.fillStyle = "#050912"; c.fillRect(0, 0, W, H);
      const b = t * (RAVE_BPM / 60);
      const dropped = t >= DROP;
      const kick = dropped ? Math.exp(-frac(b) * 6) : 0;
      glow(c, 560, 180, 160, "rgba(220,230,255,0.25)");
      dot(c, 560, 180, 56, "#e8ecff");
      if (dropped) {
        c.lineCap = "round";
        for (let i = 0; i < 6; i++) {
          const from = i % 2 ? W : 0, a = (i % 2 ? Math.PI - 0.35 : 0.35) + Math.sin(t * (0.7 + i * 0.13) + i) * 0.5;
          c.strokeStyle = lc[i % 3]; c.globalAlpha = 0.35 + 0.4 * kick; c.lineWidth = 5;
          c.beginPath(); c.moveTo(from, 60); c.lineTo(from + Math.cos(a) * 1600, 60 + Math.sin(a) * 1600); c.stroke();
        }
        c.globalAlpha = 1;
      }
      for (let i = 0; i < 5; i++) { c.globalAlpha = 0.08; ell(c, frac(t * 0.03 + i * 0.23) * W * 1.4 - W * 0.2, 840 + i * 30, 290, 46, "#c9d6ff"); }
      c.globalAlpha = 1;
      // ghosts rise out of the graves on the drop
      const rise = (k: number) => (t < DROP + k * 0.12 ? 1 : 1 - ease.outBack(seg(t, DROP + k * 0.12, DROP + 0.7 + k * 0.12))) * 640;
      const on = seg(t, DROP, DROP + 0.3);
      ghost(c, 180 + Math.sin(t * 0.5) * 30, 470 + rise(0), 62, b, 0, "#ff3fb4", on);
      ghost(c, 360, 380 + rise(1), 74, b, 1.2, "#a6ef5a", on);
      ghost(c, 545 + Math.sin(t * 0.4 + 2) * 30, 480 + rise(2), 62, b, 2.4, "#3ff2ff", on);
      c.fillStyle = "#0e1a14"; c.fillRect(0, 860, W, H - 860);
      [100, 270, 450, 620].forEach((x) => {
        const tw = 140, th = 230, tx = x - tw / 2, ty = 880 - th;
        c.fillStyle = "#5b6170";
        c.beginPath(); c.moveTo(tx, 890); c.lineTo(tx, ty + tw / 2); c.arc(tx + tw / 2, ty + tw / 2, tw / 2, Math.PI, 0); c.lineTo(tx + tw, 890); c.fill();
        c.fillStyle = "#3d424e"; c.font = "700 22px sans-serif"; c.textAlign = "center"; c.fillText("R.I.P.", x, ty + 60);
        const sr = 38 * (1 + 0.18 * kick);
        dot(c, x, ty + 140, sr, "#1a1d24"); dot(c, x, ty + 140, sr * 0.45, "#555b68"); dot(c, x, ty + 140, sr * 0.15, "#1a1d24");
      });
      if (dropped && t - DROP < 0.12) { c.globalAlpha = 0.6 * (1 - (t - DROP) / 0.12); c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    },
  };
};

/* ---------------- vampire selfie ---------------- */

const FLASHES = [1.6, 4.6];

const vampireScene = (): Scene => ({
  ink: "#ffe9ee", scrim: "26,12,20", accent: "#ff5f6d",
  draw(c, t) {
    c.fillStyle = "#2b1d2e"; c.fillRect(0, 0, W, H);
    c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 2;
    for (let y = 0, row = 0; y < 900; y += 44, row++) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
      for (let x = row % 2 ? 0 : 48; x < W; x += 96) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 44); c.stroke(); }
    }
    c.fillStyle = "#1a0f12"; c.fillRect(0, 900, W, H - 900);
    for (const sd of [0, 1]) {
      const x0 = sd ? W - 54 : 0;
      c.fillStyle = "#7a0f22"; c.fillRect(x0, 0, 54, 920);
      c.fillStyle = "#5a0a18"; for (let i = 0; i < 3; i++) c.fillRect(x0 + 8 + i * 16, 0, 4, 920);
    }
    // mirror: the room and a floating phone, no vampire
    rrect(c, 412, 192, 266, 516, 26, "#c9a04a");
    rrect(c, 430, 210, 230, 480, 18, "#3a2a40");
    c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 14; c.beginPath(); c.moveTo(480, 250); c.lineTo(450, 400); c.stroke();
    const raise = ease.inOut(seg(t, 0.3, 1.1));
    if (raise > 0) rrect(c, 470, 420 - raise * 60, 30, 54, 6, "#0b0b10");
    // candles
    [[90, 820], [380, 840]].forEach(([x, y], i) => {
      rrect(c, x - 9, y, 18, 60, 4, "#f1e6cf");
      c.save(); c.shadowColor = "#ffb347"; c.shadowBlur = 30; ell(c, x, y - 14, 8, 16 + Math.sin(t * 12 + i) * 3, "#ffcf5a"); c.restore();
    });
    const vx = 230, vy = 620;
    const flash = FLASHES.reduce((m, f) => (t >= f ? Math.max(m, Math.exp(-(t - f) * 7)) : m), 0);
    const shock = clamp(FLASHES.reduce((m, f) => (t >= f && t < f + 1.2 ? 1 : m), 0));
    // cape and body
    c.fillStyle = "#b3122e"; c.beginPath(); c.moveTo(vx - 150, 920); c.lineTo(vx - 46, vy - 100); c.lineTo(vx + 46, vy - 100); c.lineTo(vx + 150, 920); c.fill();
    c.fillStyle = "#120a12"; c.beginPath(); c.moveTo(vx - 124, 920); c.lineTo(vx - 38, vy - 90); c.lineTo(vx + 38, vy - 90); c.lineTo(vx + 124, 920); c.fill();
    c.beginPath(); c.moveTo(vx - 80, vy - 90); c.lineTo(vx - 118, vy - 230); c.lineTo(vx - 36, vy - 128); c.fill();
    c.beginPath(); c.moveTo(vx + 80, vy - 90); c.lineTo(vx + 118, vy - 230); c.lineTo(vx + 36, vy - 128); c.fill();
    // head
    ell(c, vx, vy - 190, 48, 88, "#e8e4f0");
    c.fillStyle = "#120a12";
    c.beginPath(); c.moveTo(vx - 50, vy - 218); c.quadraticCurveTo(vx, vy - 330, vx + 50, vy - 218); c.lineTo(vx, vy - 244); c.closePath(); c.fill();
    const brow = shock * 10;
    c.strokeStyle = "#120a12"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(vx - 30, vy - 218 - brow); c.lineTo(vx - 9, vy - 205 - brow); c.stroke();
    c.beginPath(); c.moveTo(vx + 30, vy - 218 - brow); c.lineTo(vx + 9, vy - 205 - brow); c.stroke();
    dot(c, vx - 18, vy - 190, 6, "#b3122e"); dot(c, vx + 18, vy - 190, 6, "#b3122e");
    c.strokeStyle = "#7a1020"; c.lineWidth = 4;
    c.beginPath();
    if (shock > 0) c.ellipse(vx, vy - 152, 10, 12, 0, 0, TAU);
    else c.arc(vx, vy - 162, 16, 0.1 * Math.PI, 0.9 * Math.PI);
    c.stroke();
    c.fillStyle = "#ffffff";
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(vx + s * 9, vy - 150); c.lineTo(vx + s * 6, vy - 134); c.lineTo(vx + s * 3, vy - 149); c.fill(); }
    // arm raises the phone
    const ax = lerp(vx + 40, vx + 110, raise), ay = lerp(vy - 40, vy - 200, raise);
    c.strokeStyle = "#120a12"; c.lineWidth = 18; c.lineCap = "round";
    c.beginPath(); c.moveTo(vx + 40, vy - 60); c.lineTo(ax, ay); c.stroke();
    rrect(c, ax - 16, ay - 64, 32, 56, 6, "#0b0b10");
    if (flash > 0.02) { c.globalAlpha = flash * 0.85; c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    // the photo pops out: an empty room
    if (t >= FLASHES[0] + 0.2) {
      const pop = ease.outBack(seg(t, FLASHES[0] + 0.2, FLASHES[0] + 0.7));
      c.save();
      c.translate(lerp(820, 560, pop), 700);
      c.rotate(-0.1 + Math.sin(Math.max(0, t - FLASHES[1]) * 20) * 0.04 * Math.exp(-Math.max(0, t - FLASHES[1]) * 3));
      rrect(c, -110, -130, 220, 250, 6, "#f6f3ea");
      rrect(c, -92, -112, 184, 170, 4, "#3a2a40");
      c.fillStyle = "#7a0f22"; c.fillRect(-92, -112, 24, 170);
      c.fillStyle = "#2a1830"; c.font = "700 46px sans-serif"; c.textAlign = "center"; c.fillText("?!", 0, 104);
      c.restore();
    }
  },
});

/* ---------------- dragon fire ---------------- */

/** Splits a headline into at most two balanced lines (word languages only). */
export function fireLines(text: string): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return [text.trim()];
  let best = 1, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) { diff = d; best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

const dragonScene = (): Scene => {
  const shows = new Map<string, DragonShow>();
  return {
    ink: "#fff1dc", scrim: "14,4,16", accent: "#ff9a3c", textIn: 6.4, ownHeadline: true,
    draw(c, t, info) {
      const headline = info?.headline || "Happy Halloween";
      const font = info?.fontFamily || "serif";
      const key = `${headline}|${font}`;
      let show = shows.get(key);
      if (!show) {
        show = { exitAt: 6.3, fontFamily: font, breaths: [{ start: 4.35, sweep: 1.25, lines: fireLines(headline), px: 118, cy: 470 }] };
        shows.set(key, show);
      }
      drawShow(c, t, show);
    },
  };
};

export const HALLOWEEN_SCENES: Record<HalloweenId, () => Scene> = {
  dragon: dragonScene,
  pumpkins: pumpkinsScene,
  skeletons: skeletonsScene,
  monster: monsterScene,
  witch: witchScene,
  graveyard: graveyardScene,
  vampire: vampireScene,
};
