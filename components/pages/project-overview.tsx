"use client";

import * as React from "react";
import {
  IconHammer,
  IconRocket,
  IconUsers,
  IconActivity,
  IconArrowRight,
  IconPlus,
} from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/data/stat";
import { BuildStatus } from "@/components/product/build-status";
import { ReleaseCard } from "@/components/product/release-card";
import { TesterList } from "@/components/product/tester-list";
import { SearchAndFilter } from "@/components/patterns/search-filter";
import { SettingsPanel } from "@/components/patterns/settings";
import { AppPreview } from "@/components/product/app-preview";
import { RELEASES, TESTERS } from "@/components/product/_data";
import { AppFrame, Subsection } from "./_frame";

const METRICS = [
  { label: "Builds", value: "128", icon: IconHammer, trend: { dir: "up" as const, value: "+12%" }, supporting: "this month" },
  { label: "Releases", value: "6", icon: IconRocket, trend: { dir: "neutral" as const, value: "0%" }, supporting: "this month" },
  { label: "Active testers", value: "312", icon: IconUsers, trend: { dir: "up" as const, value: "+8%" }, supporting: "vs last month" },
  { label: "Uptime", value: "99.9%", icon: IconActivity, trend: { dir: "up" as const, value: "+0.1%" }, supporting: "30 days" },
];

function Overview() {
  const activeTesters = TESTERS.filter((t) => t.status === "Active").length;
  return (
    <div className="flex flex-col gap-8">
      <Subsection title="Key metrics">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {METRICS.map((m) => (
            <Card key={m.label} className="p-4">
              <Stat {...m} />
            </Card>
          ))}
        </div>
      </Subsection>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Subsection
          title="Latest build"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm">
              All builds <IconArrowRight />
            </Button>
          }
        >
          <Card className="p-4">
            <BuildStatus status="Ready" build="Build #1842" version="v2.4.1" timestamp="12m ago" />
            <p className="mt-3 text-sm text-muted-foreground">
              Promoted to <span className="text-foreground">Production</span> after passing all checks.
            </p>
          </Card>
        </Subsection>

        <Subsection
          title="Latest release"
          className="lg:col-span-3"
          action={
            <Button variant="ghost" size="sm">
              All releases <IconArrowRight />
            </Button>
          }
        >
          <ReleaseCard release={RELEASES[0]} />
        </Subsection>
      </div>

      <Subsection
        title="Testers"
        action={
          <Button variant="ghost" size="sm">
            Manage testers <IconArrowRight />
          </Button>
        }
      >
        <Card className="flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
          <div>
            <div className="text-2xl font-semibold tabular-nums text-foreground">{TESTERS.length}</div>
            <div className="text-sm text-muted-foreground">Total testers</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums text-foreground">{activeTesters}</div>
            <div className="text-sm text-muted-foreground">Active now</div>
          </div>
          <div className="ml-auto flex -space-x-2">
            {TESTERS.slice(0, 4).map((t) => (
              <span
                key={t.email}
                className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-foreground"
              >
                {t.initials}
              </span>
            ))}
          </div>
        </Card>
      </Subsection>
    </div>
  );
}

function ResourceBody({ resource }: { resource: string }) {
  switch (resource) {
    case "overview":
      return <Overview />;
    case "builds":
      return (
        <Subsection title="Builds">
          <SearchAndFilter />
        </Subsection>
      );
    case "testers":
      return (
        <Subsection title="Testers">
          <TesterList />
        </Subsection>
      );
    case "releases":
      return (
        <Subsection title="Releases">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {RELEASES.map((r) => (
              <ReleaseCard key={r.version} release={r} />
            ))}
          </div>
        </Subsection>
      );
    case "editor":
      return (
        <Subsection title="Editor">
          <AppPreview environment="Production" />
        </Subsection>
      );
    default:
      return (
        <Subsection title="Settings">
          <SettingsPanel />
        </Subsection>
      );
  }
}

export function ProjectOverviewPage() {
  const [resource, setResource] = React.useState("overview");
  return (
    <AppFrame
      sidebarActive="Projects"
      resource={resource}
      onResourceChange={setResource}
      title="Project Alpha"
      description="Appcharge → Project Alpha → Production. Switch the resource below — the breadcrumb and content follow."
      actions={
        <Button size="sm">
          <IconPlus /> New build
        </Button>
      }
    >
      <ResourceBody resource={resource} />
    </AppFrame>
  );
}
