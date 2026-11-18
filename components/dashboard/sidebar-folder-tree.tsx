"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconArrowsMaximize,
  IconBuildingStore,
  IconCheck,
  IconChevronRight,
  IconCircleFilled,
  IconDots,
  IconFilter,
  IconFolderFilled,
  IconFolderPlus,
  IconFolderSymlink,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconPlus,
  IconPuzzle,
  IconSearch,
  IconSettings,
  IconTrash,
  IconUsers,
  IconX,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AllProjectsView } from "@/components/dashboard/all-projects-view";
import { useCreateProject } from "@/components/dashboard/create-project-modal";
import { isGuideEvent } from "@/components/dashboard/flow-guide";
import {
  AccessDialog,
  BulkMoveDialog,
  DeleteFolderDialog,
  MoveDialog,
  NewFolderPanel,
  RenameBox,
  useSelectorUi,
  type SelectorLocation,
} from "@/components/dashboard/folder-selector";
import { CompanyMark, MODULE_ICON, ProjectChip, useModulesOf } from "@/components/dashboard/project-bits";
import { useDemo, useFolderTree, useSandboxes } from "@/components/dashboard/providers";
import { useAddModule } from "@/components/dashboard/add-module-modal";
import {
  companyHref,
  projectHref,
  DEFAULT_ENV_ID,
  MODULE_IDS,
  MODULE_LABEL,
  PROJECT_SECTION_IDS,
  type ClientConfig,
  type FolderNode,
  type ModuleId,
  type TreeNode,
} from "@/lib/newgen";
import {
  FOLDER_NAME_MAX,
  NAME_TAKEN,
  deleteBlockedReason,
  findTrail,
  insertFolder,
  isFolderId,
  isProjectId,
  makeFolderId,
  matchKey,
  moveNode,
  nameTaken,
  nodeKey,
  nodeName,
  removeFolder,
  renameFolder,
  searchTree,
  sortChildren,
  trailNames,
} from "@/lib/folders";
import { SimpleTooltip } from "@/components/newgen-system-design";
import { cn } from "@/lib/utils";
import { useOpenEnv } from "@/components/dashboard/env-session";

// 20px a level: a child's chevron sits under its parent's icon.
const ROW_INDENT = 20;
/** The header buttons' tooltips: below the buttons (clear of the top bar), shown at full strength straight away (no fade,
 *  which read as a faint grey chip), with a shadow to lift them off the white panel. */
const HEADER_TIP = { appearance: "workspace", side: "bottom", delayDuration: 120, className: "animate-none! shadow-md" } as const;

const iconButton =
  "flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring";
const menuItem =
  "flex h-7 w-full items-center gap-2 rounded px-2 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent";

/** How a project row shows its modules (design options): A, a subtitle line under the name; B, an icon each; C, short
 *  chips. A is on. */
const MODULE_MARK = "subtitle" as "subtitle" | "icons" | "chips";
const MODULE_SHORT: Record<ModuleId, string> = { webstore: "WS", "payment-links": "PL", "direct-checkout": "DC" };

/**
 * Folders & projects: the one place folders and projects are navigated and managed (design review: navigation from a
 * single point, in the sidebar). The company's folders and projects as a tree — a folder opens its Home, a project
 * opens its Home, and the path to where you are opens by itself. The header has search, the bigger view (All projects)
 * and + (New folder, New project); each row has a ⋯ menu with the actions the old top-bar selector had (Foldering PRD,
 * Stories 1–5). Rename happens in place; New folder, Move, Who has access and Delete open the shared panels and
 * dialogs from folder-selector.tsx. What's open is kept in the URL (`?panel=…`), so other screens can link to it.
 */
