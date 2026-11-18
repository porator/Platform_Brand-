# Usability Test - Projects & Navigation (from vs 004)

Duplicated from `appcharge-design-system-vs-004/` on 2026-11-04 for usability testing as a first-time
user: intro page with Start at `/`, default company `acme-ft-empty`, no flow guide, no NewGen menu, no
Review tools, no `/flows` deck. Runs on port 3601 (launch config `usability-test`). See `../README.md`.

---

# vs 004 — snapshot (WIREGRAME 004)

Duplicated from `appcharge-design-system-vs-003/` on 2026-11-03. It starts
exactly where vs 003 ended (folder hierarchy, location selector, drill-in,
generic structure as default, typography pass); vs 003 stays as the restore
point for that state.

## What vs 004 adds: the three PRD user flows (2026-11-03)
Source of truth: Foldering PRD (Confluence, Product space) and its linked
Project Lifecycle and Module Management PRDs.
- **Acme Games** (`client=acme`, in Review tools): the Foldering PRD's example
  tree, two projects at the root, an empty Archive; Sandbox 1 and Sandbox 2.
  Access grants are mocked in `lib/folders.ts`.
- **Flows** (`lib/flows.ts`): 1 Org structure (12 steps), 2 New project (8),
  3 Add a module (8). Each step is a URL, with PRD branches.
- **Flow guide** (`flow-guide.tsx`): floating dark capsule (bottom center), not
  dashboard chrome. Flow tabs, back / next, all steps + branches, Restart.
- **Top bar**: clickable breadcrumbs; the last one opens the scope selector;
  then the environment selector. Removed from the sidebar header.
- **Scope selector** rebuilt to Stories 1–5 (search, module chips, badges, ⋯
  menus, New folder panel, Move + access impact, Who has access, Delete).
- **Sidebar IA** per the PRD tables; module sections only for added modules.
  Renamed: Administrations → Administration, User Management → Users & Access,
  D2C Modules → Module management, Project Sync → Projects Sync,
  Engagements → Engagement; Environments moved under Administration.
- **Create project** (`/dashboard/create-project`), **Module management**
  (`adm-modules`), **Payment Methods per module**, **Setup checklist**
  (`?panel=checklist`, steps in `lib/setup.ts`).
- **Deck** at `/flows`: "The three user flows defined in the PRD", in the
  NewGen menu under Presentations.

## Glossary and defaults (2026-11-03)
- **Generic structure uses the Foldering PRD glossary**: Company (root) ›
  Folder › Sub-folder › Project, with Modules (Webstore + Direct Checkout, shown
  as "Webstore +1") and Production + Sandbox 1 / Sandbox 2. Studio, Game and
  Staging are gone (not glossary terms).
- **Every load opens in light mode with wireframe mode on.** Dark mode and
  wireframe are per-session toggles in Review tools; neither is saved
  (`useThemeMode` in `providers.tsx` forces the theme; a stored next-themes
  choice is ignored).

## First-time user flows (2026-11-03)
Each PRD flow now has two versions; the flow guide and the presentation
(`/flows`) switch between **First time** and **Returning** (today's flows,
unchanged). Switching keeps your place in each version.
- **Fixtures** (`lib/newgen.ts`, hidden from Review as client): a brand-new
  Acme Games (no folders, no projects) at each stage of building its tree —
  `acme-ft` → `acme-ft-l1` → `acme-ft-l1b` → `acme-ft-l2` → `acme-ft-p1` →
  `acme-ft-tree` — plus `acme-ft-empty` for New project. Every step URL names
  its stage, so it opens on exactly its tree with no state carried over.
- **Org structure** (12 steps): the Admin builds the tree from nothing — empty
  Company → scope selector → Casual Games (level 1) → Strategy Games (level 1)
  → Puzzle Studio (level 2) → create Puzzle Blast Store in Puzzle Studio →
  Empire Clash Store in Strategy Games → the finished tree (`expand=all`) →
  Folder view (Company roll-up) → Project view (full path) → pin a folder.
- **New project** (6): empty Company ("No projects in this folder yet") → find
  your game → confirm details (destination Company; folder inline as a branch)
  → template → created → setup checklist on mock endpoints.
- **Add a module** (5): the project from New project, not live → Module
  management → add Payment Links → its steps join the existing checklist.
- Only PRD-defined screens and messages; the user's mindset is a slide before
  each first-time flow in the presentation, never in the product.
- Fix: the create flow's default name no longer clashes with the project being
  created ("Word Rush Store 2" on the done screen).

## Running this copy
It has its own `node_modules` (pnpm install, hardlinked from the global store —
not symlinked):

```bash
pnpm --prefix "appcharge-design-system-vs-004" exec next dev -p 3104
```

Then open http://localhost:3104/dashboard. Storybook:
`pnpm --dir "appcharge-design-system-vs-004" exec storybook dev -p 6104`.
(Live app 3100 · vs 001 3101 · vs 002 3102 · vs 003 3103 · vs 004 3104.)

---

## Inherited from vs 003


Duplicated from `appcharge-design-system-vs-002/` on 2026-10-26, after the
vs-002 iteration below. vs 002 is the restore point for the state before
these changes.

