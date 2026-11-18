"use client";

import * as React from "react";

/**
 * The game's visual identity, read from its store art: its brand colours (from the icon) and its overall style
 * (from the icon and the first screenshot). Used to recommend a store template and to colour the live preview.
 */
export type GameStyle = "dark" | "bright" | "soft";
export type GamePalette = {
  /** Up to three brand colours, most characteristic first (hex). */
  colors: string[];
  style: GameStyle;
};

export const STYLE_LABEL: Record<GameStyle, string> = {
  dark: "Dark, moody art",
  bright: "Bright, colourful art",
  soft: "Soft, light art",
};

const cache = new Map<string, GamePalette | null>();

const hex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

function hsl(r: number, g: number, b: number) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  let h = 0;
  if (max !== min) {
    if (max === R) h = ((G - B) / (max - min) + (G < B ? 6 : 0)) / 6;
    else if (max === G) h = ((B - R) / (max - min) + 2) / 6;
    else h = ((R - G) / (max - min) + 4) / 6;
  }
  return { h, s, l };
}

function loadPixels(src: string, size = 40): Promise<Uint8ClampedArray | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(ctx.getImageData(0, 0, size, size).data);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `/api/image?url=${encodeURIComponent(src)}`;
  });
}

/** Brand colours: the icon's pixels grouped into buckets, scored by how common and how vivid they are. */
function brandColors(px: Uint8ClampedArray): string[] {
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 200) continue;
    const key = `${px[i] >> 5}-${px[i + 1] >> 5}-${px[i + 2] >> 5}`;
    const b = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    b.r += px[i];
    b.g += px[i + 1];
    b.b += px[i + 2];
    b.n++;
    buckets.set(key, b);
  }
  const scored = [...buckets.values()]
    .map((b) => {
      const r = b.r / b.n, g = b.g / b.n, bl = b.b / b.n;
      const { h, s, l } = hsl(r, g, bl);
      // Vivid, mid-light colours carry a brand; greys, near-white and near-black don't.
      const score = b.n * (0.25 + s) * (l > 0.12 && l < 0.88 ? 1 : 0.15);
      return { r, g, b: bl, h, s, l, score };
    })
    .sort((a, b) => b.score - a.score);
  const picked: typeof scored = [];
  for (const c of scored) {
    if (picked.every((p) => Math.min(Math.abs(p.h - c.h), 1 - Math.abs(p.h - c.h)) > 0.08 || Math.abs(p.l - c.l) > 0.25)) picked.push(c);
    if (picked.length === 3) break;
  }
  return picked.map((c) => hex(c.r, c.g, c.b));
}

function overall(pxs: Uint8ClampedArray[]): GameStyle {
  let l = 0, s = 0, n = 0;
  for (const px of pxs) {
    for (let i = 0; i < px.length; i += 4) {
      const c = hsl(px[i], px[i + 1], px[i + 2]);
      l += c.l;
      s += c.s;
      n++;
    }
  }
  if (!n) return "bright";
  l /= n;
  s /= n;
  return l < 0.33 ? "dark" : s > 0.42 ? "bright" : "soft";
}

/** Reads the game's palette and style from its icon (and first screenshot). Null until read, or when it can't be. */
export function useGamePalette(icon?: string, shot?: string): GamePalette | null {
  const key = `${icon ?? ""}|${shot ?? ""}`;
  // Bumped when a read finishes, so the page re-renders and picks the result up from the cache.
  const [, setRead] = React.useState(0);
  React.useEffect(() => {
    if (!icon || cache.has(key)) return;
    let live = true;
    Promise.all([loadPixels(icon), shot ? loadPixels(shot, 32) : Promise.resolve(null)]).then(([iconPx, shotPx]) => {
      cache.set(key, iconPx ? { colors: brandColors(iconPx), style: overall([iconPx, ...(shotPx ? [shotPx] : [])]) } : null);
      if (live) setRead((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, [icon, shot, key]);
  return icon ? (cache.get(key) ?? null) : null;
}

/** A colour darkened (for button edges) or checked for white text. */
export function shade(hexColor: string, amount: number): string {
  const n = parseInt(hexColor.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amount))));
  return hex(f(n >> 16), f((n >> 8) & 255), f(n & 255));
}
export function readableOnWhiteText(hexColor: string): string {
  const n = parseInt(hexColor.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? shade(hexColor, -0.35) : hexColor;
}

/** Reads an uploaded image (e.g. a screenshot of the publisher's current store): its brand colours and overall style.
 *  Runs in the browser on the file itself; nothing is uploaded anywhere. Null when it can't be read. */
export function paletteFromFile(file: File): Promise<GamePalette | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 48;
        c.height = 48;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, 48, 48);
        const px = ctx.getImageData(0, 0, 48, 48).data;
        resolve({ colors: brandColors(px), style: overall([px]) });
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
