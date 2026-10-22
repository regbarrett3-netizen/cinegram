"use client";

// AI video card in 3 steps: 1) who it's for and what to say, 2) selfie and voice,
// 3) preview, pay and it's sent automatically (email) or shared from the sender's phone (text/social).
import React, { useEffect, useRef, useState } from "react";
import { Cake, Check, CheckCircle2, CreditCard, Download, Heart, Loader2, Mail, MessageSquare, Mic, PartyPopper, Pause, Play, RotateCcw, Square, Trophy, Upload } from "lucide-react";
import { MAX_MESSAGE, STRINGS, isLang, type Lang, type Occasion } from "../../lib/i18n";
import { shrinkPhoto, startRecording, toWav, type Recorder } from "../../lib/media";
import { PRESET_VOICES } from "../../lib/voices";
import { SiteHeader } from "../../components/SiteHeader";
import { ShareCard } from "../../components/ShareCard";
import { useCardLang } from "../../components/cards/useCardLang";
import { SITE } from "../../lib/siteText";
import { FINAL_SALE, WIZARD_KEY, videoOccasion, type WizardState } from "../../lib/send";
import { TEXT_UI, isPhone, type DeliverBy } from "../../lib/textSend";
import { VIDEO_FLOW } from "../../lib/videoFlow";
import { isEmail } from "../../lib/emailCheck";
import { isCardOccasion, type CardOccasion } from "../../lib/cardsCatalog";

const OCCASIONS: { id: Occasion; icon: typeof Cake }[] = [
  { id: "bday", icon: Cake },
  { id: "love", icon: Heart },
  { id: "party", icon: PartyPopper },
  { id: "victory", icon: Trophy },
];
/** The card-catalog occasion we store for each video occasion when the sender didn't come from the 1-2-3 flow. */
const CARD_OCCASION: Record<Occasion, CardOccasion> = { bday: "birthday", love: "love", party: "congrats", victory: "congrats" };

type Step = 1 | 2 | "working" | 3 | "checking" | "done";
type Phase = "upload" | "clone" | "queue" | "render";
type Delivery = { sent: boolean; byText?: boolean; link?: string; toName?: string; toEmail?: string; toPhone?: string | null; fromName?: string; error?: string; needRecipient?: boolean };

const SAVE_KEY = "cinegram:last";
const MIN_SECONDS = 10;
const MAX_SECONDS = 30;
const POLL_MS = 4000;
const GIVE_UP_MS = 12 * 60 * 1000;

type Saved = { lang: Lang; requestId: string; videoUrl: string };
function save(data: Saved) {
  try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch { /* private mode */ }
}
function load(): Saved | null {
  try { const raw = sessionStorage.getItem(SAVE_KEY); return raw ? (JSON.parse(raw) as Saved) : null; } catch { return null; }
}

