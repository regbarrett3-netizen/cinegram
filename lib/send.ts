// Shared rules for the 1-2-3 send flow (safe for browser and server).
import { ACTION_TEXT, actionPriceCents, isActionId, type ActionId } from "./action/catalog";
import { CARD_TEXT, type CardOccasion } from "./cardsCatalog";
import type { Lang } from "./i18n";

export type SendKind = "quick" | "action" | "video";
export const PRICE: Record<SendKind, number> = { quick: 199, action: 299, video: 299 };
/** Shown under every pay button and on Stripe checkout: cards are delivered instantly, so sales are final. */
export const FINAL_SALE: Record<Lang, string> = {
  en: "All sales are final. Your card is delivered instantly.",
  es: "Todas las ventas son definitivas. Tu tarjeta se entrega al instante.",
  fr: "Toutes les ventes sont définitives. Ta carte est livrée instantanément.",
  pt: "Todas as vendas são finais. O teu cartão é entregue de imediato.",
  zh: "所有购买均不可退款。贺卡会立即送达。",
  yue: "所有購買都唔設退款。賀卡會即刻送到。",
};
export const priceLabel = (cents: number) => `$${(cents / 100).toFixed(2)}`;
/** What one card costs to send. Seasonal animated cards can cost less than the usual price for their kind. */
export function priceFor(kind: SendKind, cardId?: string | null): number {
  if (kind === "action" && cardId && isActionId(cardId)) return actionPriceCents(cardId);
  return PRICE[kind];
}

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
  halloween: ["dragon", "pumpkins", "skeletons", "monster", "witch", "graveyard", "vampire"],
};

/** Occasions where an action card's own wording already fits. */
const ACTION_HOME: Record<ActionId, CardOccasion[]> = {
  balloons: ["birthday"], roses: ["love", "anniversary"], doves: ["wedding"], lanterns: [], fireworks: ["congrats", "graduation"],
  hearts: ["love"], butterflies: ["baby"], petals: ["love", "anniversary", "wedding"], confetti: ["congrats", "birthday", "graduation"],
  champagne: ["congrats", "anniversary", "wedding", "graduation"], candles: ["birthday"], shooting: ["thinking"], snow: ["holidays"],
  sunflowers: [], dandelion: ["thinking"], gift: ["birthday"],
  dragon: ["halloween"], pumpkins: ["halloween"], skeletons: ["halloween"], monster: ["halloween"], witch: ["halloween"], graveyard: ["halloween"], vampire: ["halloween"],
};

/** A general greeting for each occasion, borrowed from its most versatile art card. */
const OCCASION_GREETING: Record<CardOccasion, string> = {
  birthday: "bdayBalloons", love: "loveRoseWreath", anniversary: "annivRings", wedding: "weddingArch", baby: "babyMoon",
  graduation: "gradCaps", congrats: "congratsFireworks", thanks: "thanksTulips", getwell: "getwellWindow",
  sympathy: "sympathyLilies", thinking: "thinkingDandelion", holidays: "holidayWreath", halloween: "thinkingDandelion",
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
  deliverBy?: "email" | "text";
  toPhone?: string;
};
export const WIZARD_KEY = "cinegram:send";
