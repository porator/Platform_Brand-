/**
 * Folder-tree helpers for the Nested project hierarchy: lookups, roll-ups, the
 * rules (depth limit, unique names, protected delete) and immutable edits.
 * The tree itself lives on each client (`client.tree`); runtime edits are kept
 * in the dashboard providers (`useFolderTree`).
 */

import {
  MAX_FOLDER_DEPTH,
  ROOT_FOLDER_ID,
  projectDisplayLabel,
  type ClientConfig,
  type ClientId,
  type FolderNode,
  type ModuleId,
  type Project,
  type ProjectLeaf,
  type TreeNode,
} from "@/lib/newgen";

/** Folders and projects inside one parent (Foldering PRD Configuration). */
export const MAX_FOLDERS_PER_LEVEL = 50;
export const FOLDER_NAME_MAX = 50;
export const NAME_TAKEN = "A folder or project with this name already exists here";
/** The nesting limit, as an error: shown wherever a folder can be made inside one that's already level 4. */
export const TOO_DEEP = `Folders can be nested up to ${MAX_FOLDER_DEPTH} levels. Choose a folder higher up.`;

/** A tree item as one string: "f:<folder id>" or "p:<project id>". */
export const nodeKey = (n: TreeNode) => `${n.kind === "folder" ? "f" : "p"}:${n.id}`;
export const matchKey = (key: string) => (n: TreeNode) => nodeKey(n) === key;

/** Folders first, then projects; natural alphabetical order within each
 *  ("Studio 2" before "Studio 10"). */
export function sortChildren(client: ClientConfig, nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) =>
    a.kind !== b.kind
      ? a.kind === "folder"
        ? -1
        : 1
      : nodeName(client, a).localeCompare(nodeName(client, b), undefined, { numeric: true, sensitivity: "base" }),
  );
}

/** Unique among the folders AND projects at one level, case-insensitive. */
export function nameTaken(client: ClientConfig, siblings: TreeNode[], name: string, selfKey?: string): boolean {
  const n = name.trim().toLowerCase();
  return !!n && siblings.some((s) => nodeKey(s) !== selfKey && nodeName(client, s).toLowerCase() === n);
}

/** Projects under a node that hold a module (all projects when no module). */
export function matchingCount(client: ClientConfig, n: TreeNode, modulesOf: (p: Project) => ModuleId[], chip?: ModuleId | null): number {
  if (n.kind === "project") {
    const p = client.projects.find((x) => x.id === n.id);
    return !chip || (p && modulesOf(p).includes(chip)) ? 1 : 0;
  }
  return n.children.reduce((sum, c) => sum + matchingCount(client, c, modulesOf, chip), 0);
}

/** The Company root as a folder node wrapping the client's tree. */
export function rootFolder(client: ClientConfig, tree: TreeNode[]): FolderNode {
  return { kind: "folder", id: ROOT_FOLDER_ID, name: client.company.name, children: tree };
}

/** Nodes from `node` down to the first match, inclusive; null when absent. */
export function findTrail(node: TreeNode, match: (n: TreeNode) => boolean, trail: TreeNode[] = []): TreeNode[] | null {
  const here = [...trail, node];
  if (match(node)) return here;
  if (node.kind === "folder") {
    for (const c of node.children) {
      const hit = findTrail(c, match, here);
      if (hit) return hit;
    }
  }
  return null;
}

export const isFolderId = (id: string) => (n: TreeNode) => n.kind === "folder" && n.id === id;
export const isProjectId = (id: string) => (n: TreeNode) => n.kind === "project" && n.id === id;

export function leafLabel(client: ClientConfig, leaf: ProjectLeaf): string {
  const p = client.projects.find((x) => x.id === leaf.id);
  return leaf.label ?? (p ? projectDisplayLabel(client, p) : leaf.id);
}

export function nodeName(client: ClientConfig, n: TreeNode): string {
  return n.kind === "folder" ? n.name : leafLabel(client, n);
}

