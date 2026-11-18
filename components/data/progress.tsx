"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

type Tone = "default" | "success" | "warning" | "destructive";

function ProgressBar({
  label,
  value,
  supporting,
  tone = "default",
  showValue = true,
  className,
}: {
  label?: string;
  value: number;
  supporting?: React.ReactNode;
  tone?: Tone;
  showValue?: boolean;
  className?: string;
}) {
  const toneClass =
    tone === "success"
      ? "[&_[data-slot=progress-indicator]]:bg-success"
      : tone === "warning"
        ? "[&_[data-slot=progress-indicator]]:bg-warning"
        : tone === "destructive"
          ? "[&_[data-slot=progress-indicator]]:bg-destructive"
          : "";
  return (
    <div className={cn("max-w-md", className)}>
      <Progress value={value} className={toneClass}>
        {label ? <ProgressLabel className="text-foreground">{label}</ProgressLabel> : null}
        {showValue ? <ProgressValue /> : null}
      </Progress>
      {supporting ? <p className="mt-1.5 text-sm text-muted-foreground">{supporting}</p> : null}
    </div>
  );
}

function IndeterminateBar({ label }: { label?: string }) {
  return (
    <div className="max-w-md">
      {label ? <p className="mb-2 text-sm font-medium text-foreground">{label}</p> : null}
      <div
        role="progressbar"
        aria-label={label ?? "Loading"}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full w-1/3 rounded-full bg-primary animate-[progress-indeterminate_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

export function ProgressPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Data Display"
        title="Progress"
        description={
          <>
            Shows how far along a task is — the shadcn <Mono>Progress</Mono> (Base UI). Use a
            determinate bar when the total is known (a build, a rollout) and an indeterminate bar for
            unknown-duration loading.
          </>
        }
      />

      <Section title="Basic usage" description="A labelled determinate bar with a percentage.">
        <ProgressBar label="Build progress" value={64} supporting="Compiling modules…" />
      </Section>

      <Section
        title="Levels"
        description="The same bar at low, medium and high completion, and a finished state."
      >
        <div className="flex flex-col gap-6">
          <ProgressBar label="Low" value={18} />
          <ProgressBar label="Medium" value={52} />
          <ProgressBar label="High" value={86} />
          <ProgressBar label="Complete" value={100} tone="success" supporting="Build finished successfully." />
        </div>
      </Section>

      <Section
        title="Error"
        description="When a task fails partway, the destructive token communicates it — paired with a message."
      >
        <ProgressBar label="Rollout" value={42} tone="destructive" supporting="Rollout halted — 42% of devices updated before an error." />
      </Section>

      <Section
        title="Indeterminate"
        description="For tasks with no known duration — queued or connecting states."
      >
        <IndeterminateBar label="Queued — waiting for a runner…" />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Exposes the <Mono>progressbar</Mono> role with current, min and max values for
              determinate bars.
            </>,
            "The percentage is shown as text, so progress never relies on the bar fill alone.",
            "Indeterminate bars carry an accessible label and no misleading value.",
            "Tone colors (success / destructive) meet AA contrast in both themes.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
