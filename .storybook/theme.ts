import { create } from "storybook/theming";

/**
 * Storybook manager (chrome) theme for "Storybook — New Gen Wire".
 * Palette mirrors the shadcn `base-vega` preset: neutral stone surfaces,
 * subtle borders, radius 0. The manager theme is static (light); the preview
 * canvas carries the live light/dark token toggle.
 */
export default create({
  base: "light",

  brandTitle: "Storybook — New Gen Wire",
  brandTarget: "_self",

  // Stone-aligned neutrals
  colorPrimary: "#1c1917", // stone-900
  colorSecondary: "#292524", // stone-800 (selection / active)

  appBg: "#fafaf9", // stone-50
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  appBorderColor: "#e7e5e4", // stone-200
  appBorderRadius: 0,

  textColor: "#1c1917",
  textInverseColor: "#fafaf9",
  textMutedColor: "#78716c", // stone-500

  barTextColor: "#78716c",
  barSelectedColor: "#1c1917",
  barHoverColor: "#1c1917",
  barBg: "#ffffff",

  inputBg: "#ffffff",
  inputBorder: "#e7e5e4",
  inputTextColor: "#1c1917",
  inputBorderRadius: 0,

  fontBase:
    '"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontCode: '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
});
