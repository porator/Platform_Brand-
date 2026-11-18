"use client";

import * as React from "react";
import { IconArrowRight, IconCheck, IconChecklist, IconCircle, IconCircleCheckFilled, IconCircleFilled, IconX } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AppchargeLogo } from "@/components/dashboard/logo";
import { cn } from "@/lib/utils";

/**
 * Direct Checkout onboarding, about three weeks (Confluence: "Onboarding - Web Checkout" and "Web Checkout Solution
 * Call"). Seven stages with when, who and what. The current one follows the project's setup checklist: integrating in
 * the Sandbox until the Direct Checkout go-live steps are done, then pre-go-live prep, then hyper-care once live.
 *
 * Shown in a large dialog laid out like Create project: the stages on the left (progress and the main button at the
 * bottom), the chosen stage previewed on the right, on a panel in Direct Checkout's colour.
 */

type Owner = "Appcharge" | "You" | "Together";
type Stage = { when: string; title: string; text: string; owner: Owner; detail?: string[] };

const STAGES: Stage[] = [
  {
    when: "Before week 1",
    title: "Handoff to your Onboarding Manager",
    text: "Your Onboarding Manager takes over from Sales, opens shared Slack channels and your Sandbox.",
    owner: "Appcharge",
  },
  {
    when: "Week 1",
    title: "Checkout solution call",
    text: "Goals, scope, timeline and roles, then a walk through how checkout works and the APIs.",
    owner: "Together",
    detail: [
      "Optional: set price points",
      "Your game server creates a checkout session",
      "Appcharge returns a checkout token",
      "The SDK opens the checkout",
      "The player pays",
      "Your game server awards the player",
      "The session closes",
    ],
  },
  {
    when: "Week 2",
    title: "Integrate and test in the Sandbox",
    text: "Add the checkout SDK and the required APIs, customize the checkout design if you want, until QA approves.",
    owner: "You",
  },
  { when: "Week 2", title: "Move to Production", text: "The approved setup moves from the Sandbox to Production.", owner: "Together" },
  { when: "Week 3", title: "Pre-go-live prep", text: "A check-in, QA in Production and a session with Payment Operations.", owner: "Together" },
  { when: "Week 3", title: "Go live", text: "Checkout goes live, with cutover and live monitoring.", owner: "Together" },
  {
    when: "Weeks 3–7",
    title: "Hyper-care, then your Account Manager",
    text: "Weekly check-ups until week 6, then your Account Manager takes over in week 7.",
    owner: "Appcharge",
  },
];

/** Direct Checkout's colours, as in Create project. */
const THEME = { accent: "#6CCD3F", tint: "#EEF9E8", panel: "#2C3E24" };
const CHARCOAL = "linear-gradient(180deg, #272727 0%, #302F2F 100%)";

const OWNER_STYLE: Record<Owner, string> = {
  Appcharge: "bg-muted text-muted-foreground",
  You: "bg-info/10 text-info",
  Together: "bg-muted text-foreground",
};

/** Which stage is current: integrating until the go-live steps are done, then prep; hyper-care once live. */
export function currentStage({ stepsDone, stepsTotal, live }: { stepsDone: number; stepsTotal: number; live: boolean }) {
  if (live) return 6;
  if (stepsTotal && stepsDone >= stepsTotal) return 4;
  return 2;
}

type Progress = {
  /** Direct Checkout's go-live steps, with whether each is done. */
  goLive: { id: string; label: string; done: boolean }[];
  live: boolean;
};

/** On project Home: where onboarding stands, and "View plan" for the dialog. */
export function OnboardingEntry({ goLive, live, onView }: Progress & { onView: () => void }) {
  const done = goLive.filter((s) => s.done).length;
  const current = currentStage({ stepsDone: done, stepsTotal: goLive.length, live });
  const st = STAGES[current];
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base font-semibold text-foreground">Direct Checkout onboarding</h2>
          <Badge variant="neutral">
            Step {current + 1} of {STAGES.length}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Now: <span className="text-foreground">{st.title}</span> · {st.when}
        </p>
        <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full" style={{ width: `${((current + 1) / STAGES.length) * 100}%`, background: THEME.accent }} />
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onView}>
        View plan
        <IconArrowRight />
      </Button>
    </section>
  );
}

