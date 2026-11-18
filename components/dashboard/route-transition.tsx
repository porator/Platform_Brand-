"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * A coordinated enter transition for a navigation view. Keyed by the current
 * path, so each navigation replays a subtle fade + horizontal slide (transform
 * based, so no layout shift). A new navigation supersedes the previous one
 * because the keyed node remounts. Honors `prefers-reduced-motion`.
 */
export function RouteTransition({
  children,
  by,
  from = "right",
  motion = "default",
  className,
}: {
  children: React.ReactNode;
  /** What a change re-keys on. Defaults to the full path. */
  by?: string;
  from?: "right" | "left";
  /** "none": no motion of its own (the dashboard: the page just follows the sidebar's width, nav-motion.tsx). */
  motion?: "default" | "none";
  className?: string;
}) {
  const pathname = usePathname();
  const slide = from === "left" ? "slide-in-from-left-2" : "slide-in-from-right-2";
  return (
    <div
      key={by ?? pathname}
      className={cn(
        motion === "none" ? null : cn("animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none", slide),
        className,
      )}
    >
      {children}
    </div>
  );
}
