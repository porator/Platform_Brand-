"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FloatingAIPrompt } from "@/components/dashboard/floating-ai-prompt";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconAlertTriangle,
  IconStarFilled,
  IconLockFilled,
  IconGiftFilled,
  IconDiamondFilled,
  IconCrownFilled,
  IconCoinFilled,
  IconArrowRight,
  IconBrandAppleFilled,
  IconBuildingStore,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleFilled,
  IconCopy,
  IconCreditCard,
  IconDeviceMobile,
  IconDots,
  IconExternalLink,
  IconFolderPlus,
  IconLink,
  IconInfoCircle,
  IconLoader2,
  IconLock,
  IconMail,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconGift,
  IconLanguage,
  IconPalette,
  IconPuzzle,
  IconPlug,
  IconUsers,
  IconReceipt,
  IconChartBar,
  IconKey,
  IconWebhook,
  IconPlugConnected,
  IconUserX,
  IconRefresh,
  IconX,
  IconPencil,
  IconTrash,
  IconFolderFilled,
  IconFolderOpen,
} from "@/lib/icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/data/empty-state";
import { AppchargeLogo, CompanyLogo } from "@/components/dashboard/logo";
import { paletteFromFile, readableOnWhiteText, shade, useGamePalette, type GamePalette } from "@/lib/game-palette";
import { InviteRightPerson } from "@/components/usability/invite-right-person";

import { folderOptions, LOCATION_INDENT } from "@/components/dashboard/folder-selector";
import { useDemo, useFolderTree, useProjectModules } from "@/components/dashboard/providers";
import {
  baseModules,
  companyHref,
  DEFAULT_ENV_ID,
  getClient,
  MODULES,
  MODULE_IDS,
  MODULE_LABEL,
  projectHref,
  ROOT_FOLDER_ID,
  type ClientConfig,
  type FolderNode,
  type ModuleId,
  type Project,
  type StoreExperience,
  type StoreLayout,
  type StoreStructure,
  MAX_FOLDER_DEPTH,
} from "@/lib/newgen";
import {
  NAME_TAKEN,
  TOO_DEEP,
  effectiveAccess,
  findTrail,
  insertFolder,
  FOLDER_NAME_MAX,
  removeFolder,
  renameFolder,
  insertProject,
  removeProject,
  isFolderId,
  isProjectId,
  makeFolderId,
  nameTaken,
  nodeName,
  projectsIn,
  trailNames,
} from "@/lib/folders";

/* ───────── Game lookup (Story 1) ───────── */

type Game = { title: string; initials: string; genre?: string; description?: string; icon?: string; screenshots?: string[]; linked?: boolean; fromStore?: boolean };
const STORE_HOSTS = ["apps.apple.com", "play.google.com"];
const NAME_MAX = 60;

const initialsOf = (title: string) =>
  (title.match(/[A-Za-z0-9]+/g) ?? [title]).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || title.slice(0, 2).toUpperCase();

/** A first guess from the link itself, shown until the store page is read:
 *  "…/app/candy-crush-saga/id553834731" → Candy Crush Saga; "…?id=com.king.candycrushsaga" → Candycrushsaga. */
function titleFromStoreUrl(v: string): string {
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return "Your game";
  }
  const slug = url.host === "apps.apple.com" ? url.pathname.match(/\/app\/([^/]+)\/id\d+/)?.[1] : url.searchParams.get("id")?.split(".").at(-1);
  if (!slug) return "Your game";
  return decodeURIComponent(slug)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/** Store pages already read, by link, so going back and forth between steps never refetches. */
const storeCache = new Map<string, Game | null>();

