// Action scenes, part 2: confetti, champagne, candles, shooting star, first snow, sunflowers, dandelion, gift box.
import { H, W, clamp, cloud, ease, glow, heartPath, leaf, lerp, rng, seg, shade, sky, sparkle, starPath, stars, type Ctx } from "./engine";
import type { Scene } from "./scenes1";

/* ---------------- confetti pop ---------------- */

const confettiScene = (): Scene => {
  const r = rng(909);
  const cols = ["#ff5c7a", "#ffd36b", "#5fd0c0", "#8b7cff", "#ff9d5c", "#ffffff"];
  const mk = (x0: number, dir: number, t0: number) => Array.from({ length: 130 }, () => {
    const a = -Math.PI / 2 + dir * (0.35 + r() * 0.5), v = 700 + r() * 600;
    return { x0, y0: 860, t0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, spin: 4 + r() * 8, ph: r() * 6.28, col: cols[Math.floor(r() * cols.length)], w: 8 + r() * 6, h: 14 + r() * 8 };
  });
  const parts = [...mk(120, 1, 0.5), ...mk(600, -1, 1.0)];
  const PY = 900;
  const rain = Array.from({ length: 90 }, () => ({ x: r() * W, y0: -40 - r() * 700, t0: 2.2, sp: 160 + r() * 140, ph: r() * 6.28, col: cols[Math.floor(r() * cols.length)] }));
  const piece = (x: number, y: number, w: number, h: number, rot: number, flip: number, col: string) => {
    const c = ctxRef!;
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, flip); c.fillStyle = col; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  };
  let ctxRef: Ctx | null = null;
  return {
    ink: "#fff3e6", scrim: "34,18,64", accent: "#ffd36b",
    draw(c, t) {
      ctxRef = c;
      sky(c, [[0, "#2a1857"], [0.55, "#6b3aa0"], [1, "#2b1650"]]);
      for (let i = 0; i < 10; i++) glow(c, (i * 191) % W, (i * 277) % 1000, 90, "rgba(255,140,200,1)", 0.12);
      const K = 1.6, G = 900;
      for (const p of parts) {
        const dt = t - p.t0;
        if (dt < 0) continue;
        const e = (1 - Math.exp(-K * dt)) / K;
        const x = p.x0 + p.vx * e + Math.sin(dt * 3 + p.ph) * 20 * Math.min(1, dt);
        const y = p.y0 + p.vy * e + 0.5 * G * dt * dt * 0.42;
        if (y > H + 40) continue;
        piece(x, y, p.w, p.h, dt * p.spin + p.ph, Math.cos(dt * p.spin * 1.3 + p.ph), p.col);
      }
      for (const p of rain) {
        const dt = t - p.t0;
        if (dt < 0) continue;
        const y = p.y0 + p.sp * dt;
        if (y < -30 || y > H + 30) continue;
        piece(p.x + Math.sin(dt * 2 + p.ph) * 30, y, 9, 15, dt * 3 + p.ph, Math.cos(dt * 4 + p.ph), p.col);
      }
      for (const [x, dir, t0] of [[120, 1, 0.5], [600, -1, 1.0]] as [number, number, number][]) {
        const kick = Math.exp(-Math.max(0, t - t0) * 6) * (t > t0 ? 1 : 0);
        c.save(); c.translate(x, PY + kick * 18); c.rotate(dir * 0.45);
        const g = c.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, "#ffd36b"); g.addColorStop(1, "#ff8a5c");
        c.fillStyle = g; c.beginPath(); c.moveTo(-36, -70); c.lineTo(36, -70); c.lineTo(8, 70); c.lineTo(-8, 70); c.closePath(); c.fill();
        c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = 6; c.beginPath(); c.moveTo(-28, -40); c.lineTo(28, -40); c.moveTo(-18, 0); c.lineTo(18, 0); c.stroke();
        c.fillStyle = "#ff5c7a"; c.beginPath(); c.ellipse(0, -70, 36, 9, 0, 0, Math.PI * 2); c.fill();
        c.restore();
        const f = seg(t, t0, t0 + 0.5);
        if (f > 0 && f < 1) glow(c, x + dir * 60, PY - 110, 160 * f, "rgba(255,240,200,1)", 1 - f);
      }
    },
  };
};

