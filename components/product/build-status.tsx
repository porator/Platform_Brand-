"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";
import { BUILD_STATUS, type BuildStatusValue } from "./_data";

/** The status pill — reusable in tables, lists and cards. */
export function BuildStatusBadge({ status }: { status: BuildStatusValue }) {
  const { variant, icon: Icon, spin } = BUILD_STATUS[status];
  return (
    <Badge variant={variant}>
      <Icon className={spin ? "animate-spin" : undefined} />
      {status}
    </Badge>
  );
}

/** Full build status with reference and timestamp; optional progress for in-flight builds. */
export function BuildStatus({
  status,
  build,
  version,
  timestamp,
  progress,
  className,
}: {
  status: BuildStatusValue;
  build?: string;
  version?: string;
  timestamp?: string;
  progress?: number;
  className?: string;
}) {
  const inFlight = status === "Building" || status === "Processing";
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <BuildStatusBadge status={status} />
        {build || version ? (
          <span className="text-sm font-medium text-foreground">
            {build}
            {build && version ? " · " : ""}
            {version ? <Mono className="text-muted-foreground">{version}</Mono> : null}
          </span>
        ) : null}
        {timestamp ? <span className="text-xs text-muted-foreground">{timestamp}</span> : null}
      </div>
      {inFlight && progress != null ? (
        <Progress
          value={progress}
          className="max-w-xs"
          aria-label={`${build ? `${build} ` : "Build "}${status.toLowerCase()} progress`}
        >
          <span className="text-xs text-muted-foreground">{status}…</span>
        </Progress>
      ) : null}
    </div>
  );
}

const ALL: { status: BuildStatusValue; build: string; timestamp: string; progress?: number }[] = [
  { status: "Queued", build: "#1843", timestamp: "just now" },
  { status: "Building", build: "#1842", timestamp: "2m ago", progress: 64 },
  { status: "Processing", build: "#1842", timestamp: "2m ago", progress: 88 },
  { status: "Ready", build: "#1841", timestamp: "12m ago" },
  { status: "Failed", build: "#1840", timestamp: "1h ago" },
  { status: "Cancelled", build: "#1839", timestamp: "3h ago" },
];

export function BuildStatusPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Product Components"
        title="Build Status"
        description={
          <>
            Communicates the state of an Appcharge build — queued, building, processing, ready,
            failed or cancelled. It reuses the Badge and Progress primitives with the semantic status
            tokens; status is always an icon plus a label.
          </>
        }
      />

      <Section title="Statuses" description="Every build state, as the standalone pill.">
        <div className="flex flex-wrap gap-2">
          {ALL.map((b) => (
            <BuildStatusBadge key={b.status} status={b.status} />
          ))}
        </div>
      </Section>

      <Section
        title="With reference & timestamp"
        description="The full component pairs the status with a build number, version and relative time."
      >
        <div className="flex flex-col gap-4">
          <BuildStatus status="Ready" build="Build #1841" version="v2.4.0" timestamp="12m ago" />
          <BuildStatus status="Failed" build="Build #1840" version="v2.3.9" timestamp="1h ago" />
        </div>
      </Section>

      <Section
        title="In progress"
        description="Building and processing states can show live progress."
      >
        <div className="flex flex-col gap-6">
          <BuildStatus status="Building" build="Build #1842" version="v2.4.1" timestamp="2m ago" progress={64} />
          <BuildStatus status="Processing" build="Build #1842" version="v2.4.1" timestamp="2m ago" progress={88} />
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Status is conveyed by an icon and label, never color alone, and meets AA in both themes.",
            "In-flight states expose a progressbar with a text label.",
            <>
              The build reference uses <Mono>tabular</Mono> figures so numbers stay aligned.
            </>,
            "The pill is reused unchanged inside tables, lists and the Release Card.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
