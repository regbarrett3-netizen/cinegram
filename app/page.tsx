"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, CheckCircle2, ChevronRight, Copy, Loader2, Lock, Mail, MessageSquare, RotateCcw, Share2, Sparkles, Trash2, Video, Volume2, VolumeX } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { useCardLang } from "../components/cards/useCardLang";
import { CardCanvas } from "../components/cards/CardCanvas";
import { ActionCanvas } from "../components/action/ActionCanvas";
import { useCardMusic } from "../components/action/useCardMusic";
import { CARD_OCCASIONS, CARD_TEXT, CARD_UI, OCCASION_COVER, OCCASION_EMOJI, OCCASION_NAMES, cardById, cardsFor, isCardOccasion, type CardOccasion } from "../lib/cardsCatalog";
import { ACTION_TEXT, ACTION_UI, POSTER_T, isActionId, type ActionId } from "../lib/action/catalog";
import { posterJpeg } from "../lib/action/render";
import { cardJpeg } from "../lib/cardRender";
import { CARD_FONT_FAMILY } from "../lib/cardFont";
import { shrinkPhoto } from "../lib/media";
import { loadImage } from "../lib/polaroid";
import { FINAL_SALE, OCCASION_ACTIONS, PRICE, WIZARD_KEY, actionTextFor, priceLabel, type WizardState } from "../lib/send";
import { SITE } from "../lib/siteText";
import { isEmail } from "../lib/emailCheck";
import { TEXT_UI, isPhone, shareLinks, smsHref, type DeliverBy } from "../lib/textSend";

type Step = 1 | 2 | 3 | 4 | "done";
type Choice = { kind: "quick"; id: string } | { kind: "action"; id: ActionId };
type Saved = WizardState & { choice?: Choice | null; photoUrl?: string | null; deliverBy?: DeliverBy; toPhone?: string };
type Delivery = { state: "checking" | "sent" | "failed" | "unpaid"; toName?: string; toEmail?: string; link?: string; error?: string; byText?: boolean; toPhone?: string; fromName?: string };

function loadSaved(): Saved {
  try { return JSON.parse(sessionStorage.getItem(WIZARD_KEY) || "{}") as Saved; } catch { return {}; }
}
function persist(s: Saved) {
  try { sessionStorage.setItem(WIZARD_KEY, JSON.stringify(s)); } catch { /* private mode */ }
}

