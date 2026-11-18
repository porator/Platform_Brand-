"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { baseModules, type ClientConfig, type ClientId, type Environment, type ModuleId, type Project, type TreeNode } from "@/lib/newgen";
import { rootFolder } from "@/lib/folders";

/* ---------------------------------------------------------------------------
 * PRD walkthrough state, in memory like the folder edits: modules added to a
 * project (Module Management), go-live steps ticked in the setup checklist,
 * modules created with a new project (Project Lifecycle), the pinned default
 * view, and which user flow is active — with the last screen of each, so
 * switching flows never restarts one.
 * ------------------------------------------------------------------------- */
export type FlowId = "org" | "project" | "module";
/** The two versions of each flow: a first-time Publisher, or a returning one. */
export type FlowMode = "first" | "returning";
/** Where each version of each flow was left, e.g. "first:org". */
export const flowKey = (mode: FlowMode, id: FlowId) => `${mode}:${id}`;
type DemoState = {
  /** Modules a project was created with (overrides its seed modules). */
  createdModules: Record<string, ModuleId[]>;
  /** Modules added later from Module management. */
  added: Record<string, ModuleId[]>;
  /** Checklist step ids done, per project. */
  done: Record<string, string[]>;
  pinned: string | null;
  activeFlow: FlowId;
  /** First time or Returning. Each keeps its own place per flow. */
  mode: FlowMode;
  lastHref: Record<string, string>;
  guideHidden: boolean;
};
const INITIAL_DEMO: DemoState = { createdModules: {}, added: {}, done: {}, pinned: null, activeFlow: "org", mode: "returning", lastHref: {}, guideHidden: false };
type DemoCtx = DemoState & { set: (fn: (s: DemoState) => DemoState) => void; reset: () => void };
const DemoContext = React.createContext<DemoCtx>({ ...INITIAL_DEMO, set: () => {}, reset: () => {} });
export function useDemo() {
  return React.useContext(DemoContext);
}

/** A project's modules right now: what it was created with, plus any added. */
export function useProjectModules(project: Project) {
  const { createdModules, added, set } = useDemo();
  const base = createdModules[project.id] ?? baseModules(project);
  const extra = (added[project.id] ?? []).filter((m) => !base.includes(m));
  return {
    modules: [...base, ...extra],
    added: extra,
    add: (m: ModuleId) =>
      set((s) => ({ ...s, added: { ...s.added, [project.id]: [...new Set([...(s.added[project.id] ?? []), m])] } })),
  };
}

/* ---------------------------------------------------------------------------
 * Folder trees edited at runtime (create / rename / move / delete in the
 * selector). Per client, in memory — like sandboxes, it survives client-side
 * navigation and resets on a full reload. Untouched clients use client.tree.
 * ------------------------------------------------------------------------- */
type FolderTreeCtx = {
  trees: Partial<Record<ClientId, TreeNode[]>>;
  update: (client: ClientConfig, edit: (tree: TreeNode[]) => TreeNode[]) => void;
};
const FolderTreeContext = React.createContext<FolderTreeCtx>({ trees: {}, update: () => {} });
export function useFolderTree(client: ClientConfig) {
  const { trees, update } = React.useContext(FolderTreeContext);
  const tree = trees[client.id] ?? client.tree;
  return {
    tree,
    root: rootFolder(client, tree),
    edit: (fn: (tree: TreeNode[]) => TreeNode[]) => update(client, fn),
  };
}

/* ---------------------------------------------------------------------------
 * Sandboxes created at runtime (the "+ Create sandbox" flow). Kept per project,
 * in memory — survives client-side navigation within the dashboard, resets on a
 * full reload (fine for a review prototype).
 * ------------------------------------------------------------------------- */
type SandboxCtx = { byProject: Record<string, Environment[]>; add: (projectId: string, env: Environment) => void };
const SandboxContext = React.createContext<SandboxCtx>({ byProject: {}, add: () => {} });
export function useSandboxes() {
  return React.useContext(SandboxContext);
}

/* ---------------------------------------------------------------------------
 * Wireframe mode — a presentation toggle. When on, the dashboard strips to a
 * low-fidelity skin (placeholder content, neutralised colour) so a client
 * reviews the navigation *flow* rather than the visual design or the data.
 * State lives in the dashboard layout, so it persists across route changes.
 * ------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
 * Theme — every load opens in light mode. Dark is a per-session toggle (Review
 * tools › Dark mode), never saved, so like wireframe mode it resets on reload.
 * ------------------------------------------------------------------------- */