/** Display path for a trail, e.g. ["Product Madness", "Big Fish", "BFC Main"]. */
export function trailNames(client: ClientConfig, trail: TreeNode[]): string[] {
  return trail.map((n) => nodeName(client, n));
}

export function projectCount(n: TreeNode): number {
  if (n.kind === "project") return 1;
  return n.children.reduce((sum, c) => sum + projectCount(c), 0);
}

/** Folder levels in a folder's subtree, counting itself (a leaf folder is 1). */
export function folderHeight(f: FolderNode): number {
  const sub = f.children.filter((c): c is FolderNode => c.kind === "folder");
  return 1 + (sub.length ? Math.max(...sub.map(folderHeight)) : 0);
}

/** Every project under a folder (all sub-folders included), with its folder path. */
export function projectsIn(
  client: ClientConfig,
  f: FolderNode,
  trail: string[] = [],
): { leaf: ProjectLeaf; project: Project; path: string[] }[] {
  const here = [...trail, f.name];
  return f.children.flatMap((c) => {
    if (c.kind === "folder") return projectsIn(client, c, here);
    const project = client.projects.find((p) => p.id === c.id);
    return project ? [{ leaf: c, project, path: here }] : [];
  });
}

/** Instant search across every level. Each hit carries its parent path, so two
 *  folders with the same name stay distinguishable. */
export function searchTree(client: ClientConfig, root: FolderNode, query: string): { node: TreeNode; path: string[] }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: { node: TreeNode; path: string[] }[] = [];
  const walk = (n: TreeNode, path: string[]) => {
    if (n !== root && nodeName(client, n).toLowerCase().includes(q)) out.push({ node: n, path });
    if (n.kind === "folder") n.children.forEach((c) => walk(c, [...path, n.name]));
  };
  walk(root, []);
  return out;
}

/* ───────── Rules ───────── */

/** Unique among sibling folders, case-insensitive. Null when the name is fine. */
export function folderNameError(siblings: TreeNode[], name: string, selfId?: string): string | null {
  const n = name.trim();
  if (!n) return null;
  const clash = siblings.some((s) => s.kind === "folder" && s.id !== selfId && s.name.toLowerCase() === n.toLowerCase());
  return clash ? `A folder named ${n} already exists here` : null;
}

/** Folder depth: Company is 0, its folders 1, … up to MAX_FOLDER_DEPTH. */
export function canAddSubFolder(depth: number): boolean {
  return depth < MAX_FOLDER_DEPTH;
}

/** Delete stays off until a folder holds no projects and no sub-folders. */
export function deleteBlockedReason(f: FolderNode): string | null {
  if (!f.children.length) return null;
  const count = projectCount(f);
  return count
    ? `${f.name} still holds ${count} ${count === 1 ? "project" : "projects"}. Move or delete them first.`
    : `${f.name} still has sub-folders. Remove them first.`;
}

/* ───────── Edits (immutable) ───────── */

function transform(nodes: TreeNode[], fn: (n: TreeNode) => TreeNode | null): TreeNode[] {
  return nodes.flatMap((n) => {
    const next = n.kind === "folder" ? { ...n, children: transform(n.children, fn) } : n;
    const out = fn(next);
    return out ? [out] : [];
  });
}

export function makeFolderId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "folder";
  return `f-${slug}-${Math.random().toString(36).slice(2, 6)}`;
}

/** A folder's level in `tree` (the Company's children): its folders are 1, theirs 2, …; the Company is 0. */
function levelIn(tree: TreeNode[], id: string, level = 1): number | null {
  for (const n of tree) {
    if (n.kind !== "folder") continue;
    if (n.id === id) return level;
    const deeper = levelIn(n.children, id, level + 1);
    if (deeper !== null) return deeper;
  }
  return null;
}

