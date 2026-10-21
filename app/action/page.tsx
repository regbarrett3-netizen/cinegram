"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clapperboard, CreditCard, Download, Loader2, RotateCcw, Share2, Volume2, VolumeX, X } from "lucide-react";
import { ActionCanvas } from "../../components/action/ActionCanvas";
import { CardsHeader } from "../../components/cards/CardsHeader";
import { useCardLang } from "../../components/cards/useCardLang";
import { ACTION_IDS, ACTION_TEXT, ACTION_UI, isActionId, type ActionId } from "../../lib/action/catalog";
import { recordVideo, videoSupport } from "../../lib/action/render";
import { musicFor } from "../../lib/action/music";
import { CARD_UI } from "../../lib/cardsCatalog";
import { CARD_FONT_FAMILY, cardSerif } from "../../lib/cardFont";
import { isLang, type Lang } from "../../lib/i18n";

type Phase = "detail" | "checking" | "paid";
type Saved = { id: string; to: string; from: string };
const SAVE_KEY = "cinegram:action";
const BTN_MAIN = "w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 font-bold rounded-2xl text-base hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2";
const BTN_SUB = "w-full py-3 rounded-2xl border border-slate-700 bg-slate-800 font-semibold hover:bg-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50";

type AC = typeof AudioContext;

/** One shared audio context, created during a tap so phones allow sound. */
function audioCtx(ref: { current: AudioContext | null }): AudioContext | null {
  try {
    if (!ref.current) {
      const w = window as unknown as { AudioContext?: AC; webkitAudioContext?: AC };
      const Ctor = w.AudioContext || w.webkitAudioContext;
      if (!Ctor) return null;
      ref.current = new Ctor();
      // iOS 17+: play even when the ring/silent switch is on silent.
      const nav = navigator as unknown as { audioSession?: { type: string } };
      if (nav.audioSession) nav.audioSession.type = "playback";
    }
    if (ref.current.state === "suspended") void ref.current.resume();
    return ref.current;
  } catch {
    return null;
  }
}

function save(s: Saved) {
  try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* private mode */ }
}
function load(): Saved | null {
  try { const raw = sessionStorage.getItem(SAVE_KEY); return raw ? (JSON.parse(raw) as Saved) : null; } catch { return null; }
}