/** Reads a store link's real title, icon, genre and description (app/api/store-lookup). Null if it can't. */
function useStoreGame(q: string): Game | null | undefined {
  const v = q.trim();
  const isStore = (() => {
    try {
      return STORE_HOSTS.includes(new URL(v).host);
    } catch {
      return false;
    }
  })();
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!isStore || storeCache.has(v)) return;
    let live = true;
    fetch(`/api/store-lookup?url=${encodeURIComponent(v)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((g: { title: string; genre?: string; description?: string; icon?: string; screenshots?: string[] } | null) => {
        storeCache.set(v, g ? { ...g, initials: initialsOf(g.title), fromStore: true } : null);
        if (live) rerender();
      })
      .catch(() => {
        storeCache.set(v, null);
        if (live) rerender();
      });
    return () => {
      live = false;
    };
  }, [v, isStore]);
  return isStore ? storeCache.get(v) : undefined;
}

/** What the one field resolves to: a store page, an existing company game, a new game — or an error. */
function resolveGame(client: ClientConfig, q: string): { game?: Game; error?: string } {
  const v = q.trim();
  if (!v) return {};
  if (/^https?:\/\//i.test(v) || v.includes("/")) {
    let host = "";
    try {
      host = new URL(v).host;
    } catch {
      host = "";
    }
    if (!STORE_HOSTS.includes(host)) return { error: "Enter an App Store or Google Play URL, or a game name" };
    if (v.includes("unreadable")) return { error: "We couldn’t read that store page. Type the game name instead." };
    // Until the store page is read (useStoreGame), the title is guessed from the link.
    const title = titleFromStoreUrl(v);
    return { game: { title, initials: initialsOf(title), genre: "Reading the store page…", fromStore: true } };
  }
  const existing = client.projects.find((p) => !p.pending && p.game.toLowerCase() === v.toLowerCase());
  if (existing) return { game: { title: existing.game, initials: existing.gameInitials, linked: true } };
  return { game: { title: v, initials: v.slice(0, 2).toUpperCase() } };
}

/** An App Store game a typed name may mean (app/api/store-lookup?all=1). */
type StoreMatch = { id: string; title: string; genre?: string; icon?: string; seller?: string; screenshots?: string[] };

/** App Store matches for typed game names, by name, so going back and forth between steps never searches again. */
const nameCache = new Map<string, StoreMatch[]>();
/** Typed names whose matches are only near ones (a typo): the list asks "Did you mean …?" (R15). */
const nearNames = new Set<string>();
export const isNearMatch = (q: string) => nearNames.has(q.trim().toLowerCase());

/** Edit distance, for "Did you mean …?" against the company's own games (R15). */
function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** A game the company already has that the typed name is a typo of ("Lightnig Link" → Lightning Link). */
function nearCompanyGame(client: ClientConfig, q: string): string | undefined {
  const v = q.trim().toLowerCase();
  if (v.length < 4 || /^https?:/.test(v)) return undefined;
  const games = [...new Set(client.projects.filter((p) => !p.pending).map((p) => p.game))];
  if (games.some((g) => g.toLowerCase() === v)) return undefined;
  const allowed = v.length >= 8 ? 2 : 1;
  return games.find((g) => editDistance(v, g.toLowerCase()) <= allowed);
}

/** A typed game name (not a link): up to three App Store games it may mean, for the user to pick one. Waits until
 *  typing pauses; undefined while searching, [] when nothing matches (the lookup only accepts titles containing
 *  every word typed). */
function useNameMatches(q: string, enabled: boolean): StoreMatch[] | undefined {
  const v = q.trim().toLowerCase();
  const on = enabled && v.length >= 3;
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!on || nameCache.has(v)) return;
    let live = true;
    const t = window.setTimeout(() => {
      fetch(`/api/store-lookup?name=${encodeURIComponent(v)}&all=1`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { results?: StoreMatch[]; near?: boolean } | null) => {
          if (d?.near) nearNames.add(v);
          nameCache.set(v, d?.results ?? []);
          if (live) rerender();
        })
        .catch(() => {
          nameCache.set(v, []);
          if (live) rerender();
        });
    }, 400);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [v, on]);
  return on ? nameCache.get(v) : [];
}

/** The "it isn't on the store" choice in the matches list. */
const NEW_GAME = "new";

/* ───────── Page ───────── */

/** "3": Set up your store (genre and layout). "4": Describe your store (the AI prompt, optional; off, see DESCRIBE_STEP). */
type Step = "1" | "clone" | "modules" | "2" | "3" | "4" | "done";

/** A short random suffix that keeps each created project's id unique. */
const idSuffix = () => Math.random().toString(36).slice(2, 6);

/** The store experiences: Blank (an empty store) or a genre's look. `layout` is the store design the preview draws. */
type Genre = Exclude<StoreExperience, "blank">;
const EXPERIENCES: Record<StoreExperience, { label: string; short: string; layout: string }> = {
  blank: { label: "Blank", short: "Start empty, or build it with the AI expert.", layout: "blank" },
  casino: { label: "Casino", short: "Slots, bingo and poker.", layout: "hero-grid" },
  casual: { label: "Casual", short: "Puzzle, word and match-3.", layout: "minimal" },
  midcore: { label: "Midcore", short: "Strategy, RPG and action.", layout: "arcade" },
  other: { label: "Other genres", short: "Sports, racing and more.", layout: "classic" },
};
/** The genres to explore from the genre card. New genres join this list (and EXPERIENCES). */
const GENRES: Genre[] = ["casino", "casual", "midcore", "other"];
const isExperience = (v: string | null | undefined): v is StoreExperience => !!v && v in EXPERIENCES;
/** The store layouts, one tile each, named Option 01–04 for now: three single-page arrangements (3 in a row, 1 in a
 *  row, gallery) and the multi-page Game portal. Option 01 is the recommended one. Every genre offers
 *  the same four for now, until the genre-to-layout mapping is done. */
const LAYOUTS: Record<StoreLayout, { label: string; best: string }> = {
  row3: { label: "Option 01", best: "Best for monetization" },
  row1: { label: "Option 02", best: "Best for monetization" },
  gallery: { label: "Option 03", best: "Best for monetization" },
  portal: { label: "Option 04", best: "Best for engagement" },
};
const LAYOUT_IDS = Object.keys(LAYOUTS) as StoreLayout[];
const RECOMMENDED_LAYOUT: StoreLayout = "row3";
const isLayout = (v: string | null | undefined): v is StoreLayout => !!v && v in LAYOUTS;
/** Multi-page is a layout (Game portal); the rest are one page. */
const structureOf = (l: StoreLayout): StoreStructure => (l === "portal" ? "multiple-pages" : "single-page");
/** The AI "Describe your store" step: off, so onboarding stays short and directed (its AI placement is revisited
 *  separately). Flip to bring the step back after Set up your store. */
const DESCRIBE_STEP = false;
/** The fallback store layout when there's no game to judge by. */
const RECOMMENDED = "hero-grid";

/**
 * The recommended store experience for this game, from its store page: its genre (casino → Casino, puzzle and word →
 * Casual, action and strategy → Midcore), else its art (bright → Casino, soft → Casual, dark → Midcore), else Casino.
 * `why` says it comes from the store link the participant added on the first step.
 */
function recommendExperience(game: Game, palette: GamePalette | null): { id: Genre; why: string } {
  // While the store page is still being read, the genre is a placeholder.
  const genre = game.genre?.includes("…") ? "" : (game.genre ?? "").toLowerCase();
  const byGenre: Genre | null = /casino|slot|card|bingo|poker/.test(genre)
    ? "casino"
    : /puzzle|word|casual|board|trivia|family/.test(genre)
      ? "casual"
      : /action|strateg|role|rpg|shoot|adventure|racing|sport/.test(genre)
        ? "midcore"
        : null;
  // No telling genre: the art decides.
  const byStyle: Genre | null = palette ? ({ dark: "midcore", soft: "casual", bright: "casino" } as const)[palette.style] : null;
  return { id: byGenre ?? byStyle ?? "casino", why: "Based on the store link you added for your game." };
}

/** The game's brand colours on the store: its main colour on the buttons (darkened when too light for white text). */
function brandSkin(colors?: string[]): Partial<StoreSkin> {
  const main = colors?.[0];
  if (!main) return {};
  const button = readableOnWhiteText(main);
  return { button, buttonEdge: shade(button, -0.3), ...(colors[1] ? { neon: colors[1] } : {}) };
}

type Tone = { chips: string[]; skin: Partial<StoreSkin> } | null;
/** What the AI picks up from the note, and how it changes the store's look (a stand-in for real theme variations). */
function toneFrom(text: string): Tone {
  const t = text.toLowerCase();
  if (!t.trim()) return null;
  const chips: string[] = [];
  const skin: Partial<StoreSkin> = {};
  if (/dark|night|noir|luxur|moody/.test(t)) {
    chips.push("Dark background");
    Object.assign(skin, { page: "#141018", bar: "rgba(0,0,0,0.6)", card: "#2a2233", cardText: "#ffffff", panel: "rgba(255,255,255,0.08)", railTile: "#2a2233", empty: "rgba(255,255,255,0.4)" });
  }
  if (/bright|playful|pastel|cute|fun/.test(t)) {
    chips.push("Bright, playful colours");
    Object.assign(skin, { page: "#fff4d6", bar: "rgba(255,255,255,0.85)", barText: "#5b3a12", card: "#ffe7a3", cardText: "#5b3a12" });
  }
  if (/gold|vip|premium|luxur/.test(t)) {
    chips.push("Gold accents");
    Object.assign(skin, { button: "#d4a017", buttonEdge: "#a77c0c" });
  }
  if (/neon|cyber|glow/.test(t)) {
    chips.push("Neon accents");
    Object.assign(skin, { button: "#d946ef", buttonEdge: "#a21caf", neon: "#e879f9" });
  }
  if (/halloween|spooky/.test(t)) {
    chips.push("Halloween theme");
    Object.assign(skin, { page: "#1a0f05", button: "#f97316", buttonEdge: "#c2410c" });
  }
  if (/christmas|holiday|winter|festive/.test(t)) {
    chips.push("Holiday theme");
    Object.assign(skin, { button: "#dc2626", buttonEdge: "#991b1b" });
  }
  return { chips: chips.length ? chips : ["Your notes"], skin };
}

/**
 * Each module's colours, from the Appcharge brand (the website, Figma "The Web"): a deep panel tone (navy, plum,
 * olive) behind the preview, the bright accent of the same family on the selected card and the progress bar, and a
 * light tint for the selected card's fill. Buttons stay the brand's charcoal pill. Like Figma's onboarding, the colours
 * follow the module.
 */
type Theme = { accent: string; tint: string; panel: string };
const THEMES: Record<ModuleId, Theme> = {
  webstore: { accent: "#338DE8", tint: "#EAF3FD", panel: "#24293E" },
  "payment-links": { accent: "#AA49EB", tint: "#F1E0FF", panel: "#34243E" },
  "direct-checkout": { accent: "#6CCD3F", tint: "#EEF9E8", panel: "#2C3E24" },
};
/** The brand's charcoal: buttons, titles. */
/** The dark buttons: a soft top-to-bottom gradient. */
const CHARCOAL = "linear-gradient(180deg, #272727 0%, #302F2F 100%)";
const MODULE_ICON: Record<ModuleId | "app-direct", typeof IconBuildingStore> = {
  webstore: IconBuildingStore,
  "payment-links": IconLink,
  "direct-checkout": IconCreditCard,
  "app-direct": IconDeviceMobile,
};

/**
 * Create a project (Project Lifecycle PRD, Stories 1–5), laid out like Figma's onboarding: one question at a time on
 * the left (big title, option cards, a progress bar, Continue), and on the right a tinted panel with a live preview of
 * what's being made. Which game → what to sell with (modules) → where it lives (folder + name) → store template
 * (Webstore only) → ready. Or clone → where it lives. Everything is prefilled, and the form lives in the URL, so every
 * step (and every error state) has an address.
 */
export function CreateProjectFlow({ modal }: { modal?: { initial: string; onClose: () => void } } = {}) {
  const urlParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  // Opened from the dashboard, the flow runs in a dialog over the page and keeps its answers here instead of the URL.
  const [local, setLocal] = React.useState(() => new URLSearchParams(modal?.initial ?? ""));
  const params = modal ? local : urlParams;
  const demo = useDemo();
  const client = getClient(params.get("client"));
  const { root, edit } = useFolderTree(client);

  const set = (next: Record<string, string | undefined>, mode: "push" | "replace" = "replace") => {
    const p = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    if (modal) setLocal(p);
    else router[mode](`${pathname}?${p}`, { scroll: false });
  };

  const step = (params.get("step") ?? "1") as Step;
  const from = params.get("from") ?? ROOT_FOLDER_ID;
  const exitHref = companyHref(client.id, "home", from);
  /** Leave without creating: close the dialog, or (full page) back to the dashboard. */
  const exit = () => (modal ? modal.onClose() : router.push(exitHref));
  const q = params.get("q") ?? "";
  const source = client.projects.find((p) => p.id === params.get("clone") && !p.pending);
  const store = useStoreGame(q);
  const guessed = resolveGame(client, q);
  // A store link: the store page's details once read; the guess from the link if it can't be read.
  const fromLink = guessed.game?.fromStore && store !== undefined ? { game: store ?? { ...guessed.game, genre: undefined } } : guessed;
  // A typed name lists the App Store games it may mean; the user picks one (or "not on the store"), and until then
  // there's no game to continue with. A picked game brings its store title, icon, screenshots and genre.
  const searchable = !!fromLink.game && !fromLink.game.fromStore && !fromLink.game.linked && !source;
  const matches = useNameMatches(q, searchable);
  const pick = params.get("pick");
  const picked = matches?.find((m) => m.id === pick);
  // R15: a typed name always needs a choice — a store game, or "It's not on the App Store" — even when nothing matches,
  // so a misspelling never quietly becomes a new game.
  const choosing = searchable && q.trim().length >= 3;
  const typed: { game?: Game; error?: string } = !choosing
    ? fromLink
    : picked
      ? { game: { title: picked.title, initials: initialsOf(picked.title), genre: picked.genre, icon: picked.icon, screenshots: picked.screenshots, fromStore: true } }
      : pick === NEW_GAME && matches
        ? fromLink
        : {};
  const lookup = source ? { game: { title: source.game, initials: source.gameInitials, icon: source.gameIcon, linked: true } as Game } : typed;
  // A game the company already has a project for links to it, so the new project is suggested into the same folder.
  const known = lookup.game && !source && !lookup.game.linked ? client.projects.find((p) => !p.pending && p.game.toLowerCase() === lookup.game!.title.toLowerCase()) : undefined;
  const game = known && lookup.game ? { ...lookup.game, title: known.game, icon: lookup.game.icon ?? known.gameIcon, linked: true } : lookup.game;
  /** The prepared project every new project is modelled on (modules, environments); it never enters the tree itself. */
  const target = client.projects.find((p) => p.pending);
  /** The project this run of the wizard made (on the Done step). */
  const createdList = (params.get("created") ?? "").split(",").flatMap((id) => client.projects.filter((p) => p.id === id));
  const created = createdList[0];

  // Modules: the source's for a clone, otherwise Webstore preselected.
  const modsParam = params.get("mods");
  const mods: ModuleId[] = modsParam !== null ? (modsParam.split(",").filter((m) => MODULE_IDS.includes(m as ModuleId)) as ModuleId[]) : source ? baseModules(source) : ["webstore"];
  const webstore = mods.includes("webstore");
  const cloneHasWebstore = !!source && baseModules(source).includes("webstore");
  const needsTemplate = webstore && !cloneHasWebstore;
  const starter = needsTemplate && params.get("starter") !== "0";
  // Template: the one picked, else the one recommended for this game. The AI note (ctx) tunes its look.
  // The game's look, read from its icon and first screenshot: brand colours and style (dark, bright, soft).
  const palette = useGamePalette(game?.icon, game?.screenshots?.[0]);
  const recommended = game ? recommendExperience(game, palette) : { id: "casino" as Genre, why: "" };
  // The store: two independent choices on one step. The experience starts on the one recommended for the game (a new
  // game resets it) and the structure on Single page; changing one never touches the other.
  const expParam = params.get("exp");
  const storeExperience: StoreExperience = isExperience(expParam) ? expParam : recommended.id;
  const genreParam = params.get("genre");
  /** The genre on the genre card: the experience when it's a genre, else the last genre picked (or the recommended). */
  const genre: Genre = storeExperience !== "blank" ? storeExperience : isExperience(genreParam) && genreParam !== "blank" ? genreParam : recommended.id;
  // The layout (an older link's structure=multiple-pages means the Game portal); it sets one page or several.
  const layoutParam = params.get("layout");
  const storeLayout: StoreLayout = isLayout(layoutParam) ? layoutParam : params.get("structure") === "multiple-pages" ? "portal" : "row3";
  const storeStructure: StoreStructure = structureOf(storeLayout);
  const tpl = EXPERIENCES[storeExperience].layout;
  const ctx = params.get("ctx") ?? "";
  const tone = needsTemplate ? toneFrom(ctx) : null;
  /** Folders created during this run of the wizard (they can be renamed or deleted on the folder step). */
  const madeFolders = (params.get("made") ?? "").split(",").filter(Boolean);
  // Colours read from uploaded photos of the current store win over the game art's.
  const uploadedColors = params.get("brand")?.split(",").filter((h) => /^[0-9a-f]{6}$/i.test(h)).map((h) => `#${h}`);
  const brandColorsNow = uploadedColors?.length ? uploadedColors : palette?.colors;

  // Destination: the suggested folder unless the Publisher picked one.
  const suggestion = game ? suggestFolder(client, root, game, from) : null;
  const folderId = params.get("folder") ?? suggestion?.id ?? from;
  const folderTrail = findTrail(root, isFolderId(folderId));
  const folder = folderTrail?.at(-1) as FolderNode | undefined;

  // Name: "[Game] Store" with Webstore, "[Game]" without, "[Source] (Copy)" for a clone; a number is added when taken.
  const baseName = source ? `${source.project} (Copy)` : game ? (webstore ? `${game.title} Store` : game.title) : "";
  // The project being created never clashes with itself (once created, it sits in the folder).
  const selfKey = created ? `p:${created.id}` : target ? `p:${target.id}` : undefined;
  const defaultName = folder ? uniqueName(client, folder, baseName.slice(0, NAME_MAX), selfKey) : baseName;
  const name = params.get("name") ?? defaultName;
  const nameError = !name.trim()
    ? "Enter a project name"
    : name.length > NAME_MAX
      ? `Use up to ${NAME_MAX} characters`
      : folder && nameTaken(client, folder.children, name, selfKey)
        ? NAME_TAKEN
        : null;

  const canCreate = !!game && !!folder && !nameError && mods.length > 0;

  /** Both store choices, checked: an unset value in `extra` (Skip) falls back to its default. */
  const storeConfig = (extra: Record<string, string | undefined>) => {
    const exp: StoreExperience = "exp" in extra && !isExperience(extra.exp) ? recommended.id : storeExperience;
    const layout: StoreLayout = "layout" in extra && !isLayout(extra.layout) ? "row3" : storeLayout;
    return { storeExperience: exp, storeLayout: layout, storeStructure: structureOf(layout), storeTemplate: EXPERIENCES[exp].layout };
  };
  const create = (extra: Record<string, string | undefined> = {}) => {
    if (!target) {
      toast(`${name} created`);
      set({ step: "done", ...extra }, "push");
      return;
    }
    // Usability test: every run makes a new project, modelled on the prepared one, so a participant can create as
    // many as they like. One project holds every module chosen (Module Management PRD); it carries the game they
    // typed or linked, and joins the company in memory, like the tree.
    const title = source ? source.game : game?.title ?? name.trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
    const made: Project[] = [
      {
        ...target,
        id: `ut-${slug}-${idSuffix()}`,
        pending: undefined,
        pendingIn: undefined,
        status: undefined,
        game: title,
        gameInitials: source ? source.gameInitials : game?.initials ?? initialsOf(title),
        // The game's store icon becomes the project's thumbnail (a clone keeps its source's).
        gameIcon: source ? source.gameIcon : game?.icon ?? client.projects.find((p) => p.gameIcon && p.game === title)?.gameIcon,
        project: name.trim(),
        modules: mods,
        productionStoreUrl: `https://${slug}.store.appcharge.com/`,
        // The store setup chosen here goes with the project: its experience and structure (for store generation),
        // the layout they make, sample content and the AI note. Skip takes the recommended experience on one page.
        ...(needsTemplate ? { ...storeConfig(extra), storeSample: starter, storeNotes: ctx.trim() || undefined, storeColors: brandColorsNow } : {}),
      },
    ];
    client.projects.push(...made);
    edit((t) => made.reduce((tree, p) => insertProject(tree, folderId, { kind: "project", id: p.id, label: p.project }), t));
    demo.set((s) => ({ ...s, createdModules: { ...s.createdModules, ...Object.fromEntries(made.map((p) => [p.id, p.modules!])) } }));
    set({ step: "done", created: made.map((p) => p.id).join(","), error: undefined, ...extra }, "push");
  };

  // Opened straight on the result (from the flow guide or Ask AI): create it with what's in the URL.
  React.useEffect(() => {
    if (step === "done" && !params.get("created") && target && canCreate) create();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /** The module whose colour and preview show on the modules step: the one last pointed at, else the first chosen. */
  // The preview follows what's selected: the module last switched on (else the last one still on). Pointing at a card
  // previews it only while the pointer (or keyboard focus) is on it, so it never sticks on a module that isn't chosen.
  const [lastOn, setLastOn] = React.useState<ModuleId | null>(null);
  /** The folder name being typed in "Create new folder": the preview shows it (with the project inside) as you type. */
  const [draftFolder, setDraftFolder] = React.useState("");
  /** The template under the pointer: previewed on the right before it's picked. */
  const [hoverTpl, setHoverTpl] = React.useState<string | null>(null);
  /** The layout under the pointer: previewed the same way. */
  const [hoverLayout, setHoverLayout] = React.useState<StoreLayout | null>(null);
  /** "I'm not the right person" (onboarding only): the invite dialog. */
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const modsRef = React.useRef(mods);
  // Only when the URL's selection actually changes: a re-render in between keeps the newer clicked value.
  const modsKey = mods.join(",");
  React.useEffect(() => {
    modsRef.current = modsKey ? (modsKey.split(",") as ModuleId[]) : [];
  }, [modsKey]);
  const shownMod = lastOn && mods.includes(lastOn) ? lastOn : mods.at(-1);
  const themeMod: ModuleId = (step === "modules" && shownMod) || mods[0] || "webstore";
  const theme = THEMES[themeMod];

  const isAdmin = params.get("denied") !== "1";
  if (!isAdmin) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <EmptyState
          icon={<IconLock className="size-5" />}
          title="Project creation is available to Admins"
          description="Ask an Admin on Company or on a folder to create the project, or to give you Admin there."
          primaryAction={
            <Button size="sm" nativeButton={false} render={<Link href={exitHref} />}>
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  // A later step opened without a game starts over at the first question.
  const view: Step = step === "1" || step === "clone" || step === "modules" || game ? step : "1";
  const storeSteps: Step[] = needsTemplate ? (DESCRIBE_STEP ? ["3", "4"] : ["3"]) : [];
  const steps: Step[] = view === "clone" || source ? ["clone", "2", ...storeSteps] : ["1", "modules", "2", ...storeSteps];
  const progress = view === "done" ? 1 : (Math.max(0, steps.indexOf(view)) + 1) / steps.length;

  const back = () => {
    if (view === "1") exit();
    else if (view === "clone") set({ step: undefined, clone: undefined, mods: undefined }, "push");
    else if (view === "modules") set({ step: undefined }, "push");
    else if (view === "2") set({ step: source ? "clone" : "modules", error: undefined }, "push");
    else if (view === "3") set({ step: "2" }, "push");
    else if (view === "4") set({ step: "3" }, "push");
    else if (view === "done") {
      // Back from "Your project is ready": the project just made is taken out again, so the last step can be changed
      // and created afresh (no duplicate, no "name taken").
      const ids = createdList.map((p) => p.id);
      for (const id of ids) {
        const i = client.projects.findIndex((p) => p.id === id);
        if (i >= 0) client.projects.splice(i, 1);
      }
      if (ids.length) {
        edit((t) => ids.reduce((tree, id) => removeProject(tree, id), t));
        demo.set((st) => ({ ...st, createdModules: Object.fromEntries(Object.entries(st.createdModules).filter(([k]) => !ids.includes(k))) }));
      }
      set({ step: needsTemplate ? (DESCRIBE_STEP ? "4" : "3") : "2", created: undefined }, "replace");
    }
  };

  /** The main button: its label, whether it can go, and where it goes. */
  const primary: { label: string; disabled: boolean; go: () => void } | null =
    view === "1"
      ? { label: "Continue", disabled: !game, go: () => set({ step: "modules" }, "push") }
      : view === "clone"
        ? { label: "Continue", disabled: !source, go: () => set({ step: "2" }, "push") }
        : view === "modules"
          ? { label: "Continue", disabled: !mods.length, go: () => set({ step: "2" }, "push") }
          : view === "2"
            ? needsTemplate
              ? { label: "Continue", disabled: !canCreate, go: () => set({ step: "3", error: undefined }, "push") }
              : { label: "Create project", disabled: !canCreate, go: () => create() }
            : view === "3"
              ? DESCRIBE_STEP
                ? { label: "Continue", disabled: !canCreate, go: () => set({ step: "4" }, "push") }
                : { label: "Create project", disabled: !canCreate, go: () => create() }
              : view === "4"
                ? { label: "Create project", disabled: !canCreate, go: () => create() }
                : null;

  const folderPath = folderTrail ? trailNames(client, folderTrail).join(" / ") : "";
  /** Back shows on every step but the dialog's first (where ✕ closes); on the full page, step 1's leaves for the dashboard. */
  const canGoBack = !modal || view !== "1";

  // Cloning needs a project to copy, so a first-time company (none in its tree yet) doesn't get the option.
  const hasProjects = projectsIn(client, root).length > 0;

  // Opened from onboarding: every step also offers "I’m not the right person" (no "I’ll do it later").
  const onboarding = params.get("onboarding") === "1";

  return (
    <div className={cn("font-brand grid bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", modal ? "relative h-full min-h-0 grid-rows-[minmax(0,1fr)]" : "min-h-svh")}>
      {/* The dialog's close, in its top-right corner (on the preview panel on wide screens). */}
      {modal ? (
        <button
          type="button"
          onClick={modal.onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:bg-white/10 lg:text-white/80 lg:hover:bg-white/20 lg:hover:text-white"
        >
          <IconX className="size-5" />
        </button>
      ) : null}
      <section className={cn("flex flex-col px-6 pt-5 pb-8 sm:px-12 lg:px-16", modal ? "h-full min-h-0" : "min-h-svh")}>
        {/* Top of the column: the step progress. Back is in the bottom bar, across from Continue. */}
        {primary ? (
          <div className="mt-3 h-1 w-full max-w-[34rem] overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full transition-[width,background-color] duration-500" style={{ width: `${progress * 100}%`, background: theme.accent }} />
          </div>
        ) : null}
        <div className="mt-3 flex h-10 items-center">
          <span className="flex-1" />
          {onboarding && view !== "done" ? (
            <button type="button" onClick={() => setInviteOpen(true)} className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
              I&apos;m not the right person
            </button>
          ) : null}
        </div>

        {/* In the dialog only this middle scrolls: the top bar and the progress + Continue row stay put. */}
        <div className={cn("flex flex-1 flex-col", modal ? "-mx-2 min-h-0 overflow-y-auto px-2 py-5" : "justify-center py-10")}>
          <div key={view} className={cn("w-full max-w-[34rem] animate-in fade-in-0 slide-in-from-bottom-1 duration-300", modal && "my-auto")}>
            {view === "1" ? (
              <StepFindGame q={q} lookup={lookup} matches={choosing ? matches : []} choosing={choosing} near={isNearMatch(q)} suggest={source ? undefined : nearCompanyGame(client, q)} pick={pick ?? undefined} onPick={(id) => set({ pick: id, name: undefined, folder: undefined, exp: undefined, genre: undefined })} onChange={(v) => set({ q: v || undefined, pick: undefined, name: undefined, folder: undefined, exp: undefined, genre: undefined })} onNext={() => game && set({ step: "modules" }, "push")} onClone={hasProjects ? () => set({ step: "clone" }, "push") : undefined} />
            ) : view === "clone" ? (
              <StepClone client={client} root={root} selected={source?.id} onPick={(id) => set({ clone: id, q: undefined, mods: undefined, name: undefined, folder: undefined })} />
            ) : view === "modules" ? (
              <StepModules
                mods={mods}
                onToggle={(m) => {
                  // Read and write the latest selection, so quick clicks in a row don't undo each other.
                  const cur = modsRef.current;
                  const next = cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m];
                  modsRef.current = next;
                  setLastOn(cur.includes(m) ? null : m);
                  // "none" keeps an empty selection empty (no mods param would mean the Webstore default).
                  set({ mods: next.join(",") || "none", name: undefined });
                }}
              />
            ) : view === "2" && game ? (
              <StepPlace
                client={client}
                root={root}
                source={source}
                folderId={folderId}
                suggestion={suggestion}
                name={name}
                nameError={nameError}
                error={params.get("error")}
                newFolderOpen={params.get("newfolder") === "1"}
                newFolder={draftFolder}
                setNewFolder={setDraftFolder}
                cloneEnv={params.get("env") ?? "production"}
                set={set}
                onCreateFolder={(n) => {
                  setDraftFolder("");
                  const f: FolderNode = { kind: "folder", id: makeFolderId(n), name: n.trim(), children: [] };
                  edit((t) => insertFolder(t, folderId, f));
                  // Folders made in this run can be renamed or deleted again right here ("made").
                  set({ folder: f.id, newfolder: undefined, made: [...madeFolders, f.id].join(",") });
                }}
                madeFolders={madeFolders}
                onRenameFolder={(id, n) => edit((t) => renameFolder(t, id, n))}
                onDeleteFolder={(id) => {
                  const trail = findTrail(root, isFolderId(id));
                  const f = trail?.at(-1) as FolderNode | undefined;
                  const parentId = (trail?.at(-2) ?? root).id;
                  if (!f) return;
                  edit((t) => removeFolder(t, id));
                  const left = madeFolders.filter((x) => x !== id);
                  // Deleting the folder that's picked moves the pick to its parent; deleting another keeps the pick.
                  set({ ...(folderId === id ? { folder: parentId } : {}), made: left.join(",") || undefined });
                  toast(`${f.name} deleted`, {
                    action: {
                      label: "Undo",
                      onClick: () => {
                        edit((t) => insertFolder(t, parentId, f));
                        set({ folder: f.id, made: [...left, f.id].join(",") });
                      },
                    },
                  });
                }}
              />
            ) : view === "3" && game ? (
              <StepTemplate
                experience={storeExperience}
                genre={genre}
                layout={storeLayout}
                recommended={recommended}
                theme={theme}
                set={set}
                onHover={setHoverTpl}
                onHoverLayout={setHoverLayout}
              />
            ) : view === "4" && game ? (
              <StepDescribe ctx={ctx} set={set} />
            ) : view === "done" && game ? (
              <StepDone
                client={client}
                name={name}
                folderPath={folderPath}
                webstore={webstore}
                starterFailed={params.get("error") === "starter"}
                target={created ?? target}
                projects={createdList}
                exitHref={exitHref}
              />
            ) : null}
          </div>
        </div>

        {primary || canGoBack ? (
          <div className={cn("flex shrink-0 items-center gap-3", modal && "pt-4")}>
            {/* Back, bottom-left (in the dialog, none on the first step, where ✕ closes). */}
            {canGoBack ? (
              <button
                type="button"
                onClick={back}
                aria-label={view === "1" ? "Back to Dashboard" : "Back"}
                className="-ml-2 flex size-11.5 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <IconChevronLeft className="size-5" />
              </button>
            ) : null}
            <span className="flex-1" />
            {/* No Skip or "I'll do it later": every step's choice is preselected, so the main button is the one way on. */}
            {primary ? (
              <button
                type="button"
                onClick={primary.go}
                disabled={primary.disabled}
                className="h-11.5 shrink-0 rounded-[200px] shadow-md px-7 text-[15px] font-medium whitespace-nowrap text-white transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
                style={{ background: CHARCOAL }}
              >
                {primary.label}
              </button>
            ) : null}
          </div>
        ) : null}
        {onboarding ? (
          <InviteRightPerson
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            company={client.company.name}
            onDone={(email) => {
              exit();
              toast(`Invite sent to ${email}`);
            }}
          />
        ) : null}
      </section>

      {/* The preview: a tinted panel (the current module's colour) with a window showing what's being made. */}
      <aside
        className={cn("hidden items-center justify-center p-10 transition-colors duration-500 lg:flex xl:p-16", modal ? "lg:h-full" : "lg:sticky lg:top-0 lg:h-svh")}
        style={{ background: theme.panel }}
      >
        <PreviewWindow
          label={view === "modules" ? MODULE_LABEL[themeMod] : view === "2" ? "Projects" : view === "3" || view === "4" ? "Webstore" : game?.title ?? "New project"}
          env={view !== "1" && view !== "clone"}
        >
          {view === "1" || view === "clone" ? (
            <GamePreview game={game} />
          ) : view === "modules" ? (
            <ModulePreview module={themeMod} game={game} />
          ) : view === "2" && game ? (
            <PlacePreview
              client={client}
              trail={(folderTrail ?? [root]) as FolderNode[]}
              draftFolder={params.get("newfolder") === "1" ? draftFolder.trim() : ""}
              game={game}
              name={name}
              mods={mods}
              theme={theme}
            />
          ) : (view === "3" || view === "4") && game ? (
            <StoreMock game={game} layout={hoverTpl ?? tpl} arrange={hoverLayout ?? storeLayout} starter={starter} tone={tone} brand={brandSkin(brandColorsNow)} />
          ) : view === "done" && game ? (
            webstore ? <StoreMock game={{ ...game, title: name }} layout={created?.storeTemplate ?? tpl} arrange={created?.storeLayout ?? storeLayout} starter={params.get("error") !== "starter" && starter} tone={tone} brand={brandSkin(created?.storeColors ?? brandColorsNow)} /> : <ModulePreview module={mods[0] ?? "payment-links"} game={game} />
          ) : (
            <GamePreview />
          )}
        </PreviewWindow>
      </aside>
    </div>
  );
}

/* ───────── Helpers ───────── */

function uniqueName(client: ClientConfig, folder: FolderNode, base: string, selfKey?: string): string {
  if (!nameTaken(client, folder.children, base, selfKey)) return base;
  for (let i = 2; ; i++) {
    const n = `${base} ${i}`.slice(-NAME_MAX);
    if (!nameTaken(client, folder.children, n, selfKey)) return n;
  }
}

/** Suggested folder (Story 3): where the game's other projects are; else a
 *  folder matching its genre; else the current folder. */
function suggestFolder(client: ClientConfig, root: FolderNode, game: Game, from: string): { id: string; reason?: string } {
  if (game.linked) {
    const counts = new Map<string, number>();
    for (const { project } of projectsIn(client, root)) {
      if (project.game !== game.title) continue;
      const parent = findTrail(root, isProjectId(project.id))?.at(-2);
      if (parent) counts.set(parent.id, (counts.get(parent.id) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (best) return { id: best[0], reason: `Where your other ${game.title} projects are` };
  }
  if (game.genre) {
    const words = game.genre.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    const hit = folderOptions(client, root).find((o) => o.id !== ROOT_FOLDER_ID && words.some((w) => o.path.toLowerCase().split(" / ").at(-1)!.includes(w)));
    if (hit) return { id: hit.id, reason: "Matches the game’s genre" };
  }
  return { id: from };
}

const field =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/20";

/** The question, Figma-style: large, on its own; an optional line under it. */
function StepTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-[36px] font-[450] leading-[1.08] tracking-[-0.035em] text-[#272727]">{title}</h1>
      {description ? <p className="mt-2 text-[15px] text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/** An option row, Figma-style: icon, title and one line, the whole row selectable; tinted with its colour when chosen. */
function OptionCard({
  icon,
  title,
  description,
  selected,
  theme,
  disabled,
  trailing,
  role = "radio",
  onClick,
  onFocus,
  onLeave,
  details,
  expanded = false,
  compact = false,
  dense = false,
}: {
  /** Tighter padding and no gap between title and line, for long lists. */
  compact?: boolean;
  /** Smaller still: a short row for pick lists (the game matches). */
  dense?: boolean;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** More about the option, shown when the card is hovered or focused (expanded). */
  details?: React.ReactNode;
  expanded?: boolean;
  selected: boolean;
  theme: Theme;
  disabled?: boolean;
  trailing?: React.ReactNode;
  role?: "radio" | "checkbox";
  onClick?: () => void;
  onFocus?: () => void;
  onLeave?: () => void;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onMouseLeave={onLeave}
      onBlur={onLeave}
      className={cn(
        "flex w-full items-start rounded-lg border text-left transition-[border-color,background-color] duration-200",
        dense ? "items-center gap-3 px-3 py-2" : compact ? "items-center gap-3.5 px-4 py-3" : "gap-4 px-5 py-4",
        "disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
        !selected && "border-border hover:border-foreground/25",
      )}
      style={selected ? { borderColor: theme.accent, background: theme.tint } : undefined}
    >
      {icon ? (
        <span className={cn("shrink-0", !compact && !dense && "mt-0.5")} style={{ color: selected ? theme.accent : undefined }}>
          {icon}
        </span>
      ) : null}
      <span className={cn("flex min-w-0 flex-1 flex-col", dense ? "gap-0" : compact ? "gap-0.5" : "gap-1")}>
        <span className={cn("font-medium text-foreground", dense ? "text-sm" : "text-[15px]")}>{title}</span>
        {description ? <span className={cn("text-muted-foreground", dense ? "text-[13px] leading-snug" : "text-sm leading-relaxed")}>{description}</span> : null}
        {details ? (
          // Opens smoothly to its natural height (grid rows 0fr → 1fr), so nothing jumps.
          <span
            aria-hidden={!expanded}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
              expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <span className="overflow-hidden">{details}</span>
          </span>
        ) : null}
      </span>
      {trailing}
    </button>
  );
}

function GameIcon({ game, className }: { game: Game; className?: string }) {
  if (game.icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={game.icon} alt="" className={cn("size-12 shrink-0 rounded-xl object-cover", className)} />;
  }
  return (
    <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground", className)}>
      {game.initials}
    </span>
  );
}

/* ───────── Which game is it for? (Story 1) ───────── */

function StepFindGame({
  q,
  lookup,
  matches,
  choosing = false,
  near = false,
  suggest,
  pick,
  onPick,
  onChange,
  onNext,
  onClone,
}: {
  q: string;
  lookup: { game?: Game; error?: string };
  /** App Store games the typed name may mean: undefined while searching, [] when there's nothing to choose. */
  matches?: StoreMatch[];
  /** A typed name that needs a choice (store game or new game). */
  choosing?: boolean;
  /** The matches are near ones (a typo). */
  near?: boolean;
  /** A company game the name looks like a typo of. */
  suggest?: string;
  pick?: string;
  onPick: (id: string) => void;
  onChange: (v: string) => void;
  onNext: () => void;
  /** Absent when the company has no project to clone yet (first-time user). */
  onClone?: () => void;
}) {
  const { game, error } = lookup;
  return (
    <>
      <StepTitle title="Which game is it for?" description="Type its name, or paste its App Store or Google Play link. We’ll fill in the details." />
      <label htmlFor="game" className="sr-only">
        Game name or store link
      </label>
      <input
        id="game"
        autoFocus
        value={q}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onNext()}
        placeholder="e.g. Word Rush, or https://play.google.com/store/apps/…"
        aria-invalid={!!error}
        className={cn(field, "h-12", error && "border-destructive")}
      />
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      {suggest ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Did you mean{" "}
          <button type="button" onClick={() => onChange(suggest)} className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
            {suggest}
          </button>
          ? It’s already in your company.
        </p>
      ) : null}

      {matches === undefined ? (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <IconLoader2 className="size-4 animate-spin" />
          Searching the App Store…
        </p>
      ) : matches.length || choosing ? (
        <div className="mt-5">
          <p id="game-matches" className="mb-2.5 text-sm text-muted-foreground">
            {!matches.length ? `No App Store game matches “${q.trim()}”. Check the spelling, or create it as a new game.` : near ? "Did you mean one of these?" : "Pick your game"}
          </p>
          <div role="radiogroup" aria-labelledby="game-matches" className="flex flex-col gap-1.5">
            {matches.map((m) => (
              <OptionCard
                key={m.id}
                dense
                selected={pick === m.id}
                theme={THEMES.webstore}
                onClick={() => onPick(m.id)}
                icon={<GameIcon game={{ title: m.title, initials: initialsOf(m.title), icon: m.icon }} className="size-8 rounded-md text-[10px]" />}
                title={<span className="block truncate">{m.title}</span>}
                description={<span className="block truncate">{[m.seller, m.genre].filter(Boolean).join(" · ")}</span>}
              />
            ))}
            <OptionCard
              dense
              selected={pick === NEW_GAME}
              theme={THEMES.webstore}
              onClick={() => onPick(NEW_GAME)}
              icon={
                <span className="flex size-8 items-center justify-center rounded-md border border-dashed border-foreground/20 text-muted-foreground">
                  <IconPlus className="size-4" />
                </span>
              }
              title="It’s not on the App Store"
              description={`Create “${q.trim()}” as a new game`}
            />
          </div>
        </div>
      ) : game ? (
        <div className="mt-4 flex items-center gap-3">
          <GameIcon game={game} className="size-10 rounded-lg" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium">{game.title}</p>
            <p className="truncate text-sm text-muted-foreground">
              {game.linked ? `Linked to your ${game.title} projects` : game.fromStore ? `Found on the store${game.genre ? ` · ${game.genre}` : ""}` : game.icon ? `Found on the App Store${game.genre ? ` · ${game.genre}` : ""}` : "A new game will be created"}
            </p>
          </div>
        </div>
      ) : null}

      {onClone ? (
        <button type="button" onClick={onClone} className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <IconCopy className="size-4" />
          Or clone an existing project
        </button>
      ) : null}
    </>
  );
}

/* ───────── Clone (Story 2) ───────── */

function StepClone({ client, root, selected, onPick }: { client: ClientConfig; root: FolderNode; selected?: string; onPick: (id: string) => void }) {
  const [query, setQuery] = React.useState("");
  // R16: the project already picked stays in the list while searching, so it never reads "No projects match".
  const items = projectsIn(client, root).filter(({ leaf, project }) => project.id === selected || nodeName(client, leaf).toLowerCase().includes(query.trim().toLowerCase()));
  const theme = THEMES.webstore;
  return (
    <>
      <StepTitle title="Which project do you want to clone?" description="Its products, offers, designs and settings are copied into a new project." />
      <label className={cn(field, "flex items-center gap-2")}>
        <IconSearch className="size-4 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="h-full flex-1 bg-transparent outline-none" />
      </label>
      <div role="radiogroup" aria-label="Project to clone" className="mt-4 flex max-h-[22rem] flex-col gap-3 overflow-y-auto pb-1">
        {items.length ? (
          items.map(({ leaf, project, path }) => (
            <OptionCard
              key={project.id}
              selected={selected === project.id}
              theme={theme}
              onClick={() => onPick(project.id)}
              icon={<GameIcon game={{ title: project.game, initials: project.gameInitials, icon: project.gameIcon }} className="size-9 rounded-lg text-[11px]" />}
              title={nodeName(client, leaf)}
              description={path.join(" / ")}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{query.trim() ? `No projects match “${query.trim()}”` : "There are no projects to clone yet."}</p>
        )}
      </div>
    </>
  );
}

/* ───────── What do you want to sell with? (Module Management PRD) ───────── */

/** What each module offers, shown when its card is hovered or focused. */
const MODULE_DETAILS: Record<ModuleId | "app-direct", string[]> = {
  webstore: [
    "Your own branded store site, built from your game’s art",
    "Offers, bundles and personalized pricing",
    "LiveOps: events, coupons and A/B tests",
    "Players sign in with their game account",
  ],
  "payment-links": [
    "A buy button in your game opens Appcharge’s checkout",
    "Apple Pay, Google Pay, cards, PayPal and local methods",
    "No store site to build or run",
    "Payments and taxes handled by Appcharge",
  ],
  "direct-checkout": [
    "Appcharge’s checkout inside the web store you already have",
    "Keep your own store’s design and catalog",
    "Apple Pay, Google Pay, cards, PayPal and local methods",
    "Payments and taxes handled by Appcharge",
  ],
  "app-direct": ["Appcharge payments for purchases made inside your app", "Not available yet: you’ll be able to add it later"],
};

function ModuleDetails({ items, accent }: { items: string[]; accent: string }) {
  return (
    <span className="block">
      <span className="block text-xs font-medium text-muted-foreground">What you get</span>
      <span className="mt-1.5 flex flex-col gap-1.5">
        {items.map((t) => (
          <span key={t} className="flex items-start gap-2 text-sm text-foreground">
            <IconCheck className="mt-0.5 size-3.5 shrink-0" stroke={2.5} style={{ color: accent }} aria-hidden />
            {t}
          </span>
        ))}
      </span>
    </span>
  );
}

/** One short line per module for this step (Module management keeps the longer descriptions). */
const MODULE_SHORT: Record<string, string> = {
  webstore: "Your own store with offers.",
  "payment-links": "Checkout links for in-game buys.",
  "direct-checkout": "Our checkout in your own store.",
  "app-direct": "In-app purchases.",
};

function StepModules({
  mods,
  onToggle,
  has = [],
  description = "Pick one or more ways to sell this game. Each one is added to Production and every sandbox. You can add more later.",
}: {
  mods: ModuleId[];
  onToggle: (m: ModuleId) => void;
  /** Add module: the modules the project already has, shown checked and locked ("Added"). */
  has?: ModuleId[];
  description?: string;
}) {
  return (
    <>
      {/* R3: a plainer question, and what adding a module means (every environment). */}
      <StepTitle title="How do you want to sell?" description={description} />
      <div className="flex flex-col gap-2">
        {MODULES.map((m) => {
          const id = m.id as ModuleId;
          const Icon = MODULE_ICON[m.id];
          const added = has.includes(id);
          const on = !m.soon && (added || mods.includes(id));
          const theme = m.soon ? THEMES.webstore : THEMES[id];
          const short = MODULE_SHORT[m.id] ?? m.description;
          const trailing = m.soon ? (
            <Badge variant="outline" className="shrink-0">
              Coming soon
            </Badge>
          ) : added ? (
            <Badge variant="secondary" className="shrink-0">
              Added
            </Badge>
          ) : (
            <span
              aria-hidden
              className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors", !on && "border-input")}
              style={on ? { background: theme.accent, borderColor: theme.accent } : undefined}
            >
              {on ? <IconCheck className="size-3.5 text-white" stroke={3} /> : null}
            </span>
          );
          return (
            // The card and an overlay share one grid cell. The overlay repeats the card's layout invisibly, so its
            // (i) button sits right after the title — a button can't go inside the card's own button.
            <div key={m.id} className="grid">
              <div className="[grid-area:1/1]">
                <OptionCard
                  role="checkbox"
                  selected={on}
                  theme={theme}
                  disabled={m.soon || added}
                  onClick={() => !added && onToggle(id)}
                  icon={<Icon className="size-5" stroke={1.6} />}
                  title={m.label}
                  description={short}
                  compact
                  trailing={trailing}
                />
              </div>
              <div className="pointer-events-none flex items-center gap-3.5 border border-transparent px-4 py-3 [grid-area:1/1]">
                <span className="size-5 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-[15px] font-medium">
                    <span className="invisible">{m.label}</span>
                    <ModuleInfo label={m.label} items={MODULE_DETAILS[m.id]} accent={theme.accent} />
                  </span>
                  <span className="invisible text-sm leading-relaxed">{short}</span>
                </span>
                <span className="invisible">{trailing}</span>
              </div>
            </div>
          );
        })}
      </div>
      {!mods.length ? <p className="mt-3 text-sm text-destructive">Choose at least one module</p> : null}
    </>
  );
}

/** The (i) next to a module's name: "What you get" in a popover that floats over the page (opens on hover or click). */
function ModuleInfo({ label, items, accent }: { label: string; items: string[]; accent: string }) {
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        closeDelay={100}
        aria-label={`What you get with ${label}`}
        className="pointer-events-auto flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[popup-open]:text-foreground"
      >
        <IconInfoCircle className="size-4" stroke={1.8} />
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={10} className="w-64 gap-0 p-4">
        <ModuleDetails items={items} accent={accent} />
      </PopoverContent>
    </Popover>
  );
}

/* ───────── Where should it live? (Foldering PRD, Story 6) ───────── */

const ERRORS: Record<string, string> = {
  name: NAME_TAKEN,
  folder: "The folder no longer exists",
  create: "We couldn’t create the project. Try again.",
};

function StepPlace({
  client,
  root,
  source,
  folderId,
  suggestion,
  name,
  nameError,
  error,
  newFolderOpen,
  newFolder,
  setNewFolder,
  cloneEnv,
  set,
  onCreateFolder,
  madeFolders,
  onRenameFolder,
  onDeleteFolder,
}: {
  client: ClientConfig;
  root: FolderNode;
  source?: Project;
  folderId: string;
  suggestion: { id: string; reason?: string } | null;
  name: string;
  nameError: string | null;
  error: string | null;
  newFolderOpen: boolean;
  newFolder: string;
  setNewFolder: (v: string) => void;
  cloneEnv: string;
  set: (next: Record<string, string | undefined>, mode?: "push" | "replace") => void;
  onCreateFolder: (name: string) => void;
  madeFolders: string[];
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}) {
  const options = folderOptions(client, root);
  // The chosen folder was just made here: it can be renamed or deleted again (deleted only while it's still empty).
  const pickedTrail = findTrail(root, isFolderId(folderId));
  const picked = pickedTrail?.at(-1) as FolderNode | undefined;
  const pickedParent = pickedTrail?.at(-2) as FolderNode | undefined;
  const justMade = !!picked && madeFolders.includes(folderId);
  const [renaming, setRenaming] = React.useState<string | null>(null);
  /** The Folder dropdown, controlled so its Rename can close it and open the rename box. */
  const [folderMenuOpen, setFolderMenuOpen] = React.useState(false);
  /** Stops a click on a row's Rename / Delete from also picking the row. */
  const keep = {
    onPointerDown: (e: React.SyntheticEvent) => e.stopPropagation(),
    onPointerUp: (e: React.SyntheticEvent) => e.stopPropagation(),
    onMouseDown: (e: React.SyntheticEvent) => e.stopPropagation(),
    onMouseUp: (e: React.SyntheticEvent) => e.stopPropagation(),
  };
  const renameError =
    renaming === null
      ? null
      : !renaming.trim()
        ? null
        : renaming.trim().length > FOLDER_NAME_MAX
          ? `Use up to ${FOLDER_NAME_MAX} characters`
          : pickedParent && nameTaken(client, pickedParent.children, renaming, `f:${folderId}`)
            ? NAME_TAKEN
            : null;
  const saveRename = () => {
    if (!renaming?.trim() || renameError) return;
    onRenameFolder(folderId, renaming.trim());
    setRenaming(null);
  };
  const parent = findTrail(root, isFolderId(folderId))?.at(-1) as FolderNode | undefined;
  // A folder that's already level 4 can't take another: say so as soon as the field opens.
  const newFolderTooDeep = (findTrail(root, isFolderId(folderId))?.length ?? 1) - 1 >= MAX_FOLDER_DEPTH;
  const newFolderError = newFolderTooDeep ? TOO_DEEP : newFolder.trim() && parent && nameTaken(client, parent.children, newFolder) ? NAME_TAKEN : null;
  const sourceTrail = source ? findTrail(root, isProjectId(source.id)) : null;
  const copiedUsers = sourceTrail ? effectiveAccess(client, sourceTrail).filter((a) => a.direct) : [];

  return (
    <>
      <StepTitle title="Where should it live?" description="Pick its folder and name it. You can move or rename it later." />

      {error && ERRORS[error] ? (
        <p role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" />
          {ERRORS[error]}
        </p>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="folder" className="text-sm font-medium">
            Folder
          </label>
          {/* The design system's Select (not the browser's native menu): the folder's path, the suggested one marked. */}
          <Select
            items={Object.fromEntries(options.map((o) => [o.id, o.path]))}
            value={folderId}
            onValueChange={(v) => v && set({ folder: String(v), name: undefined })}
            open={folderMenuOpen}
            onOpenChange={setFolderMenuOpen}
          >
            <SelectTrigger id="folder" className={cn(field, "h-11 justify-start gap-2.5 pr-3 pl-3.5 shadow-none data-[size=default]:h-11")}>
              {/* The company shows as its avatar, a folder as a folder. */}
              {folderId === ROOT_FOLDER_ID ? (
                <CompanyLogo clientId={client.id} className="size-5 rounded-[5px]" />
              ) : (
                <IconFolderFilled className="size-4 text-muted-foreground" aria-hidden />
              )}
              <SelectValue className="flex-1 text-left" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="min-w-(--anchor-width) p-1">
              {options.map((o) => (
                // One fixed height for every row, whether it has a badge or Rename / Delete or nothing.
                // The chosen folder: a light blue row, a blue open folder (a ring round the company's logo) and a medium-weight
                // name; no checkmark (same as New folder's Location list). Hover is a light grey tint.
                <SelectItem
                  key={o.id}
                  value={o.id}
                  title={o.path}
                  style={{ paddingLeft: 8 + o.depth * LOCATION_INDENT }}
                  className="h-9 py-0 pr-2 focus:bg-muted/40 [&>span:last-child]:hidden [&_.row-icon]:text-muted-foreground! [&_.row-open]:hidden data-[selected]:font-medium data-[selected]:[&_.row-closed]:hidden data-[selected]:[&_.row-open]:block data-[selected]:[&_.row-open]:text-info! data-[selected]:bg-info/10 data-[selected]:focus:bg-info/15 data-[selected]:[&_.row-logo]:ring-2 data-[selected]:[&_.row-logo]:ring-info data-[selected]:[&_.row-logo]:ring-offset-1"
                >
                  {/* Every row's icon sits centred in the same 20px slot. */}
                  <span className="flex size-5 shrink-0 items-center justify-center self-center">
                    {o.id === ROOT_FOLDER_ID ? (
                      <CompanyLogo clientId={client.id} className="row-logo size-5 rounded-[5px]" />
                    ) : (
                      <>
                        <IconFolderFilled className="row-icon row-closed size-4" aria-hidden />
                        <IconFolderOpen className="row-icon row-open size-4" aria-hidden />
                      </>
                    )}
                  </span>
                  {/* Nested under its parent, by its own name (the field above keeps the full path). */}
                  <span className="self-center truncate">{o.path.split(" / ").at(-1)}</span>
                  {/* A folder made in this run can be renamed or deleted right from the list (deleted only while empty). */}
                  {madeFolders.includes(o.id)
                    ? (() => {
                        const f = findTrail(root, isFolderId(o.id))?.at(-1) as FolderNode | undefined;
                        if (!f) return null;
                        const busy = f.children.length > 0;
                        return (
                          <span className="ml-auto flex items-center gap-0.5 self-center pl-2">
                            <button
                              type="button"
                              {...keep}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderMenuOpen(false);
                                if (folderId !== o.id) set({ folder: o.id, name: undefined });
                                setRenaming(f.name);
                              }}
                              aria-label={`Rename ${f.name}`}
                              title="Rename"
                              className="group/act flex size-6 items-center justify-center rounded-md transition-colors hover:bg-background"
                            >
                              <IconPencil className="size-4 text-muted-foreground/70! group-hover/act:text-foreground!" />
                            </button>
                            <button
                              type="button"
                              {...keep}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (busy) return;
                                setFolderMenuOpen(false);
                                onDeleteFolder(o.id);
                              }}
                              aria-label={`Delete ${f.name}`}
                              title={busy ? "Delete the folders inside it first" : "Delete"}
                              aria-disabled={busy}
                              className={cn(
                                "group/act flex size-6 items-center justify-center rounded-md transition-colors hover:bg-background",
                                busy && "cursor-not-allowed opacity-40",
                              )}
                            >
                              <IconTrash className={cn("size-4 text-muted-foreground/70!", !busy && "group-hover/act:text-destructive!")} />
                            </button>
                          </span>
                        );
                      })()
                    : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {folderId === suggestion?.id && suggestion.reason ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="info">Suggested</Badge>
                {suggestion.reason}
              </p>
            ) : (
              // No standing "Up to 4 nested levels" hint: the limit shows as an error when it's hit (New folder below).
              <span />
            )}
            <button type="button" onClick={() => set({ newfolder: newFolderOpen ? undefined : "1" })} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <IconFolderPlus className="size-4" />
              Create new folder
            </button>
          </div>
          {justMade && picked ? (
            renaming !== null ? (
              <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Rename folder</span>
                <div className="flex gap-2">
                  <input
                    value={renaming}
                    onChange={(e) => setRenaming(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename();
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    aria-label="Folder name"
                    className={cn(field, "h-10", renameError && "border-destructive")}
                    autoFocus
                  />
                  <Button className="h-10" variant="outline" onClick={() => setRenaming(null)}>
                    Cancel
                  </Button>
                  <Button className="h-10" disabled={!renaming.trim() || !!renameError} onClick={saveRename}>
                    Save
                  </Button>
                </div>
                {renameError ? <span className="text-xs text-destructive">{renameError}</span> : null}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <IconFolderPlus className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  You just created <span className="font-medium text-foreground">{picked.name}</span>
                </span>
                {/* Rename and Delete are in the Folder dropdown (pencil and bin on this folder's row). */}
              </div>
            )
          ) : null}
          {newFolderOpen ? (
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">New folder in {trailNames(client, findTrail(root, isFolderId(folderId)) ?? [root]).join(" / ")}</span>
              <div className="flex gap-2">
                <input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="Folder name" className={cn(field, "h-10", newFolderError && "border-destructive")} autoFocus />
                {/* Secondary: Continue stays the step's one dark main button. */}
                <Button variant="outline" className="h-10" disabled={!newFolder.trim() || !!newFolderError || (!newFolderTooDeep && options.find((o) => o.id === folderId)?.blocked !== undefined)} onClick={() => onCreateFolder(newFolder)}>
                  Create folder
                </Button>
              </div>
              {newFolderError ? <span className="text-xs text-destructive">{newFolderError}</span> : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Project name
          </label>
          <input id="name" value={name} maxLength={NAME_MAX + 10} onChange={(e) => set({ name: e.target.value })} className={cn(field, nameError && "border-destructive")} aria-invalid={!!nameError} />
          {/* R15: the name starts with the game's, and says why. */}
          {nameError ? (
            <span className="text-xs text-destructive">{nameError}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Starts with the game’s name so it’s easy to find · unique in its folder · up to {NAME_MAX} characters</span>
          )}
        </div>

        {source ? (
          <section className="flex flex-col gap-4 rounded-xl border border-border p-4 text-sm">
            <div className="flex items-center gap-3">
              <GameIcon game={{ title: source.game, initials: source.gameInitials, icon: source.gameIcon }} className="size-9 rounded-lg text-[11px]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs text-muted-foreground">Cloning from</span>
                <span className="truncate font-medium">{source.project}</span>
              </div>
              <Select items={Object.fromEntries(client.environments.map((e) => [e.id, e.name]))} value={cloneEnv} onValueChange={(v) => v && set({ env: String(v) })}>
                <SelectTrigger size="sm" aria-label="Clone from environment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {client.environments.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CloneChips title="Copied" items={CLONE_COPIED} copied />
            <CloneChips title="Starts fresh" items={CLONE_FRESH} />

            <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
              <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-[13px] leading-snug text-muted-foreground">
                {copiedUsers.length ? (
                  <>
                    <span className="text-foreground">{copiedUsers.map((u) => `${u.user} (${u.role})`).join(", ")}</span> keep access through copied grants.
                  </>
                ) : (
                  "Access comes from the folder it goes into."
                )}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

/** What cloning copies and what the new project starts without, as short labelled chips (the detail is in the tip). */
const CLONE_COPIED: { icon: React.ComponentType<{ className?: string }>; label: string; detail: string }[] = [
  { icon: IconTag, label: "Products & pricing", detail: "Products, price points and pricing rules" },
  { icon: IconGift, label: "Offers", detail: "Offers and engagement" },
  { icon: IconLanguage, label: "Content", detail: "Content and translations" },
  { icon: IconPalette, label: "Studio designs", detail: "Studio designs" },
  { icon: IconPuzzle, label: "Modules", detail: "Module configuration" },
  { icon: IconPlug, label: "Appcharge settings", detail: "Appcharge integration settings" },
  { icon: IconUsers, label: "Users", detail: "Users and direct grants" },
];
const CLONE_FRESH: typeof CLONE_COPIED = [
  { icon: IconReceipt, label: "Orders & players", detail: "Orders and players" },
  { icon: IconChartBar, label: "Analytics & finance", detail: "Analytics and financial data" },
  { icon: IconKey, label: "New API keys", detail: "API keys (new ones are made)" },
  { icon: IconWebhook, label: "Webhooks & domains", detail: "Callback and webhook URLs, domains" },
  { icon: IconPlugConnected, label: "Integrations", detail: "Third-party integrations" },
  { icon: IconUserX, label: "Invites", detail: "Inherited grants and pending invites" },
];

function CloneChips({ title, items, copied = false }: { title: string; items: typeof CLONE_COPIED; copied?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {copied ? <IconCheck className="size-3.5 text-success" stroke={2.5} /> : <IconRefresh className="size-3.5" />}
        {title}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {items.map(({ icon: Icon, label, detail }) => (
          <li
            key={label}
            title={detail}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px]",
              copied ? "bg-muted text-foreground" : "border border-dashed border-border text-muted-foreground",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Choose a store template (Webstore only) ───────── */

/**
 * The store step, one screen and one choice (design review, 12 Nov 2026): the layout as visual tiles. The genre isn't
 * asked; it's read from the game's store link and styles the store. Multi-page is a layout (Game portal), not a
 * separate choice. Blank is a small link, not an option card. Pointing at a layout previews it.
 */
function StepTemplate({
  experience,
  genre,
  layout,
  recommended,
  theme,
  set,
  onHover,
  onHoverLayout,
}: {
  experience: StoreExperience;
  genre: Genre;
  layout: StoreLayout;
  recommended: { id: Genre; why: string };
  theme: Theme;
  set: (next: Record<string, string | undefined>, mode?: "push" | "replace") => void;
  onHover: (id: string | null) => void;
  onHoverLayout: (l: StoreLayout | null) => void;
}) {
  const pickGenre = (g: Genre) => set({ exp: g, genre: g });
  const blank = experience === "blank";

  return (
    <>
      <StepTitle title="Set up your store" description="We picked a starting point from your game. Change it anytime." />

      {/* The layouts as visual tiles in a 2 × 2 grid (like Studio's row-count picker): a sketch, the name and what it's best for. Recommended is pinned to Option 01's sketch. */}
      <div role="radiogroup" aria-label="Store layout" className="grid grid-cols-2 gap-3">
        {LAYOUT_IDS.map((l) => {
          // Blank and the layouts are one choice: while blank is picked, no tile is.
          const on = !blank && layout === l;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set({ layout: l === "row3" ? undefined : l, structure: undefined, ...(blank ? { exp: genre, genre } : {}) })}
              onMouseEnter={() => onHoverLayout(l)}
              onMouseLeave={() => onHoverLayout(null)}
              onFocus={() => onHoverLayout(l)}
              onBlur={() => onHoverLayout(null)}
              className={cn(
                "flex flex-col gap-3 rounded-lg border p-3 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                !on && "border-border hover:border-foreground/25",
              )}
              style={on ? { borderColor: theme.accent, background: theme.tint } : undefined}
            >
              <span className="relative" style={{ color: on ? theme.accent : undefined }}>
                <LayoutThumb layout={l} />
                {/* AI's Recommended (a sparkle) sits on the sketch's top-right corner, clear of the name. */}
                {l === RECOMMENDED_LAYOUT ? <Badge variant="info" className="absolute -top-2 -right-2 bg-background ring-1 ring-info/25" title="Recommended by AI, from your game">
                    {/* The sparkle says the pick is AI's (read from the game's store page). */}
                    <IconSparkles data-icon="inline-start" aria-hidden />
                    Recommended
                  </Badge> : null}
              </span>
              <span className="text-sm font-medium whitespace-nowrap text-foreground">{LAYOUTS[l].label}</span>
            </button>
          );
        })}
      </div>

      {/* Blank, kept small: a plain link under the tiles (it only pays off with a fully custom vision). Picked, it says
          so, with Undo back to the layouts. */}
      {blank ? (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-foreground">
          <IconCheck className="size-4 shrink-0" style={{ color: theme.accent }} />
          Starting with a blank store.
          <button type="button" onClick={() => pickGenre(genre)} className="font-medium hover:underline underline-offset-4" style={{ color: theme.accent }}>
            Undo
          </button>
        </p>
      ) : (
        <button
          type="button"
          onClick={() => set({ exp: "blank", genre })}
          onMouseEnter={() => onHover(EXPERIENCES.blank.layout)}
          onMouseLeave={() => onHover(null)}
          className="mt-4 self-start text-sm font-medium hover:underline underline-offset-4 focus-visible:underline focus-visible:outline-none"
          style={{ color: theme.accent }}
        >
          Or start with a blank store
        </button>
      )}
    </>
  );
}

/** A layout tile's sketch: the store's banner and offers as grey blocks, arranged like the layout (tabs on top for the
 *  multi-page Game portal). */
function LayoutThumb({ layout }: { layout: StoreLayout }) {
  const block = "rounded-[2px] bg-muted-foreground/35";
  const grid = (cols: number, cells: number) => (
    <span className={cn("grid flex-1 gap-[3px]", cols === 4 ? "grid-cols-4" : "grid-cols-3")}>
      {Array.from({ length: cells }).map((_, i) => (
        <span key={i} className={block} />
      ))}
    </span>
  );
  return (
    <span aria-hidden className="flex h-20 w-full flex-col gap-[3px] rounded-md border border-current/40 bg-background p-1.5 text-muted-foreground/40">
      {layout === "portal" ? (
        <span className="flex justify-center gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("h-[3px] w-3 rounded-full", i ? "bg-muted-foreground/25" : "bg-muted-foreground/60")} />
          ))}
        </span>
      ) : null}
      <span className={cn(block, "h-[7px] shrink-0")} />
      {layout === "row1" ? (
        <span className="mx-auto flex w-3/5 flex-1 flex-col gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn(block, "flex-1")} />
          ))}
        </span>
      ) : layout === "gallery" ? (
        grid(4, 8)
      ) : (
        grid(3, layout === "portal" ? 3 : 6)
      )}
    </span>
  );
}

/** Describe your store (after Set up your store, optional): tell the AI what you want; the preview updates and the
 *  notes go with the project. */
function StepDescribe({ ctx, set }: { ctx: string; set: (next: Record<string, string | undefined>, mode?: "push" | "replace") => void }) {
  return (
    <>
      <StepTitle title="Describe your store" description="Optional. Tell the AI what you want, and the preview updates as you go." />
      <StoreAI ctx={ctx} set={set} />
    </>
  );
}

/**
 * The store step's AI prompt (the dashboard's Ask AI bar, without the side panel): describe the store in your own
 * words. A genre or a structure in the request picks it; any look (dark, gold, bright…) tunes the preview; the note
 * goes with the project. The line under it says what changed.
 */
function StoreAI({ ctx, set }: { ctx: string; set: (next: Record<string, string | undefined>, mode?: "push" | "replace") => void }) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [shots, setShotsState] = React.useState(() => [...storeShots]);
  const setShots = (fn: (list: typeof storeShots) => typeof storeShots) =>
    setShotsState((list) => {
      const next = fn(list);
      storeShots.splice(0, storeShots.length, ...next);
      return next;
    });
  const [reading, setReading] = React.useState(false);
  const [matched, setMatched] = React.useState<{ label: string; colors: string[] } | null>(null);
  /** Read the photos (the first decides): its style picks the layout (dark → Midcore, soft → Casual, bright → Casino)
   *  and its colours go on the preview, like a typed note would. */
  const upload = (files: File[]) => {
    setShots((list) => [...list, ...files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }))]);
    setReading(true);
    setMatched(null);
    Promise.all([paletteFromFile(files[0]), new Promise((r) => window.setTimeout(r, 900))]).then(([pal]) => {
      setReading(false);
      if (!pal) {
        setMatched({ label: "your", colors: [] });
        return;
      }
      const g = ({ dark: "midcore", soft: "casual", bright: "casino" } as const)[pal.style];
      const note = `Match my current store (${files.length} ${files.length === 1 ? "photo" : "photos"})`;
      set({ exp: g, genre: g, brand: pal.colors.map((c) => c.slice(1)).join(",") || undefined, ctx: ctx.includes("Match my current store") ? ctx : ctx.trim() ? `${ctx.trim()}; ${note}` : note });
      setMatched({ label: EXPERIENCES[g].label, colors: pal.colors });
    });
  };
  const [text, setText] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);
  const ask = (v: string) => {
    setText("");
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      const t = v.toLowerCase();
      const next: Record<string, string | undefined> = {};
      const changed: string[] = [];
      const g = (["blank", "casino", "casual", "midcore"] as StoreExperience[]).find((e) => new RegExp(`\\b${e}\\b`).test(t));
      if (g) {
        next.exp = g;
        if (g !== "blank") next.genre = g;
        changed.push(EXPERIENCES[g].label);
      }
      if (/multi|several|many|pages\b/.test(t)) {
        next.layout = "portal";
        next.structure = undefined;
        changed.push(LAYOUTS.portal.label);
      } else if (/single|one page/.test(t)) {
        next.layout = undefined;
        next.structure = undefined;
        changed.push(LAYOUTS.row3.label);
      }
      const look = toneFrom(v)?.chips.filter((c) => c !== "Your notes") ?? [];
      changed.push(...look);
      next.ctx = ctx.trim() ? `${ctx.trim()}; ${v}` : v;
      set(next);
      setDone(changed.length ? `Done: ${changed.join(", ")}.` : "Got it. I’ll use that when I build your store.");
    }, 600);
  };
  return (
    <div>
      <FloatingAIPrompt
        variant="inline"
        noPanel
        value={text}
        onValueChange={setText}
        onSubmit={ask}
        isLoading={thinking}
        placeholder="Describe the store you want…"
        className="max-w-none"
        onAddContext={() => fileRef.current?.click()}
      />
      {done ? (
        <p className="mt-2 px-4 text-xs text-muted-foreground" aria-live="polite">
          {done}
        </p>
      ) : null}

      {/* Screenshots of the publisher's current store: read here in the browser for its layout style and colours,
          which the preview then takes on (a stand-in for real layout matching). */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label="Upload screenshots of your current store"
        onChange={(e) => {
          if (e.target.files?.length) upload([...e.target.files]);
          e.target.value = "";
        }}
      />
      {/* Usability test: no upload box for now; photos come in from the prompt's + and show below. */}
      {shots.length ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Uploaded store photos">
          {shots.map((sh) => (
            <li key={sh.url} className="group/shot relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sh.url} alt={sh.name} className="size-16 rounded-lg object-cover ring-1 ring-border" />
              <button
                type="button"
                aria-label={`Remove ${sh.name}`}
                onClick={() => setShots((list) => list.filter((x) => x.url !== sh.url))}
                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background opacity-0 shadow-sm transition-opacity group-hover/shot:opacity-100 focus-visible:opacity-100"
              >
                <IconX className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {reading ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <IconLoader2 className="size-3.5 animate-spin" />
          Reading your store…
        </p>
      ) : matched ? (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          Matched your store: {matched.label} layout
          {matched.colors.length ? (
            <>
              <span>· colours</span>
              {matched.colors.map((c) => (
                <span key={c} className="inline-block size-3 rounded-full ring-1 ring-black/10" style={{ background: c }} title={c} />
              ))}
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

/** Uploaded store photos stay for the session, so going back and forth between steps keeps them. */
const storeShots: { url: string; name: string }[] = [];

/** A tiny sketch of the store's structure: one long page, or page tabs over the content. */
function StructureThumb({ structure }: { structure: StoreStructure }) {
  const block = "rounded-[2px] bg-muted-foreground/35";
  return (
    <span aria-hidden className="flex h-9 w-9 flex-col gap-[3px] rounded-md border border-muted-foreground/40 bg-background p-1">
      {structure === "multiple-pages" ? (
        <span className="flex gap-[2px]">
          <span className={cn(block, "h-[3px] flex-1 bg-muted-foreground/60")} />
          <span className={cn(block, "h-[3px] flex-1")} />
          <span className={cn(block, "h-[3px] flex-1")} />
        </span>
      ) : null}
      <span className={cn(block, "h-[5px]")} />
      <span className={cn(block, "flex-1")} />
    </span>
  );
}

/** A tiny line sketch of a template's layout, as the card's icon: one grey, only the layout differs. */
/** Thumbnail sizes: sm for a minor choice (Blank), md by default, lg for the recommended experience. */
const THUMB_SIZE = { sm: "h-6 w-8", md: "h-9 w-12", lg: "h-12 w-16 p-1.5" } as const;

function TemplateThumb({ layout, size = "md" }: { layout: string; size?: keyof typeof THUMB_SIZE }) {
  // Blank: just the empty page.
  if (layout === "blank") return <span aria-hidden className={cn("block rounded-md border border-dashed border-muted-foreground/50 bg-background", THUMB_SIZE[size])} />;
  const block = "rounded-[2px] bg-muted-foreground/35";
  const tiles = layout === "minimal" ? 2 : 3;
  return (
    <span aria-hidden className={cn("flex flex-col gap-[3px] rounded-md border border-muted-foreground/40 bg-background p-1", THUMB_SIZE[size])}>
      {/* The banner: tall for Hero Grid (the game's art), short and narrow for Minimal. */}
      <span className={cn(block, layout === "hero-grid" ? "h-3" : layout === "minimal" ? "h-1 w-3/5" : "h-[7px]")} />
      <span className={cn("grid flex-1", tiles === 2 ? "grid-cols-2 gap-1" : "grid-cols-3 gap-[3px]")}>
        {Array.from({ length: tiles }).map((_, i) => (
          <span key={i} className={cn(block, layout === "minimal" && "bg-muted-foreground/20")} />
        ))}
      </span>
      {/* Arcade's rewards rail along the bottom. */}
      {layout === "arcade" ? <span className={cn(block, "h-[3px]")} /> : null}
    </span>
  );
}

/* ───────── Ready (Story 5) ───────── */

/**
 * Add module (Module Management PRD): the same two-panel dialog as Create project, for a project that exists. It
 * opens on "How do you want to sell?" with the module being added already checked (the project's own modules show as
 * Added), then confirms on a success step. A module goes to Production and every sandbox and can't be removed later.
 */
export function AddModuleFlow({ project, initial, onClose }: { project: Project; initial?: ModuleId; onClose: () => void }) {
  const router = useRouter();
  const { modules: has, add } = useProjectModules(project);
  // What the project had when the dialog opened (adding updates `has`; the success step still shows what was new).
  const [had] = React.useState(has);
  const [picked, setPicked] = React.useState<ModuleId[]>(() => (initial && !has.includes(initial) ? [initial] : []));
  const [done, setDone] = React.useState<ModuleId[] | null>(null);
  const shown: ModuleId = (done ?? picked).at(-1) ?? had.at(-1) ?? "webstore";
  const theme = THEMES[shown];
  const game: Game = { title: project.game, initials: project.gameInitials, icon: project.gameIcon };
  const names = (list: ModuleId[]) => {
    const l = list.map((m) => MODULE_LABEL[m]);
    return l.length > 1 ? `${l.slice(0, -1).join(", ")} and ${l.at(-1)}` : l[0] ?? "";
  };
  const confirm = () => {
    picked.forEach(add);
    setDone(picked);
  };

  return (
    <div className="font-brand relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)] bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:bg-white/10 lg:text-white/80 lg:hover:bg-white/20 lg:hover:text-white"
      >
        <IconX className="size-5" />
      </button>
      <section className="flex h-full min-h-0 flex-col px-6 pt-5 pb-8 sm:px-12 lg:px-16">
        {/* Two steps: the modules, then the success. */}
        <div className="mt-3 h-1 w-full max-w-[34rem] overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progress" aria-valuenow={done ? 100 : 50} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full transition-[width,background-color] duration-500" style={{ width: done ? "100%" : "50%", background: theme.accent }} />
        </div>
        <div className="mt-3 h-10" />
        <div className="-mx-2 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-5">
          <div key={done ? "done" : "modules"} className="my-auto w-full max-w-[34rem] animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
            {done ? (
              <>
                <p className="mb-4 text-4xl" aria-hidden>
                  🎉
                </p>
                <StepTitle
                  title={done.length > 1 ? "Modules added" : `${MODULE_LABEL[done[0]]} added`}
                  description={`${project.project} can now sell with ${names(done)}, in Production and every sandbox. Finish its setup checklist to go live.`}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`${projectHref(project.id, "home", DEFAULT_ENV_ID)}?panel=checklist`);
                    }}
                    className="inline-flex h-11.5 items-center rounded-[200px] px-7 text-[15px] font-medium text-white shadow-md transition-opacity hover:opacity-85"
                    style={{ background: CHARCOAL }}
                  >
                    Open setup checklist
                  </button>
                  <button type="button" onClick={onClose} className="inline-flex h-11.5 items-center rounded-full border border-border px-6 text-[15px] transition-colors hover:bg-muted">
                    Done
                  </button>
                </div>
              </>
            ) : (
              <StepModules
                mods={picked}
                has={had}
                description={`Add a way to sell ${project.game}. It's added to Production and every sandbox, and can't be removed later.`}
                onToggle={(m) => setPicked((l) => (l.includes(m) ? l.filter((x) => x !== m) : [...l, m]))}
              />
            )}
          </div>
        </div>
        {done ? null : (
          <div className="flex shrink-0 items-center gap-3 pt-4">
            <span className="flex-1" />
            <button
              type="button"
              onClick={confirm}
              disabled={!picked.length}
              className="h-11.5 shrink-0 rounded-[200px] px-7 text-[15px] font-medium whitespace-nowrap text-white shadow-md transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
              style={{ background: CHARCOAL }}
            >
              {picked.length > 1 ? `Add ${picked.length} modules` : picked.length ? `Add ${MODULE_LABEL[picked[0]]}` : "Add module"}
            </button>
          </div>
        )}
      </section>
      <aside className="hidden items-center justify-center p-10 transition-colors duration-500 lg:flex lg:h-full xl:p-16" style={{ background: theme.panel }}>
        <PreviewWindow label={MODULE_LABEL[shown]} env>
          <ModulePreview module={shown} game={game} />
        </PreviewWindow>
      </aside>
    </div>
  );
}

function StepDone({
  client,
  name,
  folderPath,
  webstore,
  starterFailed,
  target,
  projects = [],
  exitHref,
}: {
  client: ClientConfig;
  name: string;
  folderPath: string;
  webstore: boolean;
  starterFailed: boolean;
  target?: Project;
  projects?: Project[];
  exitHref: string;
}) {
  // R20: straight into the new project's Home, where a next-steps card picks up (open store, checklist, modules, move).
  const dashboardHref = target ? `/dashboard/${target.id}/home?welcome=1` : exitHref;
  const storeProject = projects.find((p) => p.modules?.includes("webstore")) ?? target;
  // R16: "Open store" used to open a made-up web address; it now previews the store right here.
  const [storeOpen, setStoreOpen] = React.useState(false);
  return (
    <>
      <p className="mb-4 text-4xl" aria-hidden>
        🎉
      </p>
      <StepTitle title="Your project is ready" description={`${name} is in ${folderPath}, with its Production environment.`} />
      {starterFailed ? (
        <p role="alert" className="-mt-4 mb-6 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-sm">
          <IconAlertTriangle className="size-4 shrink-0 text-warning" />
          Starter content couldn’t be added
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Link href={dashboardHref} className="inline-flex h-11.5 items-center rounded-[200px] shadow-md px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-85" style={{ background: CHARCOAL }}>
          Go to project
        </Link>
        {webstore && storeProject ? (
          <button type="button" onClick={() => setStoreOpen(true)} className="inline-flex h-11.5 items-center gap-2 rounded-full border border-border px-6 text-[15px] transition-colors hover:bg-muted">
            <IconExternalLink className="size-4" />
            Preview store
          </button>
        ) : null}
      </div>
      {storeProject ? <StorePreviewDialog project={storeProject} open={storeOpen} onOpenChange={setStoreOpen} /> : null}
    </>
  );
}

/**
 * The project's store as players will see it (R16 / R20): the template, structure and colours chosen in Create
 * project, drawn large in a dialog. The prototype has no live store, so this stands in for "Open store".
 */
export function StorePreviewDialog({ project, open, onOpenChange }: { project: Project; open: boolean; onOpenChange: (open: boolean) => void }) {
  const game: Game = { title: project.project, initials: project.gameInitials, icon: project.gameIcon };
  const url = (project.productionStoreUrl ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(1100px,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 pr-12">
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
            <IconLock className="size-3.5 shrink-0" />
            <span className="truncate">{url || "your-store.appcharge.com"}</span>
          </span>
          <Badge variant="neutral">Preview</Badge>
        </div>
        <DialogTitle className="sr-only">{project.project} store</DialogTitle>
        <DialogDescription className="sr-only">A preview of the store players will see.</DialogDescription>
        <div className="h-[min(40rem,70svh)]">
          <StoreMock
            game={game}
            layout={project.storeTemplate ?? RECOMMENDED}
            arrange={project.storeLayout ?? (project.storeStructure === "multiple-pages" ? "portal" : "row3")}
            starter={project.storeSample ?? true}
            brand={brandSkin(project.storeColors)}
          />
        </div>
        <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          This is how the store will look. It goes live at this address once its setup checklist is done.
        </p>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── The preview panel ───────── */

/** A product window, like Figma's: a toolbar (Appcharge mark, what's being made, the environment) over the preview. */
function PreviewWindow({ label, env, children }: { label: string; env: boolean; children: React.ReactNode }) {
  return (
    <div aria-hidden className="w-full max-w-[860px] overflow-hidden rounded-2xl border border-black/5 bg-background shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium">
          <AppchargeLogo className="size-5 shrink-0" />
          <span className="truncate">{label}</span>
          <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </span>
        <span className="flex-1" />
        {env ? (
          <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium">
            <IconCircleFilled className="size-2 text-[#16a34a]" />
            Production
          </span>
        ) : null}
      </div>
      <div className="relative h-[min(30rem,62vh)] overflow-hidden bg-muted/30">
        <div key={label} className="size-full animate-in fade-in-0 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Step 1: the game as the store sees it (icon, name, genre, description, screenshots); placeholders until it's found. */
function GamePreview({ game }: { game?: Game }) {
  const shots = game?.screenshots ?? [];
  return (
    <div className="flex size-full flex-col gap-6 p-8">
      <div className="flex items-start gap-5">
        {game ? <GameIcon game={game} className="size-20 rounded-2xl text-lg" /> : <span className="size-20 shrink-0 rounded-2xl bg-muted" />}
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          {game ? (
            <>
              <p className="truncate text-2xl font-semibold tracking-tight">{game.title}</p>
              <p className="text-sm text-muted-foreground">{game.genre ?? (game.linked ? "Already in your company" : "New game")}</p>
              {game.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{game.description}</p> : null}
            </>
          ) : (
            <>
              <span className="h-5 w-48 rounded-full bg-muted" />
              <span className="h-3 w-28 rounded-full bg-muted" />
              <span className="mt-2 text-sm text-muted-foreground">Your game shows here</span>
            </>
          )}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) =>
          shots[i] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={shots[i]} alt="" className="size-full rounded-xl object-cover" />
          ) : (
            <span key={i} className="rounded-xl bg-muted" />
          ),
        )}
      </div>
    </div>
  );
}

/** What each module looks like to a player, built from the game's own art when it's known. */
function ModulePreview({ module, game }: { module: ModuleId; game?: Game }) {
  if (module === "webstore") return <StoreMock game={game ?? { title: "Your game", initials: "··" }} layout={RECOMMENDED} starter />;
  const shot = game?.screenshots?.[0];
  const icon = game ? <GameIcon game={game} className="size-9 rounded-lg text-[11px]" /> : <span className="size-9 rounded-lg bg-muted" />;
  const checkout = <ScaledCheckout game={game} scale={module === "payment-links" ? 0.44 : 0.5} />;
  if (module === "payment-links") {
    // In the game, a purchase opens Appcharge's hosted checkout.
    return (
      <div className="flex size-full items-center justify-center gap-5 p-6">
        <div className="relative h-full max-h-[20rem] w-36 shrink-0 overflow-hidden rounded-[1.75rem] border-4 border-foreground/80 bg-muted">
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot} alt="" className="absolute inset-0 size-full object-cover" />
          ) : null}
          <div className="absolute inset-x-3 bottom-4 rounded-xl bg-background/95 p-3 text-center shadow-lg">
            <p className="text-xs font-medium">Special Offer</p>
            <p className="mt-2 rounded-lg py-1.5 text-xs font-semibold text-white" style={{ background: THEMES["payment-links"].accent }}>
              $19.90
            </p>
          </div>
        </div>
        <IconArrowRight className="size-6 shrink-0 text-muted-foreground" />
        {checkout}
      </div>
    );
  }
  // Direct Checkout: Appcharge's checkout inside the publisher's own web store.
  return (
    <div className="relative size-full">
      <div className="flex size-full flex-col gap-3 p-6 opacity-60">
        <div className="flex items-center gap-2">
          {icon}
          <span className="h-3 w-32 rounded-full bg-foreground/15" />
          <span className="flex-1" />
          <span className="h-3 w-16 rounded-full bg-foreground/10" />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) =>
            game?.screenshots?.[i + 1] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={game.screenshots[i + 1]} alt="" className="size-full rounded-xl object-cover" />
            ) : (
              <span key={i} className="rounded-xl bg-muted" />
            ),
          )}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">{checkout}</div>
    </div>
  );
}

/** Where it lives: the scope selector with the new project already in its folder, wearing its icon and module chips. */
function PlacePreview({
  client,
  trail,
  draftFolder,
  game,
  name,
  mods,
  theme,
}: {
  client: ClientConfig;
  trail: FolderNode[];
  /** A folder being typed in "Create new folder": drawn under the chosen folder, holding the project. */
  draftFolder: string;
  game: Game;
  name: string;
  mods: ModuleId[];
  theme: Theme;
}) {
  const indent = (d: number) => ({ paddingLeft: 12 + d * 20 });
  const depth = trail.length + (draftFolder ? 1 : 0);
  return (
    <div className="flex size-full items-start justify-center p-8">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm text-muted-foreground">
          <IconSearch className="size-4" />
          Search folders or projects
        </div>
        <div className="flex flex-col gap-0.5 p-2">
          {trail.map((f, i) => (
            <div key={f.id} className="flex h-9 items-center gap-2 rounded-md text-sm" style={indent(i)}>
              <IconChevronDown className="size-3.5 text-muted-foreground" />
              {i === 0 ? <CompanyLogo clientId={client.id} className="size-5 rounded-[5px]" /> : <IconFolderFilled className="size-4 text-muted-foreground" />}
              <span className={cn("truncate", i === 0 && "font-medium")}>{i === 0 ? client.company.name : f.name}</span>
            </div>
          ))}
          {draftFolder ? (
            <div className="flex h-9 items-center gap-2 rounded-md border border-dashed pr-3 text-sm" style={{ ...indent(trail.length), borderColor: theme.accent }}>
              <IconChevronDown className="size-3.5 text-muted-foreground" />
              <IconFolderFilled className="size-4" style={{ color: theme.accent }} />
              <span className="min-w-0 flex-1 truncate font-medium">{draftFolder}</span>
              <span className="text-[10px] font-semibold" style={{ color: theme.accent }}>
                New folder
              </span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 rounded-md py-2 pr-3 text-sm ring-2 ring-inset" style={{ ...indent(depth), background: theme.tint, ["--tw-ring-color" as string]: theme.accent }}>
            <span className="size-3.5" />
            <GameIcon game={game} className="size-7 rounded-md text-[10px]" />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-medium">{name || "Untitled project"}</span>
              <span className="flex flex-wrap gap-1">
                {mods.map((m) => {
                  const Icon = MODULE_ICON[m];
                  return (
                    <span key={m} className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      <Icon className="size-3" />
                      {MODULE_LABEL[m]}
                    </span>
                  );
                })}
              </span>
            </span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ background: theme.accent }}>
              New
            </span>
          </div>
          {[0.7, 0.5].map((w, i) => (
            <div key={i} className="flex h-9 items-center gap-2" style={indent(Math.max(1, trail.length - 1))}>
              <span className="size-3.5" />
              <IconFolderFilled className="size-4 text-muted-foreground/40" />
              <span className="h-2 rounded-full bg-muted" style={{ width: `${w * 10}rem` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A store screenshot filling its tile; nothing when there's none. */
function ShotImg({ src, className }: { src?: string; className?: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={cn("absolute inset-0 size-full object-cover", className)} />;
}


/**
 * The store a template makes, after the Figma "Royal Blast" web store (5049:4766): the game's art behind it, a player
 * bar, a banner, offer cards with price buttons and badges, and a timed rail. Every asset is the game's own (its store
 * screenshots, icon and name), so it shows the store being created; starter content off leaves empty offer slots.
 */
function StoreMock({
  game,
  layout,
  arrange = "row3",
  starter,
  tone,
  brand,
}: {
  game: Game;
  layout: string;
  /** The layout tile picked: how the offers are arranged, and the Game portal's page tabs. */
  arrange?: StoreLayout;
  starter: boolean;
  tone?: Tone;
  brand?: Partial<StoreSkin>;
}) {
  // Drawn at a desktop width (like the Figma frame) and scaled to fit the preview.
  const DESIGN_W = 1100;
  const box = React.useRef<HTMLDivElement>(null);
  const [fit, setFit] = React.useState({ scale: 0.7, height: 600 });
  React.useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      if (!el.clientWidth) return;
      const scale = el.clientWidth / DESIGN_W;
      setFit({ scale, height: el.clientHeight / scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const shots = game.screenshots ?? [];
  const shot = (i: number) => (shots.length ? shots[i % shots.length] : undefined);
  const base = STORE_SKINS[layout] ?? STORE_SKINS[RECOMMENDED];
  // The game's brand colours go on the template; the AI note tunes it further (a stand-in for real theme variations).
  const s: StoreSkin = { ...base, ...brand, ...tone?.skin };
  const structure = structureOf(arrange);
  const cols = arrange === "row1" ? 1 : arrange === "gallery" ? 4 : 3;
  const gridCols = cols === 1 ? "mx-auto w-[460px] grid-cols-1" : cols === 4 ? "grid-cols-4" : "grid-cols-3";
  // Blank: no banner art and no offers, only the empty places to fill.
  const blank = layout === "blank";
  const offers = starter && !blank;

  return (
    <div ref={box} className="relative size-full overflow-hidden" style={{ background: s.page }}>
      {tone ? (
        <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <IconSparkles className="size-3" />
          Personalized with AI
        </span>
      ) : null}
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: DESIGN_W, height: fit.height, transform: `scale(${fit.scale})` }}>
        {/* The game's art behind the whole store (Hero Grid), dimmed so the offers read. */}
        {s.art && shot(0) ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot(0)} alt="" className="absolute inset-0 size-full scale-110 object-cover blur-[3px]" />
            <div className="absolute inset-0 bg-black/45" />
          </>
        ) : null}

        <div className="relative flex h-full flex-col">
          {/* Player bar: avatar, name and balance; the game's logo on the right. */}
          <div className="flex h-14 shrink-0 items-center gap-3 px-8" style={{ background: s.bar, color: s.barText }}>
            <GameIcon game={game} className="size-9 rounded-full text-[10px] ring-2 ring-[#f5c542]" />
            <div className="leading-tight">
              <p className="text-[13px] font-bold">Player_1</p>
              <p className="flex items-center gap-1 text-[13px] font-bold">
                <IconCoinFilled className="size-3.5 text-[#f5c542]" />
                500,000,000
              </p>
            </div>
            <span className="flex-1" />
            <GameIcon game={game} className="size-9 rounded-lg text-[10px]" />
            <span className="max-w-60 truncate text-[15px] font-extrabold">{game.title}</span>
          </div>
          {/* Multiple pages: the store's page tabs under the player bar, the first one open. */}
          {structure === "multiple-pages" ? (
            <div className="flex h-11 shrink-0 items-center justify-center gap-2 px-8" style={{ background: s.bar, color: s.barText }}>
              {["Home", "Offers", "Events", "Rewards"].map((tab, i) => (
                <span key={tab} className={cn("rounded-full px-4 py-1.5 text-[13px] font-bold", i === 0 ? "bg-white/20" : "opacity-60")} style={i === 0 ? { boxShadow: `inset 0 -3px 0 ${s.button}` } : undefined}>
                  {tab}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mx-auto flex w-full max-w-[820px] min-h-0 flex-1 flex-col gap-4 pt-5">
            {/* Banner: the game's art with its name and the store's headline (an empty place on Blank). */}
            {blank ? (
              <div className="mx-auto flex h-[118px] w-[480px] shrink-0 items-center justify-center rounded-[18px] border-2 border-dashed text-sm font-semibold" style={{ borderColor: s.empty, color: s.empty }}>
                Your banner goes here
              </div>
            ) : (
              <div className="relative mx-auto h-[118px] w-[480px] shrink-0 overflow-hidden rounded-[18px] shadow-lg" style={{ background: s.card }}>
                <ShotImg src={shot(1)} className="object-[center_30%]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
                <div className="relative flex h-full items-center gap-4 px-6">
                  <GameIcon game={game} className="size-16 rounded-2xl text-sm shadow-lg ring-2 ring-white/70" />
                  <p className="text-[30px] leading-[1.02] font-black tracking-tight text-[#ffd84a] [text-shadow:0_3px_0_#7a2e00,0_0_8px_rgba(0,0,0,0.5)]">
                    Web Store
                    <br />
                    Up to 20% Off
                  </p>
                </div>
              </div>
            )}

            {offers ? (
              <div className={cn("grid gap-4", gridCols)}>
                {Array.from({ length: cols }).map((_, i) => (
                  <OfferCard key={`w${i}`} skin={s} title="Welcome Offer" art={shot(i + 2)} items={STORE_ITEMS} price="$99.90" was={i === 0 ? "$104.90" : undefined} badge={i === 0 && s.badges ? "best" : i === cols - 1 && s.badges ? "ribbon" : undefined} />
                ))}
                {Array.from({ length: cols }).map((_, i) => (
                  <OfferCard key={`o${i}`} skin={s} art={i === cols - 1 ? shot(i + 5) : undefined} webOnly={i === cols - 1 && s.badges} items={i === 0 ? STORE_ITEMS.slice(0, 1) : STORE_ITEMS.slice(2, 4)} price={["$19.90", "$35.90", "$25.90"][i % 3]} badge={i === 0 && s.badges ? "best" : undefined} />
                ))}
              </div>
            ) : (
              <div className={cn("grid gap-4", gridCols)}>
                {Array.from({ length: cols * 2 }).map((_, i) => (
                  <div key={i} className="flex h-[150px] items-center justify-center rounded-[14px] border-2 border-dashed text-sm font-semibold" style={{ borderColor: s.empty, color: s.empty }}>
                    Your offers go here
                  </div>
                ))}
              </div>
            )}

            {/* A timed rail of offers that unlock one after another. */}
            {offers && s.rail ? (
              <div className="rounded-t-2xl px-4 pt-3 pb-6" style={{ background: s.railBg }}>
                <p className="text-center text-[15px] font-bold text-white">Ends in 22:22:22</p>
                <div className="mt-3 flex items-center gap-2">
                  {RAIL.map((r, i) => (
                    <React.Fragment key={i}>
                      {i ? <IconChevronRight className="size-5 shrink-0 text-white" stroke={3} /> : null}
                      <div className="flex h-[118px] flex-1 flex-col overflow-hidden rounded-[12px]" style={{ background: s.railTile }}>
                        <div className="flex flex-1 items-center justify-center gap-1.5 text-[15px] font-black" style={{ color: s.cardText }}>
                          <r.Icon className="size-8" style={{ color: r.color }} />
                          {r.q}
                        </div>
                        <div className="flex h-8 items-center justify-center gap-1 border-b-4 text-[13px] font-extrabold text-white" style={{ background: s.button, borderColor: s.buttonEdge }}>
                          {i ? <IconLockFilled className="size-3.5 text-[#ffd84a]" /> : null}
                          {r.price}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The store's look per template; Hero Grid is the Figma "Royal Blast" web store. */
type StoreSkin = {
  page: string;
  bar: string;
  barText: string;
  card: string;
  cardText: string;
  panel: string;
  button: string;
  buttonEdge: string;
  railBg: string;
  railTile: string;
  empty: string;
  art: boolean;
  badges: boolean;
  rail: boolean;
  neon?: string;
};
const STORE_SKINS: Record<string, StoreSkin> = {
  blank: { page: "#f4f4f5", bar: "#ffffff", barText: "#272727", card: "#ffffff", cardText: "#272727", panel: "rgba(39,39,39,0.06)", button: "#272727", buttonEdge: "#000000", railBg: "#272727", railTile: "#ffffff", empty: "rgba(39,39,39,0.3)", art: false, badges: false, rail: false },
  "hero-grid": { page: "#3d2d1f", bar: "rgba(30,20,10,0.75)", barText: "#fff", card: "#e7cf88", cardText: "#5b3a12", panel: "rgba(60,35,10,0.55)", button: "#57c137", buttonEdge: "#3f8f27", railBg: "#181818", railTile: "#fff3cf", empty: "rgba(255,255,255,0.5)", art: true, badges: true, rail: true },
  classic: { page: "linear-gradient(180deg,#7a3f12,#3d1f0a)", bar: "rgba(0,0,0,0.35)", barText: "#fff", card: "#e7cf88", cardText: "#5b3a12", panel: "rgba(60,35,10,0.55)", button: "#57c137", buttonEdge: "#3f8f27", railBg: "rgba(0,0,0,0.45)", railTile: "#fff3cf", empty: "rgba(255,255,255,0.5)", art: false, badges: true, rail: true },
  minimal: { page: "#f6f3ec", bar: "#ffffff", barText: "#272727", card: "#ffffff", cardText: "#272727", panel: "rgba(39,39,39,0.06)", button: "#272727", buttonEdge: "#000000", railBg: "#272727", railTile: "#ffffff", empty: "rgba(39,39,39,0.3)", art: false, badges: false, rail: false },
  arcade: { page: "#16122b", bar: "rgba(255,255,255,0.06)", barText: "#fff", card: "#241c45", cardText: "#ffffff", panel: "rgba(255,255,255,0.08)", button: "#d946ef", buttonEdge: "#a21caf", railBg: "rgba(255,255,255,0.05)", railTile: "#241c45", empty: "rgba(232,121,249,0.6)", art: false, badges: true, rail: true, neon: "#e879f9" },
};

/** Sample in-game items for starter offers (the real ones come from the game's catalogue). */
const STORE_ITEMS = [
  { Icon: IconCoinFilled, color: "#f5b301", q: "200,000", was: "100,000" },
  { Icon: IconDiamondFilled, color: "#3b82f6", q: "x50" },
  { Icon: IconGiftFilled, color: "#a855f7", q: "x25" },
  { Icon: IconCrownFilled, color: "#eab308", q: "x20" },
];
const RAIL = [
  { Icon: IconCoinFilled, color: "#f5b301", q: "10,000", price: "Free" },
  { Icon: IconDiamondFilled, color: "#3b82f6", q: "x50", price: "Free" },
  { Icon: IconCrownFilled, color: "#eab308", q: "x100", price: "Free" },
  { Icon: IconGiftFilled, color: "#ef4444", q: "x200", price: "$9.90" },
  { Icon: IconStarFilled, color: "#a855f7", q: "x250", price: "$12.90" },
];

/** One offer card from the template: optional title over the game's art, its items, and a price button. */
function OfferCard({
  skin,
  title,
  art,
  items,
  price,
  was,
  badge,
  webOnly,
}: {
  skin: StoreSkin;
  title?: string;
  art?: string;
  items: typeof STORE_ITEMS;
  price: string;
  was?: string;
  badge?: "best" | "ribbon";
  webOnly?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className="relative flex h-[150px] flex-col overflow-hidden rounded-[14px] shadow-md"
        style={{ background: skin.card, color: skin.cardText, boxShadow: skin.neon ? `0 0 0 2px ${skin.neon}, 0 0 18px ${skin.neon}55` : undefined }}
      >
        {art ? (
          <>
            <ShotImg src={art} className="object-[center_30%]" />
            <div className="absolute inset-0 bg-black/25" />
          </>
        ) : null}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 px-3 pt-2">
          {title ? <p className="text-[19px] font-black tracking-tight text-[#ffd84a] [text-shadow:0_2px_0_#8a3b00,0_0_6px_rgba(0,0,0,0.45)]">{title}</p> : null}
          {webOnly ? <span className="absolute top-2 right-3 rounded bg-[#f5a623] px-2 py-0.5 text-[10px] font-black text-white">WEB ONLY</span> : null}
          <div className={cn("flex items-end justify-center gap-4 rounded-[10px] px-3 py-1.5", (art || title) && "")} style={{ background: art || title ? skin.panel : undefined }}>
            {items.map((it, i) => (
              <span key={i} className="flex flex-col items-center leading-none">
                <it.Icon className="size-9 drop-shadow" style={{ color: it.color }} />
                <span className={cn("mt-1 text-[13px] font-black", art || title ? "text-white" : "")}>{it.q}</span>
                {it.was ? <span className="text-[10px] font-bold text-[#e5484d] line-through">{it.was}</span> : null}
              </span>
            ))}
          </div>
        </div>
        {badge === "ribbon" ? (
          <span className="absolute top-3 -right-7 z-10 rotate-45 bg-[#0673b2] px-8 py-0.5 text-[10px] font-black text-white shadow">+100%</span>
        ) : null}
        <div className="relative flex h-9 shrink-0 items-center justify-center gap-2 border-b-4 text-[15px] font-extrabold text-white" style={{ background: skin.button, borderColor: skin.buttonEdge }}>
          {price}
          {was ? <span className="text-[12px] text-white/60 line-through">{was}</span> : null}
        </div>
      </div>
      {badge === "best" ? (
        <span className="absolute -top-2 -left-2 flex size-12 flex-col items-center justify-center rounded-full bg-[#1b8fd8] text-center text-[10px] leading-[1.05] font-black text-white shadow ring-2 ring-white">
          Best
          <br />
          Value
        </span>
      ) : null}
    </div>
  );
}

/* ───────── Appcharge checkout, desktop (Figma "Checkout" · 8478:19551) ───────── */

const PAY_BLUE = "#448AE3";
/** The desktop checkout's design size. */
const CHECKOUT_W = 976;
const CHECKOUT_H = 871;

/** The desktop checkout, drawn at its design size and scaled down into the preview. */
function ScaledCheckout({ game, scale = 0.5 }: { game?: Game; scale?: number }) {
  return (
    <div className="shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5" style={{ width: CHECKOUT_W * scale, height: CHECKOUT_H * scale }}>
      <div style={{ width: CHECKOUT_W, height: CHECKOUT_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <CheckoutMock game={game} />
      </div>
    </div>
  );
}

/** Sample offer contents for the order summary (the real ones come from the offer). */
const CHECKOUT_ITEMS = [
  { label: "Coins", qty: "100,000", Icon: IconCoinFilled, color: "#f5b301" },
  { label: "Booster", qty: "10,000", Icon: IconCrownFilled, color: "#eab308" },
  { label: "XP", qty: "1,000", Icon: IconStarFilled, color: "#a855f7" },
];

/**
 * Appcharge's hosted checkout on desktop, after the Figma design: on the left the game and its offer (the items in
 * it, a promo code, Subtotal, Tax and Total); on the right Apple Pay, the other methods (Card, PayPal, Google Pay,
 * Other), the card form and Pay, over "Powered by appcharge". The game's own icon and name replace the sample game.
 */
function CheckoutMock({ game }: { game?: Game }) {
  const input = "flex h-10 items-center gap-2 rounded-md border border-[#e4e4e7] px-3 text-[14px] text-[#71717a]";
  const tile = "flex h-14 flex-1 items-center justify-center gap-1.5 rounded-md border text-[14px] text-[#09090b]";
  return (
    <div className="relative grid size-full grid-cols-[417px_1fr] bg-white font-sans text-[#09090b]">
      <IconX className="absolute top-6 right-6 size-5" stroke={2.5} />

      {/* The offer. */}
      <div className="flex flex-col gap-5 border-r border-[#e4e4e7] px-9 pt-14">
        <div className="flex items-center gap-3">
          {game ? <GameIcon game={game} className="size-10 rounded-lg text-[11px]" /> : <span className="size-10 rounded-lg bg-[#f4f4f5]" />}
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">Special Offer</span>
            <span className="block truncate text-[12px] text-[#71717a]">{game?.title ?? "Your game"}</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-[#f4f4f5] px-3 py-2">
          {CHECKOUT_ITEMS.map(({ label, qty, Icon, color }) => (
            <div key={label} className="flex h-11 items-center gap-3 text-[14px]">
              <Icon className="size-7" style={{ color }} />
              <span className="flex-1">{label}</span>
              <span>{qty}</span>
            </div>
          ))}
        </div>
        <p className="flex items-center gap-2 text-[14px] font-semibold underline underline-offset-2" style={{ color: PAY_BLUE }}>
          <IconTag className="size-5 text-[#09090b] no-underline" stroke={1.6} />
          Add Promo Code
        </p>
        <div className="flex flex-col gap-2.5 text-[14px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>$19.90</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (0%)</span>
            <span>$0</span>
          </div>
          <div className="flex justify-between pt-1 text-[16px] font-bold">
            <span>Total</span>
            <span>$19.90</span>
          </div>
        </div>
      </div>

      {/* Payment. */}
      <div className="flex flex-col">
        <div className="mx-auto flex w-[343px] flex-1 flex-col gap-4 pt-[60px]">
          <div className="flex h-12 items-center justify-center gap-0.5 rounded-md bg-[#09090b] text-[20px] font-medium text-white">
            <IconBrandAppleFilled className="size-5" />
            Pay
          </div>
          <div className="flex items-center gap-3 text-[14px] text-[#71717a]">
            <span className="h-px flex-1 bg-[#e4e4e7]" />
            Or pay another way
            <span className="h-px flex-1 bg-[#e4e4e7]" />
          </div>
          <div className="flex gap-2">
            <span className={tile} style={{ borderColor: PAY_BLUE, background: "#EFF6FF" }}>
              <IconCreditCard className="size-5" stroke={1.6} />
              Card
            </span>
            <span className={cn(tile, "border-[#e4e4e7] text-[14px] font-bold italic")}>
              <span className="text-[#253B80]">Pay</span>
              <span className="-ml-1.5 text-[#179BD7]">Pal</span>
            </span>
            <span className={cn(tile, "border-[#e4e4e7] text-[15px] font-medium")}>
              <span className="font-bold text-[#4285F4]">G</span>
              Pay
            </span>
            <span className={cn(tile, "border-[#e4e4e7]")}>
              <IconDots className="size-5" stroke={2.5} />
              Other
            </span>
          </div>
          <div>
            <p className="text-[16px] font-semibold">Pay with debit or credit card</p>
            <p className="mt-1 flex items-center gap-1.5 text-[14px] text-[#71717a]">
              <IconShieldCheck className="size-4" stroke={1.6} />
              Secure and encrypted
            </p>
          </div>
          <div className={input}>
            <span className="flex-1">Card Number</span>
            {["VISA", "MC", "AMEX", "DISC"].map((b) => (
              <span key={b} className="rounded border border-[#e4e4e7] px-1 text-[8px] font-bold text-[#1a1f71]">
                {b}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <div className={cn(input, "flex-1")}>MM/YY</div>
            <div className={cn(input, "flex-1")}>
              <span className="flex-1">CVC</span>
              <IconCreditCard className="size-4" stroke={1.4} />
            </div>
          </div>
          <div className={input}>
            <IconMapPin className="size-4" stroke={1.4} />
            Zip Code
          </div>
          <div className={input}>
            <IconMail className="size-4" stroke={1.4} />
            Email Address
          </div>
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="flex size-4 items-center justify-center rounded" style={{ background: PAY_BLUE }}>
              <IconCheck className="size-3 text-white" stroke={3} />
            </span>
            Save my card details for future payments
          </div>
          <div className="flex h-12 items-center justify-center rounded-md text-[16px] font-medium text-white" style={{ background: PAY_BLUE }}>
            Pay $19.90
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 border-t border-[#e4e4e7] px-10 pt-8 pb-7">
          <p className="flex items-center gap-2 text-[12px] font-medium">
            Powered by <span className="text-[26px] font-bold tracking-[-0.04em]">appcharge</span>
          </p>
          <p className="text-[11px] text-[#71717a]">Privacy Policy &nbsp;|&nbsp; Refund Policy &nbsp;|&nbsp; Support</p>
          <p className="text-center text-[11px] text-[#71717a]">
            By clicking “Pay” you indicate that you have read, understood and agree to Appcharge’s <u>EULA</u> and <u>Privacy Policy</u>
          </p>
        </div>
      </div>
    </div>
  );
}
