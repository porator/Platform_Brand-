"use client";

import { NotificationsButton } from "@/components/dashboard/notifications";

import { cn } from "@/lib/utils";
import { AssistantDrawer, useAssistant } from "@/components/dashboard/assistant-drawer";
import { AIWorkspace, OverviewPrompt } from "@/components/ai/ai-workspace";
import { PAGE_HEADER_ACTIONS_ID, PAGE_HEADER_META_ID } from "@/components/dashboard/page-header-slot";
import { GlobalSearch } from "@/components/dashboard/global-search";
import * as React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  IconBuildingStore,
  IconChevronDown,
  IconCircleFilled,
  IconCreditCard,
  IconFolder,
  IconLink,
  IconMoon,
  IconVectorBezier2,
  IconBuildingSkyscraper,
  IconInnerShadowTop,
  IconSitemap,
} from "@/lib/icons";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScopedSidebar } from "@/components/dashboard/sidebar";
import { AiCreateProject } from "@/components/usability/ai-create-project";
import { LaunchPlanPanel } from "@/components/dashboard/launch-plan";
import { RouteTransition } from "@/components/dashboard/route-transition";
import { EnvironmentSelector, FOLDER_ENV_COLOR, FolderEnvironmentSelector } from "@/components/dashboard/switchers";
import { noteProjectEnv, setFolderEnv, useEnvSession, useProjectEnvironments } from "@/components/dashboard/env-session";
import { ScopeSwitcher } from "@/components/dashboard/scope-switcher";
import { useEmbedded } from "@/components/dashboard/flow-guide";
import { SetupChecklistPanel, useSetup } from "@/components/dashboard/setup-checklist";
import Link from "next/link";
import { useWireframe, useSandboxes, useFolderTree, useDemo, useProjectModules, useThemeMode } from "@/components/dashboard/providers";
import {
  getClient,
  clientForProject,
  getProject,
  sectionLabel,
  projectHref,
  companyHref,
  baseModules,
  ALL_CLIENTS,
  DEFAULT_ENV_ID,
  MODULE_IDS,
  MODULE_LABEL,
  ROOT_FOLDER_ID,
  type ClientId,
  type FolderNode,
  type ModuleId,
  type Project,
  type TreeNode,
} from "@/lib/newgen";
import { findTrail, insertProject, isFolderId, isProjectId, projectsIn, trailNames } from "@/lib/folders";
import { CompanyLogo } from "@/components/dashboard/logo";
import { BrandDNA } from "@/components/brand-dna/brand-dna";
import { organizationBrand } from "@/components/brand-dna/use-brand-context";

/* ───────── Orientation (post-onboarding): what level you're on, and what's in it ───────── */

const MODULE_ICON: Record<ModuleId, typeof IconBuildingStore> = {
  webstore: IconBuildingStore,
  "payment-links": IconLink,
  "direct-checkout": IconCreditCard,
};
type Level = "organization" | "folder" | "project";
const LEVEL_LABEL: Record<Level, string> = { organization: "Organization", folder: "Folder", project: "Project" };

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
function countFolders(f: FolderNode): number {
  return f.children.reduce((n, c) => (c.kind === "folder" ? n + 1 + countFolders(c) : n), 0);
}

/**
 * The line under the page title: the level you're on (Organization, Folder, Project), where it sits, and what it holds —
 * folders and projects for the company or a folder, the modules for a project — so the hierarchy built in onboarding
 * reads at a glance.
 */
function ScopeSummary({
  level,
  here,
  parents,
  projectCount,
  folderCount,
  modules,
}: {
  level: Level;
  here: TreeNode;
  parents: string[];
  projectCount: number;
  folderCount: number;
  modules: ModuleId[];
}) {
  const parts: React.ReactNode[] = [];
  if (level !== "organization") parts.push(<span key="in">in {parents.join(" / ")}</span>);
  if (level === "project") {
    parts.push(
      <span key="mods" className="flex flex-wrap items-center gap-1">
        {modules.map((m) => {
          const Icon = MODULE_ICON[m];
          return (
            <span key={m} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-xs text-foreground">
              <Icon className="size-3.5 text-muted-foreground" aria-hidden />
              {MODULE_LABEL[m]}
            </span>
          );
        })}
      </span>,
    );
  } else {
    parts.push(
      <span key="count">
        {folderCount || projectCount
          ? [folderCount ? plural(folderCount, "folder") : null, plural(projectCount, "project")].filter(Boolean).join(" · ")
          : "No folders or projects yet"}
      </span>,
    );
  }
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground" data-scope={here.id}>
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">{LEVEL_LABEL[level]}</span>
      {parts}
    </p>
  );
}

