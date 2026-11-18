"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconChevronLeft, IconSettings, IconCircleFilled, IconBuildingStore } from "@/lib/icons";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { NavGroup, NAV_STYLE, TOOLTIP_LIGHT } from "@/components/dashboard/sidebar";
import { EnvironmentSelector, StoreSwitcher } from "@/components/dashboard/switchers";
import { RouteTransition } from "@/components/dashboard/route-transition";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { AppchargeLogo, CompanyLogo } from "@/components/dashboard/logo";
import { useWireframe, useSandboxes } from "@/components/dashboard/providers";
import {
  clientForProject,
  getProject,
  projectHref,
  storeHref,
  settingsHref,
  firstStoreSection,
  flattenNodes,
  projectDisplayLabel,
  WORKSPACE_NAV,
  FINANCE_NAV,
  DEFAULT_ENV_ID,
  type Project,
  type ClientConfig,
} from "@/lib/newgen";

/** Mini rail of dashboard categories, so the main nav stays reachable in Store.
 *  Settings + the company mark sit pinned at the bottom (mirrors the sidebar). */
function MiniRail({
  client,
  project,
  buildGameHref,
  onFlyoutHover,
}: {
  client: ClientConfig;
  project: Project;
  buildGameHref: (id: string) => string;
  onFlyoutHover: (open: boolean) => void;
}) {
  const items = [...WORKSPACE_NAV, ...FINANCE_NAV];
  const iconBtn =
    "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground";
  return (
    <TooltipProvider delay={120} closeDelay={80}>
      <div className="relative z-20 flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-3">
        {/* The Appcharge mark doubles as the context switcher — hover (or click)
            opens Companies › games, anchored to its right. Opening it dims the
            rest of the screen (like the Settings rail flyout). */}
        <StoreSwitcher
          client={client}
          activeProjectId={project.id}
          triggerVariant="game"
          openOnHover
          side="right"
          align="start"
          sideOffset={10}
          onOpenChange={onFlyoutHover}
          buildGameHref={buildGameHref}
          trigger={
            <button
              type="button"
              aria-label="Switch context"
              className="mb-2 flex size-9 items-center justify-center rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AppchargeLogo className="size-7" />
            </button>
          }
        />
        {items.map((it) => (
          <Tooltip key={it.id}>
            <TooltipTrigger
              render={<Link href={projectHref(project.id, it.id, DEFAULT_ENV_ID)} aria-label={it.label} className={iconBtn} />}
            >
              <it.icon className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right" className={TOOLTIP_LIGHT}>{it.label}</TooltipContent>
          </Tooltip>
        ))}
        {firstStoreSection(project) ? (
          <Tooltip>
            <TooltipTrigger
              render={<Link href={storeHref(project.id, firstStoreSection(project)!)} aria-label="Store" className={`${iconBtn} bg-sidebar-accent/50 text-foreground`} />}
            >
              <IconBuildingStore className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right" className={TOOLTIP_LIGHT}>Store</TooltipContent>
          </Tooltip>
        ) : null}
        <div className="flex-1" />
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
 * The Store area — a two-pane flow (like Settings) for a project's product
 * sections (Webstore, Direct Checkout, …), with the environment selector and a
 * "Back to dashboard" affordance. Routes stay inside Store.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rest = pathname.replace(/^\/dashboard\/store\/?/, "").split("/");
  const projectId = rest[0] ?? "";
  const section = rest[1] ?? "";
  const envId = searchParams.get("env") ?? "production";
  const { wireframe } = useWireframe();
  const { byProject } = useSandboxes();

  const client = clientForProject(projectId);
  const project = getProject(client, projectId);
  // Resolve the active env (incl. runtime-created sandboxes) for the stripe.
  const environments = [...client.environments, ...(byProject[project.id] ?? [])];
  const env = environments.find((e) => e.id === envId) ?? environments[0];
  const inSandbox = env.kind === "sandbox";
  const backHref = projectHref(project.id, "home", DEFAULT_ENV_ID);
  const withEnv = (href: string) => (envId !== "production" ? `${href}?env=${envId}` : href);
  const hrefFor = (id: string) => withEnv(storeHref(project.id, id));
  const envHref = (e: string) => {
    const href = storeHref(project.id, section);
    return e !== "production" ? `${href}?env=${e}` : href;
  };
  // Switching game keeps the current section when the target has it (Products →
  // Products); otherwise falls back to that game's first store section.
  const buildGameHref = (id: string) => {
    const target = getProject(client, id);
    const ids = target.productGroups.flatMap((g) => g.items.flatMap(flattenNodes)).map((n) => n.id);
    const keep = ids.includes(section) ? section : firstStoreSection(target) ?? "ws-store";
    return storeHref(id, keep);
  };
  // Dim everything but the rail while the rail's context switcher is open, so
  // the menu stands out (Shopify-style, mirrors the Settings flyout).
  const [dim, setDim] = React.useState(false);
  const dimClass = dim ? "opacity-30" : "opacity-100";

  return (
    <SidebarProvider className="flex-col bg-sidebar">
      {/* Sandbox indicator — full-width, pinned above the Store panes while in a
          sandbox; hidden in Production (mirrors the main shell). */}
      {inSandbox ? (
        <div
          className="flex h-8 w-full shrink-0 items-center justify-center gap-2 text-xs font-medium text-white dark:bg-white! dark:text-neutral-900"
          style={{ backgroundColor: wireframe ? "#6b7280" : env.color }}
        >
          <IconCircleFilled className="size-2" aria-hidden />
          Sandbox — {env.name}
          <span className="font-normal text-white/80 dark:text-neutral-500">· changes here don’t affect production</span>
        </div>
      ) : null}

      <div className="flex min-h-0 w-full flex-1 bg-sidebar">
      <MiniRail client={client} project={project} buildGameHref={buildGameHref} onFlyoutHover={setDim} />

      <aside className={`flex w-60 shrink-0 flex-col bg-sidebar transition-opacity duration-150 ${dimClass} animate-in fade-in-0 slide-in-from-left-2 duration-200 ease-out motion-reduce:animate-none ${NAV_STYLE}`}>
        <div className="p-2">
          <Link
            href={backHref}
            title="Back to dashboard"
            className="group/back flex h-10 w-fit items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-foreground"
          >
            <IconChevronLeft className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover/back:-translate-x-0.5" />
            {/* Rolls between the studio name and "Back" on hover, same position. */}
            <span className="grid overflow-hidden leading-5">
              <span className="col-start-1 row-start-1 truncate transition duration-200 group-hover/back:-translate-y-full group-hover/back:opacity-0 motion-reduce:transition-none">
                {project.studio ?? "Store"}
              </span>
              <span className="col-start-1 row-start-1 translate-y-full opacity-0 transition duration-200 group-hover/back:translate-y-0 group-hover/back:opacity-100 motion-reduce:transition-none">
                Back
              </span>
            </span>
          </Link>
        </div>
        {/* Context switcher — change game, or jump straight up to the Company
            level, without stepping back out of the Webstore. (Hover-to-open
            lives on the Appcharge mark in the rail; this one opens on click.) */}
        <div className="px-2 pb-1">
          <StoreSwitcher
            client={client}
            activeProjectId={project.id}
            triggerVariant="game"
            className="w-full justify-start"
            buildGameHref={buildGameHref}
          />
        </div>
        <div className="px-2 pb-1">
          <EnvironmentSelector
            client={client}
            projectId={project.id}
            sectionId={section}
            envId={envId}
            mono={wireframe}
            className="w-full justify-start"
            buildHref={envHref}
          />
        </div>
        <nav className="flex-1 overflow-auto pb-4">
          {project.productGroups.map((g) => (
            <NavGroup key={g.id} label={g.label} items={g.items} activeId={section} hrefFor={hrefFor} />
          ))}
        </nav>
        {/* Settings + account — pinned at the bottom, same position as the main sidebar. */}
        <div className="flex flex-col gap-1 p-2">
          <Link
            href={settingsHref("admin-general", client.id)}
            className="flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <IconSettings className="size-4 shrink-0 text-muted-foreground" />
            <span>Settings</span>
          </Link>
          <AccountMenu variant="full" />
        </div>
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-2xl bg-background transition-opacity duration-150 ${dimClass}`}>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-6">
          <span className="text-sm text-muted-foreground">{projectDisplayLabel(client, project)}</span>
        </header>
        <main className="flex-1 overflow-auto px-6 py-8">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
      </div>
    </SidebarProvider>
  );
}
