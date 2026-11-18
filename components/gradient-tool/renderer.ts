/**
 * The composition, drawn on one canvas so the preview and every export are the same frames:
 *   GradientBackground   the diagonal field
 *   AnimatedLightLayers  four drifting light sources and a large curved shadow with a bright rim
 *   (both painted on a quarter-size buffer, blurred, then scaled up: soft, organic, and cheap on the GPU)
 *   GradientTypography   eyebrow, headline and subtitle, filled with a horizontal gradient sampled from the palette
 *   GrainOverlay         a fixed monochrome film grain over everything (fixed, so it never flickers)
 * Any frame size works (16:9, square, portrait…): positions are fractions of the frame and type scales with it.
 * All motion is periodic in the cycle length, so a recording of one cycle loops seamlessly.
 */

import { mixRgb, rgba, type ResolvedPalette, type Rgb } from "@/components/gradient-tool/palettes";

export type TextSettings = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  fontFamily: string;
  /** Sizes are for a 1920 × 1080 frame; other sizes scale them (typeScale). */
  headlineSize: number;
  eyebrowSize: number;
  subtitleSize: number;
  fontWeight: number;
  letterSpacing: number; // em
  lineHeight: number; // multiplier
  align: "left" | "center" | "right";
  /** Space between the eyebrow and the headline, as a multiple of the eyebrow size. */
  gap: number;
};

export type StyleSettings = {
  gradientIntensity: number; // 0–1: 0 is one flat colour, 1 the full palette gradient
  textOpacity: number; // 0–1
  glow: number; // 0–1
};

/** How much the type scales in a w × h frame: 1 at 1920 × 1080, smaller in narrow or short frames. */
export const typeScale = (w: number, h: number) => Math.min(w / 1600, h / 1080, 1.4);

type Buffers = { w: number; h: number; paint: HTMLCanvasElement; soft: HTMLCanvasElement; grain: CanvasPattern | null };
const buffers = new WeakMap<CanvasRenderingContext2D, Buffers>();

/** The light buffers are a quarter of the frame; rebuilt when the frame size changes. */
function getBuffers(ctx: CanvasRenderingContext2D, w: number, h: number): Buffers {
  const bw = Math.max(64, Math.round(w / 4));
  const bh = Math.max(64, Math.round(h / 4));
  let b = buffers.get(ctx);
  if (!b || b.w !== bw || b.h !== bh) {
    const paint = document.createElement("canvas");
    paint.width = bw;
    paint.height = bh;
    const soft = document.createElement("canvas");
    soft.width = bw;
    soft.height = bh;
    b = { w: bw, h: bh, paint, soft, grain: b?.grain ?? ctx.createPattern(grainTile(), "repeat") };
    buffers.set(ctx, b);
  }
  return b;
}

/** A 256px tile of monochrome noise, made once. */
function grainTile(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const img = g.createImageData(256, 256);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rand() - 0.5) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

/** A point drifting on a slow Lissajous path; k and j are whole numbers so the path closes every cycle. */
const drift = (phase: number, k: number, j: number, ax: number, ay: number, off: number): [number, number] => [
  ax * Math.sin(phase * k + off),
  ay * Math.cos(phase * j + off * 1.3),
];

function radial(g: CanvasRenderingContext2D, bw: number, bh: number, x: number, y: number, r: number, c: Rgb, a: number) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, rgba(c, a));
  grad.addColorStop(0.55, rgba(c, a * 0.45));
  grad.addColorStop(1, rgba(c, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, bw, bh);
}

/** GradientBackground + AnimatedLightLayers, painted small and softened. */
function paintLight(b: Buffers, pal: ResolvedPalette, phase: number) {
  const { w: bw, h: bh } = b;
  const big = Math.max(bw, bh);
  const g = b.paint.getContext("2d")!;
  // The field.
  const base = g.createLinearGradient(0, 0, bw, bh);
  base.addColorStop(0, rgba(pal.base[0]));
  base.addColorStop(1, rgba(pal.base[1]));
  g.fillStyle = base;
  g.fillRect(0, 0, bw, bh);
  // Four light sources, each on its own slow path, gently breathing.
  const L: [number, number, number, number, number, number, number][] = [
    // x, y, r, k, j, offset, alpha
    [0.16, 0.12, 0.72, 1, 1, 0.0, 0.85],
    [0.92, 0.08, 0.66, 1, 2, 1.7, 0.8],
    [0.55, 1.08, 0.8, 2, 1, 3.1, 0.7],
    [0.2, 0.86, 0.5, 1, 1, 4.4, 0.55],
  ];
  L.forEach(([x, y, r, k, j, off, a], i) => {
    const [dx, dy] = drift(phase, k, j, 0.09, 0.07, off);
    const breathe = 0.85 + 0.15 * Math.sin(phase * (i % 2 ? 1 : 2) + off);
    radial(g, bw, bh, (x + dx) * bw, (y + dy) * bh, r * big * breathe, pal.lights[i], a);
  });
  // A large curved shadow drifting across from the lower right, with a soft bright rim on its edge.
  const [sx, sy] = drift(phase, 1, 1, 0.07, 0.05, 0.6);
  const cx = (0.98 + sx) * bw;
  const cy = (1.32 + sy) * bh;
  const R = 0.98 * big;
  const sh = g.createRadialGradient(cx, cy, 0, cx, cy, R);
  sh.addColorStop(0, rgba(pal.shadow, 0.5));
  sh.addColorStop(0.86, rgba(pal.shadow, 0.34));
  sh.addColorStop(0.95, rgba(pal.rim, 0.45));
  sh.addColorStop(1, rgba(pal.rim, 0));
  g.fillStyle = sh;
  g.fillRect(0, 0, bw, bh);
  // The corners.
  const v = g.createRadialGradient(bw * 0.5, bh * 0.5, Math.min(bw, bh) * 0.35, bw * 0.5, bh * 0.5, big * 0.68);
  v.addColorStop(0, rgba(pal.vignette, 0));
  v.addColorStop(1, rgba(pal.vignette, 0.55));
  g.fillStyle = v;
  g.fillRect(0, 0, bw, bh);
  // Soften: no hard edges anywhere.
  const s = b.soft.getContext("2d")!;
  s.filter = `blur(${Math.round(big / 53)}px)`;
  s.clearRect(0, 0, bw, bh);
  s.drawImage(b.paint, -12, -12, bw + 24, bh + 24);
  s.filter = "none";
}

