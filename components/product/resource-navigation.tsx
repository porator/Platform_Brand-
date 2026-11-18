"use client";

import * as React from "react";
import {
  IconLayoutDashboard,
  IconHammer,
  IconUsers,
  IconRocket,
  IconSettings,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

export type Resource = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
};

export const RESOURCES: Resource[] = [
  { id: "overview", label: "Overview", icon: IconLayoutDashboard },
  { id: "builds", label: "Builds", icon: IconHammer, count: 12 },
  { id: "testers", label: "Testers", icon: IconUsers, count: 24 },
  { id: "releases", label: "Releases", icon: IconRocket, count: 3 },
  { id: "settings", label: "Settings", icon: IconSettings },
];

export function ResourceNav({
  value,
  onValueChange,
  items = RESOURCES,
  ariaLabel = "Project resources",
  orientation = "vertical",
  className,
}: {
  value: string;
  onValueChange?: (id: string) => void;
  items?: Resource[];
  ariaLabel?: string;
  /** "vertical" is a rail (default); "horizontal" is a scrollable tab-style strip. */
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const horizontal = orientation === "horizontal";
  return (
    <nav aria-label={ariaLabel} className={cn("w-full", className)}>
      <ul
        className={cn(
          "flex gap-1 overflow-x-auto",
          horizontal ? "flex-row" : "sm:w-56 sm:flex-col",
        )}
      >
        {items.map((item) => {
          const active = item.id === value;
          return (
            <li key={item.id} className={cn(horizontal ? "shrink-0" : "shrink-0 sm:shrink")}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onValueChange?.(item.id);
                }}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className={horizontal ? undefined : "flex-1"}>{item.label}</span>
                {item.count != null ? (
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      horizontal ? "" : "ml-auto",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ResourceNavigationPage() {
  const [resource, setResource] = React.useState("builds");
  return (
    <PageShell>
      <PageHeader
        eyebrow="Product Components"
        title="Resource Navigation"
        description={
          <>
            Contextual navigation <em>within</em> a project/environment — Overview, Builds, Testers,
            Releases, Settings. This is <strong className="text-foreground">not</strong> a second
            global sidebar; it&apos;s the resource level of the hierarchy, scoped to the current
            environment.
          </>
        }
      />

      <Section
        title="Default"
        description="Resources with optional counts; the active one is highlighted. On mobile it becomes a horizontally scrollable row."
      >
        <div className="rounded-md border border-border p-3 sm:w-fit">
          <div className="mb-3 px-3 pt-1">
            <p className="text-sm font-medium text-foreground">Project Alpha</p>
            <p className="text-xs text-muted-foreground">Production</p>
          </div>
          <ResourceNav value={resource} onValueChange={setResource} />
        </div>
      </Section>

      <Section
        title="In a split layout"
        description="The typical placement — a narrow resource rail beside the resource content."
      >
        <div className="flex flex-col gap-4 rounded-md border border-border p-4 sm:flex-row">
          <ResourceNav
            value={resource}
            onValueChange={setResource}
            ariaLabel="Project resources (split layout example)"
            className="sm:border-r sm:border-border sm:pr-4"
          />
          <div className="min-h-40 flex-1 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            <span className="capitalize">{resource}</span> content for Project Alpha · Production.
          </div>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              A labelled <Mono>nav</Mono> landmark; the active resource uses{" "}
              <Mono>aria-current=&quot;page&quot;</Mono>.
            </>,
            "Keyboard reachable with visible focus; counts are text, not color-coded.",
            "On mobile it scrolls horizontally rather than collapsing items out of reach.",
            "Distinct from the global Sidebar — this is scoped to the current project & environment.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
