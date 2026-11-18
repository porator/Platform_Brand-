import * as React from "react";
import { cn } from "@/lib/utils";

/** A neutral placeholder box for layout demos. */
export function Box({
  children,
  className,
  muted = true,
}: {
  children?: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center justify-center rounded-md border border-border px-3 py-2 text-center text-xs",
        muted
          ? "bg-muted text-[color-mix(in_oklch,var(--muted-foreground),var(--foreground)_32%)]"
          : "bg-card text-card-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
