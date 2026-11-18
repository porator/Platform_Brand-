"use client";

import * as React from "react";
import { IconBolt, IconPlus, IconBell } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { PageShell, PageHeader, Section, A11yList } from "@/components/atoms/_kit";
import { ProjectSelector } from "./project-selector";
import { EnvironmentSelector } from "./environment-selector";
import { ResourceNav, RESOURCES } from "./resource-navigation";
import { ProjectOverview } from "./project-overview";
import { BuildStatus } from "./build-status";
import { ReleaseCard } from "./release-card";
import { TesterList } from "./tester-list";
import { PROJECTS, ENVIRONMENTS, RELEASES } from "./_data";

/** Resource content for the active section — each reuses a Product Component. */
function ResourceContent({ resource }: { resource: string }) {
  switch (resource) {
    case "overview":
      return <ProjectOverview />;
    case "builds":
      return (
        <div className="flex flex-col gap-4">
          <BuildStatus status="Ready" build="Build #1842" version="v2.4.1" timestamp="12m ago" />
          <BuildStatus status="Building" build="Build #1843" version="v2.4.2" timestamp="just now" progress={42} />
          <BuildStatus status="Failed" build="Build #1840" version="v2.3.9" timestamp="1h ago" />
        </div>
      );
    case "testers":
      return <TesterList />;
    case "releases":
      return (
        <div className="flex flex-col gap-3">
          {RELEASES.map((r) => (
            <ReleaseCard key={r.version} release={r} variant="row" />
          ))}
        </div>
      );
    default:
      return (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          <span className="capitalize">{resource}</span> settings for this environment.
        </div>
      );
  }
}

/**
 * The full application shell — the strongest expression of the navigation model.
 * Company (top bar) → Project (selector) → Environment (selector) → Resource
 * (rail) → page, with a breadcrumb that mirrors the same path.
 */
export function ApplicationContext({ className }: { className?: string }) {
  const [projectId, setProjectId] = React.useState("alpha");
  const [environmentId, setEnvironmentId] = React.useState("production");
  const [resourceId, setResourceId] = React.useState("overview");

  const project = PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0];
  const environment = ENVIRONMENTS.find((e) => e.id === environmentId) ?? ENVIRONMENTS[0];
  const resource = RESOURCES.find((r) => r.id === resourceId) ?? RESOURCES[0];

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border border-border bg-background", className)}>
      {/* Company top bar */}
      <header className="flex flex-wrap items-center gap-2.5 border-b border-border px-3 py-2.5 sm:px-4">
        <span className="flex items-center gap-2 pr-1 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <IconBolt className="size-4" />
          </span>
          <span className="hidden sm:inline">Appcharge</span>
        </span>
        <span aria-hidden className="h-6 w-px bg-border" />
        <ProjectSelector value={projectId} onValueChange={setProjectId} />
        <EnvironmentSelector value={environmentId} onValueChange={setEnvironmentId} className="h-11" />
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" aria-label="Notifications">
            <IconBell />
          </Button>
          <Avatar size="sm">
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row">
        {/* Resource rail */}
        <div className="border-b border-border p-3 sm:border-b-0 sm:border-r">
          <ResourceNav value={resourceId} onValueChange={setResourceId} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <Breadcrumbs
            label="Application context"
            trail={[project.name, environment.name, resource.label]}
          />

          <div className="mb-5 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{resource.label}</h2>
            {resource.id === "builds" || resource.id === "releases" ? (
              <Button size="sm">
                <IconPlus /> New {resource.id === "builds" ? "build" : "release"}
              </Button>
            ) : null}
          </div>

          <ResourceContent resource={resourceId} />
        </div>
      </div>
    </div>
  );
}

export function ApplicationContextPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Product Components"
        title="Application Context"
        description={
          <>
            The complete picture — every Product Component working together to express the navigation
            model end to end: Company → Project → Environment → Resource → page. Switch the project,
            environment or resource and the breadcrumb, rail and content stay in sync.
          </>
        }
      />

      <Section
        title="Full shell"
        description="A working application frame. The top bar holds the company and project/environment switchers; the rail is the resource level; the content reflects the active resource."
      >
        <ApplicationContext />
      </Section>

      <Section title="The hierarchy">
        <A11yList
          items={[
            <>
              <strong className="text-foreground">Company</strong> — the top bar (Appcharge + account).
            </>,
            <>
              <strong className="text-foreground">Project</strong> &{" "}
              <strong className="text-foreground">Environment</strong> — the two switchers.
            </>,
            <>
              <strong className="text-foreground">Resource</strong> — the rail (Overview, Builds,
              Testers, Releases, Settings).
            </>,
            "The breadcrumb mirrors the full path so location is never ambiguous.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "A single landmark structure — banner, nav rail and the resource content region.",
            "Every switcher and rail item is keyboard operable with visible focus.",
            "Changing any level updates the breadcrumb and content together.",
            "Reflows to a stacked layout on mobile with the rail scrolling horizontally.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
