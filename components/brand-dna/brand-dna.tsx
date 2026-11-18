"use client";

import * as React from "react";
import { cachedIconBrandColors, iconBrandColors } from "@/lib/game-palette";
import { cn } from "@/lib/utils";
import { DNA_ROLES, NEUTRAL_DNA, dnaFromColors, dnaVars, mergeBrandColors, type DnaPalette } from "@/components/brand-dna/brand-dna-utils";
import type { BrandContext } from "@/components/brand-dna/use-brand-context";

export type BrandDNAProps = Pick<BrandContext, "contextType" | "contextId" | "brandColors" | "brandIcon"> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * The palette shown last, by any BrandDNA. A newly mounted one (another page, another project) starts from it and
 * eases to its own colours, so moving between contexts reads as one surface changing colour, not a flash.
 */
let lastShown: DnaPalette | null = null;
const rememberShown = (p: DnaPalette) => {
  lastShown = p;
};
const shownBefore = () => lastShown;

/** Colours read from the brand's icon: undefined while reading, null when there's no icon or it can't be read. */
function useIconColors(src?: string): string[] | null | undefined {
  const [read, setRead] = React.useState<{ src: string; colors: string[] | null } | null>(null);
  React.useEffect(() => {
    if (!src || cachedIconBrandColors(src) !== undefined) return;
    let live = true;
    iconBrandColors(src).then((colors) => {
      if (live) setRead({ src, colors });
    });
    return () => {
      live = false;
    };
  }, [src]);
  if (!src) return null;
  const cached = cachedIconBrandColors(src);
  if (cached !== undefined) return cached;
  return read?.src === src ? read.colors : undefined;
}

/**
 * Brand DNA: a soft, grainy, layered gradient in the active context's brand colours (the organization's, or the
 * project's). A defined palette leads; colours read from the brand's icon fill it out; with neither it is neutral.
 * On a context change the colours ease over ~750ms (registered CSS properties, globals.css); the grain is a separate
 * static layer, so it never shifts while they do. Children sit above both layers.
 */
export function BrandDNA({ contextType, contextId, brandColors, brandIcon, className, children }: BrandDNAProps) {
  const iconColors = useIconColors(brandIcon);
  // While the icon is still being read, keep what's on screen rather than flashing another palette.
  const reading = iconColors === undefined;
  const colors = mergeBrandColors([brandColors, iconColors]);
  const target = reading ? null : dnaFromColors(colors);
  const targetKey = target ? DNA_ROLES.map((r) => target[r]).join(",") : "";

  const ref = React.useRef<HTMLDivElement>(null);
  // First paint: the previous context's colours (or neutral), then ease to this context's.
  const [initial] = React.useState(() => shownBefore() ?? NEUTRAL_DNA);
  React.useEffect(() => {
    const el = ref.current;
    if (!target || !el) return;
    rememberShown(target);
    const vars = dnaVars(target);
    const frame = requestAnimationFrame(() => {
      for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
    });
    return () => cancelAnimationFrame(frame);
    // targetKey stands for target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  return (
    <div
      ref={ref}
      className={cn("brand-dna", className)}
      style={dnaVars(initial) as React.CSSProperties}
      data-dna-context={contextType}
      data-dna-id={contextId}
      data-dna-colors={colors.join(",")}
      data-dna-state={reading ? "reading" : colors.length ? "brand" : "neutral"}
    >
      <div aria-hidden className="brand-dna-field" />
      <div aria-hidden className="brand-dna-grain" />
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}