type ThemeModeCtx = { dark: boolean; setDark: (dark: boolean) => void };
const ThemeModeContext = React.createContext<ThemeModeCtx>({ dark: false, setDark: () => {} });
export function useThemeMode() {
  return React.useContext(ThemeModeContext);
}

type WireframeCtx = { wireframe: boolean; toggle: () => void };
const WireframeContext = React.createContext<WireframeCtx>({ wireframe: false, toggle: () => {} });
export function useWireframe() {
  return React.useContext(WireframeContext);
}

/* ---------------------------------------------------------------------------
 * Launch plan — unlocks once the store is set up (the "Create" wizard finishes,
 * i.e. Step 0). After that the launch-plan panel and its sidebar indicator are
 * available; `context` labels the store it belongs to.
 * ------------------------------------------------------------------------- */
type LaunchCtx = {
  started: boolean;
  open: boolean;
  context: string;
  setOpen: (open: boolean) => void;
  start: (context: string) => void;
};
const LaunchContext = React.createContext<LaunchCtx>({
  started: false,
  open: false,
  context: "",
  setOpen: () => {},
  start: () => {},
});
export function useLaunchPlan() {
  return React.useContext(LaunchContext);
}

/** App-level providers for the dashboard: theming (class-based, keyed by the
 *  design-system tokens), tooltips, toasts and wireframe mode. */
export function DashboardProviders({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = React.useState(false);
  const themeValue = React.useMemo<ThemeModeCtx>(() => ({ dark, setDark }), [dark]);

  const [wireframe, setWireframe] = React.useState(true);
  const wireframeValue = React.useMemo<WireframeCtx>(
    () => ({ wireframe, toggle: () => setWireframe((v) => !v) }),
    [wireframe],
  );

  const [byProject, setByProject] = React.useState<Record<string, Environment[]>>({});
  const sandboxValue = React.useMemo<SandboxCtx>(
    () => ({
      byProject,
      add: (projectId, env) =>
        setByProject((prev) => ({ ...prev, [projectId]: [...(prev[projectId] ?? []), env] })),
    }),
    [byProject],
  );

  const [trees, setTrees] = React.useState<Partial<Record<ClientId, TreeNode[]>>>({});
  const folderValue = React.useMemo<FolderTreeCtx>(
    () => ({
      trees,
      update: (client, edit) => setTrees((prev) => ({ ...prev, [client.id]: edit(prev[client.id] ?? client.tree) })),
    }),
    [trees],
  );

  const [demo, setDemo] = React.useState<DemoState>(INITIAL_DEMO);
  const demoValue = React.useMemo<DemoCtx>(
    () => ({
      ...demo,
      set: setDemo,
      // Start the walkthrough over: tree edits and module changes are undone.
      reset: () => {
        setDemo((s) => ({ ...INITIAL_DEMO, activeFlow: s.activeFlow, mode: s.mode }));
        setTrees({});
      },
    }),
    [demo],
  );

  const [launch, setLaunch] = React.useState({ started: false, open: false, context: "" });
  const launchValue = React.useMemo<LaunchCtx>(
    () => ({
      ...launch,
      setOpen: (open) => setLaunch((prev) => ({ ...prev, open })),
      start: (context) => setLaunch({ started: true, open: true, context }),
    }),
    [launch],
  );

  return (
    // Usability test: always light, so no next-themes (its inline <script> set off a React dev warning participants could see).
    <>
      <ThemeModeContext.Provider value={themeValue}>
      <TooltipProvider>
        <WireframeContext.Provider value={wireframeValue}>
          <SandboxContext.Provider value={sandboxValue}>
            <FolderTreeContext.Provider value={folderValue}>
              <DemoContext.Provider value={demoValue}>
                <LaunchContext.Provider value={launchValue}>
                  {children}
                  <Toaster />
                </LaunchContext.Provider>
              </DemoContext.Provider>
            </FolderTreeContext.Provider>
          </SandboxContext.Provider>
        </WireframeContext.Provider>
      </TooltipProvider>
      </ThemeModeContext.Provider>
    </>
  );
}
