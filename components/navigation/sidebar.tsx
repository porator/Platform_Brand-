"use client";

import * as React from "react";
import {
  IconLayoutDashboard,
  IconFolders,
  IconUsers,
  IconRocket,
  IconSettings,
  IconInnerShadowTop,
} from "@/lib/icons";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";
import { DemoFrame, ExampleSidebar } from "./_shared";

function Shell({
  children,
  title = "Builds",
}: {
  children?: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <SidebarTrigger />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </header>
      <div className="flex-1 overflow-auto p-5 text-sm text-muted-foreground">
        {children ?? "Page content"}
      </div>
    </div>
  );
}

function SidebarDemo({
  collapsible = "icon",
  defaultOpen = true,
  active,
  showProjects = true,
  height = 520,
  title,
}: {
  collapsible?: "icon" | "offcanvas" | "none";
  defaultOpen?: boolean;
  active?: { project?: string; leaf?: string; top?: string };
  showProjects?: boolean;
  height?: number;
  title?: string;
}) {
  return (
    <DemoFrame height={height}>
      <SidebarProvider defaultOpen={defaultOpen} className="min-h-0 h-full">
        <ExampleSidebar collapsible={collapsible} active={active} showProjects={showProjects} />
        <Shell title={title} />
      </SidebarProvider>
    </DemoFrame>
  );
}

/** A static icon rail — demonstrates the collapsed appearance at any width. */
function CollapsedRailDemo() {
  const items = [
    { title: "Dashboard", icon: IconLayoutDashboard, active: true },
    { title: "Projects", icon: IconFolders },
    { title: "Testers", icon: IconUsers },
    { title: "Releases", icon: IconRocket },
    { title: "Settings", icon: IconSettings },
  ];
  return (
    <DemoFrame height={340}>
      <SidebarProvider className="min-h-0 h-full">
        <Sidebar collapsible="none" className="w-14 shrink-0 border-r border-sidebar-border">
          <SidebarContent className="items-center py-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <IconInnerShadowTop className="size-4" />
            </div>
            <SidebarMenu className="mt-2 items-center gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <SidebarMenuButton
                          isActive={item.active}
                          aria-label={item.title}
                          className="size-8 justify-center p-0"
                          render={<a href={`#${item.title}`} />}
                        />
                      }
                    >
                      <item.icon />
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-center border-b border-border px-4 text-sm font-medium text-foreground">
            Dashboard
          </div>
          <div className="flex-1 p-5 text-sm text-muted-foreground">
            Hover a rail icon to reveal its label as a tooltip.
          </div>
        </div>
      </SidebarProvider>
    </DemoFrame>
  );
}

/** A minimal flat sidebar for the "simple" example. */
function SimpleSidebar() {
  const items = [
    { title: "Dashboard", icon: IconLayoutDashboard, active: true },
    { title: "Projects", icon: IconFolders },
    { title: "Testers", icon: IconUsers },
    { title: "Releases", icon: IconRocket },
  ];
  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton isActive={item.active} render={<a href={`#${item.title}`} />}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function SidebarPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Navigation"
        title="Sidebar"
        description={
          <>
            The primary navigation surface — built on the shadcn <Mono>Sidebar</Mono> system. It is
            persistent on desktop, collapses to an icon rail, and becomes a drawer on mobile. It
            carries the product hierarchy: workspace → projects → environments → pages.
          </>
        }
      />

      <Section
        title="Basic usage"
        description="A flat list of destinations with icons and an active item."
      >
        <DemoFrame height={340}>
          <SidebarProvider className="min-h-0 h-full">
            <SimpleSidebar />
            <Shell title="Dashboard" />
          </SidebarProvider>
        </DemoFrame>
      </Section>

      <Section
        title="Nested navigation & project hierarchy"
        description="Expandable project sections reveal their pages (Overview · Builds · Testers · Releases). The active page is highlighted; counts appear as badges. This is the central New Gen Wire pattern."
      >
        <SidebarDemo collapsible="none" active={{ project: "Project Alpha", leaf: "Builds" }} />
      </Section>

      <Section
        title="Collapsed (icon rail)"
        description="Collapsed, labels give way to icons; hover any item to reveal its label as a tooltip. The active state stays visible and nothing becomes unreachable. The live collapse toggle is demonstrated in Navigation → Full Application Shell."
      >
        <CollapsedRailDemo />
      </Section>

      <Section
        title="States"
        description="Active, inactive, disabled, badges and tooltips — all shown together in the hierarchy above. Settings is disabled (aria-disabled); Testers and Builds carry count badges."
      >
        <SidebarDemo collapsible="none" active={{ project: "Project Alpha", leaf: "Overview" }} height={520} />
      </Section>

      <Section
        title="Responsive & mobile"
        description="On viewports below the md breakpoint the sidebar is not shrunk — it becomes an off-canvas drawer opened by the trigger, with a backdrop and focus trapping. See Navigation → Full Application Shell at a mobile viewport."
      >
        <A11yList
          items={[
            "Desktop: a persistent rail that toggles between full and icon-only.",
            "Mobile: a drawer (Sheet) over a dimmed backdrop, dismissed with Esc or a tap outside.",
            "The collapse state persists so the layout is stable across navigation.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The sidebar is a <Mono>&lt;nav&gt;</Mono> landmark; the active page is marked with{" "}
              <Mono>aria-current</Mono>.
            </>,
            "Fully keyboard operable — Tab through items, Enter to activate, the trigger toggles collapse.",
            "In the collapsed rail, labels are exposed as accessible tooltips on focus and hover.",
            "Expandable sections expose their open/closed state; disabled items are aria-disabled.",
            "The mobile drawer traps focus and restores it to the trigger on close.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
