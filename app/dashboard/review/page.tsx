"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowRight, IconEye } from "@/lib/icons";
import { useDemo, useFolderTree, useSandboxes } from "@/components/dashboard/providers";
import { companyHref, getClient, projectHref, ROOT_FOLDER_ID, type FolderNode, type ModuleId, type Project, type TreeNode } from "@/lib/newgen";
import { findTrail, insertFolder, insertProject, isFolderId, isProjectId } from "@/lib/folders";
import { cn } from "@/lib/utils";

/**
 * Review: every change from the Test 01 design tasks, each with a link that opens the exact screen. The link first sets
 * up the demo data that screen needs (a "Casino" folder, Heart of Vegas Store at the top level, Lightning Link Store
 * in Casino with two modules, extra sandboxes), then navigates there inside the same session, so nothing resets.
 * `/dashboard/review?go=<id>` does the same straight from outside (chat, a doc).
 */

// The review links stage the first-time usability test's company (empty until staged), not the default one.
const client = getClient("acme-ft-empty");
const HOV = "rv-hov";
const LL = "rv-ll";
const CASINO = "rv-casino";
const PUZZLE = "rv-puzzle";

type Setup = "empty" | "seed" | "sandboxes";
type Change = { id: string; ref: string; title: string; look: string; setup: Setup; href: string };

const q = (params: Record<string, string>) => `/dashboard/create-project?${new URLSearchParams({ client: client.id, from: ROOT_FOLDER_ID, ...params })}`;
const home = (extra = "") => `${companyHref(client.id, "home")}${extra}`;

