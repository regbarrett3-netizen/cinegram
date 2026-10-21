"use client";

import { useEffect, useState } from "react";
import { isLang, type Lang } from "../../lib/i18n";

const KEY = "cinegram:lang";

function guess(): Lang | null {
  const nav = (typeof navigator !== "undefined" && navigator.language) || "";
  const l = nav.toLowerCase();
  if (l.startsWith("zh-hk") || l.startsWith("zh-mo") || l.startsWith("yue")) return "yue";
  if (l.startsWith("zh")) return "zh";
  const two = l.slice(0, 2);
  return isLang(two) ? two : null;
}

/** Language from ?lang=, then the last choice on this device, then the browser. */
export function useCardLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* storage blocked */
    }
    const pick = isLang(q) ? q : isLang(stored) ? stored : guess();
    if (pick) setLang(pick);
  }, []);
  const update = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* storage blocked */
    }
  };
  return [lang, update];
}
