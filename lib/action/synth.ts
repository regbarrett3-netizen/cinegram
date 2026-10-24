// A small Web Audio synthesizer: instruments, a song builder and an offline renderer.
// All music is original and generated in the browser, so there's nothing to license or download.

export type Inst =
  | "piano" | "bell" | "celesta" | "musicbox" | "vibe" | "harp" | "pluck" | "pizz" | "pad" | "strings" | "flute" | "brass" | "bass"
  | "theremin" | "choir" | "organ"
  | "kick" | "snare" | "clap" | "hat" | "ride" | "shaker" | "sleigh" | "timp" | "crash" | "swell" | "whoosh" | "pop" | "fizz" | "thump" | "tick" | "wind";

export type Ev = { t: number; d: number; f: number; v: number; i: Inst };

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function midi(n: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if (!m) throw new Error(`Bad note ${n}`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
}
export const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Builds a list of timed events from beats. */
export class Song {
  evs: Ev[] = [];
  constructor(public bpm: number, public opts: { swing?: boolean; reverb?: number } = {}) {}
  sec(b: number) {
    if (this.opts.swing) {
      const w = Math.floor(b), fr = b - w;
      b = w + (fr < 0.5 ? fr * (4 / 3) : 2 / 3 + (fr - 0.5) * (2 / 3));
    }
    return (b * 60) / this.bpm;
  }
  dur(beats: number) { return (beats * 60) / this.bpm; }
  n(i: Inst, b: number, d: number, p: string | string[], v = 0.6) {
    for (const x of Array.isArray(p) ? p : [p]) this.evs.push({ t: this.sec(b), d: this.dur(d), f: hz(midi(x)), v, i });
    return this;
  }
  /** Notes rolled upward like a strum. */
  strum(i: Inst, b: number, d: number, p: string[], v = 0.5, gap = 0.018) {
    p.forEach((x, k) => this.evs.push({ t: this.sec(b) + k * gap, d: this.dur(d), f: hz(midi(x)), v, i }));
    return this;
  }
  arp(i: Inst, b: number, p: string[], step: number, count: number, v = 0.5, d = step) {
    for (let k = 0; k < count; k++) this.n(i, b + k * step, d, p[k % p.length], v);
    return this;
  }
  hit(i: Inst, beats: number[], v = 0.6, d = 0.25, f = 0) {
    for (const b of beats) this.evs.push({ t: this.sec(b), d: this.dur(d), f, v, i });
    return this;
  }
  /** Event at an absolute time in seconds (for syncing with the animation). */
  at(i: Inst, sec: number, d: number, p: string | null, v = 0.5) {
    this.evs.push({ t: sec, d, f: p ? hz(midi(p)) : 0, v, i });
    return this;
  }
  range(from: number, to: number, step: number) { const r: number[] = []; for (let b = from; b < to - 1e-6; b += step) r.push(b); return r; }
}

/* ---------------- instruments ---------------- */

type Ctx = BaseAudioContext;
const DRUMS = new Set<Inst>(["kick", "snare", "clap", "hat", "ride", "shaker", "sleigh", "timp", "crash", "swell", "whoosh", "pop", "fizz", "thump", "tick", "wind"]);

function osc(c: Ctx, type: OscillatorType, f: number, t: number, stop: number, dest: AudioNode, detune = 0) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  o.detune.value = detune;
  o.connect(dest);
  o.start(t);
  o.stop(stop);
  return o;
}
function gain(c: Ctx, dest: AudioNode, v = 1) { const g = c.createGain(); g.gain.value = v; g.connect(dest); return g; }
function filt(c: Ctx, dest: AudioNode, type: BiquadFilterType, f: number, q = 0.7) { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dest); return b; }
/** attack → decay to sustain level → release at note end. */
function adsr(p: AudioParam, t: number, a: number, peak: number, tau: number, sus: number, end: number, rel: number) {
  p.setValueAtTime(0.0001, t);
  p.linearRampToValueAtTime(peak, t + a);
  p.setTargetAtTime(peak * sus, t + a, tau);
  p.setTargetAtTime(0.0001, Math.max(end, t + a + 0.001), rel);
}
function noise(c: Ctx, buf: AudioBuffer, t: number, stop: number, dest: AudioNode) {
  const s = c.createBufferSource();
  s.buffer = buf;
  s.loop = true;
  s.connect(dest);
  s.start(t, (t * 7.31) % 1.5);
  s.stop(stop);
  return s;
}
function partials(c: Ctx, out: AudioNode, e: Ev, parts: [number, number][], a: number, tau: number, len: number) {
  for (const [r, amp] of parts) {
    const g = gain(c, out, 0);
    adsr(g.gain, e.t, a, e.v * amp, tau / Math.sqrt(r), 0.0001, e.t + len, 0.1);
    osc(c, "sine", e.f * r, e.t, e.t + len + 0.6, g);
  }
}