export function SidebarFolderTree({
  client,
  current,
  sectionId,
  envId = DEFAULT_ENV_ID,
}: {
  client: ClientConfig;
  current: SelectorLocation;
  /** The current section: a project's "Open in" an environment keeps it when the project has it too. */
  sectionId?: string;
  envId?: string;
}) {
  const router = useRouter();
  const { root, edit } = useFolderTree(client);
  const { byProject } = useSandboxes();
  const demo = useDemo();
  const modulesOf = useModulesOf();
  const openAddModule = useAddModule();
  const [ui, setUi] = useSelectorUi();
  const createProject = useCreateProject();

  const menuFor = ui.panel === "menu" ? ui.item : undefined;
  const renaming = ui.panel === "rename" ? ui.item : undefined;

  const trail = findTrail(root, current.kind === "folder" ? isFolderId(current.id) : isProjectId(current.id)) ?? [root];
  const here = trail.at(-1)!;
  /** The folder a "new" action defaults to: the current folder, or the project's parent. */
  const currentFolderId = (here.kind === "folder" ? here : trail.at(-2) ?? root).id;

  /* ── Search: a compact filter under the header. A `q` in the URL (a link to a search) opens it. ── */
  const [query, setQuery] = React.useState(ui.q ?? "");
  const [searching, setSearching] = React.useState(!!ui.q);
  const [seenQ, setSeenQ] = React.useState(ui.q);
  if (ui.q !== seenQ) {
    setSeenQ(ui.q);
    if (ui.q && ui.panel !== "browse") {
      setQuery(ui.q);
      setSearching(true);
    }
  }
  const endSearch = () => {
    setQuery("");
    setSearching(false);
  };
  /* ── Filter by module: chips under the header (Webstore, Payment Links, Direct Checkout). On, the tree shows only the
     projects with any of the picked modules, and the folders on their way, all open. ── */
  const [showFilter, setShowFilter] = React.useState(false);
  const [modFilter, setModFilter] = React.useState<ModuleId[]>([]);
  const filterOn = modFilter.length > 0;
  const visible = (n: TreeNode): boolean => {
    if (!filterOn) return true;
    if (n.kind === "project") {
      const p = client.projects.find((x) => x.id === n.id);
      return !!p && modulesOf(p).some((m) => modFilter.includes(m));
    }
    return (n as FolderNode).children.some(visible);
  };
  const results = searchTree(client, root, query).filter((r) => visible(r.node));

  /* ── Open folders: the path to where you are opens by itself (unless the user closed a folder there); the path to
     the row whose menu or rename box is showing, and to what onboarding just made, is always open. ── */
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set());
  // The folder of the row under the pointer: its indent guide darkens and its name turns bold.
  const [hoverParent, setHoverParent] = React.useState<string | null>(null);
  const folderIds = (ns: TreeNode[]) => ns.filter((n) => n.kind === "folder").map((n) => n.id);
  const itemTrail = ui.item ? findTrail(root, matchKey(ui.item)) : null;
  const freshTrail = ui.fresh ? findTrail(root, matchKey(ui.fresh)) : null;
  const forced = folderIds(trail);
  const pinnedOpen = [...folderIds(itemTrail ?? []), ...folderIds(freshTrail ?? [])];
  const isExpanded = (id: string) => pinnedOpen.includes(id) || (!collapsed.has(id) && (expanded.has(id) || forced.includes(id)));
  // A new location reopens the path to it.
  const locationKey = `${current.kind}:${current.id}`;
  const [seenLocation, setSeenLocation] = React.useState(locationKey);
  if (locationKey !== seenLocation) {
    setSeenLocation(locationKey);
    setCollapsed(new Set());
  }
  const allFolderIds = (f: FolderNode): string[] => [f.id, ...f.children.flatMap((c) => (c.kind === "folder" ? allFolderIds(c) : []))];
  // Opened with ?expand=all (onboarding's new folders): every folder starts open.
  const [seenExpand, setSeenExpand] = React.useState<string | undefined>(undefined);
  if (ui.expand !== seenExpand) {
    setSeenExpand(ui.expand);
    if (ui.expand === "all") {
      setExpanded(new Set(allFolderIds(root)));
      setCollapsed(new Set());
    }
  }
  const toggle = (id: string) => {
    const open = isExpanded(id);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (open) next.delete(id);
      else next.add(id);
      return next;
    });
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  /* ── Navigation ── */

  const folderTarget = (id: string) => companyHref(client.id, "home", id);
  // Opening a project without picking an environment uses the session's (Foldering PRD, Story 9).
  const openEnv = useOpenEnv(client);
  const projectTarget = (id: string, env = openEnv(id)) =>
    projectHref(id, sectionId && PROJECT_SECTION_IDS.includes(sectionId) ? sectionId : "home", env);
  const go = (href: string) => router.push(href);

  /* ── The bigger view (All projects): the folder its main panel shows, its New folder form, and whether a dialog it
     opened (Move) should come back to it. ── */
  const [browseFolder, setBrowseFolder] = React.useState<string | null>(null);
  const [browseNewFolder, setBrowseNewFolder] = React.useState<string | null>(null);
  const backToBrowser = React.useRef(false);
  const closeSub = () => {
    setUi(backToBrowser.current ? { panel: "browse" } : null);
    backToBrowser.current = false;
  };
  const openBrowser = () => {
    setBrowseFolder(null);
    setUi({ panel: "browse" });
  };

  /* ── Edits ── */

  const pathOf = (id: string) => trailNames(client, findTrail(root, isFolderId(id)) ?? [root]);
  const subjectName = itemTrail ? nodeName(client, itemTrail.at(-1)!) : "";

  /** R14: "Move N projects here" — the folder the top-level projects can be moved into. */
  const [bulkTo, setBulkTo] = React.useState<string | null>(null);
  /** The folder just created, highlighted in the tree for a moment. */
  const [flash, setFlash] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(t);
  }, [flash]);

  const createFolder = (parentId: string, name: string, then: "browse" | null = null) => {
    const f: FolderNode = { kind: "folder", id: makeFolderId(name), name: name.trim(), children: [] };
    edit((t) => insertFolder(t, parentId, f));
    // R14 (V-04): projects still sitting at the top level can follow the new folder in one go.
    const loose = root.children.filter((c) => c.kind === "project").length;
    toast(`${f.name} created in ${pathOf(parentId).join(" / ")}`, loose ? {
      duration: 10000,
      action: { label: `Move ${loose} ${loose === 1 ? "project" : "projects"} here`, onClick: () => setBulkTo(f.id) },
    } : undefined);
    // Stay where you are: the parent opens in the tree and the new row is highlighted for a moment.
    const parents = folderIds(findTrail(root, isFolderId(parentId)) ?? [root]);
    setExpanded((prev) => new Set([...prev, ...parents]));
    setCollapsed((prev) => new Set([...prev].filter((id) => !parents.includes(id))));
    setFlash(f.id);
    // From the bigger view, stay there; otherwise go into the new folder (its Overview).
    if (then) setUi({ panel: then });
    else go(folderTarget(f.id));
  };

  const renameSiblings = itemTrail?.at(-2)?.kind === "folder" ? (itemTrail.at(-2) as FolderNode).children : [];
  const renameError = (value: string) =>
    value.trim().length > FOLDER_NAME_MAX
      ? `Use up to ${FOLDER_NAME_MAX} characters`
      : renaming && nameTaken(client, renameSiblings, value, renaming)
        ? NAME_TAKEN
        : null;
  const commitRename = (value: string) => {
    if (!renaming || !value.trim() || renameError(value)) return;
    edit((t) => renameFolder(t, renaming.slice(2), value));
    setUi(null);
  };

  /* Toggles: on the pinned item it reads "Unpin default view" and clears the pin. */
  const pin = (key: string, name: string) => {
    const unpin = demo.pinned === key;
    demo.set((s) => ({ ...s, pinned: unpin ? null : key }));
    toast(unpin ? `${name} unpinned. The Dashboard opens where you left off.` : `${name} pinned. The Dashboard opens here when you sign in.`);
    setUi(null);
  };

  /** The project ⋯ menu's page: its actions, the module list (Add module…), or the confirm for one module. */
  const [menuView, setMenuView] = React.useState<"main" | "modules" | ModuleId>("main");
  const [seenMenu, setSeenMenu] = React.useState(menuFor);
  if (menuFor !== seenMenu) {
    setSeenMenu(menuFor);
    setMenuView("main");
  }
  /** Module Management PRD, Story 1: add a module to a project, in Production and every sandbox, for good. */
  const addModule = (projectId: string, projectName: string, m: ModuleId) => {
    demo.set((st) => ({ ...st, added: { ...st.added, [projectId]: [...new Set([...(st.added[projectId] ?? []), m])] } }));
    toast(`${MODULE_LABEL[m]} added to ${projectName}`);
    setUi(null);
  };

  /** A ⋯ action that moves focus elsewhere (the rename box, a dialog): the closing menu must not pull it back. */
  const focusAway = React.useRef(false);
  const act = (next: Parameters<typeof setUi>[0]) => {
    focusAway.current = true;
    setUi(next);
  };

  /** The ⋯ menu for one row: the same actions, in the same order, as the old top-bar selector's. */
  const renderMenu = (n: TreeNode, key: string) => {
    const depth = (findTrail(root, matchKey(key))?.length ?? 1) - 1;
    const name = nodeName(client, n);
    const menuProject = n.kind === "project" ? client.projects.find((p) => p.id === n.id) : undefined;
    const projectMods = menuProject ? modulesOf(menuProject) : [];
    if (n.kind === "folder") {
      /* Folder ⋯: Pin as default view, Who has access, then Admin actions. */
      const blocked = deleteBlockedReason(n);
      return (
        <>
          <button type="button" role="menuitem" className={menuItem} onClick={() => pin(key, name)}>
            {demo.pinned === key ? <IconPinnedOff className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : <IconPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
            {demo.pinned === key ? "Unpin default view" : "Pin as default view"}
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => act({ panel: "access", item: key })}>
            <IconUsers className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            Who has access
          </button>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            role="menuitem"
            className={menuItem}
            // At level 4 it still opens the form, which explains the limit (an error, not a silent grey item).
            onClick={() => act({ panel: "new-folder", parent: n.id })}
          >
            <IconFolderPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            New sub-folder
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => act({ panel: "rename", item: key })}>
            <IconPencil className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            Rename
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => act({ panel: "move", item: key })}>
            <IconFolderSymlink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            Move to
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!!blocked}
            title={blocked ? "Move or remove its contents first" : undefined}
            onClick={() => act({ panel: "delete", item: key })}
            className={cn(menuItem, "text-destructive hover:bg-destructive/10")}
          >
            <IconTrash className="size-4 shrink-0" aria-hidden />
            Delete
            {blocked ? <span className="ml-auto text-[11px]">Move or remove its contents first</span> : null}
          </button>
        </>
      );
    }
    /* Project ⋯: Open in an environment, Pin, Project settings, Who has access, then Admin actions. */
    if (menuView === "modules") {
      /* Add module… : the same list as Administration › Module management. */
      return (
        <>
          <button type="button" role="menuitem" className={cn(menuItem, "text-muted-foreground")} onClick={() => setMenuView("main")}>
            <IconArrowLeft className="size-3.5" aria-hidden />
            Add module
          </button>
          <div className="my-1 border-t border-border" />
          {MODULE_IDS.map((m) => {
            const Icon = MODULE_ICON[m];
            const added = projectMods.includes(m);
            return (
              <button
                key={m}
                type="button"
                role="menuitem"
                className={menuItem}
                disabled={added}
                // The Add module dialog, on the modules step with this one checked, then a success step.
                onClick={() => {
                  setUi(null);
                  if (menuProject) openAddModule(menuProject, m);
                }}
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="flex-1">{MODULE_LABEL[m]}</span>
                {added ? <span className="text-[11px] text-muted-foreground">Added</span> : null}
              </button>
            );
          })}
          <button type="button" role="menuitem" className={menuItem} disabled>
            <IconBuildingStore className="size-4 text-muted-foreground opacity-0" aria-hidden />
            <span className="flex-1">App Direct</span>
            <span className="text-[11px] text-muted-foreground">Coming soon</span>
          </button>
        </>
      );
    }
    if (menuView !== "main") {
      /* Confirm (Module Management PRD, Story 1): modules can't be removed once added. */
      return (
        <div className="flex flex-col gap-3 p-2">
          <p className="text-sm font-medium">Add {MODULE_LABEL[menuView]}?</p>
          <p className="text-sm text-muted-foreground">
            {MODULE_LABEL[menuView]} will be added to Production and all sandboxes. You can&apos;t remove it later.
          </p>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setMenuView("modules")}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => addModule(n.id, name, menuView)}>
              Add {MODULE_LABEL[menuView]}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <>
        <p className="px-2 pt-1 pb-1 text-xs text-muted-foreground">Open in</p>
        {[...client.environments, ...(byProject[n.id] ?? [])].map((e) => {
          const on = current.kind === "project" && current.id === n.id && e.id === envId;
          return (
            <button key={e.id} type="button" role="menuitem" onClick={() => go(projectTarget(n.id, e.id))} className={menuItem}>
              <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                <IconCircleFilled className="size-2" style={{ color: e.color }} />
              </span>
              <span className="flex-1">{e.name}</span>
              <span className="text-[11px] text-muted-foreground">{e.kind === "production" ? "Live" : "Test"}</span>
              {on ? <IconCheck className="size-3.5" aria-hidden /> : null}
            </button>
          );
        })}
        <div className="my-1 border-t border-border" />
        <button type="button" role="menuitem" className={menuItem} onClick={() => pin(key, name)}>
          {demo.pinned === key ? <IconPinnedOff className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : <IconPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
          {demo.pinned === key ? "Unpin default view" : "Pin as default view"}
        </button>
        <button type="button" role="menuitem" className={menuItem} onClick={() => go(projectHref(n.id, "adm-general", DEFAULT_ENV_ID))}>
          <IconSettings className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Project settings
        </button>
        <button type="button" role="menuitem" className={menuItem} onClick={() => act({ panel: "access", item: key })}>
          <IconUsers className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Who has access
        </button>
        <div className="my-1 border-t border-border" />
        {/* Admin only. Opens the project's Administration › Module management, where modules are added; once every
            module is in, it reads Manage modules. */}
        <button type="button" role="menuitem" className={menuItem} onClick={() => go(projectHref(n.id, "adm-modules", DEFAULT_ENV_ID))}>
          <IconPuzzle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {MODULE_IDS.every((m) => projectMods.includes(m)) ? "Manage modules" : "Add module"}
        </button>
        <button type="button" role="menuitem" className={menuItem} onClick={() => act({ panel: "move", item: key })}>
          <IconFolderSymlink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Move to folder
        </button>
        <button type="button" role="menuitem" className={cn(menuItem, "text-destructive")} disabled>
          <IconTrash className="size-4 shrink-0" aria-hidden />
          Delete
        </button>
      </>
    );
  };

  /* ── Drag a project onto a folder (usability test). Dropping opens the Move dialog with From and To filled in, so
     the access impact is still shown before anything moves (Foldering PRD, Story 5). ── */
  const [drag, setDrag] = React.useState<{ key: string; name: string; parentId?: string } | null>(null);
  const [dropId, setDropId] = React.useState<string | null>(null);
  const expandTimer = React.useRef<{ id: string; t: ReturnType<typeof setTimeout> } | null>(null);
  const stopExpandTimer = () => {
    if (expandTimer.current) clearTimeout(expandTimer.current.t);
    expandTimer.current = null;
  };
  const endDrag = () => {
    stopExpandTimer();
    setDrag(null);
    setDropId(null);
  };
  /** A folder takes the drop unless it's where the project already is, or the name is taken there. */
  const canDrop = (f: FolderNode) => !!drag && f.id !== drag.parentId && !nameTaken(client, f.children, drag.name, drag.key);
  React.useEffect(() => stopExpandTimer, []);

  /* ── Rows ── */

  /** A folder's own projects first, then its sub-folders, so what's directly inside a folder sits right under it. */
  const contents = (nodes: TreeNode[]) => {
    const sorted = sortChildren(client, nodes).filter(visible);
    return [...sorted.filter((c) => c.kind !== "folder"), ...sorted.filter((c) => c.kind === "folder")];
  };

  /** `ancestors`: the folders above this row (the organization left out), for the indent guides. */
  const row = (n: TreeNode, depth: number, ancestors: string[] = []): React.ReactNode => {
    const isFolder = n.kind === "folder";
    const key = nodeKey(n);
    const project = isFolder ? undefined : client.projects.find((p) => p.id === n.id);
    const mods = project ? modulesOf(project) : [];
    const name = nodeName(client, n);
    const open = isFolder && (filterOn || isExpanded(n.id));
    const kids = isFolder ? contents((n as FolderNode).children) : [];
    const here = n.kind === current.kind && n.id === current.id;
    const menuOpen = menuFor === key;
    return (
      <li key={key}>
        <div
          className={cn(
            // Project rows hold two lines (name, then its modules), so they're 40px; folder rows stay 32px.
            "group/tree relative flex items-center gap-1 rounded-md pr-1 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            isFolder ? "h-8" : "h-10",
            here && "bg-sidebar-accent font-medium text-sidebar-foreground",
            project && renaming !== key && "cursor-grab active:cursor-grabbing",
            drag?.key === key && "opacity-40",
            dropId === n.id && isFolder && "bg-sidebar-accent ring-2 ring-sidebar-foreground/25 ring-inset",
            flash === n.id && "bg-sidebar-accent transition-colors duration-700",
            // Just made in onboarding: spotlit until the URL moves on.
            ui.fresh === key && "ring-2 ring-info/45 ring-inset",
            // Hovering a row names its folder: the folder's name darkens with its guide.
            isFolder && hoverParent === n.id && "text-sidebar-foreground [&_a>span]:font-semibold",
          )}
          ref={ui.fresh === key ? (el) => el?.scrollIntoView({ block: "nearest" }) : undefined}
          style={{ paddingLeft: 4 + depth * ROW_INDENT }}
          onMouseEnter={() => setHoverParent(ancestors.at(-1) ?? null)}
          draggable={!!project && renaming !== key}
          onDragStart={
            project
              ? (e) => {
                  e.dataTransfer.setData("text/plain", key);
                  e.dataTransfer.effectAllowed = "move";
                  setDrag({ key, name, parentId: findTrail(root, isProjectId(n.id))?.at(-2)?.id });
                }
              : undefined
          }
          onDragEnd={project ? endDrag : undefined}
          onDragOver={
            isFolder
              ? (e) => {
                  if (!canDrop(n as FolderNode)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dropId !== n.id) setDropId(n.id);
                  // Hovering a closed folder opens it, so a project can go into a sub-folder.
                  if (kids.length && !open && expandTimer.current?.id !== n.id) {
                    stopExpandTimer();
                    expandTimer.current = { id: n.id, t: setTimeout(() => setExpanded((prev) => new Set([...prev, n.id])), 600) };
                  }
                }
              : undefined
          }
          onDragLeave={
            isFolder
              ? (e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                  if (dropId === n.id) setDropId(null);
                  if (expandTimer.current?.id === n.id) stopExpandTimer();
                }
              : undefined
          }
          onDrop={
            isFolder
              ? (e) => {
                  if (!drag || !canDrop(n as FolderNode)) return;
                  e.preventDefault();
                  const item = drag.key;
                  endDrag();
                  setUi({ panel: "move", item, to: n.id });
                }
              : undefined
          }
        >
          {/* Indent guides: a very light line under each folder above this row, through everything inside it. The
              hovered row's folder line darkens. */}
          {ancestors.map((a, i) => (
            <span
              key={a}
              aria-hidden
              className={cn("pointer-events-none absolute inset-y-0 w-px", hoverParent === a ? "bg-foreground/20" : "bg-foreground/[0.06]")}
              style={{ left: 4 + (i + 1) * ROW_INDENT + 9.5 }}
            />
          ))}
          {isFolder ? (
            <button
              type="button"
              onClick={() => toggle(n.id)}
              aria-label={open ? `Collapse ${name}` : `Expand ${name}`}
              aria-expanded={open}
              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <IconChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}
          {renaming === key ? (
            <RenameBox initial={name} error={renameError} onCommit={commitRename} onCancel={() => setUi(null)} />
          ) : (
            <Link
              href={isFolder ? folderTarget(n.id) : projectHref(n.id, "home", openEnv(n.id))}
              aria-current={here ? "page" : undefined}
              title={mods.length ? `${name} · ${mods.map((m) => MODULE_LABEL[m]).join(", ")}` : name}
              // The row itself is what drags (a project onto a folder), not the link.
              draggable={false}
              className="flex min-w-0 flex-1 items-center gap-2 rounded outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              {isFolder ? (
                <IconFolderFilled className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <ProjectChip initials={project?.gameInitials ?? "··"} icon={project?.gameIcon} className="size-4 rounded-[4px] text-[7px]" />
              )}
              {MODULE_MARK === "subtitle" && mods.length ? (
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate">{name}</span>
                  <span className="truncate text-[11px] font-normal text-muted-foreground">{mods.map((m) => MODULE_LABEL[m]).join(" · ")}</span>
                </span>
              ) : (
                <span className="min-w-0 flex-1 truncate">{name}</span>
              )}
              {/* A project's modules at the row's end: short chips (WS, PL, DC), or one icon each (MODULE_MARK). Their
                  names are in the row's tooltip and each mark's own. */}
              {MODULE_MARK !== "subtitle" && mods.length ? (
                <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                  {mods.map((m) => {
                    const Icon = MODULE_ICON[m];
                    return MODULE_MARK === "chips" ? (
                      <span
                        key={m}
                        title={MODULE_LABEL[m]}
                        aria-label={MODULE_LABEL[m]}
                        className="rounded-full border border-sidebar-border px-1.5 text-[10px] leading-4 font-medium tracking-wide whitespace-nowrap"
                      >
                        {MODULE_SHORT[m]}
                      </span>
                    ) : (
                      <span key={m} title={MODULE_LABEL[m]} aria-label={MODULE_LABEL[m]} role="img">
                        <Icon className="size-3.5" />
                      </span>
                    );
                  })}
                </span>
              ) : null}
              {demo.pinned === key ? <IconPin className="size-3 shrink-0 text-muted-foreground" aria-label="Pinned as default view" /> : null}
            </Link>
          )}
          {/* ⋯ — on hover or keyboard focus, and while its menu is open. */}
          <Popover
            open={menuOpen}
            onOpenChange={(v, d) => {
              if (v) setUi({ panel: "menu", item: key });
              else if (menuOpen && !isGuideEvent(d)) setUi(null);
            }}
          >
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label={`More actions for ${name}`}
                  className={cn(
                    iconButton,
                    "size-6 opacity-0 group-focus-within/tree:opacity-100 group-hover/tree:opacity-100 focus-visible:opacity-100",
                    menuOpen && "bg-sidebar-accent text-sidebar-foreground opacity-100",
                  )}
                />
              }
            >
              <IconDots className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={8}
              className="w-64 gap-0 p-1"
              finalFocus={() => {
                const away = focusAway.current;
                focusAway.current = false;
                return !away;
              }}
            >
              <div role="menu" aria-label={`${name} actions`}>
                {menuOpen ? renderMenu(n, key) : null}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {open ? (
          kids.length ? (
            <ul>{kids.map((c) => row(c, depth + 1, [...ancestors, n.id]))}</ul>
          ) : (
            <p className="relative h-7 text-xs leading-7 text-muted-foreground" style={{ paddingLeft: 4 + (depth + 1) * ROW_INDENT + 24 }}>
              {/* The guides carry on through an empty folder's line. */}
              {[...ancestors, n.id].map((a, i) => (
                <span
                  key={a}
                  aria-hidden
                  className={cn("pointer-events-none absolute inset-y-0 w-px", hoverParent === a ? "bg-foreground/20" : "bg-foreground/[0.06]")}
                  style={{ left: 4 + (i + 1) * ROW_INDENT + 9.5 }}
                />
              ))}
              Empty
            </p>
          )
        ) : null}
      </li>
    );
  };

  // The folder All projects shows first: what onboarding just made, else where the user is (a project's own folder).
  const freshParent = freshTrail ? (freshTrail.at(-1)!.kind === "folder" ? freshTrail.at(-1)! : freshTrail.at(-2)) : undefined;
  const shownFolder =
    browseFolder && findTrail(root, isFolderId(browseFolder)) ? browseFolder : (freshParent ?? (here.kind === "folder" ? here : trail.at(-2) ?? root)).id;

  return (
    <>
      {/* New folder (header +, a folder's New sub-folder, the empty Home, Ask AI, onboarding) opens right here, in the
          selector, in place of the tree; ← goes back to it. */}
      {ui.panel === "new-folder" ? (
        <div className="-my-2 duration-200 animate-in fade-in-0 slide-in-from-right-2 motion-reduce:animate-none">
          <NewFolderPanel
            key={`${ui.parent ?? currentFolderId}:${ui.name ?? ""}`}
            client={client}
            root={root}
            defaultParent={ui.parent ?? currentFolderId}
            initialName={ui.name ?? ""}
            onBack={() => setUi(null)}
            onCancel={() => setUi(null)}
            onCreate={(parentId, name) => createFolder(parentId, name)}
          />
        </div>
      ) : (
      <nav aria-label="Folders and projects" className="flex flex-col gap-1 px-3 group-data-[collapsible=icon]:hidden">
        {/* Header: the section's name and Search, then the bigger view and + (New folder, New project — Admins only; the
            demo user is Admin). Search opens in the title's place; closing it (✕, Escape, or leaving it empty) brings the
            title back. */}
        <div className="flex h-8 items-center gap-0.5 pr-1 pl-2">
          {searching ? (
            // No frame: the field sits in the title's line. It grows out from the search icon's spot (the right) while
            // fading in, and its icon slides in after it.
            <label className="mr-1 flex h-7 min-w-0 flex-1 origin-right items-center gap-1.5 duration-300 ease-out animate-in fade-in-0 zoom-in-95 slide-in-from-right-6 blur-in-[2px] motion-reduce:animate-none">
              <IconSearch className="size-3.5 shrink-0 text-muted-foreground delay-75 duration-300 animate-in fade-in-0 spin-in-[-30deg] motion-reduce:animate-none" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && endSearch()}
                onBlur={() => !query.trim() && endSearch()}
                placeholder="Search folders or projects"
                aria-label="Search folders or projects"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={endSearch} aria-label="Close search" className="text-muted-foreground transition-[color,transform] duration-200 hover:rotate-90 hover:text-foreground motion-reduce:transition-none">
                <IconX className="size-3.5" />
              </button>
            </label>
          ) : (
            <>
              {/* The title comes back from the left as the search closes. */}
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground duration-300 ease-out animate-in fade-in-0 slide-in-from-left-2 motion-reduce:animate-none">Folders &amp; projects</p>
              <SimpleTooltip content="Search" {...HEADER_TIP}>
                <button type="button" onClick={() => setSearching(true)} aria-label="Search folders and projects" className={iconButton}>
                  <IconSearch className="size-3.5" />
                </button>
              </SimpleTooltip>
            </>
          )}
          {/* Each icon button names itself in a tooltip (design system SimpleTooltip, workspace look). */}
          <SimpleTooltip content={showFilter ? "Hide module filter" : "Filter by module"} {...HEADER_TIP}>
            <button
              type="button"
              onClick={() => {
                if (showFilter) setModFilter([]);
                setShowFilter(!showFilter);
              }}
              aria-label="Filter by module"
              aria-pressed={showFilter}
              className={cn(iconButton, "relative", (showFilter || filterOn) && "bg-sidebar-accent text-sidebar-foreground")}
            >
              <IconFilter className="size-3.5" />
              {filterOn ? <span aria-hidden className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-info" /> : null}
            </button>
          </SimpleTooltip>
          <SimpleTooltip content="Open bigger view" {...HEADER_TIP}>
            <button type="button" onClick={openBrowser} aria-label="Open bigger view" className={iconButton}>
              <IconArrowsMaximize className="size-3.5" />
            </button>
          </SimpleTooltip>
          <DropdownMenu>
            {/* The one create action, as a filled "New" pill so it reads as the panel's action, not a fourth tool. */}
            <SimpleTooltip content="New folder or project" {...HEADER_TIP}>
              <DropdownMenuTrigger
                render={
                  // The same black pill as every other primary button (Button default variant), at its 26px xs size.
                  <Button type="button" size="xs" aria-label="New folder or project" className="ml-1 data-[popup-open]:opacity-90" />
                }
              >
                <IconPlus />
                New
              </DropdownMenuTrigger>
            </SimpleTooltip>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={() => setUi({ panel: "new-folder", parent: currentFolderId })}>
                <IconFolderPlus />
                New folder
              </DropdownMenuItem>
              <DropdownMenuItem
                // In a dialog over the current page, with the folder in view as the destination.
                onClick={() => createProject({ clientId: client.id, folderId: currentFolderId })}
              >
                <IconPlus />
                New project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showFilter ? (
          <div role="group" aria-label="Filter by module" className="flex flex-wrap items-center gap-1 px-2 pb-1 duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none">
            {MODULE_IDS.map((m) => {
              const on = modFilter.includes(m);
              const Icon = MODULE_ICON[m];
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setModFilter((l) => (on ? l.filter((x) => x !== m) : [...l, m]))}
                  className={cn(
                    "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-xs transition-colors",
                    on ? "border-foreground/25 bg-sidebar-accent font-medium text-sidebar-foreground" : "border-sidebar-border text-muted-foreground hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-3" />
                  {MODULE_LABEL[m]}
                </button>
              );
            })}
          </div>
        ) : null}

        {searching && query.trim() ? (
          results.length ? (
            <ul aria-label="Search results">
              {results.map(({ node, path }) => {
                const project = node.kind === "project" ? client.projects.find((p) => p.id === node.id) : undefined;
                return (
                  <li key={nodeKey(node)}>
                    <Link
                      href={node.kind === "folder" ? folderTarget(node.id) : projectHref(node.id, "home", openEnv(node.id))}
                      onClick={endSearch}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    >
                      {node.kind === "folder" ? (
                        <IconFolderFilled className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ProjectChip initials={project?.gameInitials ?? "··"} icon={project?.gameIcon} className="size-4 rounded-[4px] text-[7px]" />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{nodeName(client, node)}</span>
                        <span className="truncate text-[11px] text-muted-foreground">{path.join(" / ")}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-2 py-1 text-xs text-muted-foreground">No folders or projects match ‘{query.trim()}’</p>
          )
        ) : (
          <ul onMouseLeave={() => setHoverParent(null)}>
            {/* The organization at the top (its Overview); its folders and projects sit under it. */}
            <li>
              <Link
                href={folderTarget(root.id)}
                aria-current={current.kind === "folder" && current.id === root.id ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center gap-1 rounded-md pr-1 text-sm text-sidebar-foreground/80 outline-hidden transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  current.kind === "folder" && current.id === root.id && "bg-sidebar-accent font-medium text-sidebar-foreground",
                )}
                style={{ paddingLeft: 4 }}
              >
                <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground" aria-hidden>
                  <IconChevronRight className="size-3.5 rotate-90" />
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <CompanyMark client={client} className="size-4 text-[7px]" />
                  <span className="truncate">{client.company.name}</span>
                </span>
              </Link>
            </li>
            {filterOn && !root.children.some(visible) ? (
              <li className="py-1 text-xs text-muted-foreground" style={{ paddingLeft: 4 + ROW_INDENT + 24 }}>No projects with {modFilter.map((m) => MODULE_LABEL[m]).join(" or ")}</li>
            ) : root.children.length ? (
              contents(root.children).map((c) => row(c, 1))
            ) : (
              <li className="py-1 text-xs text-muted-foreground" style={{ paddingLeft: 4 + ROW_INDENT + 24 }}>No folders or projects yet</li>
            )}
          </ul>
        )}
      </nav>
      )}


      {/* The bigger view: All projects, folders on the left and the chosen folder's projects on the right. */}
      <Dialog open={ui.panel === "browse"} onOpenChange={(v, d) => !v && !isGuideEvent(d) && setUi(null)}>
        <DialogContent
          showCloseButton={false}
          className="h-[min(760px,calc(100svh-2rem))] w-[min(1120px,calc(100vw-2rem))] max-w-none grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">All projects</DialogTitle>
          <AllProjectsView
            client={client}
            root={root}
            current={current}
            modulesOf={modulesOf}
            folderId={shownFolder}
            onFolderChange={setBrowseFolder}
            query={ui.panel === "browse" ? ui.q ?? "" : ""}
            onQueryChange={(v) => setUi({ panel: "browse", q: v || undefined })}
            flashFolderId={flash}
            onClose={() => setUi(null)}
            onOpenProject={(id) => go(projectTarget(id))}
            onOpenFolder={(id) => go(folderTarget(id))}
            onNewProject={(folderId) => {
              setUi(null);
              createProject({ clientId: client.id, folderId });
            }}
            onNewFolder={setBrowseNewFolder}
            onMove={(key) => {
              backToBrowser.current = true;
              setUi({ panel: "move", item: key });
            }}
            onClone={(projectId, folderId) => {
              setUi(null);
              createProject({ clientId: client.id, folderId, clone: projectId });
            }}
          />
          {/* New folder: the same form, over the view. */}
          {browseNewFolder ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <div className="w-[400px] max-w-[calc(100%-2rem)] overflow-hidden rounded-xl bg-popover shadow-lg ring-1 ring-foreground/10">
                <NewFolderPanel
                  key={browseNewFolder}
                  client={client}
                  root={root}
                  defaultParent={browseNewFolder}
                  initialName=""
                  onBack={() => setBrowseNewFolder(null)}
                  onCancel={() => setBrowseNewFolder(null)}
                  onCreate={(parentId, name) => {
                    createFolder(parentId, name, "browse");
                    setBrowseFolder(parentId);
                    setBrowseNewFolder(null);
                  }}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <MoveDialog
        client={client}
        root={root}
        subjectKey={ui.panel === "move" ? ui.item ?? null : null}
        to={ui.to ?? null}
        onChoose={(to) => setUi({ panel: "move", item: ui.item, to })}
        onBack={() => setUi({ panel: "move", item: ui.item })}
        onClose={closeSub}
        onMove={(key, targetId) => {
          edit((t) => moveNode(t, key, targetId));
          toast(`${subjectName} moved to ${pathOf(targetId).join(" / ")}`);
          closeSub();
        }}
        onCreateFolder={(parentId, name) => {
          // Made from the Move dialog: added to the tree, and the dialog picks it as the destination.
          const f: FolderNode = { kind: "folder", id: makeFolderId(name), name: name.trim(), children: [] };
          edit((t) => insertFolder(t, parentId, f));
          toast(`${f.name} created in ${pathOf(parentId).join(" / ")}`);
          return f.id;
        }}
      />
      <BulkMoveDialog
        client={client}
        root={root}
        folderId={bulkTo}
        onClose={() => setBulkTo(null)}
        onMove={(ids, to) => {
          edit((t) => ids.reduce((tree, id) => moveNode(tree, `p:${id}`, to), t));
          toast(`${ids.length} ${ids.length === 1 ? "project" : "projects"} moved to ${pathOf(to).join(" / ")}`);
          setBulkTo(null);
        }}
      />
      <AccessDialog client={client} root={root} subjectKey={ui.panel === "access" ? ui.item ?? null : null} onClose={() => setUi(null)} />
      <DeleteFolderDialog
        name={subjectName}
        open={ui.panel === "delete" && !!itemTrail}
        onClose={() => setUi(null)}
        onDelete={() => {
          const parent = itemTrail?.at(-2);
          const id = ui.item!.slice(2);
          edit((t) => removeFolder(t, id));
          toast(`${subjectName} deleted`);
          // Deleting the folder you're in drops you to its parent.
          if (current.kind === "folder" && current.id === id && parent) go(companyHref(client.id, "home", parent.id));
          else setUi(null);
        }}
      />
    </>
  );
}
