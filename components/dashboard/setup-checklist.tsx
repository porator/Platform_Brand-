"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconChecklist, IconChevronRight, IconCircleCheckFilled, IconInfoCircle, IconX } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemo, useProjectModules } from "@/components/dashboard/providers";
import { baseModules, projectHref, DEFAULT_ENV_ID, MODULE_LABEL, type ModuleId, type Project } from "@/lib/newgen";
import { moduleSetup, stepsFor } from "@/lib/setup";
import { cn } from "@/lib/utils";

/** Where a project's modules stand, with the go-live steps still to do. */
export function useSetup(project: Project) {
  const demo = useDemo();
  const { modules } = useProjectModules(project);
  const created = !!demo.createdModules[project.id] || !!project.pending;
  const base = demo.createdModules[project.id] ?? baseModules(project);
  const done = demo.done[project.id] ?? [];
  const setup = moduleSetup(project, base, modules, done, created);
  const setDone = (ids: string[], on: boolean) =>
    demo.set((s) => {
      const cur = new Set(s.done[project.id] ?? []);
      ids.forEach((id) => (on ? cur.add(id) : cur.delete(id)));
      return { ...s, done: { ...s.done, [project.id]: [...cur] } };
    });
  return {
    ...setup,
    modules,
    created,
    toggle: (id: string) => setDone([id], !setup.isDone(id)),
    /** Mark every go-live step of a module done (it turns Live). */
    complete: (m: ModuleId) => setDone(stepsFor(m).map((s) => s.id), true),
  };
}

/** The `?panel=checklist` URL toggle, keeping everything else in place. */
function useChecklistUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const open = params.get("panel") === "checklist";
  const set = (v: boolean) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set("panel", "checklist");
    else p.delete("panel");
    const q = p.toString();
    router.replace(`${pathname}${q ? `?${q}` : ""}`, { scroll: false });
  };
  return { open, set };
}

/**
 * The setup checklist (Guided Setup PRD): go-live steps per module, in
 * Production. A new project lands here; adding a module to a live project
 * brings it back with only that module's steps (Module Management PRD).
 */
