// Shared rules for the 1-2-3 send flow (safe for browser and server).
import { ACTION_TEXT, type ActionId } from "./action/catalog";
import { CARD_TEXT, type CardOccasion } from "./cardsCatalog";
import type { Lang } from "./i18n";

export type SendKind = "quick" | "action" | "video";
export const PRICE: Record<SendKind, number> = { quick: 199, action: 299, video: 299 };
export const priceLabel = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** Action cards that suit each occasion, best first. */
export const OCCASION_ACTIONS: Record<CardOccasion, ActionId[]> = {
  birthday: ["candles", "balloons", "confetti", "gift", "fireworks", "champagne"],
  love: ["roses", "hearts", "petals", "shooting", "lanterns", "doves"],
  anniversary: ["roses", "champagne", "petals", "lanterns", "hearts", "fireworks"],
  wedding: ["doves", "petals", "champagne", "roses", "lanterns", "hearts"],
  baby: ["balloons", "shooting", "butterflies", "gift", "sunflowers", "doves"],
  graduation: ["fireworks", "confetti", "balloons", "champagne", "lanterns", "shooting"],
  congrats: ["fireworks", "confetti", "champagne", "balloons", "gift", "sunflowers"],
  thanks: ["sunflowers", "gift", "butterflies", "roses", "balloons", "hearts"],
  getwell: ["sunflowers", "butterflies", "balloons", "dandelion", "doves", "hearts"],
  sympathy: ["doves", "lanterns", "dandelion", "butterflies", "shooting", "roses"],
  thinking: ["dandelion", "hearts", "lanterns", "butterflies", "shooting", "balloons"],
  holidays: ["snow", "lanterns", "fireworks", "gift", "champagne", "shooting"],
};

/** Occasions where an action card's own wording already fits. */
const ACTION_HOME: Record<ActionId, CardOccasion[]> = {
  balloons: ["birthday"], roses: ["love", "anniversary"], doves: ["wedding"], lanterns: [], fireworks: ["congrats", "graduation"],
  hearts: ["love"], butterflies: ["baby"], petals: ["love", "anniversary", "wedding"], confetti: ["congrats", "birthday", "graduation"],
  champagne: ["congrats", "anniversary", "wedding", "graduation"], candles: ["birthday"], shooting: ["thinking"], snow: ["holidays"],
  sunflowers: [], dandelion: ["thinking"], gift: ["birthday"],
};

/** A general greeting for each occasion, borrowed from its most versatile art card. */
const OCCASION_GREETING: Record<CardOccasion, string> = {
  birthday: "bdayBalloons", love: "loveRoseWreath", anniversary: "annivRings", wedding: "weddingArch", baby: "babyMoon",
  graduation: "gradCaps", congrats: "congratsFireworks", thanks: "thanksTulips", getwell: "getwellWindow",
  sympathy: "sympathyLilies", thinking: "thinkingDandelion", holidays: "holidayWreath",
};

/** Headline and message for an action card sent for a given occasion. */
export function actionTextFor(id: ActionId, occasion: CardOccasion, lang: Lang): { h: string; m: string } {
  if (ACTION_HOME[id].includes(occasion)) { const t = ACTION_TEXT[lang][id]; return { h: t.h, m: t.m }; }
  return CARD_TEXT[lang][OCCASION_GREETING[occasion]];
}

/** The AI video app has four moods; pick the closest. */
export function videoOccasion(o: CardOccasion): "bday" | "love" | "party" | "victory" {
  if (o === "birthday") return "bday";
  if (o === "love" || o === "anniversary" || o === "wedding" || o === "thinking" || o === "sympathy" || o === "getwell") return "love";
  if (o === "graduation" || o === "congrats") return "victory";
  return "party";
}

export type WizardState = {
  occasion?: CardOccasion;
  toName?: string;
  toEmail?: string;
  fromName?: string;
  lang?: Lang;
};
export const WIZARD_KEY = "cinegram:send";
