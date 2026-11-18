"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IconChevronDown,
  IconSelector,
  IconCheck,
  IconPlus,
  IconCircleFilled,
  IconExternalLink,
  IconChevronRight,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectChip } from "@/components/dashboard/project-bits";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  projectHref,
  companyHref,
  projectDisplayLabel,
  projectSectionIds,
  environmentPreviewUrl,
  getProject,
  CLIENT_LIST,
  DEFAULT_ENV_ID,
  type ClientConfig,
  type Project,
  type Environment,
} from "@/lib/newgen";
import { useSandboxes } from "@/components/dashboard/providers";
import { CreateSandboxDialog } from "@/components/dashboard/create-sandbox-dialog";
import { CreateNewDialog } from "@/components/dashboard/create-new-dialog";
import { CompanyLogo } from "@/components/dashboard/logo";
import { setFolderEnv, useEnvSession, type FolderEnv } from "@/components/dashboard/env-session";

/* -------------------------------------------------------------------------- */
/*  Control 0 — Company switcher (inline, left of the context switcher)        */
/* -------------------------------------------------------------------------- */

export function CompanySwitcher({ client, className }: { client: ClientConfig; className?: string }) {
  const router = useRouter();
  // Switching company lands on the new company's company-level page, so no
  // game/project from the previous company carries over.
  const switchTo = (c: ClientConfig) => router.push(companyHref(c.id, "home"));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" aria-label="Switch company" className={cn("gap-2 font-medium", className)} />}
      >
        <span className="truncate">{client.company.name}</span>
        <IconSelector className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Company</DropdownMenuLabel>
          {CLIENT_LIST.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => switchTo(c)} className="gap-2.5">
              <CompanyLogo clientId={c.id} className="size-5 rounded-[5px]" />
              {c.company.name}
              {c.id === client.id ? <IconCheck className="ml-auto size-4" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground">
          <IconPlus />
          Create company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*  Control 1 — Working-context switcher (Studio › Game › Project)            */
/*  Studio grouping only appears for clients that have a studio layer.         */
/* -------------------------------------------------------------------------- */

function ContextCommandItem({
  p,
  label,
  activeId,
  onPick,
}: {
  p: Project;
  label: string;
  activeId: string;
  onPick: (id: string) => void;
}) {
  // Product labels go into the search value too, so "checkout" finds projects.
  const products = p.productGroups.map((g) => g.label).join(" ");
  return (
    <CommandItem value={`${p.studio ?? ""} ${p.game} ${p.project} ${products}`} onSelect={() => onPick(p.id)} className="items-center gap-2.5 py-2">
      <Avatar size="sm">
        {p.gameIcon ? <AvatarImage src={p.gameIcon} alt="" /> : null}
        <AvatarFallback>{p.gameInitials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      <div className="flex shrink-0 flex-wrap justify-end gap-1">
        {p.productGroups.length ? (
          p.productGroups.map((g) => (
            <Badge key={g.id} variant="secondary" className="px-1.5 py-0 text-[10px] font-medium">
              {g.label}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Not set up</span>
        )}
      </div>
      <IconCheck className={cn("size-4 shrink-0", p.id === activeId ? "opacity-100" : "opacity-0")} aria-hidden />
    </CommandItem>
  );
}

export function ContextSwitcher({
  client,
  projectId,
  sectionId,
  className,
  placeholder = "Select game",
  buildHref,
}: {
  client: ClientConfig;
  /** Undefined at company level — the switcher then shows a "Select…" placeholder. */
  projectId?: string;
  sectionId: string;
  className?: string;
  placeholder?: string;
  /** Route builder for a chosen game. Defaults to the main dashboard; the Store
   *  flow passes its own so switching game stays inside Store. */
  buildHref?: (id: string) => string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [studioTab, setStudioTab] = React.useState("all");
  const activeId = projectId ?? "";
  const selected = projectId ? client.projects.find((p) => p.id === projectId) : undefined;

  const visible = client.projects;
  const allStudios = (
    client.hasStudioLayer ? Array.from(new Set(client.projects.map((p) => p.studio).filter(Boolean))) : []
  ) as string[];
  const studioScoped =
    !client.hasStudioLayer || studioTab === "all" ? visible : visible.filter((p) => p.studio === studioTab);

  // Lateral navigation: keep the current section if the target project has it,
  // otherwise fall back gracefully to Overview (home). Environment resets to
  // Production — sandboxes are per-project, so a sandbox id can't carry across.
  const pick = (id: string) => {
    setOpen(false);
    if (buildHref) {
      router.push(buildHref(id));
      return;
    }
    const target = client.projects.find((p) => p.id === id) ?? client.projects[0];
    const keep = projectSectionIds(target).includes(sectionId) ? sectionId : "home";
    router.push(projectHref(id, keep, DEFAULT_ENV_ID));
  };

  const item = (p: Project) => (
    <ContextCommandItem key={p.id} p={p} label={projectDisplayLabel(client, p)} activeId={activeId} onPick={pick} />
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Switch game"
            className={cn("min-w-0 max-w-full justify-start gap-2 font-medium", className)}
          />
        }
      >
        {selected ? (
          <span className="truncate">{projectDisplayLabel(client, selected)}</span>
        ) : (
          <span className="truncate text-muted-foreground">{placeholder}</span>
        )}
        <IconSelector className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <Command>
          {/* Studio tabs — switch which studio's games are shown. */}
          {client.hasStudioLayer ? (
            <Tabs
              value={studioTab}
              onValueChange={(v) => setStudioTab(v as string)}
              className="border-b border-border px-2 pt-2"
            >
              <TabsList variant="line" className="h-auto w-full justify-start overflow-x-auto p-0">
                <TabsTrigger value="all" className="flex-none px-2.5 pb-2">
                  All
                </TabsTrigger>
                {allStudios.map((s) => (
                  <TabsTrigger key={s} value={s} className="flex-none px-2.5 pb-2">
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : null}
          <CommandList>
            <CommandEmpty>No matches found.</CommandEmpty>
            {client.hasStudioLayer && studioTab === "all"
              ? allStudios.map((studio) => {
                  const list = visible.filter((p) => p.studio === studio);
                  return list.length ? (
                    <CommandGroup key={studio} heading={studio}>
                      {list.map(item)}
                    </CommandGroup>
                  ) : null;
                })
              : studioScoped.length ? (
                  <CommandGroup heading={client.hasStudioLayer ? undefined : "Games"}>{studioScoped.map(item)}</CommandGroup>
                ) : null}
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="create game" className="gap-2.5 text-muted-foreground">
                <IconPlus className="size-4" />
                Create game
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/*  Consolidated store switcher — company + game/project in one control.       */
/*  One button showing the full path; one palette with Companies + projects.   */
/* -------------------------------------------------------------------------- */

export function StoreSwitcher({
  client,
  className,
  activeProjectId,
  atCompanyLevel = false,
  triggerVariant = "company",
  openOnHover = false,
  trigger,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  onOpenChange,
  buildGameHref,
}: {
  client: ClientConfig;
  className?: string;
  /** The game currently open (in a game/Store context). It gets the checkmark,
   *  and — with triggerVariant "game" — its name labels the trigger. */
  activeProjectId?: string;
  /** True when the active view is the Company level, so the company row is checked. */
  atCompanyLevel?: boolean;
  /** What the trigger shows: the company (default) or the active game. */
  triggerVariant?: "company" | "game";
  /** Open the panel on hover (close shortly after leaving), not just on click. */
  openOnHover?: boolean;
  /** Custom anchor element (e.g. the Appcharge logo). Hover handlers are injected;
   *  when omitted a labelled button trigger is rendered. */
  trigger?: React.ReactElement;
  /** Panel placement relative to the trigger. */
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /** Fires whenever the panel opens or closes — the Store flow uses it to dim
   *  the rest of the screen while the menu is up. */
  onOpenChange?: (open: boolean) => void;
  /** How to route when a game is chosen. Defaults to the game's dashboard home;
   *  the Store flow passes its own so switching game stays inside the Webstore. */
  buildGameHref?: (projectId: string) => string;
}) {
  const router = useRouter();
  const [open, setOpenState] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  // Which game rows are expanded to reveal what's inside them (their areas).
  const [expandedGames, setExpandedGames] = React.useState<Set<string>>(new Set());
  const toggleGame = (key: string) =>
    setExpandedGames((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Single entry point for open/close so the host (dimming, etc.) is always told.
  const setOpen = React.useCallback(
    (v: boolean) => {
      setOpenState(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );

  // Hover-to-open: a short close delay bridges the gap between the trigger and
  // the panel, so moving the cursor onto the menu doesn't dismiss it.
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };
  const hoverOpen = () => {
    if (!openOnHover) return;
    clearHoverTimer();
    setOpen(true);
  };
  const hoverClose = () => {
    if (!openOnHover) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setOpen(false), 160);
  };
  React.useEffect(() => clearHoverTimer, []);

  // The switcher lists the normal companies; when reviewing-as a client that
  // isn't one of them (e.g. Wooga), show only that client — not the defaults.
  const companies = CLIENT_LIST.some((c) => c.id === client.id) ? CLIENT_LIST : [client];
  const activeProject = activeProjectId ? client.projects.find((p) => p.id === activeProjectId) : undefined;
  const showGame = triggerVariant === "game" && activeProject;

  // Opening the panel auto-expands the game you're currently inside, so you land
  // on its contents without a click.
  React.useEffect(() => {
    if (open && activeProject) {
      setExpandedGames((prev) => new Set(prev).add(`${client.id}:${activeProject.game}`));
    }
  }, [open, activeProject, client.id]);

  // A company row jumps straight to that company's Company-level experience —
  // no back-stepping out of a game or Webstore first.
  const goToCompany = (c: ClientConfig) => {
    setOpen(false);
    // Lands on the Company roll-up (the root folder's Home).
    router.push(companyHref(c.id, "home"));
  };
  // A game row opens that game — in the dashboard by default, or wherever the
  // host passes (the Store flow keeps you inside the Webstore).
  const goToGame = (p: Project) => {
    setOpen(false);
    router.push(buildGameHref ? buildGameHref(p.id) : projectHref(p.id, "home", DEFAULT_ENV_ID));
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      role="combobox"
      aria-expanded={open}
      aria-label="Switch context"
      className={cn("min-w-0 max-w-full justify-start gap-2 font-medium", className)}
    >
      {showGame ? (
        <>
          <ProjectChip initials={activeProject!.gameInitials} icon={activeProject!.gameIcon} />
          <span className="truncate">{activeProject!.game}</span>
        </>
      ) : (
        <>
          <CompanyLogo clientId={client.id} className="size-5 shrink-0 rounded-[5px]" />
          <span className="truncate">{client.company.name}</span>
        </>
      )}
      <IconSelector className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Button>
  );

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={React.cloneElement(trigger ?? defaultTrigger, {
          onMouseEnter: hoverOpen,
          onMouseLeave: hoverClose,
        } as React.HTMLAttributes<HTMLElement>)}
      />
      <PopoverContent side={side} align={align} sideOffset={sideOffset} className="w-64 p-0" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
        <Command>
          <CommandList className="max-h-[28rem]!">
            <CommandGroup heading="Companies">
              {companies.map((c) => {
                const studios = Array.from(new Set(c.projects.map((p) => p.studio).filter(Boolean))) as string[];

                // Group a studio's (or the client's) projects by game, keeping order,
                // so a game with several projects is ONE row — not one row per project.
                const gamesOf = (projects: Project[]) => {
                  const order: string[] = [];
                  const byGame = new Map<string, Project[]>();
                  for (const p of projects) {
                    if (!byGame.has(p.game)) {
                      byGame.set(p.game, []);
                      order.push(p.game);
                    }
                    byGame.get(p.game)!.push(p);
                  }
                  return order.map((game) => ({ game, projects: byGame.get(game)! }));
                };

                // What's "under" a game: a multi-project game lists its projects;
                // a single-project game drills into that project's areas (Webstore,
                // Direct Checkout, …). Each row is a direct navigation target.
                const childRows = (projects: Project[]) => {
                  if (projects.length > 1) {
                    return projects.map((p) => ({
                      key: p.id,
                      label: p.project,
                      href: projectHref(p.id, "home", DEFAULT_ENV_ID),
                      active: p.id === activeProjectId,
                    }));
                  }
                  const p = projects[0];
                  if (!p.productGroups.length) {
                    return [{ key: p.id, label: p.project, href: projectHref(p.id, "home", DEFAULT_ENV_ID), active: p.id === activeProjectId }];
                  }
                  return p.productGroups.map((pg) => ({
                    key: `${p.id}:${pg.id}`,
                    label: pg.label,
                    href: projectHref(p.id, pg.items[0]?.id ?? "home", DEFAULT_ENV_ID),
                    active: false,
                  }));
                };

                const gameBlock = (game: string, projects: Project[], studio?: string) => {
                  const lead = projects[0];
                  const expandKey = `${c.id}:${game}`;
                  const isExpanded = expandedGames.has(expandKey);
                  const isActive = projects.some((p) => p.id === activeProjectId);
                  const rows = childRows(projects);
                  return (
                    <React.Fragment key={expandKey}>
                      <CommandItem
                        value={`game ${c.company.name} ${studio ?? ""} ${game}`}
                        onSelect={() => goToGame(lead)}
                        className="gap-2.5 pl-9"
                      >
                        <ProjectChip initials={lead.gameInitials} icon={lead.gameIcon} />
                        <span className="flex-1 truncate">{game}</span>
                        {isActive ? <IconCheck className="size-4 shrink-0" aria-hidden /> : null}
                        {/* Chevron drills in without navigating; the row label still opens the game. */}
                        <span
                          role="button"
                          tabIndex={-1}
                          aria-label={isExpanded ? `Collapse ${game}` : `Expand ${game}`}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleGame(expandKey);
                          }}
                          className="-mr-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <IconChevronRight className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")} aria-hidden />
                        </span>
                      </CommandItem>
                      {isExpanded
                        ? rows.map((r) => (
                            <CommandItem
                              key={r.key}
                              value={`area ${c.company.name} ${game} ${r.label}`}
                              onSelect={() => {
                                setOpen(false);
                                router.push(r.href);
                              }}
                              className="gap-2.5 py-1.5 pl-[4.25rem] text-[13px]"
                            >
                              <span className="flex-1 truncate text-muted-foreground">{r.label}</span>
                              {r.active ? <IconCheck className="size-4 shrink-0" aria-hidden /> : null}
                            </CommandItem>
                          ))
                        : null}
                    </React.Fragment>
                  );
                };

                return (
                  <React.Fragment key={c.id}>
                    <CommandItem value={`company ${c.company.name}`} onSelect={() => goToCompany(c)} className="gap-2.5">
                      <CompanyLogo clientId={c.id} className="size-5 rounded-[5px]" />
                      <span className="flex-1">{c.company.name}</span>
                      {atCompanyLevel && c.id === client.id ? <IconCheck className="size-4" aria-hidden /> : null}
                    </CommandItem>
                    {/* Studio › Game hierarchy; a studio-less client lists games flat. */}
                    {studios.length
                      ? studios.map((studio) => (
                          <React.Fragment key={studio}>
                            <div className="px-2 pt-1.5 pb-0.5 pl-9 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                              {studio}
                            </div>
                            {gamesOf(c.projects.filter((p) => p.studio === studio)).map(({ game, projects }) => gameBlock(game, projects, studio))}
                          </React.Fragment>
                        ))
                      : gamesOf(c.projects).map(({ game, projects }) => gameBlock(game, projects))}
                  </React.Fragment>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="create new"
                onSelect={() => {
                  setOpen(false);
                  requestAnimationFrame(() => setCreateOpen(true));
                }}
                className="gap-2.5 text-muted-foreground"
              >
                <IconPlus className="size-4" />
                Create new
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <CreateNewDialog open={createOpen} onOpenChange={setCreateOpen} companyName={client.company.name} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Control 2 — Environment selector (a STATE). Clients without a sandbox show */
/*  an empty "No sandbox yet" state rather than hiding the control.            */
/* -------------------------------------------------------------------------- */

const MONO = "#9ca3af";

function EnvMenuItem({
  e,
  activeId,
  mono,
  previewHref,
  onPick,
}: {
  e: Environment;
  activeId: string;
  mono?: boolean;
  previewHref?: string;
  onPick: (id: string) => void;
}) {
  return (
    <DropdownMenuItem onClick={() => onPick(e.id)} className="gap-2 pr-1.5">
      <IconCircleFilled className="size-2.5" style={{ color: mono ? MONO : e.color }} aria-hidden />
      <span className="flex-1 text-sm">{e.name}</span>
      {e.id === activeId ? <IconCheck className="size-4" aria-hidden /> : null}
      {previewHref ? (
        // Secondary action: open this environment's store preview — does NOT switch env.
        <a
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${e.name} store preview`}
          title="Open preview"
          onClick={(ev) => ev.stopPropagation()}
          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconExternalLink className="size-3.5" />
        </a>
      ) : null}
    </DropdownMenuItem>
  );
}

export function EnvironmentSelector({
  client,
  projectId,
  sectionId,
  envId,
  mono,
  className,
  buildHref,
  variant = "default",
}: {
  client: ClientConfig;
  projectId: string;
  sectionId: string;
  envId: string;
  mono?: boolean;
  className?: string;
  /** "state" sets it as a compact 12px line under the location name, so the
   *  environment reads as the project's state, not another level. */
  variant?: "default" | "state";
  /** Route builder for a chosen env. Defaults to the main dashboard route; the
   *  Store flow passes its own so switching env stays inside Store. */
  buildHref?: (envId: string) => string;
}) {
  const router = useRouter();
  const { byProject } = useSandboxes();
  const [createOpen, setCreateOpen] = React.useState(false);

  const project = getProject(client, projectId);
  const environments = [...client.environments, ...(byProject[projectId] ?? [])];
  const current = environments.find((e) => e.id === envId) ?? environments[0];
  const sandboxes = environments.filter((e) => e.kind === "sandbox");
  const production = environments.find((e) => e.kind === "production") ?? environments[0];

  const pick = (id: string) => {
    // Hold your place: same project + section, only the environment changes.
    router.push(buildHref ? buildHref(id) : projectHref(projectId, sectionId, id));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="Switch environment"
              className={cn(
                // Same hover box as the scope trigger beside it in the top bar (28px, 6px padding, 4px corners).
                // Labelled text (option D): "Environment ● Production ⌄", a quiet text button that greys on hover.
                variant === "state" ? "h-7 gap-1.5 rounded-md px-2 text-nav font-normal text-muted-foreground hover:bg-black/5" : "gap-2 font-medium",
                className,
              )}
            />
          }
        >
          {variant === "state" ? <span>Environment</span> : null}
          <IconCircleFilled className={variant === "state" ? "size-1.5" : "size-2.5"} style={{ color: mono ? MONO : current.color }} aria-hidden />
          <span className={variant === "state" ? "font-semibold text-foreground" : undefined}>{current.name}</span>
          {variant === "state" ? (
            <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <IconSelector className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Environment</DropdownMenuLabel>
            <EnvMenuItem e={production} activeId={envId} mono={mono} previewHref={environmentPreviewUrl(project, production)} onPick={pick} />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Sandboxes</DropdownMenuLabel>
            {sandboxes.length ? (
              sandboxes.map((e) => (
                <EnvMenuItem key={e.id} e={e} activeId={envId} mono={mono} previewHref={environmentPreviewUrl(project, e)} onPick={pick} />
              ))
            ) : (
              <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                No sandbox yet
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2.5 text-muted-foreground" onClick={() => setCreateOpen(true)}>
            <IconPlus className="size-4" />
            Create sandbox
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateSandboxDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        sectionId={sectionId}
        environments={environments}
      />
    </>
  );
}

/** Folder view's environment dots (Foldering PRD, Story 1 / 9): green for Production ("Live"), orange for sandboxes ("Test"). */
export const FOLDER_ENV_COLOR: Record<FolderEnv, string> = { production: "#16a34a", sandboxes: "#ea580c" };

/**
 * The environment selector in Folder view (Company or a folder; Foldering PRD, Story 9): Production, or All sandboxes,
 * which combines every sandbox of every project in scope. Starts each session on Production and keeps the choice
 * across tabs and scopes; opening a project then lands in the matching environment (env-session.tsx).
 */
export function FolderEnvironmentSelector({ client }: { client: ClientConfig }) {
  const { folderEnv } = useEnvSession();
  const { byProject } = useSandboxes();
  // Only offered when a sandbox exists somewhere in scope.
  const hasSandbox = client.environments.some((e) => e.kind === "sandbox") || Object.values(byProject).some((l) => l.length > 0);
  const options: { id: FolderEnv; name: string; tag: string; disabled?: boolean }[] = [
    { id: "production", name: "All production", tag: "Live" },
    { id: "sandboxes", name: "All sandboxes", tag: "Test", disabled: !hasSandbox },
  ];
  const current = options.find((o) => o.id === folderEnv) ?? options[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Switch environment. Now ${current.name}`}
            // Labelled text (option D): "Environment ● All production ⌄", a quiet text button that greys on hover.
            className="h-7 gap-1.5 rounded-md px-2 text-nav font-normal text-muted-foreground hover:bg-black/5"
          />
        }
      >
        <span>Environment</span>
        <IconCircleFilled className="size-1.5" style={{ color: FOLDER_ENV_COLOR[current.id] }} aria-hidden />
        <span className="font-semibold text-foreground">{current.name}</span>
        <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Environment</DropdownMenuLabel>
          {options.map((o) => (
            <DropdownMenuItem key={o.id} disabled={o.disabled} onClick={() => setFolderEnv(o.id)} className="gap-2">
              <IconCircleFilled className="size-2.5" style={{ color: FOLDER_ENV_COLOR[o.id] }} aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="text-sm">{o.name}</span>
                {o.id === "sandboxes" ? (
                  <span className="text-[11px] text-muted-foreground">{o.disabled ? "No sandboxes yet" : "Every sandbox in this folder, combined"}</span>
                ) : null}
              </span>
              <span className="text-[11px] text-muted-foreground">{o.tag}</span>
              {o.id === folderEnv ? <IconCheck className="size-4" aria-hidden /> : <span className="size-4" aria-hidden />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
