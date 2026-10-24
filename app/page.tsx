"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, CheckCircle2, ChevronRight, Loader2, Lock, Mail, MessageSquare, RotateCcw, Sparkles, Trash2, Video, Volume2, VolumeX } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { ShareCard } from "../components/ShareCard";
import { useCardLang } from "../components/cards/useCardLang";
import { CardCanvas } from "../components/cards/CardCanvas";
import { ActionCanvas } from "../components/action/ActionCanvas";
import { useCardMusic } from "../components/action/useCardMusic";
import { CARD_OCCASIONS, CARD_TEXT, CARD_UI, OCCASION_COVER, OCCASION_EMOJI, OCCASION_NAMES, cardById, cardsFor, isCardOccasion, type CardOccasion } from "../lib/cardsCatalog";
import { halloweenInSeason } from "../lib/action/halloweenText";
import { GROWTH } from "../lib/growthText";
import { ReminderForm } from "../components/ReminderForm";
import { ACTION_TEXT, ACTION_UI, POSTER_T, isActionId, type ActionId } from "../lib/action/catalog";
import { posterJpeg } from "../lib/action/render";
import { cardJpeg } from "../lib/cardRender";
import { CARD_FONT_FAMILY } from "../lib/cardFont";
import { shrinkPhoto } from "../lib/media";
import { loadImage } from "../lib/polaroid";
import { FINAL_SALE, OCCASION_ACTIONS, WIZARD_KEY, actionTextFor, priceFor, priceLabel, type WizardState } from "../lib/send";
import { SITE } from "../lib/siteText";
import { isEmail } from "../lib/emailCheck";
import { TEXT_UI, isPhone, type DeliverBy } from "../lib/textSend";