function play(c: Ctx, out: AudioNode, e: Ev, nb: AudioBuffer) {
  const { t, d, f, v } = e;
  const end = t + d;
  switch (e.i) {
    case "piano": {
      const lp = filt(c, out, "lowpass", 5000);
      lp.frequency.setTargetAtTime(1700, t, 0.3);
      const g = c.createGain(); g.connect(lp);
      adsr(g.gain, t, 0.004, v * 0.55, 0.45, 0.25, end, 0.22);
      osc(c, "triangle", f, t, end + 1.5, g);
      const g2 = gain(c, g, 0.35); osc(c, "sine", f * 2, t, end + 1.5, g2);
      const g3 = gain(c, g, 0.12); osc(c, "sine", f * 3, t, end + 1.5, g3, 4);
      break;
    }
    case "bell": partials(c, out, { ...e, v: v * 0.45 }, [[1, 1], [2.76, 0.45], [5.4, 0.2], [8.9, 0.08]], 0.003, 1.4, 3); break;
    case "celesta": partials(c, out, { ...e, v: v * 0.5 }, [[1, 1], [2, 0.3], [4, 0.22]], 0.003, 0.7, 2); break;
    case "musicbox": partials(c, out, { ...e, v: v * 0.5 }, [[1, 1], [3.9, 0.35], [6.1, 0.12]], 0.002, 0.55, 1.6); break;
    case "vibe": {
      const trem = gain(c, out, 1);
      const lfo = c.createOscillator(); lfo.frequency.value = 5.5; const depth = c.createGain(); depth.gain.value = 0.3; lfo.connect(depth); depth.connect(trem.gain); lfo.start(t); lfo.stop(end + 2);
      partials(c, trem, { ...e, v: v * 0.45 }, [[1, 1], [4, 0.28]], 0.003, 1.1, 2.2);
      break;
    }
    case "harp": {
      const g = gain(c, out, 0);
      adsr(g.gain, t, 0.003, v * 0.45, 0.8, 0.0001, end + 1, 0.3);
      osc(c, "triangle", f, t, end + 2, g);
      const g2 = gain(c, g, 0.3); osc(c, "sine", f * 2, t, end + 2, g2);
      break;
    }
    case "pluck": case "pizz": {
      const pz = e.i === "pizz";
      const lp = filt(c, out, "lowpass", pz ? 2200 : 3600, 1);
      lp.frequency.setTargetAtTime(pz ? 350 : 600, t, pz ? 0.05 : 0.09);
      const g = c.createGain(); g.connect(lp);
      adsr(g.gain, t, 0.003, v * 0.5, pz ? 0.13 : 0.22, 0.0001, end + 0.3, 0.1);
      osc(c, "sawtooth", f, t, end + 1, g);
      osc(c, "triangle", f * 1.003, t, end + 1, g);
      break;
    }
    case "pad": case "strings": {
      const st = e.i === "strings";
      const lp = filt(c, out, "lowpass", st ? 1800 : 1100, 0.5);
      const g = c.createGain(); g.connect(lp);
      adsr(g.gain, t, st ? 0.3 : 0.6, v * 0.22, 1, 0.85, end, st ? 0.35 : 0.5);
      for (const dt of [-7, 7]) {
        const o = osc(c, "sawtooth", f, t, end + 2.5, g, dt);
        if (st) { const lfo = c.createOscillator(); lfo.frequency.value = 5; const dg = c.createGain(); dg.gain.value = 6; lfo.connect(dg); dg.connect(o.detune); lfo.start(t); lfo.stop(end + 2.5); }
      }
      osc(c, "triangle", f / 2, t, end + 2.5, gain(c, g, 0.25));
      break;
    }
    case "flute": {
      const g = gain(c, out, 0);
      adsr(g.gain, t, 0.06, v * 0.4, 0.3, 0.8, end, 0.07);
      const o = osc(c, "sine", f, t, end + 0.6, g);
      const lfo = c.createOscillator(); lfo.frequency.value = 5; const dg = c.createGain(); dg.gain.setValueAtTime(0, t); dg.gain.linearRampToValueAtTime(9, t + 0.35); lfo.connect(dg); dg.connect(o.detune); lfo.start(t); lfo.stop(end + 0.6);
      osc(c, "triangle", f, t, end + 0.6, gain(c, g, 0.15));
      const bp = filt(c, gain(c, out, v * 0.02), "bandpass", f * 2, 4); noise(c, nb, t, end + 0.2, bp);
      break;
    }
    case "brass": {
      const lp = filt(c, out, "lowpass", 500, 1.5);
      lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2600, t + 0.06); lp.frequency.setTargetAtTime(1300, t + 0.06, 0.25);
      const g = c.createGain(); g.connect(lp);
      adsr(g.gain, t, 0.04, v * 0.32, 0.4, 0.8, end, 0.1);
      osc(c, "sawtooth", f, t, end + 0.8, g, -4); osc(c, "sawtooth", f, t, end + 0.8, g, 4);
      break;
    }
    case "bass": {
      const lp = filt(c, out, "lowpass", 900);
      const g = c.createGain(); g.connect(lp);
      adsr(g.gain, t, 0.006, v * 0.55, 0.45, 0.35, end, 0.08);
      osc(c, "triangle", f, t, end + 0.8, g); osc(c, "sine", f, t, end + 0.8, gain(c, g, 0.6));
      break;
    }
    case "theremin": {
      // Spooky sine with a wide vibrato and a little scoop up into each note.
      const g = gain(c, out, 0);
      adsr(g.gain, t, 0.09, v * 0.42, 0.4, 0.9, end, 0.12);
      const o = osc(c, "sine", f * 0.94, t, end + 0.7, g);
      o.frequency.setTargetAtTime(f, t, 0.035);
      const lfo = c.createOscillator(); lfo.frequency.value = 6.2; const dg = c.createGain(); dg.gain.setValueAtTime(8, t); dg.gain.linearRampToValueAtTime(28, t + 0.4); lfo.connect(dg); dg.connect(o.detune); lfo.start(t); lfo.stop(end + 0.7);
      osc(c, "triangle", f * 2, t, end + 0.7, gain(c, g, 0.06));
      break;
    }
    case "choir": {
      // Two detuned saws through "ooh" formants.
      const g = c.createGain();
      adsr(g.gain, t, 0.28, v * 0.5, 1, 0.9, end, 0.4);
      const f1 = filt(c, out, "bandpass", 420, 5), f2 = filt(c, gain(c, out, 0.45), "bandpass", 880, 6);
      g.connect(f1); g.connect(f2);
      for (const dt of [-9, 0, 9]) {
        const o = osc(c, "sawtooth", f, t, end + 1, g, dt);
        const lfo = c.createOscillator(); lfo.frequency.value = 5 + dt * 0.02; const dg = c.createGain(); dg.gain.value = 7; lfo.connect(dg); dg.connect(o.detune); lfo.start(t); lfo.stop(end + 1);
      }
      break;
    }
    case "organ": {
      const trem = gain(c, out, 1);
      const lfo = c.createOscillator(); lfo.frequency.value = 6; const depth = c.createGain(); depth.gain.value = 0.12; lfo.connect(depth); depth.connect(trem.gain); lfo.start(t); lfo.stop(end + 0.5);
      const g = gain(c, trem, 0);
      adsr(g.gain, t, 0.02, v * 0.26, 0.3, 1, end, 0.12);
      for (const [r, amp] of [[0.5, 0.5], [1, 1], [2, 0.55], [3, 0.3], [4, 0.18]] as [number, number][]) osc(c, "sine", f * r, t, end + 0.5, gain(c, g, amp));
      break;
    }
    /* percussion & effects */
    case "kick": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(v * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      const o = osc(c, "sine", 160, t, t + 0.4, g); o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
      break;
    }
    case "snare": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(v * 0.6, t); g.gain.setTargetAtTime(0.0001, t, 0.06);
      noise(c, nb, t, t + 0.4, filt(c, g, "bandpass", 1900, 0.8));
      const g2 = gain(c, out, 0); g2.gain.setValueAtTime(v * 0.4, t); g2.gain.setTargetAtTime(0.0001, t, 0.04); osc(c, "triangle", 190, t, t + 0.3, g2);
      break;
    }
    case "clap": {
      const g = gain(c, out, 0);
      for (const k of [0, 0.012, 0.024]) { g.gain.setValueAtTime(v * 0.7, t + k); g.gain.setTargetAtTime(0.0001, t + k + 0.002, 0.005); }
      g.gain.setValueAtTime(v * 0.6, t + 0.034); g.gain.setTargetAtTime(0.0001, t + 0.036, 0.08);
      noise(c, nb, t, t + 0.5, filt(c, g, "bandpass", 1300, 1.2));
      break;
    }
    case "hat": case "shaker": case "ride": {
      const g = gain(c, out, 0);
      const a = e.i === "shaker" ? 0.012 : 0.001;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * (e.i === "ride" ? 0.3 : 0.35), t + a); g.gain.setTargetAtTime(0.0001, t + a, e.i === "ride" ? 0.25 : e.i === "shaker" ? 0.04 : 0.025);
      noise(c, nb, t, t + 1, filt(c, g, e.i === "shaker" ? "bandpass" : "highpass", e.i === "shaker" ? 5500 : e.i === "ride" ? 6000 : 7500, 1));
      break;
    }
    case "sleigh": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.3, t + 0.006); g.gain.setTargetAtTime(0.0001, t + 0.006, 0.07);
      noise(c, nb, t, t + 0.5, filt(c, g, "highpass", 7000, 1));
      for (const k of [0, 1, 2]) { const fr = 5000 + ((t * 977 + k * 613) % 2500); const gg = gain(c, out, 0); gg.gain.setValueAtTime(v * 0.05, t + k * 0.01); gg.gain.setTargetAtTime(0.0001, t + k * 0.01, 0.05); osc(c, "sine", fr, t, t + 0.4, gg); }
      break;
    }
    case "timp": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(v * 0.6, t); g.gain.setTargetAtTime(0.0001, t, 0.45);
      const o = osc(c, "sine", f || 87, t, t + 2, g); o.frequency.setTargetAtTime((f || 87) * 0.985, t, 0.2);
      const gn = gain(c, out, 0); gn.gain.setValueAtTime(v * 0.4, t); gn.gain.setTargetAtTime(0.0001, t, 0.03); noise(c, nb, t, t + 0.3, filt(c, gn, "lowpass", 400));
      break;
    }
    case "crash": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(v * 0.35, t); g.gain.setTargetAtTime(0.0001, t, 0.9);
      noise(c, nb, t, t + 4, filt(c, g, "highpass", 4000, 0.7));
      break;
    }
    case "swell": case "whoosh": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.3, end); g.gain.setTargetAtTime(0.0001, end, 0.08);
      const bp = filt(c, g, e.i === "swell" ? "highpass" : "bandpass", e.i === "swell" ? 3000 : 400, 0.8);
      if (e.i === "whoosh") bp.frequency.exponentialRampToValueAtTime(3500, end);
      noise(c, nb, t, end + 0.6, bp);
      break;
    }
    case "pop": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(v, t); g.gain.setTargetAtTime(0.0001, t, 0.018);
      noise(c, nb, t, t + 0.2, filt(c, g, "lowpass", 2400));
      const g2 = gain(c, out, 0); g2.gain.setValueAtTime(v * 0.7, t); g2.gain.setTargetAtTime(0.0001, t, 0.05); const o = osc(c, "sine", 220, t, t + 0.3, g2); o.frequency.exponentialRampToValueAtTime(70, t + 0.08);
      break;
    }
    case "fizz": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(v * 0.18, t); g.gain.setTargetAtTime(0.0001, t + 0.2, d / 3);
      noise(c, nb, t, end + 1, filt(c, g, "highpass", 5000, 0.6));
      break;
    }
    case "thump": {
      for (const [k, a] of [[0, 1], [0.16, 0.7]] as [number, number][]) {
        const g = gain(c, out, 0); g.gain.setValueAtTime(v * a, t + k); g.gain.setTargetAtTime(0.0001, t + k, 0.07);
        const o = osc(c, "sine", 70, t + k, t + k + 0.4, g); o.frequency.exponentialRampToValueAtTime(45, t + k + 0.1);
      }
      break;
    }
    case "tick": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(v * 0.4, t); g.gain.setTargetAtTime(0.0001, t, 0.025);
      osc(c, "sine", f || 1200, t, t + 0.2, g);
      break;
    }
    case "wind": {
      const g = gain(c, out, 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.18, t + d * 0.4); g.gain.linearRampToValueAtTime(0.0001, end);
      const bp = filt(c, g, "bandpass", 500, 0.7); bp.frequency.linearRampToValueAtTime(1100, t + d * 0.5); bp.frequency.linearRampToValueAtTime(600, end);
      noise(c, nb, t, end + 0.1, bp);
      break;
    }
  }
}

