"use client";

import React, { useEffect, useRef, useState } from "react";
import { Film, Mic, Upload, CheckCircle2, Globe, Heart, PartyPopper, Cake, Trophy, CreditCard } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "🇺🇸 English" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "pt", label: "🇵🇹 Português" },
  { code: "zh", label: "🇨🇳 普通话" },
  { code: "yue", label: "🇭🇰 廣東話" },
];

const OCCASIONS = [
  { id: "bday", icon: Cake, name: "Birthday" },
  { id: "love", icon: Heart, name: "Love & Romance" },
  { id: "party", icon: PartyPopper, name: "Celebration" },
  { id: "victory", icon: Trophy, name: "Congrats / Hype" },
];

const MESSAGE_PLACEHOLDERS: Record<string, string> = {
  Birthday: "Happy birthday! Wishing you the most amazing year yet...",
  "Love & Romance": "Every day with you feels like a movie...",
  Celebration: "Cheers to you and this incredible moment...",
  "Congrats / Hype": "You did it! I knew you could pull this off...",
};

const RECORDING_SECONDS = 10;
const POLL_INTERVAL_MS = 4000;
const MAX_PHOTO_DIMENSION = 1024;

// Shrink large phone photos so the upload stays well under serverless body limits
async function downscalePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process photo"))), "image/jpeg", 0.9)
  );
}

export default function CinegramApp() {
  const [lang, setLang] = useState("en");
  const [step, setStep] = useState(1);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSample, setVoiceSample] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current);
      if (pollRef.current) clearTimeout(pollRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopRecording = () => {
    if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setVoiceSample(new Blob(chunks, { type: recorder.mimeType }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setVoiceSample(null);
      setIsRecording(true);
      recordTimeoutRef.current = setTimeout(stopRecording, RECORDING_SECONDS * 1000);
    } catch {
      setError("Microphone access is needed to capture your voice.");
    }
  };

  const pollForVideo = (requestId: string) => {
    pollRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/card-status?requestId=${encodeURIComponent(requestId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to check video status");

        if (data.status === "COMPLETED") {
          setVideoResult(data.videoUrl);
          setLoading(false);
          setStep(5);
        } else {
          setLoadingStatus(data.status === "IN_QUEUE" ? "Waiting for a render slot..." : "Animating your face...");
          pollForVideo(requestId);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }, POLL_INTERVAL_MS);
  };

  const handleGenerate = async () => {
    if (!photo || !voiceSample) return;
    setError(null);
    setLoading(true);
    setLoadingStatus("Cloning your voice...");
    try {
      const formData = new FormData();
      formData.append("photo", await downscalePhoto(photo), "photo.jpg");
      const ext = voiceSample.type.includes("mp4") ? "mp4" : voiceSample.type.includes("ogg") ? "ogg" : "webm";
      formData.append("voice", voiceSample, `voice.${ext}`);
      formData.append("message", message);

      const res = await fetch("/api/generate-card", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate video card");

      setLoadingStatus("Rendering your Cinegram...");
      pollForVideo(data.requestId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const resetCard = () => {
    setStep(1);
    setSelectedOccasion("");
    setMessage("");
    setPhoto(null);
    setVoiceSample(null);
    setVideoResult(null);
    setError(null);
  };

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-4 sm:p-8 font-sans">
      {/* Header */}
      <header className="w-full max-w-2xl flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Film className="w-8 h-8 text-pink-500 animate-pulse" />
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-amber-300">
            CINEGRAM
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300">
          <Globe className="w-4 h-4 text-purple-400" />
          {LANGUAGES.find((l) => l.code === lang)?.label}
        </div>
      </header>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* STEP 1: SELECT LANGUAGE */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black">Choose Language</h2>
            <p className="text-slate-400 text-sm">Select your language to begin creating your cinematic video card.</p>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setStep(2); }}
                  className="p-4 bg-slate-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-2xl font-bold text-base transition duration-200 border border-slate-700/50"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT OCCASION */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black">Pick the Occasion</h2>
            <div className="grid grid-cols-2 gap-4">
              {OCCASIONS.map((occ) => {
                const Icon = occ.icon;
                return (
                  <button
                    key={occ.id}
                    onClick={() => { setSelectedOccasion(occ.name); setStep(3); }}
                    className="p-5 bg-slate-800 hover:bg-pink-600/30 hover:border-pink-500/50 rounded-2xl flex flex-col items-center gap-3 transition border border-slate-700/50 group"
                  >
                    <Icon className="w-10 h-10 text-pink-400 group-hover:scale-110 transition" />
                    <span className="font-bold text-sm">{occ.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: MESSAGE */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-center">Write Your Message</h2>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">What should your Cinegram say?</label>
              <textarea
                rows={4}
                maxLength={500}
                placeholder={MESSAGE_PLACEHOLDERS[selectedOccasion] || "Write your message..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-pink-500"
              />
              <p className="text-xs text-slate-500 text-right">{message.length}/500</p>
            </div>
            <button
              disabled={!message.trim()}
              onClick={() => setStep(4)}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 font-bold rounded-2xl text-base hover:opacity-90 transition disabled:opacity-50"
            >
              Continue to Face & Voice →
            </button>
          </div>
        )}

        {/* STEP 4: PHOTO & VOICE CAPTURE */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black">Add Your Face & Voice</h2>

            <div className="space-y-2">
              <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-pink-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-950/50 transition">
                <Upload className="w-8 h-8 text-pink-400 mb-2" />
                <span className="text-sm font-semibold">{photo ? photo.name : "Tap to Upload Selfie"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </label>
            </div>

            <button
              disabled={loading}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                isRecording ? "bg-red-600 animate-pulse" : voiceSample ? "bg-emerald-600" : "bg-purple-600 hover:bg-purple-500"
              }`}
            >
              <Mic className="w-5 h-5" />
              {isRecording ? "Recording... Tap to Stop" : voiceSample ? "Voice Captured! Tap to Re-record" : `Record ${RECORDING_SECONDS}-Second Voice Sample`}
            </button>

            <button
              disabled={!photo || !voiceSample || isRecording || loading}
              onClick={handleGenerate}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black rounded-2xl text-lg disabled:opacity-50 hover:opacity-90 transition shadow-lg"
            >
              {loading ? loadingStatus || "Creating Your Cinegram..." : "🚀 GENERATE CINEGRAM!"}
            </button>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}

        {/* STEP 5: PREVIEW & STRIPE BUY */}
        {step === 5 && videoResult && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black flex items-center justify-center gap-2">
              <CheckCircle2 className="text-emerald-400 w-7 h-7" /> Your Cinegram is Ready!
            </h2>

            <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-black">
              <video src={videoResult} controls autoPlay className="w-full aspect-video object-cover" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition"
              >
                <CreditCard className="w-5 h-5" /> Download HD Video (No Watermark) — $2.99
              </button>
              <button
                onClick={resetCard}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                ← Create Another Cinegram
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