/* ---------------- champagne toast ---------------- */

const champagneScene = (): Scene => {
  const r = rng(1010);
  const POP = 1.1;
  const spray = Array.from({ length: 160 }, () => ({ te: POP + r() * 1.8, a: -Math.PI / 2 + 0.35 + (r() - 0.5) * 0.7, v: 500 + r() * 450, s: 2 + r() * 4, gold: r() < 0.6 }));
  const bubbles = Array.from({ length: 70 }, () => ({ x: r() * W, y0: 1300 + r() * 1200, sp: 90 + r() * 120, s: 3 + r() * 8, ph: r() * 6.28 }));
  const bokeh = Array.from({ length: 22 }, () => ({ x: r() * W, y: r() * H, r: 30 + r() * 60, sp: 10 + r() * 20, a: 0.06 + r() * 0.12 }));
  const MOUTH = { x: 481, y: 455 };
  return {
    ink: "#f8e7c8", scrim: "18,12,8", accent: "#e6c26a",
    draw(c, t) {
      sky(c, [[0, "#120c08"], [0.6, "#3a2614"], [1, "#1a110a"]]);
      for (const b of bokeh) glow(c, b.x, (b.y - t * b.sp + H) % H, b.r, "rgba(255,210,130,1)", b.a);
      for (const b of bubbles) {
        const y = b.y0 - b.sp * (t - 1.2);
        if (t < 1.2 || y < -20 || y > H) continue;
        c.strokeStyle = "rgba(255,240,200,.7)"; c.lineWidth = 1.5;
        c.beginPath(); c.arc(b.x + Math.sin(t * 2 + b.ph) * 10, y, b.s, 0, Math.PI * 2); c.stroke();
      }
      const shake = t < POP ? Math.sin(t * 40) * 0.03 * seg(t, 0.2, POP) : 0;
      c.save(); c.translate(360, 820); c.rotate(0.32 + shake);
      const g = c.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, "#173a26"); g.addColorStop(0.4, "#2f6a46"); g.addColorStop(1, "#14301f");
      c.fillStyle = g;
      c.beginPath(); c.moveTo(-26, -380); c.lineTo(26, -380); c.lineTo(26, -300); c.bezierCurveTo(70, -250, 76, -210, 76, -150); c.lineTo(76, 120); c.quadraticCurveTo(76, 140, 56, 140); c.lineTo(-56, 140); c.quadraticCurveTo(-76, 140, -76, 120); c.lineTo(-76, -150); c.bezierCurveTo(-76, -210, -70, -250, -26, -300); c.closePath(); c.fill();
      c.fillStyle = "#d9b25a"; c.fillRect(-28, -390, 56, 110);
      c.fillStyle = "#f4ecd8"; c.fillRect(-66, -100, 132, 110); c.fillStyle = "#c9a24a"; c.fillRect(-46, -70, 92, 12); c.fillRect(-34, -44, 68, 8);
      c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(-60, -160, 14, 260);
      c.restore();
      const pc = seg(t, POP, POP + 1.4);
      if (t < POP) { c.save(); c.translate(MOUTH.x, MOUTH.y); c.rotate(0.32); c.fillStyle = "#c79a62"; c.fillRect(-20, -34, 40, 34); c.restore(); }
      else if (pc < 1) { c.save(); c.translate(MOUTH.x + 380 * pc, MOUTH.y - 900 * pc + 700 * pc * pc); c.rotate(pc * 12); c.fillStyle = "#c79a62"; c.fillRect(-20, -17, 40, 34); c.restore(); }
      if (t >= POP) {
        glow(c, MOUTH.x, MOUTH.y, 220 * (1 - seg(t, POP, POP + 0.8)) + 40, "rgba(255,240,200,1)", 0.7);
        for (const s of spray) {
          const dt = t - s.te;
          if (dt < 0 || dt > 1.6) continue;
          const x = MOUTH.x + Math.cos(s.a) * s.v * dt, y = MOUTH.y + Math.sin(s.a) * s.v * dt + 520 * dt * dt;
          c.globalAlpha = 1 - dt / 1.6;
          c.fillStyle = s.gold ? "#ffe39a" : "#ffffff";
          c.beginPath(); c.arc(x, y, s.s, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
      }
      for (let i = 0; i < 10; i++) { const k = (t * 0.7 + i / 10) % 1; sparkle(c, 100 + ((i * 113) % 520), 200 + ((i * 89) % 420), 10, "#fff1c4", t > POP ? Math.sin(k * Math.PI) : 0); }
    },
  };
};

/* ---------------- birthday candles ---------------- */

const candlesScene = (): Scene => {
  const r = rng(1111);
  const xs = [240, 280, 320, 360, 400, 440, 480];
  const lit = xs.map((_, i) => 0.7 + i * 0.32);
  const sprinkles = Array.from({ length: 50 }, () => ({ x: 170 + r() * 380, y: 900 + r() * 170, a: r() * 3, col: ["#ff5c7a", "#5fd0c0", "#ffd36b", "#8b7cff", "#ffffff"][Math.floor(r() * 5)] }));
  const floaters = Array.from({ length: 20 }, () => ({ x: r() * W, y0: 1000 + r() * 400, sp: 40 + r() * 50, ph: r() * 6.28 }));
  return {
    ink: "#fbe9d9", scrim: "26,14,34", accent: "#ffcf73",
    draw(c, t) {
      const warm = seg(t, 0.7, 3.2);
      sky(c, [[0, "#140a1c"], [0.6, "#341a3a"], [1, "#1c0f22"]]);
      glow(c, 360, 540, 600, "rgba(255,180,90,1)", 0.15 + 0.35 * warm);
      for (const f of floaters) { const y = f.y0 - f.sp * t; sparkle(c, f.x + Math.sin(t + f.ph) * 20, ((y % 1300) + 1300) % 1300, 6, "#ffe0a0", 0.3 + 0.4 * warm); }
      c.save(); c.translate(0, -230);
      c.fillStyle = "#3a2236"; c.beginPath(); c.ellipse(360, 1110, 300, 34, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#f3e7dc"; c.beginPath(); c.ellipse(360, 1100, 280, 28, 0, 0, Math.PI * 2); c.fill();
      const tier = (y: number, w: number, h: number, body: string, icing: string) => {
        c.fillStyle = body; c.fillRect(360 - w / 2, y - h, w, h);
        c.fillStyle = icing; c.beginPath(); c.moveTo(360 - w / 2, y - h);
        for (let i = 0; i <= 10; i++) { const x = 360 - w / 2 + (i * w) / 10; c.lineTo(x, y - h + 14); c.quadraticCurveTo(x + w / 40, y - h + 30 + (i % 3) * 10, x + w / 20, y - h + 14); }
        c.lineTo(360 + w / 2, y - h); c.lineTo(360 + w / 2, y - h - 6); c.lineTo(360 - w / 2, y - h - 6); c.closePath(); c.fill();
      };
      tier(1090, 420, 160, "#f6dfc8", "#f29ab0");
      tier(930, 300, 110, "#fbeee0", "#f7c86a");
      for (const s of sprinkles) { c.save(); c.translate(s.x, s.y); c.rotate(s.a); c.fillStyle = s.col; c.fillRect(-5, -1.5, 10, 3); c.restore(); }
      xs.forEach((x, i) => {
        const top = 740 + (i % 2) * 14;
        c.fillStyle = "#fffaf2"; c.fillRect(x - 7, top, 14, 820 - top);
        c.strokeStyle = ["#ff5c7a", "#5fd0c0", "#8b7cff"][i % 3]; c.lineWidth = 4;
        for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x - 7, top + 10 + k * 18); c.lineTo(x + 7, top + 2 + k * 18); c.stroke(); }
        const on = seg(t, lit[i], lit[i] + 0.25);
        if (on > 0) {
          const fl = 1 + 0.12 * Math.sin(t * 17 + i) + 0.06 * Math.sin(t * 29 + i * 2);
          const sw = Math.sin(t * 7 + i) * 2.5;
          glow(c, x, top - 26, 70 * on, "rgba(255,200,110,1)", 0.55);
          c.save(); c.translate(x, top - 6); c.scale(on, on * fl);
          const g = c.createLinearGradient(0, -48, 0, 0); g.addColorStop(0, "#fff6d0"); g.addColorStop(0.5, "#ffd36b"); g.addColorStop(1, "#ff8f3a");
          c.fillStyle = g; c.beginPath(); c.moveTo(sw, -48); c.bezierCurveTo(14 + sw, -26, 12, -4, 0, 0); c.bezierCurveTo(-12, -4, -14 + sw, -26, sw, -48); c.fill();
          c.fillStyle = "rgba(255,255,255,.85)"; c.beginPath(); c.ellipse(0, -12, 4, 9, 0, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        c.strokeStyle = "#3b2a2a"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, top); c.lineTo(x, top - 7); c.stroke();
      });
      const m = seg(t, 0.4, lit[lit.length - 1] + 0.2);
      if (m > 0 && m < 1) { const mx = lerp(200, 500, m); glow(c, mx, 700, 40, "rgba(255,230,160,1)", 0.9); sparkle(c, mx, 700, 14, "#fff6d0"); }
      c.restore();
    },
  };
};

/* ---------------- wish upon a star ---------------- */

const shootingScene = (): Scene => {
  const shots = [{ t0: 0.6, x: 120, y: 140, len: 260 }, { t0: 2.3, x: 420, y: 90, len: 220 }, { t0: 3.6, x: 60, y: 330, len: 240 }];
  return {
    ink: "#efe8ff", scrim: "8,10,30", accent: "#ffe08a",
    draw(c, t) {
      sky(c, [[0, "#04081c"], [0.55, "#1b2752"], [1, "#3d3466"]]);
      c.save(); c.rotate(-0.4); glow(c, 200, 600, 420, "rgba(170,160,255,1)", 0.12); glow(c, 0, 520, 300, "rgba(255,190,230,1)", 0.08); c.restore();
      stars(c, 71, 260, 980, t, 1.6);
      for (const s of shots) {
        const dt = t - s.t0;
        if (dt < 0 || dt > 0.9) continue;
        const k = ease.out(dt / 0.9), hx = s.x + 520 * k, hy = s.y + 260 * k;
        const g = c.createLinearGradient(hx, hy, hx - s.len * 0.9, hy - s.len * 0.45);
        g.addColorStop(0, `rgba(255,255,255,${1 - dt / 0.9})`); g.addColorStop(1, "rgba(255,255,255,0)");
        c.strokeStyle = g; c.lineWidth = 4; c.lineCap = "round";
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - s.len * 0.9, hy - s.len * 0.45); c.stroke();
        glow(c, hx, hy, 24, "rgba(255,255,255,1)", 1 - dt / 0.9);
      }
      const w = seg(t, 4.6, 6.2);
      if (w > 0) {
        const tw = 1 + 0.15 * Math.sin(t * 6);
        glow(c, 470, 300, 220 * w * tw, "rgba(255,230,150,1)", 0.55);
        c.save(); c.globalAlpha = w;
        starPath(c, 470, 300, 46 * tw, 4, 0.18, 0); c.fillStyle = "#fff6d6"; c.fill();
        starPath(c, 470, 300, 30 * tw, 4, 0.2, Math.PI / 4); c.fill();
        c.restore();
      }
      c.fillStyle = "#070a1a";
      c.beginPath(); c.moveTo(0, 1010); c.bezierCurveTo(200, 930, 420, 950, 720, 1000); c.lineTo(720, 1280); c.lineTo(0, 1280); c.fill();
      c.strokeStyle = "#070a1a"; c.lineWidth = 12; c.lineCap = "round";
      c.beginPath(); c.moveTo(560, 975); c.lineTo(556, 820); c.moveTo(556, 880); c.lineTo(520, 840); c.moveTo(557, 860); c.lineTo(596, 822); c.stroke();
      c.fillStyle = "#070a1a"; for (const [x, y, rr] of [[556, 790, 56], [512, 820, 40], [600, 810, 44], [556, 840, 50]]) { c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill(); }
      c.beginPath(); c.arc(250, 945, 14, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(250, 985, 20, 30, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(286, 950, 13, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(286, 988, 19, 28, 0, 0, Math.PI * 2); c.fill();
    },
  };
};

/* ---------------- first snow ---------------- */

const snowScene = (): Scene => {
  const r = rng(1212);
  const flakes = Array.from({ length: 180 }, () => { const layer = r(); return { x: r() * W, y: r() * H, sp: 40 + layer * 90, s: 1.2 + layer * 3.2, ph: r() * 6.28, a: 0.5 + layer * 0.5 }; });
  const houses = [
    { x: 70, w: 150, h: 120, roof: "#7a3b42", wall: "#e9dcc8" }, { x: 250, w: 190, h: 150, roof: "#3b5a7a", wall: "#f1e6d4" }, { x: 470, w: 160, h: 110, roof: "#6c4a3a", wall: "#e3d4bf" },
  ];
  const lights = [0.5, 0.9, 1.3, 1.7, 2.1, 2.5];
  return {
    ink: "#f4ecdc", scrim: "12,20,44", accent: "#ffd27a",
    draw(c, t) {
      sky(c, [[0, "#0b1430"], [0.65, "#2a3b6a"], [1, "#1a2546"]]);
      glow(c, 560, 200, 180, "rgba(255,244,210,1)", 0.25);
      c.fillStyle = "#fff4d2"; c.beginPath(); c.arc(560, 200, 46, 0, Math.PI * 2); c.fill();
      c.save(); c.translate(0, -220);
      c.fillStyle = "rgba(200,212,235,.35)"; c.beginPath(); c.moveTo(0, 900); c.bezierCurveTo(200, 840, 420, 880, 720, 830); c.lineTo(720, 1280); c.lineTo(0, 1280); c.fill();
      houses.forEach((hs, hi) => {
        const base = 1060;
        c.fillStyle = hs.wall; c.fillRect(hs.x, base - hs.h, hs.w, hs.h);
        c.fillStyle = hs.roof; c.beginPath(); c.moveTo(hs.x - 14, base - hs.h); c.lineTo(hs.x + hs.w / 2, base - hs.h - hs.w * 0.5); c.lineTo(hs.x + hs.w + 14, base - hs.h); c.fill();
        c.fillStyle = "#ffffff"; c.beginPath(); c.moveTo(hs.x - 14, base - hs.h); c.lineTo(hs.x + hs.w / 2, base - hs.h - hs.w * 0.5); c.lineTo(hs.x + hs.w + 14, base - hs.h); c.lineTo(hs.x + hs.w + 8, base - hs.h + 10); c.lineTo(hs.x + hs.w / 2, base - hs.h - hs.w * 0.42); c.lineTo(hs.x - 8, base - hs.h + 10); c.fill();
        c.fillStyle = "#5a4a4a"; c.fillRect(hs.x + hs.w * 0.7, base - hs.h - hs.w * 0.42, 20, 50);
        for (let k = 0; k < 5; k++) { const sm = (t * 0.35 + k / 5) % 1; c.fillStyle = `rgba(230,236,248,${0.35 * (1 - sm)})`; c.beginPath(); c.arc(hs.x + hs.w * 0.7 + 10 + Math.sin(sm * 6 + hi) * 14, base - hs.h - hs.w * 0.42 - sm * 150, 10 + sm * 18, 0, Math.PI * 2); c.fill(); }
        for (let k = 0; k < 2; k++) {
          const on = seg(t, lights[hi * 2 + k], lights[hi * 2 + k] + 0.35);
          const wx = hs.x + hs.w * (k ? 0.6 : 0.18), wy = base - hs.h * 0.7, ww = hs.w * 0.22, wh = hs.h * 0.3;
          c.fillStyle = on > 0 ? `rgba(255,${200 + 20 * on},${110 + 30 * on},${0.3 + 0.7 * on})` : "#3a4058"; c.fillRect(wx, wy, ww, wh);
          if (on > 0) glow(c, wx + ww / 2, wy + wh / 2, 90, "rgba(255,200,110,1)", 0.4 * on);
          c.strokeStyle = "#ffffff"; c.lineWidth = 3; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
        }
      });
      for (const px of [40, 230, 455, 660]) { c.fillStyle = "#24453a"; c.beginPath(); c.moveTo(px, 940); c.lineTo(px + 34, 1010); c.lineTo(px + 18, 1010); c.lineTo(px + 44, 1060); c.lineTo(px - 44, 1060); c.lineTo(px - 18, 1010); c.lineTo(px - 34, 1010); c.closePath(); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(px, 940); c.lineTo(px + 12, 962); c.lineTo(px - 12, 962); c.fill(); }
      c.fillStyle = "#eef2f8"; c.beginPath(); c.moveTo(0, 1060); c.bezierCurveTo(240, 1045, 480, 1070, 720, 1055); c.lineTo(720, 1520); c.lineTo(0, 1520); c.fill();
      c.restore();
      c.fillStyle = "#ffffff";
      for (const f of flakes) { const y = (f.y + f.sp * t) % H; c.globalAlpha = f.a; c.beginPath(); c.arc((f.x + Math.sin(t * 0.9 + f.ph) * 18 + W) % W, y, f.s, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = 1;
    },
  };
};

/* ---------------- sunflowers bloom ---------------- */

const sunflowersScene = (): Scene => {
  const fl = [{ x: 130, top: 640, t0: 0.4, s: 0.85 }, { x: 260, top: 520, t0: 0.7, s: 1.05 }, { x: 400, top: 560, t0: 0.55, s: 1 }, { x: 540, top: 500, t0: 0.9, s: 1.1 }, { x: 640, top: 680, t0: 1.1, s: 0.8 }];
  return {
    ink: "#4a3a1e", scrim: "255,248,228", accent: "#f2b632",
    draw(c, t) {
      const sun = ease.out(seg(t, 0, 3.4));
      sky(c, [[0, "#f6b982"], [0.6, "#ffe1b8"], [1, "#fff3dc"]]);
      c.save(); c.globalAlpha = sun; sky(c, [[0, "#86c3ec"], [0.6, "#d8eefb"], [1, "#fff6e0"]]); c.restore();
      const sy = lerp(980, 330, sun);
      glow(c, 360, sy, 320, "rgba(255,236,170,1)", 0.7);
      c.fillStyle = "#ffe08a"; c.beginPath(); c.arc(360, sy, 70, 0, Math.PI * 2); c.fill();
      cloud(c, 130 + t * 8, 260, 1.1, "#fff", 0.75); cloud(c, 590 - t * 6, 380, 0.9, "#fff", 0.65);
      c.fillStyle = "#9cc46f"; c.beginPath(); c.moveTo(0, 960); c.bezierCurveTo(250, 920, 470, 980, 720, 940); c.lineTo(720, 1280); c.lineTo(0, 1280); c.fill();
      for (const f of fl) {
        const g = ease.out(seg(t, f.t0, f.t0 + 2.2));
        const headY = lerp(1080, f.top, g);
        c.strokeStyle = "#5f8a3a"; c.lineWidth = 9 * f.s; c.lineCap = "round";
        c.beginPath(); c.moveTo(f.x, 1120); c.quadraticCurveTo(f.x - 16, (1120 + headY) / 2, f.x, headY); c.stroke();
        if (g > 0.35) { leaf(c, f.x, lerp(1100, headY, 0.45), 74 * f.s * g, -0.5, "#6f9e45", 0.3); leaf(c, f.x, lerp(1100, headY, 0.65), 66 * f.s * g, Math.PI + 0.5, "#7fae52", 0.3); }
        const b = ease.outBack(seg(t, f.t0 + 1.5, f.t0 + 3.2));
        if (b > 0) {
          c.save(); c.translate(f.x, headY); c.rotate(Math.sin(t * 0.8 + f.x) * 0.05); c.scale(f.s, f.s);
          for (let i = 0; i < 24; i++) { c.save(); c.rotate((i / 24) * Math.PI * 2); c.fillStyle = i % 2 ? "#f2b632" : "#f7c948"; c.beginPath(); c.ellipse(0, -40 - 28 * b, 13, 32 * b, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
          c.fillStyle = "#6b4220"; c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.fill();
          c.fillStyle = "rgba(40,24,10,.55)"; for (let i = 0; i < 60; i++) { const a = i * 2.4, d = Math.sqrt(i / 60) * 34; c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, 2, 0, Math.PI * 2); c.fill(); }
          c.restore();
        }
      }
      if (t > 4) for (let i = 0; i < 3; i++) { const bx = -60 + (t - 4) * 140 + i * 40, by = 300 + i * 18 + Math.sin(t * 3 + i) * 6; c.strokeStyle = "#6a5a4a"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(bx - 10, by); c.quadraticCurveTo(bx - 5, by - 6 * Math.abs(Math.sin(t * 8 + i)), bx, by); c.quadraticCurveTo(bx + 5, by - 6 * Math.abs(Math.sin(t * 8 + i)), bx + 10, by); c.stroke(); }
    },
  };
};

/* ---------------- dandelion wishes ---------------- */

const dandelionScene = (): Scene => {
  const r = rng(1313);
  const CX = 300, CY = 520, R = 120;
  const seeds = Array.from({ length: 120 }, (_, i) => {
    const a = (i / 120) * Math.PI * 2;
    return { a, tr: 1.0 + (0.5 - 0.5 * Math.cos(a)) * 3 + r() * 0.5, vx: 120 + r() * 140, vy: 40 + r() * 70, ph: r() * 6.28 };
  });
  const tuft = (c: Ctx, len: number) => { for (let d = -60; d <= 60; d += 20) { const rad = (d * Math.PI) / 180; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(rad) * len, -Math.cos(rad) * len); c.stroke(); } };
  return {
    ink: "#2f3a36", scrim: "241,244,238", accent: "#9fb0a6",
    draw(c, t) {
      sky(c, [[0, "#a3b8b2"], [0.6, "#d6e0db"], [1, "#f2f4ef"]]);
      glow(c, CX, CY, 260, "rgba(255,255,255,1)", 0.5);
      for (let i = 0; i < 4; i++) { const k = seg(t, 0.8 + i * 0.6, 2.4 + i * 0.6); if (k <= 0 || k >= 1) continue; c.strokeStyle = `rgba(255,255,255,${0.5 * Math.sin(k * Math.PI)})`; c.lineWidth = 3; c.beginPath(); c.moveTo(-50 + k * 500, 420 + i * 70); c.quadraticCurveTo(100 + k * 500, 400 + i * 70, 250 + k * 500, 430 + i * 70); c.stroke(); }
      c.strokeStyle = "#6f8a63"; c.lineWidth = 6; c.beginPath(); c.moveTo(CX, CY + 10); c.bezierCurveTo(CX + 10, 760, CX - 16, 940, CX + 20, 1140); c.stroke();
      leaf(c, CX + 6, 1020, 150, -1.0, "#7f9b70", 0.18); leaf(c, CX + 2, 1060, 130, Math.PI + 1.1, "#8ea67f", 0.18);
      c.lineCap = "round";
      for (const s of seeds) {
        const dt = t - s.tr;
        let x: number, y: number, ang: number, sc = 1;
        if (dt <= 0) { x = CX + Math.cos(s.a) * 10; y = CY + Math.sin(s.a) * 10; ang = s.a + Math.PI / 2; }
        else { const e = Math.min(dt, 4); x = CX + Math.cos(s.a) * 10 + s.vx * dt + Math.cos(s.a) * R * 0.7; y = CY + Math.sin(s.a) * 10 - s.vy * dt + Math.sin(dt * 2 + s.ph) * 16 + Math.sin(s.a) * R * 0.7 * Math.max(0, 1 - e); ang = lerp(s.a + Math.PI / 2, 0.9, Math.min(1, dt)); sc = 0.8; }
        if (x > W + 60 || y < -60) continue;
        c.save(); c.translate(x, y); c.rotate(ang); c.scale(sc, sc);
        c.strokeStyle = "#cfc6b4"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, dt <= 0 ? -R + 18 : -26); c.stroke();
        c.translate(0, dt <= 0 ? -R + 18 : -26);
        c.strokeStyle = "#ffffff"; c.lineWidth = 1.2; tuft(c, 16);
        c.restore();
      }
      c.fillStyle = "#b4a17a"; c.beginPath(); c.arc(CX, CY, 12, 0, Math.PI * 2); c.fill();
    },
  };
};

/* ---------------- surprise gift ---------------- */

const giftScene = (): Scene => {
  const r = rng(1414);
  const OPEN = 1.25;
  const pops = Array.from({ length: 70 }, () => ({ a: -Math.PI / 2 + (r() - 0.5) * 1.6, v: 500 + r() * 500, kind: Math.floor(r() * 3), col: ["#ffd36b", "#ff7aa2", "#7fd1c4", "#b9a0ff", "#ffffff"][Math.floor(r() * 5)], spin: r() * 6 }));
  const hearts = Array.from({ length: 16 }, () => ({ x: 200 + r() * 320, t0: 2 + r() * 2.5, sp: 120 + r() * 80, s: 16 + r() * 18, ph: r() * 6.28 }));
  return {
    ink: "#4a2a4a", scrim: "255,240,248", accent: "#ff7aa2",
    draw(c, t) {
      sky(c, [[0, "#f7c6e0"], [0.6, "#fde6f1"], [1, "#fff6fa"]]);
      c.save(); c.translate(0, -240);
      const o = seg(t, OPEN, OPEN + 1.2);
      if (t > OPEN) {
        c.save(); c.translate(360, 840); c.rotate(t * 0.15);
        for (let i = 0; i < 16; i++) { c.rotate(Math.PI / 8); c.fillStyle = `rgba(255,240,190,${0.35 * ease.out(o)})`; c.beginPath(); c.moveTo(0, 0); c.lineTo(-50, -900); c.lineTo(50, -900); c.fill(); }
        c.restore();
        glow(c, 360, 830, 380 * ease.out(o), "rgba(255,245,200,1)", 0.8);
      }
      for (const p of pops) {
        const dt = t - OPEN;
        if (dt < 0 || dt > 2.6) continue;
        const e = (1 - Math.exp(-1.8 * dt)) / 1.8;
        const x = 360 + Math.cos(p.a) * p.v * e, y = 830 + Math.sin(p.a) * p.v * e + 220 * dt * dt;
        c.save(); c.globalAlpha = 1 - seg(dt, 1.8, 2.6); c.translate(x, y); c.rotate(dt * p.spin);
        if (p.kind === 0) { starPath(c, 0, 0, 14); c.fillStyle = p.col; c.fill(); }
        else if (p.kind === 1) sparkle(c, 0, 0, 14, p.col);
        else { c.fillStyle = p.col; c.fillRect(-5, -9, 10, 18); }
        c.restore();
      }
      for (const h of hearts) { const dt = t - h.t0; if (dt < 0) continue; c.save(); c.globalAlpha = 0.85 * (1 - seg(dt, 3, 4)); heartPath(c, h.x + Math.sin(dt * 1.6 + h.ph) * 30, 820 - h.sp * dt, h.s); c.fillStyle = "#ff7aa2"; c.fill(); c.restore(); }
      const shake = t < OPEN ? Math.sin(t * 34) * 0.06 * seg(t, 0.2, OPEN) : 0;
      c.save(); c.translate(360, 1060); c.rotate(shake);
      c.fillStyle = "rgba(0,0,0,.12)"; c.beginPath(); c.ellipse(0, 6, 190, 18, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#7fc7c0"; c.fillRect(-150, -220, 300, 220); c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(-150, -220, 300, 220);
      c.fillStyle = "#ff7aa2"; c.fillRect(-20, -220, 40, 220);
      c.restore();
      const lx = 360 + 300 * o, ly = 830 - 1400 * o + 500 * o * o;
      c.save(); c.translate(t < OPEN ? 360 : lx, t < OPEN ? 1060 - 230 : ly); c.rotate(t < OPEN ? shake : o * 3);
      c.fillStyle = "#8fd3cc"; c.fillRect(-165, -26, 330, 52); c.fillStyle = "#ff7aa2"; c.fillRect(-20, -26, 40, 52);
      c.beginPath(); c.moveTo(0, -26); c.bezierCurveTo(-60, -110, -120, -60, -80, -30); c.bezierCurveTo(-60, -16, -20, -24, 0, -26); c.bezierCurveTo(20, -24, 60, -16, 80, -30); c.bezierCurveTo(120, -60, 60, -110, 0, -26); c.fill();
      c.restore();
      c.restore();
    },
  };
};

export const SCENES2 = { confetti: confettiScene, champagne: champagneScene, candles: candlesScene, shooting: shootingScene, snow: snowScene, sunflowers: sunflowersScene, dandelion: dandelionScene, gift: giftScene };
void clamp; void shade;
