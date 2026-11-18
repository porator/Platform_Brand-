"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCornerDownRight,
  IconEyeOff,
  IconListNumbers,
  IconRoute,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { flowKey, useDemo, type FlowMode } from "@/components/dashboard/providers";
import { flowsFor, locate, type Flow } from "@/lib/flows";

/** Whether the pointer is over the guide (its capsule or its step list). */
let pointerInGuide = false;
const guidePointer = {
  onPointerEnter: () => (pointerInGuide = true),
  onPointerLeave: () => (pointerInGuide = false),
};

/** True when an overlay is being dismissed by a click in the flow guide. URL-
 *  driven overlays ignore that: the guide's link replaces the URL, closing them
 *  anyway, and clearing their params first would lose the step. */
export function isGuideEvent(details?: { event?: Event }): boolean {
  // Escape still closes overlays, wherever the pointer is.
  if (details?.event?.type.startsWith("key")) return false;
  const t = details?.event?.target;
  return pointerInGuide || (t instanceof Element && !!t.closest("[data-flow-guide]"));
}

/** True inside the presentation's live screens (the dashboard in an iframe),
 *  where presentation tooling — this guide, the review and NewGen buttons —
 *  is hidden so only the dashboard shows. */
export function useEmbedded(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => window.self !== window.top,
    () => false,
  );
}

const CAPSULE_BTN ="rounded-full text-background hover:bg-background/15 hover:text-background disabled:opacity-40";

/**
 * The user-flow guide — presentation tooling for walking the three PRD flows.
 * A floating capsule above the page (bottom center): First time / Returning,
 * the flows as tabs (the active one marked), the current step with back / next,
 * and every step and branch one click away.
 * The step is read from the URL, so clicking through the dashboard itself keeps
 * it in sync; switching version or flow resumes each where it was left.
 */
const MODES: { id: FlowMode; label: string }[] = [
  { id: "first", label: "First time" },
  { id: "returning", label: "Returning" },
];

