/**
 * The three PRD user flows, walked on the Acme Games company. Every step is a
 * URL, so a screen is reachable from the flow guide and from the UI itself
 * (clicking through lands on the same URLs). Branches are the PRD's alternate
 * states for a step (errors, permissions, variants).
 *
 * Each flow comes in two versions. Returning: a Publisher who already uses the
 * Dashboard, on Acme Games with its folders in place. First time: the same
 * three jobs for a brand-new Publisher (a company with no folders or projects,
 * whose tree the user builds), using only the screens and messages the PRDs
 * define. The user's mindset for a first-time flow lives in the
 * presentation, never in the product.
 *
 * Sources: Foldering PRD (Stories 1–7), Project Lifecycle PRD (Stories 1–5),
 * Module Management PRD (Stories 1, 2, 4).
 */

import type { ClientId } from "@/lib/newgen";
import type { FlowId, FlowMode } from "@/components/dashboard/providers";

export type FlowBranch = { title: string; href: string };
export type FlowStep = { title: string; screen: string; href: string; branches?: FlowBranch[]; note?: string };
/** Who a first-time user is, what they already know, and what they expect to see. */
export type Mindset = { who: string; knows: string; expects: string };
export type Flow = { id: FlowId; mode: FlowMode; title: string; persona: string; source: string; mindset?: Mindset; steps: FlowStep[] };

function u(path: string, params: Record<string, string> = {}): string {
  const q = new URLSearchParams(params).toString();
  return q ? `${path}?${q}` : path;
}

const CO = "/dashboard/company/home";
const co = (p: Record<string, string> = {}) => u(CO, { client: "acme", ...p });
const NEW = "/dashboard/create-project";
const create = (p: Record<string, string> = {}) => u(NEW, { client: "acme", from: "acme-puzzle", ...p });
const STORE_URL = "https://play.google.com/store/apps/details?id=com.acme.wordrush";
const PZ = "/dashboard/acme-puzzle-store";
const PL = { added: "payment-links" };

