"use client";

import * as React from "react";
import {
  IconChevronRight,
  IconInnerShadowTop,
  IconServer,
  IconHammer,
  IconUsers,
  IconRocket,
  IconCircleFilled,
  IconFolderFilled,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

type Icon = React.ComponentType<{ className?: string }>;
type Node = {
  label: string;
  icon?: Icon;
  tone?: string;
  badge?: string | number;
  active?: boolean;
  defaultOpen?: boolean;
  children?: Node[];
};

function TreeItem({ node }: { node: Node }) {
  const hasChildren = !!node.children?.length;

  if (!hasChildren) {
    return (
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
          node.active
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60",
        )}
        aria-current={node.active ? "page" : undefined}
      >
        {node.icon ? <node.icon className={cn("size-4 shrink-0", node.tone ?? "text-muted-foreground")} /> : null}
        <span className="truncate">{node.label}</span>
        {node.badge != null ? (
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">{node.badge}</span>
        ) : null}
      </button>
    );
  }

  return (
    <Collapsible defaultOpen={node.defaultOpen} className="group/col">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-[3px] focus-visible:ring-sidebar-ring">
        <IconChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]/col:rotate-90" />
        {node.icon ? <node.icon className={cn("size-4 shrink-0", node.tone ?? "text-muted-foreground")} /> : null}
        <span className="truncate font-medium">{node.label}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-[1.05rem] mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
          {node.children!.map((child) => (
            <TreeItem key={child.label} node={child} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const RESOURCES = (activeBuilds = false): Node[] => [
  { label: "Builds", icon: IconHammer, badge: 3, active: activeBuilds },
  { label: "Testers", icon: IconUsers },
  { label: "Releases", icon: IconRocket },
];

const TREE: Node = {
  label: "Appcharge",
  icon: IconInnerShadowTop,
  defaultOpen: true,
  children: [
    {
      label: "Project Alpha",
      icon: IconFolderFilled,
      defaultOpen: true,
      children: [
        {
          label: "Production",
          icon: IconServer,
          tone: "text-success",
          defaultOpen: true,
          children: RESOURCES(true),
        },
        { label: "Staging", icon: IconServer, tone: "text-warning", children: RESOURCES() },
      ],
    },
    {
      label: "Project Beta",
      icon: IconFolderFilled,
      children: [{ label: "Production", icon: IconServer, tone: "text-success", children: RESOURCES() }],
    },
  ],
};

export function ProjectHierarchyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Navigation"
        title="Project Hierarchy"
        description={
          <>
            A component-level exploration of the four-level model —{" "}
            <strong className="text-foreground">Organization → Project → Environment → Resource</strong>.
            The goal is to test whether the navigation components can communicate several levels at
            once without losing clarity. This is not the final New Gen Wire architecture.
          </>
        }
      />

      <Section
        title="The tree"
        description="Expand and collapse any level. The active path (Appcharge → Project Alpha → Production → Builds) is highlighted; environments carry a status tone."
      >
        <div className="w-full max-w-xs rounded-md border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
          <TreeItem node={TREE} />
        </div>
      </Section>

      <Section
        title="Reading the levels"
        description="Each depth uses a distinct icon and the indentation guide, so the level is legible without reading labels."
      >
        <div className="flex flex-col gap-2.5 text-sm">
          {[
            ["Organization", <IconInnerShadowTop key="o" className="size-4 text-muted-foreground" />, "The workspace root."],
            ["Project", <IconFolderFilled key="p" className="size-4 text-muted-foreground" />, "A product within the org."],
            ["Environment", <IconCircleFilled key="e" className="size-3 text-success" />, "Production / Staging, with a status tone."],
            ["Resource", <IconHammer key="r" className="size-4 text-muted-foreground" />, "Builds, Testers, Releases — the leaves."],
          ].map(([label, icon, desc]) => (
            <div key={label as string} className="flex items-center gap-3">
              <span className="flex w-6 justify-center">{icon as React.ReactNode}</span>
              <span className="w-28 font-medium text-foreground">{label as string}</span>
              <span className="text-muted-foreground">{desc as string}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "The tree is keyboard operable — each expandable node is a button exposing its open state.",
            "The active leaf is marked aria-current and highlighted, not conveyed by color alone.",
            "Indentation guides and per-level icons make depth legible to sighted users; labels carry the meaning for screen readers.",
          ]}
        />
      </Section>

      <Section
        title="Observations"
        description="What this exploration surfaces about multi-level navigation."
      >
        <A11yList
          items={[
            <>
              Four levels read clearly in a tree up to this depth; beyond ~4 levels the indentation
              eats horizontal space and labels truncate — a <Mono>Breadcrumbs</Mono> + scoped list
              will scale better than pure nesting.
            </>,
            "Environment is the level most in tension: it can live inside the tree (shown here) or be promoted to the Top Bar's environment selector — both are viable and should be decided at the architecture stage.",
            "Collapsing deep branches is essential; an always-expanded tree becomes unscannable quickly.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