export function FlowGuide({ className }: { className?: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const demo = useDemo();
  const [listOpen, setListOpen] = React.useState(false);

  const href = `${pathname}${params.toString() ? `?${params}` : ""}`;
  const pos = locate(pathname, params, demo.activeFlow, demo.mode);
  // A step's URL decides the version too: opening a first-time screen switches to First time.
  const mode = pos?.flow.mode ?? demo.mode;
  const flows = flowsFor(mode);
  const flow = pos?.flow ?? flows.find((f) => f.id === demo.activeFlow)!;
  const resume = (f: Flow) => demo.lastHref[flowKey(f.mode, f.id)] ?? f.steps[0].href;

  // Landing on a flow's screen makes it the active version and flow, and remembers the spot.
  React.useEffect(() => {
    if (!pos) return;
    const key = flowKey(pos.flow.mode, pos.flow.id);
    demo.set((s) =>
      s.activeFlow === pos.flow.id && s.mode === pos.flow.mode && s.lastHref[key] === href
        ? s
        : { ...s, activeFlow: pos.flow.id, mode: pos.flow.mode, lastHref: { ...s.lastHref, [key]: href } },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  const switchTo = (f: Flow) => {
    demo.set((s) => ({ ...s, activeFlow: f.id, mode: f.mode }));
    router.push(resume(f));
  };
  /** Same flow in the other version, where that version was left. */
  const switchMode = (m: FlowMode) => {
    if (m === mode) return;
    switchTo(flowsFor(m).find((f) => f.id === flow.id)!);
  };

  const onFlow = pos?.flow.id === flow.id;
  const stepIndex = onFlow ? pos!.step : -1;
  const branch = onFlow && pos!.branch != null ? flow.steps[pos!.step].branches![pos!.branch] : null;
  const step = stepIndex >= 0 ? flow.steps[stepIndex] : null;
  const prevHref = branch ? step!.href : stepIndex > 0 ? flow.steps[stepIndex - 1].href : null;
  const nextHref = stepIndex < 0 ? resume(flow) : flow.steps[stepIndex + 1]?.href ?? null;
  const embedded = useEmbedded();

  if (embedded) return null;
  if (demo.guideHidden) {
    return (
      <button
        type="button"
        data-flow-guide
        onClick={() => demo.set((s) => ({ ...s, guideHidden: false }))}
        className="fixed bottom-20 left-1/2 z-[60] inline-flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-medium text-background shadow-xl transition-transform hover:scale-105"
      >
        <IconRoute className="size-3.5" />
        User flows
      </button>
    );
  }

  return (
    // Floating presentation tooling (like the review and NewGen buttons), not
    // dashboard chrome. Above dialog backdrops (z-50), so flows can be stepped
    // with a dialog open.
    <div
      data-flow-guide
      {...guidePointer}
      className={cn("fixed bottom-20 left-1/2 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2", className)}
    >
      <div className="flex items-center gap-2 rounded-full bg-foreground py-1.5 pr-1.5 pl-3.5 text-background shadow-xl ring-1 ring-black/10">
        <IconRoute className="size-4 shrink-0 text-background/70" aria-label="User flows" />

        {/* Which user: first time on a fresh account, or returning to their tree. */}
        <div role="radiogroup" aria-label="User" className="flex shrink-0 rounded-full bg-background/10 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={m.id === mode}
              onClick={() => switchMode(m.id)}
              className={cn(
                "flex h-7 items-center rounded-full px-2.5 text-nav font-medium whitespace-nowrap transition-colors",
                m.id === mode ? "bg-background/90 text-foreground" : "text-background/70 hover:text-background",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div role="tablist" aria-label="User flows" className="flex shrink-0 rounded-full bg-background/10 p-0.5">
          {flows.map((f, i) => {
            const active = f.id === flow.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTo(f)}
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-full px-2.5 text-nav font-medium whitespace-nowrap transition-colors",
                  active ? "bg-background text-foreground" : "text-background/70 hover:text-background",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full text-[10px] font-semibold",
                    active ? "bg-foreground text-background" : "bg-background/20",
                  )}
                >
                  {i + 1}
                </span>
                {f.title}
              </button>
            );
          })}
        </div>

        <span className="h-5 w-px shrink-0 bg-background/20" aria-hidden />
        <div className="flex min-w-0 items-center gap-0.5">
          <Button
            size="icon-sm"
            variant="ghost"
            className={CAPSULE_BTN}
            aria-label="Previous step"
            disabled={!prevHref}
            nativeButton={!prevHref} render={prevHref ? <Link href={prevHref} /> : undefined}
          >
            <IconChevronLeft />
          </Button>

          <Popover open={listOpen} onOpenChange={setListOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="flex h-8 max-w-72 min-w-0 items-center gap-2 rounded-full px-2 text-left text-nav hover:bg-background/10"
                  aria-label="All steps"
                />
              }
            >
              <IconListNumbers className="size-4 shrink-0 text-background/60" />
              {step ? (
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-medium">
                    Step {stepIndex + 1} of {flow.steps.length} · {branch ? branch.title : step.title}
                  </span>
                  <span className="truncate text-[11px] text-background/60">{branch ? `Branch of “${step.title}”` : step.screen}</span>
                </span>
              ) : (
                <span className="truncate text-background/60">Off the flow · next resumes it</span>
              )}
            </PopoverTrigger>
            <PopoverContent data-flow-guide {...guidePointer} side="top" align="center" sideOffset={10} className="w-96 gap-0 p-0">
              <div className="border-b border-border px-3 py-2.5">
                <p className="text-sm font-semibold">
                  {flow.title} <span className="font-normal text-muted-foreground">· {flow.mode === "first" ? "First time" : "Returning"}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {flow.persona} · {flow.source}
                </p>
              </div>
              <ol className="max-h-[60vh] overflow-y-auto p-1.5">
                {flow.steps.map((s, i) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      onClick={() => setListOpen(false)}
                      aria-current={i === stepIndex && !branch ? "step" : undefined}
                      className={cn(
                        "flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                        i === stepIndex && !branch && "bg-accent font-medium",
                      )}
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] tabular-nums">{i + 1}</span>
                      <span className="flex min-w-0 flex-col">
                        <span>{s.title}</span>
                        <span className="text-xs font-normal text-muted-foreground">{s.screen}</span>
                      </span>
                    </Link>
                    {s.branches?.map((b, j) => (
                      <Link
                        key={b.href}
                        href={b.href}
                        onClick={() => setListOpen(false)}
                        aria-current={i === stepIndex && pos?.branch === j ? "step" : undefined}
                        className={cn(
                          "ml-7 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
                          i === stepIndex && pos?.branch === j && "bg-accent text-foreground",
                        )}
                      >
                        <IconCornerDownRight className="size-3.5 shrink-0" />
                        {b.title}
                      </Link>
                    ))}
                  </li>
                ))}
              </ol>
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">Changes you make are kept until reload.</span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    demo.reset();
                    setListOpen(false);
                    router.push(flow.steps[0].href);
                  }}
                >
                  Restart walkthrough
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="icon-sm"
            variant="ghost"
            className={CAPSULE_BTN}
            aria-label="Next step"
            disabled={!nextHref}
            nativeButton={!nextHref} render={nextHref ? <Link href={nextHref} /> : undefined}
          >
            <IconChevronRight />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className={CAPSULE_BTN}
            aria-label="Hide user flows"
            title="Hide user flows"
            onClick={() => demo.set((s) => ({ ...s, guideHidden: true }))}
          >
            <IconEyeOff />
          </Button>
        </div>
      </div>
    </div>
  );
}
