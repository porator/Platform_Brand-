"use client";

import * as React from "react";
import { IconBell } from "@/lib/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Notifications, beside Search at the top right of the workspace: a bell (the same 28px ghost button as Search) that
 * opens a small panel. The prototype has nothing to notify about yet, so it shows the empty state.
 */
export function NotificationsButton() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
          />
        }
      >
        <IconBell className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-80 gap-0 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">Notifications</p>
        </div>
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconBell className="size-4" />
          </span>
          <p className="text-sm font-medium text-foreground">You’re all caught up</p>
          <p className="text-[13px] leading-snug text-muted-foreground">We’ll let you know here when something needs you, like a module going live.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
