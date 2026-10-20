// Browser-only helpers: microphone recording, audio → WAV, and photo shrinking.

type AudioCtxCtor = typeof AudioContext;
const AudioCtx = (): AudioCtxCtor =>
  window.AudioContext || (window as unknown as { webkitAudioContext: AudioCtxCtor }).webkitAudioContext;

/** Decodes any audio the browser can play and re-encodes it as mono 16-bit WAV at 22.05 kHz. */
export async function toWav(input: Blob): Promise<{ wav: Blob; seconds: number }> {
  const ctx = new (AudioCtx())();
  try {
    const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
      input.arrayBuffer().then((buf) => ctx.decodeAudioData(buf, resolve, reject), reject);
    });
    const rate = 22050;
    const seconds = Math.min(decoded.duration, 45); // longer clips are trimmed to keep uploads small
    const frames = Math.ceil(seconds * rate);
    const off = new OfflineAudioContext(1, Math.max(1, frames), rate);
    const src = off.createBufferSource();
    src.buffer = decoded;
    src.connect(off.destination);
    src.start();
    const mono = (await off.startRendering()).getChannelData(0);

    // Normalise quiet recordings so the voice clone hears them clearly.
    let peak = 0;
    for (let i = 0; i < mono.length; i++) peak = Math.max(peak, Math.abs(mono[i]));
    const gain = peak > 0 && peak < 0.7 ? 0.9 / peak : 1;

    const out = new DataView(new ArrayBuffer(44 + mono.length * 2));
    const str = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF");
    out.setUint32(4, 36 + mono.length * 2, true);
    str(8, "WAVE");
    str(12, "fmt ");
    out.setUint32(16, 16, true);
    out.setUint16(20, 1, true);
    out.setUint16(22, 1, true);
    out.setUint32(24, rate, true);
    out.setUint32(28, rate * 2, true);
    out.setUint16(32, 2, true);
    out.setUint16(34, 16, true);
    str(36, "data");
    out.setUint32(40, mono.length * 2, true);
    for (let i = 0; i < mono.length; i++) {
      const s = Math.max(-1, Math.min(1, mono[i] * gain));
      out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return { wav: new Blob([out.buffer], { type: "audio/wav" }), seconds };
  } finally {
    ctx.close().catch(() => undefined);
  }
}

export interface Recorder {
  stop: () => Promise<Blob>;
  cancel: () => void;
}

/** Starts recording from the microphone. Throws if access is denied. */
export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  const mimeType = types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start(250);
  const release = () => stream.getTracks().forEach((t) => t.stop());
  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        rec.onstop = () => {
          release();
          resolve(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
        };
        rec.stop();
      }),
    cancel: () => {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      release();
    },
  };
}

/** Shrinks a photo to at most 1280 px on its longest side, as JPEG, with the right way up. */
export async function shrinkPhoto(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read that photo. Try a JPEG or PNG."));
      el.src = url; // modern browsers apply the photo's rotation when drawing
    });
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext("2d");
    if (!g) return file;
    g.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b || file), "image/jpeg", 0.88),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
