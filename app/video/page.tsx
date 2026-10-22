"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Film, Mic, Square, Upload, CheckCircle2, Globe, Heart, PartyPopper, Cake, Trophy, CreditCard, Download, Loader2, RotateCcw, Play, Pause,
} from "lucide-react";
import { LANGUAGES, MAX_MESSAGE, STRINGS, isLang, type Lang, type Occasion } from "../../lib/i18n";
import { shrinkPhoto, startRecording, toWav, type Recorder } from "../../lib/media";
import { PRESET_VOICES } from "../../lib/voices";
import { SiteHeader } from "../../components/SiteHeader";
import { useCardLang } from "../../components/cards/useCardLang";
import { SITE } from "../../lib/siteText";
import { WIZARD_KEY, videoOccasion, type WizardState } from "../../lib/send";
import { isEmail } from "../../lib/emailCheck";

const OCCASIONS: { id: Occasion; icon: typeof Cake }[] = [
  { id: "bday", icon: Cake },
  { id: "love", icon: Heart },
  { id: "party", icon: PartyPopper },
  { id: "victory", icon: Trophy },
];

type Step = "lang" | "occasion" | "write" | "capture" | "working" | "preview" | "checking" | "paid";
type Phase = "upload" | "clone" | "queue" | "render";

const SAVE_KEY = "cinegram:last";
const MIN_SECONDS = 10;
const MAX_SECONDS = 30;
const POLL_MS = 4000;
const GIVE_UP_MS = 12 * 60 * 1000;

const BTN_MAIN =
  "w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 font-bold rounded-2xl text-base hover:opacity-90 transition disabled:opacity-50";

