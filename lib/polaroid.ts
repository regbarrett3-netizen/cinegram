// Draws a photo as a tilted polaroid print (used on art cards and action cards).
export function polaroid(c: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, rot: number, alpha = 1) {
  if (alpha <= 0) return;
  const pad = w * 0.06, inner = w - pad * 2, h = inner + pad + w * 0.2;
  c.save();
  c.globalAlpha = alpha;
  c.translate(x + w / 2, y + h / 2);
  c.rotate(rot);
  c.shadowColor = "rgba(0,0,0,.28)";
  c.shadowBlur = w * 0.08;
  c.shadowOffsetY = w * 0.03;
  c.fillStyle = "#fffdf8";
  c.fillRect(-w / 2, -h / 2, w, h);
  c.shadowColor = "transparent";
  const iw = img.width, ih = img.height, s = Math.max(inner / iw, inner / ih);
  const sw = inner / s, sh = inner / s;
  c.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, -w / 2 + pad, -h / 2 + pad, inner, inner);
  c.fillStyle = "rgba(255,255,255,.08)";
  c.fillRect(-w / 2 + pad, -h / 2 + pad, inner, inner * 0.4);
  // a strip of tape
  c.fillStyle = "rgba(240,228,200,.75)";
  c.save(); c.translate(0, -h / 2); c.rotate(-0.08); c.fillRect(-w * 0.18, -w * 0.05, w * 0.36, w * 0.1); c.restore();
  c.restore();
}

/** Loads an image from a URL with CORS so the canvas can still be exported. */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Photo failed to load"));
    img.src = url;
  });
}