const CHANGES: { group: string; items: Change[] }[] = [
  {
    group: "Quick wins",
    items: [
      { id: "r11", ref: "R11", title: "Create project doesn’t reopen", look: "Open Create project, close it with a folder click in the sidebar, then come back to Home: the wizard stays closed.", setup: "seed", href: home() },
      { id: "r12", ref: "R12", title: "Folders first on the empty Home", look: "“Start by organizing your company” with New folder next to Create project.", setup: "empty", href: home() },
      { id: "r6", ref: "R6", title: "Where a new folder goes", look: "Under Location, nothing until a folder is too deep: then a red error (path preview removed).", setup: "empty", href: home("?panel=new-folder&parent=root&name=Puzzle%20games") },
      { id: "r14-top", ref: "R14", title: "The top level, named", look: "“King”, with its logo, as the first Location in New folder (and in Move to).", setup: "seed", href: home("?panel=new-folder") },
      { id: "r14-move", ref: "R14", title: "Move N projects here", look: "Click Create folder: the toast offers “Move 1 project here” (Heart of Vegas Store sits at the top level). Click it for the dialog.", setup: "seed", href: home("?panel=new-folder&parent=root&name=Slots") },
      { id: "r15-near", ref: "R15", title: "Misspelled game name", look: "“Hart of Vegas”: App Store games under “Did you mean one of these?”, plus “Did you mean Heart of Vegas? It’s already in your company.”", setup: "seed", href: q({ q: "Hart of Vegas" }) },
      { id: "r15-company", ref: "R15", title: "Typo of a company game", look: "“Lightnig Link” → “Did you mean Lightning Link?” under the field.", setup: "seed", href: q({ q: "Lightnig Link" }) },
      { id: "r15-none", ref: "R15", title: "No match is never created silently", look: "“No App Store game matches …”: Continue stays off until “It’s not on the App Store” is picked.", setup: "seed", href: q({ q: "Zqxw Blastoid" }) },
      { id: "r15-name", ref: "R15", title: "Why the name starts with the game", look: "The hint under Project name.", setup: "seed", href: q({ q: "Heart of Vegas", step: "2" }) },
      { id: "r16-checklist", ref: "R16", title: "Checklist: shared steps once", look: "“Shared by Webstore and Payment Links · Set up once” at the top; each module lists only its own steps.", setup: "seed", href: `${projectHref(LL, "home", "production")}?panel=checklist` },
      { id: "r16-clone", ref: "R16", title: "Clone search keeps your pick", look: "Type something in Search projects: Heart of Vegas Store (picked) stays in the list.", setup: "seed", href: q({ step: "clone", clone: HOV }) },
      { id: "r16-logo", ref: "R16", title: "Logo no longer opens a selector over the sidebar", look: "Point at and click the Appcharge mark, top-left: it goes to Home, no flyout.", setup: "seed", href: projectHref(LL, "home", "production") },
      { id: "r16-store", ref: "R16", title: "Preview store", look: "On “Your project is ready”, click Preview store.", setup: "seed", href: q({ q: "Heart of Vegas", step: "done" }) },
    ],
  },
  {
    group: "Structural changes",
    items: [
      { id: "r17", ref: "R17", title: "+ Add module where people look", look: "“Add module” in the project sidebar under the sections, and on the project Home next to Modules.", setup: "seed", href: projectHref(HOV, "home", "production") },
      { id: "r18-label", ref: "R18", title: "“Folders & projects” in the sidebar", look: "The tree’s heading, with Search, the bigger view and + (New folder, New project).", setup: "seed", href: home() },
      { id: "r18-home", ref: "R18", title: "Picking a folder lands on its Home", look: "Pick Casino in the sidebar tree (from any page): you land on Casino’s Home.", setup: "seed", href: projectHref(LL, "adm-modules", "production") },
      { id: "r18-tree", ref: "R18", title: "One point of navigation: the sidebar tree", look: "Folders and projects are switched and managed only from “Folders & projects” in the sidebar (⋯ per row: Rename, Move, Who has access…); the top bar just names where you are.", setup: "seed", href: projectHref(LL, "home", "production") },
      { id: "r19", ref: "R19", title: "AI guardrails", look: "In Ask AI try: “create a folder called Puzzle games”, “create a project for my new puzzle game”, “add Payment Links”.", setup: "seed", href: projectHref(HOV, "home", "production") },
      { id: "r20", ref: "R20", title: "Land in the project with next steps", look: "Preview store, Setup checklist, Add module, Move to folder; where it lives; its modules.", setup: "seed", href: `${projectHref(HOV, "home", "production")}?welcome=1` },
      { id: "r3", ref: "R3", title: "“How do you want to sell?”", look: "The clearer question, and that each module goes to Production and every sandbox.", setup: "seed", href: q({ q: "Heart of Vegas", step: "modules" }) },
      { id: "r22", ref: "R22", title: "A colour per environment", look: "The amber Sandbox QA banner; open the environment menu to see each sandbox’s colour.", setup: "sandboxes", href: `${projectHref(HOV, "home", "production")}?env=rv-sandbox-qa` },
      { id: "r8", ref: "R8", title: "Move to folder", look: "From and To filled in, with the access note, before anything moves.", setup: "seed", href: `${projectHref(HOV, "home", "production")}?panel=move&item=p:${HOV}` },
    ],
  },
  {
    group: "Direct Checkout (Module Management PRD)",
    items: [
      { id: "dc-add", ref: "PRD", title: "Add Direct Checkout", look: "Administration › Module management, with the confirmation open: added to Production and all sandboxes, can’t be removed. Confirm it to see the toast.", setup: "seed", href: `${projectHref(LL, "adm-modules", "production")}?dialog=add-module&module=direct-checkout` },
      { id: "dc-timeline", ref: "Confluence", title: "Direct Checkout onboarding plan", look: "A dialog like Create project: 7 steps on the left (step 3 is current until the checklist is done), the chosen step on the right. From project Home › View plan.", setup: "seed", href: `${projectHref(HOV, "home", "production")}?added=direct-checkout&onboarding=1` },
      { id: "dc-checklist", ref: "PRD", title: "Direct Checkout go-live steps", look: "The setup checklist: request signing and awarding (shared), then Checkout Session API and the Direct Checkout domain; Setting up · 0/4 until done.", setup: "seed", href: `${projectHref(HOV, "adm-modules", "production")}?added=direct-checkout&panel=checklist` },
    ],
  },
  {
    group: "Your requests",
    items: [
      { id: "search", ref: "Search", title: "Compact search", look: "Top-right: an icon and ⌘K. Typing happens in the dialog it opens.", setup: "seed", href: projectHref(LL, "adm-modules", "production") },
      { id: "title", ref: "Title", title: "Page title lower in the workspace", look: "48px between the top bar and the page title.", setup: "seed", href: projectHref(LL, "adm-modules", "production") },
      { id: "folder-menu", ref: "Folder", title: "Rename and delete a new folder from the dropdown", look: "Open the Folder dropdown: “Puzzle games” (made in this run) has a pencil and a bin. Delete offers Undo.", setup: "seed", href: q({ q: "Heart of Vegas", step: "2", folder: PUZZLE, made: PUZZLE }) },
      { id: "dots", ref: "⋯", title: "⋯ on every row", look: "Point at (or tab to) a folder or project in the sidebar tree: its ⋯ opens the row’s actions.", setup: "seed", href: home() },
    ],
  },
];

