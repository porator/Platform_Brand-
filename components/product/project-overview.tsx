"use client";

import * as React from "react";
import {
  IconHammer,
  IconRocket,
  IconUsers,
  IconActivity,
  IconArrowRight,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/data/stat";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";
import { BuildStatus } from "./build-status";
import { ReleaseCard } from "./release-card";
import { RELEASES } from "./_data";

/** A section heading used inside the overview grid. */
function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-md border border-border p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

const METRICS = [
  { label: "Builds", value: "128", icon: IconHammer, trend: { dir: "up" as const, value: "+12%" }, supporting: "this month" },
  { label: "Releases", value: "6", icon: IconRocket, trend: { dir: "neutral" as const, value: "0%" }, supporting: "this month" },
  { label: "Active testers", value: "312", icon: IconUsers, trend: { dir: "up" as const, value: "+8%" }, supporting: "vs last month" },
  { label: "Uptime", value: "99.9%", icon: IconActivity, trend: { dir: "up" as const, value: "+0.1%" }, supporting: "30 days" },
];

export function ProjectOverview({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="p-4">
            <Stat {...m} />
          </Card>
        ))}
      </div>

      {/* Two-column: latest build + recent releases */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Panel
          title="Latest build"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm">
              All builds <IconArrowRight />
            </Button>
          }
        >
          <BuildStatus status="Ready" build="Build #1842" version="v2.4.1" timestamp="12m ago" />
          <p className="text-sm text-muted-foreground">
            Promoted to <span className="text-foreground">Production</span> after passing all checks.
          </p>
        </Panel>

        <Panel
          title="Recent releases"
          className="lg:col-span-3"
          action={
            <Button variant="ghost" size="sm">
              All releases <IconArrowRight />
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            {RELEASES.map((r) => (
              <ReleaseCard key={r.version} release={r} variant="row" />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function ProjectOverviewPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Product Components"
        title="Project Overview"
        description={
          <>
            A composition, not a new primitive — the environment dashboard assembled entirely from
            existing pieces: Stat and Card for metrics, Build Status for the latest build, and Release
            Card rows for recent releases. This is how the layer is meant to be used.
          </>
        }
      />

      <Section
        title="Default"
        description="The overview for Project Alpha · Production — metrics, the latest build and recent releases."
      >
        <ProjectOverview />
      </Section>

      <Section title="Composition">
        <A11yList
          items={[
            <>
              Metrics reuse <Mono>Stat</Mono> inside <Mono>Card</Mono>; nothing is restyled.
            </>,
            <>
              The latest build uses <Mono>BuildStatus</Mono>; releases use <Mono>ReleaseCard</Mono>{" "}
              rows.
            </>,
            "Panels reflow from four columns to two to one as width shrinks.",
            "No arbitrary colors, spacing or typography — only tokens and existing components.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Each panel has a heading; metrics expose label, value and trend as text.",
            "Trends pair an arrow icon with a value — never color alone.",
            "All actions are reachable, labelled Buttons.",
            "Inherits the AA-compliant status tokens from the composed components.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
