"use client";

import { StoreSetupStatus } from "@/components/dashboard/setup-checklist";
import { useOpenEnv } from "@/components/dashboard/env-session";
import { MODULE_ICON, useModulesOf } from "@/components/dashboard/project-bits";
import { useCreateProject } from "@/components/dashboard/create-project-modal";
import * as React from "react";
import {
  IconCashBanknote,
  IconReceipt2,
  IconSparkles,
  IconChartBar,
  IconBuilding,
  IconDeviceGamepad2,
  IconFolders,
  IconPlugConnected,
  IconProgressHelp,
  IconFlask,
  IconFolderFilled,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stat } from "@/components/data/stat";
import { EmptyState } from "@/components/data/empty-state";
import Link from "next/link";
import { IconArrowRight, IconFolderPlus, IconPlus } from "@/lib/icons";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWireframe, useFolderTree } from "@/components/dashboard/providers";
import { OrdersBody } from "@/components/orders/orders-body";
import { baseModules, companyHref, MODULE_LABEL, projectHref, DEFAULT_ENV_ID, ROOT_FOLDER_ID, type ClientConfig, type Environment, type FolderNode, type Project, type ProjectLeaf } from "@/lib/newgen";
import { CompanyLogo } from "@/components/dashboard/logo";
import { findTrail, isFolderId, leafLabel, projectsIn, sortChildren, trailNames } from "@/lib/folders";
import { PageHeaderActions, PageHeaderMeta } from "@/components/dashboard/page-header-slot";

/** Test mode (wireframe): pages the usability test doesn't cover say so plainly, instead of showing a skeleton
 *  a participant might wait on or try to read. */
export function NotInTest({ page }: { page?: string }) {
  return (
    <EmptyState
      icon={<IconFlask className="size-5" />}
      title="Not part of this test"
      description={`${page ? `${page} isn’t` : "This page isn’t"} included in this session. Use the navigation to carry on with your task.`}
    />
  );
}

const TXNS = [
  { player: "player_4821", product: "Mega Coin Pack", amount: "$49.99", status: "Paid" as const },
  { player: "player_1190", product: "Weekend Offer", amount: "$9.99", status: "Paid" as const },
  { player: "player_7732", product: "Starter Bundle", amount: "$4.99", status: "Refunded" as const },
  { player: "player_5567", product: "VIP Subscription", amount: "$19.99", status: "Paid" as const },
];

type StatCell = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { dir: "up" | "down" | "neutral"; value: string };
  supporting?: string;
};

/** Divider classes for a stat cell in a 1 / 2 / 4-column grouped panel, so the
 *  cells read as one rounded surface split by hairlines (Square-style). */
function cellBorders(i: number): string {
  return cn(
    i > 0 && "border-t", // base (1-col): divider above every cell but the first
    i === 1 && "sm:border-t-0", // sm (2-col): top-right cell has no top divider
    i % 2 === 1 && "sm:border-l", // sm: right column gets a left divider
    "lg:border-t-0", // lg (4-col): single row, no top dividers
    i % 4 !== 0 && "lg:border-l", // lg: left divider on columns 2–4
  );
}

/** A grouped, rounded panel with a titled header and a row of divided stat
 *  cells — the Square "Banking" treatment. */