function save(data: { lang: Lang; requestId: string; videoUrl: string }) {
  try {
    sessionStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* private mode */
  }
}
function load(): { lang: Lang; requestId: string; videoUrl: string } | null {
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CinegramApp() {
  const [lang, setLang] = useCardLang();
  const st = SITE[lang];
  const t = STRINGS[lang];
  const [step, setStep] = useState<Step>("occasion");

  const [occasion, setOccasion] = useState<Occasion>("bday");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [messageEdited, setMessageEdited] = useState(false);
  const [scene, setScene] = useState("");

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

  const [phase, setPhase] = useState<Phase>("upload");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Errors show near the top; bring them into view so a failed payment is never silent.
  useEffect(() => { if (error) document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [error]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wiz, setWiz] = useState<WizardState>({});
  const [sendTo, setSendTo] = useState({ toName: "", toEmail: "", fromName: "" });
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Fill in the default greeting until the person writes their own.
  useEffect(() => {
    if (!messageEdited) setMessage(t.greet[occasion](recipient.trim()));
  }, [lang, occasion, recipient, messageEdited, t]);

  // Arriving from the 1-2-3 flow: start with the recipient and occasion already filled in.
  useEffect(() => {
    try {
      const w = JSON.parse(sessionStorage.getItem(WIZARD_KEY) || "{}") as WizardState;
      setWiz(w);
      setSendTo({ toName: w.toName || "", toEmail: w.toEmail || "", fromName: w.fromName || "" });
      if (w.toName && w.occasion && !new URLSearchParams(window.location.search).get("session_id")) {
        setRecipient(w.toName);
        setOccasion(videoOccasion(w.occasion));
        setStep("write");
      }
    } catch { /* no saved flow */ }
  }, []);

  async function emailVideo() {
    if (!sessionId) return;
    if (!sendTo.toName.trim() || !sendTo.fromName.trim()) return setError(st.namesNeeded);
    if (!isEmail(sendTo.toEmail.trim())) return setError(st.emailInvalid);
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/send-video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, ...sendTo, lang, occasion: wiz.occasion }) });
      const d = (await res.json()) as { sent?: boolean; toEmail?: string; error?: string };
      if (!res.ok || !d.sent) throw new Error(d.error || st.error);
      setSentTo(d.toEmail || sendTo.toEmail);
    } catch (e) { setError((e as Error).message); }
    finally { setSending(false); }
  }

  // Coming back from Stripe.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    const cancelled = params.get("status") === "cancelled";
    const saved = load();
    if (saved && isLang(saved.lang)) setLang(saved.lang);
    if (sid) {
      window.history.replaceState(null, "", "/video");
      setStep("checking");
      fetch(`/api/unlock?session_id=${encodeURIComponent(sid)}`)
        .then((r) => r.json())
        .then((d: { paid?: boolean; videoUrl?: string }) => {
          if (d.paid && d.videoUrl) {
            setVideoUrl(d.videoUrl);
            setSessionId(sid);
            setStep("paid");
          } else {
            setError(STRINGS[saved?.lang && isLang(saved.lang) ? saved.lang : "en"].notPaid);
            if (saved) restorePreview(saved);
            else setStep("occasion");
          }
        })
        .catch(() => {
          setError(STRINGS[saved?.lang && isLang(saved.lang) ? saved.lang : "en"].notPaid);
          setStep(saved ? "preview" : "occasion");
        });
    } else if (cancelled && saved) {
      window.history.replaceState(null, "", "/video");
      restorePreview(saved);
      setNotice(STRINGS[isLang(saved.lang) ? saved.lang : "en"].cancelled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function restorePreview(saved: { requestId: string; videoUrl: string }) {
    setRequestId(saved.requestId);
    setVideoUrl(saved.videoUrl);
    setStep("preview");
  }

  // Poll while the video renders.
  useEffect(() => {
    if (step !== "working" || !requestId) return;
    const started = Date.now();
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      if (Date.now() - started > GIVE_UP_MS) {
        setError(t.error);
        setStep("capture");
        return;
      }
      try {
        const s = (await (await fetch(`/api/status?id=${encodeURIComponent(requestId)}`)).json()) as
          { state: string; videoUrl?: string; error?: string };
        if (stopped) return;
        if (s.state === "done" && s.videoUrl) {
          setVideoUrl(s.videoUrl);
          save({ lang, requestId, videoUrl: s.videoUrl });
          setStep("preview");
          return;
        }
        if (s.state === "failed") {
          setError(`${t.error} ${s.error || ""}`.trim());
          setStep("capture");
          return;
        }
        setPhase(s.state === "queued" ? "queue" : "render");
      } catch {
        /* network blip: keep polling */
      }
      setTimeout(tick, POLL_MS);
    };
    const first = setTimeout(tick, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(first);
    };
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
    fetch("/api/voices")
      .then((r) => r.json())
      .then((d: { previews?: Record<string, string> }) => setPreviews(d.previews || {}))
      .catch(() => setPreviews({}));
  }, [voiceMode, previews]);

  function togglePreview(id: string) {
    const url = previews?.[id];
    if (!url) return;
    player.current?.pause();
    if (playing === id) {
      setPlaying(null);
      return;
    }
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
    setVoicePreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return b ? URL.createObjectURL(b) : null;
    });
  }

  async function startRec() {
    setError(null);
    setVoiceBlob(null);
    try {
      recorder.current = await startRecording();
      setRecSeconds(0);
      setRecording(true);
    } catch {
      setError(t.micDenied);
    }
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
      if (seconds < MIN_SECONDS) {
        setError(t.tooShort);
        return;
      }
      setError(null);
      setVoiceBlob(wav);
    } catch {
      setError(t.error);
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const small = await shrinkPhoto(file);
      setPhoto(small);
      setPhotoPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(small);
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function generate() {
    const hasVoice = voiceMode === "preset" || !!voice;
    if (!photo || !hasVoice || !consent) return;
    player.current?.pause();
    setError(null);
    setNotice(null);
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
      setStep("capture");
    } finally {
      clearTimeout(cloneTimer);
    }
  }

  async function checkout() {
    if (!requestId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error(data.error || t.error);
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  function startOver() {
    setStep("occasion");
    setRequestId(null);
    setVideoUrl(null);
    setSessionId(null);
    setError(null);
    setNotice(null);
    setBusy(false);
  }

  const phaseText = { upload: t.sUpload, clone: t.sClone, queue: t.sQueue, render: t.sRender }[phase];
  const canGenerate = !!photo && (voiceMode === "preset" || !!voice) && consent && !recording && message.trim().length > 0;

  return (
    <main className="page font-sans">
      <SiteHeader lang={lang} setLang={setLang} active="video" />

      <div className="panel max-w-xl p-6 sm:p-8">
        {error && (
          <p role="alert" className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-5 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
            {notice}
          </p>
        )}

        {step === "lang" && (
          <div className="space-y-6 text-center">
            <p className="text-sm font-semibold text-pink-300">{t.tagline}</p>
            <h2 className="text-2xl font-black">{t.chooseLanguage}</h2>
            <p className="text-white/55 text-sm">{t.chooseLanguageSub}</p>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setStep("occasion"); }}
                  className="p-4 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-2xl font-bold text-base transition border border-white/10"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "occasion" && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black">{t.pickOccasion}</h2>
            <div className="grid grid-cols-2 gap-4">
              {OCCASIONS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setOccasion(id); setStep("write"); }}
                  className="p-5 bg-white/5 hover:bg-pink-600/30 hover:border-pink-500/50 rounded-2xl flex flex-col items-center gap-3 transition border border-white/10 group"
                >
                  <Icon className="w-10 h-10 text-pink-400 group-hover:scale-110 transition" />
                  <span className="font-bold text-sm">{t.occ[id]}</span>
                </button>
              ))}
            </div>
            <a href={`/?lang=${lang}`} className="btn-ghost">{t.back}</a>
          </div>
        )}

        {step === "write" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-black text-center">{t.writeTitle}</h2>
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/55">{t.recipient}</span>
              <input
                value={recipient}
                maxLength={40}
                placeholder={t.recipientPh}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-pink-500"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/55">{t.message}</span>
              <textarea
                rows={4}
                value={message}
                maxLength={MAX_MESSAGE}
                onChange={(e) => { setMessage(e.target.value); setMessageEdited(true); }}
                className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-pink-500"
              />
              <span className="flex justify-between gap-3 text-xs text-white/55">
                <span>{t.messageHint}</span>
                <span className="tabular-nums shrink-0">{message.length}/{MAX_MESSAGE}</span>
              </span>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/55">{t.scene}</span>
              <textarea
                rows={2}
                value={scene}
                maxLength={300}
                placeholder={t.scenePh}
                onChange={(e) => setScene(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-pink-500"
              />
            </label>
            <button disabled={!message.trim()} onClick={() => setStep("capture")} className={BTN_MAIN}>{t.next}</button>
            <button onClick={() => setStep("occasion")} className="block mx-auto text-xs text-white/55 hover:text-white">{t.back}</button>
          </div>
        )}

        {step === "capture" && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black">{t.faceTitle}</h2>

            <label className="cursor-pointer border-2 border-dashed border-white/15 hover:border-pink-500 rounded-2xl p-5 flex flex-col items-center justify-center bg-black/40/50 transition">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="" className="w-28 h-28 rounded-2xl object-cover mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-pink-400 mb-2" />
              )}
              <span className="text-sm font-semibold">{t.photo}</span>
              <span className="text-xs text-white/55 mt-1">{t.photoTip}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>

            <div className="space-y-3 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-white/55">{t.voiceChoice}</p>
              <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-black/30 border border-white/10 p-1">
                {(["mine", "preset"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={voiceMode === m}
                    onClick={() => chooseVoiceMode(m)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition ${voiceMode === m ? "bg-purple-600 text-white" : "text-white/55 hover:text-white"}`}
                  >
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
                      <div
                        key={v.id}
                        className={`flex items-center gap-2 rounded-2xl border p-2 transition ${chosen ? "border-pink-500 bg-pink-600/15" : "border-white/10 bg-black/40"}`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePreview(v.id)}
                          disabled={!previews?.[v.id]}
                          aria-label={`${t.voices[v.key]} ▶`}
                          className="shrink-0 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center disabled:opacity-30"
                        >
                          {playing === v.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetVoice(v.id)}
                          aria-pressed={chosen}
                          className="flex-1 min-w-0 text-left text-sm font-semibold leading-tight py-1"
                        >
                          {t.voices[v.key]}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div className="space-y-3 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-white/55">{t.voiceTip}</p>
              <p className="rounded-2xl bg-black/30 border border-white/10 p-4 text-sm leading-relaxed">{t.script}</p>
              {!recording ? (
                <button
                  onClick={startRec}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${voice ? "bg-emerald-600" : "bg-purple-600 hover:bg-purple-500"}`}
                >
                  {voice ? <RotateCcw className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {voice ? `${t.voiceReady} · ${t.redo}` : t.record}
                </button>
              ) : (
                <button onClick={stopRec} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-red-600 animate-pulse">
                  <Square className="w-5 h-5" /> {t.recording} {recSeconds}s / {MAX_SECONDS}s · {t.stop}
                </button>
              )}
              {voicePreview && !recording && <audio src={voicePreview} controls className="w-full" />}
              <label className="block text-center text-xs text-white/55 underline cursor-pointer">
                {t.uploadVoice}
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptSample(f); }}
                />
              </label>
            </div>
            )}

            <label className="flex items-start gap-3 text-left text-sm text-white/70">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-pink-500" />
              <span>{voiceMode === "preset" ? t.consentFace : t.consent}</span>
            </label>

            <button
              disabled={!canGenerate}
              onClick={generate}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black rounded-2xl text-lg disabled:opacity-50 hover:opacity-90 transition shadow-lg"
            >
              {t.generate}
            </button>
            <button onClick={() => setStep("write")} className="text-xs text-white/55 hover:text-white">{t.back}</button>
          </div>
        )}

        {step === "working" && (
          <div className="space-y-5 text-center py-6" role="status" aria-live="polite">
            <Loader2 className="w-12 h-12 mx-auto text-pink-400 animate-spin" />
            <p className="text-lg font-bold">{phaseText}</p>
            <p className="text-sm text-white/55">{t.keepOpen}</p>
          </div>
        )}

        {step === "checking" && (
          <div className="space-y-5 text-center py-6" role="status">
            <Loader2 className="w-12 h-12 mx-auto text-emerald-400 animate-spin" />
            <p className="text-lg font-bold">{t.checking}</p>
          </div>
        )}

        {step === "preview" && videoUrl && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black flex items-center justify-center gap-2">
              <CheckCircle2 className="text-emerald-400 w-7 h-7" /> {t.readyTitle}
            </h2>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black" onContextMenu={(e) => e.preventDefault()}>
              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                className="w-full max-h-[70vh] object-contain"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="-rotate-12 text-2xl sm:text-3xl font-black tracking-widest text-white/35 select-none">{t.watermark}</span>
              </div>
            </div>
            <p className="text-xs text-white/55">{t.previewNote}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={checkout}
                disabled={busy}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />} {t.buy}
              </button>
              <button onClick={startOver} className="text-xs text-white/55 hover:text-white transition">{t.another}</button>
            </div>
          </div>
        )}

        {step === "paid" && videoUrl && sessionId && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black flex items-center justify-center gap-2">
              <CheckCircle2 className="text-emerald-400 w-7 h-7" /> {t.paidTitle}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
              <video src={videoUrl} controls autoPlay playsInline className="w-full max-h-[70vh] object-contain" />
            </div>
            {sentTo ? (
              <p className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-3 font-semibold text-emerald-100">💌 {st.vSent(sentTo)}</p>
            ) : (
              <div className="space-y-3 text-left">
                <label className="block"><span className="label">{st.toName}</span><input className="field" value={sendTo.toName} maxLength={60} placeholder={st.toNamePh} onChange={(e) => setSendTo({ ...sendTo, toName: e.target.value })} /></label>
                <label className="block"><span className="label">{st.vEmailLabel}</span><input className="field" type="email" inputMode="email" autoComplete="off" value={sendTo.toEmail} placeholder={st.toEmailPh} onChange={(e) => setSendTo({ ...sendTo, toEmail: e.target.value })} /></label>
                <label className="block"><span className="label">{st.fromName}</span><input className="field" value={sendTo.fromName} maxLength={60} placeholder={st.fromNamePh} onChange={(e) => setSendTo({ ...sendTo, fromName: e.target.value })} /></label>
                <button onClick={emailVideo} disabled={sending} className="btn-primary">{sending ? <Loader2 className="w-5 h-5 animate-spin" /> : "💌"} {st.vSendTo(sendTo.toName.trim() || "…")}</button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <a
                href={`/api/download?session_id=${encodeURIComponent(sessionId)}`}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition"
              >
                <Download className="w-5 h-5" /> {t.download}
              </a>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 underline">{t.openVideo}</a>
              <button onClick={startOver} className="text-xs text-white/55 hover:text-white transition">{t.another}</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
