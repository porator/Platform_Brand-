/**
 * The three moods of the animated gradient (dark warm, light warm, light cool) and the colour maths to blend them.
 * Every colour the scene uses comes from here, so the typography always samples the background's palette.
 */

export type Rgb = [number, number, number];

export type Palette = {
  id: "dark-warm" | "light-warm" | "light-cool";
  name: string;
  /** The field: a diagonal from top-left to bottom-right. */
  base: [string, string];
  /** The four drifting light sources (top-left, top-right, bottom, lower-left). */
  lights: [string, string, string, string];
  /** The large curved shadow that drifts across, and the soft bright rim along its edge. */
  shadow: string;
  rim: string;
  /** The corners. */
  vignette: string;
  /** The type's horizontal gradient, left to right, and its glow. */
  text: [string, string, string];
  glow: string;
};

export const PALETTES: Palette[] = [
  {
    id: "dark-warm",
    name: "Dark warm",
    base: ["#3a3a4a", "#3b1d14"],
    lights: ["#9a9cb6", "#8a3417", "#5b2a33", "#4a3446"],
    shadow: "#120c0c",
    rim: "#d8a08e",
    vignette: "#0b0708",
    text: ["#ece6f6", "#e8b8c8", "#e09a80"],
    glow: "#f3cfc6",
  },
  {
    id: "light-warm",
    name: "Light warm",
    base: ["#f1e6d6", "#c99f78"],
    lights: ["#fbf4e8", "#d9b08a", "#f4cba8", "#e8d3b9"],
    shadow: "#a77a55",
    rim: "#fff5e6",
    vignette: "#9c7656",
    text: ["#fffdf8", "#fdf1e2", "#f6e0c4"],
    glow: "#fff4e2",
  },
  {
    id: "light-cool",
    name: "Light cool",
    base: ["#eef2f7", "#c4dbef"],
    lights: ["#f8fafd", "#b7d3ee", "#cbc6e4", "#e3ebf5"],
    shadow: "#a3bfdc",
    rim: "#ffffff",
    vignette: "#9bb3cd",
    text: ["#b9c5d3", "#93aac6", "#7a97bd"],
    glow: "#ffffff",
  },
];

export const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
export const rgba = ([r, g, b]: Rgb, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A palette as numbers, ready to blend frame by frame. */
export type ResolvedPalette = {
  base: [Rgb, Rgb];
  lights: [Rgb, Rgb, Rgb, Rgb];
  shadow: Rgb;
  rim: Rgb;
  vignette: Rgb;
  text: [Rgb, Rgb, Rgb];
  glow: Rgb;
};

export const resolve = (p: Palette): ResolvedPalette => ({
  base: [hexToRgb(p.base[0]), hexToRgb(p.base[1])],
  lights: p.lights.map(hexToRgb) as ResolvedPalette["lights"],
  shadow: hexToRgb(p.shadow),
  rim: hexToRgb(p.rim),
  vignette: hexToRgb(p.vignette),
  text: p.text.map(hexToRgb) as ResolvedPalette["text"],
  glow: hexToRgb(p.glow),
});

export function mixPalette(a: ResolvedPalette, b: ResolvedPalette, t: number): ResolvedPalette {
  return {
    base: [mixRgb(a.base[0], b.base[0], t), mixRgb(a.base[1], b.base[1], t)],
    lights: a.lights.map((c, i) => mixRgb(c, b.lights[i], t)) as ResolvedPalette["lights"],
    shadow: mixRgb(a.shadow, b.shadow, t),
    rim: mixRgb(a.rim, b.rim, t),
    vignette: mixRgb(a.vignette, b.vignette, t),
    text: a.text.map((c, i) => mixRgb(c, b.text[i], t)) as ResolvedPalette["text"],
    glow: mixRgb(a.glow, b.glow, t),
  };
}

/** Smooth in and out. */
export const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
