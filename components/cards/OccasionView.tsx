"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Download, Loader2, Share2, X } from "lucide-react";
import { CardCanvas } from "./CardCanvas";
import { CardsHeader } from "./CardsHeader";
import { useCardLang } from "./useCardLang";
import { CARD_TEXT, CARD_UI, OCCASION_EMOJI, OCCASION_NAMES, cardById, cardsFor, type CardOccasion } from "../../lib/cardsCatalog";
import { cardPng } from "../../lib/cardRender";
import { CARD_FONT_FAMILY } from "../../lib/cardFont";
import { isLang, type Lang } from "../../lib/i18n";

type Phase = "detail" | "checking" | "paid";
type Saved = { cardId: string; to: string; from: string };

const SAVE_KEY = "cinegram:card";
const BTN_MAIN = "btn-primary";

function save(s: Saved) {
  try {
    sessionStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}
function load(): Saved | null {
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export function OccasionView({ occasion }: { occasion: CardOccasion }) {
  const [lang, setLang] = useCardLang();
  const ui = CARD_UI[lang];
  const cards = cardsFor(occasion);

  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("detail");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  // Coming back from Stripe: confirm the payment, or note the cancellation.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const cardId = p.get("card");
    const sid = p.get("session_id");
    const card = cardById(cardId);
    if (!card || card.occasion !== occasion) return;
    const saved = load();
    if (saved && saved.cardId === card.id) {
      setTo(saved.to);
      setFrom(saved.from);
    }
    const qLang = p.get("lang");
    const msgs = CARD_UI[isLang(qLang) ? (qLang as Lang) : "en"];
    setSelected(card.id);
    if (sid) {
      setPhase("checking");
      fetch(`/api/card-unlock?session_id=${encodeURIComponent(sid)}`)
        .then((r) => r.json())
        .then((d: { paid?: boolean; cardId?: string }) => {
          if (d.paid && d.cardId === card.id) setPhase("paid");
          else {
            setError(msgs.notPaid);
            setPhase("detail");
          }
        })
        .catch(() => {
          setError(msgs.notPaid);
          setPhase("detail");
        });
    } else if (p.get("status") === "cancelled") {
      setNotice(msgs.cancelled);
      window.history.replaceState(null, "", `/cards/${occasion}?lang=${qLang || "en"}`);
    }
  }, [occasion]);

  useEffect(() => {
    try {
      const probe = new File([new Blob(["x"], { type: "image/png" })], "x.png", { type: "image/png" });
      setCanShare(!!navigator.canShare && navigator.canShare({ files: [probe] }));
    } catch {
      setCanShare(false);
    }
  }, []);

  // Close the card with Escape (not while a payment is being checked).
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && phase === "detail" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function open(id: string) {
    setSelected(id);
    setPhase("detail");
    setError(null);
    setNotice(null);
  }
  function close() {
    setSelected(null);
    setPhase("detail");
    setError(null);
    setNotice(null);
    if (window.location.search.includes("card=")) window.history.replaceState(null, "", `/cards/${occasion}?lang=${lang}`);
  }

  async function buy() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    save({ cardId: selected, to, from });
    try {
      const res = await fetch("/api/card-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: selected, lang }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || ui.error);
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message || ui.error);
      setBusy(false);
    }
  }

  async function makeFile() {
    if (!selected) throw new Error(ui.error);
    return cardPng({ artKey: selected, lang, to, from, fontFamily: CARD_FONT_FAMILY }, `cinegram-${selected}.png`);
  }

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const file = await makeFile();
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setError((e as Error).message || ui.error);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    setBusy(true);
    setError(null);
    try {
      const file = await makeFile();
      await navigator.share({ files: [file], title: selected ? CARD_TEXT[lang][selected].h : "Cinegram" });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || ui.error);
    } finally {
      setBusy(false);
    }
  }

  const title = OCCASION_NAMES[lang][occasion];

  return (
    <main className="page font-sans">
      <CardsHeader lang={lang} setLang={setLang} backHref={`/cards?lang=${lang}`} backLabel={ui.allOccasions} />

      <section className="w-full max-w-5xl text-center mb-6 space-y-2">
        <h1 className="title-serif text-4xl sm:text-5xl font-semibold text-amber-50">
          <span aria-hidden="true">{OCCASION_EMOJI[occasion]}</span> {title}
        </h1>
        <p className="text-sm text-white/55">
          {ui.tapToOpen} · {ui.price}
        </p>
      </section>

      <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => open(c.id)}
            className="tile p-1.5"
          >
            <CardCanvas artKey={c.id} lang={lang} maxScale={0.8} label={CARD_TEXT[lang][c.id].h} />
            <p className="px-1 pb-1 pt-2 text-xs sm:text-sm font-semibold text-white/85 truncate">{CARD_TEXT[lang][c.id].h}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div role="dialog" aria-modal="true" aria-label={CARD_TEXT[lang][selected].h} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <div className="panel max-w-md bg-[#140e22]/95 p-5 sm:p-6 space-y-5">
              <div className="flex justify-end">
                {phase !== "checking" && (
                  <button onClick={close} aria-label={ui.close} className="p-2 -m-2 text-white/55 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {error && (
                <p role="alert" className="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="notice">
                  {notice}
                </p>
              )}

              <CardCanvas
                artKey={selected}
                lang={lang}
                to={to}
                from={from}
                watermark={phase === "paid" ? undefined : ui.watermark}
                maxScale={2}
                label={CARD_TEXT[lang][selected].h}
              />

              {phase === "checking" && (
                <p className="flex items-center justify-center gap-2 text-sm text-white/70">
                  <Loader2 className="w-4 h-4 animate-spin" /> {ui.checking}
                </p>
              )}

              {phase !== "checking" && (
              <fieldset className="space-y-3">
                <legend className="text-base font-bold mb-2">{ui.personalize}</legend>
                <label className="block">
                  <span className="label">{ui.to}</span>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    maxLength={40}
                    placeholder={ui.toPh}
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className="label">{ui.from}</span>
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    maxLength={40}
                    placeholder={ui.fromPh}
                    className="field"
                  />
                </label>
              </fieldset>
              )}

              {phase === "detail" && (
                <>
                  <p className="text-xs text-white/55 text-center">{ui.previewNote}</p>
                  <button onClick={buy} disabled={busy} className={BTN_MAIN}>
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />} {ui.buy}
                  </button>
                </>
              )}

              {phase === "paid" && (
                <>
                  <p className="flex items-center justify-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" /> {ui.paidTitle}
                  </p>
                  <button onClick={download} disabled={busy} className={BTN_MAIN}>
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} {ui.download}
                  </button>
                  {canShare && (
                    <button
                      onClick={share}
                      disabled={busy}
                      className="btn-secondary"
                    >
                      <Share2 className="w-4 h-4" /> {ui.share}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