/* ---------------- rendering ---------------- */

type OfflineCtor = new (channels: number, length: number, rate: number) => OfflineAudioContext;

/** Renders a song to an AudioBuffer of `len` seconds, normalised, with a soft fade at the end. */
export async function renderSong(song: Song, len: number): Promise<AudioBuffer> {
  const SR = 44100;
  const w = globalThis as unknown as { OfflineAudioContext?: OfflineCtor; webkitOfflineAudioContext?: OfflineCtor };
  const Ctor = w.OfflineAudioContext || w.webkitOfflineAudioContext;
  if (!Ctor) throw new Error("Audio unavailable");
  const c = new Ctor(2, Math.ceil(SR * len), SR);

  const nb = c.createBuffer(1, SR * 2, SR);
  const nd = nb.getChannelData(0);
  let s = 12345;
  for (let i = 0; i < nd.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; nd[i] = (s / 0x7fffffff) * 2 - 1; }

  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
  comp.connect(c.destination);
  const dry = gain(c, comp, 0.8);
  const rev = c.createConvolver();
  const ir = c.createBuffer(2, SR * 2.4, SR);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = ((s / 0x7fffffff) * 2 - 1) * Math.pow(1 - i / d.length, 3); } }
  rev.buffer = ir;
  rev.connect(gain(c, comp, song.opts.reverb ?? 0.28));
  const melodic = gain(c, dry, 1); melodic.connect(rev);
  const perc = gain(c, dry, 1); const percSend = gain(c, rev, 0.25); perc.connect(percSend);

  for (const e of song.evs) if (e.t < len) play(c, DRUMS.has(e.i) ? perc : melodic, e, nb);

  const buf = await c.startRendering();
  // Balance loudness across songs by average level, without letting peaks clip.
  let peak = 0, sum = 0, cnt = 0;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); peak = Math.max(peak, a); sum += a * a; cnt++; } }
  const rms = Math.sqrt(sum / Math.max(1, cnt));
  const k = peak > 0 ? Math.min(0.92 / peak, rms > 0 ? 0.17 / rms : Infinity) : 1;
  const fadeStart = Math.floor((len - 0.45) * SR);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < d.length; i++) {
      let g = k;
      if (i < 220) g *= i / 220;
      if (i > fadeStart) g *= Math.max(0, 1 - (i - fadeStart) / (d.length - fadeStart));
      d[i] *= g;
    }
  }
  return buf;
}
