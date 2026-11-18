/**
 * NewGen Navigation & Project Structure — client-driven data model.
 *
 * The dashboard is driven by a `client` config: each Appcharge client is just a
 * dataset. Two are defined here:
 *   - Product Madness — a clean 4-level model (Company › Studio › Game › Project)
 *     with sandboxes and a project that composes two products.
 *   - Wooga — a collapsed model with NO studio layer (Company › Game › Project),
 *     Production only (no sandbox), and features living inside the Webstore group.
 *
 * The active client is derived from the URL (the project id, which is unique
 * across clients; company scope carries `?client=`), so deep links and reloads
 * resolve to the right dataset without extra persistence.
 */

import type { ComponentType } from "react";
import {
  IconHome2,
  IconReceipt2,
  IconChartBar,
  IconShoppingBag,
  IconSparkles,
  IconRepeat,
  IconArticle,
  IconRosette,
  IconTicket,
  IconUserOff,
  IconTestPipe,
  IconBolt,
  IconSettings,
  IconHammer,
  IconLanguage,
  IconCode,
  IconCashBanknote,
  IconBuilding,
  IconDeviceGamepad2,
  IconFolders,
  IconUsersGroup,
  IconTemplate,
  IconRotateClockwise2,
  IconPalette,
  IconAdjustments,
  IconRefresh,
  IconKey,
  IconWorld,
  IconBell,
  IconListDetails,
  IconCurrencyDollar,
  IconPlugConnected,
  IconReportAnalytics,
  IconCreditCard,
  IconBuildingStore,
  IconServer,
  IconAlertTriangle,
  IconRocket,
} from "@/lib/icons";

export type Icon = ComponentType<{ className?: string }>;
export type NavItem = { id: string; label: string; icon: Icon; badge?: number; tag?: string; soon?: boolean; modules?: ModuleId[]; children?: NavNode[] };
export type ProductGroup = { id: string; label: string; items: NavItem[] };

/** A nav node that can nest (collapsible groups) and carry a "Soon" state. */
export type NavNode = {
  id: string;
  label: string;
  icon?: Icon;
  soon?: boolean;
  /** Shown only when the project has one of these modules (Module Management PRD, Story 2). */
  modules?: ModuleId[];
  /** Explicit link target; when omitted a leaf uses the nav's hrefFor(id). */
  href?: string;
  children?: NavNode[];
};

/* --------------------------------- modules -------------------------------- */
/* Module Management PRD: a project holds one or more modules — one of each, at
 * least one, permanent. App Direct is shown as Coming soon. */

export type ModuleId = "webstore" | "payment-links" | "direct-checkout";
export const MODULES: { id: ModuleId | "app-direct"; label: string; description: string; soon?: boolean }[] = [
  { id: "webstore", label: "Webstore", description: "A full web store with offers, engagement and content." },
  { id: "payment-links", label: "Payment Links", description: "In-game purchases on an Appcharge-hosted checkout." },
  { id: "direct-checkout", label: "Direct Checkout", description: "Appcharge's checkout inside your own web store." },
  { id: "app-direct", label: "App Direct", description: "In-app purchase integration.", soon: true },
];
export const MODULE_LABEL: Record<ModuleId, string> = {
  webstore: "Webstore",
  "payment-links": "Payment Links",
  "direct-checkout": "Direct Checkout",
};
export const MODULE_IDS: ModuleId[] = ["webstore", "payment-links", "direct-checkout"];

export type EnvKind = "production" | "sandbox";
export type Environment = {
  id: string;
  name: string;
  kind: EnvKind;
  color: string;
  /** Storefront preview URL for this environment (sandboxes). Production's URL
   *  lives on the project (`productionStoreUrl`). */
  storeUrl?: string;
};

/** Store configuration (Create project, store step): an empty store or a genre's experience, and one page or many. */
export type StoreExperience = "blank" | "casino" | "casual" | "midcore" | "other";
export type StoreStructure = "single-page" | "multiple-pages";
/** The store layout, picked as one visual tile: three single-page arrangements, or the multi-page Game portal. */
export type StoreLayout = "row3" | "row1" | "gallery" | "portal";

export type Project = {
  id: string;
  /** Absent for clients with no studio layer (e.g. Wooga). */
  studio?: string;
  game: string;
  gameInitials: string;
  /** The game's icon (its store artwork), when known; shown instead of the initials. */
  gameIcon?: string;
  /** Webstore setup chosen in Create project: the store template, sample content on/off, and the AI note. */
  storeTemplate?: string;
  /** The store's experience (Blank or a genre) and structure, chosen together on Create project's store step; they
   *  drive store generation later. */
  storeExperience?: StoreExperience;
  storeStructure?: StoreStructure;
  storeLayout?: StoreLayout;
  storeSample?: boolean;
  storeNotes?: string;
  /** The game's brand colours, read from its icon; they colour the store's buttons. */
  storeColors?: string[];
  project: string;
  /** The product groups that make up this project's scoped sidebar. */
  productGroups: ProductGroup[];
  /** The live storefront for this project's Production environment. */
  productionStoreUrl?: string;
  /** A project that exists but isn't configured — renders a graceful empty state. */
  undocumented?: boolean;
  /** Lifecycle tag shown on the project's row in the selector. */
  status?: ProjectStatus;
  /** The modules it holds. When omitted they're read off productGroups. */
  modules?: ModuleId[];
  /** Exists only once the "Create project" flow creates it (not in the tree yet). */
  pending?: boolean;
  /** Where a pending project sits when its page is opened directly (default: Company). */
  pendingIn?: string;
};

export type ClientId =
  | "product-madness"
  | "wooga"
  | "triple-dot"
  | "generic"
  | "acme"
  // First-time flow fixtures: a brand-new Acme Games at each stage of building its tree.
  | "acme-ft"
  | "acme-ft-l1"
  | "acme-ft-l1b"
  | "acme-ft-l2"
  | "acme-ft-p1"
  | "acme-ft-tree"
  | "acme-ft-empty";
export type ClientConfig = {
  id: ClientId;
  company: { name: string; plan: string; initials: string };
  hasStudioLayer: boolean;
  projects: Project[];
  environments: Environment[];
  recentProjectIds: string[];
  defaultProjectId: string;
  companyNav: NavItem[];
  /** The folder tree under the Company root (Nested project hierarchy). */
  tree: TreeNode[];
  /** A user-flow fixture (first-time states): reached from the flow guide,
   *  not listed in Review as client. */
  fixture?: boolean;
};

