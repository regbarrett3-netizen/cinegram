"use client";

import Link from "next/link";
import { SiteHeader } from "../SiteHeader";
import type { Lang } from "../../lib/i18n";

/** Kept for the browse pages: the site header plus a small back link. */
export function CardsHeader({ lang, setLang, backHref, backLabel, active = "browse" }: { lang: Lang; setLang: (l: Lang) => void; backHref?: string; backLabel?: string; active?: "browse" | "action" }) {
  return (
    <div className="w-full max-w-5xl flex flex-col items-center">
      <SiteHeader lang={lang} setLang={setLang} active={active} />
      {backHref && backLabel && (
        <div className="w-full -mt-4 mb-4">
          <Link href={backHref} className="btn-ghost">{backLabel}</Link>
        </div>
      )}
    </div>
  );
}
