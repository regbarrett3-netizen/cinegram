// The serif used for card greetings, self-hosted by Next.js at build time.
import { Cormorant_Garamond } from "next/font/google";

export const cardSerif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Font list for drawing on the canvas; Chinese falls back to the device's serif. */
export const CARD_FONT_FAMILY = `${cardSerif.style.fontFamily}, "Noto Serif SC", "Noto Serif TC", "Songti SC", "STSong", "PingFang SC", serif`;