export function SetupChecklistPanel({ project }: { project: Project }) {
  const { open, set } = useChecklistUrl();
  const setup = useSetup(project);
  const name = project.project;

  // Announce a module going Live as its last step is ticked.
  const prev = React.useRef(setup.settingUp);
  React.useEffect(() => {
    // Only a module the project still has can go live.
    prev.current.filter((m) => !setup.settingUp.includes(m) && setup.modules.includes(m)).forEach((m) => toast(`${MODULE_LABEL[m]} is Live`));
    prev.current = setup.settingUp;
  }, [setup.settingUp]);

  const total = setup.steps.length;
  const doneCount = setup.steps.filter((s) => setup.isDone(s.id)).length;
  const sharedSteps = setup.steps.filter((s) => s.modules.filter((x) => setup.settingUp.includes(x)).length > 1);
  const sharedIds = new Set(sharedSteps.map((s) => s.id));

  /** One go-live step. A step already done because a live module needed it says so, instead of looking ticked by mistake. */
  const row = (s: (typeof setup.steps)[number]) => {
    const done = setup.isDone(s.id);
    const via = s.modules.filter((x) => setup.modules.includes(x) && !setup.settingUp.includes(x));
    return (
      // A timeline row: the step's mark, then its label. A thin line joins each mark to the next one (none after the last).
      <li
        key={s.id}
        className="relative flex items-start gap-3 py-2 before:absolute before:top-[29px] before:-bottom-[8px] before:left-[8.5px] before:w-px before:bg-foreground/15 last:before:hidden"
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={s.label}
          onClick={() => setup.toggle(s.id)}
          className="mt-px shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {done ? <IconCircleCheckFilled className="size-[18px] text-success" /> : <DashedCircle className="size-[18px] text-muted-foreground" />}
        </button>
        <span className={cn("min-w-0 flex-1 leading-5", done && "text-muted-foreground")}>
          <span className={cn(done && "line-through")}>{s.label}</span>
          {done && via.length ? <span className="block text-[11px] text-muted-foreground">Already set up for {via.map((x) => MODULE_LABEL[x]).join(", ")}</span> : null}
        </span>
        {!done ? (
          <Link href={projectHref(project.id, s.section, DEFAULT_ENV_ID)} className="shrink-0 text-xs leading-5 font-medium text-muted-foreground hover:text-foreground">
            Set up
          </Link>
        ) : null}
      </li>
    );
  };

  if (!open) return null;
  // Docked beside the page like the AI assistant drawer (part of the workspace, not a layer over it).
  return (
    <aside
      data-docked-drawer
      aria-label="Setup checklist"
      className="ml-2 flex w-[380px] shrink-0 animate-in flex-col overflow-hidden rounded-xl bg-white shadow-(--frame-shadow) fade-in-0 slide-in-from-right-4 duration-200 motion-reduce:animate-none"
    >
        <div className="flex flex-col gap-1 border-b border-border p-4 pt-3">
          <div className="flex items-center gap-2">
            <IconChecklist className="size-4 shrink-0" />
            <h2 className="flex-1 font-heading text-base font-medium text-foreground">Setup checklist</h2>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Close setup checklist" className="-mr-1 rounded-full text-muted-foreground" onClick={() => set(false)}>
              <IconX className="size-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{name} · Production</p>
          {total ? (
            <>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {doneCount} of {total} steps done
                </span>
                <span>{Math.round((doneCount / total) * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(doneCount / total) * 100}%` }} />
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-auto p-4 text-sm">
          {setup.projectLive && setup.settingUp.length ? (
            <p className="flex gap-2 rounded-md bg-muted p-3 text-muted-foreground">
              <IconInfoCircle className="mt-0.5 size-4 shrink-0" />
              {name} is live. Only the go-live steps for {setup.settingUp.map((m) => MODULE_LABEL[m]).join(" and ")} are listed.
            </p>
          ) : null}
          {!setup.projectLive ? (
            <p className="flex gap-2 rounded-md bg-muted p-3 text-muted-foreground">
              <IconInfoCircle className="mt-0.5 size-4 shrink-0" />
              Running on Appcharge mock endpoints. Purchases use test payments only and nothing is charged until your integration is set up.
            </p>
          ) : null}

          {setup.settingUp.length ? (
            <>
              {/* A step two setting-up modules need is listed once, under "Shared", so ticking it never ticks a row in
                  another module's list as well (R16 · "wrong row marked done"). */}
              {sharedSteps.length ? (
                <section>
                  <header className="flex items-center justify-between gap-2 pb-1">
                    <span className="font-medium">Shared by {setup.settingUp.map((m) => MODULE_LABEL[m]).join(" and ")}</span>
                    <Badge variant="neutral">Set up once</Badge>
                  </header>
                  <ul>{sharedSteps.map((s) => row(s))}</ul>
                </section>
              ) : null}
              {setup.settingUp.map((m) => {
                const steps = stepsFor(m);
                const own = steps.filter((s) => !sharedIds.has(s.id));
                const n = steps.filter((s) => setup.isDone(s.id)).length;
                return (
                  <section key={m}>
                    <header className="flex items-center justify-between gap-2 pb-1">
                      <span className="font-medium">{MODULE_LABEL[m]}</span>
                      <Badge variant="warning">
                        Setting up · {n}/{steps.length}
                      </Badge>
                    </header>
                    {own.length ? (
                      <ul>{own.map((s) => row(s))}</ul>
                    ) : (
                      <p className="py-2 text-muted-foreground">Only the shared steps above.</p>
                    )}
                  </section>
                );
              })}
            </>
          ) : (
            <p className="py-8 text-center text-muted-foreground">Every module is live. Nothing left to set up.</p>
          )}
        </div>
    </aside>
  );
}

/** A step that isn't done yet: a dashed ring (the timeline's open mark). */
function DashedCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden className={className}>
      <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2.7" strokeLinecap="round" />
    </svg>
  );
}

/** Sidebar entry while any module is setting up. */
export function SetupChecklistIndicator({ project }: { project: Project }) {
  const setup = useSetup(project);
  const { set } = useChecklistUrl();
  if (!setup.settingUp.length) return null;
  const done = setup.steps.filter((s) => setup.isDone(s.id)).length;
  return (
    <button
      type="button"
      onClick={() => set(true)}
      className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground [&>svg]:text-muted-foreground hover:[&>svg]:text-sidebar-accent-foreground"
    >
      <IconChecklist className="size-4 shrink-0" />
      <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">Setup checklist</span>
      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground group-data-[collapsible=icon]:hidden">
        {done}/{setup.steps.length}
      </span>
    </button>
  );
}

/**
 * A project's store setup status, for lists (a folder's Projects): "Setting up" with how many go-live steps are done
 * and a small progress bar while its checklist is open, else the project's status (Live by default).
 */
export function StoreSetupStatus({ project, mono = false }: { project: Project; mono?: boolean }) {
  const setup = useSetup(project);
  const router = useRouter();
  if (setup.settingUp.length) {
    const done = setup.steps.filter((s) => setup.isDone(s.id)).length;
    const total = setup.steps.length || 1;
    // Opens the project's setup checklist drawer (it may sit inside a row link, so it's a button-span that stops there).
    const open = (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(`${projectHref(project.id, "home", DEFAULT_ENV_ID)}?panel=checklist`);
    };
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open(e)}
        className="-my-1 flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full py-1 pr-1 pl-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        title={`Store setup: ${done} of ${total} steps done. Open the setup checklist`}
      >
        <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block" aria-hidden>
          <span className={cn("block h-full rounded-full", mono ? "bg-muted-foreground" : "bg-warning")} style={{ width: `${(done / total) * 100}%` }} />
        </span>
        <Badge variant={mono ? "neutral" : "warning"}>
          Setting up · {done}/{total}
          <IconChevronRight data-icon="inline-end" aria-hidden />
        </Badge>
      </span>
    );
  }
  const status = project.status ?? "Live";
  return <Badge variant={mono ? "neutral" : status === "Live" ? "success" : status === "Soft launch" ? "warning" : "neutral"}>{status}</Badge>;
}
