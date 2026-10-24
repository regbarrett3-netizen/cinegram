// Original music for each action card, timed to its animation (~8.8 s).
import { Song, renderSong } from "./synth";
import type { ActionId } from "./catalog";
import { HALLOWEEN_SONGS } from "./musicHalloween";

export const MUSIC_LEN = 8.8;

const C = (s: string) => s.split(" ");

const CORE_SONGS: Record<Exclude<ActionId, keyof typeof HALLOWEEN_SONGS>, () => Song> = {
  /** Bright, lifting tune in C — the balloons let go at 1.4 s. */
  balloons: () => {
    const s = new Song(112);
    const bars: [string[], string][] = [[C("C4 E4 G4"), "C3"], [C("B3 D4 G4"), "G2"], [C("A3 C4 E4"), "A2"], [C("A3 C4 F4"), "F2"]];
    bars.forEach(([ch, root], i) => {
      const b = i * 4;
      s.n("pad", b, 4, ch, 0.25);
      s.n("bass", b, 1.5, root, 0.5).n("bass", b + 2, 1.5, root, 0.45);
      s.arp("pluck", b, [ch[0], ch[1], ch[2], ch[1]], 0.5, 8, 0.28);
    });
    s.n("pad", 15, 3, C("C4 E4 G4"), 0.25).n("bass", 15, 3, "C2", 0.5);
    const mel: [number, number, string][] = [[0, 1, "E5"], [1, 1, "G5"], [2, 1, "A5"], [3, 1, "G5"], [4, 1, "D5"], [5, 1, "G5"], [6, 1.5, "B5"], [7.5, 0.5, "A5"], [8, 1.5, "C6"], [9.5, 0.5, "B5"], [10, 1, "A5"], [11, 1, "E5"], [12, 1, "F5"], [13, 1, "A5"], [14, 1, "C6"], [15, 2.5, "C6"]];
    for (const [b, d, p] of mel) s.n("bell", b, d, p, 0.5);
    s.hit("shaker", s.range(4, 15, 0.5), 0.25).hit("kick", [4, 6, 8, 10, 12, 14], 0.55).hit("clap", [5, 7, 9, 11, 13], 0.35);
    s.at("whoosh", 1.0, 0.45, null, 0.6);
    return s;
  },

  /** Romantic piano waltz in F as the roses bloom. */
  roses: () => {
    const s = new Song(84, { reverb: 0.35 });
    const bars: [string, string[]][] = [["F2", C("A3 C4 F4")], ["D2", C("A3 D4 F4")], ["G2", C("Bb3 D4 F4")], ["F2", C("A3 C4 F4")]];
    bars.forEach(([root, ch], i) => {
      const b = i * 3;
      s.n("piano", b, 2.5, root, 0.55);
      if (i === 2) { s.n("piano", b + 1, 0.9, ch, 0.3); s.n("piano", b + 2, 0.9, C("Bb3 E4 G4"), 0.3).n("piano", b + 2, 1, "C3", 0.45); }
      else s.n("piano", b + 1, 0.9, ch, 0.3).n("piano", b + 2, 0.9, ch, 0.28);
      s.n("strings", b, 3, ch.map((x) => x.replace(/\d$/, (d) => String(Number(d) + 1))), 0.18);
    });
    const mel: [number, number, string][] = [[0, 1.5, "A4"], [1.5, 0.5, "C5"], [2, 1, "F5"], [3, 1.5, "D5"], [4.5, 0.5, "F5"], [5, 1, "A5"], [6, 1, "G5"], [7, 1, "F5"], [8, 1, "E5"], [9, 3, "F5"]];
    for (const [b, d, p] of mel) s.n("piano", b, d, p, 0.62);
    s.arp("celesta", 9.5, C("A5 C6 F6 A6"), 0.25, 4, 0.35, 1.5);
    return s;
  },

  /** Gentle harp and flute in G as the doves rise. */
  doves: () => {
    const s = new Song(88, { reverb: 0.38 });
    s.arp("harp", 0, C("G2 D3 G3 B3 D4 G4 B4 D5"), 0.5, 8, 0.4);
    s.arp("harp", 4, C("E2 B2 E3 G3 B3 E4 G4 B4"), 0.5, 8, 0.4);
    s.arp("harp", 8, C("C3 G3 C4 E4"), 0.5, 4, 0.4);
    s.arp("harp", 10, C("D3 A3 D4 F#4"), 0.5, 4, 0.4);
    s.arp("harp", 12, C("G2 D3 G3 B3 D4 G4"), 0.08, 6, 0.4, 2);
    s.n("strings", 0, 4, C("G3 B3 D4"), 0.16).n("strings", 4, 4, C("G3 B3 E4"), 0.16).n("strings", 8, 2, C("G3 C4 E4"), 0.16).n("strings", 10, 2, C("F#3 A3 D4"), 0.16).n("strings", 12, 2.5, C("G3 B3 D4"), 0.16);
    const mel: [number, number, string][] = [[0, 2, "B4"], [2, 1, "D5"], [3, 1, "G5"], [4, 2, "E5"], [6, 1, "B4"], [7, 1, "D5"], [8, 1, "E5"], [9, 1, "G5"], [10, 1, "F#5"], [11, 1, "A5"], [12, 2.5, "G5"]];
    for (const [b, d, p] of mel) s.n("flute", b, d, p, 0.55);
    s.at("whoosh", 0.25, 0.5, null, 0.35);
    return s;
  },

  /** Dreamy pentatonic bells over a warm drone as lanterns rise. */
  lanterns: () => {
    const s = new Song(66, { reverb: 0.45 });
    s.n("pad", 0, 9.6, C("D3 A3 C#4 E4 F#4"), 0.3).n("bass", 0, 9.6, "D2", 0.3);
    const notes = C("A4 D5 E5 F#5 A5 B5 D6 E6 F#6 A6 B6 D7");
    const beats = [0.3, 1, 1.5, 2.2, 3, 3.5, 4.2, 5, 5.5, 6.3, 7, 7.6];
    beats.forEach((b, i) => { s.n("bell", b, 2, notes[i], 0.42); if (i % 3 === 1) s.n("celesta", b + 0.25, 1, notes[Math.max(0, i - 2)], 0.25); });
    return s;
  },

  /** Triumphant brass fanfare with timpani in B♭. */
  fireworks: () => {
    const s = new Song(120, { reverb: 0.3 });
    const ch: [number, string[], string][] = [[0, C("Bb3 D4 F4"), "Bb1"], [4, C("Bb3 Eb4 G4"), "Eb2"], [8, C("A3 C4 F4"), "F2"], [12, C("Bb3 D4 F4 Bb4"), "Bb1"]];
    for (const [b, notes, root] of ch) {
      if (b < 12) s.n("brass", b, 1.4, notes, 0.45).n("brass", b + 1.5, 0.45, notes, 0.4).n("brass", b + 2, 1.9, notes, 0.42);
      else s.n("brass", b, 4, notes, 0.5);
      s.n("bass", b, b < 12 ? 3.8 : 4, root, 0.6);
    }
    const mel: [number, number, string][] = [[0, 0.33, "F4"], [0.33, 0.33, "Bb4"], [0.66, 0.34, "D5"], [1, 2, "F5"], [4, 1, "Eb5"], [5, 0.5, "D5"], [5.5, 0.5, "C5"], [6, 2, "Bb4"], [8, 1, "C5"], [9, 0.5, "D5"], [9.5, 0.5, "Eb5"], [10, 2, "F5"], [12, 4, "Bb5"]];
    for (const [b, d, p] of mel) s.n("brass", b, d, p, 0.5);
    s.hit("timp", [0, 4, 8, 11, 11.5], 0.7, 0.5, 87.3).hit("timp", s.range(10, 12, 0.25), 0.35, 0.25, 116.5).hit("timp", [12], 0.9, 1, 58.3);
    s.n("swell", 9, 3, "C4", 0.6).hit("crash", [0, 12], 0.7, 2);
    return s;
  },

  /** Music box in A that beats along with the heart (75 bpm). */
  hearts: () => {
    const s = new Song(75, { reverb: 0.32 });
    for (let k = 0; k < 11; k++) s.hit("thump", [k + 0.1], 0.55);
    const acc: [number, string[]][] = [[0, C("A3 E4 A4")], [3, C("F#3 C#4 F#4")], [6, C("D4 A4")], [7.5, C("E4 B4")], [9, C("A3")]];
    for (const [b, n] of acc) n.forEach((x, i) => s.n("musicbox", b + i, 1, x, 0.35));
    s.n("pad", 0, 3, C("A3 C#4 E4"), 0.14).n("pad", 3, 3, C("F#3 A3 C#4"), 0.14).n("pad", 6, 1.5, C("F#3 A3 D4"), 0.14).n("pad", 7.5, 1.5, C("G#3 B3 E4"), 0.14).n("pad", 9, 2, C("A3 C#4 E4"), 0.14);
    const mel: [number, number, string][] = [[0, 1, "E5"], [1, 1, "A5"], [2, 1, "C#6"], [3, 1, "B5"], [4, 0.5, "A5"], [4.5, 0.5, "F#5"], [5, 1, "A5"], [6, 0.75, "F#5"], [6.75, 0.75, "A5"], [7.5, 0.75, "G#5"], [8.25, 0.75, "B5"], [9, 2, "A5"], [9, 2, "C#6"], [9, 2, "E6"]];
    for (const [b, d, p] of mel) s.n("musicbox", b, d, p, 0.55);
    return s;
  },

  /** Playful pizzicato and flute in D as the butterflies flutter out. */
  butterflies: () => {
    const s = new Song(126, { reverb: 0.25 });
    const bars: [string[], string][] = [[C("D3 A3 F#4 A3"), "D2"], [C("G3 B3 D4 B3"), "G2"], [C("A3 C#4 E4 C#4"), "A2"], [C("D3 A3 F#4 A3"), "D2"]];
    bars.forEach(([p, root], i) => { s.arp("pizz", i * 4, p, 0.5, i === 3 ? 4 : 8, 0.38, 0.3); s.n("bass", i * 4, 1, root, 0.4).n("bass", i * 4 + 2, 1, root, 0.35); });
    const mel: [number, number, string][] = [[0, 0.5, "F#5"], [0.5, 0.5, "A5"], [1, 0.5, "D6"], [1.5, 0.5, "A5"], [2, 0.5, "B5"], [2.5, 0.5, "A5"], [3, 1, "F#5"], [4, 0.5, "G5"], [4.5, 0.5, "B5"], [5, 1, "D6"], [6, 0.5, "B5"], [6.5, 0.5, "G5"], [7, 1, "A5"], [8, 0.5, "E5"], [8.5, 0.5, "A5"], [9, 1, "C#6"], [10, 0.5, "E6"], [10.5, 0.5, "C#6"], [11, 1, "A5"], [12, 2.5, "D6"]];
    for (const [b, d, p] of mel) s.n("flute", b, d, p, 0.5);
    s.hit("shaker", s.range(2, 14, 0.5), 0.18);
    s.at("pop", 0.78, 0.1, null, 0.35);
    s.arp("celesta", 1.9, C("D6 F#6 A6 D7"), 0.25, 4, 0.25, 1);
    return s;
  },

  /** Tender piano in E♭; the strings swell as the petals form a heart. */
  petals: () => {
    const s = new Song(72, { reverb: 0.38 });
    const arps: [number, string[], number][] = [[0, C("Eb2 Bb2 Eb3 G3 Bb3 G3 Eb3 Bb2"), 8], [4, C("C2 G2 C3 Eb3"), 4], [6, C("Ab1 Eb2 Ab2 C3"), 4], [8, C("Bb1 F2 Bb2 D3"), 2], [9, C("Eb2 Bb2 Eb3 G3"), 4]];
    for (const [b, p, n] of arps) s.arp("piano", b, p, 0.5, n, 0.32, 0.9);
    s.n("strings", 4, 2, C("G4 C5 Eb5"), 0.16).n("strings", 6, 2, C("Ab4 C5 Eb5"), 0.2).n("strings", 8, 1, C("F4 Bb4 D5"), 0.24).n("strings", 9, 2.5, C("G4 Bb4 Eb5"), 0.22);
    const mel: [number, number, string][] = [[0, 1.5, "G5"], [1.5, 0.5, "F5"], [2, 1, "Eb5"], [3, 1, "Bb4"], [4, 1, "C5"], [5, 1, "Eb5"], [6, 1.5, "Ab5"], [7.5, 0.5, "G5"], [8, 1, "F5"], [9, 2.5, "Eb5"]];
    for (const [b, d, p] of mel) s.n("piano", b, d, p, 0.62);
    return s;
  },

  /** Upbeat party groove in G with two confetti pops. */
  confetti: () => {
    const s = new Song(124, { reverb: 0.18 });
    const bars: [string[], string][] = [[C("G4 B4 D5"), "G1"], [C("G4 B4 E5"), "E1"], [C("G4 C5 E5"), "C2"], [C("F#4 A4 D5"), "D2"]];
    bars.forEach(([ch, root], i) => {
      const b = i * 4;
      for (let k = 0; k < 8; k++) s.n("bass", b + k * 0.5, 0.4, k % 2 ? root.replace(/\d/, (d) => String(Number(d) + 1)) : root, 0.5);
      for (const off of [0.5, 1.5, 2.5, 3.5]) s.n("pluck", b + off, 0.3, ch, 0.28);
    });
    const lead = [C("D5 G5 B5 D6"), C("E5 G5 B5 E6"), C("E5 G5 C6 E6"), C("F#5 A5 D6 F#6")];
    lead.forEach((p, i) => s.arp("bell", i * 4 + 2, p, 0.5, 4, 0.32));
    s.hit("kick", s.range(0, 16, 1), 0.7).hit("clap", [1, 3, 5, 7, 9, 11, 13, 15], 0.45).hit("hat", s.range(0.5, 16, 1), 0.3);
    s.at("pop", 0.5, 0.1, null, 0.8).at("pop", 1.0, 0.1, null, 0.8).at("whoosh", 0.1, 0.4, null, 0.4).at("whoosh", 0.6, 0.4, null, 0.4);
    s.n("brass", 16, 1.5, C("G3 B3 D4 G4"), 0.5).hit("crash", [16], 0.6, 2).hit("kick", [16], 0.7);
    return s;
  },

  /** Jazzy swing in F; the cork pops at 1.1 s. */
  champagne: () => {
    const s = new Song(136, { swing: true, reverb: 0.22 });
    const walk = C("F2 A2 C3 D3 D2 F#2 A2 C3 G2 Bb2 D3 Db3 C2 E2 G2 E2");
    walk.forEach((p, i) => s.n("bass", i, 0.9, p, 0.55));
    s.n("bass", 16, 2, "F2", 0.55);
    const comps = [C("A3 C4 E4"), C("F#3 C4 E4"), C("Bb3 D4 F4"), C("Bb3 E4 A4"), C("A3 D4 F4")];
    comps.forEach((ch, i) => { s.n("piano", i * 4, 0.4, ch, 0.35); if (i < 4) s.n("piano", i * 4 + 1.5, 0.3, ch, 0.3); });
    const mel: [number, number, string][] = [[0, 0.5, "C5"], [0.5, 0.5, "A4"], [1, 1, "C5"], [2, 0.5, "D5"], [2.5, 1.5, "F5"], [4, 0.5, "E5"], [4.5, 0.5, "D5"], [5, 1, "C5"], [6, 2, "A4"], [8, 0.5, "Bb4"], [8.5, 0.5, "D5"], [9, 1, "F5"], [10, 1, "E5"], [11, 1, "D5"], [12, 1.5, "E5"], [13.5, 0.5, "G5"], [14, 1, "Bb5"], [15, 1, "G5"], [16, 2, "A5"]];
    for (const [b, d, p] of mel) s.n("vibe", b, d, p, 0.55);
    s.hit("ride", [0, 1, 1.5, 2, 3, 3.5, 4, 5, 5.5, 6, 7, 7.5, 8, 9, 9.5, 10, 11, 11.5, 12, 13, 13.5, 14, 15, 15.5, 16], 0.35).hit("hat", [1, 3, 5, 7, 9, 11, 13, 15], 0.25);
    s.at("pop", 1.1, 0.1, null, 0.9).at("fizz", 1.12, 1.6, null, 0.7);
    return s;
  },

  /** A chime as each candle lights, then an original birthday waltz in G. */
  candles: () => {
    const s = new Song(120, { reverb: 0.3 });
    C("G5 A5 B5 C6 D6 E6 G6").forEach((p, i) => s.at("celesta", 0.7 + i * 0.32, 0.8, p, 0.45));
    s.n("pad", 0, 6, C("G3 B3 D4"), 0.16);
    const bars: [number, string, string[]][] = [[6, "G2", C("B3 D4 G4")], [9, "C3", C("C4 E4 G4")], [12, "D3", C("C4 F#4 A4")], [15, "G2", C("B3 D4 G4")]];
    for (const [b, root, ch] of bars) {
      s.n("piano", b, 2.5, root, 0.55);
      if (b < 15) s.n("piano", b + 1, 0.8, ch, 0.3).n("piano", b + 2, 0.8, ch, 0.28);
      else s.n("piano", b, 3, ch, 0.3);
    }
    const mel: [number, number, string][] = [[6, 1, "D5"], [7, 1, "G5"], [8, 1, "B5"], [9, 1.5, "C6"], [10.5, 0.5, "B5"], [11, 1, "A5"], [12, 1, "F#5"], [13, 1, "A5"], [14, 1, "C6"], [15, 3, "B5"]];
    for (const [b, d, p] of mel) s.n("celesta", b, d, p, 0.55).n("piano", b, d, p, 0.35);
    s.n("celesta", 15, 3, C("G5 D6"), 0.4);
    return s;
  },

  /** Twinkling celesta in E with glittering runs for each shooting star. */
  shooting: () => {
    const s = new Song(90, { reverb: 0.45 });
    s.n("pad", 0, 4, C("E3 B3 G#4"), 0.22).n("pad", 4, 2, C("C#3 G#3 E4"), 0.22).n("pad", 6, 2, C("A2 E3 C#4"), 0.22).n("pad", 8, 2, C("B2 F#3 D#4"), 0.22).n("pad", 10, 3, C("E3 B3 G#4"), 0.24);
    const mel: [number, number, string][] = [[0, 2, "B4"], [2, 2, "E5"], [4, 2, "G#5"], [6, 1, "A5"], [7, 1, "C#6"], [8, 2, "B5"], [10, 3, "E6"]];
    for (const [b, d, p] of mel) s.n("celesta", b, d, p, 0.45);
    const run = C("E7 C#7 B6 G#6 F#6 E6 C#6 B5");
    for (const t0 of [0.6, 2.3, 3.6]) run.forEach((p, k) => s.at("bell", t0 + k * 0.05, 0.6, p, 0.22));
    s.at("bell", 4.6, 3, "E6", 0.5).at("bell", 4.6, 3, "G#6", 0.4).at("bell", 4.6, 3, "B6", 0.35).at("swell", 3.8, 0.8, null, 0.4);
    return s;
  },

  /** A winter waltz in C with sleigh bells. */
  snow: () => {
    const s = new Song(138, { reverb: 0.3 });
    const bars: [string, string[]][] = [["C3", C("E4 G4 C5")], ["A2", C("E4 A4 C5")], ["D3", C("F4 A4 D5")], ["G2", C("F4 G4 B4")], ["C3", C("E4 G4 C5")], ["F2", C("F4 A4 C5")], ["C3", C("E4 G4 C5")]];
    bars.forEach(([root, ch], i) => {
      const b = i * 3;
      s.n("pizz", b, 1, root, 0.55);
      if (i < 6) s.n("celesta", b + 1, 0.5, ch, 0.28).n("celesta", b + 2, 0.5, ch, 0.25);
    });
    const mel: [number, number, string][] = [[0, 1, "E5"], [1, 1, "G5"], [2, 1, "C6"], [3, 2, "A5"], [5, 1, "E5"], [6, 1, "F5"], [7, 1, "A5"], [8, 1, "D6"], [9, 2, "B5"], [11, 1, "G5"], [12, 2, "C6"], [14, 1, "G5"], [15, 1, "A5"], [16, 1, "C6"], [17, 1, "A5"], [18, 2.5, "C6"]];
    for (const [b, d, p] of mel) s.n("bell", b, d, p, 0.42).n("celesta", b, d, p, 0.3);
    s.n("strings", 18, 2.5, C("E4 G4 C5"), 0.2);
    s.hit("sleigh", s.range(0, 20, 0.5), 0.4);
    return s;
  },

  /** Sunny acoustic strum in D as the sun rises and the flowers open. */
  sunflowers: () => {
    const s = new Song(100, { reverb: 0.25 });
    s.arp("bell", 0, C("D5 F#5 A5 D6"), 0.75, 4, 0.35, 1.5);
    const chords: [number, number, string[]][] = [[0, 4, C("D3 A3 D4 F#4")], [4, 4, C("E3 A3 C#4 E4")], [8, 2, C("F#3 B3 D4 F#4")], [10, 2, C("G3 B3 D4 G4")], [12, 2.5, C("D3 A3 D4 F#4")]];
    for (const [b, len, ch] of chords) for (const off of [0, 1, 1.5, 2.5, 3, 3.5].filter((o) => o < len)) s.strum("pluck", b + off, 0.6, ch, off % 1 ? 0.22 : 0.3);
    s.n("bass", 0, 4, "D2", 0.4).n("bass", 4, 4, "A1", 0.4).n("bass", 8, 2, "B1", 0.4).n("bass", 10, 2, "G1", 0.4).n("bass", 12, 2.5, "D2", 0.45);
    const mel: [number, number, string][] = [[4, 1, "E5"], [5, 1, "A5"], [6, 1.5, "C#6"], [7.5, 0.5, "B5"], [8, 1, "D6"], [9, 1, "C#6"], [10, 1, "B5"], [11, 1, "A5"], [12, 2.5, "D6"]];
    for (const [b, d, p] of mel) s.n("flute", b, d, p, 0.5);
    s.hit("shaker", s.range(4, 14, 0.5), 0.2);
    return s;
  },

  /** Wistful piano in A minor that turns hopeful as the seeds fly. */
  dandelion: () => {
    const s = new Song(76, { reverb: 0.4 });
    const arps: [number, string[]][] = [[0, C("A2 E3 A3 C4")], [2, C("F2 C3 F3 A3")], [4, C("C3 G3 C4 E4")], [6, C("G2 D3 G3 B3")], [8, C("C3 G3 C4 E4 G4 C5")]];
    for (const [b, p] of arps) s.arp("piano", b, p, 0.5, b === 8 ? 6 : 4, 0.28, 0.9);
    s.n("pad", 0, 2, C("A3 C4 E4"), 0.15).n("pad", 2, 2, C("A3 C4 F4"), 0.15).n("pad", 4, 2, C("G3 C4 E4"), 0.15).n("pad", 6, 2, C("G3 B3 D4"), 0.15).n("pad", 8, 3, C("G3 C4 E4"), 0.18);
    const mel: [number, number, string][] = [[0, 1.5, "E5"], [1.5, 0.5, "D5"], [2, 1, "C5"], [3, 1, "A4"], [4, 1, "G4"], [5, 1, "C5"], [6, 1, "E5"], [7, 1, "D5"], [8, 3, "E5"]];
    for (const [b, d, p] of mel) s.n("piano", b, d, p, 0.58);
    s.at("wind", 1.0, 2.8, null, 0.6);
    return s;
  },

  /** Ticking suspense, a magical sweep as the lid flies off (1.25 s), then a bouncy tune in F. */
  gift: () => {
    const s = new Song(116, { reverb: 0.3 });
    s.range(0, 2.4, 0.5).forEach((b, i) => s.hit("tick", [b], 0.5 + i * 0.08, 0.1, i % 2 ? 900 : 1200));
    s.hit("snare", s.range(1, 2.4, 0.125), 0.22);
    C("F5 A5 C6 F6 A6 C7 F7").forEach((p, k) => s.at("bell", 1.25 + k * 0.035, 1.2, p, 0.3));
    s.at("crash", 1.25, 2, null, 0.6).at("whoosh", 0.9, 0.35, null, 0.5);
    const ch: [number, number, string[], string][] = [[4, 4, C("F4 A4 C5"), "F2"], [8, 2, C("F4 A4 D5"), "D2"], [10, 2, C("F4 Bb4 D5"), "Bb1"], [12, 2, C("E4 G4 C5"), "C2"], [14, 3, C("F4 A4 C5"), "F2"]];
    for (const [b, len, notes, root] of ch) { for (let k = 0; k < len; k++) s.n("pluck", b + k + 0.5, 0.3, notes, 0.26); s.n("bass", b, len, root, 0.5); }
    const mel: [number, number, string][] = [[4, 0.5, "C5"], [4.5, 0.5, "F5"], [5, 0.5, "A5"], [5.5, 0.5, "C6"], [6, 1, "A5"], [7, 1, "F5"], [8, 0.5, "D5"], [8.5, 0.5, "F5"], [9, 1, "A5"], [10, 1, "Bb5"], [11, 1, "D6"], [12, 1, "C6"], [13, 1, "G5"], [14, 3, "F5"], [14, 3, "A5"], [14, 3, "C6"]];
    for (const [b, d, p] of mel) s.n("celesta", b, d, p, 0.5);
    s.hit("kick", [4, 6, 8, 10, 12, 14], 0.45).hit("clap", [5, 7, 9, 11, 13], 0.3);
    return s;
  },
};

const SONGS: Record<ActionId, () => Song> = { ...CORE_SONGS, ...HALLOWEEN_SONGS };

const cache = new Map<ActionId, Promise<AudioBuffer>>();

/** The rendered music for a card (rendered once, then cached). */
export function musicFor(id: ActionId): Promise<AudioBuffer> {
  let p = cache.get(id);
  if (!p) {
    p = renderSong(SONGS[id](), MUSIC_LEN);
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return p;
}

export { SONGS };
