"use client";

import * as React from "react";
import {
  IconArrowUpRight,
  IconBuildingStore,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconCreditCard,
  IconDeviceMobile,
  IconDots,
  IconFolderOpen,
  IconFolderPlus,
  IconLink,
  IconPlus,
  IconSearch,
  IconX,
  IconFolderFilled,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CompanyLogo } from "@/components/dashboard/logo";
import { ModuleBadge, ProjectChip } from "@/components/dashboard/project-bits";
import { findTrail, isFolderId, isProjectId, nodeKey, nodeName, sortChildren, trailNames } from "@/lib/folders";
import { ROOT_FOLDER_ID, type ClientConfig, type FolderNode, type ModuleId, type Project, type TreeNode } from "@/lib/newgen";

/**
 * All projects: the workspace's folders and projects in one large view (the scope selector's expanded form).
 *
 *   Header   — "All projects", folder and project totals, close.
 *   Toolbar  — search (every folder and project, at any depth) and project-type filters (any combination).
 *   Left     — the folder tree: Company, then every folder at any depth, each with the projects inside it.
 *   Main     — the selected folder: its breadcrumb, its sub-folders and the projects directly in it.
 *
 * It reads the app's own data (the client's folder tree and projects; a project's types are its modules) and changes
 * nothing itself: navigation, New project, New folder, Move and Clone go back to the host through the callbacks, so
 * the existing flows (and their dialogs) do the work.
 */

export type ProjectType = ModuleId | "app-direct";

const TYPES: { id: ProjectType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "webstore", label: "Webstore", icon: IconBuildingStore },
  { id: "direct-checkout", label: "Direct Checkout", icon: IconCreditCard },
  { id: "payment-links", label: "Payment Link", icon: IconLink },
  { id: "app-direct", label: "AppDirect", icon: IconDeviceMobile },
];

export type AllProjectsViewProps = {
  client: ClientConfig;
  root: FolderNode;
  /** Where the user is now: the current project is marked, and its folder opens first. */
  current: { kind: "folder" | "project"; id: string };
  /** A project's types (its modules). */
  modulesOf: (p: Project) => ModuleId[];
  /** The folder shown in the main panel (controlled, so it survives the Move dialog closing this view). */
  folderId: string;
  onFolderChange: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  /** Spotlight one row (e.g. what onboarding just created), by node key. */
  spotlight?: string;
  /** A folder just created, flashed in the tree. */
  flashFolderId?: string | null;
  onClose: () => void;
  onOpenProject: (projectId: string) => void;
  onOpenFolder: (folderId: string) => void;
  onNewProject: (folderId: string) => void;
  onNewFolder: (parentId: string) => void;
  onMove: (key: string) => void;
  onClone: (projectId: string, folderId: string) => void;
};

