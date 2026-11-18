"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Navigation motion between contexts (Company, folders, projects, a category's own menu), as in the reference
 * recording: only the sidebar's categories load in. When the context changes, the new list's items fade in and slide
 * from the left one after another (globals.css, .nav-panel-in). Nothing else moves: not the sidebar's width, not the
 * page. Section clicks within the same context don't animate. Still for reduced motion.
 */
export function NavPanelTransition({ panelKey, className, children }: { panelKey: string; className?: string; children: React.ReactNode }) {
  // Keyed by the context, so each new context's list loads in (the first one too); section clicks keep the same key.
  return (
    <div key={panelKey} className={cn(className, "nav-panel-in")}>
      {children}
    </div>
  );
}