export const FLOWS: Flow[] = [
  {
    id: "org",
    mode: "returning",
    title: "Org structure",
    persona: "Studios manager · Admin on Company",
    source: "Foldering PRD · Stories 1–5",
    steps: [
      { title: "Company view", note: "Company is the permanent root. On release every project sits here, flat; Folder view rolls them all up.", screen: "Folder view · Company", href: co() },
      {
        title: "Folders & projects in the sidebar",
        note: "One tree of folders and projects, the only place they're navigated: search, the bigger view, and + (New folder · New project).",
        screen: "Sidebar › Folders & projects",
        href: co({ panel: "locations" }),
        branches: [{ title: "Search with no match", href: co({ panel: "locations", q: "zebra" }) }],
      },
      {
        title: "Create a folder",
        note: "Name, a Location with its full path, and “Up to 4 nested levels.” Names are unique among folders and projects at that level.",
        screen: "Sidebar › + › New folder",
        href: co({ panel: "new-folder" }),
        branches: [{ title: "Name already exists here", href: co({ panel: "new-folder", name: "Casual Games" }) }],
      },
      { title: "Nest a sub-folder", note: "⋯ › New sub-folder opens the same panel with the location prefilled. Level-4 folders, or ones holding 50 folders, can’t take more.", screen: "Folder ⋯ › New sub-folder", href: co({ panel: "new-folder", parent: "acme-casual" }) },
      { title: "Folder actions", note: "Pin as default view and Who has access for everyone; New sub-folder, Rename, Move to and Delete for Admins. Delete is off until the folder is empty.", screen: "Folder ⋯ menu", href: co({ panel: "menu", item: "f:acme-casual" }) },
      { title: "Rename a folder", note: "Renamed in place with the same validation. The new name shows everywhere at once: tree, top bar, search.", screen: "Folder ⋯ › Rename", href: co({ panel: "rename", item: "f:acme-strategy" }) },
      { title: "Move a project into a folder", note: "Every folder the user can see, with invalid destinations greyed out and the reason (current, name taken, depth).", screen: "Project ⋯ › Move to folder", href: co({ panel: "move", item: "p:acme-bubble-store" }) },
      {
        title: "Confirm the access impact",
        note: "Who gains, loses or changes role. Grants on the moved item stay with it, and folder totals now include the project’s full history.",
        screen: "Move · confirm dialog",
        href: co({ panel: "move", item: "p:acme-bubble-store", to: "acme-casual" }),
        branches: [{ title: "Move a folder", href: co({ panel: "move", item: "f:acme-puzzle", to: "acme-strategy" }) }],
      },
      {
        title: "Delete an empty folder",
        note: "Only an empty folder can go. “Grants set on this folder will be removed.” Projects are never deleted with a folder.",
        screen: "Folder ⋯ › Delete",
        href: co({ panel: "delete", item: "f:acme-archive" }),
        branches: [{ title: "Not empty → Delete is off", href: co({ panel: "menu", item: "f:acme-strategy" }) }],
      },
      { title: "Who has access", note: "Every person with access, their role, and whether it’s set here or inherited. The closest grant wins.", screen: "Folder ⋯ › Who has access", href: co({ panel: "access", item: "f:acme-casual" }) },
      { title: "Folder view roll-up", note: "Home, Orders, Analytics, Players, Developer, Finance and Administration, rolled up across every accessible project inside.", screen: "Folder view · Casual Games", href: co({ folder: "acme-casual" }) },
      { title: "Pin as default view", note: "The Dashboard opens on this folder at sign-in. The pin follows the folder if it moves.", screen: "Folder ⋯ › Pin as default view", href: co({ folder: "acme-casual", panel: "menu", item: "f:acme-casual" }) },
    ],
  },
  {
    id: "project",
    mode: "returning",
    title: "New project",
    persona: "Project manager · Admin on a folder",
    source: "Project Lifecycle PRD · Stories 1–5 · Foldering PRD · Story 6",
    steps: [
      {
        title: "Start in a folder",
        note: "A Publisher Admin starts where the project should live. An empty folder offers Create project; non-Admins can’t create.",
        screen: "Folder view · Puzzle Studio",
        href: co({ folder: "acme-puzzle" }),
        branches: [
          { title: "Empty folder → Create project", href: co({ folder: "acme-archive" }) },
          { title: "Not an Admin", href: u(NEW, { client: "acme", denied: "1" }) },
        ],
      },
      { title: "Sidebar › New project", note: "New project sits under + next to Folders & projects, with New folder, for Admins on Company or a folder.", screen: "Sidebar › Folders & projects › +", href: co({ folder: "acme-puzzle", panel: "locations" }) },
      {
        title: "Find your game",
        note: "One field: a game name or an App Store / Google Play link. A link fills in title, icon, genre and description; a known game is linked.",
        screen: "Create project · Step 1",
        href: create(),
        branches: [
          { title: "Store URL → details fetched", href: create({ q: STORE_URL }) },
          { title: "Existing game → linked", href: create({ q: "puzzle blast" }) },
          { title: "Not a game or store URL", href: create({ q: "https://example.com/word-rush" }) },
          { title: "Store page can't be read", href: create({ q: "https://apps.apple.com/app/unreadable" }) },
        ],
      },
      { title: "Clone an existing project", note: "Pick any project you can access. Its products, offers, designs and settings are copied; orders, keys and domains aren’t.", screen: "Create project · Clone", href: create({ step: "clone" }) },
      {
        title: "Confirm details and destination",
        note: "Everything prefilled: a suggested folder, a default name, Webstore selected and starter content on. Create a folder right in the picker.",
        screen: "Create project · Step 2",
        href: create({ step: "2", q: STORE_URL }),
        branches: [
          { title: "Cloning: what's copied", href: create({ step: "2", clone: "acme-puzzle-store" }) },
          { title: "+ Create new folder in the picker", href: create({ step: "2", q: STORE_URL, newfolder: "1" }) },
          { title: "Name taken meanwhile", href: create({ step: "2", q: STORE_URL, error: "name" }) },
          { title: "Couldn't create", href: create({ step: "2", q: STORE_URL, error: "create" }) },
        ],
      },
      {
        title: "Choose a store template",
        note: "Previews already show the game. One template is Recommended with reasons; AI context (prompt, images, brand files) is optional.",
        screen: "Create project · Step 3",
        href: create({ step: "3", q: STORE_URL }),
        branches: [{ title: "Add context for AI", href: create({ step: "3", q: STORE_URL, ai: "1" }) }],
      },
      {
        title: "Project created",
        note: "Production and a Default Sandbox, a default domain and a live store preview, running on mock endpoints with test payments.",
        screen: "Created · store preview",
        href: create({ step: "done", q: STORE_URL }),
        branches: [{ title: "Starter content failed", href: create({ step: "done", q: STORE_URL, error: "starter" }) }],
      },
      { title: "Setup checklist in Production", note: "The new project opens on its setup checklist: the go-live steps for each of its modules.", screen: "Project view · Setup checklist", href: u("/dashboard/acme-word-store/home", { panel: "checklist" }) },
    ],
  },
  {
    id: "module",
    mode: "returning",
    title: "Add a module",
    persona: "Project manager · Admin on the project",
    source: "Module Management PRD · Stories 1, 2, 4",
    steps: [
      {
        title: "Open the project",
        note: "Puzzle Store is a live, Webstore-only project. The sidebar shows only Webstore’s sections.",
        screen: "Project view · Puzzle Store",
        href: u(`${PZ}/home`),
        branches: [{ title: "Shortcut: ⋯ › Project settings", href: u(`${PZ}/home`, { panel: "menu", item: "p:acme-puzzle-store" }) }],
      },
      {
        title: "Module management",
        note: "Administration › Module management lists every module: Added (Setting up / Live), Available, or Coming soon.",
        screen: "Administration › Module management",
        href: u(`${PZ}/adm-modules`),
        branches: [{ title: "Not an Admin → can't add", href: u(`${PZ}/adm-modules`, { as: "developer" }) }],
      },
      {
        title: "Add Payment Links",
        note: "“Payment Links will be added to Production and all sandboxes. You can’t remove it later.” Admins only.",
        screen: "Confirm dialog",
        href: u(`${PZ}/adm-modules`, { dialog: "add-module", module: "payment-links" }),
        branches: [{ title: "Another Admin added it first", href: u(`${PZ}/adm-modules`, { dialog: "add-module", module: "payment-links", conflict: "1" }) }],
      },
      { title: "Added · Setting up", note: "The module is added. Its status reads Setting up until its go-live steps are done in Production.", screen: "Module management", href: u(`${PZ}/adm-modules`, PL) },
      { title: "Sidebar shows the module", note: "Its sections appear for everyone without a reload, e.g. Studio › Checkout · Payment Links.", screen: "Studio › Checkout · Payment Links", href: u(`${PZ}/studio-checkout-payment-links`, PL) },
      { title: "Setup checklist reappears", note: "On a live project the checklist comes back with only the new module’s steps; shared integrations are already done.", screen: "Setup checklist · new steps only", href: u(`${PZ}/home`, { ...PL, panel: "checklist" }) },
      { title: "Payment methods per module", note: "One project default, with per-module overrides shown as Inherited or Overridden, and Reset to project default.", screen: "Finance › Payment Methods", href: u(`${PZ}/fin-payment-methods`, { ...PL, module: "payment-links" }) },
      { title: "Module is Live", note: "Every go-live step is done in Production, so the module reads Live.", screen: "Module management", href: u(`${PZ}/adm-modules`, { ...PL, live: "payment-links" }) },
    ],
  },
];


