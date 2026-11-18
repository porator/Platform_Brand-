"use client";

import { NavPanelTransition } from "@/components/dashboard/nav-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import {
  IconChevronRight,
  IconPlus,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@/lib/icons";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FeatureBadge } from "@/components/dashboard/feature-spotlight";
import { useProjectModules } from "@/components/dashboard/providers";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { LaunchPlanIndicator } from "@/components/dashboard/launch-plan";
import { SetupChecklistIndicator } from "@/components/dashboard/setup-checklist";
import { AppchargeLogo } from "@/components/dashboard/logo";
import {
  FOLDER_NAV,
  ROOT_FOLDER_ID,
  categoryLanding,
  companyHref,
  drillCategoryFor,
  projectNav,
  projectHref,
  type NavItem,
  type NavNode,
  type Project,
  type ClientConfig,
} from "@/lib/newgen";

/** Tooltip styling that matches the app's menus/flyouts in both themes: a
 *  popover-surface card with no speech-bubble arrow, so icon tooltips read like
 *  a mini menu. */
export const TOOLTIP_LIGHT =
  "rounded-lg! border border-border bg-popover! text-popover-foreground! shadow-lg [&_.fill-foreground]:hidden";
export const sidebarTip = (label: string) => ({ children: label, className: TOOLTIP_LIGHT });

/** Shared nav typography + icon color, so the main sidebar and the Settings /
 *  Store nav panes read identically: 13px / 500 labels, muted-gray icons. */
export const NAV_STYLE =
  "[&_[data-sidebar=menu-button]]:text-nav! [&_[data-sidebar=menu-button]]:font-medium! " +
  "[&_[data-sidebar=menu-sub-button]]:text-nav! [&_[data-sidebar=menu-sub-button]]:font-medium! " +
  // The current page reads by weight as well as by its fill.
  "[&_[data-sidebar=menu-button][data-active]]:font-semibold! [&_[data-sidebar=menu-sub-button][data-active]]:font-semibold! " +
  // Group labels are small caps — clearly a label, never a dimmed item.
  "[&_[data-sidebar=group-label]]:text-micro! [&_[data-sidebar=group-label]]:font-semibold! [&_[data-sidebar=group-label]]:uppercase [&_[data-sidebar=group-label]]:text-muted-foreground " +
  "[&_[data-sidebar=menu-button]>svg]:text-muted-foreground [&_[data-sidebar=menu-sub-button]>svg]:text-muted-foreground " +
  // Hover: the row's icon turns to the full foreground (white in the dark project sidebar); the label keeps its weight.
  "[&_[data-sidebar=menu-button]:hover>svg:first-child]:text-sidebar-accent-foreground " +
  // Nav items' text is toned down to 70%; hover and the selected page show it in full (white in the dark sidebar).
  "[&_[data-sidebar=content]_[data-sidebar=menu-button]]:text-sidebar-foreground/70 " +
  "[&_[data-sidebar=content]_[data-sidebar=menu-button]:hover]:text-sidebar-accent-foreground " +
  "[&_[data-sidebar=content]_[data-sidebar=menu-button][data-active]]:text-sidebar-accent-foreground " +
  // An expanded category: its label, icon and chevron show in full (white in the dark sidebar).
  "[&_[data-sidebar=content]_[data-sidebar=menu-button][aria-expanded=true]]:text-sidebar-accent-foreground " +
  "[&_[data-sidebar=content]_[data-sidebar=menu-button][aria-expanded=true]>svg]:text-sidebar-accent-foreground " +
  // The footer (Add module, Setup checklist, Launch plan, account) follows the same rule: 70% text, full on hover.
  "[&_[data-sidebar=footer]_[data-sidebar=menu-button]]:text-sidebar-foreground/70 " +
  "[&_[data-sidebar=footer]_[data-sidebar=menu-button]:hover]:text-sidebar-accent-foreground " +
  "[&_[data-sidebar=footer]_[data-sidebar=menu-button][data-active]]:text-sidebar-accent-foreground";

/** A "Soon" row: present but not navigable. Muted at full opacity (no stacked
 *  dimming), so the label stays at AA contrast. */
const SOON_ROW =
  "cursor-default text-muted-foreground aria-disabled:opacity-100 hover:bg-transparent hover:text-muted-foreground";

