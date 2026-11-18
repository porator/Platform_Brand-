"use client";

import * as React from "react";
import { IconCheck, IconExclamationMark } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export type StepState = "completed" | "current" | "upcoming" | "error" | "disabled";
export type Step = { title: string; description?: string; state: StepState };

function Indicator({ state, index }: { state: StepState; index: number }) {
  const base = "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors";
  if (state === "completed")
    return (
      <span className={cn(base, "border-primary bg-primary text-primary-foreground")}>
        <IconCheck className="size-4" aria-hidden />
      </span>
    );
  if (state === "current")
    return <span className={cn(base, "border-2 border-primary bg-background text-primary")}>{index + 1}</span>;
  if (state === "error")
    return (
      <span className={cn(base, "border-destructive bg-destructive/10 text-destructive")}>
        <IconExclamationMark className="size-4" aria-hidden />
      </span>
    );
  // upcoming / disabled
  return (
    <span
      className={cn(
        base,
        "bg-background text-muted-foreground",
        state === "disabled" ? "border-dashed border-border" : "border-border",
      )}
    >
      {index + 1}
    </span>
  );
}

function labelTone(state: StepState) {
  if (state === "current") return "text-foreground font-medium";
  if (state === "completed") return "text-foreground";
  if (state === "error") return "text-destructive font-medium";
  if (state === "disabled") return "text-muted-foreground line-through";
  return "text-muted-foreground";
}

export function Stepper({
  steps,
  orientation = "horizontal",
  className,
}: {
  steps: Step[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const currentIndex = steps.findIndex((s) => s.state === "current");

  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col", className)} aria-label="Progress">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          const done = step.state === "completed";
          return (
            <li key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Indicator state={step.state} index={i} />
                {!last ? (
                  <span className={cn("my-1 w-px flex-1", done ? "bg-primary" : "bg-border")} aria-hidden />
                ) : null}
              </div>
              <div className={cn("pb-6", last && "pb-0")}>
                <div className={cn("text-sm leading-7", labelTone(step.state))}>{step.title}</div>
                {step.description ? (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={cn("flex w-full items-center", className)} aria-label="Progress">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const connectorDone = i < currentIndex || step.state === "completed";
        return (
          <li key={step.title} className={cn("flex items-center", !last && "flex-1")}>
            <div className="flex items-center gap-2.5">
              <Indicator state={step.state} index={i} />
              <span className={cn("hidden whitespace-nowrap text-sm sm:block", labelTone(step.state))}>
                {step.title}
              </span>
            </div>
            {!last ? (
              <span className={cn("mx-3 h-px flex-1", connectorDone ? "bg-primary" : "bg-border")} aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

const FLOW: Step[] = [
  { title: "Project", state: "completed" },
  { title: "Configuration", state: "completed" },
  { title: "Build", state: "current" },
  { title: "Test", state: "upcoming" },
  { title: "Release", state: "upcoming" },
];

export function StepperPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Navigation"
        title="Stepper"
        description={
          <>
            Communicates progress through a multi-step flow. Composed from design-system tokens (no
            new primitive). Each step is completed, current, upcoming, in error or disabled — and the
            connectors fill as the user advances.
          </>
        }
      />

      <Section
        title="Basic usage"
        description="A realistic release flow — Project → Configuration → Build → Test → Release. Two steps done, Build is current."
      >
        <Stepper steps={FLOW} />
      </Section>

      <Section title="States" description="Every step state, shown together.">
        <div className="flex flex-col gap-8">
          <Row label="Completed & current" className="w-full">
            <Stepper
              steps={[
                { title: "Project", state: "completed" },
                { title: "Configuration", state: "completed" },
                { title: "Build", state: "current" },
                { title: "Release", state: "upcoming" },
              ]}
            />
          </Row>
          <Row label="With an error" className="w-full">
            <Stepper
              steps={[
                { title: "Project", state: "completed" },
                { title: "Configuration", state: "completed" },
                { title: "Build", state: "error" },
                { title: "Release", state: "disabled" },
              ]}
            />
          </Row>
        </div>
      </Section>

      <Section
        title="Vertical"
        description="A vertical stepper suits side panels and wizards, and has room for per-step descriptions."
      >
        <Stepper
          orientation="vertical"
          className="max-w-sm"
          steps={[
            { title: "Project", description: "Name and workspace selected.", state: "completed" },
            { title: "Configuration", description: "Build settings and secrets.", state: "completed" },
            { title: "Build", description: "Compiling and packaging the app.", state: "current" },
            { title: "Test", description: "Run on the tester device pool.", state: "upcoming" },
            { title: "Release", description: "Publish to the selected channel.", state: "upcoming" },
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Rendered as an ordered list (<Mono>&lt;ol&gt;</Mono>) labelled &quot;Progress&quot; so
              order and count are conveyed.
            </>,
            "Each step's status is carried by its icon/number and label text, never color alone.",
            "Connectors are decorative and hidden from assistive tech.",
            "The error step uses the destructive token plus an icon so it is unambiguous.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