function StatPanel({ title, aside, stats }: { title: string; aside?: React.ReactNode; stats: StatCell[] }) {
  return (
    <Card className="gap-0 rounded-2xl py-0">
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <h2 className="font-heading text-section text-foreground">{title}</h2>
        {aside ? <span className="text-xs text-muted-foreground">{aside}</span> : null}
      </div>
      <div className="grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("p-6", cellBorders(i))}>
            <Stat label={s.label} value={s.value} icon={s.icon} trend={s.trend} supporting={s.supporting} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function HomeBody({ env }: { env: Environment }) {
  const { wireframe } = useWireframe();
  const sim = env.kind === "sandbox";
  if (wireframe) return <NotInTest page="Project home" />;
  const stats = [
    { label: "Revenue (7d)", value: sim ? "$3.1k" : "$48.2k", icon: IconCashBanknote, trend: { dir: "up" as const, value: "+12%" }, supporting: sim ? "simulated" : "vs last week" },
    { label: "Transactions", value: sim ? "86" : "1,284", icon: IconReceipt2, trend: { dir: "up" as const, value: "+8%" }, supporting: sim ? "simulated" : "this week" },
    { label: "Active offers", value: "12", icon: IconSparkles, supporting: "live now" },
    { label: "Conversion", value: "3.4%", icon: IconChartBar, trend: { dir: "down" as const, value: "-2%" }, supporting: "this week" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <StatPanel title="Overview" aside={env.name} stats={stats} />
      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle>Recent transactions</CardTitle>
          <CardDescription>
            {env.kind === "sandbox" ? "Simulated payments in this sandbox." : "Live payments in production."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {TXNS.map((t) => (
              <li key={t.player} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{t.player}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">{t.product}</span>
                <span className="tabular-nums text-foreground">{t.amount}</span>
                <Badge variant={t.status === "Paid" ? "success" : "neutral"}>{t.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectRow({ p }: { p: Project }) {
  return (
    <li className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
      <span className="flex items-center gap-2.5">
        <Avatar size="sm">
          {p.gameIcon ? <AvatarImage src={p.gameIcon} alt="" /> : null}
          <AvatarFallback>{p.gameInitials}</AvatarFallback>
        </Avatar>
        <span className="text-foreground">{p.game}</span>
        <span className="text-muted-foreground">· {p.project}</span>
      </span>
      <span className="flex gap-1">
        {p.undocumented ? (
          <Badge variant="neutral">Not set up</Badge>
        ) : (
          p.productGroups.map((g) => (
            <Badge key={g.id} variant="secondary">
              {g.label}
            </Badge>
          ))
        )}
      </span>
    </li>
  );
}

export function CompanyBody({ client }: { client: ClientConfig }) {
  const { wireframe } = useWireframe();
  if (wireframe) return <NotInTest />;
  const studios = Array.from(new Set(client.projects.map((p) => p.studio).filter(Boolean))) as string[];
  const gameCount = new Set(client.projects.map((p) => p.game)).size;
  const stats = [
    ...(client.hasStudioLayer ? [{ label: "Studios", value: String(studios.length), icon: IconBuilding }] : []),
    { label: "Games", value: String(gameCount), icon: IconDeviceGamepad2 },
    { label: "Projects", value: String(client.projects.length), icon: IconFolders },
    { label: "Revenue (30d)", value: "$214k", icon: IconCashBanknote, trend: { dir: "up" as const, value: "+9%" }, supporting: "vs last month" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <StatPanel title="Overview" aside={client.company.name} stats={stats} />
      {client.hasStudioLayer ? (
        studios.map((studio) => (
          <Card key={studio} className="rounded-2xl">
            <CardHeader className="border-b">
              <CardTitle>{studio}</CardTitle>
              <CardDescription>Games and their projects in this studio.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {client.projects.filter((p) => p.studio === studio).map((p) => (
                  <ProjectRow key={p.id} p={p} />
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="rounded-2xl">
          <CardHeader className="border-b">
            <CardTitle>Games</CardTitle>
            <CardDescription>Every game and its project.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {client.projects.map((p) => (
                <ProjectRow key={p.id} p={p} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Graceful empty state for a project that exists but isn't configured yet. */
export function UndocumentedBody({ project }: { project: Project }) {
  return (
    <EmptyState
      icon={<IconProgressHelp className="size-5" />}
      title={`${project.game} isn't set up yet`}
      description="This project exists but has no store configured. Start by adding a Webstore — nothing here is an error, just an empty slate."
    />
  );
}

/* ───────── Folder scope (Nested project hierarchy) ───────── */


/** The folder in view and every project rolled up under it (sub-folders included). */
function useFolderScope(client: ClientConfig, folderId: string) {
  const { root } = useFolderTree(client);
  const trail = findTrail(root, isFolderId(folderId)) ?? [root];
  const folder = trail.at(-1) as FolderNode;
  const items = projectsIn(client, folder, trailNames(client, trail.slice(0, -1)));
  return { folder, items, path: trailNames(client, trail).join(" / ") };
}

/** A folder's Home: the roll-up of every project in it and its sub-folders —
 *  the one rule that replaces the old Company, Studio and Game views. */
export function FolderBody({ client, folderId }: { client: ClientConfig; folderId: string }) {
  const { wireframe } = useWireframe();
  const { folder, items } = useFolderScope(client, folderId);
  const modulesOf = useModulesOf();
  // Opening a project uses the session's environment (Foldering PRD, Story 9).
  const openEnv = useOpenEnv(client);
  // Project creation (Project Lifecycle PRD), with this folder as the destination, in a dialog over this page.
  const createProject = useCreateProject();
  const create = () => createProject({ clientId: client.id, folderId: folder.id });
  const router = useRouter();
  const pathname = usePathname();
  const newFolder = () => router.replace(`${pathname}?panel=new-folder&parent=${folder.id}`, { scroll: false });

  if (!items.length) {
    const subFolders = folder.children.filter((c) => c.kind === "folder").length;
    return (
      <EmptyState
        icon={<IconFolderFilled className="size-5" />}
        title={subFolders ? "No projects in this folder yet" : folder.id === ROOT_FOLDER_ID ? "Start by organizing your company" : "No projects in this folder yet"}
        description={
          folder.id === ROOT_FOLDER_ID && !subFolders
            ? "Make folders for your studios or game genres, then create projects inside them."
            : "Create a project here, add a folder, or move projects in from Folders & projects in the sidebar."
        }
        className="px-7"
        // R12 (V-01): folders get their own entry next to Create project; it opens New folder (hosted by the sidebar tree).
        secondaryAction={
          // 15px + its 1px border = the primary button's 16px, so both read with the same padding.
          <Button size="sm" variant="outline" className="h-9 px-[15px]" onClick={newFolder}>
            <IconFolderPlus />
            New folder
          </Button>
        }
        primaryAction={
          <Button size="sm" className="h-9 px-4" onClick={create}>
            <IconPlus />
            Create project
          </Button>
        }
      />
    );
  }
  // New project always comes with New folder beside it, as the secondary action. Compact (32px, 13px text), in the
  // page header's right end, like Shopify's page actions.
  const newProject = (
    <>
      <Button size="sm" variant="outline" className="h-8 px-3 text-nav" onClick={newFolder}>
        <IconFolderPlus />
        New folder
      </Button>
      <Button size="sm" className="h-8 px-3 text-nav" onClick={create}>
        <IconPlus />
        New project
      </Button>
    </>
  );

  const live = items.filter((i) => i.project.status === "Live").length;
  const stats = [
    { label: "Projects", value: String(items.length), icon: IconFolders, supporting: "in this folder and below" },
    { label: "Live", value: `${live} / ${items.length}`, icon: IconSparkles, supporting: "in production" },
    { label: "Revenue (30d)", value: `$${items.length * 36}k`, icon: IconCashBanknote, trend: { dir: "up" as const, value: "+9%" }, supporting: "rolled up" },
    { label: "Orders (30d)", value: (items.length * 2140).toLocaleString(), icon: IconReceipt2, supporting: "rolled up" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* In the page header row (shell.tsx): the description beside the title, the actions on the right. */}
      <PageHeaderMeta>
        Totals for {items.length} {items.length === 1 ? "project" : "projects"} in {folder.name} and its sub-folders
      </PageHeaderMeta>
      <PageHeaderActions>{newProject}</PageHeaderActions>
      {/* Test mode drops the totals (sample numbers aren't part of the test); the project list is the page. */}
      {wireframe ? null : <StatPanel title={`${folder.name} totals`} stats={stats} />}
      {/* One card per folder directly inside this one (a studio, say), holding every project in it and its sub-folders,
          so a studio's games sit together. Inside, each sub-folder (a game) is a labelled group; projects directly in
          this folder come first, in their own card. */}
      {topGroups(client, folder).map(({ node, trail: groupTrail, groups, count }) => {
        const isHere = node.id === folder.id;
        const projectRow = ({ leaf, project }: { leaf: ProjectLeaf; project: Project }) => (
          <li key={project.id}>
            <Link href={projectHref(project.id, "home", openEnv(project.id))} className="flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-muted/50">
              <Avatar size="sm">
                {project.gameIcon ? <AvatarImage src={project.gameIcon} alt="" /> : null}
                <AvatarFallback>{project.gameInitials}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 truncate text-foreground">{leafLabel(client, leaf)}</span>
              {/* What the project sells with: a small chip per module (its icon and name). */}
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                {modulesOf(project).map((m) => {
                  const Icon = MODULE_ICON[m];
                  return (
                    <span key={m} className="inline-flex h-5 items-center gap-1 rounded-full border border-border px-2 text-[11px] whitespace-nowrap text-muted-foreground">
                      <Icon className="size-3" />
                      {MODULE_LABEL[m]}
                    </span>
                  );
                })}
              </span>
              {/* Store setup status: Setting up (steps done) while the checklist is open, else Live / its status. */}
              <StoreSetupStatus project={project} mono={wireframe} />
            </Link>
          </li>
        );
        return (
          <Card key={node.id} className="gap-0 rounded-2xl py-0">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              {isHere && node.id === ROOT_FOLDER_ID ? (
                <CompanyLogo clientId={client.id} className="size-5 shrink-0 rounded-[5px]" />
              ) : (
                <IconFolderFilled className="size-5 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1 truncate font-heading text-base font-semibold text-foreground">{isHere ? `In ${trailNames(client, groupTrail).at(-1)}` : node.name}</span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {count} {count === 1 ? "project" : "projects"}
              </span>
              {!isHere ? (
                <Link href={companyHref(client.id, "home", node.id)} className="group/open inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Open folder
                  <IconArrowRight className="size-3.5 transition-transform group-hover/open:translate-x-0.5" aria-hidden />
                </Link>
              ) : null}
            </div>
            {count || groups.length ? (
              <div className="divide-y divide-border">
                {groups.map((g) => {
                  const own = g.node.id === node.id;
                  return (
                    <div key={g.node.id}>
                      {/* A sub-folder inside the card: its path below the card's folder, and a link to it. */}
                      {own ? null : (
                        <div className="flex items-center gap-2 bg-muted/40 px-6 py-2">
                          <IconFolderFilled className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                            {trailNames(client, g.trail).slice(groupTrail.length).join(" / ")}
                          </span>
                          <Link href={companyHref(client.id, "home", g.node.id)} className="group/open inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            Open folder
                            <IconArrowRight className="size-3 transition-transform group-hover/open:translate-x-0.5" aria-hidden />
                          </Link>
                        </div>
                      )}
                      {g.projects.length ? (
                        <ul className="divide-y divide-border">{g.projects.map(projectRow)}</ul>
                      ) : (
                        <p className="px-6 py-3 text-sm text-muted-foreground">No projects yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="px-6 py-4 text-sm text-muted-foreground">No projects yet</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/** The Home cards: the projects directly in this folder (if any), then one card per folder directly inside it with
 *  its own projects and each of its sub-folders' (folderGroups), and the total. */
function topGroups(client: ClientConfig, top: FolderNode) {
  const here = folderGroups(client, top).filter((g) => g.node.id === top.id);
  const out = here.map((g) => ({ node: top, trail: g.trail, groups: [g], count: g.projects.length }));
  for (const c of sortChildren(client, top.children)) {
    if (c.kind !== "folder") continue;
    const groups = folderGroups(client, c as FolderNode).map((g) => ({ ...g, trail: [top, ...g.trail] }));
    out.push({ node: c as FolderNode, trail: [top, c as FolderNode], groups, count: groups.reduce((n, g) => n + g.projects.length, 0) });
  }
  return out;
}

/** A folder's projects split by the folder they sit in: this folder first (if it holds any directly), then every
 *  sub-folder in tree order. Folders that only hold other folders are skipped; empty folders show as empty. */
function folderGroups(client: ClientConfig, top: FolderNode) {
  const out: { node: FolderNode; trail: FolderNode[]; projects: { leaf: ProjectLeaf; project: Project }[] }[] = [];
  const walk = (f: FolderNode, trail: FolderNode[]) => {
    const here = [...trail, f];
    const kids = sortChildren(client, f.children);
    const projects = kids.flatMap((c) => {
      if (c.kind !== "project") return [];
      const project = client.projects.find((p) => p.id === c.id);
      return project ? [{ leaf: c, project }] : [];
    });
    const folders = kids.filter((c): c is FolderNode => c.kind === "folder");
    if (projects.length || (!folders.length && f !== top)) out.push({ node: f, trail: here, projects });
    folders.forEach((c) => walk(c, here));
  };
  walk(top, []);
  return out;
}

/** A folder's Orders: rolled up over every project in it and its sub-folders (Foldering PRD Story 7). */
export function FolderOrdersBody({ client, folderId }: { client: ClientConfig; folderId: string }) {
  const { folder, items } = useFolderScope(client, folderId);
  const projects = React.useMemo(
    () => items.map(({ project }) => ({ id: project.id, name: project.project, modules: baseModules(project) })),
    [items],
  );
  if (!items.length) {
    return <EmptyState icon={<IconFolders className="size-5" />} title="No orders yet" description="Orders show here once this folder holds a project." />;
  }
  return <OrdersBody view={{ key: `folder:${client.id}:${folder.id}`, folder: true, projects, sandbox: false }} />;
}

/** Any other folder tab (Analytics, Developer, …): aggregated over the folder. */
export function FolderSectionBody({ client, folderId, section }: { client: ClientConfig; folderId: string; section: string }) {
  const { wireframe } = useWireframe();
  const { items, path } = useFolderScope(client, folderId);
  if (wireframe) return <NotInTest page={section} />;
  return (
    <EmptyState
      icon={<IconFolders className="size-5" />}
      title={`${section} — rolled up`}
      description={`Shows ${section} across the ${items.length} ${items.length === 1 ? "project" : "projects"} in ${path}. Wire the aggregated screen in here.`}
    />
  );
}

export function PlaceholderBody({ section, project, env }: { section: string; project: Project; env: Environment }) {
  const { wireframe } = useWireframe();
  if (wireframe) return <NotInTest page={section} />;
  return (
    <EmptyState
      icon={<IconPlugConnected className="size-5" />}
      title={`${section} — section scaffold`}
      description={"This page isn't built in the prototype yet."}
    />
  );
}
