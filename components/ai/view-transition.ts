import { flushSync } from "react-dom";

/** Runs a state change as a view transition (the AI composer glides, the workspace panel cross-fades; globals.css),
 *  or straight away where view transitions aren't supported or motion is reduced. */
export function withViewTransition(update: () => void) {
  if (typeof document === "undefined") return update();
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) return update();
  doc.startViewTransition(() => flushSync(update));
}
