"use client";

import { useEffect, useRef, useState } from "react";
import { drawCard } from "../../lib/cardRender";
import { CARD_FONT_FAMILY } from "../../lib/cardFont";
import type { Lang } from "../../lib/i18n";

type Props = {
  artKey: string;
  lang: Lang;
  to?: string;
  from?: string;
  watermark?: string;
  /** Upper limit on drawing resolution (1 = 500×700 px). */
  maxScale?: number;
  className?: string;
  label?: string;
};

/** A card drawn exactly as it will download, sized to fit its container. */
export function CardCanvas({ artKey, lang, to, from, watermark, maxScale = 2, className = "", label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  // Only draw once the card is near the screen (an occasion page has 20 of them).
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(c);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c || !visible) return;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = c.clientWidth || 300;
    const scale = Math.max(0.4, Math.min(maxScale, (width / 500) * dpr));
    drawCard(c, { artKey, lang, to, from, watermark, scale, fontFamily: CARD_FONT_FAMILY })
      .then(() => !cancelled && setReady(true))
      .catch((e) => console.error(e));
    return () => {
      cancelled = true;
    };
  }, [artKey, lang, to, from, watermark, maxScale, visible]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className={`block w-full aspect-[5/7] rounded-xl shadow-2xl ${ready ? "" : "animate-pulse bg-slate-800"} ${className}`}
    />
  );
}
