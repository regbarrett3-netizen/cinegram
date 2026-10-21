// 17 more cards per occasion, each composed from a background style, a centerpiece motif and a palette.
import type { Art } from "./artKit";
import { PAL, background, type BgKind, type BgOpt, type PalName } from "./artScenes";
import * as M1 from "./artMotifs1";
import * as M2 from "./artMotifs2";
import type { Motif, Opt } from "./artMotifs1";

const MOTIFS: Record<string, Motif> = { ...(M1 as unknown as Record<string, Motif>), ...(M2 as unknown as Record<string, Motif>) };

type V = [motif: string, bg: BgKind, pal: PalName, o?: Opt, b?: BgOpt];

const AUTUMN: Opt = { c1: "#e3a24a", c2: "#d9693e", c3: "#f2c45a" };
const SPRING: Opt = { c1: "#f2c9c2", c2: "#e8a6a6", c3: "#ffffff" };
const GOLDS: Opt = { c1: "#d4a845", c2: "#f3d07a" };

/** In order: cards 04…20 for each occasion. */
export const VARIANTS: Record<string, V[]> = {
  birthday: [
    ["cakeSimple", "confetti", "butter", { k: 3 }], ["cupcake", "pattern", "blush", { alt: true }, { tile: "dot" }], ["balloons", "clouds", "sky", { k: 7 }],
    ["giftBox", "confetti", "coral", { c1: "#5fb2a8", c2: "#f6c565" }], ["partyHats", "halo", "lavender"], ["bunting", "halo", "cream"], ["lanterns", "bokeh", "plum"],
    ["starBig", "stars", "night"], ["bouquet", "halo", "blush", { c1: "#f2a8a6" }], ["heartBalloon", "clouds", "peach"], ["giftStack", "confetti", "mint"],
    ["cakeSimple", "bokeh", "plum", { c1: "#f3d9e3", c2: "#c96b8f", k: 5 }], ["sunflowerBig", "hills", "sky"], ["hotAir", "halo", "peach"],
    ["confettiBurst", "rays", "navy"], ["popper", "rays", "butter"], ["vase", "wash", "cream", { k: 0 }],
  ],
  love: [
    ["heartBig", "halo", "blush"], ["heartCluster", "bokeh", "wine"], ["singleRose", "wash", "cream", { c1: "#d9484d", c2: "#9c2a36" }], ["birdsBranch", "halo", "mint"],
    ["birdsWire", "halo", "peach"], ["envelope", "pattern", "lavender", {}, { tile: "heart" }], ["mugsTwo", "halo", "coral"], ["heartBalloon", "stars", "night"],
    ["umbrella", "halo", "sky", { c1: "#e7837f", c2: "#f3bdb3" }], ["garlandStars", "halo", "blush", { sym: "heart" }], ["swans", "sea", "dusk"], ["flowerRing", "halo", "cream"],
    ["cat", "pattern", "butter", {}, { tile: "heart" }], ["infinity", "stars", "plum"], ["moonStars", "stars", "night"], ["vase", "halo", "blush", { k: 1, c1: "#e7837f", c2: "#c94f5f" }],
    ["wreath", "halo", "sage", { sym: "heart" }],
  ],
  anniversary: [
    ["infinity", "halo", "cream", GOLDS], ["hourglass", "stars", "navy"], ["bench", "halo", "cream", AUTUMN], ["swans", "sea", "sky"], ["mugsTwo", "halo", "sage"],
    ["wreath", "halo", "cream", { sym: "rings" }], ["floatLanterns", "stars", "dusk"], ["tree", "hills", "butter"], ["heartBig", "bokeh", "wine", { c1: "#e3a0a8", c2: "#c9474f" }],
    ["vase", "halo", "pearl", { k: 1, c1: "#f2c9c2", c2: "#d99a9a" }], ["birdsBranch", "halo", "cream"], ["moonPhases", "stars", "night"], ["ringBox", "bokeh", "plum"],
    ["champagne", "bokeh", "teal"], ["envelope", "pattern", "cream", {}, { tile: "heart" }], ["compass", "halo", "sky"], ["flowerRing", "halo", "blush"],
  ],
  wedding: [
    ["weddingCake", "halo", "blush", { c1: "#f2a8a6", c2: "#f7d3cc" }], ["bells", "halo", "pearl", { c1: "#e9c8c4" }], ["ringBox", "halo", "blush", { c1: "#e9c8c4" }],
    ["swans", "sea", "lavender"], ["wreath", "halo", "sage", { sym: "rings" }], ["bouquet", "halo", "sage", { c1: "#f6d0c8", c2: "#d98f8f" }],
    ["heartBalloon", "clouds", "sky", { c1: "#f2a8a6", c2: "#d98f8f" }], ["champagne", "bokeh", "navy"], ["doveFly", "clouds", "sky"], ["lanterns", "bokeh", "dusk"],
    ["infinity", "halo", "cream", GOLDS], ["vase", "halo", "sage", { k: 4, c3: "#e6ece2" }], ["flowerRing", "halo", "blush"], ["mugsTwo", "halo", "peach"],
    ["garlandStars", "halo", "sky", { sym: "heart" }], ["moonStars", "stars", "night"], ["bench", "halo", "sage", SPRING],
  ],
  baby: [
    ["teddy", "pattern", "mint", {}, { tile: "star" }], ["clothesline", "halo", "peach"], ["rattle", "halo", "lavender"], ["footprints", "pattern", "sky", {}, { tile: "dot" }],
    ["duck", "halo", "sky"], ["blocks", "halo", "butter"], ["moonPhases", "halo", "lavender"], ["balloons", "clouds", "mint", { k: 5 }], ["heartBalloon", "clouds", "blush"],
    ["starBig", "stars", "navy", { c1: "#f6dc9a" }], ["birdsBranch", "halo", "butter"], ["sprout", "halo", "sage"], ["kite", "clouds", "sky"], ["garlandStars", "halo", "peach"],
    ["moonStars", "halo", "lavender"], ["cupcake", "pattern", "blush", {}, { tile: "heart" }], ["wreath", "halo", "mint", { sym: "star" }],
  ],
  graduation: [
    ["diploma", "confetti", "sky"], ["books", "halo", "cream"], ["bulb", "stars", "navy"], ["rocket", "stars", "night"], ["compass", "halo", "sage"], ["trophy", "bokeh", "teal"],
    ["medal", "rays", "butter"], ["hotAir", "halo", "sky"], ["kite", "clouds", "mint"], ["mountains", "halo", "peach"], ["starBig", "stars", "plum"], ["champagne", "bokeh", "navy"],
    ["books", "halo", "sage", { alt: true }], ["balloons", "confetti", "butter"], ["fireworks", "stars", "night"], ["paperBoat", "halo", "peach"], ["sprout", "rays", "butter"],
  ],
  congrats: [
    ["trophy", "bokeh", "navy"], ["medal", "confetti", "sky"], ["champagne", "bokeh", "plum"], ["popper", "halo", "coral"], ["rocket", "halo", "lavender"], ["starBig", "rays", "butter"],
    ["fireworks", "stars", "dusk"], ["confettiBurst", "rays", "cream"], ["balloons", "confetti", "coral"], ["giftBox", "bokeh", "navy", { c1: "#d9b26a", c2: "#c43a3f" }],
    ["mountains", "halo", "sky"], ["cakeSimple", "confetti", "mint"], ["bunting", "halo", "sky"], ["lanterns", "bokeh", "teal"], ["hotAir", "halo", "peach"], ["bulb", "halo", "butter"],
    ["heartBig", "rays", "coral"],
  ],
  thanks: [
    ["vase", "halo", "sky", { k: 2 }], ["bouquet", "halo", "peach"], ["giftBox", "pattern", "sage", { c1: "#e7a3a0", c2: "#f2c14e" }, { tile: "leaf" }], ["envelope", "halo", "butter"], ["heartCluster", "halo", "coral"],
    ["mugsTwo", "halo", "cream"], ["sunRays", "halo", "sky"], ["butterflies", "halo", "mint"], ["vase", "halo", "lavender", { k: 3 }], ["flowerRing", "halo", "butter"],
    ["cupcake", "pattern", "mint", {}, { tile: "dot" }], ["singleRose", "halo", "blush"], ["heartBig", "rays", "peach"], ["wreath", "halo", "cream", { sym: "heart" }],
    ["sprout", "halo", "sky"], ["bookTea", "halo", "sage"], ["lanterns", "bokeh", "forest"],
  ],
  getwell: [
    ["soup", "halo", "butter"], ["bandageHeart", "halo", "sky"], ["bookTea", "halo", "peach"], ["sunRays", "clouds", "butter"], ["sprout", "halo", "mint"], ["butterflies", "halo", "sage"],
    ["vase", "halo", "sky", { k: 0 }], ["cat", "halo", "lavender"], ["rainbowCloud", "halo", "mint"], ["umbrella", "halo", "sky"], ["kite", "clouds", "peach"], ["hotAir", "halo", "mint"],
    ["sunflowerBig", "hills", "butter"], ["duck", "halo", "sky"], ["flowerRing", "halo", "mint"], ["heartBalloon", "clouds", "coral"], ["sunbeams", "halo", "sky"],
  ],
  sympathy: [
    ["feather", "halo", "slate"], ["doveFly", "clouds", "pearl"], ["candleTrio", "halo", "slate"], ["floatLanterns", "stars", "dusk"],
    ["tree", "halo", "cream", { c1: "#c9774a", c2: "#e0a05a", c3: "#a85a3a" }], ["vase", "halo", "slate", { k: 4, c3: "#9fb3c9" }], ["moonStars", "stars", "night"],
    ["butterflies", "halo", "pearl", { c1: "#9fb6d8", c2: "#c3b1df" }], ["mountains", "halo", "lavender", { c1: "#fff0e0", c2: "#b9b1cc", c3: "#9a92b4" }], ["bench", "halo", "pearl", AUTUMN],
    ["sunbeams", "halo", "slate"], ["paperBoat", "halo", "pearl"], ["wreath", "halo", "sage", { sym: "dove" }], ["lotus", "halo", "teal", { c1: "#f2d6dc" }],
    ["singleRose", "halo", "slate", { c1: "#fbf7f0", c2: "#cfc6b8" }], ["starBig", "stars", "navy", { c1: "#e8dcc0" }], ["vase", "halo", "pearl", { k: 3 }],
  ],
  thinking: [
    ["envelope", "halo", "sky"], ["mugsTwo", "halo", "peach"], ["umbrella", "halo", "lavender"], ["paperBoat", "sea", "dusk"], ["hotAir", "halo", "sky"], ["moonStars", "stars", "night"],
    ["birdsWire", "halo", "butter"], ["butterflies", "halo", "blush"], ["kite", "clouds", "sky"], ["heartBalloon", "clouds", "lavender"], ["sunflowerBig", "hills", "sky"],
    ["cat", "pattern", "peach", {}, { tile: "heart" }], ["bookTea", "halo", "cream"], ["bench", "halo", "sage", SPRING], ["floatLanterns", "stars", "dusk"], ["garlandStars", "stars", "night"],
    ["sprout", "halo", "peach"],
  ],
  holidays: [
    ["snowflakeBig", "snow", "navy"], ["ornaments", "bokeh", "forest"], ["snowman", "snow", "navy", { c1: "#c43a3f" }, { moon: true }], ["mittens", "pattern", "cream", { c1: "#c43a3f", c2: "#2f6b48" }, { tile: "snow" }],
    ["gingerHouse", "snow", "wine"], ["holly", "halo", "cream"], ["cocoa", "snow", "plum", { c1: "#c43a3f" }], ["starBig", "stars", "forest"], ["lanterns", "bokeh", "wine"],
    ["giftStack", "bokeh", "forest"], ["candleTrio", "bokeh", "navy"], ["wreath", "halo", "cream", { sym: "star", c1: "#c43a3f" }], ["ornaments", "pattern", "cream", {}, { tile: "star" }],
    ["snowflakeBig", "halo", "sky", { c1: "#8fb0d6" }], ["garlandStars", "stars", "navy"], ["floatLanterns", "stars", "dusk"], ["moonStars", "snow", "navy"],
  ],
};

export const MORE_IDS: Record<string, string[]> = Object.fromEntries(
  Object.entries(VARIANTS).map(([occ, list]) => [occ, list.map((_, i) => `${occ}${String(i + 4).padStart(2, "0")}`)]),
);

export const MORE_ART: Record<string, () => Art> = {};
for (const [occ, list] of Object.entries(VARIANTS)) {
  list.forEach(([motif, bg, pal, o = {}, b = {}], i) => {
    const id = MORE_IDS[occ][i];
    MORE_ART[id] = () => {
      const P = PAL[pal];
      const fn = MOTIFS[motif];
      if (!fn) throw new Error(`Unknown motif ${motif}`);
      const seed = (o.seed ?? 0) + i * 17 + occ.length * 3 + 5;
      return { paper: P.paper, ink: P.ink, accent: P.accent, svg: background(bg, P, { seed, ...b }) + fn(P, { seed, ...o }) };
    };
  });
}
