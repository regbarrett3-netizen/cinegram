// The "Quick Cards" button label on the main page, kept separate so that page
// doesn't load the whole card catalog.
import type { Lang } from "./i18n";

export const CARDS_PROMO: Record<Lang, string> = {
  en: "Quick Cards — ready-made art cards, $1.99 →",
  es: "Tarjetas rápidas: ilustradas y listas, 1,99 US$ →",
  fr: "Cartes express : cartes illustrées prêtes, 1,99 $ US →",
  pt: "Cartões rápidos: ilustrados e prontos, 1,99 USD →",
  zh: "快速贺卡：现成的艺术贺卡，1.99 美元 →",
  yue: "快速賀卡：現成藝術賀卡，1.99 美元 →",
};

export const ACTION_PROMO: Record<Lang, string> = {
  en: "Action Cards — animated video cards, $2.99 →",
  es: "Tarjetas en acción: videotarjetas animadas, 2,99 US$ →",
  fr: "Cartes animées : cartes vidéo, 2,99 $ US →",
  pt: "Cartões animados: cartões em vídeo, 2,99 USD →",
  zh: "动态贺卡：动画视频贺卡，2.99 美元 →",
  yue: "動態賀卡：動畫影片賀卡，2.99 美元 →",
};
