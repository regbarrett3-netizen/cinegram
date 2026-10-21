"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { CardsHeader } from "../../components/cards/CardsHeader";
import { useCardLang } from "../../components/cards/useCardLang";
import { CARD_OCCASIONS, CARD_UI, OCCASION_COVER, OCCASION_EMOJI, OCCASION_NAMES, cardsFor } from "../../lib/cardsCatalog";
import { cardSerif } from "../../lib/cardFont";

export default function QuickCardsHome() {
  const [lang, setLang] = useCardLang();
  const ui = CARD_UI[lang];
  const names = OCCASION_NAMES[lang];

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 sm:p-8 font-sans">
      <CardsHeader lang={lang} setLang={setLang} backHref="/" backLabel={ui.videoCards} />

      <section className="w-full max-w-3xl text-center mb-8 space-y-3">
        <h1 className="text-4xl sm:text-5xl font-semibold text-amber-100" style={{ fontFamily: cardSerif.style.fontFamily }}>
          {ui.title}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">{ui.tagline}</p>
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
          <Sparkles className="w-3.5 h-3.5" /> {ui.noAi} · {ui.price}
        </p>
        <h2 className="pt-4 text-lg font-bold">{ui.pickOccasion}</h2>
      </section>

      <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {CARD_OCCASIONS.map((o) => (
          <Link
            key={o}
            href={`/cards/${o}?lang=${lang}`}
            className="group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 hover:border-pink-500/60 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
          >
            <div className="aspect-[5/4] overflow-hidden bg-slate-800">
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
              <p className="text-xs text-slate-400">{ui.cardsCount(cardsFor(o).length)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
