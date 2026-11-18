"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Page scaffolding — the polished "design-system website" shell             */
/* -------------------------------------------------------------------------- */

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-6 py-12 md:px-10 md:py-16", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow = "Foundations",
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <header>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-14 border-t border-border pt-10", className)}>
      <div className="max-w-2xl">
        <h2 className="text-lg font-medium tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Inline monospace token / code label. */
export function Mono({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "font-mono text-[0.8125rem] text-foreground/80 tabular-nums",
        className,
      )}
    >
      {children}
    </code>
  );
}

/** A small neutral meta label (e.g. "SIZE", "WEIGHT"). */
export function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Theming helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * A surface forced to a specific theme regardless of the global toolbar toggle.
 * `.light` and `.dark` both re-declare the token variables, so panels stay
 * independent — this powers the side-by-side Light / Dark comparisons.
 */
export function ThemedPanel({
  theme,
  children,
  className,
}: {
  theme: "light" | "dark";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        theme,
        "border border-border bg-background text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Reads the resolved value of CSS custom properties from a live DOM node.
 * Re-reads when the global `<html>` theme class changes so values stay in sync.
 */
export function useCssVarValues(
  ref: React.RefObject<HTMLElement | null>,
  names: readonly string[],
): Record<string, string> {
  const key = names.join(",");
  const [values, setValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () => {
      const cs = getComputedStyle(el);
      const next: Record<string, string> = {};
      for (const n of names) next[n] = cs.getPropertyValue(n).trim();
      setValues(next);
    };

    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, key]);

  return values;
}

/**
 * Reads live typography metrics (font-size, weight, line-height, letter-spacing)
 * from a rendered specimen node, so docs reflect actual computed values.
 */
export function useTextMetrics(ref: React.RefObject<HTMLElement | null>) {
  const [m, setM] = React.useState<{
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
  } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const cs = getComputedStyle(el);
      const px = (v: string) => (v && v.endsWith("px") ? `${Math.round(parseFloat(v))}px` : v);
      setM({
        fontSize: px(cs.fontSize),
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight === "normal" ? "normal" : px(cs.lineHeight),
        letterSpacing:
          cs.letterSpacing === "normal" ? "0" : `${parseFloat(cs.letterSpacing).toFixed(2)}px`,
      });
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [ref]);

  return m;
}
