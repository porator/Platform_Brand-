"use client";

import * as React from "react";
import { IconPlus } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";
import { ProjectSelector } from "./project-selector";
import { EnvironmentSelector } from "./environment-selector";
import { PROJECTS, ENVIRONMENTS } from "./_data";

/**
 * The header that establishes *where you are* in the hierarchy:
 * Company → Project → Environment → Resource. It composes the Breadcrumb,
 * Project Selector and Environment Selector with a page title block.
 */
export function ProjectContextHeader({
  projectId,
  onProjectChange,
  environmentId,
  onEnvironmentChange,
  resource,
  title,
  description,
  actions,
  className,
}: {
  projectId: string;
  onProjectChange?: (id: string) => void;
  environmentId: string;
  onEnvironmentChange?: (id: string) => void;
  resource?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const project = PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0];
  const environment = ENVIRONMENTS.find((e) => e.id === environmentId) ?? ENVIRONMENTS[0];

  const trail = ["Appcharge", project.name, environment.name, ...(resource ? [resource] : [])];

  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-5", className)}>
      {/* Breadcrumb: Company → Project → Environment → Resource */}
      <Breadcrumbs label={`Context: ${trail.join(" / ")}`} trail={trail} />

      {/* Context switchers: Project + Environment */}
      <div className="flex flex-wrap items-center gap-2.5">
        <ProjectSelector value={projectId} onValueChange={onProjectChange} />
        <span aria-hidden className="h-6 w-px bg-border" />
        <EnvironmentSelector value={environmentId} onValueChange={onEnvironmentChange} className="h-11" />
      </div>

      {/* Title + description + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function ProjectContextHeaderPage() {
  const [projectId, setProjectId] = React.useState("alpha");
  const [environmentId, setEnvironmentId] = React.useState("production");

  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Product Components"
        title="Project Context Header"
        description={
          <>
            Anchors every project page in the hierarchy — Company → Project → Environment → Resource.
            It composes the Breadcrumb, Project Selector and Environment Selector with a page title,
            description and actions. Switching project or environment is live.
          </>
        }
      />

      <Section
        title="Default"
        description="A resource page header. The breadcrumb, selectors and title all reflect the current project and environment."
      >
        <ProjectContextHeader
          projectId={projectId}
          onProjectChange={setProjectId}
          environmentId={environmentId}
          onEnvironmentChange={setEnvironmentId}
          resource="Builds"
          title="Builds"
          description="Compile, track and promote builds across environments."
          actions={
            <Button size="sm">
              <IconPlus /> New build
            </Button>
          }
        />
      </Section>

      <Section
        title="Environment-level (no resource)"
        description="When viewing the environment overview, the environment is the current page and no resource segment is shown."
      >
        <ProjectContextHeader
          projectId={projectId}
          onProjectChange={setProjectId}
          environmentId={environmentId}
          onEnvironmentChange={setEnvironmentId}
          title="Overview"
          description="A snapshot of this environment — builds, releases and testers."
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The breadcrumb is a labelled <Mono>nav</Mono>; the current page uses{" "}
              <Mono>aria-current</Mono>.
            </>,
            "Project and environment switchers are labelled and fully keyboard operable.",
            "The page title is a single h1; actions are reachable and labelled.",
            "Layout reflows to a single column on mobile without hiding the context.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
