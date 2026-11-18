"use client";

/**
 * Environment for the session (Foldering PRD, Story 9).
 *
 * - Folder view (Company or a folder) shows Production or All sandboxes; every session starts on Production.
 * - The choice persists across tabs and scopes for the session (this module's memory: a reload starts over).
 * - Coming back from a project: from Production → Production, from any sandbox → All sandboxes.
 * - Opening a project without picking an environment uses the current one: Production → the project's Production;
 *   All sandboxes (or a sandbox of another project) → the sandbox this user last used in that project, else its oldest.
 */

import * as React from "react";
import { useSandboxes } from "@/components/dashboard/providers";
import { DEFAULT_ENV_ID, type ClientConfig, type Environment } from "@/lib/newgen";

export type FolderEnv = "production" | "sandboxes";

type State = { folderEnv: FolderEnv; lastSandbox: Record<string, string> };
let state: State = { folderEnv: "production", lastSandbox: {} };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** The Folder view selector: All production or All sandboxes. */
export function setFolderEnv(folderEnv: FolderEnv) {
  if (state.folderEnv === folderEnv) return;
  state = { ...state, folderEnv };
  emit();
}

/** Being in a project in `env` sets the session's environment type, and remembers the sandbox used there. */
export function noteProjectEnv(projectId: string, env: Environment) {
  const folderEnv: FolderEnv = env.kind === "production" ? "production" : "sandboxes";
  const lastSandbox =
    env.kind === "sandbox" && state.lastSandbox[projectId] !== env.id ? { ...state.lastSandbox, [projectId]: env.id } : state.lastSandbox;
  if (folderEnv === state.folderEnv && lastSandbox === state.lastSandbox) return;
  state = { folderEnv, lastSandbox };
  emit();
}

export function useEnvSession() {
  return React.useSyncExternalStore(subscribe, () => state, () => state);
}

/** A project's environments: the client's shared ones, then the sandboxes made in this session. */
export function useProjectEnvironments(client: ClientConfig) {
  const { byProject } = useSandboxes();
  return React.useCallback((projectId: string): Environment[] => [...client.environments, ...(byProject[projectId] ?? [])], [client, byProject]);
}

/** Where opening a project lands, when no environment was picked: per the session's environment (Story 9). */
export function useOpenEnv(client: ClientConfig) {
  const { folderEnv, lastSandbox } = useEnvSession();
  const envsOf = useProjectEnvironments(client);
  return React.useCallback(
    (projectId: string) => {
      if (folderEnv === "production") return DEFAULT_ENV_ID;
      const sandboxes = envsOf(projectId).filter((e) => e.kind === "sandbox");
      // Last used in this project, else its oldest sandbox; a project with no sandbox opens in Production.
      return sandboxes.find((e) => e.id === lastSandbox[projectId])?.id ?? sandboxes[0]?.id ?? DEFAULT_ENV_ID;
    },
    [folderEnv, lastSandbox, envsOf],
  );
}
