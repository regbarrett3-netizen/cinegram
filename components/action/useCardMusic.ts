"use client";

import { useEffect, useRef, useState } from "react";
import { musicFor } from "../../lib/action/music";
import type { ActionId } from "../../lib/action/catalog";

type AC = typeof AudioContext;

/** Plays an action card's music in step with its animation, with a mute switch. */
export function useCardMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const cycleAt = useRef(0);
  const token = useRef(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  /** Call from a tap/click: phones only allow sound that starts from a user gesture. */
  function unlock(): AudioContext | null {
    try {
      if (!ctxRef.current) {
        const w = window as unknown as { AudioContext?: AC; webkitAudioContext?: AC };
        const Ctor = w.AudioContext || w.webkitAudioContext;
        if (!Ctor) return null;
        ctxRef.current = new Ctor();
        const nav = navigator as unknown as { audioSession?: { type: string } };
        if (nav.audioSession) nav.audioSession.type = "playback"; // iOS 17+: ignore the silent switch
      }
      if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }

  function stop() {
    token.current++;
    try { srcRef.current?.stop(); } catch { /* already stopped */ }
    srcRef.current = null;
  }

  /** Restart the music from the top (call when the animation loops). */
  function start(id: ActionId) {
    stop();
    cycleAt.current = performance.now();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const my = token.current;
    musicFor(id).then((buf) => {
      if (my !== token.current) return;
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
  useEffect(() => () => stop(), []);

  return { unlock, start, stop, muted, setMuted, ctx: () => ctxRef.current };
}