/* ----------------------------- shared nav bits ---------------------------- */

export const WORKSPACE_NAV: NavItem[] = [
  { id: "home", label: "Overview", icon: IconHome2 },
  { id: "transactions", label: "Transactions", icon: IconReceipt2 },
  { id: "analytics", label: "Analytics", icon: IconChartBar },
];

// Kept for compatibility (section-label lookups); the sidebar now renders the
// nested ADMIN_TREE below instead of this flat list.
export const SETTINGS_NAV: NavItem[] = [
  { id: "finance", label: "Finance", icon: IconCashBanknote },
];

/** Finance sits at the project footer alongside the Administration tree. */
export const FINANCE_NAV: NavItem[] = [{ id: "finance", label: "Finance", icon: IconCashBanknote }];

/** Finance as a collapsible group (project scope): Reports + Payment Methods. */
export const FINANCE_TREE: NavNode = {
  id: "finance",
  label: "Finance",
  icon: IconCashBanknote,
  children: [
    { id: "finance-reports", label: "Reports", icon: IconReportAnalytics },
    { id: "finance-payment-methods", label: "Payment Methods", icon: IconCreditCard },
  ],
};

/**
 * Administration — a nested, collapsible tree (Shopify-style). Developer and
 * Localization are collapsible sub-groups; some items are flagged "Soon".
 */
export const ADMIN_TREE: NavNode = {
  id: "administration",
  label: "Administration",
  icon: IconBuilding,
  children: [
    { id: "admin-general", label: "General", icon: IconAdjustments },
    { id: "admin-users", label: "Users & Access", icon: IconUsersGroup },
    { id: "admin-d2c", label: "Module management", icon: IconShoppingBag },
    { id: "admin-sync", label: "Projects Sync", icon: IconRefresh },
  ],
};

/** Developer — a top-level collapsible section (sibling of Administration), with
 *  Localization nested inside it. */
export const DEVELOPER_TREE: NavNode = {
  id: "developer",
  label: "Developer",
  icon: IconCode,
  children: [
    { id: "dev-api", label: "API & Integrations", icon: IconPlugConnected },
    { id: "dev-auth", label: "Authentication Methods", icon: IconKey },
    { id: "dev-domains", label: "Domain Management", icon: IconWorld },
    { id: "dev-events", label: "Event Center", icon: IconBell },
    { id: "dev-logs", label: "Activity Logs & Errors", icon: IconListDetails, soon: true },
    {
      id: "localization",
      label: "Localization",
      icon: IconLanguage,
      children: [
        { id: "loc-pricing", label: "Pricing", icon: IconCurrencyDollar },
        { id: "loc-translations", label: "Translations", icon: IconLanguage },
      ],
    },
  ],
};

/** The project footer sections, rendered in order (Shopify-style collapsibles). */
export const PROJECT_ADMIN_TREES: NavNode[] = [ADMIN_TREE, DEVELOPER_TREE];

/* ------------------------- full IA trees (vs-002 wire) -------------------- */
/* The complete Product Madness information architecture, rendered as nested,
 * collapsible nav (NavTree). Top-level nodes carry icons; nested groups are
 * text-only, Shopify-style. Leaves route to the generic section pages. */

/** Company-level navigation (sidebar scope = "company"). */
export const COMPANY_NAV_TREE: NavItem[] = [
  { id: "overview", label: "Company Overview", icon: IconHome2 },
  {
    id: "studios",
    label: "Studios",
    icon: IconBuilding,
    children: [
      { id: "studio-evergreen", label: "Evergreen (+224)" },
      {
        id: "studio-bigfish",
        label: "Big Fish (+8)",
        children: [
          {
            id: "game-bfc",
            label: "Big Fish Casino",
            children: [{ id: "bfc-main-link", label: "BFC Main", href: "/dashboard/bfc-main/home" }],
          },
          { id: "game-jms", label: "Jackpot Magic Slots (+56)", href: "/dashboard/jms-store/home" },
        ],
      },
    ],
  },
  { id: "games", label: "Games", icon: IconDeviceGamepad2 },
  { id: "members", label: "Members & Access", icon: IconUsersGroup },
  { id: "company-settings", label: "Company Settings", icon: IconSettings },
];

