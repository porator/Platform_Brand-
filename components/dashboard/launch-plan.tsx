"use client";

import * as React from "react";
import {
  IconRocket,
  IconCheck,
  IconCircleCheckFilled,
  IconCircle,
  IconLock,
  IconSelector,
  IconChevronRight,
} from "@/lib/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLaunchPlan } from "@/components/dashboard/providers";
import { cn } from "@/lib/utils";

/* --------------------------------- data ----------------------------------- */

const ROLES = [
  { id: "pm", label: "Product", short: "PM", chip: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" },
  { id: "designer", label: "Designer", short: "D", chip: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300" },
  { id: "developer", label: "Developer", short: "Dv", chip: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" },
  { id: "liveops", label: "Live Ops", short: "LO", chip: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300" },
  { id: "finance", label: "Finance", short: "F", chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
  { id: "support", label: "Support", short: "S", chip: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300" },
] as const;
type RoleId = (typeof ROLES)[number]["id"];
const roleOf = (id: RoleId) => ROLES.find((r) => r.id === id)!;

type Task = { id: string; label: string; owner: RoleId; auto?: boolean; done?: boolean };
type Step = { id: number; title: string; tasks: Task[] };

const STEPS: Step[] = [
  {
    id: 0,
    title: "Set up the store",
    tasks: [
      { id: "s0a", label: "Create the store", owner: "pm", done: true },
      { id: "s0b", label: "Name and brand it", owner: "designer", done: true },
    ],
  },
  {
    id: 1,
    title: "Build the store",
    tasks: [
      { id: "s1a", label: "Create products", owner: "designer" },
      { id: "s1b", label: "Configure checkout", owner: "developer" },
      { id: "s1c", label: "Set pricing", owner: "finance" },
      { id: "s1d", label: "Add first offer", owner: "liveops", auto: true },
    ],
  },
  {
    id: 2,
    title: "Test in sandbox",
    tasks: [
      { id: "s2a", label: "Simulate first sandbox order", owner: "developer", auto: true },
      { id: "s2b", label: "Verify webhooks", owner: "developer" },
      { id: "s2c", label: "QA the storefront", owner: "support" },
    ],
  },
  {
    id: 3,
    title: "Go live · Projects Sync",
    tasks: [
      { id: "s3a", label: "Run Projects Sync", owner: "developer", auto: true },
      { id: "s3b", label: "Approve go-live", owner: "pm" },
    ],
  },
  {
    id: 4,
    title: "Grow · offers and A/B",
    tasks: [
      { id: "s4a", label: "Launch an A/B test", owner: "liveops" },
      { id: "s4b", label: "Schedule a promotion", owner: "liveops" },
    ],
  },
  {
    id: 5,
    title: "Scale · subscriptions",
    tasks: [{ id: "s5a", label: "Enable subscriptions", owner: "finance" }],
  },
];

const ALL_TASKS = STEPS.flatMap((s) => s.tasks);
export const LAUNCH_TOTAL = ALL_TASKS.length;
export const launchDone = () => ALL_TASKS.filter((t) => t.done).length;
/** The first step that still has open tasks is the one in progress. */
const activeStepId = STEPS.find((s) => s.tasks.some((t) => !t.done))?.id ?? STEPS.length;

/* ------------------------------- role chip -------------------------------- */

function RoleChip({ id, className }: { id: RoleId; className?: string }) {
  const r = roleOf(id);
  return (
    <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium", r.chip, className)}>
      {r.short}
    </span>
  );
}

/* --------------------------------- panel ---------------------------------- */

export function LaunchPlanPanel() {
  const launch = useLaunchPlan();
  const [role, setRole] = React.useState<RoleId>("pm");
  const done = launchDone();
  const pct = Math.round((done / LAUNCH_TOTAL) * 100);
  const nextTask = ALL_TASKS.find((t) => !t.done);
  const current = roleOf(role);

  return (
    <Sheet open={launch.open} onOpenChange={launch.setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="gap-1 border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2">
            <IconRocket className="size-4" />
            Launch plan
          </SheetTitle>
          <SheetDescription>{launch.context || "Your store"} · ~90 days to launch</SheetDescription>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {done} of {LAUNCH_TOTAL} tasks done
            </span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Viewing as</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border py-0.5 pr-2 pl-1 text-xs font-medium transition-colors hover:bg-muted"
                  />
                }
              >
                <RoleChip id={role} />
                {current.label}
                <IconSelector className="size-3.5 text-muted-foreground" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as RoleId)}>
                  {ROLES.map((r) => (
                    <DropdownMenuRadioItem key={r.id} value={r.id} className="gap-2.5">
                      <RoleChip id={r.id} />
                      {r.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-auto p-3">
          {STEPS.map((step) => {
            const stepDone = step.tasks.every((t) => t.done);
            const stepCount = step.tasks.filter((t) => t.done).length;
            const isActive = step.id === activeStepId;
            const locked = step.id > activeStepId;

            if (!isActive) {
              return (
                <div key={step.id} className={cn("flex items-center gap-2.5 p-2", (stepDone || locked) && "opacity-80")}>
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-medium",
                      stepDone ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {stepDone ? <IconCheck className="size-3.5" /> : step.id}
                  </span>
                  <span className={cn("flex-1 text-[13px]", stepDone ? "font-medium" : "text-muted-foreground")}>
                    Step {step.id} · {step.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {stepCount} / {step.tasks.length}
                  </span>
                  {locked ? <IconLock className="size-4 text-muted-foreground" aria-hidden /> : null}
                </div>
              );
            }

            return (
              <div key={step.id} className="my-1.5 rounded-xl border-2 border-foreground/15 p-1.5">
                <div className="flex items-center gap-2.5 px-2 pt-1 pb-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-medium text-primary-foreground">
                    {step.id}
                  </span>
                  <span className="flex-1 text-[13px] font-medium">Step {step.id} · {step.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {stepCount} / {step.tasks.length}
                  </span>
                </div>
                {step.tasks.map((task) => {
                  const mine = task.owner === role;
                  return (
                    <div key={task.id} className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5", mine && !task.done && "bg-muted")}>
                      {task.done ? (
                        <IconCircleCheckFilled className="size-[18px] shrink-0 text-green-600 dark:text-green-400" aria-hidden />
                      ) : (
                        <IconCircle className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
                      )}
                      <span className={cn("flex-1 truncate text-[13px]", task.done ? "text-muted-foreground line-through" : "text-foreground")}>
                        {task.label}
                      </span>
                      {!task.done ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            task.auto
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {task.auto ? "Auto" : "Manual"}
                        </span>
                      ) : null}
                      <RoleChip id={task.owner} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {nextTask ? (
          <div className="flex items-center justify-between gap-3 border-t border-border p-3">
            <span className="min-w-0 truncate text-xs text-muted-foreground">Next: {nextTask.label}</span>
            <button
              type="button"
              onClick={() => launch.setOpen(false)}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open task
              <IconChevronRight className="size-4" />
            </button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/* ----------------------------- sidebar indicator -------------------------- */

/** The "Launch plan · N/total" entry shown once the store is set up. */
export function LaunchPlanIndicator({ className }: { className?: string }) {
  const launch = useLaunchPlan();
  if (!launch.started) return null;
  const done = launchDone();
  return (
    <button
      type="button"
      onClick={() => launch.setOpen(true)}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground [&>svg]:text-muted-foreground hover:[&>svg]:text-sidebar-accent-foreground",
        className,
      )}
    >
      <IconRocket className="size-4 shrink-0" />
      <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">Launch plan</span>
      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground group-data-[collapsible=icon]:hidden">
        {done}/{LAUNCH_TOTAL}
      </span>
    </button>
  );
}
