"use client";

import * as React from "react";
import { useOpenEnv } from "@/components/dashboard/env-session";
import { useRouter } from "next/navigation";
import {
  IconArrowBackUp,
  IconFileText,
  IconFilter,
  IconPuzzle,
  IconSearch,
  IconX,
  IconFolderFilled,
} from "@/lib/icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MODULE_ICON, ProjectChip, useModulesOf } from "@/components/dashboard/project-bits";
import { useFolderTree } from "@/components/dashboard/providers";
import {
  projectHref,
  companyHref,
  projectDisplayLabel,
  FOLDER_NAV,
  PROJECT_NAV,
  DEFAULT_ENV_ID,
  MODULE_LABEL,
  ROOT_FOLDER_ID,
  type ClientConfig,
  type FolderNode,
  type NavNode,
  type Project,
} from "@/lib/newgen";
import { findTrail, isProjectId, projectsIn, trailNames } from "@/lib/folders";
import { cn } from "@/lib/utils";

/**
 * Global search (⌘K), built like Shopify's: a large field with ✕ and a filter button, type chips under it (Projects,
 * Folders, Pages, Modules), "Find anything in …" before you type, and an "Open ↵" footer. The filter button — or
 * typing "/" — lists the types under "Filter by"; picking one narrows the results and shows as a tag in the field.
 * Arrow keys move through the results and Enter opens the highlighted one.
 */

type Category = "projects" | "folders" | "pages" | "modules";
const CATEGORIES: { id: Category; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "folders", label: "Folders" },
  { id: "pages", label: "Pages" },
  { id: "modules", label: "Modules" },
];

type Item = {
  key: string;
  category: Category;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
  /** Extra words that match (game name, studio, path). */
  keywords?: string;
};