/** Project-level navigation (sidebar scope = "project") — the BFC Main IA. */
export const PROJECT_NAV_TREE: NavItem[] = [
  {
    id: "webstore",
    label: "Webstore",
    icon: IconBuildingStore,
    children: [
      { id: "ws-overview", label: "Overview" },
      {
        id: "template-studio",
        label: "Template Studio",
        children: [
          {
            id: "ts-foundations",
            label: "Store Foundations",
            children: [
              { id: "ts-f-appearance", label: "General appearance" },
              { id: "ts-f-fonts", label: "Brand fonts & colors" },
              { id: "ts-f-assets", label: "Background & assets" },
              { id: "ts-f-header", label: "Header" },
              { id: "ts-f-footer", label: "Footer" },
            ],
          },
          {
            id: "ts-blocks",
            label: "Store Blocks",
            children: [
              { id: "ts-b-banner", label: "Banner" },
              { id: "ts-b-richtext", label: "Rich Text" },
              { id: "ts-b-player-level", label: "Player Level" },
              { id: "ts-b-bundle", label: "Bundle" },
              { id: "ts-b-promotion", label: "Promotion" },
              { id: "ts-b-popup-modal", label: "Popup (Modal)" },
              { id: "ts-b-popup-widget", label: "Popup (Widget)" },
              { id: "ts-b-daily-modal", label: "Daily Bonus (Modal)" },
              { id: "ts-b-daily-widget", label: "Daily Bonus (Widget)" },
              { id: "ts-b-daily-badge", label: "Daily Bonus Badge" },
              { id: "ts-b-rolling", label: "Rolling Offer" },
              { id: "ts-b-rolling-sub", label: "Rolling Offer Sub-Offer" },
              { id: "ts-b-triggered", label: "Triggered Popups" },
              { id: "ts-b-reward-calendar", label: "Reward Calendar" },
              { id: "ts-b-progress", label: "Progress Bar" },
            ],
          },
          {
            id: "ts-editor",
            label: "Block Editor",
            children: [
              { id: "ts-e-layout", label: "Layout presets" },
              { id: "ts-e-typography", label: "Typography" },
              { id: "ts-e-color", label: "Color & fill" },
              { id: "ts-e-assets", label: "Assets" },
              { id: "ts-e-spacing", label: "Spacing & dimensions" },
              { id: "ts-e-borders", label: "Borders & shadows" },
              { id: "ts-e-visibility", label: "Visibility & positioning" },
              { id: "ts-e-states", label: "Interactive states" },
            ],
          },
          { id: "ts-products", label: "Products & Offers" },
          { id: "ts-assets", label: "Asset Library" },
          {
            id: "ts-responsive",
            label: "Responsive Design",
            children: [
              { id: "ts-r-previews", label: "Desktop & mobile previews" },
              { id: "ts-r-device", label: "Device-specific settings" },
              { id: "ts-r-overrides", label: "Shared values & overrides" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "direct-checkout",
    label: "Direct Checkout",
    icon: IconCreditCard,
    children: [
      { id: "dc-configuration", label: "Configuration" },
      { id: "dc-builds-page", label: "Builds" },
      { id: "dc-payment-links", label: "Payment Links" },
    ],
  },
  {
    id: "project-analytics",
    label: "Analytics",
    icon: IconChartBar,
    children: [
      { id: "an-revenue", label: "Revenue" },
      { id: "an-engagement", label: "Engagement" },
      { id: "an-abtests", label: "A/B Tests" },
    ],
  },
  {
    id: "players",
    label: "Players",
    icon: IconUsersGroup,
    children: [
      { id: "pl-overview", label: "Player Overview" },
      { id: "pl-segments", label: "Segments" },
      { id: "pl-blocked", label: "Blocked Players" },
    ],
  },
  {
    id: "project-finance",
    label: "Finance",
    icon: IconCashBanknote,
    children: [
      { id: "fi-transactions", label: "Transactions" },
      { id: "fi-reports", label: "Reports" },
      { id: "fi-payment-methods", label: "Payment Methods" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: IconPlugConnected,
    children: [
      { id: "in-api", label: "API & API" },
      { id: "in-webhooks", label: "Webhooks & Events" },
      { id: "in-auth", label: "Authentication" },
      { id: "in-domains", label: "Domains" },
    ],
  },
  {
    id: "project-settings",
    label: "Project Settings",
    icon: IconSettings,
    children: [
      { id: "ps-general", label: "General" },
      { id: "ps-members", label: "Members & Roles" },
      { id: "ps-localization", label: "Localization" },
    ],
  },
  {
    id: "environments",
    label: "Environments",
    icon: IconServer,
    children: [
      { id: "env-production", label: "Production" },
      { id: "env-sandbox", label: "Sandbox" },
    ],
  },
];

/** Second project group from the spec: Configuration & Integrations. */
export const PROJECT_CONFIG_NAV: NavItem[] = [
  { id: "cfg-papi", label: "pAPI mappings", icon: IconPlugConnected },
  { id: "cfg-validation", label: "Configuration validation", icon: IconListDetails },
  { id: "cfg-missing", label: "Missing or unverified fields", icon: IconAlertTriangle },
  { id: "cfg-publish", label: "Publish & deployment status", icon: IconRocket },
];

/** Every section id in the full project IA — used for label + route resolution. */
export const PROJECT_TREE_NODES: NavNode[] = [...PROJECT_NAV_TREE, ...PROJECT_CONFIG_NAV];
export const COMPANY_TREE_NODES: NavNode[] = [...COMPANY_NAV_TREE];

/** Flatten a nav tree to its leaves + group labels (for section lookups). */
export function flattenNodes(node: NavNode): { id: string; label: string }[] {
  const self = [{ id: node.id, label: node.label }];
  if (!node.children) return self;
  return [self[0], ...node.children.flatMap(flattenNodes)];
}

const COMPANY_NAV_FULL: NavItem[] = [
  { id: "studios", label: "Studios", icon: IconBuilding },
  { id: "games", label: "Games", icon: IconDeviceGamepad2 },
  { id: "projects", label: "Projects", icon: IconFolders },
  { id: "members", label: "Members", icon: IconUsersGroup },
  { id: "analytics", label: "Analytics", icon: IconChartBar },
  { id: "finance", label: "Finance", icon: IconCashBanknote },
  { id: "administration", label: "Administration", icon: IconSettings },
];
// Wooga has no studio layer, so the company sidebar drops "Studios".
const COMPANY_NAV_NO_STUDIO: NavItem[] = COMPANY_NAV_FULL.filter((n) => n.id !== "studios");

/* ------------------------------ product groups ---------------------------- */

const WEBSTORE_ITEMS: NavItem[] = [
  { id: "ws-studio", label: "Studio", icon: IconPalette, tag: "New" },
  { id: "ws-products", label: "Products", icon: IconShoppingBag },
  { id: "ws-badges", label: "Badges", icon: IconRosette },
  {
    id: "ws-offers",
    label: "Offers",
    icon: IconSparkles,
    children: [
      { id: "ws-offers-promotions", label: "Promotions" },
      { id: "ws-offers-triggered", label: "Triggered Popups" },
      { id: "ws-offers-rolling", label: "Rolling" },
      { id: "ws-offers-1many", label: "1+Many" },
      { id: "ws-offers-checkout-links", label: "Checkout Links" },
      { id: "ws-offers-banners", label: "Banners" },
      { id: "ws-offers-daily-bonus", label: "Daily Bonus" },
      { id: "ws-offers-reward-calendar", label: "Reward Calendar" },
      { id: "ws-offers-progress-bar", label: "Progress Bar" },
    ],
  },
  {
    id: "ws-subscriptions",
    label: "Subscriptions",
    icon: IconRepeat,
    children: [
      { id: "ws-subs-plans", label: "Plans" },
      { id: "ws-subs-list", label: "Subscriptions List" },
      { id: "ws-subs-orders", label: "Orders" },
    ],
  },
  { id: "ws-coupons", label: "Coupons", icon: IconTicket },
  { id: "ws-blocked-players", label: "Blocked Players", icon: IconUserOff },
  { id: "ws-ab-tests", label: "A/B Tests", icon: IconTestPipe },
  {
    id: "ws-localization",
    label: "Localization",
    icon: IconLanguage,
    children: [
      {
        id: "ws-loc-pricing",
        label: "Pricing",
        children: [
          { id: "ws-loc-price-points", label: "Price Points" },
          { id: "ws-loc-pricing-rules", label: "Pricing Rules" },
        ],
      },
    ],
  },
  { id: "ws-articles", label: "Articles", icon: IconArticle },
  { id: "ws-trigger-conditions", label: "Trigger-Conditions", icon: IconBolt, soon: true },
];

const WEBSTORE: ProductGroup = { id: "webstore", label: "Webstore", items: WEBSTORE_ITEMS };

const DIRECT_CHECKOUT: ProductGroup = {
  id: "directCheckout",
  label: "Direct Checkout",
  items: [
    { id: "dc-config", label: "Configuration", icon: IconSettings },
    { id: "dc-builds", label: "Builds", icon: IconHammer },
  ],
};

// Wooga keeps extra features INSIDE the Webstore group rather than as products.
const WOOGA_WEBSTORE: ProductGroup = {
  id: "webstore",
  label: "Webstore",
  items: [
    ...WEBSTORE_ITEMS,
    { id: "ws-template-studio", label: "Template Studio", icon: IconTemplate },
    { id: "ws-rolling", label: "Rolling", icon: IconRotateClockwise2, badge: 3 },
  ],
};

/* ------------- folder hierarchy (from "Nested project hierarchy 0.1") ------ */
/* A folder tree replaces the fixed Company › Studio › Game › Project levels.
 * Company is the permanent root; up to 4 folder levels sit under it; projects
 * sit at the root or inside any folder. Tree helpers and edits: lib/folders.ts. */

export type ProjectStatus = "Live" | "Soft launch" | "In dev";
export type FolderNode = { kind: "folder"; id: string; name: string; children: TreeNode[] };
/** A project in the tree, by project id. `label` overrides its display name. */
export type ProjectLeaf = { kind: "project"; id: string; label?: string };
export type TreeNode = FolderNode | ProjectLeaf;

export const MAX_FOLDER_DEPTH = 4;
/** The Company root's id in routes and in the selector. */
export const ROOT_FOLDER_ID = "root";

const folder = (id: string, name: string, children: TreeNode[] = []): FolderNode => ({ kind: "folder", id, name, children });
const leaf = (id: string, label?: string): ProjectLeaf => ({ kind: "project", id, label });

/** Folder view (Company or any folder): cross-project tabs only, rolled up over
 *  every accessible project in the subtree (Foldering PRD, Sidebar Tabs per View). */
export const FOLDER_NAV: NavItem[] = [
  { id: "home", label: "Overview", icon: IconHome2 },
  { id: "orders", label: "Orders", icon: IconReceipt2 },
  { id: "analytics", label: "Analytics", icon: IconChartBar },
  {
    id: "players",
    label: "Players",
    icon: IconUserOff,
    children: [
      { id: "pl-blocked", label: "Blocked Players" },
      { id: "pl-email-lists", label: "Email Lists" },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    icon: IconCode,
    // Across child projects.
    children: [{ id: "dev-logs", label: "Activity Logs & Errors" }],
  },
  {
    id: "finance",
    label: "Finance",
    icon: IconCashBanknote,
    // Financial and Payouts, across child projects.
    children: [{ id: "fin-reports", label: "Reports" }],
  },
  {
    id: "administration",
    label: "Administration",
    icon: IconSettings,
    children: [
      { id: "users-access", label: "Users & Access" },
      { id: "projects-sync", label: "Projects Sync" },
      { id: "recently-deleted", label: "Recently deleted" },
    ],
  },
];

/** Project view: the full set of tabs. A category with children has a menu of
 *  its own — selecting it replaces the sidebar (contextual drill-in). Entries
 *  tagged with `modules` show only when the project has that module
 *  (Module Management PRD, Story 2); use `projectNav(modules)` for the sidebar. */
const WS: ModuleId[] = ["webstore"];
/** Module sections (Studio, LiveOps, Content, Localization) show only for modules enabled in the project. */
const ANY_MODULE: ModuleId[] = ["webstore", "payment-links", "direct-checkout"];
export const PROJECT_NAV: NavItem[] = [
  { id: "home", label: "Overview", icon: IconHome2 },
  { id: "orders", label: "Orders", icon: IconReceipt2 },
  { id: "analytics", label: "Analytics", icon: IconChartBar },
  {
    id: "studio",
    label: "Studio",
    icon: IconPalette,
    modules: ANY_MODULE,
    // One generic checkout, plus a customization entry per added module.
    children: [
      { id: "studio-store-design", label: "Store design", modules: WS },
      { id: "studio-checkout", label: "Generic checkout" },
      { id: "studio-checkout-webstore", label: "Checkout · Webstore", modules: WS },
      { id: "studio-checkout-payment-links", label: "Checkout · Payment Links", modules: ["payment-links"] },
      { id: "studio-checkout-direct-checkout", label: "Checkout · Direct Checkout", modules: ["direct-checkout"] },
    ],
  },
  {
    id: "liveops",
    label: "LiveOps",
    icon: IconSparkles,
    modules: ANY_MODULE,
    children: [
      { id: "lo-products", label: "Products" },
      { id: "lo-offers", label: "Offers", modules: WS },
      { id: "lo-engagement", label: "Engagement", modules: WS },
      { id: "lo-subscriptions", label: "Subscriptions" },
      { id: "lo-coupons", label: "Coupons" },
      { id: "lo-ab-tests", label: "A/B Tests", modules: WS },
      { id: "lo-trigger-conditions", label: "Trigger-Conditions", modules: WS },
    ],
  },
  { id: "content", label: "Content", icon: IconArticle, modules: WS },
  {
    id: "localization",
    label: "Localization",
    icon: IconLanguage,
    modules: ANY_MODULE,
    children: [
      { id: "l10n-translations", label: "Translations" },
      { id: "l10n-pricing", label: "Pricing" },
    ],
  },
  {
    id: "players",
    label: "Players",
    icon: IconUserOff,
    children: [
      { id: "pl-blocked", label: "Blocked Players" },
      { id: "pl-email-lists", label: "Email Lists" },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    icon: IconCode,
    children: [
      { id: "dev-api", label: "API & Integrations" },
      { id: "dev-auth", label: "Authentication Methods", modules: WS },
      { id: "dev-domains", label: "Domain Management" },
      { id: "dev-events", label: "Event Center" },
      { id: "dev-logs", label: "Activity Logs & Errors" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: IconCashBanknote,
    children: [
      { id: "fin-reports", label: "Reports" },
      { id: "fin-payment-methods", label: "Payment Methods" },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    icon: IconSettings,
    children: [
      { id: "adm-general", label: "General" },
      { id: "users-access", label: "Users & Access" },
      { id: "adm-environments", label: "Environments" },
      { id: "adm-modules", label: "Module management" },
      { id: "projects-sync", label: "Projects Sync" },
      { id: "adm-apps", label: "Apps" },
    ],
  },
];

const hasAny = (mods: ModuleId[] | undefined, active: ModuleId[]) => !mods || mods.some((m) => active.includes(m));

/** The project tabs for a set of modules: a tab shows if any added module uses it. */
export function projectNav(modules: ModuleId[]): NavItem[] {
  return PROJECT_NAV.filter((c) => hasAny(c.modules, modules)).map((c) =>
    c.children ? { ...c, children: c.children.filter((s) => hasAny(s.modules, modules)) } : c,
  );
}

/** The modules a project holds (explicit, or read off its product groups). */
export function baseModules(project: Project): ModuleId[] {
  if (project.modules) return project.modules;
  const ids = project.productGroups.map((g) => g.id);
  return [
    ...(ids.includes("webstore") ? (["webstore"] as ModuleId[]) : []),
    ...(ids.includes("directCheckout") ? (["direct-checkout"] as ModuleId[]) : []),
  ];
}

/** The drill-in category whose own menu holds `sectionId`, if any. */
export function drillCategoryFor(sectionId: string, nav: NavItem[] = PROJECT_NAV): NavItem | undefined {
  return nav.find((c) => c.children?.some((s) => s.id === sectionId));
}

/** Where selecting a drill-in category lands: its first available section. */
export function categoryLanding(category: NavItem): string {
  return category.children?.find((s) => !s.soon)?.id ?? category.id;
}

export const FOLDER_SECTION_IDS = FOLDER_NAV.flatMap(flattenNodes).map((n) => n.id);
export const PROJECT_SECTION_IDS = PROJECT_NAV.flatMap(flattenNodes).map((n) => n.id);

/* --------------------------------- clients -------------------------------- */

const PRODUCTION: Environment = { id: "production", name: "Production", kind: "production", color: "#16a34a" };
const DEFAULT_SANDBOX: Environment = { id: "sandbox", name: "Sandbox", kind: "sandbox", color: "#2563eb" };

const PRODUCT_MADNESS: ClientConfig = {
  id: "product-madness",
  company: { name: "King", plan: "Microsoft Gaming", initials: "K" },
  hasStudioLayer: true,
  environments: [PRODUCTION, DEFAULT_SANDBOX],
  companyNav: COMPANY_NAV_FULL,
  defaultProjectId: "bfc-main",
  recentProjectIds: ["bfc-main", "hov-store"],
  projects: [
    // Studio: Evergreen
    { id: "hov-store", studio: "Evergreen", game: "Heart of Vegas", gameInitials: "HV", gameIcon: "/games/heart-of-vegas.jpg", project: "HOV Store", productGroups: [WEBSTORE], productionStoreUrl: "https://heart-of-vegas.store.appcharge.com/", status: "Live" },
    { id: "ll-store", studio: "Evergreen", game: "Lightning Link", gameInitials: "LL", gameIcon: "/games/lightning-link.jpg", project: "LL Store", productGroups: [WEBSTORE], productionStoreUrl: "https://lightning-link.store.appcharge.com/", status: "Live" },
    { id: "cashman-store", studio: "Evergreen", game: "Cashman Casino", gameInitials: "CC", gameIcon: "/games/cashman-casino.jpg", project: "Cashman Store", productGroups: [WEBSTORE], productionStoreUrl: "https://cashman-casino.store.appcharge.com/", status: "Live" },
    { id: "mf-store", studio: "Evergreen", game: "Mighty Fu Casino", gameInitials: "MF", gameIcon: "/games/mighty-fu-casino.jpg", project: "MF Store", productGroups: [WEBSTORE], productionStoreUrl: "https://mighty-fu-casino.store.appcharge.com/", status: "Soft launch" },
    // Studio: Big Fish
    { id: "bfc-main", studio: "Big Fish", game: "Big Fish Casino", gameInitials: "BF", gameIcon: "/games/big-fish-casino.jpg", project: "BFC Main", productGroups: [WEBSTORE, DIRECT_CHECKOUT], productionStoreUrl: "https://shop.bigfishcasino.com/", status: "Live" },
    { id: "jms-store", studio: "Big Fish", game: "Jackpot Magic Slots", gameInitials: "JM", gameIcon: "/games/jackpot-magic-slots.jpg", project: "JMS Store", productGroups: [WEBSTORE], productionStoreUrl: "https://jackpot-magic-slots.store.appcharge.com/", status: "In dev" },
    // The prepared project Create project models every new one on (not in the tree; like the first-time company's).
    { id: "pm-new-store", game: "New game", gameInitials: "NG", project: "New Store", productGroups: [WEBSTORE], modules: ["webstore"], productionStoreUrl: "https://new-game.store.appcharge.com/", pending: true, pendingIn: ROOT_FOLDER_ID },
  ],
  // Company → Studio folder → Game folder → Project (each game holds one project).
  tree: [
    folder("pm-evergreen", "Evergreen", [
      folder("pm-hov", "Heart of Vegas", [leaf("hov-store")]),
      folder("pm-ll", "Lightning Link", [leaf("ll-store")]),
      folder("pm-cashman", "Cashman Casino", [leaf("cashman-store")]),
      folder("pm-mf", "Mighty Fu Casino", [leaf("mf-store")]),
    ]),
    folder("pm-big-fish", "Big Fish", [
      folder("pm-bfc", "Big Fish Casino", [leaf("bfc-main", "BFC Main")]),
      folder("pm-jms", "Jackpot Magic Slots", [leaf("jms-store")]),
    ]),
  ],
};

const WOOGA: ClientConfig = {
  id: "wooga",
  company: { name: "Wooga", plan: "Playtika", initials: "WO" },
  hasStudioLayer: false,
  environments: [PRODUCTION], // Production only — no sandbox.
  companyNav: COMPANY_NAV_NO_STUDIO,
  defaultProjectId: "june-webstore",
  recentProjectIds: ["june-webstore"],
  projects: [
    { id: "june-webstore", game: "June's Journey", gameInitials: "JJ", project: "Webstore", productGroups: [WOOGA_WEBSTORE], productionStoreUrl: "https://store.junesjourney.com/", status: "Live" },
    // Undocumented project — renders a graceful empty state, never an error.
    { id: "dice-dreams", game: "Dice Dreams", gameInitials: "DD", project: "Webstore", productGroups: [], undocumented: true, status: "In dev" },
  ],
  // No folders yet: projects sit directly under Company, which the model allows.
  tree: [leaf("june-webstore"), leaf("dice-dreams")],
};

// Tripledot — a design partner reachable via review-as-client (not the main
// switcher). Collapsed model (Company › Game › Project), like Wooga. Models the
// field note: all of Zenlife's projects sit together under one game, while the
// new GameHub is a separate game "way off from the rest."
const TRIPLE_DOT: ClientConfig = {
  id: "triple-dot",
  company: { name: "Tripledot Studios", plan: "Independent", initials: "TD" },
  hasStudioLayer: false,
  environments: [PRODUCTION, DEFAULT_SANDBOX],
  companyNav: COMPANY_NAV_NO_STUDIO,
  defaultProjectId: "zenlife-store",
  recentProjectIds: ["zenlife-store", "gamehub-store"],
  projects: [
    // Zenlife — all its projects live together under one game.
    { id: "zenlife-store", game: "Zenlife", gameInitials: "ZL", project: "Webstore", productGroups: [WEBSTORE], productionStoreUrl: "https://zenlife.store.appcharge.com/", status: "Live" },
    { id: "zenlife-checkout", game: "Zenlife", gameInitials: "ZL", project: "Direct Checkout", productGroups: [DIRECT_CHECKOUT], productionStoreUrl: "https://zenlife.store.appcharge.com/", status: "Soft launch" },
    // GameHub — the new project that sits "way off separate from the rest."
    { id: "gamehub-store", game: "GameHub", gameInitials: "GH", project: "Webstore", productGroups: [WEBSTORE], productionStoreUrl: "https://gamehub.store.appcharge.com/", status: "In dev" },
  ],
  // Zenlife's projects share a folder; GameHub sits on its own at the root.
  tree: [folder("td-zenlife", "Zenlife", [leaf("zenlife-store", "Webstore"), leaf("zenlife-checkout", "Direct Checkout")]), leaf("gamehub-store")],
};

// Generic structure — no client. Every level is named with a Foldering PRD
// glossary term, so a review reads the shape of the hierarchy rather than
// anyone's data: Company (permanent root) › Folder › Sub-folder (folders go up
// to 4 levels) › Project (one or more Modules; Production and 1–5 sandboxes).
// Studio and Game aren't glossary terms, so they're gone.
const GENERIC: ClientConfig = {
  id: "generic",
  company: { name: "Company", plan: "Generic", initials: "CO" },
  hasStudioLayer: false,
  environments: [
    PRODUCTION,
    { id: "sandbox-1", name: "Sandbox 1", kind: "sandbox", color: "#2563eb" },
    { id: "sandbox-2", name: "Sandbox 2", kind: "sandbox", color: "#d97706" },
  ],
  companyNav: COMPANY_NAV_NO_STUDIO,
  defaultProjectId: "generic-project",
  recentProjectIds: ["generic-project"],
  projects: [
    // Two modules, so the selector shows the PRD's "first badge + count" form.
    { id: "generic-project", game: "Project", gameInitials: "PR", project: "Project", productGroups: [WEBSTORE, DIRECT_CHECKOUT], modules: ["webstore", "direct-checkout"], status: "Live" },
  ],
  tree: [folder("generic-folder", "Folder", [folder("generic-sub-folder", "Sub-folder", [leaf("generic-project", "Project")])])],
};

// Acme Games — the PRD walkthrough company. Its tree is the Foldering PRD's
// example (Casual Games › Puzzle Studio › Puzzle Store / Puzzle Checkout;
// Strategy Games › Strategy Store), plus two projects still at the Company root
// (as every project is on release) and an empty Archive folder. Word Rush Store
// is the project the "Create project" flow creates.
const ACME_ENVS: Environment[] = [
  PRODUCTION,
  { id: "sandbox-1", name: "Sandbox 1", kind: "sandbox", color: "#2563eb" },
  { id: "sandbox-2", name: "Sandbox 2", kind: "sandbox", color: "#d97706" },
];
const ACME: ClientConfig = {
  id: "acme",
  company: { name: "Acme Games", plan: "PRD walkthrough", initials: "AG" },
  hasStudioLayer: false,
  environments: ACME_ENVS,
  companyNav: COMPANY_NAV_NO_STUDIO,
  defaultProjectId: "acme-puzzle-store",
  recentProjectIds: ["acme-puzzle-store"],
  projects: [
    { id: "acme-puzzle-store", game: "Puzzle Blast", gameInitials: "PB", project: "Puzzle Store", productGroups: [WEBSTORE], modules: ["webstore"], productionStoreUrl: "https://puzzle-blast.store.appcharge.com/", status: "Live" },
    { id: "acme-puzzle-checkout", game: "Puzzle Blast", gameInitials: "PB", project: "Puzzle Checkout", productGroups: [DIRECT_CHECKOUT], modules: ["direct-checkout"], status: "Live" },
    { id: "acme-strategy-store", game: "Empire Clash", gameInitials: "EC", project: "Strategy Store", productGroups: [WEBSTORE], modules: ["webstore"], productionStoreUrl: "https://empire-clash.store.appcharge.com/", status: "Live" },
    { id: "acme-bubble-store", game: "Bubble Pop", gameInitials: "BP", project: "Bubble Pop Store", productGroups: [WEBSTORE], modules: ["webstore", "payment-links"], status: "Soft launch" },
    { id: "acme-solitaire-store", game: "Solitaire Days", gameInitials: "SD", project: "Solitaire Store", productGroups: [WEBSTORE], modules: ["webstore"], status: "In dev" },
    { id: "acme-word-store", game: "Word Rush", gameInitials: "WR", project: "Word Rush Store", productGroups: [WEBSTORE], modules: ["webstore"], productionStoreUrl: "https://word-rush.store.appcharge.com/", pending: true, pendingIn: "acme-puzzle" },
  ],
  tree: [
    folder("acme-casual", "Casual Games", [
      folder("acme-puzzle", "Puzzle Studio", [leaf("acme-puzzle-store", "Puzzle Store"), leaf("acme-puzzle-checkout", "Puzzle Checkout")]),
    ]),
    folder("acme-strategy", "Strategy Games", [leaf("acme-strategy-store", "Strategy Store")]),
    folder("acme-archive", "Archive"),
    leaf("acme-bubble-store", "Bubble Pop Store"),
    leaf("acme-solitaire-store", "Solitaire Store"),
  ],
};

/* ───────── First-time fixtures (user flows, "First time" version) ─────────
 * A brand-new Acme Games: the company is set up, with no folders and no
 * projects. In the first-time Org structure flow the Admin builds the whole
 * tree, folders first and then a project inside each branch. One fixture per
 * build stage, so each step's URL opens on exactly its own tree (no state
 * carried over). The project a stage is about to create is its `pending` one.
 * Project ids are "ft-…" so they never resolve to the returning Acme. */
const FT_PUZZLE: Project = { id: "ft-puzzle-store", game: "Puzzle Blast", gameInitials: "PB", project: "Puzzle Blast Store", productGroups: [WEBSTORE], modules: ["webstore"], productionStoreUrl: "https://puzzle-blast.store.appcharge.com/" };
const FT_STRATEGY: Project = { id: "ft-strategy-store", game: "Empire Clash", gameInitials: "EC", project: "Empire Clash Store", productGroups: [WEBSTORE], modules: ["webstore"], productionStoreUrl: "https://empire-clash.store.appcharge.com/" };
const pendingIn = (p: Project, folderId: string): Project => ({ ...p, pending: true, pendingIn: folderId });
const ftClient = (id: ClientId, projects: Project[], tree: TreeNode[]): ClientConfig => ({
  ...ACME,
  id,
  fixture: true,
  projects,
  defaultProjectId: projects[0]?.id ?? "",
  recentProjectIds: [],
  tree,
});
const ftCasual = (children: TreeNode[] = []) => folder("ft-casual", "Casual Games", children);
const ftPuzzleStudio = (children: TreeNode[] = []) => folder("ft-puzzle", "Puzzle Studio", children);
const ftStrategy = (children: TreeNode[] = []) => folder("ft-strategy", "Strategy Games", children);
// Stages before the first project still carry it as pending (not in the
// tree): the dashboard always resolves one project, even on Company screens.
/** First sign-in: nothing below Company. */
const ACME_FT = ftClient("acme-ft", [pendingIn(FT_PUZZLE, "ft-puzzle")], []);
/** After the first folder (level 1). */
const ACME_FT_L1 = ftClient("acme-ft-l1", [pendingIn(FT_PUZZLE, "ft-puzzle")], [ftCasual()]);
/** After a second level-1 folder. */
const ACME_FT_L1B = ftClient("acme-ft-l1b", [pendingIn(FT_PUZZLE, "ft-puzzle")], [ftCasual(), ftStrategy()]);
/** After a level-2 sub-folder; Puzzle Blast Store is about to be created in it. */
const ACME_FT_L2 = ftClient("acme-ft-l2", [pendingIn(FT_PUZZLE, "ft-puzzle")], [ftCasual([ftPuzzleStudio()]), ftStrategy()]);
/** After the first project; Empire Clash Store is about to be created in Strategy Games. */
const ACME_FT_P1 = ftClient("acme-ft-p1", [FT_PUZZLE, pendingIn(FT_STRATEGY, "ft-strategy")], [
  ftCasual([ftPuzzleStudio([leaf(FT_PUZZLE.id, FT_PUZZLE.project)])]),
  ftStrategy(),
]);
/** The finished tree: two branches, a project in each. */
const ACME_FT_TREE = ftClient("acme-ft-tree", [FT_PUZZLE, FT_STRATEGY], [
  ftCasual([ftPuzzleStudio([leaf(FT_PUZZLE.id, FT_PUZZLE.project)])]),
  ftStrategy([leaf(FT_STRATEGY.id, FT_STRATEGY.project)]),
]);
/** A company with no projects at all; Word Rush Store is the one New project creates. */
const ACME_FT_EMPTY: ClientConfig = {
  ...ACME,
  id: "acme-ft-empty",
  // Usability test: the participant's company is King, brand new (no folders, no projects yet).
  company: { name: "King", plan: "Microsoft Gaming", initials: "K" },
  // A first-time company's projects have Production only; a sandbox exists once the participant creates one.
  environments: [PRODUCTION],
  fixture: true,
  projects: [{ id: "ft-word-store", game: "Word Rush", gameInitials: "WR", project: "Word Rush Store", productGroups: [WEBSTORE], modules: ["webstore"], productionStoreUrl: "https://word-rush.store.appcharge.com/", pending: true, pendingIn: ROOT_FOLDER_ID }],
  defaultProjectId: "ft-word-store",
  recentProjectIds: [],
  tree: [],
};

export const CLIENTS: Record<ClientId, ClientConfig> = {
  "product-madness": PRODUCT_MADNESS,
  wooga: WOOGA,
  "triple-dot": TRIPLE_DOT,
  generic: GENERIC,
  "acme-ft": ACME_FT,
  "acme-ft-l1": ACME_FT_L1,
  "acme-ft-l1b": ACME_FT_L1B,
  "acme-ft-l2": ACME_FT_L2,
  "acme-ft-p1": ACME_FT_P1,
  "acme-ft-tree": ACME_FT_TREE,
  "acme-ft-empty": ACME_FT_EMPTY,
  acme: ACME,
};

export const CLIENT_LIST: ClientConfig[] = [PRODUCT_MADNESS];

/** Every client — used by the review/presentation tool, which can impersonate
 *  any client even if the company switcher doesn't list it. Order matters for
 *  clientForProject: the finished first-time tree comes before its earlier
 *  stages, so its shared ft- projects open with their full path. */
export const ALL_CLIENTS: ClientConfig[] = [ACME, PRODUCT_MADNESS, WOOGA, TRIPLE_DOT, GENERIC, ACME_FT_TREE, ACME_FT_P1, ACME_FT_L2, ACME_FT_L1B, ACME_FT_L1, ACME_FT, ACME_FT_EMPTY];

/* -------------------------------- defaults -------------------------------- */

// The usability test starts on an empty dashboard: King has just joined, with no folders or projects yet
// ("acme-ft-empty"), on every load, reload and direct link. The full sample company (Evergreen and Big Fish studios,
// six projects, orders) is still there as "product-madness" (?client=product-madness).
export const DEFAULT_CLIENT_ID: ClientId = "acme-ft-empty";
export const DEFAULT_ENV_ID = "production";
export const DEFAULT_SECTION = "home";

/* --------------------------------- helpers -------------------------------- */

export function getClient(id: string | undefined | null): ClientConfig {
  return (id && CLIENTS[id as ClientId]) || CLIENTS[DEFAULT_CLIENT_ID];
}

/** Which client owns a given project id (project ids are unique across clients). */
export function clientForProject(projectId: string | undefined): ClientConfig {
  if (projectId) {
    // Search every client (not just the switcher's list) so a project reached by
    // reviewing-as a client still resolves to its real owner.
    for (const c of ALL_CLIENTS) {
      if (c.projects.some((p) => p.id === projectId)) return c;
    }
  }
  return CLIENTS[DEFAULT_CLIENT_ID];
}

export function getProject(client: ClientConfig, id: string | undefined): Project {
  return client.projects.find((p) => p.id === id) ?? client.projects[0];
}

export function getEnvironment(client: ClientConfig, id: string | undefined): Environment {
  return client.environments.find((e) => e.id === id) ?? client.environments[0];
}

export function projectSectionIds(project: Project): string[] {
  return [
    ...WORKSPACE_NAV.map((n) => n.id),
    ...project.productGroups.flatMap((g) => g.items.map((n) => n.id)),
    ...FINANCE_NAV.map((n) => n.id),
    ...PROJECT_ADMIN_TREES.flatMap(flattenNodes).map((n) => n.id),
    ...PROJECT_TREE_NODES.flatMap(flattenNodes).map((n) => n.id),
    ...PROJECT_SECTION_IDS,
  ];
}

/** How many projects a game has within a client. */
export function gameProjectCount(client: ClientConfig, game: string): number {
  return client.projects.filter((p) => p.game === game).length;
}

/** Collapse 1:1 game↔project naming: show just the game name when the game has a
 *  single project; show "Game · Project" only when a game has 2+ projects. */
export function projectDisplayLabel(client: ClientConfig, project: Project): string {
  return gameProjectCount(client, project.game) > 1 ? `${project.game} · ${project.project}` : project.game;
}

/** Colors assigned to user-created sandboxes, cycled in order. */
export const SANDBOX_PALETTE = ["#2563eb", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#4f46e5"];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function makeSandboxId(name: string): string {
  return `sb-${slugify(name) || "sandbox"}-${Math.random().toString(36).slice(2, 6)}`;
}

/** The storefront preview URL for an environment row: Production uses the
 *  project's live store; a sandbox uses its own URL, or a derived placeholder. */
export function environmentPreviewUrl(project: Project, env: Environment): string | undefined {
  if (env.kind === "production") return project.productionStoreUrl;
  return env.storeUrl ?? `https://${slugify(project.game)}-${slugify(env.name)}.appcharge.com/`;
}

export function sectionLabel(client: ClientConfig, id: string | undefined): string {
  const all: { id: string; label: string }[] = [
    // The folder-hierarchy navigation first, so its labels win.
    ...FOLDER_NAV.flatMap(flattenNodes),
    ...PROJECT_NAV.flatMap(flattenNodes),
    ...WORKSPACE_NAV,
    ...flattenNodes(FINANCE_TREE),
    ...PROJECT_ADMIN_TREES.flatMap(flattenNodes),
    ...client.companyNav,
    ...client.projects.flatMap((p) => p.productGroups.flatMap((g) => g.items.flatMap(flattenNodes))),
    ...PROJECT_TREE_NODES.flatMap(flattenNodes),
    ...COMPANY_TREE_NODES.flatMap(flattenNodes),
  ];
  return all.find((n) => n.id === id)?.label ?? "Overview";
}

/* --------------------------------- routes --------------------------------- */

export function projectHref(projectId: string, sectionId: string, envId: string): string {
  const query = envId && envId !== DEFAULT_ENV_ID ? `?env=${envId}` : "";
  return `/dashboard/${projectId}/${sectionId}${query}`;
}

/** A folder-scope page. Company (the root folder) is the bare route; any other
 *  folder adds `?folder=`. */
export function companyHref(clientId: ClientId, sectionId: string, folderId?: string): string {
  const params = new URLSearchParams();
  if (clientId !== DEFAULT_CLIENT_ID) params.set("client", clientId);
  if (folderId && folderId !== ROOT_FOLDER_ID) params.set("folder", folderId);
  const query = params.toString();
  return `/dashboard/company/${sectionId}${query ? `?${query}` : ""}`;
}

/** The dedicated settings area (two-pane, outside the main dashboard shell). */
export function settingsHref(sectionId: string, clientId?: ClientId): string {
  const query = clientId && clientId !== DEFAULT_CLIENT_ID ? `?client=${clientId}` : "";
  return `/dashboard/settings/${sectionId}${query}`;
}

/** The dedicated store area (two-pane, outside the main shell) — the product
 *  sections (Webstore, Direct Checkout, …) for a given project. */
export function storeHref(projectId: string, sectionId: string): string {
  return `/dashboard/store/${projectId}/${sectionId}`;
}

/** The first store section a project exposes (its entry point). */
export function firstStoreSection(project: Project): string | undefined {
  return project.productGroups[0]?.items[0]?.id;
}

/** The settings-area nav: Administration + Developer trees (collapsible). */
export const SETTINGS_TREES: NavNode[] = PROJECT_ADMIN_TREES;