/* ───────── First time ───────── */

const ft = (client: ClientId, p: Record<string, string> = {}) => u(CO, { client, ...p });
/** Create project from the empty company's Company view (its empty-state button). */
const ftCreate = (p: Record<string, string> = {}) => u(NEW, { client: "acme-ft-empty", from: "root", ...p });
const WR = "/dashboard/ft-word-store";

export const FIRST_FLOWS: Flow[] = [
  {
    id: "org",
    mode: "first",
    title: "Org structure",
    persona: "Publisher Admin · a new company · first sign-in",
    source: "Foldering PRD · Stories 1, 2, 6, 7 · Project Lifecycle PRD · Story 3",
    mindset: {
      who: "An Admin at Acme Games, a brand-new Publisher. The company is set up, with no folders and no projects yet.",
      knows: "How their business is organized: casual games, with a puzzle studio inside, and a strategy line. Not how Appcharge structures any of it.",
      expects: "To lay that structure out themselves, folders first, then put each game’s project where it belongs, and to see it all in one tree.",
    },
    steps: [
      { title: "First sign-in", note: "Nothing exists below Company yet. Company’s Folder view shows the PRD’s empty state, “No projects in this folder yet”, with Create project.", screen: "Folder view · Company (empty)", href: ft("acme-ft") },
      { title: "Folders & projects in the sidebar", note: "The tree is empty: no folders or projects yet. + has New folder and New project.", screen: "Sidebar › Folders & projects", href: ft("acme-ft", { panel: "locations" }) },
      {
        title: "Create the first folder",
        note: "New folder, located at Company: a name, the location’s full path and “Up to 4 nested levels.” Casual Games becomes level 1.",
        screen: "Sidebar › + › New folder",
        href: ft("acme-ft", { panel: "new-folder", name: "Casual Games" }),
      },
      {
        title: "Add a second level-1 folder",
        note: "Back on Company, the same panel makes Strategy Games, beside Casual Games. Names are unique among folders and projects at a level.",
        screen: "Sidebar › + › New folder",
        href: ft("acme-ft-l1", { panel: "new-folder", name: "Strategy Games" }),
        branches: [{ title: "Name already exists here", href: ft("acme-ft-l1", { panel: "new-folder", name: "Casual Games" }) }],
      },
      { title: "Nest a level-2 folder", note: "Casual Games ⋯ › New sub-folder opens the same panel, located in Casual Games. Puzzle Studio becomes level 2.", screen: "Folder ⋯ › New sub-folder", href: ft("acme-ft-l1b", { folder: "ft-casual", panel: "new-folder", parent: "ft-casual", name: "Puzzle Studio" }) },
      { title: "Create a project in a folder", note: "Puzzle Studio is selected and empty: “No projects in this folder yet”, with Create project. The folder it starts from becomes the project’s destination.", screen: "Folder view · Puzzle Studio (empty)", href: ft("acme-ft-l2", { folder: "ft-puzzle" }) },
      {
        title: "Confirm its place in the tree",
        note: "The destination is prefilled with Puzzle Studio, where the user is Admin, and shown with its full path. The default name is “Puzzle Blast Store”.",
        screen: "Create project · Step 2",
        href: u(NEW, { client: "acme-ft-l2", from: "ft-puzzle", step: "2", q: "Puzzle Blast" }),
      },
      { title: "A project in the other branch", note: "Same flow from Strategy Games: the destination is Strategy Games, the name “Empire Clash Store”.", screen: "Create project · Step 2", href: u(NEW, { client: "acme-ft-p1", from: "ft-strategy", step: "2", q: "Empire Clash" }) },
      { title: "The finished tree", note: "Two level-1 folders, a level-2 folder inside one, and a project in each branch. Folders show their project counts, projects their module badge.", screen: "Sidebar › Folders & projects · expanded", href: ft("acme-ft-tree", { panel: "locations", expand: "all" }) },
      { title: "Folder view", note: "Selecting Company or a folder opens Folder view: cross-project tabs only, rolled up across every project below. Company now totals both projects.", screen: "Folder view · Company", href: ft("acme-ft-tree") },
      { title: "Project view", note: "Selecting a project opens Project view: its full set of tabs; the top bar names the project.", screen: "Project view · Puzzle Blast Store", href: u("/dashboard/ft-puzzle-store/home") },
      { title: "Pin a folder as default view", note: "⋯ › Pin as default view: from the next sign-in the Dashboard opens on Casual Games instead of Company.", screen: "Folder ⋯ › Pin as default view", href: ft("acme-ft-tree", { folder: "ft-casual", panel: "menu", item: "f:ft-casual" }) },
    ],
  },
  {
    id: "project",
    mode: "first",
    title: "New project",
    persona: "Publisher Admin · a company with no projects yet",
    source: "Project Lifecycle PRD · Stories 1, 3–5 · Foldering PRD · Stories 6–7",
    mindset: {
      who: "A Publisher Admin at Acme Games whose company was just set up. It has no projects and no folders yet.",
      knows: "Their game and its App Store or Google Play page. Not how Appcharge organizes projects, folders or modules.",
      expects: "One obvious way to start, and to see their own store working fast. The PRD’s bar is a working Webstore in under 30 seconds.",
    },
    steps: [
      { title: "An empty company", note: "No projects and no folders. Company’s Folder view shows the PRD’s empty state, “No projects in this folder yet”, with Create project.", screen: "Folder view · Company (empty)", href: ft("acme-ft-empty") },
      {
        title: "Find your game",
        note: "One field for a game name or a store link. A Google Play link fills in the title, icon, genre and description.",
        screen: "Create project · Step 1",
        href: ftCreate(),
        branches: [{ title: "Store URL → details fetched", href: ftCreate({ q: STORE_URL }) }],
      },
      {
        title: "Confirm details",
        note: "With no folders there’s nothing to suggest, so the destination is Company, where the user is Admin. A folder can be created right in the picker. Default name, Webstore and starter content come prefilled.",
        screen: "Create project · Step 2",
        href: ftCreate({ step: "2", q: STORE_URL }),
        branches: [{ title: "+ Create new folder in the picker", href: ftCreate({ step: "2", q: STORE_URL, newfolder: "1" }) }],
      },
      { title: "Choose a store template", note: "The previews already show Word Rush. One template is Recommended, with its reasons.", screen: "Create project · Step 3", href: ftCreate({ step: "3", q: STORE_URL }) },
      { title: "Project created", note: "“Project created!” with a live store preview. Production and the Default Sandbox run on Appcharge mock endpoints, with test payments only.", screen: "Created · store preview", href: ftCreate({ step: "done", q: STORE_URL }) },
      { title: "Setup checklist", note: "The project opens on its setup checklist in Production: Webstore’s go-live steps, and that it’s on mock endpoints until the integration is set up.", screen: "Project view · Setup checklist", href: u(`${WR}/home`, { panel: "checklist" }) },
    ],
  },
  {
    id: "module",
    mode: "first",
    title: "Add a module",
    persona: "Publisher Admin · the project just created",
    source: "Module Management PRD · Stories 1, 2",
    mindset: {
      who: "The same Admin, right after creating Word Rush Store. The project isn’t live yet.",
      knows: "Their store works on mock endpoints and the setup checklist shows what’s left. They also want to sell in-game, through Payment Links.",
      expects: "To add Payment Links to the same project instead of creating another one, and to see everything still to do in one list.",
    },
    steps: [
      { title: "Open the new project", note: "Word Rush Store, from New project. It isn’t live: Webstore’s go-live steps are still open.", screen: "Project view · Word Rush Store", href: u(`${WR}/home`) },
      { title: "Module management", note: "Administration › Module management: Webstore Added · Setting up, Payment Links and Direct Checkout Available, App Direct Coming soon.", screen: "Administration › Module management", href: u(`${WR}/adm-modules`) },
      { title: "Add Payment Links", note: "“Payment Links will be added to Production and all sandboxes. You can’t remove it later.”", screen: "Confirm dialog", href: u(`${WR}/adm-modules`, { dialog: "add-module", module: "payment-links" }) },
      { title: "Added · Setting up", note: "Both modules read Setting up: the project isn’t live, and each has go-live steps left.", screen: "Module management", href: u(`${WR}/adm-modules`, PL) },
      { title: "Its steps join the checklist", note: "Payment Links’ go-live steps join the same checklist. Integrations both modules use, like request signing and awarding, appear once.", screen: "Setup checklist", href: u(`${WR}/home`, { ...PL, panel: "checklist" }) },
    ],
  },
];