export function GlobalSearch({
  client,
  project,
  scope,
  envId,
}: {
  client: ClientConfig;
  project: Project;
  scope: "company" | "project";
  envId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [filter, setFilter] = React.useState<Category | null>(null);
  const [filterList, setFilterList] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { root } = useFolderTree(client);
  const modulesOf = useModulesOf();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const reset = () => {
    setText("");
    setFilter(null);
    setFilterList(false);
    setActive(0);
  };
  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) reset();
  };
  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  // Opening a project uses the session's environment (Foldering PRD, Story 9).
  const openEnv = useOpenEnv(client);

  /* ── Everything searchable ── */
  const pathOf = (trail: FolderNode[] | null) => (trail ? trailNames(client, trail).join(" / ") : client.company.name);
  // Only projects in the company's tree (one the Create project flow hasn't made yet stays hidden).
  const projects = projectsIn(client, root).map((i) => i.project);
  const items: Item[] = [
    ...projects.map((p): Item => {
      const trail = findTrail(root, isProjectId(p.id));
      return {
        key: `p:${p.id}`,
        category: "projects",
        title: projectDisplayLabel(client, p),
        subtitle: pathOf((trail?.slice(0, -1) as FolderNode[]) ?? null),
        icon: <ProjectChip initials={p.gameInitials} icon={p.gameIcon} className="size-6 rounded-md text-[9px]" />,
        href: projectHref(p.id, "home", openEnv(p.id)),
        keywords: `${p.game} ${p.studio ?? ""}`,
      };
    }),
    ...(function folders(f: FolderNode, path: FolderNode[]): Item[] {
      return f.children.flatMap((c) => {
        if (c.kind !== "folder") return [];
        const here = [...path, f];
        return [
          {
            key: `f:${c.id}`,
            category: "folders" as const,
            title: c.name,
            subtitle: trailNames(client, here).join(" / "),
            icon: <IconFolderFilled className="size-4 text-muted-foreground" />,
            href: companyHref(client.id, "home", c.id),
          },
          ...folders(c, here),
        ];
      });
    })(root, []),
    // Pages: the current project's (when in one), then the company's.
    ...(scope === "project"
      ? PROJECT_NAV.flatMap((n): NavNode[] => n.children ?? [n])
          .filter((n) => !n.soon)
          .map(
            (pg): Item => ({
              key: `pg:${pg.id}`,
              category: "pages",
              title: pg.label,
              subtitle: projectDisplayLabel(client, project),
              icon: pg.icon ? <pg.icon className="size-4 text-muted-foreground" /> : <IconFileText className="size-4 text-muted-foreground" />,
              href: projectHref(project.id, pg.id, envId),
            }),
          )
      : []),
    ...FOLDER_NAV.map(
      (n): Item => ({
        key: `c:${n.id}`,
        category: "pages",
        title: n.label,
        subtitle: client.company.name,
        icon: <n.icon className="size-4 text-muted-foreground" />,
        href: companyHref(client.id, n.id),
      }),
    ),
    // Modules: each project's modules, opening its Module management.
    ...projects.flatMap((p) =>
      modulesOf(p).map((m): Item => {
        const Icon = MODULE_ICON[m] ?? IconPuzzle;
        return {
          key: `m:${p.id}:${m}`,
          category: "modules",
          title: MODULE_LABEL[m],
          subtitle: projectDisplayLabel(client, p),
          icon: <Icon className="size-4 text-muted-foreground" />,
          href: projectHref(p.id, "adm-modules", DEFAULT_ENV_ID),
        };
      }),
    ),
  ];

  /* ── What shows ── */
  const slash = text.startsWith("/");
  const showFilters = filterList || slash;
  const q = (slash ? "" : text).trim().toLowerCase();
  const filterQ = slash ? text.slice(1).trim().toLowerCase() : "";
  const filterOptions = CATEGORIES.filter((c) => c.label.toLowerCase().includes(filterQ));
  const matches = items.filter(
    // Match on the item's own name (and its keywords): a page doesn't match just because its project's name does.
    (i) => (!filter || i.category === filter) && (!q || `${i.title} ${i.keywords ?? ""}`.toLowerCase().includes(q)),
  );
  const showResults = !showFilters && (!!q || !!filter);
  const groups = CATEGORIES.map((c) => ({ ...c, items: matches.filter((i) => i.category === c.id) })).filter((g) => g.items.length);
  const flat = showFilters ? [] : groups.flatMap((g) => g.items);
  const count = showFilters ? filterOptions.length : showResults ? flat.length : 0;
  const activeIndex = Math.min(active, Math.max(0, count - 1));
  const countOf = (c: Category) => items.filter((i) => i.category === c).length;

  const pickFilter = (c: Category) => {
    setFilter(c);
    setFilterList(false);
    setText("");
    setActive(0);
    inputRef.current?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!count) return;
      setActive((a) => (Math.min(a, count - 1) + (e.key === "ArrowDown" ? 1 : count - 1)) % count);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showFilters) {
        const c = filterOptions[activeIndex];
        if (c) pickFilter(c.id);
      } else if (showResults && flat[activeIndex]) go(flat[activeIndex].href);
    } else if (e.key === "Escape" && (showFilters || filter)) {
      // Escape steps back: the filter list first, then the filter; a third press closes the dialog.
      e.preventDefault();
      e.stopPropagation();
      if (showFilters) {
        setFilterList(false);
        if (slash) setText("");
      } else setFilter(null);
    } else if (e.key === "Backspace" && !text && filter) setFilter(null);
  };

  const rowClass = (on: boolean) =>
    cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors", on ? "bg-muted" : "hover:bg-muted/60");

  return (
    <>
      {/* Top-bar search: a compact button (the breadcrumb row's 28px height); typing happens in the dialog. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        title="Search (⌘K)"
        className="flex size-7 items-center justify-center rounded-md text-nav text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <IconSearch className="size-4 shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(520px,calc(100svh-4rem))] w-[min(680px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">Search projects, folders, pages and modules</DialogDescription>

          {/* The field: search icon, the filter tag (when one is picked), the text, ✕ and the filter button. */}
          <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
            <IconSearch className="size-5 shrink-0 text-foreground" />
            {filter ? (
              <span className="flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-foreground">
                {CATEGORIES.find((c) => c.id === filter)?.label}
                <button type="button" onClick={() => setFilter(null)} aria-label="Remove filter" className="-mr-0.5 rounded text-muted-foreground hover:text-foreground">
                  <IconX className="size-3.5" />
                </button>
              </span>
            ) : null}
            <input
              ref={inputRef}
              autoFocus
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={filter ? `Search ${CATEGORIES.find((c) => c.id === filter)?.label.toLowerCase()}` : "Search"}
              aria-label="Search"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            {text || filter ? (
              <button
                type="button"
                onClick={() => {
                  reset();
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconX className="size-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setFilterList((v) => !v);
                setActive(0);
                inputRef.current?.focus();
              }}
              aria-label="Filter by"
              aria-pressed={showFilters}
              title="Filter by"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                showFilters && "bg-muted text-foreground",
              )}
            >
              <IconFilter className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {showFilters ? (
              // "Filter by": every type, narrowed by what follows "/".
              <div className="p-2">
                <p className="px-3 pt-2 pb-1.5 text-xs font-medium text-muted-foreground">Filter by</p>
                {filterOptions.length ? (
                  filterOptions.map((c, i) => (
                    <button key={c.id} type="button" onMouseEnter={() => setActive(i)} onClick={() => pickFilter(c.id)} className={rowClass(i === activeIndex)}>
                      <span className="flex-1">{c.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{countOf(c.id)}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">No filter called “{text.slice(1)}”</p>
                )}
              </div>
            ) : (
              <>
                {/* Type chips: one click to narrow to a type. */}
                <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
                  {CATEGORIES.map((c) => {
                    const on = filter === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setFilter(on ? null : c.id);
                          setActive(0);
                          inputRef.current?.focus();
                        }}
                        className={cn(
                          "h-8 rounded-lg px-3 text-sm transition-colors",
                          on ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/70",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                {showResults ? (
                  groups.length ? (
                    <div className="flex flex-col gap-3 p-2 pt-2">
                      {groups.map((g) => (
                        <section key={g.id}>
                          <p className="px-3 pt-1 pb-1 text-xs font-medium text-muted-foreground">{g.label}</p>
                          {g.items.map((it) => {
                            const i = flat.indexOf(it);
                            return (
                              <button key={it.key} type="button" onMouseEnter={() => setActive(i)} onClick={() => go(it.href)} className={rowClass(i === activeIndex)}>
                                <span className="flex size-6 shrink-0 items-center justify-center">{it.icon}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-foreground">{it.title}</span>
                                  {it.subtitle ? <span className="block truncate text-xs text-muted-foreground">{it.subtitle}</span> : null}
                                </span>
                              </button>
                            );
                          })}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-[70%] flex-col items-center justify-center gap-1 px-6 text-center">
                      <p className="text-[15px] text-foreground">No results for “{text.trim()}”</p>
                      <p className="text-sm text-muted-foreground">Try another word, or remove the filter.</p>
                    </div>
                  )
                ) : (
                  <div className="flex h-[78%] items-center justify-center px-6 text-center">
                    <p className="text-[17px] text-foreground">Find anything in {client.company.name}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer: what Enter does. */}
          <div className="flex h-12 shrink-0 items-center justify-end gap-2 border-t border-border px-4 text-sm text-muted-foreground">
            <span className={cn(!count && "opacity-50")}>{showFilters ? "Filter" : "Open"}</span>
            <kbd className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
              <IconArrowBackUp className="size-4 rotate-180 scale-y-[-1]" />
            </kbd>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Kept for callers that only need to know a folder is the company itself. */
export const isCompanyFolder = (id: string) => id === ROOT_FOLDER_ID;
