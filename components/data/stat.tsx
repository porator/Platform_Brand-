"use client";

import * as React from "react";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconFolders,
  IconHammer,
  IconUsers,
  IconRocket,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

type Trend = { dir: "up" | "down" | "neutral"; value: string };

function TrendPill({ trend }: { trend: Trend }) {
  const Icon = trend.dir === "up" ? IconTrendingUp : trend.dir === "down" ? IconTrendingDown : IconMinus;
  const tone =
    trend.dir === "up" ? "text-success" : trend.dir === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium tabular-nums", tone)}>
      <Icon className="size-4" aria-hidden />
      {trend.value}
    </span>
  );
}

export function Stat({
  label,
  value,
  supporting,
  trend,
  icon: Icon,
  loading,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  supporting?: React.ReactNode;
  trend?: Trend;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-meta font-medium text-muted-foreground">{label}</span>
        {Icon ? (
          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      {/* 22px: below the 26px page title, so the title leads the page. */}
      <div className="text-stat tabular-nums text-foreground">{value}</div>
      {trend || supporting ? (
        <div className="flex items-center gap-2">
          {trend ? <TrendPill trend={trend} /> : null}
          {supporting ? <span className="text-meta text-muted-foreground">{supporting}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

const METRICS = [
  { label: "Projects", value: "14", icon: IconFolders, trend: { dir: "up", value: "+2" } as Trend, supporting: "this month" },
  { label: "Builds", value: "128", icon: IconHammer, trend: { dir: "up", value: "+12%" } as Trend, supporting: "this month" },
  { label: "Testers", value: "312", icon: IconUsers, trend: { dir: "down", value: "-4%" } as Trend, supporting: "vs last month" },
  { label: "Releases", value: "6", icon: IconRocket, trend: { dir: "neutral", value: "0%" } as Trend, supporting: "this month" },
];

export function StatPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Data Display"
        title="Stat"
        description={
          <>
            A single key metric — a label, a prominent value, and optional supporting text, trend and
            icon. Compose several in a grid for a dashboard summary. Generic: pass any numbers.
          </>
        }
      />

      <Section title="Basic usage" description="Label, value and supporting text.">
        <Stat label="Builds" value="128" trend={{ dir: "up", value: "+12%" }} supporting="this month" />
      </Section>

      <Section
        title="Metric grid"
        description="The common dashboard pattern — one stat per card, reflowing from 1 to 4 columns."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <Card key={m.label} size="sm" className="px-5">
              <Stat label={m.label} value={m.value} icon={m.icon} trend={m.trend} supporting={m.supporting} />
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Trends"
        description="Positive, negative and neutral trends use the success / destructive / muted tokens, always paired with a direction arrow."
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Stat label="Successful builds" value="94%" trend={{ dir: "up", value: "+6%" }} supporting="this week" />
          <Stat label="Failed builds" value="6%" trend={{ dir: "down", value: "-2%" }} supporting="this week" />
          <Stat label="Avg. build time" value="4m 12s" trend={{ dir: "neutral", value: "0%" }} supporting="stable" />
        </div>
      </Section>

      <Section title="Loading" description="A skeleton placeholder while the metric loads.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <Card key={m.label} size="sm" className="px-5">
              <Stat label={m.label} loading />
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "The label and value are read together; the number stays legible with tabular figures.",
            <>
              Trend direction is shown with an arrow and sign (<Mono>+12%</Mono> / <Mono>-4%</Mono>),
              not color alone.
            </>,
            "Trend colors (success / destructive) meet AA contrast in light and dark.",
            "Loading skeletons are decorative and announce nothing misleading.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
