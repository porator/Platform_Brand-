"use client";

import * as React from "react";
import {
  IconLayoutDashboard,
  IconFolders,
  IconUsers,
  IconSettings,
  IconRocket,
  IconHammer,
  IconChevronRight,
  IconSelector,
  IconLogout,
  IconUserCircle,
  IconInnerShadowTop,
  IconFolderFilled,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* -------------------------------------------------------------------------- */
/*  A transform-contained frame so a fixed-position Sidebar renders INSIDE the */
/*  demo box (not the whole Storybook viewport).                               */
/* -------------------------------------------------------------------------- */
export function DemoFrame({
  children,
  height = 520,
  className,
}: {
  children: React.ReactNode;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border border-border [transform:translateZ(0)]",
        className,
      )}
      style={{ height }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Example data — realistic Appcharge content, passed in (never hardcoded     */
/*  inside the generic Sidebar primitive).                                     */
/* -------------------------------------------------------------------------- */
export type Leaf = { title: string; badge?: string | number };
export type Project = { name: string; items: Leaf[] };

export const PLATFORM_NAV: { title: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
  { title: "Dashboard", icon: IconLayoutDashboard },
  { title: "Projects", icon: IconFolders },
  { title: "Testers", icon: IconUsers, badge: 12 },
  { title: "Releases", icon: IconRocket },
];

export const PROJECTS: Project[] = [
  { name: "Project Alpha", items: [{ title: "Overview" }, { title: "Builds", badge: 3 }, { title: "Testers" }, { title: "Releases" }] },
  { name: "Project Beta", items: [{ title: "Overview" }, { title: "Builds" }, { title: "Testers" }, { title: "Releases" }] },
];

/* -------------------------------------------------------------------------- */
/*  Reusable example sidebar composition (uses the generic Sidebar primitive). */
/* -------------------------------------------------------------------------- */
export function ExampleSidebar({
  collapsible = "icon",
  active = { project: "Project Alpha", leaf: "Builds" },
  showProjects = true,
}: {
  collapsible?: "icon" | "offcanvas" | "none";
  active?: { project?: string; leaf?: string; top?: string };
  showProjects?: boolean;
}) {
  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Appcharge" className="gap-2.5">
              <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <IconInnerShadowTop className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">Appcharge</span>
                <span className="truncate text-xs text-sidebar-foreground/70">Workspace</span>
              </div>
              <IconSelector className="ml-auto text-sidebar-foreground/70" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {PLATFORM_NAV.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={active?.top === item.title}
                  render={<a href={`#${item.title.toLowerCase()}`} />}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {item.badge != null ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings (unavailable)" aria-disabled className="cursor-not-allowed">
                <IconSettings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {showProjects ? (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {PROJECTS.map((project) => (
                <Collapsible
                  key={project.name}
                  defaultOpen={project.name === active?.project}
                  className="group/collapsible"
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={<SidebarMenuButton tooltip={project.name} />}
                  >
                    <IconFolderFilled />
                    <span>{project.name}</span>
                    <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {project.items.map((leaf) => (
                        <SidebarMenuSubItem key={leaf.title}>
                          <SidebarMenuSubButton
                            isActive={active?.project === project.name && active?.leaf === leaf.title}
                            render={<a href={`#${project.name}-${leaf.title}`.toLowerCase().replace(/\s+/g, "-")} />}
                          >
                            <span>{leaf.title}</span>
                          </SidebarMenuSubButton>
                          {leaf.badge != null ? <SidebarMenuBadge>{leaf.badge}</SidebarMenuBadge> : null}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" tooltip="Pat Rivera" className="gap-2.5" />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback>PR</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">Pat Rivera</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">pat@appcharge.com</span>
                </div>
                <IconSelector className="ml-auto text-sidebar-foreground/70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>Pat Rivera</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconSettings />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <IconLogout />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export { IconHammer };
