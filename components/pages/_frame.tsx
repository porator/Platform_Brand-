"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ExampleSidebar } from "@/components/navigation/_shared";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { TopBar } from "@/components/navigation/top-bar";
import { ProjectSelector } from "@/components/product/project-selector";
import { EnvironmentSelector } from "@/components/product/environment-selector";
import { ResourceNav, RESOURCES, type Resource } from "@/components/product/resource-navigation";
import { PROJECTS, ENVIRONMENTS } from "@/components/product/_data";
import { IconBrush } from "@/lib/icons";

/**
 * The canonical project-level resource set, shared by every project-scoped page
 * so the resource navigation is identical across Overview / Builds / Testers /
 * Releases / Editor / Settings. (RESOURCES is overview, builds, testers,
 * releases, settings — Editor is inserted before Settings.)
 */
export const PAGE_RESOURCES: Resource[] = [
  RESOURCES[0], // Overview
  RESOURCES[1], // Builds
  RESOURCES[2], // Testers
  RESOURCES[3], // Releases
  { id: "editor", label: "Editor", icon: IconBrush },
  RESOURCES[4], // Settings
];

/** A page content section with an h2 heading (keeps the heading outline valid). */
export function Subsection({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * The single application frame every Page composes. It expresses the navigation
 * model consistently:
 *
 *   Global Sidebar  → Company / Organization   (ExampleSidebar, company-level)
 *   Context bar     → Project + Environment     (ProjectSelector + EnvironmentSelector)
 *   Breadcrumb      → Orientation (full path)   (Breadcrumbs)
 *   Resource strip  → Resource                  (ResourceNav, horizontal — not a 2nd sidebar)
 *   Header + body   → Page content
 *
 * Company-level pages (Dashboard, Projects) omit the project/environment context
 * and the resource strip — you are not inside a project yet.
 */
export function AppFrame({
  sidebarActive,
  companyLevel = false,
  resource,
  resourceItems = PAGE_RESOURCES,
  onResourceChange,
  pageName,
  title,
  description,
  actions,
  children,
  contentClassName,
}: {
  /** Which company-level sidebar item is active. */
  sidebarActive?: string;
  /** Company-level pages hide project/environment context and the resource strip. */
  companyLevel?: boolean;
  /** The active resource id (project-level pages). */
  resource?: string;
  resourceItems?: Resource[];
  onResourceChange?: (id: string) => void;
  /** Breadcrumb leaf for company-level pages (e.g. "Dashboard"). */
  pageName?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const [projectId, setProjectId] = React.useState("alpha");
  const [environmentId, setEnvironmentId] = React.useState("production");

  const project = PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0];
  const environment = ENVIRONMENTS.find((e) => e.id === environmentId) ?? ENVIRONMENTS[0];
  const activeResource = resourceItems.find((r) => r.id === resource);

  const trail = companyLevel
    ? ["Appcharge", pageName ?? String(title)]
    : [
        "Appcharge",
        project.name,
        environment.name,
        ...(activeResource ? [activeResource.label] : []),
      ];

  return (
    <SidebarProvider>
      <ExampleSidebar
        collapsible="icon"
        showProjects={false}
        active={{ top: sidebarActive }}
      />
      <SidebarInset className="min-w-0">
        <TopBar
          left={
            <>
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm font-semibold">Appcharge</span>
            </>
          }
        />

        {/* Context + orientation bar */}
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Breadcrumbs label={`Location: ${trail.join(" / ")}`} trail={trail} />
          {companyLevel ? null : (
            <div className="flex flex-wrap items-center gap-2.5">
              <ProjectSelector
                value={projectId}
                onValueChange={setProjectId}
                className="h-10 w-full sm:w-56"
              />
              <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
              <EnvironmentSelector
                value={environmentId}
                onValueChange={setEnvironmentId}
                className="h-10"
              />
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          {/* Page header */}
          <header className="px-4 pt-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                {description ? (
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          </header>

          {/* Resource strip (project-level only) */}
          {companyLevel || !resource ? null : (
            <div className="mt-4 border-b border-border px-2 sm:px-4">
              <ResourceNav
                orientation="horizontal"
                value={resource}
                onValueChange={onResourceChange}
                items={resourceItems}
              />
            </div>
          )}

          {/* Body */}
          <div className={cn("px-4 py-6 sm:px-6", contentClassName)}>{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
