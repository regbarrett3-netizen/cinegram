// Original music for the Halloween action cards, timed to their animations (~8.8 s).
import { Song } from "./synth";
import type { HalloweenId } from "./halloweenText";

const C = (s: string) => s.split(" ");
type Mel = [number, number, string][];
const play = (s: Song, i: Parameters<Song["n"]>[0], mel: Mel, v: number) => { for (const [b, d, p] of mel) s.n(i, b, d, p, v); };

export const HALLOWEEN_SONGS: Record<HalloweenId, () => Song> = {
  /** Candles light one by one (bells), then a solemn, slightly silly pumpkin choir in A minor. */
  pumpkins: () => {
    const s = new Song(72, { reverb: 0.45 });
    s.at("wind", 0, 2, null, 0.45);
    C("E5 G5 A5 C6 E6").forEach((p, i) => { s.at("pop", 0.3 + i * 0.24, 0.1, null, 0.35); s.at("bell", 0.32 + i * 0.24, 1.2, p, 0.3); });
    const ch: [number, number, string[], string][] = [[2, 2, C("A3 C4 E4"), "A2"], [4, 2, C("A3 C4 F4"), "F2"], [6, 2, C("A3 D4 F4"), "D2"], [8, 2.6, C("A3 C4 E4 A4"), "A2"]];
    for (const [b, d, notes, root] of ch) s.n("choir", b, d, notes, 0.5).n("bass", b, d, root, 0.4);
    play(s, "musicbox", [
      [2, 0.5, "E5"], [2.5, 0.5, "C5"], [3, 0.5, "A4"], [3.5, 0.5, "C5"],
      [4, 0.5, "F5"], [4.5, 0.5, "C5"], [5, 0.5, "A4"], [5.5, 0.5, "C5"],
      [6, 0.5, "D5"], [6.5, 0.5, "F5"], [7, 0.5, "A5"], [7.5, 0.5, "F5"],
      [8, 0.5, "E5"], [8.5, 0.5, "A5"], [9, 1.5, "C6"],
    ], 0.5);
    s.hit("timp", [2, 6], 0.35, 1, 55);
    return s;
  },

  /** The disco ball drops, the lights hit, and a minor-key disco groove kicks in. */
  skeletons: () => {
    const s = new Song(118, { reverb: 0.25 });
    s.at("whoosh", 0, 0.8, null, 0.5).at("swell", 0.2, 0.8, null, 0.4).at("crash", 1.0, 1.5, null, 0.55);
    const bars: [number, string, string[]][] = [[2, "A", C("A4 C5 E5 C5")], [6, "G", C("G4 B4 D5 B4")], [10, "F", C("F4 A4 C5 A4")], [14, "E", C("E4 G#4 B4 G#4")]];
    for (const [b, root, arp] of bars) {
      for (let k = 0; k < 8 && b + k * 0.5 < 17.5; k++) s.n("bass", b + k * 0.5, 0.45, `${root}${k % 2 ? 2 : 1}`, 0.5);
      s.arp("pluck", b, arp, 0.5, 8, 0.3);
    }
    play(s, "brass", [[2, 1.5, "E5"], [3.5, 0.5, "D5"], [4, 2, "C5"], [6, 1.5, "D5"], [7.5, 0.5, "C5"], [8, 2, "B4"], [10, 1.5, "C5"], [11.5, 0.5, "D5"], [12, 2, "E5"], [14, 3, "G#5"]], 0.35);
    s.hit("kick", s.range(2, 17.5, 1), 0.6).hit("clap", s.range(3, 17.5, 2), 0.4).hit("hat", s.range(2.5, 17.5, 1), 0.35);
    return s;
  },

  /** Creepy music box while the flashlight searches, then a cheerful "ta-da" in A major when the monster waves. */
  monster: () => {
    const s = new Song(88, { reverb: 0.4 });
    s.n("pad", 0, 3.8, C("A2 E3"), 0.25);
    play(s, "musicbox", [[0, 0.5, "A5"], [0.5, 0.5, "E5"], [1, 0.5, "F5"], [1.5, 0.5, "E5"], [2, 0.5, "C5"], [2.5, 0.5, "D5"], [3, 0.75, "B4"]], 0.55);
    s.at("swell", 2.1, 0.6, null, 0.4);
    C("A4 C#5 E5 A5 C#6 E6").forEach((p, k) => s.at("celesta", 2.7 + k * 0.045, 1, p, 0.32));
    s.at("pop", 2.7, 0.1, null, 0.5);
    const ch: [number, number, string[], string][] = [[4, 2, C("A3 C#4 E4"), "A1"], [6, 2, C("A3 D4 F#4"), "D2"], [8, 2, C("B3 E4 G#4"), "E2"], [10, 3, C("A3 C#4 E4"), "A1"]];
    for (const [b, d, notes, root] of ch) {
      s.n("bass", b, 1, root, 0.45).n("bass", b + 1, 1, root, 0.35);
      for (let k = 0; k < d; k++) s.n("pizz", b + k + 0.5, 0.3, notes, 0.25);
    }
    play(s, "celesta", [[4, 0.5, "C#5"], [4.5, 0.5, "E5"], [5, 1, "A5"], [6, 0.5, "F#5"], [6.5, 0.5, "A5"], [7, 1, "D6"], [8, 0.5, "B5"], [8.5, 0.5, "G#5"], [9, 1, "E5"], [10, 2.5, "A5"]], 0.5);
    s.hit("shaker", s.range(4, 12.5, 0.5), 0.2);
    return s;
  },

  /** Surf-rock spook: driving drums, walking bass and a wailing theremin. */
  witch: () => {
    const s = new Song(150, { reverb: 0.3 });
    const walk = [C("E2 B2 E3 B2"), C("G2 D3 G3 D3"), C("A2 E3 A3 E3"), C("B2 F#3 B3 F#3")];
    for (let bar = 0; bar < 6; bar++) {
      const b = bar * 4;
      walk[bar % 4].forEach((p, k) => s.n("bass", b + k, 0.9, p, 0.5));
      s.hit("kick", [b, b + 1.5, b + 2.5], 0.55).hit("snare", [b + 1, b + 3], 0.4).hit("hat", s.range(b, b + 4, 0.5), 0.25);
    }
    play(s, "theremin", [[0, 2, "E5"], [2, 1.5, "G5"], [3.5, 0.5, "F#5"], [4, 2, "E5"], [6, 2, "D5"], [8, 1.5, "C5"], [9.5, 0.5, "D5"], [10, 2, "E5"], [12, 4, "B4"], [16, 2, "E5"], [18, 1.5, "G5"], [19.5, 0.5, "A5"], [20, 2, "B5"]], 0.55);
    s.at("whoosh", 0, 0.6, null, 0.4);
    return s;
  },

  /** A rising build, then the beat drops at 0.94 s and the graveyard turns into a rave. */
  graveyard: () => {
    const s = new Song(128, { reverb: 0.3 });
    s.at("wind", 0, 1.2, null, 0.4).at("swell", 0, 0.94, null, 0.55).n("pad", 0, 2, C("A2 E3 A3"), 0.2);
    s.at("crash", 0.94, 1.6, null, 0.6);
    const bars: [number, string, string[]][] = [[2, "A1", C("A4 C5 E5")], [6, "F1", C("A4 C5 F5")], [10, "C2", C("G4 C5 E5")], [14, "E1", C("G#4 B4 E5")]];
    for (const [b, root, chord] of bars) {
      for (let k = 0; k < 8 && b + k * 0.5 < 18.8; k++) if (k % 2) s.n("bass", b + k * 0.5, 0.4, root.replace("1", "2"), 0.55);
      for (const off of [0.5, 1.5, 2.5, 3.25]) if (b + off < 18.8) s.n("pluck", b + off, 0.35, chord, 0.3);
    }
    s.hit("kick", s.range(2, 18.8, 1), 0.65).hit("clap", s.range(3, 18.8, 2), 0.4).hit("hat", s.range(2.5, 18.8, 1), 0.35).hit("shaker", s.range(2.25, 18.8, 0.5), 0.15);
    return s;
  },

  /** Gothic organ and harpsichord in D minor, with a camera shutter at each flash. */
  vampire: () => {
    const s = new Song(100, { reverb: 0.4 });
    const bars: [number, number, string[], string, string[]][] = [
      [0, 4, C("D3 F3 A3 D4"), "D2", C("D5 F5 A5 D6 A5 F5 D5 F5")],
      [4, 4, C("C#3 E3 A3 C#4"), "A1", C("C#5 E5 A5 C#6 A5 E5 C#5 E5")],
      [8, 4, C("D3 G3 Bb3 D4"), "G1", C("D5 G5 Bb5 D6 Bb5 G5 D5 G5")],
      [12, 2.7, C("C#3 E3 G3 A3"), "A1", C("C#5 E5 G5 A5 C#6")],
    ];
    for (const [b, d, chord, root, arp] of bars) {
      s.n("organ", b, d, chord, 0.45).n("bass", b, d, root, 0.4);
      s.arp("pizz", b, arp, 0.5, Math.round(d * 2), 0.3);
    }
    for (const f of [1.6, 4.6]) s.at("tick", f, 0.1, "C7", 0.9).at("pop", f + 0.02, 0.1, null, 0.4);
    return s;
  },
};
