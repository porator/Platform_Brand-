/* -------------------------------------------------------------------------- */
/*  Token metadata                                                             */
/*                                                                             */
/*  These describe WHICH tokens exist and how they map to Tailwind utilities.  */
/*  The *values* are never hardcoded here — they are read live from the CSS    */
/*  custom properties defined in app/globals.css (the base-vega preset).       */
/* -------------------------------------------------------------------------- */

export type ColorToken = {
  name: string;
  /** CSS custom property, e.g. "--primary" */
  cssVar: string;
  /** Tailwind utility that consumes it, e.g. "bg-primary" */
  utility: string;
  /** Token this one is designed to sit on / pair with. */
  pairsWith?: string;
};

export type ColorGroup = {
  title: string;
  description: string;
  tokens: ColorToken[];
};

export const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Surfaces",
    description: "Page and container backgrounds with their matched text colors.",
    tokens: [
      { name: "Background", cssVar: "--background", utility: "bg-background", pairsWith: "--foreground" },
      { name: "Foreground", cssVar: "--foreground", utility: "text-foreground" },
      { name: "Card", cssVar: "--card", utility: "bg-card", pairsWith: "--card-foreground" },
      { name: "Card Foreground", cssVar: "--card-foreground", utility: "text-card-foreground" },
      { name: "Popover", cssVar: "--popover", utility: "bg-popover", pairsWith: "--popover-foreground" },
      { name: "Popover Foreground", cssVar: "--popover-foreground", utility: "text-popover-foreground" },
    ],
  },
  {
    title: "Brand",
    description: "Primary and secondary actions, each with its on-color.",
    tokens: [
      { name: "Primary", cssVar: "--primary", utility: "bg-primary", pairsWith: "--primary-foreground" },
      { name: "Primary Foreground", cssVar: "--primary-foreground", utility: "text-primary-foreground" },
      { name: "Secondary", cssVar: "--secondary", utility: "bg-secondary", pairsWith: "--secondary-foreground" },
      { name: "Secondary Foreground", cssVar: "--secondary-foreground", utility: "text-secondary-foreground" },
    ],
  },
  {
    title: "Semantic",
    description: "Muted and accent surfaces, plus the destructive signal color.",
    tokens: [
      { name: "Muted", cssVar: "--muted", utility: "bg-muted", pairsWith: "--muted-foreground" },
      { name: "Muted Foreground", cssVar: "--muted-foreground", utility: "text-muted-foreground" },
      { name: "Accent", cssVar: "--accent", utility: "bg-accent", pairsWith: "--accent-foreground" },
      { name: "Accent Foreground", cssVar: "--accent-foreground", utility: "text-accent-foreground" },
      { name: "Destructive", cssVar: "--destructive", utility: "bg-destructive" },
    ],
  },
  {
    title: "Borders & Inputs",
    description: "Hairline borders, input fills and the focus ring.",
    tokens: [
      { name: "Border", cssVar: "--border", utility: "border-border" },
      { name: "Input", cssVar: "--input", utility: "border-input" },
      { name: "Ring", cssVar: "--ring", utility: "ring-ring" },
    ],
  },
  {
    title: "Charts",
    description: "The five-step categorical sequence used in data visualization.",
    tokens: [
      { name: "Chart 1", cssVar: "--chart-1", utility: "bg-chart-1" },
      { name: "Chart 2", cssVar: "--chart-2", utility: "bg-chart-2" },
      { name: "Chart 3", cssVar: "--chart-3", utility: "bg-chart-3" },
      { name: "Chart 4", cssVar: "--chart-4", utility: "bg-chart-4" },
      { name: "Chart 5", cssVar: "--chart-5", utility: "bg-chart-5" },
    ],
  },
];

/** Flat list of every color CSS var, for the live value reader. */
export const ALL_COLOR_VARS: string[] = COLOR_GROUPS.flatMap((g) =>
  g.tokens.map((t) => t.cssVar),
);

/* -------------------------------------------------------------------------- */
/*  Typography scale                                                           */
/*  Maps named roles to real Tailwind utility classes. Metrics are measured    */
/*  live from the rendered specimen, never hardcoded.                          */
/* -------------------------------------------------------------------------- */

export type TypeRole = {
  name: string;
  utility: string;
  sample: string;
};

export const TYPE_SCALE: TypeRole[] = [
  { name: "Display", utility: "text-5xl md:text-6xl font-semibold tracking-tight", sample: "New Gen Wire" },
  { name: "H1", utility: "text-4xl font-semibold tracking-tight", sample: "Navigation & Project Structure" },
  { name: "H2", utility: "text-3xl font-semibold tracking-tight", sample: "Foundations" },
  { name: "H3", utility: "text-2xl font-semibold tracking-tight", sample: "Color tokens" },
  { name: "H4", utility: "text-xl font-medium tracking-tight", sample: "Semantic surfaces" },
  { name: "Body Large", utility: "text-lg leading-relaxed", sample: "A clean, minimal and technical documentation surface." },
  { name: "Body", utility: "text-base leading-relaxed", sample: "The quick brown fox jumps over the lazy dog." },
  { name: "Body Small", utility: "text-sm leading-relaxed", sample: "The quick brown fox jumps over the lazy dog." },
  { name: "Label", utility: "text-sm font-medium", sample: "Project name" },
  { name: "Caption", utility: "text-xs text-muted-foreground", sample: "Last updated 2 hours ago" },
];

/* -------------------------------------------------------------------------- */
/*  Spacing scale (Tailwind v4: 1 unit = 0.25rem = 4px)                        */
/* -------------------------------------------------------------------------- */

export type SpaceStep = { step: string; rem: number };

export const SPACING_SCALE: SpaceStep[] = [
  { step: "0", rem: 0 },
  { step: "0.5", rem: 0.125 },
  { step: "1", rem: 0.25 },
  { step: "1.5", rem: 0.375 },
  { step: "2", rem: 0.5 },
  { step: "3", rem: 0.75 },
  { step: "4", rem: 1 },
  { step: "5", rem: 1.25 },
  { step: "6", rem: 1.5 },
  { step: "8", rem: 2 },
  { step: "10", rem: 2.5 },
  { step: "12", rem: 3 },
  { step: "16", rem: 4 },
  { step: "20", rem: 5 },
  { step: "24", rem: 6 },
];

/* -------------------------------------------------------------------------- */
/*  Breakpoints (Tailwind v4 defaults)                                         */
/* -------------------------------------------------------------------------- */

export type Breakpoint = {
  name: string;
  prefix: string;
  rem: number;
  px: number;
  role: string;
};

export const BREAKPOINTS: Breakpoint[] = [
  { name: "Base", prefix: "(none)", rem: 0, px: 0, role: "Mobile" },
  { name: "sm", prefix: "sm:", rem: 40, px: 640, role: "Large phone" },
  { name: "md", prefix: "md:", rem: 48, px: 768, role: "Tablet" },
  { name: "lg", prefix: "lg:", rem: 64, px: 1024, role: "Desktop" },
  { name: "xl", prefix: "xl:", rem: 80, px: 1280, role: "Wide desktop" },
  { name: "2xl", prefix: "2xl:", rem: 96, px: 1536, role: "Extra-wide" },
];