export function NavGroup({
  label,
  items,
  activeId,
  hrefFor,
  navigable = true,
}: {
  label: string;
  items: NavItem[];
  activeId: string;
  hrefFor: (id: string) => string;
  /** When false, items render as non-navigable rows (no link, no routing). */
  navigable?: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.children?.length ? (
            <NavTree key={item.id} node={item} depth={0} activeId={activeId} hrefFor={hrefFor} />
          ) : item.soon ? (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton className={SOON_ROW} aria-disabled tooltip={sidebarTip(item.label)}>
                <item.icon />
                <span>{item.label}</span>
                <SoonBadge />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : !navigable ? (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton className="cursor-default hover:bg-transparent hover:text-sidebar-foreground" tooltip={sidebarTip(item.label)}>
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton tooltip={sidebarTip(item.label)} isActive={activeId === item.id} render={<Link href={hrefFor(item.id)} />}>
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
              {item.tag ? (
                <FeatureBadge label={item.tag} href={hrefFor(item.id)} />
              ) : item.badge != null ? (
                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
              ) : null}
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SoonBadge() {
  return (
    <span className="ml-auto shrink-0 rounded-full border border-border px-1.5 text-micro text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
      Soon
    </span>
  );
}

function nodeContainsActive(node: NavNode, activeId: string): boolean {
  if (node.id === activeId) return true;
  return node.children?.some((c) => nodeContainsActive(c, activeId)) ?? false;
}

/** Sub-items span the full sidebar row (196px, like the category rows); their text indents to line up under the
 *  category label (8px padding + 16px icon + 8px gap = 32px), 12px more per deeper level. */
const subIndent = (depth: number) => 32 + (depth - 1) * 12;

/** A category's first page you can open: its first child that isn't "soon", looking into sub-groups. */
function firstLeaf(node: NavNode): NavNode | undefined {
  for (const c of node.children ?? []) {
    if (c.children?.length) {
      const hit = firstLeaf(c);
      if (hit) return hit;
    } else if (!c.soon) return c;
  }
  return undefined;
}

/**
 * Recursive, collapsible nav node (Shopify-style). A node with children renders
 * a Collapsible that slides its sub-items open/closed; leaves are links. Depth 0
 * uses the top-level menu button; deeper levels use the indented sub-menu rail.
 */
export function NavTree({
  node,
  depth,
  activeId,
  hrefFor,
}: {
  node: NavNode;
  depth: number;
  activeId: string;
  hrefFor: (id: string) => string;
}) {
  const Icon = node.icon;
  const ItemWrap = depth === 0 ? SidebarMenuItem : SidebarMenuSubItem;
  // Open while its section is active; the row toggles it by hand otherwise. Accordion: when the selection moves
  // into or out of this category the hand toggle resets, so leaving a category closes it and only one stays open.
  const contains = nodeContainsActive(node, activeId);
  const [manual, setManual] = useState<boolean | null>(null);
  const [wasContaining, setWasContaining] = useState(contains);
  if (wasContaining !== contains) {
    setWasContaining(contains);
    setManual(null);
  }
  const open = manual ?? contains;
  const router = useRouter();
  // Opening a category from elsewhere also opens its first page, so the category becomes the selected one.
  // Collapsing it, or reopening the category you're already in, only toggles.
  const toggle = (v: boolean) => {
    setManual(v);
    if (!v || contains) return;
    const first = firstLeaf(node);
    if (first) router.push(first.href ?? hrefFor(first.id));
  };

  // Collapsible group.
  if (node.children?.length) {
    // Only the selected page lights up: an open category row stays unselected, its child shows the selection.
    const trigger =
      depth === 0 ? (
        <SidebarMenuButton className="group/collap" tooltip={sidebarTip(node.label)} />
      ) : (
        <SidebarMenuSubButton className="group/collap translate-x-0" style={{ paddingLeft: subIndent(depth) }} render={<button type="button" />} />
      );
    return (
      <Collapsible open={open} onOpenChange={toggle}>
        <ItemWrap>
          {/* The row toggles; at the top level a chevron turns to show it's open. */}
          <CollapsibleTrigger render={trigger}>
            {Icon ? <Icon /> : null}
            <span>{node.label}</span>
            {depth === 0 ? (
              <IconChevronRight className={cn("ml-auto size-3.5! text-muted-foreground transition-transform duration-200", open && "rotate-90")} aria-hidden />
            ) : null}
          </CollapsibleTrigger>
          {/* No rail line; sub-items indent so their text aligns under the label. */}
          <CollapsibleContent className="nav-collapse">
            <SidebarMenuSub className="mx-0 translate-x-0 border-l-0! px-0">
              {node.children.map((c) => (
                <NavTree key={c.id} node={c} depth={depth + 1} activeId={activeId} hrefFor={hrefFor} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </ItemWrap>
      </Collapsible>
    );
  }

  // "Soon" leaf — present but not navigable.
  if (node.soon) {
    const Btn = depth === 0 ? SidebarMenuButton : SidebarMenuSubButton;
    return (
      <ItemWrap>
        <Btn className={SOON_ROW} aria-disabled tooltip={depth === 0 ? sidebarTip(node.label) : undefined}>
          {Icon ? <Icon /> : null}
          <span>{node.label}</span>
          <SoonBadge />
        </Btn>
      </ItemWrap>
    );
  }

  // Navigable leaf.
  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={sidebarTip(node.label)} isActive={activeId === node.id} render={<Link href={node.href ?? hrefFor(node.id)} />}>
          {Icon ? <Icon /> : null}
          <span>{node.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  return (
    <SidebarMenuSubItem>
      {/* Sub-items are text-only (Shopify-style) — no icon. Unselected, their text sits at 60% opacity; hover and the
          selected page show it in full. */}
      <SidebarMenuSubButton
        className="translate-x-0 text-sidebar-foreground/60"
        style={{ paddingLeft: subIndent(depth) }}
        isActive={activeId === node.id}
        render={<Link href={node.href ?? hrefFor(node.id)} />}
      >
        <span>{node.label}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

/** Icon-only collapse/expand control, sitting next to the search at the top. Collapsed, it shows the Appcharge
 *  logo, which turns into the expand icon on hover (or keyboard focus). */
function CollapseToggle() {
  const { toggleSidebar, state } = useSidebar();
  const collapsed = state === "collapsed";
  const Icon = collapsed ? IconLayoutSidebarLeftExpand : IconLayoutSidebarLeftCollapse;
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={collapsed ? "Expand menu" : "Collapse menu"}
      title={collapsed ? "Expand menu" : "Collapse menu"}
      className="group/toggle relative inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    >
      {collapsed ? (
        <>
          <AppchargeLogo className="size-7 transition-opacity duration-150 group-hover/toggle:opacity-0 group-focus-visible/toggle:opacity-0" />
          <Icon className="absolute size-4 opacity-0 transition-opacity duration-150 group-hover/toggle:opacity-100 group-focus-visible/toggle:opacity-100" />
        </>
      ) : (
        <Icon className="size-4" />
      )}
    </button>
  );
}

/**
 * Flat settings nav: each group (Administration, Developer, Localization) is a
 * category title with its items always visible — no collapse/expand. Nested
 * groups recurse into their own titled sections below.
 */
export function SettingsNavSection({
  node,
  activeId,
  hrefFor,
}: {
  node: NavNode;
  activeId: string;
  hrefFor: (id: string) => string;
}) {
  const children = node.children ?? [];
  const leaves = children.filter((c) => !c.children?.length);
  const groups = children.filter((c) => c.children?.length);
  return (
    <>
      <SidebarGroup className="py-1">
        <SidebarGroupLabel>{node.label}</SidebarGroupLabel>
        <SidebarMenu>
          {leaves.map((leaf) => (
            <SidebarMenuItem key={leaf.id}>
              {leaf.soon ? (
                <SidebarMenuButton className={SOON_ROW} aria-disabled>
                  {leaf.icon ? <leaf.icon /> : null}
                  <span>{leaf.label}</span>
                  <SoonBadge />
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton isActive={activeId === leaf.id} render={<Link href={hrefFor(leaf.id)} />}>
                  {leaf.icon ? <leaf.icon /> : null}
                  <span>{leaf.label}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      {groups.map((g) => (
        <SettingsNavSection key={g.id} node={g} activeId={activeId} hrefFor={hrefFor} />
      ))}
    </>
  );
}

/**
 * Scope navigation with contextual drill-in (Folder view and Project view).
 * The main list shows the scope's tabs; one with a menu of its own (chevron)
 * replaces the whole list with a back arrow, its name and its sections — no
 * accordion, no second sidebar. The drilled state comes from the URL, so a
 * direct link or a refresh opens the same menu.
 */
function ScopeNav({
  label,
  nav,
  activeId,
  hrefFor,
}: {
  /** The group's heading; none in a project (its sections stand on their own). */
  label?: string;
  nav: NavItem[];
  activeId: string;
  hrefFor: (id: string) => string;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  // Categories expand and collapse in place (no drill-in). Collapsed (icon rail), a category's sections are one hover
  // away in the flyout.
  return (
    <SidebarGroup>
      {/* Hidden in the collapsed (icon) sidebar, where it would peek out under the logo. */}
      {label ? <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {nav.map((item) =>
          item.children?.length && !collapsed ? (
            <NavTree key={item.id} node={item} depth={0} activeId={activeId} hrefFor={hrefFor} />
          ) : (
          <SidebarMenuItem key={item.id}>
            {item.children?.length && collapsed ? (
              <CategoryFlyout item={item} activeId={activeId} hrefFor={hrefFor} />
            ) : (
            <SidebarMenuButton
              tooltip={sidebarTip(item.label)}
              isActive={activeId === item.id}
              // A category lands on its first section, which opens its menu.
              render={<Link href={hrefFor(item.children ? categoryLanding(item) : item.id)} />}
            >
              <item.icon />
              <span>{item.label}</span>
              {item.children ? <IconChevronRight className="ml-auto size-3.5! text-muted-foreground" aria-label="Has its own menu" /> : null}
            </SidebarMenuButton>
            )}
          </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * Collapsed sidebar (icon rail), Shopify-style: pointing at a category that has a menu of its own opens a flyout
 * beside it with its sub-categories, each a link, so you can jump straight to one without expanding the sidebar. It
 * uses the same light card as the icon tooltips (popover surface, thin border, shadow), so the rail reads as one system.
 * Clicking the icon itself still opens the category (its first section).
 */
function CategoryFlyout({ item, activeId, hrefFor }: { item: NavItem; activeId: string; hrefFor: (id: string) => string }) {
  const sectionActive = item.children!.some((c) => nodeContainsActive(c, activeId));
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        openOnHover
        delay={40}
        closeDelay={140}
        nativeButton={false}
        render={
          <SidebarMenuButton isActive={activeId === item.id || sectionActive} render={<Link href={hrefFor(categoryLanding(item))} />}>
            <item.icon />
            <span>{item.label}</span>
          </SidebarMenuButton>
        }
      />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side="right" align="start" sideOffset={8} alignOffset={-2} className="isolate z-50">
          <PopoverPrimitive.Popup
            aria-label={`${item.label} sections`}
            className="min-w-44 origin-(--transform-origin) rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0"
          >
            {/* The title is the icon's tooltip, exactly: same size, case and colour (12px, 8px + 4px card padding). */}
            <p className="px-2 py-1.5 text-xs text-popover-foreground">{item.label}</p>
            <div className="mx-1 mb-1 border-t border-border" />
            <ul className="flex flex-col">
              {item.children!.map((c) => (
                <li key={c.id}>
                  {c.soon ? (
                    <span className="flex h-7 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground">
                      {c.label}
                      <span className="ml-auto rounded-full border border-border px-1.5 text-micro uppercase">Soon</span>
                    </span>
                  ) : (
                    <Link
                      href={c.href ?? hrefFor(c.id)}
                      className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors hover:bg-accent ${nodeContainsActive(c, activeId) ? "bg-accent font-medium" : ""}`}
                    >
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/** The full-height Shopify-style sidebar: brand + location selector + search up
 *  top, scope-aware nav in the middle (folder roll-up or project tabs),
 *  Settings / account at the bottom. */
/** Inside a project the sidebar is dark (#272727): the dark theme's text, borders and controls, on the project grey.
 *  `!` so the colours win over the dark theme's own sidebar colour. */
const PROJECT_DARK = "dark [--sidebar:#272727]! [--sidebar-accent:#3A3A3A]! [--sidebar-border:#3A3A3A]! text-sidebar-foreground";
/** Company and folders keep the light sidebar, in the workspace colour (#FCFCFC). */
const FOLDER_LIGHT = "[--sidebar:#FCFCFC]!";
/** The navigation in light grey at every level, with a slightly darker hover / selected tone and border. */
/** Light frame: the navigation is one grey (#F6F6F6) with no edge against the workspace; hover is a slightly darker
 *  grey. The selected page is the soft raised pill in globals.css (`.nav-pill`, light mode only). */
const NAV_LIGHT_GRAY = "nav-pill [--sidebar:#F6F6F6]! [--sidebar-accent:#E8E8EA]! [--sidebar-border:#E4E4E7]! group-data-[side=left]:border-r-0";

/** 12px side padding for the logo row, the nav sections and the account button (8px in the collapsed icon rail, so
 *  its 32px icons still fit the 48px rail). */
const SIDE_PADDING =
  "[&_[data-sidebar=header]]:px-3 [&_[data-sidebar=group]]:px-3 [&_[data-sidebar=footer]]:px-3 " +
  "group-data-[collapsible=icon]:[&_[data-sidebar=header]]:px-2 group-data-[collapsible=icon]:[&_[data-sidebar=group]]:px-2 group-data-[collapsible=icon]:[&_[data-sidebar=footer]]:px-2";

export function ScopedSidebar({
  client,
  scope,
  project,
  folderId = ROOT_FOLDER_ID,
  envId,
  activeSection,
  topOffset = "default",
  panelKey: contextKey,
}: {
  client: ClientConfig;
  /** The navigation context (nav-motion.tsx), from the shell: a new one loads the categories in. */
  panelKey?: string;
  scope: "company" | "project";
  project: Project;
  /** The folder in view, for folder scope (Company is the root folder). */
  folderId?: string;
  envId: string;
  activeSection: string;
  /** Push the fixed sidebar below the header, and also below the sandbox bar
   *  when one is pinned at the very top. */
  topOffset?: "default" | "sandbox";
}) {
  const projectHrefFor = (id: string) => projectHref(project.id, id, envId);
  // Project view shows a module's sections only once the project has it.
  const { modules } = useProjectModules(project);
  const nav = scope === "company" ? FOLDER_NAV : projectNav(modules);
  // The list's context (from the shell): a new one loads the categories in.
  const panelKey = contextKey ?? `${scope === "company" ? `folder:${folderId}` : `project:${project.id}`}:${drillCategoryFor(activeSection, nav)?.id ?? "main"}`;
  // Full height. Under the sandbox strip the navigation frame is the sidebar's containing block (shell.tsx), so the
  // sidebar fills that frame instead of the viewport.
  const offsetClass =
    topOffset === "sandbox"
      ? "top-0! h-full! border-r-0!"
      : "top-0! h-svh! border-r-0!";
  return (
    <Sidebar collapsible="icon" className={cn(offsetClass, NAV_STYLE, SIDE_PADDING, NAV_LIGHT_GRAY /* light grey at every level; the logo row stays in the black header */)}>
      {/* Top: brand + collapse, then search, then store switcher. (Environment
          lives inside the Store flow now.) */}
      {/* The header's left end: the logo row is part of the black top header that runs across the page (same height,
          no line under it; the top navigation has its own). */}
      <SidebarHeader className="h-14 shrink-0 justify-center bg-[#F6F6F6] py-0 text-foreground">
        {/* Usability test: 16px top padding so the logo row lines up with the top bar (King · Production). */}
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:justify-center">
          {/* R16 (V-13): the Appcharge mark no longer opens a folder selector on hover (it covered the sidebar); it goes
              to the company's Home. Folders and projects are switched from the sidebar's Folders & projects tree. */}
          <Link
            href={companyHref(client.id, "home")}
            aria-label={`${client.company.name} home`}
            className="flex size-8 shrink-0 items-center justify-center rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:hidden"
          >
            <AppchargeLogo className="size-7" />
          </Link>
          <div className="flex-1 group-data-[collapsible=icon]:hidden" />
          <CollapseToggle />
        </div>
        {/* Where you are and Folders & projects are in the top navigation (ScopeSwitcher), with the environment. */}
      </SidebarHeader>
      <SidebarContent className="pt-2">
        {/* When the context changes (not on every section click), the new categories load in (nav-motion.tsx). */}
        <NavPanelTransition panelKey={panelKey} className="flex flex-col gap-2">
          {/* Folder view (Company included) rolls up every project inside it;
              Project view is where daily work happens. */}
          <ScopeNav
            // Usability test: no heading in a project (the module name above Home / Orders is removed).
            // No level title (Company / Folder) above the nav at any level: the top bar already says where you are.
            label={undefined}
            nav={nav}
            activeId={activeSection}
            hrefFor={scope === "company" ? (id) => companyHref(client.id, id, folderId) : projectHrefFor}
          />
        </NavPanelTransition>
      </SidebarContent>
      <SidebarFooter className="gap-1">
        {/* R17 (V-02): adding a module, in the sidebar footer above the Setup checklist. */}
        {scope === "project" ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={sidebarTip("Add module")}
                isActive={activeSection === "adm-modules"}
                render={<Link href={projectHrefFor("adm-modules")} />}
              >
                <IconPlus />
                <span>Add module</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
        {/* Setup checklist — while any of the project's modules is setting up. */}
        {scope === "project" ? <SetupChecklistIndicator project={project} /> : null}
        {/* Launch plan — appears once the store is set up. */}
        <LaunchPlanIndicator />
        {/* Usability test: Settings is hidden for now (the settings area isn't part of the test). */}
        {/* Account. */}
        <AccountMenu variant="full" />
      </SidebarFooter>
    </Sidebar>
  );
}
