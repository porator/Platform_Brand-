/**
 * Brand DNA palettes: a context's brand colours (an organization's, or a project's) turned into the colour roles of
 * the layered Brand DNA gradient. Nothing here knows any brand; it works from whatever colours it is given.
 */

/** The gradient's colour roles (hex). Each is a CSS custom property on the BrandDNA element (--dna-<role>). */
export type DnaPalette = {
  /** The lightest brand colour, washed almost to white: the field everything blooms on. */
  base: string;
  /** Top-left bloom. */
  primary: string;
  /** Top-right bloom. */
  secondary: string;
  /** Centre: a blend of primary and secondary. */
  mid: string;
  /** Bottom: the strongest colour. */
  accent: string;
  /** Extra blooms for depth. */
  support: string;
  bloom: string;
};

export const DNA_ROLES = ["base", "primary", "secondary", "mid", "accent", "support", "bloom"] as const satisfies readonly (keyof DnaPalette)[];

/** No brand colours: a quiet, neutral field. */
export const NEUTRAL_DNA: DnaPalette = {
  base: "#F5F5F4",
  primary: "#E7E5E4",
  secondary: "#ECEBEA",
  mid: "#EFEEED",
  accent: "#D6D3D1",
  support: "#E4E2E0",
  bloom: "#EAE8E6",
};

type Hsl = { h: number; s: number; l: number };

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
export const isHex = (c: unknown): c is string => typeof c === "string" && HEX.test(c.trim());

function toRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
  const n = parseInt(h, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function toHsl(hex: string): Hsl {
  const [r, g, b] = toRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function toHex({ h, s, l }: Hsl): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return `#${[f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 1 - Math.abs(a - b));
const rotate = (c: Hsl, by: number): Hsl => ({ ...c, h: (c.h + by + 1) % 1 });

/** Light, luminous and slightly desaturated: recognisable, never loud. */
const soften = (c: Hsl, lo: number, hi: number, maxS: number): Hsl => ({ h: c.h, s: Math.min(c.s, maxS) * 0.92, l: clamp(c.l, lo, hi) });

function mix(a: Hsl, b: Hsl, t: number): Hsl {
  const [ar, ag, ab] = toRgb(toHex(a));
  const [br, bg, bb] = toRgb(toHex(b));
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return toHsl(`#${[m(ar, br), m(ag, bg), m(ab, bb)].map((v) => v.toString(16).padStart(2, "0")).join("")}`);
}
const WHITE: Hsl = { h: 0, s: 0, l: 1 };

/**
 * Merges palettes, in order of trust: a defined palette (the first list) is kept whole; colours read from the
 * brand's icon then fill the remaining slots, only where they're distinct from what's already there.
 */
export function mergeBrandColors(lists: (readonly string[] | null | undefined)[], max = 5): string[] {
  const picked: Hsl[] = [];
  const out: string[] = [];
  for (const [i, list] of lists.entries()) {
    for (const c of list ?? []) {
      if (!isHex(c) || out.length >= max) continue;
      const hsl = toHsl(c);
      const key = c.startsWith("#") ? c.toUpperCase() : `#${c.toUpperCase()}`;
      if (out.includes(key)) continue;
      if (i === 0 || picked.every((p) => hueGap(p.h, hsl.h) > 0.06 || Math.abs(p.l - hsl.l) > 0.22)) {
        picked.push(hsl);
        out.push(key);
      }
    }
  }
  return out;
}

/**
 * The layered gradient's roles from a context's brand colours (most characteristic first). Missing roles are drawn
 * from neighbouring hues of the colours there are, so even a one-colour brand gets depth. No colours: neutral.
 */
export function dnaFromColors(colors: readonly string[] | null | undefined): DnaPalette {
  const hsl = (colors ?? []).filter(isHex).map(toHsl);
  if (!hsl.length) return NEUTRAL_DNA;
  const [p, s, a, su, b] = hsl;
  // Missing roles stay in the brand's own family: close neighbours of its hues, lighter or deeper.
  const primary = p;
  const secondary = s ?? rotate(p, -0.035);
  const accent = a ?? { ...rotate(secondary, -0.03), s: Math.min(1, secondary.s * 1.1), l: secondary.l - 0.08 };
  const support = su ?? { ...rotate(p, -0.015), l: p.l + 0.06 };
  const bloom = b ?? { ...rotate(secondary, 0.015), l: secondary.l + 0.04 };
  const lightest = hsl.reduce((x, y) => (y.l > x.l ? y : x));
  const base = mix(soften(lightest, 0.6, 0.85, 0.6), WHITE, 0.82);
  return {
    base: toHex(base),
    primary: toHex(soften(primary, 0.68, 0.8, 0.7)),
    secondary: toHex(soften(secondary, 0.68, 0.8, 0.7)),
    // Two opposite hues average to grey, so the centre blend leans toward the light base: a subtle meeting point.
    mid: toHex(mix(mix(soften(primary, 0.7, 0.82, 0.6), soften(secondary, 0.7, 0.82, 0.6), 0.5), base, 0.45)),
    accent: toHex(soften(accent, 0.58, 0.7, 0.78)),
    support: toHex(soften(support, 0.7, 0.82, 0.66)),
    bloom: toHex(soften(bloom, 0.68, 0.8, 0.7)),
  };
}

/** The palette as CSS custom properties for the BrandDNA element. */
export const dnaVars = (p: DnaPalette): Record<string, string> => Object.fromEntries(DNA_ROLES.map((r) => [`--dna-${r}`, p[r]]));

export const samePalette = (a: DnaPalette, b: DnaPalette) => DNA_ROLES.every((r) => a[r] === b[r]);
