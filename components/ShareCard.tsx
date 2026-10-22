"use client";

// "Your card is ready" screen for text/social delivery: the sender texts or shares the card link
// from their own phone. Used by the 1-2-3 send flow and the AI video card.
import { useState } from "react";
import { CheckCircle2, Copy, MessageSquare, RotateCcw, Share2 } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { SITE } from "../lib/siteText";
import { TEXT_UI, shareLinks, smsHref } from "../lib/textSend";

type Props = { lang: Lang; toName: string; fromName: string; toPhone?: string | null; link: string; onAnother: () => void };

export function ShareCard({ lang, toName, fromName, toPhone, link, onAnother }: Props) {
  const t = SITE[lang];
  const tx = TEXT_UI[lang];
  const [note, setNote] = useState<string | null>(null);
  const body = tx.smsBody(fromName, link);

  function shareMore() {
    if (typeof navigator.share === "function") navigator.share({ text: body, url: link }).catch(() => undefined);
    else navigator.clipboard?.writeText(link).then(() => setNote(tx.instagramHint)).catch(() => undefined);
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-amber-400 text-4xl shadow-xl shadow-pink-500/30">💌</div>
      <h2 className="title-serif text-4xl font-semibold text-amber-50">{tx.readyTitle(toName)}</h2>
      <p className="text-white/70">{tx.readyBody}</p>
      <a href={smsHref(toPhone || "", body)} className="btn-primary"><MessageSquare className="h-5 w-5" /> {tx.textIt(toName)}</a>
      <div className="space-y-2 pt-1">
        <p className="text-sm text-white/60">{tx.socialLabel}</p>
        <div className="grid grid-cols-2 gap-2">
          <a href={shareLinks.whatsapp(body)} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-sm">{tx.whatsapp}</a>
          <a href={shareLinks.facebook(link)} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-sm">{tx.postFacebook}</a>
          <a href={shareLinks.x(tx.postText(toName), link)} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-sm">{tx.postX}</a>
          <button onClick={shareMore} className="btn-secondary w-full text-sm"><Share2 className="h-4 w-4" /> {tx.instagram}</button>
        </div>
        {note && <p role="status" className="text-sm text-emerald-300">{note}</p>}
      </div>
      <button onClick={() => { navigator.clipboard?.writeText(link).then(() => setNote(tx.copied)).catch(() => undefined); }} className="btn-ghost"><Copy className="h-4 w-4" /> {tx.copyLink}</button>
      <a href={link} target="_blank" rel="noopener noreferrer" className="btn-ghost"><CheckCircle2 className="h-4 w-4" /> {t.viewCard}</a>
      <button onClick={onAnother} className="btn-ghost"><RotateCcw className="h-4 w-4" /> {t.another}</button>
    </div>
  );
}
