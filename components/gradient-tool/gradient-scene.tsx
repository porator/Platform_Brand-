"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PALETTES, resolve, type Palette } from "@/components/gradient-tool/palettes";
import { renderFrame, type StyleSettings, type TextSettings } from "@/components/gradient-tool/renderer";

/*
 * The Gradient Tool's animated scene as a drop-in, responsive background (the sign-in page's panel): the canvas takes
 * its container's size (sharp on retina, capped at 2×), redraws on resize, pauses while off screen, and holds one still
 * frame for reduced motion. Same renderer as the tool, so it's the same motion and type. The full tool lives in its own
 * project: New Gen/Offsite/Gradient Tool · Appcharge.
 */

const CYCLE = 10;

/** The last scene's place in its loop (seconds), shared across pages so a scene on the next page can pick up exactly
 *  where this one was (the sign-in → dashboard handoff). */
let sceneClock = 0;
const readClock = () => sceneClock;
const writeClock = (t: number) => {
  sceneClock = t;
};

export const SCENE_TEXT: TextSettings = {
  eyebrow: "Appcharge",
  headline: "Sell beyond the store",
  subtitle: "A new era for your webstore begins",
  fontFamily: "Gellix",
  headlineSize: 140,
  eyebrowSize: 38,
  subtitleSize: 26,
  fontWeight: 300,
  letterSpacing: -0.01,
  lineHeight: 1.08,
  align: "center",
  gap: 1.7,
};
const SCENE_STYLE: StyleSettings = { gradientIntensity: 1, textOpacity: 1, glow: 0.35 };

export function GradientScene({
  palette = "dark-warm",
  text = SCENE_TEXT,
  style = SCENE_STYLE,
  /** Below this width (CSS px) the subtitle is left out, so a small frame only carries what reads. */
  compactBelow = 560,
  continueClock = false,
  className,
}: {
  palette?: Palette["id"];
  text?: TextSettings;
  style?: StyleSettings;
  compactBelow?: number;
  /** Start where the previous scene left off instead of at the top of the loop. */
  continueClock?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const live = React.useRef({ text, style, palette, compactBelow });
  const [startAt] = React.useState(() => (continueClock ? readClock() : 0));
  React.useLayoutEffect(() => {
    live.current = { text, style, palette, compactBelow };
  });

  React.useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let visible = true;
    let t = startAt;
    let last = performance.now();
    let cssW = 0;

    const frame = () => {
      const { text, style, palette, compactBelow } = live.current;
      const pal = resolve(PALETTES.find((p) => p.id === palette) ?? PALETTES[0]);
      const txt = cssW < compactBelow ? { ...text, subtitle: "" } : text;
      renderFrame(ctx, pal, txt, style, (2 * Math.PI * (t % CYCLE)) / CYCLE);
    };
    const loop = (now: number) => {
      t += Math.min(0.1, (now - last) / 1000);
      writeClock(t);
      last = now;
      frame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!visible || !cssW) return;
      if (reduce.matches) return frame();
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    // Size the canvas to its box, in device pixels.
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cssW = r.width;
      const w = Math.max(2, Math.round(r.width * dpr));
      const h = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        // Resizing clears the canvas; draw straight away so a growing scene never shows a blank frame.
        frame();
      }
      start();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);
    reduce.addEventListener("change", start);
    // The type's faces: redraw once they're in.
    void Promise.all([300, 400, 500].map((w) => document.fonts.load(`${w} 100px "${live.current.text.fontFamily}"`)))
      .then(() => start())
      .catch(() => {});
    resize();
    return () => {
      writeClock(t);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      reduce.removeEventListener("change", start);
    };
    // startAt is read once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} aria-hidden className={cn("block size-full", className)} />;
}