const ALL = CHANGES.flatMap((g) => g.items);

/** Sets up what a change's screen needs, in this session's memory, and returns where to go. */
function useStage() {
  const { edit } = useFolderTree(client);
  const demo = useDemo();
  const sandboxes = useSandboxes();

  return (c: Change) => {
    if (c.setup === "empty") {
      demo.reset();
      return;
    }
    // Projects modelled on the company's prepared one (like Create project does).
    const target = client.projects.find((p) => p.pending);
    const make = (id: string, game: string, initials: string, modules: ModuleId[]): Project => ({
      ...(target as Project),
      id,
      pending: undefined,
      pendingIn: undefined,
      status: undefined,
      game,
      gameInitials: initials,
      project: `${game} Store`,
      modules,
      productionStoreUrl: `https://${game.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.store.appcharge.com/`,
    });
    const seeds = [make(HOV, "Heart of Vegas", "HV", ["webstore"]), make(LL, "Lightning Link", "LL", ["webstore", "payment-links"])];
    seeds.forEach((p) => {
      if (!client.projects.some((x) => x.id === p.id)) client.projects.push(p);
    });
    const has = (t: TreeNode[], match: (n: TreeNode) => boolean) => !!findTrail({ kind: "folder", id: ROOT_FOLDER_ID, name: "", children: t } as FolderNode, match);
    edit((t) => {
      let n = t;
      if (!has(n, isFolderId(CASINO))) n = insertFolder(n, ROOT_FOLDER_ID, { kind: "folder", id: CASINO, name: "Casino", children: [] });
      if (!has(n, isFolderId(PUZZLE))) n = insertFolder(n, ROOT_FOLDER_ID, { kind: "folder", id: PUZZLE, name: "Puzzle games", children: [] });
      if (!has(n, isProjectId(HOV))) n = insertProject(n, ROOT_FOLDER_ID, { kind: "project", id: HOV, label: "Heart of Vegas Store" });
      if (!has(n, isProjectId(LL))) n = insertProject(n, CASINO, { kind: "project", id: LL, label: "Lightning Link Store" });
      return n;
    });
    demo.set((s) => ({ ...s, createdModules: { ...s.createdModules, [HOV]: s.createdModules[HOV] ?? ["webstore"], [LL]: s.createdModules[LL] ?? ["webstore", "payment-links"] } }));
    if (c.setup === "sandboxes") {
      const have = sandboxes.byProject[HOV] ?? [];
      if (!have.some((e) => e.id === "rv-sandbox-qa")) sandboxes.add(HOV, { id: "rv-sandbox-qa", name: "Sandbox QA", kind: "sandbox", color: "#d97706" });
      if (!have.some((e) => e.id === "rv-sandbox-events")) sandboxes.add(HOV, { id: "rv-sandbox-events", name: "Sandbox Events", kind: "sandbox", color: "#7c3aed" });
    }
  };
}

export default function ReviewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const stage = useStage();
  const open = (c: Change) => {
    stage(c);
    // Let the staged state land before the target page reads it.
    window.setTimeout(() => router.push(c.href), 0);
  };

  // ?go=<id>: straight to that change.
  const go = params.get("go");
  const went = React.useRef(false);
  React.useEffect(() => {
    const c = ALL.find((x) => x.id === go);
    if (!c || went.current) return;
    went.current = true;
    stage(c);
    window.setTimeout(() => router.replace(c.href), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go]);

  if (go && ALL.some((x) => x.id === go)) {
    return <p className="p-10 text-sm text-muted-foreground">Opening…</p>;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <IconEye className="size-4" />
        Review
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Changes from Usability Test 01</h1>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Each link opens the screen where the change is, with sample data set up for it: Casino and Puzzle games folders, Heart of Vegas Store at the top level, and
        Lightning Link Store (Webstore + Payment Links) in Casino. Come back here with your browser’s Back button.
      </p>
      {CHANGES.map((g) => (
        <section key={g.group} className="mt-10">
          <h2 className="text-sm font-medium text-muted-foreground">{g.group}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {g.items.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c)}
                  className={cn("group flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50")}
                >
                  <span className="mt-0.5 w-14 shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-center text-xs font-medium text-muted-foreground">{c.ref}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-foreground">{c.title}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{c.look}</span>
                  </span>
                  <IconArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