function lineGradient(ctx: CanvasRenderingContext2D, x0: number, x1: number, pal: ResolvedPalette, st: StyleSettings, phase: number) {
  // The stops drift slowly left and right, so the type's light moves with the scene.
  const w = x1 - x0;
  const shift = Math.sin(phase) * w * 0.14;
  const grad = ctx.createLinearGradient(x0 - w * 0.12 + shift, 0, x1 + w * 0.12 + shift, 0);
  const flat = mixRgb(mixRgb(pal.text[0], pal.text[2], 0.5), pal.text[1], 0.34);
  pal.text.forEach((c, i) => grad.addColorStop(i / 2, rgba(mixRgb(flat, c, st.gradientIntensity))));
  return grad;
}

/** GradientTypography: eyebrow, headline (one or more lines) and subtitle. */
function drawType(ctx: CanvasRenderingContext2D, w: number, h: number, txt: TextSettings, st: StyleSettings, pal: ResolvedPalette, phase: number) {
  const k = typeScale(w, h);
  const family = `"${txt.fontFamily}", "Manrope", sans-serif`;
  const xAt = txt.align === "left" ? w * 0.1 : txt.align === "right" ? w * 0.9 : w / 2;
  ctx.textAlign = txt.align;
  ctx.textBaseline = "alphabetic";
  // A very slow luminosity swell.
  const lum = 0.94 + 0.06 * Math.sin(phase + 0.8);

  const draw = (text: string, size: number, weight: number, y: number, alpha: number, glowScale: number) => {
    if (!text.trim()) return;
    ctx.font = `${weight} ${size}px ${family}`;
    ctx.letterSpacing = `${txt.letterSpacing * size}px`;
    const tw = ctx.measureText(text).width;
    const x0 = txt.align === "left" ? xAt : txt.align === "right" ? xAt - tw : xAt - tw / 2;
    ctx.fillStyle = lineGradient(ctx, x0, x0 + tw, pal, st, phase);
    ctx.globalAlpha = Math.max(0, Math.min(1, st.textOpacity * alpha * lum));
    ctx.shadowColor = rgba(pal.glow, 0.5 * st.glow);
    ctx.shadowBlur = size * 0.32 * st.glow * glowScale;
    ctx.fillText(text, xAt, y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  };

  const hs = txt.headlineSize * k;
  const es = txt.eyebrowSize * k;
  const ss = txt.subtitleSize * k;
  const lines = txt.headline.split("\n");
  const lh = hs * txt.lineHeight;
  // The headline block sits just above the middle; the eyebrow above it, the subtitle near the bottom.
  const blockTop = h * 0.47 - (lh * lines.length) / 2;
  lines.forEach((line, i) => draw(line, hs, txt.fontWeight, blockTop + lh * i + hs * 0.8, 1, 1));
  draw(txt.eyebrow, es, Math.min(500, txt.fontWeight + 100), blockTop - es * txt.gap, 0.82, 0.6);
  draw(txt.subtitle, ss, Math.min(500, txt.fontWeight + 100), h * 0.9, 0.9, 0.4);
  ctx.letterSpacing = "0px";
}

/** One frame at the canvas's own size. `phase` runs 0 → 2π over one cycle. */
export function renderFrame(ctx: CanvasRenderingContext2D, pal: ResolvedPalette, txt: TextSettings, st: StyleSettings, phase: number) {
  const { width: w, height: h } = ctx.canvas;
  const b = getBuffers(ctx, w, h);
  paintLight(b, pal, phase);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(b.soft, 0, 0, w, h);
  drawType(ctx, w, h, txt, st, pal, phase);
  // GrainOverlay: fine, monochrome, fixed in place.
  if (b.grain) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = b.grain;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
