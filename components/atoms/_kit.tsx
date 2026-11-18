"use client";

import * as React from "react";
import { IconCheck } from "@/lib/icons";
import { cn } from "@/lib/utils";

export {
  PageShell,
  PageHeader,
  Section,
  Mono,
  MetaLabel,
} from "@/components/foundations/_kit";

/**
 * A labelled specimen row: a short label/description on the left, the live
 * example(s) on the right. Deliberately light-weight — a hairline separator,
 * not a heavy bordered card — to match the Foundations aesthetic.
 */
export function Row({
  label,
  hint,
  children,
  className,
  align = "center",
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: "center" | "start";
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-border py-5 first:border-t-0 sm:grid-cols-[12rem_1fr] sm:gap-8">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      </div>
      <div
        className={cn(
          "flex flex-wrap gap-4",
          align === "center" ? "items-center" : "items-start",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Accessibility checklist with consistent success-token bullets. */
export function A11yList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
          <IconCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