export function AllProjectsView({
  client,
  root,
  current,
  modulesOf,
  folderId,
  onFolderChange,
  query,
  onQueryChange,
  spotlight,
  flashFolderId,
  onClose,
  onOpenProject,
  onOpenFolder,
  onNewProject,
  onNewFolder,
  onMove,
  onClone,
}: AllProjectsViewProps) {
  const [types, setTypes] = React.useState<Set<ProjectType>>(() => new Set());
  const q = query.trim().toLowerCase();
  const searching = !!q;
  const filtering = types.size > 0;

  const folderTrail = (findTrail(root, isFolderId(folderId)) ?? [root]) as FolderNode[];
  const folder = folderTrail.at(-1)!;

  /* ── What matches: a project's types are its modules; search looks at project and folder names (and the game). ── */
  const projectOf = React.useCallback((id: string) => client.projects.find((p) => p.id === id), [client.projects]);
  const typeOk = (p: Project) => !filtering || modulesOf(p).some((m) => types.has(m));
  const textOk = (n: TreeNode, p?: Project) => !searching || nodeName(client, n).toLowerCase().includes(q) || !!p?.game.toLowerCase().includes(q);

  // Every folder's matching projects (at any depth below it), counted once from the data.
  const counts = new Map<string, number>();
  const folderHit = new Set<string>(); // folders whose own name matches the search
  const countIn = (f: FolderNode, inMatchedFolder: boolean): number => {
    const named = searching && f.id !== ROOT_FOLDER_ID && f.name.toLowerCase().includes(q);
    if (named) folderHit.add(f.id);
    let n = 0;
    for (const c of f.children) {
      if (c.kind === "folder") n += countIn(c, inMatchedFolder || named);
      else {
        const p = projectOf(c.id);
        if (p && typeOk(p) && (inMatchedFolder || named || textOk(c, p))) n++;
      }
    }
    counts.set(f.id, n);
    return n;
  };
  countIn(root, false);
  const allProjects = client.projects.filter((p) => !p.pending && findTrail(root, isProjectId(p.id)));
  const folderTotal = (function walk(f: FolderNode): number {
    return f.children.reduce((s, c) => s + (c.kind === "folder" ? 1 + walk(c) : 0), 0);
  })(root);

  /** A folder shows in the tree when nothing narrows it, or when it (or something below it) matches. */
  const folderVisible = (f: FolderNode): boolean =>
    f.id === ROOT_FOLDER_ID || (!searching && !filtering) || (counts.get(f.id) ?? 0) > 0 || (searching && !filtering && subtreeNamed(f));
  const subtreeNamed = (f: FolderNode): boolean => folderHit.has(f.id) || f.children.some((c) => c.kind === "folder" && subtreeNamed(c));

  /* ── Tree open state: the path to the selected folder opens; searching opens everything that matches. ── */
  // Opens fully expanded: every folder shows its sub-folders and projects; a chevron closes any of them.
  const [open, setOpen] = React.useState<Set<string>>(
    () => new Set((function all(f: FolderNode): string[] { return [f.id, ...f.children.flatMap((c) => (c.kind === "folder" ? all(c) : []))]; })(root)),
  );
  /** A project picked in the tree: its folder shows on the right with that project highlighted. */
  const [picked, setPicked] = React.useState<string | null>(null);
  const spot = picked ?? spotlight;
  const [closed, setClosed] = React.useState<Set<string>>(() => new Set());
  const isOpen = (id: string) => !closed.has(id) && (open.has(id) || folderTrail.some((f) => f.id === id) || searching || filtering);
  const toggle = (id: string) => {
    const was = isOpen(id);
    setOpen((s) => {
      const n = new Set(s);
      if (was) n.delete(id);
      else n.add(id);
      return n;
    });
    setClosed((s) => {
      const n = new Set(s);
      if (was) n.add(id);
      else n.delete(id);
      return n;
    });
  };
  const choose = (id: string) => {
    onFolderChange(id);
    setClosed((s) => {
      const n = new Set(s);
      (findTrail(root, isFolderId(id)) ?? []).forEach((f) => n.delete(f.id));
      return n;
    });
  };

  /* ── Main panel rows ── */
  const subFolders = sortChildren(client, folder.children).filter((c): c is FolderNode => c.kind === "folder" && folderVisible(c));
  const directProjects = sortChildren(client, folder.children).flatMap((c) => {
    if (c.kind !== "project") return [];
    const p = projectOf(c.id);
    return p && typeOk(p) && textOk(c, p) ? [{ node: c, project: p }] : [];
  });
  // Searching looks across the whole workspace; each hit shows the folder it's in.
  const results = searching
    ? (function collect(f: FolderNode, path: FolderNode[], inMatched: boolean): { node: TreeNode; project?: Project; path: FolderNode[] }[] {
        const here = [...path, f];
        return f.children.flatMap((c) => {
          if (c.kind === "folder") {
            const named = c.name.toLowerCase().includes(q);
            const self = named && !filtering ? [{ node: c as TreeNode, path: here }] : [];
            return [...self, ...collect(c, here, inMatched || named)];
          }
          const p = projectOf(c.id);
          return p && typeOk(p) && (inMatched || textOk(c, p)) ? [{ node: c as TreeNode, project: p, path: here }] : [];
        });
      })(root, [], false)
    : [];
  const resultProjects = results.filter((r) => r.project).length;

  const toggleType = (t: ProjectType) =>
    setTypes((s) => {
      const n = new Set(s);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  const typeCount = (t: ProjectType) => allProjects.filter((p) => modulesOf(p).includes(t as ModuleId)).length;

  /* ── Rows ── */

  const treeRow = (f: FolderNode, depth: number): React.ReactNode => {
    if (!folderVisible(f)) return null;
    const kids = sortChildren(client, f.children).filter((c): c is FolderNode => c.kind === "folder");
    // The folder's own projects, shown under it in the tree when it's open (narrowed by search and type filters).
    const leaves = sortChildren(client, f.children).flatMap((c) => {
      if (c.kind !== "project") return [];
      const p = projectOf(c.id);
      return p && typeOk(p) && textOk(c, p) ? [{ node: c, project: p }] : [];
    });
    const opened = isOpen(f.id);
    const selected = f.id === folder.id;
    const isRoot = f.id === ROOT_FOLDER_ID;
    const n = counts.get(f.id) ?? 0;
    return (
      <React.Fragment key={f.id}>
        <div
          role="treeitem"
          aria-selected={selected}
          aria-expanded={opened}
          className={cn(
            "group/tree flex h-8 items-center gap-1 rounded-md pr-2 text-sm transition-colors",
            selected ? "bg-accent font-medium text-foreground" : "text-foreground/85 hover:bg-accent/60",
            flashFolderId === f.id && "bg-info/15 duration-700",
          )}
          style={{ paddingLeft: 4 + depth * 16 }}
        >
          {/* Every folder has a chevron, empty ones too. */}
          <button
            type="button"
            onClick={() => toggle(f.id)}
            aria-label={opened ? `Collapse ${isRoot ? client.company.name : f.name}` : `Expand ${isRoot ? client.company.name : f.name}`}
            className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            <IconChevronRight className={cn("size-3.5 transition-transform", opened && "rotate-90")} />
          </button>
          <button type="button" onClick={() => { choose(f.id); setPicked(null); }} className="flex min-w-0 flex-1 items-center gap-2 text-left" title={trailNames(client, findTrail(root, isFolderId(f.id)) ?? [root]).join(" / ")}>
            {isRoot ? (
              <CompanyLogo clientId={client.id} className="size-5 shrink-0 rounded-[5px]" />
            ) : selected ? (
              <IconFolderOpen className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <IconFolderFilled className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{isRoot ? client.company.name : f.name}</span>
          </button>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" aria-label={`${n} ${n === 1 ? "project" : "projects"}`}>
            {n}
          </span>
        </div>
        {opened ? (
          <>
            {kids.map((k) => treeRow(k, depth + 1))}
            {leaves.map(({ node, project }) => {
              const key = nodeKey(node);
              return (
                <button
                  key={key}
                  type="button"
                  role="treeitem"
                  aria-selected={picked === key}
                  onClick={() => {
                    choose(f.id);
                    setPicked(key);
                  }}
                  className={cn(
                    "flex h-8 w-full items-center gap-2 rounded-md pr-2 text-left text-sm transition-colors",
                    picked === key ? "bg-accent/70 text-foreground" : "text-foreground/85 hover:bg-accent/60",
                  )}
                  style={{ paddingLeft: 4 + (depth + 1) * 16 + 24 }}
                  title={nodeName(client, node)}
                >
                  <ProjectChip initials={project.gameInitials} icon={project.gameIcon} className="size-4 rounded-[4px] text-[7px]" />
                  <span className="truncate">{nodeName(client, node)}</span>
                </button>
              );
            })}
            {!kids.length && !leaves.length && !isRoot ? (
              <p className="flex h-7 items-center text-xs text-muted-foreground" style={{ paddingLeft: 4 + (depth + 1) * 16 + 24 }}>
                Empty
              </p>
            ) : null}
          </>
        ) : null}
      </React.Fragment>
    );
  };

  const projectRow = (node: TreeNode, p: Project, path?: FolderNode[]) => {
    const key = nodeKey(node);
    const isCurrent = current.kind === "project" && current.id === p.id;
    const parentId = path?.at(-1)?.id ?? folder.id;
    return (
      <li
        key={key}
        ref={spot === key ? (el) => el?.scrollIntoView({ block: "nearest" }) : undefined}
        className={cn(
          "group/proj flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
          isCurrent ? "bg-accent" : "hover:bg-accent/60",
          spot === key && "ring-2 ring-info/45 ring-inset",
        )}
      >
        <button type="button" onClick={() => onOpenProject(p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ProjectChip initials={p.gameInitials} icon={p.gameIcon} className="size-9 rounded-lg text-[11px]" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[14px] font-medium text-foreground">{nodeName(client, node)}</span>
              {isCurrent ? (
                <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground">
                  <IconCheck className="size-3" aria-hidden />
                  Current
                </span>
              ) : null}
            </span>
            {path ? <span className="truncate text-xs text-muted-foreground">{trailNames(client, path).join(" / ")}</span> : null}
          </span>
          <span className="hidden shrink-0 sm:block">
            <ModuleBadge modules={modulesOf(p)} />
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More actions for ${nodeName(client, node)}`}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover/proj:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 data-[popup-open]:opacity-100"
          >
            <IconDots className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onOpenProject(p.id)}>
              <IconArrowUpRight className="size-4" />
              Open project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMove(key)}>
              <IconFolderFilled className="size-4" />
              Move to folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onClone(p.id, parentId)}>
              <IconCopy className="size-4" />
              Clone project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    );
  };

  const folderRow = (f: FolderNode, path?: FolderNode[]) => {
    const n = counts.get(f.id) ?? 0;
    return (
      <li key={f.id}>
        <button type="button" onClick={() => (path ? (onQueryChange(""), choose(f.id)) : choose(f.id))} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent/60">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <IconFolderFilled className="size-4.5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14px] font-medium text-foreground">{f.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {path ? `${trailNames(client, path).join(" / ")} · ` : ""}
              {n} {n === 1 ? "project" : "projects"}
            </span>
          </span>
          <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </li>
    );
  };

  const shownCount = searching ? resultProjects : directProjects.length;

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-lg font-semibold text-foreground">All projects</h2>
          <p className="text-sm text-muted-foreground">
            {folderTotal} {folderTotal === 1 ? "folder" : "folders"} · {allProjects.length} {allProjects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <IconX className="size-4.5" />
        </button>
      </div>

      {/* Search and type filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
        <label className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-[3px] focus-within:ring-ring/30 sm:max-w-sm">
          <IconSearch className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                e.stopPropagation();
                onQueryChange("");
              }
            }}
            placeholder="Search folders or projects"
            aria-label="Search folders or projects"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search" className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground">
              <IconX className="size-3.5" />
            </button>
          ) : null}
        </label>
        <div role="group" aria-label="Project type" className="flex flex-wrap items-center gap-1.5">
          {TYPES.map((t) => {
            const on = types.has(t.id);
            const n = typeCount(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleType(t.id)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
                  on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                <t.icon className="size-3.5" />
                {t.label}
                <span className={cn("tabular-nums", on ? "text-background/70" : "text-muted-foreground/70")}>{n}</span>
              </button>
            );
          })}
          {filtering ? (
            <button type="button" onClick={() => setTypes(new Set())} className="h-8 px-2 text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Folder tree | folder contents */}
      <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
        <aside className="hidden min-h-0 flex-col border-r border-border md:flex">
          <div role="tree" aria-label="Folders" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {treeRow(root, 0)}
          </div>
          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={() => onNewFolder(folder.id)}
              className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <IconFolderPlus className="size-4" />
              New folder
            </button>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 px-5 pt-4 pb-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {searching ? (
                <p className="truncate text-[15px] font-semibold text-foreground">Results for “{query.trim()}”</p>
              ) : (
                <nav aria-label="Folder path" className="flex min-w-0 flex-wrap items-center gap-1 text-[15px]">
                  {folderTrail.map((f, i) => {
                    const last = i === folderTrail.length - 1;
                    const label = f.id === ROOT_FOLDER_ID ? client.company.name : f.name;
                    return (
                      <React.Fragment key={f.id}>
                        {i > 0 ? <IconChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden /> : null}
                        {last ? (
                          <span className="truncate font-semibold text-foreground" aria-current="page">
                            {label}
                          </span>
                        ) : (
                          <button type="button" onClick={() => choose(f.id)} className="truncate rounded px-0.5 text-muted-foreground hover:text-foreground">
                            {label}
                          </button>
                        )}
                      </React.Fragment>
                    );
                  })}
                </nav>
              )}
              <p className="text-sm text-muted-foreground" role="status">
                {shownCount} {shownCount === 1 ? "project" : "projects"}
                {filtering ? ` · ${[...types].map((t) => TYPES.find((x) => x.id === t)!.label).join(", ")}` : ""}
              </p>
            </div>
            {!searching ? (
              <Button variant="outline" size="sm" onClick={() => onOpenFolder(folder.id)} className="shrink-0 gap-1.5">
                Open folder view
                <IconArrowUpRight className="size-3.5" />
              </Button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
            {searching ? (
              results.length ? (
                <ul className="flex flex-col gap-0.5">
                  {results.map((r) => (r.project ? projectRow(r.node, r.project, r.path) : folderRow(r.node as FolderNode, r.path)))}
                </ul>
              ) : (
                <Empty title={`Nothing matches “${query.trim()}”`} hint={filtering ? "Try another search, or clear the type filters." : "Try another name."} />
              )
            ) : subFolders.length || directProjects.length ? (
              <ul className="flex flex-col gap-0.5">
                {subFolders.map((f) => folderRow(f))}
                {subFolders.length && directProjects.length ? <li aria-hidden className="mx-3 my-1.5 border-t border-border" /> : null}
                {directProjects.map(({ node, project }) => projectRow(node, project))}
              </ul>
            ) : filtering ? (
              <Empty title="No projects of this type here" hint="Pick another folder, or clear the type filters." />
            ) : (
              <Empty
                title="No projects in this folder yet"
                hint="Create one here, or move projects in from their ⋯ menu."
                action={
                  // New project always comes with New folder beside it, as the secondary action.
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onNewFolder(folder.id)} className="gap-1.5">
                      <IconFolderPlus className="size-3.5" />
                      New folder
                    </Button>
                    <Button size="sm" onClick={() => onNewProject(folder.id)} className="gap-1.5">
                      <IconPlus className="size-3.5" />
                      New project here
                    </Button>
                  </div>
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Empty({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="mx-2 mt-2 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
