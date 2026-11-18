"use client";

import * as React from "react";
import Link from "next/link";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { IconArrowRight } from "@/lib/icons";

/** A looping 3s mock of the Template Studio editor (block tree + live preview),
 *  presenting the new FAQ block: its row highlights, the eye toggles on, and the
 *  accordion opens in the preview. Styling lives in globals.css (.spot-*). */
function EditorLoop() {
  return (
    <div className="spot-editor" aria-hidden>
      <div className="spot-bar">
        <i />
        <i />
        <i />
      </div>
      <div className="spot-main">
        <div className="spot-tree">
          <div className="spot-row">
            <span className="lbl" />
          </div>
          <div className="spot-row faq">
            <span className="spot-eye" />
            <span className="lbl" />
          </div>
          <div className="spot-row">
            <span className="lbl" />
          </div>
        </div>
        <div className="spot-canvas">
          <div className="spot-card">
            <div className="spot-q" />
            <div className="spot-ans">
              <span />
              <span />
            </div>
            <div className="spot-q" style={{ width: "62%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The "NEW" chip on a sidebar item, upgraded to a hover spotlight: hovering (or
 * focusing) it opens a card that introduces the feature with a looping editor
 * preview and a jump-in link — Figma-agent style, in the dashboard's own UI.
 */
export function FeatureBadge({ label, href }: { label: string; href: string }) {
  return (
    <TooltipPrimitive.Provider delay={120} closeDelay={80}>
      <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label={`${label} — what's new in Studio`}
            className="pointer-events-auto absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-full bg-success/15 px-2 py-2 text-[10px] leading-none font-semibold tracking-wide text-success uppercase outline-none group-data-[collapsible=icon]:hidden focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        }
      >
        {label}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side="right" align="start" sideOffset={12} className="isolate z-50">
          <TooltipPrimitive.Popup className="w-72 origin-(--transform-origin) overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="p-2 pb-0">
              <EditorLoop />
            </div>
            <div className="flex flex-col gap-1.5 p-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-success uppercase">
                  New
                </span>
                <h4 className="text-sm font-semibold text-foreground">Studio</h4>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Design your storefront on the canvas — drag blocks, edit the new FAQ block, and preview changes
                live. No R&amp;D.
              </p>
              <Link
                href={href}
                className="mt-1 inline-flex w-fit items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Open Studio
                <IconArrowRight className="size-3.5" />
              </Link>
            </div>
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