export function insertFolder(tree: TreeNode[], parentId: string, f: FolderNode): TreeNode[] {
  if (parentId === ROOT_FOLDER_ID) return [...tree, f];
  // Safety net for the 4-level limit: every UI path shows TOO_DEEP first, so this should never be hit.
  if ((levelIn(tree, parentId) ?? 0) >= MAX_FOLDER_DEPTH) return tree;
  return transform(tree, (n) => (n.kind === "folder" && n.id === parentId ? { ...n, children: [...n.children, f] } : n));
}

export function renameFolder(tree: TreeNode[], id: string, name: string): TreeNode[] {
  return transform(tree, (n) => (n.kind === "folder" && n.id === id ? { ...n, name: name.trim() } : n));
}

export function removeFolder(tree: TreeNode[], id: string): TreeNode[] {
  return transform(tree, (n) => (n.kind === "folder" && n.id === id ? null : n));
}

/** Moves a folder (and everything inside it) under another folder. */
export function moveFolder(tree: TreeNode[], id: string, targetId: string): TreeNode[] {
  const wrapper: FolderNode = { kind: "folder", id: ROOT_FOLDER_ID, name: "", children: tree };
  const subject = findTrail(wrapper, isFolderId(id))?.at(-1);
  if (!subject || subject.kind !== "folder") return tree;
  return insertFolder(removeFolder(tree, id), targetId, subject);
}

/** Puts a project leaf into a folder (Company root included). */
export function insertProject(tree: TreeNode[], parentId: string, leaf: ProjectLeaf): TreeNode[] {
  if (parentId === ROOT_FOLDER_ID) return [...tree, leaf];
  return transform(tree, (n) => (n.kind === "folder" && n.id === parentId ? { ...n, children: [...n.children, leaf] } : n));
}

/** Takes a project leaf out of the tree, wherever it sits. */
export function removeProject(tree: TreeNode[], id: string): TreeNode[] {
  return transform(tree, (n) => (n.kind === "project" && n.id === id ? null : n));
}

/** Moves a folder or a project (by node key) under another folder. A moved
 *  project keeps its data; it simply rolls up into its new folder. */
export function moveNode(tree: TreeNode[], key: string, targetId: string): TreeNode[] {
  if (key.startsWith("f:")) return moveFolder(tree, key.slice(2), targetId);
  const id = key.slice(2);
  const wrapper: FolderNode = { kind: "folder", id: ROOT_FOLDER_ID, name: "", children: tree };
  const subject = findTrail(wrapper, isProjectId(id))?.at(-1);
  if (!subject || subject.kind !== "project") return tree;
  return insertProject(transform(tree, (n) => (n.kind === "project" && n.id === id ? null : n)), targetId, subject);
}

/* ───────── Access (high level — detail lives in the Permissions PRD) ───────── */

export type Role = "Admin" | "Editor" | "Viewer" | "Finance";
type Grant = { user: string; role: Role };

/** Grants per scope, keyed by folder id (Company = "root") or "p:<project id>". */
const GRANTS: Partial<Record<ClientId, Record<string, Grant[]>>> = {
  acme: {
    [ROOT_FOLDER_ID]: [
      { user: "Dana Levi", role: "Admin" },
      { user: "Lee Park", role: "Viewer" },
      { user: "Noa Bar", role: "Finance" },
    ],
    "acme-casual": [{ user: "Sam Cohen", role: "Editor" }],
    "acme-puzzle": [
      { user: "Rita Gold", role: "Admin" },
      { user: "Lee Park", role: "Editor" },
    ],
    "acme-strategy": [{ user: "Omer Tal", role: "Editor" }],
  },
  // Product Madness (returning company): folder grants, so a Move shows who gains, loses or changes access
  // (e.g. Heart of Vegas from Evergreen to Big Fish Casino).
  "product-madness": {
    [ROOT_FOLDER_ID]: [
      { user: "Dana Levi", role: "Admin" },
      { user: "Lee Park", role: "Viewer" },
      { user: "Noa Bar", role: "Finance" },
    ],
    "pm-evergreen": [
      { user: "Sam Cohen", role: "Editor" },
      { user: "Maya Stern", role: "Viewer" },
    ],
    "pm-big-fish": [
      { user: "Rita Gold", role: "Admin" },
      { user: "Lee Park", role: "Editor" },
    ],
    "pm-bfc": [{ user: "Omer Tal", role: "Editor" }],
  },
};

