"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Heart, Loader2, Volume2, VolumeX } from "lucide-react";
import { CardCanvas } from "./cards/CardCanvas";
import { ActionCanvas } from "./action/ActionCanvas";
import { useCardMusic } from "./action/useCardMusic";
import { CARD_TEXT, cardById, isCardOccasion } from "../lib/cardsCatalog";
import { ACTION_TEXT, ACTION_UI, isActionId } from "../lib/action/catalog";
import { recordVideo, videoSupport } from "../lib/action/render";
import { musicFor } from "../lib/action/music";
import { cardPng } from "../lib/cardRender";
import { CARD_FONT_FAMILY } from "../lib/cardFont";
import { loadImage } from "../lib/polaroid";
import { actionTextFor } from "../lib/send";
import { SITE } from "../lib/siteText";
import { GROWTH } from "../lib/growthText";
import type { Lang } from "../lib/i18n";

export type PublicCard = {
  id: string;
  /** True when a reply can be sent straight back for free. */
  replyFree: boolean;
  kind: "quick" | "action" | "video";
  cardId: string | null;
  occasion: string | null;
  lang: Lang;
  toName: string;
  fromName: string;
  photoUrl: string | null;
  videoUrl: string | null;
};

async function saveFile(file: File) {
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file] }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function RecipientView({ card }: { card: PublicCard }) {
  const lang = card.lang;
  const t = SITE[lang];
  const music = useCardMusic();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canVideo, setCanVideo] = useState(false);
  useEffect(() => setCanVideo(!!videoSupport(true)), []);

  useEffect(() => { if (card.photoUrl) loadImage(card.photoUrl).then(setPhoto).catch(() => undefined); }, [card.photoUrl]);

  const occasion = card.occasion && isCardOccasion(card.occasion) ? card.occasion : null;
  const actionId = card.kind === "action" && card.cardId && isActionId(card.cardId) ? card.cardId : null;
  const quickId = card.kind === "quick" && card.cardId && cardById(card.cardId) ? card.cardId : null;
  const text = actionId ? (occasion ? actionTextFor(actionId, occasion, lang) : { h: ACTION_TEXT[lang][actionId].h, m: ACTION_TEXT[lang][actionId].m }) : undefined;
  const names = { to: card.toName, from: card.fromName };

  function openCard() { music.unlock(); setOpen(true); }

  async function save() {
    setError(null);
    try {
      if (quickId) {
        setSaving(0);
        await saveFile(await cardPng({ artKey: quickId, lang, ...names, fontFamily: CARD_FONT_FAMILY, photo }, `cinegram-${quickId}.png`));
      } else if (actionId) {
        setSaving(0);
        const ctx = music.unlock();
        const audio = ctx ? { ctx, buffer: await musicFor(actionId) } : undefined;
        const file = await recordVideo(actionId, { lang, ...names, fontFamily: CARD_FONT_FAMILY, photo, text }, (p) => setSaving(p), audio);
        await saveFile(file);
      }
    } catch (e) { setError((e as Error).message === "NO_VIDEO" ? t.error : (e as Error).message || t.error); }
    finally { setSaving(null); }
  }

  return (
    <main className="page font-sans">
      <div className="mb-6 flex items-center gap-2 text-lg font-black tracking-[0.2em]">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-base">💌</span>
        <span className="bg-gradient-to-r from-pink-300 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent">CINEGRAM</span>
      </div>

      {!open ? (
        <button onClick={openCard} className="group flex w-full max-w-sm flex-col items-center gap-6 py-10" aria-label={t.rTap}>
          <div className="relative h-56 w-80 max-w-full">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-200 to-amber-100 shadow-2xl shadow-pink-500/20 transition group-hover:-translate-y-1" />
            <div className="absolute inset-x-0 top-0 h-28 origin-top rounded-t-2xl bg-gradient-to-b from-rose-300 to-rose-200 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            <div className="absolute left-1/2 top-[5.5rem] grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-pink-600 to-rose-700 text-2xl shadow-lg ring-4 ring-rose-100/60 animate-pulse">
              <Heart className="h-6 w-6 fill-white text-white" />
            </div>
            <p className="title-serif absolute inset-x-4 bottom-6 truncate text-center text-2xl font-semibold text-rose-900">{card.toName}</p>
          </div>
          <div className="text-center">
            <h1 className="title-serif text-3xl sm:text-4xl font-semibold text-amber-50">{t.rFrom(card.fromName)}</h1>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-slate-900 shadow-lg">{t.rTap}</p>
          </div>
        </button>
      ) : (
        <div className="flex w-full max-w-md flex-col items-center gap-5 card-reveal">
          {quickId && <CardCanvas artKey={quickId} lang={lang} {...names} photo={photo} maxScale={2.4} label={CARD_TEXT[lang][quickId].h} />}
          {actionId && (
            <div className="relative w-full">
              <ActionCanvas id={actionId} lang={lang} {...names} photo={photo} text={text} playing maxScale={1.2} onCycle={() => music.start(actionId)} label={ACTION_TEXT[lang][actionId].name} />
              <button onClick={() => music.setMuted(!music.muted)} aria-label={music.muted ? ACTION_UI[lang].soundOn : ACTION_UI[lang].soundOff} className="absolute right-3 top-3 rounded-full bg-black/45 p-2.5 backdrop-blur hover:bg-black/60">
                {music.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          )}
          {card.kind === "video" && card.videoUrl && (
            <video src={card.videoUrl} controls autoPlay playsInline className="w-full rounded-2xl shadow-2xl" />
          )}

          {error && <p role="alert" className="alert w-full">{error}</p>}

          {(quickId || (actionId && canVideo)) && (
            <button onClick={save} disabled={saving !== null} className="btn-secondary">
              {saving !== null ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {saving !== null ? (actionId && saving > 0 ? `${t.rSaving} ${saving}%` : t.rSaving) : t.rDownload}
            </button>
          )}
          {card.kind === "video" && card.videoUrl && (
            <a href={card.videoUrl} download className="btn-secondary"><Download className="h-5 w-5" /> {t.rDownload}</a>
          )}
          <Link href={`/?reply=${card.id}&lang=${lang}`} className="btn-primary"><Heart className="h-5 w-5" /> {GROWTH[lang].replyBtn}</Link>
          {card.replyFree && <p className="-mt-2 text-center text-sm text-white/60">{GROWTH[lang].replyFreeNote}</p>}
        </div>
      )}
    </main>
  );
}