/** The onboarding plan in a dialog, laid out like Create project. */
export function OnboardingDialog({
  open,
  onOpenChange,
  goLive,
  live,
  onOpenChecklist,
}: Progress & { open: boolean; onOpenChange: (open: boolean) => void; onOpenChecklist: () => void }) {
  const done = goLive.filter((s) => s.done).length;
  const current = currentStage({ stepsDone: done, stepsTotal: goLive.length, live });
  const [picked, setPicked] = React.useState<number | null>(null);
  const shown = picked ?? current;
  const st = STAGES[shown];
  const progress = (current + 1) / STAGES.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setPicked(null);
        onOpenChange(o);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="h-[min(820px,calc(100svh-2rem))] w-[min(1240px,calc(100vw-2rem))] max-w-none grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Direct Checkout onboarding</DialogTitle>
        <DialogDescription className="sr-only">About 3 weeks with your Onboarding Manager.</DialogDescription>
        <div className={cn("font-brand relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)] bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
          {/* Close, in the top-right corner (on the panel on wide screens), as in Create project. */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:bg-white/10 lg:text-white/80 lg:hover:bg-white/20 lg:hover:text-white"
          >
            <IconX className="size-5" />
          </button>

          <section className="flex h-full min-h-0 flex-col px-6 pt-5 pb-8 sm:px-12 lg:px-16">
            <div className="h-10" />
            {/* Only this middle scrolls: the progress and main button stay put. */}
            <div className="-mx-2 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-5">
              <div className="my-auto w-full max-w-[34rem]">
                <div className="mb-8">
                  <h1 className="text-[36px] font-[450] leading-[1.08] tracking-[-0.035em] text-[#272727]">Direct Checkout onboarding</h1>
                  <p className="mt-2 text-[15px] text-muted-foreground">About 3 weeks with your Onboarding Manager.</p>
                </div>
                <ol className="flex flex-col gap-1.5" aria-label="Onboarding steps">
                  {STAGES.map((s, i) => {
                    const isDone = i < current;
                    const isNow = i === current;
                    const sel = i === shown;
                    return (
                      <li key={s.title}>
                        <button
                          type="button"
                          onClick={() => setPicked(i)}
                          aria-current={isNow ? "step" : undefined}
                          aria-pressed={sel}
                          className={cn("flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors", sel ? "" : "border-transparent hover:bg-muted/60")}
                          style={sel ? { background: THEME.tint, borderColor: THEME.accent } : undefined}
                        >
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                              isDone && "border-transparent text-white",
                              !isDone && !isNow && "border-border bg-background text-muted-foreground",
                            )}
                            style={isDone ? { background: "#272727" } : isNow ? { borderColor: THEME.accent, color: "#2C6B12", background: "white" } : undefined}
                            aria-hidden
                          >
                            {isDone ? <IconCheck className="size-3.5" stroke={3} /> : i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={cn("block truncate text-[15px] font-medium", isDone ? "text-muted-foreground" : "text-foreground")}>{s.title}</span>
                            <span className="block text-xs text-muted-foreground">{s.when}</span>
                          </span>
                          {isNow ? (
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: THEME.accent, color: "#173404" }}>
                              Now
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {/* Progress and the main button, like Create project's Continue row. */}
            <div className="flex shrink-0 items-center gap-3 pt-4">
              <div className="h-1 w-36 min-w-12 shrink overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Onboarding progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: THEME.accent }} />
              </div>
              <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                Step {current + 1} of {STAGES.length}
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => {
                  if (current === 2) onOpenChecklist();
                  onOpenChange(false);
                }}
                className="h-11.5 shrink-0 rounded-[200px] px-7 text-[15px] font-medium whitespace-nowrap text-white shadow-md transition-opacity hover:opacity-85"
                style={{ background: CHARCOAL }}
              >
                {current === 2 ? "Open setup checklist" : "Done"}
              </button>
            </div>
          </section>

          {/* The preview: Direct Checkout's colour, with a window showing the chosen step. */}
          <aside className="hidden h-full items-center justify-center p-10 lg:flex xl:p-16" style={{ background: THEME.panel }}>
            <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-black/5 bg-background shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium">
                  <AppchargeLogo className="size-5 shrink-0" />
                  <span className="truncate">Onboarding plan</span>
                </span>
                <span className="flex-1" />
                <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium">
                  <IconCircleFilled className="size-2" style={{ color: THEME.accent }} />
                  Direct Checkout
                </span>
              </div>

              <div key={shown} className="flex min-h-[26rem] flex-col gap-5 p-7 animate-in fade-in-0 duration-300">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Step {shown + 1} · {st.when}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", OWNER_STYLE[st.owner])}>{st.owner}</span>
                  {shown < current ? <Badge variant="success">Done</Badge> : shown === current ? <Badge variant="info">Now</Badge> : null}
                </div>
                <div>
                  <h2 className="text-2xl font-[450] tracking-[-0.02em] text-[#272727]">{st.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{st.text}</p>
                </div>

                {st.detail ? (
                  <ol className="flex flex-col gap-2">
                    {st.detail.map((d, k) => (
                      <li key={d} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: THEME.tint, color: "#2C6B12" }}>
                          {k + 1}
                        </span>
                        {d}
                      </li>
                    ))}
                  </ol>
                ) : null}

                {shown === 2 ? (
                  <div className="rounded-xl border border-border">
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm font-medium">
                      <IconChecklist className="size-4" />
                      <span className="flex-1">Go-live steps</span>
                      <span className="text-xs font-normal text-muted-foreground tabular-nums">
                        {done} of {goLive.length} done
                      </span>
                    </div>
                    <ul className="divide-y divide-border">
                      {goLive.map((g) => (
                        <li key={g.id} className="flex items-center gap-2.5 px-3 py-2 text-sm">
                          {g.done ? <IconCircleCheckFilled className="size-[18px] text-success" /> : <IconCircle className="size-[18px] text-muted-foreground" />}
                          <span className={cn(g.done && "text-muted-foreground line-through")}>{g.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