export default function VideoCardPage() {
  const [lang, setLang] = useCardLang();
  const st = SITE[lang];
  const t = STRINGS[lang];
  const tx = TEXT_UI[lang];
  const vf = VIDEO_FLOW[lang];
  const [step, setStep] = useState<Step>(1);

  // Step 1: who and what
  const [occasion, setOccasion] = useState<Occasion>("bday");
  const [cardOccasion, setCardOccasion] = useState<CardOccasion | null>(null);
  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");
  const [deliverBy, setDeliverBy] = useState<DeliverBy>("email");
  const [toEmail, setToEmail] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageEdited, setMessageEdited] = useState(false);
  const [showScene, setShowScene] = useState(false);
  const [scene, setScene] = useState("");

  // Step 2: face and voice
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [voice, setVoice] = useState<Blob | null>(null);
  const [voicePreview, setVoicePreview] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recorder = useRef<Recorder | null>(null);
  const [consent, setConsent] = useState(false);
  const [voiceMode, setVoiceMode] = useState<"mine" | "preset">("mine");
  const [presetVoice, setPresetVoice] = useState(PRESET_VOICES[0].id);
  const [previews, setPreviews] = useState<Record<string, string> | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);

  // Step 3 and after
  const [phase, setPhase] = useState<Phase>("upload");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  // Errors show at the top of the panel; bring them into view so nothing fails silently.
  useEffect(() => { if (error) document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [error]);
  useEffect(() => { top.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);

  // Fill in the default greeting until the person writes their own.
  useEffect(() => {
    if (!messageEdited) setMessage(t.greet[occasion](toName.trim()));
  }, [lang, occasion, toName, messageEdited, t]);

  // Arriving from the 1-2-3 flow: everything from "Who's it for?" is already filled in.
  useEffect(() => {
    try {
      const w = JSON.parse(sessionStorage.getItem(WIZARD_KEY) || "{}") as WizardState;
      setToName(w.toName || ""); setFromName(w.fromName || "");
      setToEmail(w.toEmail || ""); setToPhone(w.toPhone || "");
      if (w.deliverBy === "text") setDeliverBy("text");
      if (w.occasion && isCardOccasion(w.occasion)) { setCardOccasion(w.occasion); setOccasion(videoOccasion(w.occasion)); }
    } catch { /* no saved flow */ }
  }, []);

  // Coming back from Stripe: confirm payment and deliver.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    const saved = load();
    if (saved && isLang(saved.lang)) setLang(saved.lang);
    if (sid) {
      window.history.replaceState(null, "", "/video");
      setSessionId(sid);
      setStep("checking");
      deliver(sid);
    } else if (params.get("status") === "cancelled" && saved) {
      window.history.replaceState(null, "", "/video");
      setRequestId(saved.requestId); setVideoUrl(saved.videoUrl); setStep(3);
      setNotice(STRINGS[isLang(saved.lang) ? saved.lang : "en"].cancelled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deliver(sid: string, recipient?: { toName: string; toEmail: string; fromName: string }) {
    setError(null);
    try {
      const res = await fetch("/api/send-video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: sid, lang, ...recipient }) });
      const d = (await res.json()) as Delivery & { paid?: boolean; videoUrl?: string };
      if (d.paid === false) {
        const saved = load();
        setError(STRINGS[saved?.lang && isLang(saved.lang) ? saved.lang : "en"].notPaid);
        if (saved) { setRequestId(saved.requestId); setVideoUrl(saved.videoUrl); setStep(3); } else setStep(1);
        return;
      }
      if (d.videoUrl) setVideoUrl(d.videoUrl);
      setDelivery(d);
      setStep("done");
      if (d.sent) try { sessionStorage.removeItem(WIZARD_KEY); } catch { /* ignore */ }
    } catch (e) {
      setDelivery({ sent: false, error: (e as Error).message });
      setStep("done");
    }
  }

  // Poll while the video renders.
  useEffect(() => {
    if (step !== "working" || !requestId) return;
    const started = Date.now();
    let stopped = false;
    let failedChecks = 0;
    const tick = async () => {
      if (stopped) return;
      if (Date.now() - started > GIVE_UP_MS) { setError(t.error); setStep(2); return; }
      try {
        const s = (await (await fetch(`/api/status?id=${encodeURIComponent(requestId)}`)).json()) as { state: string; videoUrl?: string; error?: string; note?: string };
        if (stopped) return;
        // A status check that keeps failing (not the video itself) shouldn't spin for 12 minutes.
        failedChecks = s.note ? failedChecks + 1 : 0;
        if (failedChecks >= 8) { setError(`${t.error} ${s.note}`.trim()); setStep(2); return; }
        if (s.state === "done" && s.videoUrl) {
          setVideoUrl(s.videoUrl);
          save({ lang, requestId, videoUrl: s.videoUrl });
          setStep(3);
          return;
        }
        if (s.state === "failed") { setError(`${t.error} ${s.error || ""}`.trim()); setStep(2); return; }
        setPhase(s.state === "queued" ? "queue" : "render");
      } catch { /* network blip: keep polling */ }
      setTimeout(tick, POLL_MS);
    };
    const first = setTimeout(tick, POLL_MS);
    return () => { stopped = true; clearTimeout(first); };
  }, [step, requestId, lang, t]);

  // Recording timer, with an automatic stop at the limit.
  useEffect(() => {
    if (!recording) return;
    const started = Date.now();
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      setRecSeconds(s);
      if (s >= MAX_SECONDS) stopRec();
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  useEffect(() => () => recorder.current?.cancel(), []);

  // Load the ready-made voice samples the first time someone opens that tab.
  useEffect(() => {
    if (voiceMode !== "preset" || previews) return;
    fetch("/api/voices").then((r) => r.json()).then((d: { previews?: Record<string, string> }) => setPreviews(d.previews || {})).catch(() => setPreviews({}));
  }, [voiceMode, previews]);

  function go(s: Step) { setError(null); setNotice(null); setStep(s); }

  function nextFromMessage() {
    if (!toName.trim() || !fromName.trim()) return setError(st.namesNeeded);
    if (deliverBy === "email" && !isEmail(toEmail.trim())) return setError(st.emailInvalid);
    if (deliverBy === "text" && toPhone.trim() && !isPhone(toPhone)) return setError(tx.phoneInvalid);
    if (!message.trim()) return;
    go(2);
  }

  function togglePreview(id: string) {
    const url = previews?.[id];
    if (!url) return;
    player.current?.pause();
    if (playing === id) { setPlaying(null); return; }
    const a = new Audio(url);
    a.onended = () => setPlaying(null);
    player.current = a;
    a.play().then(() => setPlaying(id)).catch(() => setPlaying(null));
  }

  function chooseVoiceMode(mode: "mine" | "preset") {
    if (recording) return;
    player.current?.pause();
    setPlaying(null);
    setVoiceMode(mode);
    setError(null);
  }

  function setVoiceBlob(b: Blob | null) {
    setVoice(b);
    setVoicePreview((old) => { if (old) URL.revokeObjectURL(old); return b ? URL.createObjectURL(b) : null; });
  }

  async function startRec() {
    setError(null);
    setVoiceBlob(null);
    try {
      recorder.current = await startRecording();
      setRecSeconds(0);
      setRecording(true);
    } catch { setError(t.micDenied); }
  }

  async function stopRec() {
    const r = recorder.current;
    recorder.current = null;
    setRecording(false);
    if (!r) return;
    await acceptSample(await r.stop());
  }

  async function acceptSample(raw: Blob) {
    try {
      const { wav, seconds } = await toWav(raw);
      if (seconds < MIN_SECONDS) { setError(t.tooShort); return; }
      setError(null);
      setVoiceBlob(wav);
    } catch { setError(t.error); }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const small = await shrinkPhoto(file);
      setPhoto(small);
      setPhotoPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(small); });
    } catch (e) { setError((e as Error).message); }
  }

  async function generate() {
    const hasVoice = voiceMode === "preset" || !!voice;
    if (!photo) return setError(vf.needPhoto);
    if (!hasVoice) return setError(vf.needVoice);
    if (!consent) return setError(vf.needConsent);
    player.current?.pause();
    setError(null); setNotice(null);
    setPhase("upload");
    setStep("working");
    const form = new FormData();
    form.append("photo", photo, "selfie.jpg");
    if (voiceMode === "preset") form.append("presetVoice", presetVoice);
    else if (voice) form.append("voice", voice, "sample.wav");
    form.append("lang", lang);
    form.append("occasion", occasion);
    form.append("message", message.trim());
    form.append("scene", scene.trim());
    form.append("consent", "yes");
    const cloneTimer = setTimeout(() => setPhase("clone"), 2500);
    try {
      const res = await fetch("/api/create", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { requestId?: string; error?: string };
      if (!res.ok || !data.requestId) throw new Error(data.error || t.error);
      setRequestId(data.requestId);
      setPhase("queue");
    } catch (e) {
      setError((e as Error).message);
      setStep(2);
    } finally { clearTimeout(cloneTimer); }
  }

  async function payAndSend() {
    if (!requestId) return;
    if (!toName.trim() || !fromName.trim()) { setError(st.namesNeeded); setStep(1); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId, lang, occasion: cardOccasion || CARD_OCCASION[occasion],
          toName: toName.trim(), fromName: fromName.trim(), deliverBy, toEmail: toEmail.trim(), toPhone: toPhone.trim(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error(data.error || t.error);
      window.location.href = data.url;
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }

  function startOver() {
    try { sessionStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    setStep(1); setRequestId(null); setVideoUrl(null); setSessionId(null); setDelivery(null);
    setError(null); setNotice(null); setBusy(false);
  }

  const phaseText = { upload: t.sUpload, clone: t.sClone, queue: t.sQueue, render: t.sRender }[phase];
  const canGenerate = !!photo && (voiceMode === "preset" || !!voice) && consent && !recording;
  const stepIdx = step === 1 ? 1 : step === 2 || step === "working" ? 2 : 3;

  return (
    <main className="page font-sans">
      <SiteHeader lang={lang} setLang={setLang} active="video" />
      <div ref={top} className="scroll-mt-4" />

      {step !== "done" && step !== "checking" && (
        <ol className="mx-auto mb-5 flex max-w-xl items-center justify-center gap-2" aria-label="Progress">
          {vf.steps.map((label, i) => {
            const n = i + 1, on = n === stepIdx, done = n < stepIdx;
            return (
              <li key={label} className="flex items-center gap-2">
                <span aria-current={on ? "step" : undefined} className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold ${on ? "bg-white text-slate-900" : done ? "bg-white/10 text-white" : "bg-white/5 text-white/40"}`}>
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${on ? "bg-pink-500 text-white" : done ? "bg-emerald-500 text-white" : "bg-white/10"}`}>{done ? <Check className="h-3.5 w-3.5" /> : n}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
                {n < 3 && <span aria-hidden className="h-px w-4 bg-white/15" />}
              </li>
            );
          })}
        </ol>
      )}

      <div className="panel max-w-xl p-6 sm:p-8">
        {error && <p role="alert" className="alert mb-5">{error}</p>}
        {notice && <p role="status" className="notice mb-5">{notice}</p>}

        {/* ---------- 1. Who and what ---------- */}
        {step === 1 && (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); nextFromMessage(); }}>
            <div className="text-center">
              <p className="text-sm font-semibold text-pink-300">{t.tagline}</p>
              <h2 className="mt-1 text-2xl font-bold">{vf.s1Title}</h2>
            </div>

            <div>
              <span className="label">{vf.occasionLabel}</span>
              <div className="grid grid-cols-4 gap-2">
                {OCCASIONS.map(({ id, icon: Icon }) => (
                  <button key={id} type="button" aria-pressed={occasion === id} onClick={() => { setOccasion(id); setCardOccasion(null); }}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-xs font-semibold transition ${occasion === id ? "border-pink-300 bg-white text-slate-900" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}>
                    <Icon className="h-5 w-5" /> <span className="leading-tight">{t.occ[id]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="label">{st.toName}</span>
                <input className="field" value={toName} maxLength={60} placeholder={st.toNamePh} onChange={(e) => setToName(e.target.value)} autoComplete="off" />
              </label>
              <label className="block"><span className="label">{st.fromName}</span>
                <input className="field" value={fromName} maxLength={60} placeholder={st.fromNamePh} onChange={(e) => setFromName(e.target.value)} autoComplete="given-name" />
              </label>
            </div>

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
              <label className="block"><span className="label">{st.toEmail}</span>
                <input className="field" type="email" inputMode="email" autoCapitalize="off" autoComplete="off" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder={st.toEmailPh} />
              </label>
            ) : (
              <label className="block"><span className="label">{tx.toPhone}</span>
                <input className="field" type="tel" inputMode="tel" autoComplete="off" value={toPhone} onChange={(e) => setToPhone(e.target.value)} placeholder={tx.toPhonePh} maxLength={30} />
              </label>
            )}

            <label className="block"><span className="label">{t.message}</span>
              <textarea rows={4} value={message} maxLength={MAX_MESSAGE} onChange={(e) => { setMessage(e.target.value); setMessageEdited(true); }} className="field" />
              <span className="mt-1 flex justify-between gap-3 text-xs text-white/55">
                <span>{t.messageHint}</span>
                <span className="shrink-0 tabular-nums">{message.length}/{MAX_MESSAGE}</span>
              </span>
            </label>

            {showScene ? (
              <label className="block"><span className="label">{t.scene}</span>
                <textarea rows={2} value={scene} maxLength={300} placeholder={t.scenePh} onChange={(e) => setScene(e.target.value)} className="field" />
              </label>
            ) : (
              <button type="button" onClick={() => setShowScene(true)} className="text-sm font-semibold text-pink-300 hover:text-pink-200">{vf.addScene}</button>
            )}

            <button type="submit" disabled={!message.trim()} className="btn-primary">{vf.next}</button>
            <a href={`/?lang=${lang}`} className="btn-ghost">{st.back}</a>
          </form>
        )}

        {/* ---------- 2. Face and voice ---------- */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">{vf.s2Title}</h2>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-black/30 p-5 transition hover:border-pink-500">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="" className="mb-2 h-28 w-28 rounded-2xl object-cover" />
              ) : (
                <Upload className="mb-2 h-8 w-8 text-pink-400" />
              )}
              <span className="text-sm font-semibold">{t.photo}</span>
              <span className="mt-1 text-xs text-white/55">{t.photoTip}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>

            <div className="space-y-3 text-left">
              <p className="label">{t.voiceChoice}</p>
              <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
                {(["mine", "preset"] as const).map((m) => (
                  <button key={m} role="tab" aria-selected={voiceMode === m} onClick={() => chooseVoiceMode(m)}
                    className={`rounded-xl py-2.5 text-sm font-bold transition ${voiceMode === m ? "bg-purple-600 text-white" : "text-white/55 hover:text-white"}`}>
                    {m === "mine" ? t.myVoice : t.pickVoice}
                  </button>
                ))}
              </div>
            </div>

            {voiceMode === "preset" ? (
              <div className="space-y-3 text-left">
                <p className="text-xs text-white/55">{t.pickTip}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_VOICES.map((v) => {
                    const chosen = presetVoice === v.id;
                    return (
                      <div key={v.id} className={`flex items-center gap-2 rounded-2xl border p-2 transition ${chosen ? "border-pink-500 bg-pink-600/15" : "border-white/10 bg-black/40"}`}>
                        <button type="button" onClick={() => togglePreview(v.id)} disabled={!previews?.[v.id]} aria-label={`${t.voices[v.key]} ▶`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 disabled:opacity-30">
                          {playing === v.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => setPresetVoice(v.id)} aria-pressed={chosen} className="min-w-0 flex-1 py-1 text-left text-sm font-semibold leading-tight">
                          {t.voices[v.key]}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <p className="label">{t.voiceTip}</p>
                <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed">{t.script}</p>
                {!recording ? (
                  <button onClick={startRec} className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition ${voice ? "bg-emerald-600" : "bg-purple-600 hover:bg-purple-500"}`}>
                    {voice ? <RotateCcw className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    {voice ? `${t.voiceReady} · ${t.redo}` : t.record}
                  </button>
                ) : (
                  <button onClick={stopRec} className="flex w-full animate-pulse items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-bold">
                    <Square className="h-5 w-5" /> {t.recording} {recSeconds}s / {MAX_SECONDS}s · {t.stop}
                  </button>
                )}
                {voicePreview && !recording && <audio src={voicePreview} controls className="w-full" />}
                <label className="block cursor-pointer text-center text-xs text-white/55 underline">
                  {t.uploadVoice}
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptSample(f); }} />
                </label>
              </div>
            )}

            <label className="flex items-start gap-3 text-left text-sm text-white/70">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-pink-500" />
              <span>{voiceMode === "preset" ? t.consentFace : t.consent}</span>
            </label>

            <button disabled={recording} onClick={generate} className={`btn-primary ${canGenerate ? "" : "opacity-80"}`}>{vf.make}</button>
            <button onClick={() => go(1)} className="btn-ghost">{st.back}</button>
          </div>
        )}

        {step === "working" && (
          <div className="space-y-5 py-6 text-center" role="status" aria-live="polite">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-pink-400" />
            <p className="text-lg font-bold">{phaseText}</p>
            <p className="text-sm text-white/55">{t.keepOpen}</p>
          </div>
        )}

        {/* ---------- 3. Preview, pay and send ---------- */}
        {step === 3 && videoUrl && (
          <div className="space-y-5 text-center">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-bold"><CheckCircle2 className="h-7 w-7 text-emerald-400" /> {vf.s3Title}</h2>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl" onContextMenu={(e) => e.preventDefault()}>
              <video src={videoUrl} controls autoPlay playsInline controlsList="nodownload noplaybackrate" disablePictureInPicture className="max-h-[70vh] w-full object-contain" />
              {/* Light watermark tiled across the whole frame, so screenshots and screen recordings stay marked. */}
              <div aria-hidden className="pointer-events-none absolute inset-0 flex select-none flex-col justify-around overflow-hidden">
                {[0, 1, 2, 3, 4].map((r) => (
                  <span key={r} className={`-rotate-12 whitespace-nowrap text-lg font-black tracking-widest text-white/20 ${r % 2 ? "translate-x-16" : "-translate-x-8"}`}>
                    {t.watermark} · {t.watermark} · {t.watermark}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-white/55">{vf.previewNote}</p>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm text-white/75">
              {deliverBy === "text"
                ? <p className="flex items-center gap-2"><MessageSquare className="h-4 w-4 shrink-0 text-pink-300" /> {tx.willText(toName.trim() || "…")}</p>
                : <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-pink-300" /> {st.willEmail(toEmail.trim())}</p>}
            </div>
            <button onClick={payAndSend} disabled={busy} className="btn-primary">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />} {vf.pay(toName.trim() || "…")}
            </button>
            <p className="text-center text-xs text-white/40">{st.secure}</p>
            <p className="text-center text-xs text-white/40">{FINAL_SALE[lang]}</p>
            <button onClick={startOver} className="btn-ghost"><RotateCcw className="h-4 w-4" /> {st.another}</button>
          </div>
        )}

        {step === "checking" && (
          <div className="space-y-5 py-6 text-center" role="status">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-400" />
            <p className="text-lg font-bold">{vf.sendingNow}</p>
          </div>
        )}

        {/* ---------- Done ---------- */}
        {step === "done" && delivery && (
          <div className="space-y-5 text-center">
            {delivery.sent && delivery.byText && delivery.link ? (
              <ShareCard lang={lang} toName={delivery.toName || ""} fromName={delivery.fromName || ""} toPhone={delivery.toPhone} link={delivery.link} onAnother={startOver} />
            ) : delivery.sent ? (
              <>
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-amber-400 text-4xl shadow-xl shadow-pink-500/30">💌</div>
                <h2 className="title-serif text-4xl font-semibold text-amber-50">{st.sentTitle(delivery.toName || "")}</h2>
                <p className="text-white/70">{st.sentBody(delivery.toEmail || "")}</p>
                {delivery.link && <a href={delivery.link} target="_blank" rel="noopener noreferrer" className="btn-secondary"><CheckCircle2 className="h-5 w-5" /> {st.viewCard}</a>}
                <button onClick={startOver} className="btn-primary"><RotateCcw className="h-5 w-5" /> {st.another}</button>
              </>
            ) : delivery.needRecipient && sessionId ? (
              <OldSessionForm lang={lang} onSend={(r) => deliver(sessionId, r)} error={delivery.error} />
            ) : (
              <>
                <p className="text-lg font-bold">{st.notSent}</p>
                {delivery.error && <p className="alert">{delivery.error}</p>}
                {sessionId && <button onClick={() => { setStep("checking"); deliver(sessionId); }} className="btn-primary"><RotateCcw className="h-5 w-5" /> {st.retry}</button>}
                {delivery.link && <a href={delivery.link} target="_blank" rel="noopener noreferrer" className="btn-secondary">{st.viewCard}</a>}
              </>
            )}
            {sessionId && (delivery.sent || delivery.needRecipient) && (
              <a href={`/api/download?session_id=${encodeURIComponent(sessionId)}`} className="btn-ghost"><Download className="h-4 w-4" /> {vf.saveCopy}</a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/** For payments made before the recipient was saved at checkout: ask who it's for, then email it. */
function OldSessionForm({ lang, onSend, error }: { lang: Lang; onSend: (r: { toName: string; toEmail: string; fromName: string }) => void; error?: string }) {
  const st = SITE[lang];
  const [r, setR] = useState({ toName: "", toEmail: "", fromName: "" });
  return (
    <div className="space-y-3 text-left">
      {error && <p className="alert">{error}</p>}
      <label className="block"><span className="label">{st.toName}</span><input className="field" value={r.toName} maxLength={60} placeholder={st.toNamePh} onChange={(e) => setR({ ...r, toName: e.target.value })} /></label>
      <label className="block"><span className="label">{st.vEmailLabel}</span><input className="field" type="email" inputMode="email" autoComplete="off" value={r.toEmail} placeholder={st.toEmailPh} onChange={(e) => setR({ ...r, toEmail: e.target.value })} /></label>
      <label className="block"><span className="label">{st.fromName}</span><input className="field" value={r.fromName} maxLength={60} placeholder={st.fromNamePh} onChange={(e) => setR({ ...r, fromName: e.target.value })} /></label>
      <button onClick={() => onSend(r)} className="btn-primary">💌 {st.vSendTo(r.toName.trim() || "…")}</button>
    </div>
  );
}