/** Folder view's environment selector (Foldering PRD, Story 9): each session
 *  starts on Production; All sandboxes rolls up every sandbox in scope. */
/** Inside a project, the sidebar (and the frame around the page) is dark, #272727, so a project reads as a different
 *  level from Company and folders (which keep the light sidebar). The sidebar itself switches to the dark theme
 *  (ScopedSidebar); this sets the frame's colour to match. */
const PROJECT_SIDEBAR = {
  "--sidebar": "#272727",
  "--sidebar-accent": "#3A3A3A",
  "--sidebar-border": "#3A3A3A",
};
/** Company and folders: the light sidebar (and frame) matches the workspace, #FCFCFC. */
const FOLDER_SIDEBAR = { "--sidebar": "#FCFCFC" };


/* ----------------------------- floating controls -------------------------- */
/* All presentation tooling lives behind ONE round logo button: review-as-client
 * and wireframe mode. Deliberately not part of the dashboard chrome. */

function FloatingReviewMenu({ clientId }: { clientId: ClientId }) {
  const router = useRouter();
  const { wireframe, toggle } = useWireframe();
  const embedded = useEmbedded();
  const { dark: isDark, setDark } = useThemeMode();
  if (embedded) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Review tools"
            className="fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full border border-border bg-foreground text-background shadow-lg outline-none transition-transform hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        }
      >
        <IconInnerShadowTop className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={10} className="w-60">
        <DropdownMenuRadioGroup
          value={clientId}
          onValueChange={(v) => router.push(projectHref(getClient(v).defaultProjectId, "home", DEFAULT_ENV_ID))}
        >
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Review as client</DropdownMenuLabel>
          {// Flow fixtures (first-time states) are reached from the flow guide, not here.
          ALL_CLIENTS.filter((c) => c.id !== "generic" && !c.fixture).map((c) => (
            <DropdownMenuRadioItem key={c.id} value={c.id} className="gap-2.5">
              <IconBuildingSkyscraper className="size-4 text-muted-foreground" />
              {c.company.name}
            </DropdownMenuRadioItem>
          ))}
          {/* No client: the bare structure, every level named for what it is. */}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Without a client</DropdownMenuLabel>
          <DropdownMenuRadioItem value="generic" className="gap-2.5">
            <IconSitemap className="size-4 text-muted-foreground" />
            Generic structure
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Presentation</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={wireframe} onCheckedChange={() => toggle()} className="gap-2.5">
            <IconVectorBezier2 className="size-4 text-muted-foreground" />
            Wireframe mode
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={isDark} onCheckedChange={(v) => setDark(v)} className="gap-2.5">
            <IconMoon className="size-4 text-muted-foreground" />
            Dark mode
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The dashboard shell. The top bar carries the identity row (logo / company /
 * game·project) with the environment state + account on the right; the active
 * client is derived from the URL (project id, or ?client= for company scope).
 */
/** The line under the page title ("Project · in Product Madness / game · Webstore"): hidden for now. */
const SHOW_SCOPE_SUMMARY = false;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { wireframe } = useWireframe();
  const assistant = useAssistant();
  // The AI workspace belongs to the page it was opened from: going anywhere else (the nav, a reply's button) closes it.
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const workspaceRoute = React.useRef(routeKey);
  React.useEffect(() => {
    if (!assistant?.workspace) {
      workspaceRoute.current = routeKey;
      return;
    }
    if (workspaceRoute.current !== routeKey) assistant.setWorkspace(false);
  }, [routeKey, assistant]);
  const { byProject } = useSandboxes();

  const segments = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);
  const isCompany = segments[0] === "company";
  const scope: "company" | "project" = isCompany ? "company" : "project";

  // The two docked drawers (setup checklist, AI assistant) take turns: opening one closes the other.
  const router = useRouter();
  const checklistOpen = scope === "project" && searchParams.get("panel") === "checklist";
  React.useEffect(() => {
    if (checklistOpen && assistant?.open) assistant.setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistOpen]);
  React.useEffect(() => {
    if (!assistant?.open || !checklistOpen) return;
    const p = new URLSearchParams(searchParams.toString());
    p.delete("panel");
    router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistant?.open]);

  const projectId = isCompany ? undefined : segments[0];
  const client = isCompany ? getClient(searchParams.get("client")) : clientForProject(projectId);
  const section = segments[1] ?? "home";
  const envId = searchParams.get("env") ?? "production";
  // Folder scope: Company is the root folder; any other folder rides ?folder=.
  const folderId = isCompany ? searchParams.get("folder") ?? ROOT_FOLDER_ID : undefined;

  const project = getProject(client, projectId);
  // Story 9: being in a project sets the session's environment type (Production, or sandboxes) and remembers the
  // sandbox used, so Folder view and the next project open in the matching environment.
  const envsOf = useProjectEnvironments(client);
  React.useEffect(() => {
    if (isCompany) return;
    const env = envsOf(project.id).find((e) => e.id === envId);
    if (env) noteProjectEnv(project.id, env);
  }, [isCompany, project.id, envId, envsOf]);
  // Merge any runtime-created sandboxes so a just-created env resolves here too.
  const environments = [...client.environments, ...(byProject[project.id] ?? [])];
  const env = environments.find((e) => e.id === envId) ?? environments[0];
  const inSandbox = !isCompany && env.kind === "sandbox";
  const { folderEnv } = useEnvSession();
  // The sandbox strip shows at every level: in a project's sandbox, and at Company and folder level on All sandboxes.
  const folderInSandboxes = isCompany && folderEnv === "sandboxes";
  const showStrip = inSandbox || folderInSandboxes;
  const label = sectionLabel(client, section);
  // An order's page (Orders ?order=<id>) brings its own title (Back, the order ID, previous / next).
  const ownHeader = section === "orders" && !!searchParams.get("order");
  // King-level pages (company and folders) show the organization's Brand DNA banner instead of the plain header.
  const orgBanner = isCompany && section !== "home" && !ownHeader;

  // Where you are in the folders (runtime folders included): named, not navigable, in the top bar.
  const { root, edit } = useFolderTree(client);
  const trail = findTrail(root, isCompany ? isFolderId(folderId!) : isProjectId(project.id)) ?? [root];
  const names = trailNames(client, trail);
  const demo = useDemo();
  const { add, modules: projectModules } = useProjectModules(project);
  // Navigation motion (nav-motion.tsx): a new context (Company, a folder, a project, a category's own menu) loads the
  // sidebar's categories in; nothing else moves.
  // Categories expand in place now, so only a new scope (Company, a folder, a project) reloads the list.
  const panelKey = isCompany ? `folder:${folderId}` : `project:${project.id}`;
  // Orientation: each breadcrumb's level, and what the current scope holds.
  const levelAt = (i: number): Level => (i === 0 ? "organization" : !isCompany && i === trail.length - 1 ? "project" : "folder");
  const hereNode = trail.at(-1)!;
  const hereLevel = levelAt(trail.length - 1);
  const hereFolder = hereNode.kind === "folder" ? (hereNode as FolderNode) : null;
  const setup = useSetup(project);

  // Flow-guide links carry the state their screen assumes (`added`, `live`),
  // so any step can be opened directly — seed it once here.
  const addedParam = searchParams.get("added") as ModuleId | null;
  const liveParam = searchParams.get("live") as ModuleId | null;
  React.useEffect(() => {
    if (isCompany) return;
    if (addedParam && MODULE_IDS.includes(addedParam)) add(addedParam);
    if (liveParam && MODULE_IDS.includes(liveParam)) setup.complete(liveParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, addedParam, liveParam]);
  // A project that isn't here any more (made in Create project before a reload, which starts the company afresh):
  // back to the company's Home instead of showing another project in its place.
  const projectMissing = !isCompany && !!projectId && !client.projects.some((p) => p.id === projectId);
  React.useEffect(() => {
    if (projectMissing) router.replace(companyHref(client.id, "home"));
  }, [projectMissing, router, client.id]);
  // A project the "Create project" flow makes, opened before it was created.
  React.useEffect(() => {
    // Only on a real project URL: /dashboard itself (on its way to a redirect) must not create anything.
    // Only when the URL names it: an unknown project id falls back to it, and that must not add it to the folders.
    if (!isCompany && projectId === project.id && project.pending && !findTrail(root, isProjectId(project.id))) {
      // Only once: a second run of this effect (React dev mode runs effects twice) must not add it again.
      edit((t) =>
        findTrail({ kind: "folder", id: ROOT_FOLDER_ID, name: "", children: t } as FolderNode, isProjectId(project.id))
          ? t
          : insertProject(t, project.pendingIn ?? ROOT_FOLDER_ID, { kind: "project", id: project.id, label: project.project }),
      );
      demo.set((s) => ({ ...s, createdModules: { ...s.createdModules, [project.id]: baseModules(project) } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  return (
    <SidebarProvider
      // In a sandbox the page is one surface: the strip on top (14px top corners) and the navigation frame below it,
      // whose own 16px top corners overlap the strip's lower 16px so the strip's colour shows round them.
      className={cn("h-svh flex-col overflow-hidden", showStrip && "rounded-t-[14px]")}
      style={{ "--sidebar-width": "220px", "--sidebar": "#F6F6F6" /* light frame: one grey for all the navigation (PROJECT_SIDEBAR / FOLDER_SIDEBAR kept, unused) */ } as React.CSSProperties}
    >
      {/* The workspace is exactly one screen tall: the page frame keeps the same gap above and below and never moves;
          its content scrolls inside it. */}
      {/* Sandbox strip — pinned while working in a sandbox so nobody mistakes it for Production; switching back is one
          click. 44px tall: 28px for its line, plus 16px that runs under the frame's rounded top corners. */}
      {showStrip ? (
        <div
          role="status"
          className="flex h-[44px] w-full shrink-0 items-center justify-center gap-2 pb-4 text-xs font-medium text-white dark:bg-white! dark:text-neutral-900"
          // R22 (V-11): each sandbox keeps its own colour in test mode too, so two sandboxes never look the same.
          // At Company and folder level it takes All sandboxes' orange.
          style={{ backgroundColor: inSandbox ? env.color : FOLDER_ENV_COLOR.sandboxes }}
        >
          <IconCircleFilled className="size-2" aria-hidden />
          {inSandbox ? <>You’re in {env.name}. Everything here uses test data.</> : <>You’re viewing All sandboxes. Everything here uses test data.</>}
          {inSandbox ? (
            <Link
              href={projectHref(project.id, section, DEFAULT_ENV_ID)}
              className="ml-2 rounded-md bg-white/15 px-2 py-0.5 font-medium hover:bg-white/25 dark:bg-neutral-900/10 dark:hover:bg-neutral-900/20"
            >
              Switch to Production
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setFolderEnv("production")}
              className="ml-2 rounded-md bg-white/15 px-2 py-0.5 font-medium hover:bg-white/25 dark:bg-neutral-900/10 dark:hover:bg-neutral-900/20"
            >
              Switch to All production
            </button>
          )}
        </div>
      ) : null}

      {/* Shopify-style: no top bar — the full-height left sidebar carries the
          store switcher, search, nav, and the Copilot / Settings / account
          controls at the bottom. */}
      {/* The navigation frame. Under the strip it rounds its top corners and becomes the fixed sidebar's containing
          block (transform), so the sidebar sits inside the rounded frame too. */}
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 bg-sidebar",
          showStrip && "relative z-[1] -mt-4 overflow-hidden rounded-t-[16px] [transform:translateZ(0)]",
        )}
      >
        <ScopedSidebar
          client={client}
          panelKey={panelKey}
          scope={scope}
          project={project}
          folderId={folderId}
          envId={envId}
          activeSection={section}
          topOffset={showStrip ? "sandbox" : "default"}
        />
        {/* Right of the sidebar: the top navigation, on the frame (outside the workspace), then the workspace card. */}
        <SidebarInset className="relative min-w-0 bg-transparent">
          {/* Top navigation, apart from the workspace: the scope selector (where you are; it opens Folders & projects) on
              the left; the environment selector (inside a project),
              search and notifications on the right. Light grey like the navigation, one header with the sidebar's logo row, with a divider under it. */}
          <div className="flex h-14 shrink-0 items-center bg-[#F6F6F6] px-4 text-foreground sm:px-6">
          <div className="flex w-full items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1 text-nav">
            {/* Where you are, and the one place to switch: it opens Folders & projects under it. */}
            <ScopeSwitcher client={client} scope={scope} project={project} folderId={folderId} sectionId={section} envId={envId} />
            {/* The environment, in an outlined pill right after the path (Foldering PRD, top bar): a project's own
                environments inside a project; Production or All sandboxes at Company and folder level (Story 9). */}
            {/* Labelled text (option D): a hairline divider after the path, then "Environment ● name ⌄" with no pill. */}
            <span aria-hidden className="mx-2 h-[18px] w-px shrink-0 bg-zinc-300" />
            <span className="inline-flex shrink-0 items-center">
              {scope === "project" ? (
                <EnvironmentSelector client={client} projectId={project.id} sectionId={section} envId={envId} mono={false} variant="state" />
              ) : (
                <FolderEnvironmentSelector client={client} />
              )}
            </span>
          </div>
            {/* Right: search (⌘K) and notifications. */}
            <div className="flex shrink-0 items-center gap-1">
              <GlobalSearch client={client} project={project} scope={scope} envId={envId} />
              <NotificationsButton />
            </div>
          </div>
          </div>
          {/* Under the top navigation: the workspace, and the setup checklist or AI assistant docked beside it (one at a
              time), so the header runs unbroken across both. */}
          {/* Light frame: no hairlines; the workspace is a white rounded panel set into the grey navigation. */}
          <div className="flex min-h-0 flex-1 pr-2 pb-2">
          <div
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-(--frame-shadow)"
            // The Overview ⇄ AI workspace transition cross-fades this panel only (globals.css).
            style={{ viewTransitionName: "ai-stage" }}
          >
          {/* After a prompt on the Overview, the AI workspace takes over this panel (the navigation stays). */}
          {assistant?.workspace ? (
            <AIWorkspace />
          ) : (
          <>
          <div className="flex min-h-0 flex-1 flex-col overflow-auto pb-36">
            <RouteTransition motion="none" className="flex min-h-0 flex-1 flex-col">
              {/* Pinned to the top of the workspace while the page scrolls, with a hairline under it (Shopify-style).
                  Not on the Overview (company, folder, project): it opens straight onto the AI prompt, like Shopify Home. */}
              {section === "home" && !ownHeader ? null : orgBanner ? (
              // King-level pages wear the organization's Brand DNA (as on its Overview): the logo, the page's name and
              // the company, with the page's description and actions on the banner instead of a sticky white bar.
              <div className="px-4 pt-6 sm:px-6">
                <BrandDNA {...organizationBrand(client)} className="rounded-[18px]">
                  <div className="flex min-h-[132px] items-end gap-3 p-6">
                    <CompanyLogo clientId={client.id} className="size-10 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <h1 className="truncate font-brand text-[22px] leading-tight font-medium tracking-[-0.01em] text-[#272727]">{label}</h1>
                      <p className="truncate text-[13px] text-foreground/70">{client.company.name}</p>
                      <div id={PAGE_HEADER_META_ID} className="truncate text-[13px] text-foreground/70 empty:hidden" />
                    </div>
                    <div id={PAGE_HEADER_ACTIONS_ID} className="flex shrink-0 items-center gap-2" />
                  </div>
                </BrandDNA>
              </div>
              ) : (
              <header className={cn("px-4 sm:px-6", !ownHeader && "sticky top-0 z-10 border-b border-border/80 bg-white")}>
                {/* The page header, Shopify-style: one compact row at the top of the workspace — the title (16px
                    semibold), a grey description beside it and the page's actions on the right. Pages fill the
                    description and actions with <PageHeaderMeta> / <PageHeaderActions> (page-header-slot.tsx). */}
                {ownHeader ? (
                  <div className="mt-6" />
                ) : (
                  <div className="flex h-14 items-center gap-3">
                    <h1 className="shrink-0 text-section text-foreground">{label}</h1>
                    <div id={PAGE_HEADER_META_ID} className="min-w-0 truncate text-body text-muted-foreground" />
                    <div id={PAGE_HEADER_ACTIONS_ID} className="ml-auto flex shrink-0 items-center gap-2" />
                  </div>
                )}
                {/* The scope summary under the title (level chip, path, modules) is hidden for now; flip to bring it back. */}
                {SHOW_SCOPE_SUMMARY ? (
                  <ScopeSummary
                    level={hereLevel}
                    here={hereNode}
                    parents={names.slice(0, -1)}
                    projectCount={hereFolder ? projectsIn(client, hereFolder).length : 0}
                    folderCount={hereFolder ? countFolders(hereFolder) : 0}
                    modules={projectModules}
                  />
                ) : null}
              </header>
              )}

              <main className="px-4 py-6 sm:px-6">
                {/* No header on the Overview, so its description and actions (Totals for…, New folder / New project,
                    Preview store / Add module) sit in a plain row at the top; the row hides while both slots are empty. */}
                {section === "home" && !ownHeader ? (
                  // Figma 128:6604: the actions sit 18px from the panel's top and right edge; the content below stays put.
                  <div className="relative -top-1.5 mb-4 flex items-center gap-3 sm:-right-1.5 [&:not(:has(>div:not(:empty)))]:hidden">
                    <div id={PAGE_HEADER_META_ID} className="min-w-0 truncate text-body text-muted-foreground" />
                    <div id={PAGE_HEADER_ACTIONS_ID} className="ml-auto flex shrink-0 items-center gap-2" />
                  </div>
                ) : null}
                {/* On a project's Overview the AI prompt is the page's main interaction: a greeting and the composer,
                    centred. Sending one opens the AI workspace (ai-workspace.tsx). Company and folder Overviews keep the
                    floating Ask AI bar instead. */}
                {section === "home" && !isCompany && !assistant?.open ? <OverviewPrompt className="mt-24 mb-12" /> : null}
                {children}
              </main>
            </RouteTransition>
          </div>
          {/* Floating AI prompt — centered over the content, clear of the sidebar. Not on the Overview (company, folder or
              project), where people land; it appears once they move to another page. Hidden while the assistant drawer
              is open (its prompt is in the drawer). */}
          {assistant?.open || (section === "home" && !isCompany) ? null : (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
              <AiCreateProject client={client} folderId={isCompany ? folderId : undefined} project={isCompany ? undefined : project} className="pointer-events-auto" />
            </div>
          )}
          </>
          )}
          {/* Where there's no floating bar (the Overview, the AI workspace), a hidden one still answers the AI's
              prompts: it registers the responder that can create folders and projects. */}
          {assistant?.workspace || (section === "home" && !isCompany) ? (
            <div hidden>
              <AiCreateProject client={client} folderId={isCompany ? folderId : undefined} project={isCompany ? undefined : project} />
            </div>
          ) : null}
          </div>
          {/* The setup checklist and the AI assistant, beside the workspace (not a layer over it). One at a time:
              opening either closes the other. */}
          {scope === "project" ? <SetupChecklistPanel project={project} /> : null}
          <AssistantDrawer />
          </div>
        </SidebarInset>
      </div>
      {/* Usability test: no Review tools button and no flow guide. */}
      <LaunchPlanPanel />
    </SidebarProvider>
  );
}