export default function ActionCardsPage() {
  const [lang, setLang] = useCardLang();
  const ui = ACTION_UI[lang];
  const cui = CARD_UI[lang];

  const [selected, setSelected] = useState<ActionId | null>(null);
  const [phase, setPhase] = useState<Phase>("detail");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [video, setVideo] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const cycleAt = useRef(0);
  const playToken = useRef(0);

  function stopMusic() {
    playToken.current++;
    try { srcRef.current?.stop(); } catch { /* already stopped */ }
    srcRef.current = null;
  }

  /** (Re)starts the music in step with the preview animation. */
  function startMusic(id: ActionId) {
    stopMusic();
    cycleAt.current = performance.now();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const token = playToken.current;
    musicFor(id).then((buf) => {
      if (token !== playToken.current || !ctxRef.current) return;
      const offset = (performance.now() - cycleAt.current) / 1000;
      if (offset >= buf.duration) return;
      if (!gainRef.current) { gainRef.current = ctx.createGain(); gainRef.current.connect(ctx.destination); }
      gainRef.current.gain.value = mutedRef.current ? 0 : 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(gainRef.current);
      src.start(0, offset);
      srcRef.current = src;
    }).catch(() => { /* play silently */ });
  }

  useEffect(() => { if (gainRef.current) gainRef.current.gain.value = muted ? 0 : 1; }, [muted]);
  useEffect(() => () => stopMusic(), []);

  // Coming back from Stripe.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("card"), sid = p.get("session_id"), qLang = p.get("lang");
    if (!isActionId(id)) return;
    const msgs = ACTION_UI[isLang(qLang) ? (qLang as Lang) : "en"];
    const saved = load();
    if (saved && saved.id === id) { setTo(saved.to); setFrom(saved.from); }
    setSelected(id);
    if (sid) {
      setPhase("checking");
      fetch(`/api/action-unlock?session_id=${encodeURIComponent(sid)}`)
        .then((r) => r.json())
        .then((d: { paid?: boolean; actionId?: string }) => {
          if (d.paid && d.actionId === id) setPhase("paid");
          else { setError(msgs.notPaid); setPhase("detail"); }
        })
        .catch(() => { setError(msgs.notPaid); setPhase("detail"); });
    } else if (p.get("status") === "cancelled") {
      setNotice(msgs.cancelled);
      window.history.replaceState(null, "", `/action?lang=${qLang || "en"}`);
    }
  }, []);

  useEffect(() => {
    try {
      const probe = new File([new Blob(["x"], { type: "video/mp4" })], "x.mp4", { type: "video/mp4" });
      setCanShare(!!navigator.canShare && navigator.canShare({ files: [probe] }));
    } catch { setCanShare(false); }
  }, []);

  // A new name means the old video no longer matches.
  useEffect(() => {
    setVideo((v) => { if (v) URL.revokeObjectURL(v.url); return null; });
  }, [to, from, lang, selected]);

  function open(id: ActionId) {
    audioCtx(ctxRef);
    void musicFor(id).catch(() => undefined);
    setSelected(id); setPhase("detail"); setError(null); setNotice(null);
  }
  function close() {
    if (progress !== null) return;
    stopMusic();
    setSelected(null); setPhase("detail"); setError(null); setNotice(null);
    if (window.location.search.includes("card=")) window.history.replaceState(null, "", `/action?lang=${lang}`);
  }

  async function buy() {
    if (!selected) return;
    setBusy(true); setError(null);
    save({ id: selected, to, from });
    try {
      const res = await fetch("/api/action-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actionId: selected, lang }) });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || ui.error);
      window.location.href = data.url;
    } catch (e) { setError((e as Error).message || ui.error); setBusy(false); }
  }

  async function make() {
    if (!selected) return;
    if (!videoSupport()) { setError(ui.noVideo); return; }
    const ctx = audioCtx(ctxRef); // created inside the tap so the recording can include sound
    stopMusic();
    setError(null); setProgress(0);
    try {
      let audio: { ctx: AudioContext; buffer: AudioBuffer } | undefined;
      try { if (ctx) audio = { ctx, buffer: await musicFor(selected) }; } catch { audio = undefined; }
      const file = await recordVideo(selected, { lang, to, from, fontFamily: CARD_FONT_FAMILY }, setProgress, audio);
      stopMusic();
      setVideo({ file, url: URL.createObjectURL(file) });
    } catch (e) {
      setError((e as Error).message === "NO_VIDEO" ? ui.noVideo : ui.error);
    } finally { setProgress(null); }
  }

  function download() {
    if (!video) return;
    const a = document.createElement("a");
    a.href = video.url; a.download = video.file.name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  async function share() {
    if (!video || !selected) return;
    try { await navigator.share({ files: [video.file], title: ACTION_TEXT[lang][selected].h }); }
    catch (e) { if ((e as Error).name !== "AbortError") setError(ui.error); }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 sm:p-8 font-sans">
      <CardsHeader lang={lang} setLang={setLang} backHref={`/cards?lang=${lang}`} backLabel={ui.quickCards} />

      <section className="w-full max-w-3xl text-center mb-8 space-y-3">
        <h1 className="text-4xl sm:text-5xl font-semibold text-amber-100" style={{ fontFamily: cardSerif.style.fontFamily }}>{ui.title}</h1>
        <p className="text-slate-300 text-sm sm:text-base">{ui.tagline}</p>
        <p className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-xs font-semibold text-pink-200">
          <Clapperboard className="w-3.5 h-3.5" /> {ui.videoNote} · {ui.musicNote} · {ui.price}
        </p>
        <p className="pt-3 text-sm text-slate-400">{ui.pick}</p>
      </section>

      <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {ACTION_IDS.map((id) => (
          <button key={id} onClick={() => open(id)} className="text-left rounded-2xl transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500">
            <ActionCanvas id={id} lang={lang} maxScale={0.5} label={ACTION_TEXT[lang][id].name} />
            <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-200 truncate">{ACTION_TEXT[lang][id].name}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div role="dialog" aria-modal="true" aria-label={ACTION_TEXT[lang][selected].name} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="font-bold">{ACTION_TEXT[lang][selected].name}</p>
                {phase !== "checking" && progress === null && (
                  <button onClick={close} aria-label={ui.close} className="p-2 -m-2 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                )}
              </div>
              {error && <p role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
              {notice && <p role="status" className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">{notice}</p>}

              {video ? (
                <video src={video.url} controls autoPlay loop playsInline className="w-full aspect-[9/16] rounded-2xl bg-black" />
              ) : (
                <div className="relative">
                  <ActionCanvas id={selected} lang={lang} to={to} from={from} watermark={phase === "paid" ? undefined : ui.watermark} playing={progress === null} maxScale={1} label={ACTION_TEXT[lang][selected].h} onCycle={() => startMusic(selected)} />
                  <button
                    onClick={() => { audioCtx(ctxRef); setMuted((m) => !m); }}
                    aria-label={muted ? ui.soundOn : ui.soundOff}
                    className="absolute top-3 right-3 rounded-full bg-black/45 p-2.5 text-white backdrop-blur hover:bg-black/60"
                  >
                    {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {phase === "checking" && <p className="flex items-center justify-center gap-2 text-sm text-slate-300"><Loader2 className="w-4 h-4 animate-spin" /> {ui.checking}</p>}

              {phase !== "checking" && (
                <fieldset className="space-y-3" disabled={progress !== null}>
                  <legend className="text-sm font-semibold text-slate-300 mb-2">{cui.personalize}</legend>
                  <label className="block"><span className="text-xs text-slate-400">{cui.to}</span>
                    <input value={to} onChange={(e) => setTo(e.target.value)} maxLength={40} placeholder={cui.toPh} className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-base outline-none focus:border-pink-500" />
                  </label>
                  <label className="block"><span className="text-xs text-slate-400">{cui.from}</span>
                    <input value={from} onChange={(e) => setFrom(e.target.value)} maxLength={40} placeholder={cui.fromPh} className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-base outline-none focus:border-pink-500" />
                  </label>
                </fieldset>
              )}

              {phase === "detail" && (
                <>
                  <p className="text-xs text-slate-400 text-center">{ui.previewNote}</p>
                  <button onClick={buy} disabled={busy} className={BTN_MAIN}>{busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />} {ui.buy}</button>
                </>
              )}

              {phase === "paid" && (
                <>
                  <p className="flex items-center justify-center gap-2 font-bold text-emerald-300"><CheckCircle2 className="w-5 h-5" /> {ui.paidTitle}</p>
                  {!video && (
                    <button onClick={make} disabled={progress !== null} className={BTN_MAIN}>
                      {progress !== null ? <><Loader2 className="w-5 h-5 animate-spin" /> {ui.making(progress)}</> : <><Clapperboard className="w-5 h-5" /> {ui.make}</>}
                    </button>
                  )}
                  {video && (
                    <>
                      <button onClick={download} className={BTN_MAIN}><Download className="w-5 h-5" /> {ui.download}</button>
                      {canShare && <button onClick={share} className={BTN_SUB}><Share2 className="w-4 h-4" /> {ui.share}</button>}
                      <button onClick={() => setVideo(null)} className={BTN_SUB}><RotateCcw className="w-4 h-4" /> {ui.again}</button>
                    </>
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
