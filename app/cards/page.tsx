"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { CardsHeader } from "../../components/cards/CardsHeader";
import { useCardLang } from "../../components/cards/useCardLang";
import { CARD_OCCASIONS, CARD_UI, OCCASION_COVER, OCCASION_EMOJI, OCCASION_NAMES, cardsFor } from "../../lib/cardsCatalog";
import { SITE } from "../../lib/siteText";

export default function QuickCardsHome() {
  const [lang, setLang] = useCardLang();
  const ui = CARD_UI[lang];
  const names = OCCASION_NAMES[lang];
  const st = SITE[lang];

  return (
    <main className="page font-sans">
      <CardsHeader lang={lang} setLang={setLang} />

      <section className="w-full max-w-5xl text-center mb-8 space-y-3">
        <h1 className="title-serif text-4xl sm:text-6xl font-semibold text-amber-50">
          {ui.title}
        </h1>
        <p className="text-white/70 text-sm sm:text-base">{ui.tagline}</p>
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
          <Sparkles className="w-3.5 h-3.5" /> {ui.noAi} · {ui.price}
        </p>
        <div className="pt-2">
          <Link href={`/?lang=${lang}`} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-amber-50 transition">
            💌 {st.heroTitle} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <h2 className="pt-4 text-lg font-bold">{ui.pickOccasion}</h2>
      </section>

      <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {CARD_OCCASIONS.map((o) => (
          <Link
            key={o}
            href={`/cards/${o}?lang=${lang}`}
            className="tile group"
          >
            <div className="aspect-[5/4] overflow-hidden bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/card-art/${OCCASION_COVER[o]}`}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="px-3 py-3 text-left">
              <p className="font-bold text-sm sm:text-base">
                <span aria-hidden="true">{OCCASION_EMOJI[o]}</span> {names[o]}
              </p>
              <p className="text-xs text-white/55">{ui.cardsCount(cardsFor(o).length)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
