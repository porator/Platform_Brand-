"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconChevronLeft, IconSettings } from "@/lib/icons";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { SettingsNavSection, NAV_STYLE, TOOLTIP_LIGHT } from "@/components/dashboard/sidebar";
import { RouteTransition } from "@/components/dashboard/route-transition";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { AppchargeLogo, CompanyLogo } from "@/components/dashboard/logo";
import { useFolderTree } from "@/components/dashboard/providers";
import { findTrail, isProjectId } from "@/lib/folders";
import {
  companyHref,
  getClient,
  settingsHref,
  storeHref,
  firstStoreSection,
  SETTINGS_TREES,
  ADMIN_TREE,
  type ClientConfig,
  type NavNode,
  type Project,
} from "@/lib/newgen";

/** Settings for a company with no project yet: organization-level only. Module management, Projects Sync and the
 *  Developer settings belong to a project, so they appear once one exists. */
const ORG_SETTINGS_TREES: NavNode[] = [
  { ...ADMIN_TREE, id: "organization", label: "Organization", children: (ADMIN_TREE.children ?? []).filter((c) => c.id === "admin-general" || c.id === "admin-users") },
];

/** The first project that really exists in the company's tree. Sample projects that Create project would make
 *  ("pending") don't count until the user creates them. */
function useExistingProject(client: ClientConfig): Project | undefined {
  const { root } = useFolderTree(client);
  const exists = (p: Project) => !!findTrail(root, isProjectId(p.id));
  const preferred = client.projects.find((p) => p.id === client.defaultProjectId);
  return preferred && exists(preferred) ? preferred : client.projects.find(exists);
}

/** Shopify-style mini rail: the dashboard categories as icons on the far left,
 *  so the main nav stays reachable while inside Settings. Settings + the company
 *  mark sit pinned at the bottom. */
function MiniRail({ client, project, onFlyoutHover }: { client: ClientConfig; project?: Project; onFlyoutHover: (hovered: boolean) => void }) {
  // One level up from Settings: the project's Webstore sections, as icons. None until a project exists.
  const webstore = project?.productGroups.find((g) => g.id === "webstore")?.items ?? [];
  const iconBtn =
    "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground";
  return (
    <TooltipProvider delay={120} closeDelay={80}>
      <div className="relative z-20 flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-3">
        <Link href="/dashboard" aria-label="Appcharge home" className="mb-2 flex size-9 items-center justify-center">
          <AppchargeLogo className="size-7" />
        </Link>
        {/* Webstore sections — reachable as icons while inside Settings. */}
        {webstore.map((it) => {
          // Shopify-style: an item with sub-items reveals a flyout of them on hover.
          if (it.children?.length) {
            return (
              <div
                key={it.id}
                className="group/fly relative"
                onMouseEnter={() => onFlyoutHover(true)}
                onMouseLeave={() => onFlyoutHover(false)}
              >
                <Link href={storeHref(project!.id, it.children[0].id)} aria-label={it.label} className={iconBtn}>
                  <it.icon className="size-4" />
                </Link>
                <div className="invisible absolute top-0 left-full z-50 pl-2 opacity-0 transition-opacity duration-100 group-hover/fly:visible group-hover/fly:opacity-100 motion-reduce:transition-none">
                  <div className="min-w-44 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg">
                    <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground">{it.label}</p>
                    {it.children.map((c) => (
                      <Link
                        key={c.id}
                        href={storeHref(project!.id, c.id)}
                        className="block rounded-md px-2 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-sidebar-accent"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          return it.soon ? (
            <Tooltip key={it.id}>
              <TooltipTrigger render={<span className={`${iconBtn} cursor-default opacity-50`} />}>
                <it.icon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right" className={TOOLTIP_LIGHT}>{it.label} · Soon</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip key={it.id}>
              <TooltipTrigger
                render={<Link href={storeHref(project!.id, it.id)} aria-label={it.label} className={iconBtn} />}
              >
                <it.icon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right" className={TOOLTIP_LIGHT}>{it.label}</TooltipContent>
            </Tooltip>
          );
        })}
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger
            render={<Link href={settingsHref("admin-general", client.id)} aria-label="Settings" className={`${iconBtn} bg-sidebar-accent/50 text-foreground`} />}
          >
            <IconSettings className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="right" className={TOOLTIP_LIGHT}>Settings</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<span className="flex size-9 items-center justify-center" />}>
            <CompanyLogo clientId={client.id} className="size-6 rounded-[5px]" />
          </TooltipTrigger>
          <TooltipContent side="right" className={TOOLTIP_LIGHT}>{client.company.name}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * The settings area — a Shopify-style layout: a mini rail of dashboard
 * categories, a settings nav pane, and the content. The nav header reads
 * "Settings" and reveals a back affordance on hover.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const client = getClient(searchParams.get("client"));
  const section = pathname.replace(/^\/dashboard\/settings\/?/, "").split("/")[0] || "admin-general";
  // Back returns to the studio (Store) level, not the dashboard home; with no project yet, to the company's Home.
  const project = useExistingProject(client);
  const backHref = project ? storeHref(project.id, firstStoreSection(project) ?? "ws-studio") : companyHref(client.id, "home");
  const trees = project ? SETTINGS_TREES : ORG_SETTINGS_TREES;
  const hrefFor = (id: string) => settingsHref(id, client.id);
  // Dim everything but the rail while a mini-rail flyout is open, so its
  // sub-menu stands out (Shopify-style).
  const [dim, setDim] = React.useState(false);
  const dimClass = dim ? "opacity-30" : "opacity-100";

  return (
    <SidebarProvider className="bg-sidebar">
      <MiniRail client={client} project={project} onFlyoutHover={setDim} />

      <aside className={`flex w-60 shrink-0 flex-col bg-sidebar transition-opacity duration-150 ${dimClass} animate-in fade-in-0 slide-in-from-left-2 duration-200 ease-out motion-reduce:animate-none ${NAV_STYLE}`}>
        {/* "Settings" title that reveals a back affordance on hover. */}
        <div className="p-2">
          <Link
            href={backHref}
            title="Back to dashboard"
            className="group/back flex h-10 w-fit items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-foreground"
          >
            <IconChevronLeft className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover/back:-translate-x-0.5" />
            {/* Rolls between "Settings" and "Back" on hover, in the same position. */}
            <span className="grid overflow-hidden leading-5">
              <span className="col-start-1 row-start-1 transition duration-200 group-hover/back:-translate-y-full group-hover/back:opacity-0 motion-reduce:transition-none">
                Settings
              </span>
              <span className="col-start-1 row-start-1 translate-y-full opacity-0 transition duration-200 group-hover/back:translate-y-0 group-hover/back:opacity-100 motion-reduce:transition-none">
                Back
              </span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto pb-4">
          {trees.map((node) => (
            <SettingsNavSection key={node.id} node={node} activeId={section} hrefFor={hrefFor} />
          ))}
        </nav>
        {/* Account — pinned at the bottom, same position as the main sidebar. */}
        <div className="p-2">
          <AccountMenu variant="full" />
        </div>
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-2xl bg-background transition-opacity duration-150 ${dimClass}`}>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-6">
          <span className="text-sm text-muted-foreground">{client.company.name}</span>
        </header>
        <main className="flex-1 overflow-auto px-6 py-8">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </SidebarProvider>
  );
}