export default function SendFlow() {
  const [lang, setLang] = useCardLang();
  const t = SITE[lang];
  const tx = TEXT_UI[lang];
  const music = useCardMusic();

  const [step, setStep] = useState<Step>(1);
  const [occasion, setOccasion] = useState<CardOccasion | null>(null);
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [deliverBy, setDeliverBy] = useState<DeliverBy>("email");
  const [toPhone, setToPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const order = useRef<{ id: string; sessionId: string } | null>(null);
  const top = useRef<HTMLDivElement>(null);

  // Restore an unfinished card, or confirm a payment when Stripe sends the buyer back.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = loadSaved();
    if (s.occasion && isCardOccasion(s.occasion)) setOccasion(s.occasion);
    setToName(s.toName || ""); setToEmail(s.toEmail || ""); setFromName(s.fromName || "");
    if (s.deliverBy === "text") setDeliverBy("text");
    setToPhone(s.toPhone || "");
    if (s.choice) setChoice(s.choice);
    if (s.photoUrl) { setPhotoUrl(s.photoUrl); loadImage(s.photoUrl).then(setPhoto).catch(() => undefined); }
    const id = p.get("order"), sid = p.get("session_id");
    if (id && sid) { order.current = { id, sessionId: sid }; setStep("done"); deliver(); }
    else if (id && p.get("status") === "cancelled" && s.choice) { setStep(4); setNotice(SITE[s.lang || "en"].cancelled); window.history.replaceState(null, "", "/"); }
    else if (s.choice && s.toName) setStep(4);
    else if (s.toName && s.occasion) setStep(3);
    else if (s.occasion) setStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== "done") persist({ occasion: occasion || undefined, toName, toEmail, fromName, lang, choice, photoUrl, deliverBy, toPhone });
  }, [occasion, toName, toEmail, fromName, lang, choice, photoUrl, step, deliverBy, toPhone]);

  useEffect(() => { top.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);
  useEffect(() => { if (step !== 4) music.stop(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [step]);

  function go(s: Step) { setError(null); setNotice(null); setStep(s); }

  function nextFromWho() {
    if (!toName.trim() || !fromName.trim()) return setError(t.namesNeeded);
    if (deliverBy === "email" && !isEmail(toEmail.trim())) return setError(t.emailInvalid);
    if (deliverBy === "text" && toPhone.trim() && !isPhone(toPhone)) return setError(tx.phoneInvalid);
    go(3);
  }

  function pick(c: Choice) {
    music.unlock();
    setChoice(c);
    go(4);
  }

  function goVideo() {
    persist({ occasion: occasion || undefined, toName, toEmail, fromName, lang, choice: null, photoUrl });
    window.location.href = `/video?lang=${lang}`;
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const small = await shrinkPhoto(file);
      const form = new FormData();
      form.append("photo", small, "photo.jpg");
      const res = await fetch("/api/photo", { method: "POST", body: form });
      const d = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !d.url) throw new Error(d.error || t.error);
      setPhoto(await loadImage(d.url));
      setPhotoUrl(d.url);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  }

  async function pay() {
    if (!choice || !occasion) return;
    setBusy(true); setError(null);
    try {
      const names = { to: toName.trim(), from: fromName.trim() };
      const image = choice.kind === "quick"
        ? await cardJpeg({ artKey: choice.id, lang, to: names.to, from: names.from, fontFamily: CARD_FONT_FAMILY, photo })
        : await posterJpeg(choice.id, Math.max(POSTER_T[choice.id], 5.4), { lang, to: names.to, from: names.from, fontFamily: CARD_FONT_FAMILY, photo, text: actionTextFor(choice.id, occasion, lang) });
      const form = new FormData();
      Object.entries({ kind: choice.kind, cardId: choice.id, occasion, lang, toName: names.to, toEmail: toEmail.trim(), fromName: names.from, photoUrl: photoUrl || "", deliverBy, toPhone: toPhone.trim() }).forEach(([k, v]) => form.append(k, v));
      form.append("image", image, "card.jpg");
      const res = await fetch("/api/order", { method: "POST", body: form });
      const d = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !d.url) throw new Error(d.error || t.error);
      window.location.href = d.url;
    } catch (e) { setError((e as Error).message || t.error); setBusy(false); }
  }

  async function deliver() {
    const o = order.current;
    if (!o) return;
    setDelivery({ state: "checking" });
    try {
      const res = await fetch("/api/deliver", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: o.id, sessionId: o.sessionId }) });
      const d = (await res.json()) as { paid?: boolean; sent?: boolean; toName?: string; toEmail?: string; link?: string; error?: string; byText?: boolean; toPhone?: string; fromName?: string };
      if (res.status === 402 || d.paid === false) return setDelivery({ state: "unpaid" });
      if (!res.ok) throw new Error(d.error || "error");
      setDelivery({ state: d.sent ? "sent" : "failed", toName: d.toName, toEmail: d.toEmail, link: d.link, error: d.error, byText: d.byText, toPhone: d.toPhone || undefined, fromName: d.fromName });
      if (d.sent) try { sessionStorage.removeItem(WIZARD_KEY); } catch { /* ignore */ }
    } catch (e) { setDelivery({ state: "failed", error: (e as Error).message }); }
  }

  function startOver() {
    try { sessionStorage.removeItem(WIZARD_KEY); } catch { /* ignore */ }
    window.history.replaceState(null, "", "/");
    setOccasion(null); setToName(""); setToEmail(""); setToPhone(""); setDeliverBy("email"); setCopied(false); setChoice(null); setPhoto(null); setPhotoUrl(null); setDelivery(null);
    go(1);
  }

  const names = OCCASION_NAMES[lang];
  const stepIdx = step === "done" ? 4 : step;

  return (
    <main className="page font-sans">
      <SiteHeader lang={lang} setLang={setLang} active="send" />
      <div ref={top} className="w-full max-w-5xl scroll-mt-4">
        {step !== "done" && (
          <>
            {step === 1 && (
              <section className="mb-8 text-center">
                <h1 className="title-serif text-4xl sm:text-6xl font-semibold leading-tight text-amber-50">{t.heroTitle}</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-white/65">{t.heroSub}</p>
              </section>
            )}
            <Stepper labels={t.steps} current={stepIdx} onJump={(n) => n < stepIdx && go(n as Step)} />
          </>
        )}

        {error && step !== 4 && <p role="alert" className="alert mx-auto mb-5 max-w-xl">{error}</p>}
        {notice && <p role="status" className="notice mx-auto mb-5 max-w-xl">{notice}</p>}

        {/* ---------- 1. Occasion ---------- */}
        {step === 1 && (
          <section>
            <h2 className="mb-5 text-center text-xl sm:text-2xl font-bold">{t.s1Title}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {CARD_OCCASIONS.map((o) => (
                <button key={o} onClick={() => { setOccasion(o); setChoice(null); go(2); }} className={`tile group ${occasion === o ? "tile-selected" : ""}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/card-art/${OCCASION_COVER[o]}`} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-3">
                    <span className="text-sm sm:text-base font-bold"><span aria-hidden>{OCCASION_EMOJI[o]}</span> {names[o]}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ---------- 2. Who it's for ---------- */}
        {step === 2 && occasion && (
          <section className="panel mx-auto max-w-xl p-6 sm:p-8">
            <p className="chip mb-4"><span aria-hidden>{OCCASION_EMOJI[occasion]}</span> {names[occasion]}</p>
            <h2 className="mb-6 text-2xl font-bold">{t.s2Title}</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextFromWho(); }}>
              <label className="block"><span className="label">{t.toName}</span>
                <input className="field" value={toName} onChange={(e) => setToName(e.target.value)} maxLength={60} placeholder={t.toNamePh} autoComplete="off" autoFocus />
              </label>
              <div>
                <span className="label">{tx.howLabel}</span>
                <div role="radiogroup" aria-label={tx.howLabel} className="grid grid-cols-2 gap-2">
                  {(["email", "text"] as const).map((m) => (
                    <button key={m} type="button" role="radio" aria-checked={deliverBy === m} onClick={() => { setDeliverBy(m); setError(null); }}
                      className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition ${deliverBy === m ? "border-pink-300 bg-white text-slate-900" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}>
                      {m === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />} {m === "email" ? tx.byEmail : tx.byText}
                    </button>
                  ))}
                </div>
              </div>
              {deliverBy === "email" ? (
                <label className="block"><span className="label">{t.toEmail}</span>
                  <input className="field" type="email" inputMode="email" autoCapitalize="off" autoComplete="off" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder={t.toEmailPh} />
                </label>
              ) : (
                <label className="block"><span className="label">{tx.toPhone}</span>
                  <input className="field" type="tel" inputMode="tel" autoComplete="off" value={toPhone} onChange={(e) => setToPhone(e.target.value)} placeholder={tx.toPhonePh} maxLength={30} />
                </label>
              )}
              <label className="block"><span className="label">{t.fromName}</span>
                <input className="field" value={fromName} onChange={(e) => setFromName(e.target.value)} maxLength={60} placeholder={t.fromNamePh} autoComplete="given-name" />
              </label>
              <button type="submit" className="btn-primary mt-2">{t.next} <ChevronRight className="h-5 w-5" /></button>
            </form>
            <button onClick={() => go(1)} className="btn-ghost mt-5"><ArrowLeft className="h-4 w-4" /> {t.back}</button>
          </section>
        )}

        {/* ---------- 3. Choose a card ---------- */}
        {step === 3 && occasion && (
          <section className="space-y-10">
            <div className="text-center">
              <h2 className="title-serif text-3xl sm:text-4xl font-semibold text-amber-50">{t.s3Title(toName.trim())}</h2>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button onClick={() => go(1)} className="chip hover:bg-white/10"><span aria-hidden>{OCCASION_EMOJI[occasion]}</span> {names[occasion]} · {t.change}</button>
                <button onClick={() => go(2)} className="chip hover:bg-white/10"><Mail className="h-3.5 w-3.5" /> {toEmail} · {t.change}</button>
              </div>
            </div>

            <div>
              <SectionTitle icon={<Sparkles className="h-5 w-5 text-pink-300" />} title={t.actionTitle} sub={t.actionSub} />
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-6 sm:overflow-visible sm:px-0">
                {OCCASION_ACTIONS[occasion].map((id) => (
                  <button key={id} onClick={() => pick({ kind: "action", id })} className="tile w-36 shrink-0 p-1.5 sm:w-auto">
                    <ActionCanvas id={id} lang={lang} maxScale={0.45} label={ACTION_TEXT[lang][id].name} />
                    <p className="truncate px-1 pb-1 pt-2 text-xs font-semibold text-white/85">{ACTION_TEXT[lang][id].name}</p>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={goVideo} className="tile flex w-full items-center gap-4 p-4 sm:p-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-amber-400"><Video className="h-7 w-7" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold">{t.videoTitle}</span>
                <span className="block text-sm text-white/60">{t.videoSub}</span>
              </span>
              <span className="hidden sm:inline-flex chip">{t.videoCta}</span>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>

            <div>
              <SectionTitle icon={<span aria-hidden className="text-lg">🎨</span>} title={t.artTitle} sub={t.artSub} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {cardsFor(occasion).map((c) => (
                  <button key={c.id} onClick={() => pick({ kind: "quick", id: c.id })} className="tile p-1.5">
                    <CardCanvas artKey={c.id} lang={lang} to={toName.trim()} from={fromName.trim()} maxScale={0.8} label={CARD_TEXT[lang][c.id].h} />
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => go(2)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> {t.back}</button>
          </section>
        )}

        {/* ---------- 4. Make it yours, pay & send ---------- */}
        {step === 4 && occasion && choice && (
          <section className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
            <div className="mx-auto w-full max-w-sm">
              {choice.kind === "quick" && cardById(choice.id) ? (
                <CardCanvas artKey={choice.id} lang={lang} to={toName.trim()} from={fromName.trim()} watermark={CARD_UI[lang].watermark} photo={photo} maxScale={2} label={CARD_TEXT[lang][choice.id].h} />
              ) : choice.kind === "action" && isActionId(choice.id) ? (
                <div className="relative">
                  <ActionCanvas id={choice.id} lang={lang} to={toName.trim()} from={fromName.trim()} watermark={ACTION_UI[lang].watermark} photo={photo} text={actionTextFor(choice.id, occasion, lang)} playing maxScale={1} onCycle={() => music.start(choice.id as ActionId)} label={ACTION_TEXT[lang][choice.id].name} />
                  <button onClick={() => { music.unlock(); music.setMuted(!music.muted); }} aria-label={music.muted ? ACTION_UI[lang].soundOn : ACTION_UI[lang].soundOff} className="absolute right-3 top-3 rounded-full bg-black/45 p-2.5 backdrop-blur hover:bg-black/60">
                    {music.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>
              ) : null}
              <p className="mt-3 text-center text-xs text-white/50">{t.previewNote}</p>
            </div>

            <div className="panel p-6 sm:p-7 space-y-5">
              <div>
                <h2 className="text-2xl font-bold">{t.personalize}</h2>
                <p className="mt-1 text-sm text-white/60">{choice.kind === "action" ? `${ACTION_TEXT[lang][choice.id as ActionId].name} · ${t.actionTitle}` : `${CARD_TEXT[lang][choice.id].h} · ${t.artTitle}`}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="label">{t.toName}</span><input className="field" value={toName} maxLength={60} onChange={(e) => setToName(e.target.value)} /></label>
                <label className="block"><span className="label">{t.fromName}</span><input className="field" value={fromName} maxLength={60} onChange={(e) => setFromName(e.target.value)} /></label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className={`btn-secondary w-auto cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {uploading ? t.uploading : photo ? t.changePhoto : t.addPhoto}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {photo && <button onClick={() => { setPhoto(null); setPhotoUrl(null); }} className="btn-ghost"><Trash2 className="h-4 w-4" /> {t.removePhoto}</button>}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
                {deliverBy === "text"
                  ? <p className="flex items-center gap-2"><MessageSquare className="h-4 w-4 shrink-0 text-pink-300" /> {tx.willText(toName.trim() || "…")}</p>
                  : <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-pink-300" /> {t.willEmail(toEmail.trim())}</p>}
              </div>

              {error && <p role="alert" className="alert">{error}</p>}
              <button onClick={pay} disabled={busy || uploading || !toName.trim() || !fromName.trim()} className="btn-primary">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} {t.pay(priceLabel(PRICE[choice.kind]), toName.trim() || "…")}
              </button>
              <p className="text-center text-xs text-white/40">{t.secure}</p>
              <p className="text-center text-xs text-white/40">{FINAL_SALE[lang]}</p>
              <button onClick={() => go(3)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> {t.back}</button>
            </div>
          </section>
        )}

        {/* ---------- Done ---------- */}
        {step === "done" && (
          <section className="panel mx-auto max-w-lg p-8 text-center">
            {(!delivery || delivery.state === "checking") && (
              <div className="space-y-4 py-6"><Loader2 className="mx-auto h-10 w-10 animate-spin text-pink-300" /><p className="text-lg font-bold">{t.sending}</p></div>
            )}
            {delivery?.state === "sent" && delivery.byText && delivery.link && (
              <div className="space-y-5">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-amber-400 text-4xl shadow-xl shadow-pink-500/30">💌</div>
                <h2 className="title-serif text-4xl font-semibold text-amber-50">{tx.readyTitle(delivery.toName || "")}</h2>
                <p className="text-white/70">{tx.readyBody}</p>
                <a href={smsHref(delivery.toPhone || "", tx.smsBody(delivery.fromName || "", delivery.link))} className="btn-primary"><MessageSquare className="h-5 w-5" /> {tx.textIt(delivery.toName || "")}</a>
                <div className="space-y-2 pt-1">
                  <p className="text-sm text-white/60">{tx.socialLabel}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={shareLinks.whatsapp(tx.smsBody(delivery.fromName || "", delivery.link))} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-sm">{tx.whatsapp}</a>
                    <a href={shareLinks.facebook(delivery.link)} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-sm">{tx.postFacebook}</a>
                    <a href={shareLinks.x(tx.postText(delivery.toName || ""), delivery.link)} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-sm">{tx.postX}</a>
                    <button onClick={() => {
                      const text = tx.smsBody(delivery.fromName || "", delivery.link || "");
                      if (typeof navigator !== "undefined" && "share" in navigator) navigator.share({ text, url: delivery.link }).catch(() => undefined);
                      else navigator.clipboard?.writeText(delivery.link || "").then(() => setNotice(tx.instagramHint)).catch(() => undefined);
                    }} className="btn-secondary w-full text-sm"><Share2 className="h-4 w-4" /> {tx.instagram}</button>
                  </div>
                  {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(delivery.link || "").then(() => setCopied(true)).catch(() => undefined); }} className="btn-ghost"><Copy className="h-4 w-4" /> {copied ? tx.copied : tx.copyLink}</button>
                <a href={delivery.link} target="_blank" rel="noopener noreferrer" className="btn-ghost"><CheckCircle2 className="h-4 w-4" /> {t.viewCard}</a>
                <button onClick={startOver} className="btn-ghost"><RotateCcw className="h-4 w-4" /> {t.another}</button>
              </div>
            )}
            {delivery?.state === "sent" && !delivery.byText && (
              <div className="space-y-5">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-amber-400 text-4xl shadow-xl shadow-pink-500/30">💌</div>
                <h2 className="title-serif text-4xl font-semibold text-amber-50">{t.sentTitle(delivery.toName || "")}</h2>
                <p className="text-white/70">{t.sentBody(delivery.toEmail || "")}</p>
                {delivery.link && <a href={delivery.link} target="_blank" rel="noopener noreferrer" className="btn-secondary"><CheckCircle2 className="h-5 w-5" /> {t.viewCard}</a>}
                <button onClick={startOver} className="btn-primary"><RotateCcw className="h-5 w-5" /> {t.another}</button>
              </div>
            )}
            {delivery?.state === "failed" && (
              <div className="space-y-4">
                <p className="text-lg font-bold">{t.notSent}</p>
                {delivery.error && <p className="alert">{delivery.error}</p>}
                <button onClick={deliver} className="btn-primary"><RotateCcw className="h-5 w-5" /> {t.retry}</button>
                {delivery.link && <a href={delivery.link} target="_blank" rel="noopener noreferrer" className="btn-secondary">{t.viewCard}</a>}
              </div>
            )}
            {delivery?.state === "unpaid" && (
              <div className="space-y-4">
                <p className="alert">{CARD_UI[lang].notPaid}</p>
                <button onClick={() => { window.history.replaceState(null, "", "/"); go(4); }} className="btn-secondary">{t.back}</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Stepper({ labels, current, onJump }: { labels: [string, string, string]; current: number; onJump: (n: number) => void }) {
  return (
    <ol className="mx-auto mb-8 flex max-w-xl items-center justify-center gap-2 sm:gap-3">
      {labels.map((label, i) => {
        const n = i + 1, done = current > n, on = current === n || (current === 4 && n === 3);
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => onJump(n)} disabled={!done} className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold transition ${on ? "bg-white text-slate-900" : done ? "bg-white/10 text-white hover:bg-white/15" : "bg-white/5 text-white/40"}`}>
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${on ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white" : done ? "bg-emerald-400 text-slate-900" : "bg-white/10"}`}>{done ? <Check className="h-3.5 w-3.5" /> : n}</span>
              <span className="hidden min-[400px]:inline">{label}</span>
            </button>
            {n < 3 && <span className="h-px w-4 sm:w-8 bg-white/15" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h3 className="flex items-center gap-2 text-xl font-bold">{icon} {title}</h3>
        <p className="text-sm text-white/55">{sub}</p>
      </div>
    </div>
  );
}
