"use client";

import Link from "next/link";
import { Globe, Mail, LayoutGrid, Sparkles, Video } from "lucide-react";
import { LANGUAGES, isLang, type Lang } from "../lib/i18n";
import { SITE } from "../lib/siteText";

type Active = "send" | "browse" | "action" | "video" | "none";

/** One header for every page: logo, main sections and the language picker. */
export function SiteHeader({ lang, setLang, active = "none" }: { lang: Lang; setLang: (l: Lang) => void; active?: Active }) {
  const t = SITE[lang].nav;
  const items: { key: Active; href: string; label: string; icon: typeof Mail }[] = [
    { key: "send", href: "/", label: t.send, icon: Mail },
    { key: "browse", href: "/cards", label: t.browse, icon: LayoutGrid },
    { key: "action", href: "/action", label: t.action, icon: Sparkles },
    { key: "video", href: "/video", label: t.video, icon: Video },
  ];
  return (
    <header className="w-full max-w-5xl pt-4 sm:pt-6 mb-6 sm:mb-10">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/?lang=${lang}`} className="flex min-w-0 items-center gap-2.5" aria-label="CineGramCards.com home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl bg-[#e7decd] object-cover shadow-lg shadow-black/30 ring-1 ring-amber-200/40" />
          <span className="truncate font-serif text-xl sm:text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-amber-200 to-teal-200">
            CineGramCards<span className="hidden sm:inline">.com</span>
          </span>
        </Link>
        <label className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
          <Globe className="h-4 w-4 text-fuchsia-300" />
          <span className="sr-only">Language</span>
          <select value={lang} onChange={(e) => isLang(e.target.value) && setLang(e.target.value)} className="bg-transparent outline-none">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code} className="bg-slate-900">{l.label}</option>)}
          </select>
        </label>
      </div>
      <nav className="no-scrollbar mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {items.map(({ key, href, label, icon: Icon }) => (
          <Link
            key={key}
            href={`${href}?lang=${lang}`}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
              active === key ? "bg-white text-slate-900" : "border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
