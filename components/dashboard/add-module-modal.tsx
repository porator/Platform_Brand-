"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AddModuleFlow } from "@/components/dashboard/create-project-flow";
import type { ModuleId, Project } from "@/lib/newgen";

/**
 * Add module, from anywhere in the dashboard (the Module management page's Add buttons, a project row's ⋯ › Add
 * module): the Create project dialog's look, opened on the modules step with that module checked, then a success
 * step. Leaving the page it was opened on closes it.
 */
type Open = (project: Project, module?: ModuleId) => void;
const AddModuleContext = React.createContext<Open>(() => {});

export function useAddModule(): Open {
  return React.useContext(AddModuleContext);
}

export function AddModuleModalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [run, setRun] = React.useState<{ key: number; project: Project; module?: ModuleId; path: string } | null>(null);
  const open = React.useCallback<Open>(
    (project, module) => setRun((r) => ({ key: (r?.key ?? 0) + 1, project, module, path: pathname ?? "" })),
    [pathname],
  );
  const close = () => setRun(null);
  const shown = !!run && run.path === pathname;

  return (
    <AddModuleContext.Provider value={open}>
      {children}
      <Dialog open={shown} onOpenChange={(o) => !o && close()}>
        <DialogContent
          showCloseButton={false}
          className="h-[min(820px,calc(100svh-2rem))] w-[min(1240px,calc(100vw-2rem))] max-w-none grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">Add module</DialogTitle>
          {run ? <AddModuleFlow key={run.key} project={run.project} initial={run.module} onClose={close} /> : null}
        </DialogContent>
      </Dialog>
    </AddModuleContext.Provider>
  );
}
