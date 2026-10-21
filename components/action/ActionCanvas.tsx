"use client";

import { useEffect, useRef, useState } from "react";
import { POSTER_T, type ActionId } from "../../lib/action/catalog";
import { VIDEO_LEN, drawFrame, loadFonts, prep } from "../../lib/action/render";
import { W } from "../../lib/action/engine";
import { CARD_FONT_FAMILY } from "../../lib/cardFont";
import type { Lang } from "../../lib/i18n";

type Props = {
  id: ActionId;
  lang: Lang;
  to?: string;
  from?: string;
  watermark?: string;
  /** Loop the animation; otherwise show one still frame. */
  playing?: boolean;
  maxScale?: number;
  className?: string;
  label?: string;
};

/** An action card drawn live, exactly as it will appear in the video. */
export function ActionCanvas({ id, lang, to, from, watermark, playing = false, maxScale = 1, className = "", label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  // Latest text options, read by the animation loop without restarting it.
  const opts = useRef({ lang, to, from, watermark, fontFamily: CARD_FONT_FAMILY });
  opts.current = { lang, to, from, watermark, fontFamily: CARD_FONT_FAMILY };

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (typeof IntersectionObserver === "undefined") return setVisible(true);
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (setVisible(true), io.disconnect()), { rootMargin: "300px 0px" });
    io.observe(c);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !visible) return;
    let raf = 0, stopped = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.max(0.2, Math.min(maxScale, ((canvas.clientWidth || 200) / W) * dpr));
    const c = prep(canvas, scale);
    loadFonts(id, opts.current).then(() => {
      if (stopped) return;
      if (!playing) {
        drawFrame(c, id, POSTER_T[id], opts.current);
        setReady(true);
        return;
      }
      const start = performance.now();
      const loop = () => {
        if (stopped) return;
        const t = ((performance.now() - start) / 1000) % (VIDEO_LEN + 0.6);
        c.setTransform(scale, 0, 0, scale, 0, 0);
        drawFrame(c, id, t, opts.current);
        setReady(true);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
    // Still frames redraw when the names change; the playing loop picks them up itself.
  }, [id, visible, playing, maxScale, playing ? "" : `${lang}|${to}|${from}|${watermark}`]);

  return <canvas ref={ref} role="img" aria-label={label} className={`block w-full aspect-[9/16] rounded-2xl shadow-2xl ${ready ? "" : "animate-pulse bg-slate-800"} ${className}`} />;
}
