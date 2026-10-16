"use client";

import React, { useState } from "react";
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

export default function CinegramApp() {
  const [lang, setLang] = useState("en");
  const [step, setStep] = useState(1);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);

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

        {/* STEP 3: PROMPT */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-center">Describe Your Scene</h2>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Prompt</label>
              <textarea
                rows={3}
                placeholder="E.g., An astronaut singing in outer space surrounded by glowing stars..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
            <button
              onClick={() => setStep(4)}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 font-bold rounded-2xl text-base hover:opacity-90 transition"
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
              onClick={() => {
                setIsRecording(true);
                setTimeout(() => { setIsRecording(false); setVoiceRecorded(true); }, 4000);
              }}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${
                isRecording ? "bg-red-600 animate-pulse" : voiceRecorded ? "bg-emerald-600" : "bg-purple-600 hover:bg-purple-500"
              }`}
            >
              <Mic className="w-5 h-5" />
              {isRecording ? "Recording Vocal Sample..." : voiceRecorded ? "Voice Captured!" : "Sing 10-Second Sample"}
            </button>

            <button
              disabled={!photo || !voiceRecorded || loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  setVideoResult("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
                  setStep(5);
                }, 3000);
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black rounded-2xl text-lg disabled:opacity-50 hover:opacity-90 transition shadow-lg"
            >
              {loading ? "Creating Your Cinegram..." : "🚀 GENERATE CINEGRAM!"}
            </button>
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
                onClick={() => setStep(1)}
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