/* First-time fixtures: a brand-new company. Company holds the account's
 * grants; each folder the Admin creates gives its creator Admin on it
 * (Foldering PRD, Story 2), and new projects inherit their folder's access
 * (Project Lifecycle PRD), so they carry no grants of their own. */
const FT_COMPANY: Grant[] = [
  { user: "Dana Levi", role: "Admin" },
  { user: "Lee Park", role: "Viewer" },
  { user: "Noa Bar", role: "Finance" },
];
const FT_CREATOR: Grant[] = [{ user: "Dana Levi", role: "Admin" }];
const FT_FOLDERS: Record<string, string[]> = {
  "acme-ft": [],
  "acme-ft-l1": ["ft-casual"],
  "acme-ft-l1b": ["ft-casual", "ft-strategy"],
  "acme-ft-l2": ["ft-casual", "ft-strategy", "ft-puzzle"],
  "acme-ft-p1": ["ft-casual", "ft-strategy", "ft-puzzle"],
  "acme-ft-tree": ["ft-casual", "ft-strategy", "ft-puzzle"],
};
for (const [id, folders] of Object.entries(FT_FOLDERS)) {
  GRANTS[id as ClientId] = { [ROOT_FOLDER_ID]: FT_COMPANY, ...Object.fromEntries(folders.map((f) => [f, FT_CREATOR])) };
}
GRANTS["acme-ft-empty"] = { [ROOT_FOLDER_ID]: FT_COMPANY };

export type Access = { user: string; role: Role; source: string; direct: boolean };

/** Who has access at the end of a trail: grants inherit down, the closest grant
 *  wins, and an inherited Admin can't be overridden. */
export function effectiveAccess(client: ClientConfig, trail: TreeNode[]): Access[] {
  const grants = GRANTS[client.id] ?? {};
  const out = new Map<string, Access>();
  trail.forEach((n, i) => {
    const key = n.kind === "folder" ? n.id : nodeKey(n);
    for (const g of grants[key] ?? []) {
      if (out.get(g.user)?.role === "Admin") continue;
      out.set(g.user, { user: g.user, role: g.role, source: nodeName(client, n), direct: i === trail.length - 1 });
    }
  });
  return [...out.values()];
}

/** One person's access change on a move. `why` is the folder the deciding grant sits on: before the move for "loses",
 *  after it for "gains" and "role" (the closest grant decides the role). */
export type AccessChange = { user: string; change: "gains" | "loses" | "role"; from?: Role; to?: Role; why?: string };

/** Per-user access impact of moving `subject` from one parent trail to another. */
export function accessImpact(client: ClientConfig, fromTrail: TreeNode[], toTrail: TreeNode[], subject: TreeNode): AccessChange[] {
  const before = new Map(effectiveAccess(client, [...fromTrail, subject]).map((a) => [a.user, a]));
  const after = new Map(effectiveAccess(client, [...toTrail, subject]).map((a) => [a.user, a]));
  const users = [...new Set([...before.keys(), ...after.keys()])];
  return users.flatMap((user): AccessChange[] => {
    const a = before.get(user);
    const b = after.get(user);
    if (a && !b) return [{ user, change: "loses", from: a.role, why: a.source }];
    if (!a && b) return [{ user, change: "gains", to: b.role, why: b.source }];
    if (a && b && a.role !== b.role) return [{ user, change: "role", from: a.role, to: b.role, why: b.source }];
    return [];
  });
}
