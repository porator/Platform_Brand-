"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreateProjectFlow } from "@/components/dashboard/create-project-flow";

/**
 * Create project from the dashboard (a folder's Create project, the scope selector's New project): the same flow as
 * onboarding's full page, in a large dialog over the page the user is on. The page stays where it was underneath;
 * closing returns to it, and finishing ("Go to dashboard") navigates, which closes the dialog.
 */
/** clone: start on "Which project do you want to clone?" with that project picked (the selector's Clone project). */
type Open = (opts: { clientId: string; folderId: string; clone?: string }) => void;
const query = ({ clientId, folderId, clone }: Parameters<Open>[0]) => `client=${clientId}&from=${folderId}${clone ? `&step=clone&clone=${clone}` : ""}`;
const CreateProjectContext = React.createContext<Open | null>(null);

/** Opens Create project in the dialog; outside the provider (no dashboard shell), falls back to the full page. */
export function useCreateProject(): Open {
  const open = React.useContext(CreateProjectContext);
  const router = useRouter();
  return open ?? ((opts) => router.push(`/dashboard/create-project?${query(opts)}`));
}

export function CreateProjectModalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Each opening starts the flow afresh (the key), with the folder it was opened from as the destination.
  const [run, setRun] = React.useState<{ key: number; initial: string; path: string } | null>(null);
  const open = React.useCallback<Open>(
    (opts) => setRun((r) => ({ key: (r?.key ?? 0) + 1, initial: query(opts), path: pathname ?? "" })),
    [pathname],
  );
  const close = () => setRun(null);
  // Leaving the page it was opened on (e.g. "Go to dashboard" after creating, a breadcrumb or a folder click) ends
  // the run for good, so coming back to that page never shows the wizard again (R11 · V-05).
  const [seenPath, setSeenPath] = React.useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (run && run.path !== pathname) setRun(null);
  }
  const shown = !!run && run.path === pathname;

  return (
    <CreateProjectContext.Provider value={open}>
      {children}
      <Dialog open={shown} onOpenChange={(o) => !o && close()}>
        <DialogContent
          showCloseButton={false}
          className="h-[min(820px,calc(100svh-2rem))] w-[min(1240px,calc(100vw-2rem))] max-w-none grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">Create project</DialogTitle>
          {run ? <CreateProjectFlow key={run.key} modal={{ initial: run.initial, onClose: close }} /> : null}
        </DialogContent>
      </Dialog>
    </CreateProjectContext.Provider>
  );
}