type Step = 1 | 2 | 3 | 4 | "done";
type Choice = { kind: "quick"; id: string } | { kind: "action"; id: ActionId };
/** Replying to a card: when `direct`, we know where to deliver it and the address stays hidden. */
type Reply = { id: string; toName: string; direct: boolean; free: boolean };
type Saved = WizardState & { choice?: Choice | null; photoUrl?: string | null; deliverBy?: DeliverBy; toPhone?: string; reply?: Reply | null };
type Delivery = { state: "checking" | "sent" | "failed" | "unpaid"; toName?: string; toEmail?: string; link?: string; error?: string; byText?: boolean; toPhone?: string; fromName?: string; reply?: boolean };

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
  const gx = GROWTH[lang];
  const music = useCardMusic();

  const [step, setStep] = useState<Step>(1);
  const [occasion, setOccasion] = useState<CardOccasion | null>(null);
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [deliverBy, setDeliverBy] = useState<DeliverBy>("email");
  const [toPhone, setToPhone] = useState("");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [reply, setReply] = useState<Reply | null>(null);
  const [seasonal, setSeasonal] = useState(false);
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
    if (s.reply) setReply(s.reply);
    setSeasonal(halloweenInSeason());
    const replyId = p.get("reply");
    if (replyId) { startReply(replyId); return; }
    const occ = p.get("occasion"), to = p.get("to");
    if (occ && isCardOccasion(occ)) {
      // From a birthday reminder email: occasion and name are already known.
      setOccasion(occ); setChoice(null); setReply(null);
      if (to) setToName(to.slice(0, 60));
      window.history.replaceState(null, "", "/");
      setStep(2);
      return;
    }
    const id = p.get("order"), sid = p.get("session_id");
    if (id && sid) { order.current = { id, sessionId: sid }; setStep("done"); deliver(); }
    else if (id && p.get("status") === "cancelled" && s.choice) { setStep(4); setNotice(SITE[s.lang || "en"].cancelled); window.history.replaceState(null, "", "/"); }
    else if (s.choice && s.toName) setStep(4);
    else if (s.toName && s.occasion) setStep(3);
    else if (s.occasion) setStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== "done") persist({ occasion: occasion || undefined, toName, toEmail, fromName, lang, choice, photoUrl, deliverBy, toPhone, reply });
  }, [occasion, toName, toEmail, fromName, lang, choice, photoUrl, step, deliverBy, toPhone, reply]);

  useEffect(() => { top.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);
  useEffect(() => { if (step !== 4) music.stop(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [step]);

  function go(s: Step) { setError(null); setNotice(null); setStep(s); }

  /** Opened from "Reply with a card" on a card someone received. */
  async function startReply(id: string) {
    window.history.replaceState(null, "", "/");
    try {
      const res = await fetch(`/api/reply-info?id=${encodeURIComponent(id)}`);
      const d = (await res.json()) as { id?: string; toName?: string; fromName?: string; occasion?: string; direct?: boolean; free?: boolean; error?: string };
      if (!res.ok || !d.id) throw new Error(d.error || t.error);
      setReply({ id: d.id, toName: d.toName || "", direct: !!d.direct, free: !!d.free });
      setToName(d.toName || ""); setFromName(d.fromName || ""); setToEmail(""); setToPhone(""); setDeliverBy("email");
      setOccasion(d.occasion === "halloween" ? "halloween" : "thanks");
      setChoice(null);
      setStep(d.direct ? 3 : 2);
    } catch (e) { setError((e as Error).message); setStep(1); }
  }

  function nextFromWho() {
    if (!toName.trim() || !fromName.trim()) return setError(t.namesNeeded);
    if (reply?.direct) return go(3);
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
    persist({ occasion: occasion || undefined, toName, toEmail, fromName, lang, choice: null, photoUrl, deliverBy, toPhone });
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
      Object.entries({ kind: choice.kind, cardId: choice.id, occasion, lang, toName: names.to, toEmail: toEmail.trim(), fromName: names.from, photoUrl: photoUrl || "", deliverBy, toPhone: toPhone.trim(), replyTo: reply?.id || "" }).forEach(([k, v]) => form.append(k, v));
      form.append("image", image, "card.jpg");
      const res = await fetch("/api/order", { method: "POST", body: form });
      const d = (await res.json()) as { url?: string; free?: boolean; order?: string; error?: string };
      if (res.ok && d.free && d.order) {
        // Free reply: nothing to pay, so deliver it straight away.
        order.current = { id: d.order, sessionId: "" };
        setBusy(false);
        setStep("done");
        void deliver();
        return;
      }
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
      const d = (await res.json()) as { paid?: boolean; sent?: boolean; toName?: string; toEmail?: string; link?: string; error?: string; byText?: boolean; toPhone?: string; fromName?: string; reply?: boolean };
      if (res.status === 402 || d.paid === false) return setDelivery({ state: "unpaid" });
      if (!res.ok) throw new Error(d.error || "error");
      setDelivery({ state: d.sent ? "sent" : "failed", toName: d.toName, toEmail: d.toEmail, link: d.link, error: d.error, byText: d.byText, toPhone: d.toPhone || undefined, fromName: d.fromName, reply: d.reply });
      if (d.sent) try { sessionStorage.removeItem(WIZARD_KEY); } catch { /* ignore */ }
    } catch (e) { setDelivery({ state: "failed", error: (e as Error).message }); }
  }

  function startOver() {
    try { sessionStorage.removeItem(WIZARD_KEY); } catch { /* ignore */ }
    window.history.replaceState(null, "", "/");
    setOccasion(null); setToName(""); setToEmail(""); setToPhone(""); setDeliverBy("email"); setChoice(null); setPhoto(null); setPhotoUrl(null); setDelivery(null); setReply(null);
    go(1);
  }

  const names = OCCASION_NAMES[lang];
  const occasionList: CardOccasion[] = seasonal ? ["halloween", ...CARD_OCCASIONS] : [...CARD_OCCASIONS];
  const price = choice ? priceFor(choice.kind, choice.id) : 0;
  const stepIdx = step === "done" ? 4 : step;

  return (
    <main className="page font-sans">
      <SiteHeader lang={lang} setLang={setLang} active="send" />
      <div ref={top} className="w-full max-w-5xl scroll-mt-4">
        {step !== "done" && (
          <>
            {step === 1 && (seasonal ? (
              <section className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
                <div className="w-44 shrink-0 sm:w-52">
                  <ActionCanvas id="dragon" lang={lang} playing maxScale={0.6} label={GROWTH[lang].heroTitle} />
                </div>
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">🎃 {gx.halloweenBadge}</span>
                  <h1 className="title-serif mt-3 text-4xl sm:text-6xl font-semibold leading-tight text-amber-50">{gx.heroTitle}</h1>
                  <p className="mt-3 max-w-xl text-sm sm:text-base text-white/65">{gx.heroSub}</p>
                  <button onClick={() => { setOccasion("halloween"); setChoice(null); setReply(null); go(2); }} className="btn-primary mt-5 w-auto px-6">{gx.heroCta} <ChevronRight className="h-5 w-5" /></button>
                </div>
              </section>
            ) : (
              <section className="mb-8 text-center">
                <h1 className="title-serif text-4xl sm:text-6xl font-semibold leading-tight text-amber-50">{t.heroTitle}</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-white/65">{t.heroSub}</p>
              </section>
            ))}
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
              {occasionList.map((o) => (
                <button key={o} onClick={() => { setOccasion(o); setChoice(null); go(2); }} className={`tile group relative ${occasion === o ? "tile-selected" : ""} ${o === "halloween" ? "ring-2 ring-orange-400/70" : ""}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    {o === "halloween" ? (
                      <div className="h-full w-full transition duration-500 group-hover:scale-105 [&>canvas]:!rounded-none [&>canvas]:!shadow-none [&>canvas]:-translate-y-[32%]">
                        <ActionCanvas id="dragon" lang={lang} maxScale={0.5} label={names.halloween} />
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={`/api/card-art/${OCCASION_COVER[o]}`} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  {o === "halloween" && <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">{gx.halloweenBadge}</span>}
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
            {reply && <p className="chip mb-4 ml-2">↩ {gx.replyingTo(reply.toName)}</p>}
            <h2 className="mb-6 text-2xl font-bold">{t.s2Title}</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextFromWho(); }}>
              <label className="block"><span className="label">{t.toName}</span>
                <input className="field" value={toName} onChange={(e) => setToName(e.target.value)} maxLength={60} placeholder={t.toNamePh} autoComplete="off" autoFocus />
              </label>
              {reply?.direct ? (
                <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">{gx.replyHidden(reply.toName)}</p>
              ) : (<>
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
              </>)}
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
                {reply?.direct ? (
                  <span className="chip">↩ {gx.replyingTo(reply.toName)}{reply.free ? ` · ${gx.replyFreeChip}` : ""}</span>
                ) : (
                  <button onClick={() => go(2)} className="chip hover:bg-white/10">{deliverBy === "text" ? <MessageSquare className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />} {deliverBy === "text" ? (toPhone.trim() || tx.byText) : toEmail} · {t.change}</button>
                )}
              </div>
            </div>

            <div>
              <SectionTitle icon={<Sparkles className="h-5 w-5 text-pink-300" />} title={t.actionTitle} sub={occasion === "halloween" ? gx.halloweenSub : t.actionSub} />
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-6 sm:overflow-visible sm:px-0">
                {OCCASION_ACTIONS[occasion].map((id) => (
                  <button key={id} onClick={() => pick({ kind: "action", id })} className="tile w-36 shrink-0 p-1.5 sm:w-auto">
                    <ActionCanvas id={id} lang={lang} maxScale={0.45} label={ACTION_TEXT[lang][id].name} />
                    <p className="truncate px-1 pb-1 pt-2 text-xs font-semibold text-white/85">{ACTION_TEXT[lang][id].name}</p>
                  </button>
                ))}
              </div>
            </div>

            {!reply?.direct && <button onClick={goVideo} className="tile flex w-full items-center gap-4 p-4 sm:p-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-amber-400"><Video className="h-7 w-7" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold">{t.videoTitle}</span>
                <span className="block text-sm text-white/60">{t.videoSub}</span>
              </span>
              <span className="hidden sm:inline-flex chip">{t.videoCta}</span>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>}

            {cardsFor(occasion).length > 0 && <div>
              <SectionTitle icon={<span aria-hidden className="text-lg">🎨</span>} title={t.artTitle} sub={t.artSub} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {cardsFor(occasion).map((c) => (
                  <button key={c.id} onClick={() => pick({ kind: "quick", id: c.id })} className="tile p-1.5">
                    <CardCanvas artKey={c.id} lang={lang} to={toName.trim()} from={fromName.trim()} maxScale={0.8} label={CARD_TEXT[lang][c.id].h} />
                  </button>
                ))}
              </div>
            </div>}
            <button onClick={() => go(reply?.direct ? 1 : 2)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> {t.back}</button>
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
                {reply?.direct
                  ? <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-pink-300" /> {gx.replyHidden(reply.toName)}{reply.free ? ` ${gx.replyFreeNote}` : ""}</p>
                  : deliverBy === "text"
                  ? <p className="flex items-center gap-2"><MessageSquare className="h-4 w-4 shrink-0 text-pink-300" /> {tx.willText(toName.trim() || "…")}</p>
                  : <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-pink-300" /> {t.willEmail(toEmail.trim())}</p>}
              </div>

              {error && <p role="alert" className="alert">{error}</p>}
              <button onClick={pay} disabled={busy || uploading || !toName.trim() || !fromName.trim()} className="btn-primary">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} {reply?.free ? gx.sendFree(toName.trim() || "…") : t.pay(priceLabel(price), toName.trim() || "…")}
              </button>
              {!reply?.free && <p className="text-center text-xs text-white/40">{t.secure}</p>}
              {!reply?.free && <p className="text-center text-xs text-white/40">{FINAL_SALE[lang]}</p>}
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
              <div className="space-y-6">
                <ShareCard lang={lang} toName={delivery.toName || ""} fromName={delivery.fromName || ""} toPhone={delivery.toPhone} link={delivery.link} onAnother={startOver} />
                {delivery.toName && <ReminderForm lang={lang} toName={delivery.toName} />}
              </div>
            )}
            {delivery?.state === "sent" && !delivery.byText && (
              <div className="space-y-5">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-amber-400 text-4xl shadow-xl shadow-pink-500/30">💌</div>
                <h2 className="title-serif text-4xl font-semibold text-amber-50">{t.sentTitle(delivery.toName || "")}</h2>
                <p className="text-white/70">{delivery.reply || !delivery.toEmail ? gx.replySent(delivery.toName || "") : t.sentBody(delivery.toEmail)}</p>
                {delivery.link && <a href={delivery.link} target="_blank" rel="noopener noreferrer" className="btn-secondary"><CheckCircle2 className="h-5 w-5" /> {t.viewCard}</a>}
                <button onClick={startOver} className="btn-primary"><RotateCcw className="h-5 w-5" /> {t.another}</button>
                {delivery.toName && <ReminderForm lang={lang} toName={delivery.toName} />}
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
