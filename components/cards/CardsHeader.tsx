"use client";

import Link from "next/link";
import { Film, Globe } from "lucide-react";
import { LANGUAGES, isLang, type Lang } from "../../lib/i18n";

export function CardsHeader({ lang, setLang, backHref, backLabel }: { lang: Lang; setLang: (l: Lang) => void; backHref: string; backLabel: string }) {
  return (
    <header className="w-full max-w-3xl mb-6">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Film className="w-7 h-7 shrink-0 text-pink-500" />
          <span className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-amber-300">
            CINEGRAM
          </span>
        </Link>
        <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300">
          <Globe className="w-4 h-4 text-purple-400" />
          <span className="sr-only">Language</span>
          <select value={lang} onChange={(e) => isLang(e.target.value) && setLang(e.target.value)} className="bg-transparent outline-none">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900">
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Link href={backHref} className="inline-block mt-3 text-xs text-slate-400 hover:text-white">
        {backLabel}
      </Link>
    </header>
  );
}