/** Both versions, Returning first. */
export const ALL_FLOWS: Flow[] = [...FLOWS, ...FIRST_FLOWS];
export const flowsFor = (mode: FlowMode): Flow[] => (mode === "first" ? FIRST_FLOWS : FLOWS);

/** Params that define a screen; a URL carrying one a step doesn't name is a different screen. */
const SIGNIFICANT = ["folder", "panel", "item", "to", "step", "dialog", "clone", "denied", "module", "as", "parent"];

export type FlowPosition = { flow: Flow; step: number; branch?: number };

/** How well a step URL describes the current URL (-1 when it doesn't). */
function score(href: string, pathname: string, params: URLSearchParams): number {
  const [path, query = ""] = href.split("?");
  if (path !== pathname) return -1;
  const want = new URLSearchParams(query);
  for (const [k, v] of want) if (params.get(k) !== v) return -1;
  for (const k of SIGNIFICANT) if (params.has(k) && !want.has(k)) return -1;
  return [...want.keys()].length;
}

/** The step (or branch) the current URL is on — the active version and flow first. */
export function locate(pathname: string, params: URLSearchParams, active: FlowId, mode: FlowMode = "returning"): FlowPosition | null {
  const rank = (f: Flow) => Number(f.mode === mode) * 2 + Number(f.id === active);
  const order = [...ALL_FLOWS].sort((a, b) => rank(b) - rank(a));
  let best: (FlowPosition & { s: number }) | null = null;
  for (const flow of order) {
    flow.steps.forEach((st, i) => {
      const s = score(st.href, pathname, params);
      if (s > (best?.s ?? -1)) best = { flow, step: i, s };
      st.branches?.forEach((b, j) => {
        const sb = score(b.href, pathname, params);
        if (sb > (best?.s ?? -1)) best = { flow, step: i, branch: j, s: sb };
      });
    });
  }
  return best;
}
