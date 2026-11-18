"use client";

import * as React from "react";
import { IconPlus } from "@/lib/icons";
import { CreateNewDialog } from "@/components/dashboard/create-new-dialog";

/**
 * The "+" on the Studios row. Opens the same branching create flow as the
 * company switcher's "Create new": Studio › (Game / Project) › store direction.
 */
export function AddStudioDialog({ companyName }: { companyName: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Add studio"
        title="Add studio"
        onClick={() => setOpen(true)}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <IconPlus className="size-4" />
      </button>
      <CreateNewDialog open={open} onOpenChange={setOpen} companyName={companyName} />
    </>
  );
}