## What vs 003 adds on top of vs 002
- **Full navigation IA** (`lib/newgen.ts` → `COMPANY_NAV_TREE`,
  `PROJECT_NAV_TREE`, `PROJECT_CONFIG_NAV`), rendered as nested collapsible
  trees by `NavTree`:
  - Company level: Company Overview · Studios (Evergreen +224, Big Fish +8 →
    Big Fish Casino → BFC Main, Jackpot Magic Slots +56) · Games ·
    Members & Access · Company Settings.
  - Project level (BFC Main): Webstore (Overview, Template Studio → Store
    Foundations / Store Blocks / Block Editor / Products & Offers / Asset
    Library / Responsive Design) · Direct Checkout · Analytics · Players ·
    Finance · Integrations · Project Settings · Environments, plus a
    Configuration & Integrations group.
  - Leaves route to the generic section pages (titled placeholders).
- **Hover context switcher on the sidebar's Appcharge logo**: hovering opens
  Companies › games to its right and dims the nav behind it (same treatment as
  the Store-flow mini-rail). The logo no longer links to `/dashboard`.
- **Drill-in game rows** in the switcher: a chevron expands a game to show
  what's under it (its projects or product areas) and each row navigates
  straight in. Games with several projects are grouped into one row.
- **Tripledot Studios** added as a review-as-client design partner
  (Zenlife Webstore + Direct Checkout, GameHub).

## Nested project hierarchy (2026-10-26)
Rebuilt the navigation and the selector on the model in
`../Nested project hierarchy 0.1` (the Foldering deck):
- **Folder tree replaces Company › Studio › Game › Project.** Company is the
  root, up to 4 folder levels, projects at the root or in any folder
  (`client.tree` in `lib/newgen.ts`; helpers + rules in `lib/folders.ts`).
  Product Madness: Evergreen, Big Fish › Big Fish Casino, and an empty Archive.
  Wooga: projects directly under Company. Tripledot: Zenlife folder + GameHub.
- **Location selector** (`components/dashboard/folder-selector.tsx`), in the
  sidebar header and on the logo hover: full path in the trigger; one tree of
  folders and projects with counts and status tags; search across every level
  with paths; hover + to add a sub-folder inline (depth limit 4, duplicate
  names caught); More → Rename in place, Move… (folder picker that marks
  current / this folder and blocks too-deep or duplicate targets), Delete
  (only when empty, says why otherwise); project More → Open in Production or
  a sandbox. Folder edits are kept in memory and reset on reload.
- **What selecting does.** Folder (Company included) → roll-up tabs: Home,
  Orders, Analytics, Developer, Projects Sync, Users & Access; Home lists every
  project inside with its path. Project → Home, Orders, Analytics, Studio,
  LiveOps›, Content, Localization›, Developer›, Finance›, Administrations›,
  Environments.
- **Contextual drill-in.** A › category replaces the whole sidebar with a back
  arrow, its name and its sections; the path and environment stay put. It's
  driven by the URL, so links and refreshes reopen the same menu. The top is a
  compact Shopify-style header block — a dedicated back-arrow button, the
  category's icon and name, and a divider above the sections.
- **Environment** selector appears on projects only; the sandbox strip reads
  "You're in Sandbox. Everything here uses test data." with Switch to Production.
- **Generic structure (no client)** in Review tools › Without a client:
  Appcharge Co. › Studio › Game › Project, environments Production / Staging /
  Sandbox — the bare hierarchy, like the DASHBOARD TREE diagram. This is the
  **default**: `/dashboard` opens on it; real clients are chosen from the menu.
- The earlier BFC Main IA trees (`PROJECT_NAV_TREE`, `COMPANY_NAV_TREE`,
  `PROJECT_CONFIG_NAV`) are no longer rendered.

## Typography pass (2026-10-26)
Applied the typography review (claude.ai/artifact/VLaLaCbxqxfvRVZpXzJBnx):
- **Seven-step type scale** as tokens in `app/globals.css` (`text-title` 26/650,
  `text-stat` 22/600, `text-section` 16/600, `text-body` 14, `text-nav` 13,
  `text-meta` 12, `text-micro` 11/600 caps-tracking). `lib/utils.ts` registers
  them with `cn`, and every component now imports `cn` from there (the bare
  `cn` package dropped custom sizes as if they were colours).
- **"Soon"** is an outlined 11px caps tag; soon rows use the muted colour at
  full opacity (1.9:1 → 5.4:1 light, 2.6:1 → 6.8:1 dark).
- **Active nav items** are 600; the drill-in heading is 14/600; group labels
  are 11/600 caps.
- **Selector**: start-side ellipsis keeps the nearest parent visible; current
  name at 600; status tags 11px caps. **Environment** is a 12px state line.
- **Page header**: location line (name at 600 + environment pill, or project
  count) above a 26/650 title; the full path stays in the selector.
- **Stats**: labels 12/500, values 22/600, supporting 12/400; card titles 600.
- Light-mode `--muted-foreground` darkened (≈4.6:1 → ≈5.4:1). Geist Sans removed.

## Running this copy
It has its own `node_modules` (pnpm install, hardlinked from the global store —
not symlinked):

```bash
pnpm --prefix "appcharge-design-system-vs-003" exec next dev -p 3103
```

Then open http://localhost:3103/dashboard/bfc-main/home.
(Live app 3100 · vs 001 3101 · vs 002 3102 · vs 003 3103.)
