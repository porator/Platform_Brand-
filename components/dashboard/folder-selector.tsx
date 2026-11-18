"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsExchange,
  IconShieldCheck,
  IconUserMinus,
  IconUserPlus,
  IconCheck,
  IconUsers,
  IconFolderFilled,
  IconAlertCircle,
  IconFolderPlus,
  IconFolderOpen,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanyLogo } from "@/components/dashboard/logo";
import { ProjectChip } from "@/components/dashboard/project-bits";
import { isGuideEvent } from "@/components/dashboard/flow-guide";
import { MAX_FOLDER_DEPTH, ROOT_FOLDER_ID, type ClientConfig, type FolderNode } from "@/lib/newgen";
import {
  FOLDER_NAME_MAX,
  MAX_FOLDERS_PER_LEVEL,
  NAME_TAKEN,
  TOO_DEEP,
  accessImpact,
  type AccessChange,
  effectiveAccess,
  findTrail,
  folderHeight,
  isFolderId,
  matchKey,
  nameTaken,
  nodeName,
  sortChildren,
} from "@/lib/folders";

export type SelectorLocation = { kind: "folder" | "project"; id: string };

/** The Move dialog's folder rows step in by this much per level. */
const ROW_INDENT = 14;

/* ───────── Folder actions (hosted by the sidebar tree, SidebarFolderTree) ─────────
 * The sidebar's "Folders & projects" tree is the only place folders and projects are navigated and managed. What it
 * shows beyond the tree (New folder, a row's ⋯ menu or rename box, Move / Who has access / Delete, the bigger view)
 * is kept in the URL, so every screen of the Foldering flow has an address (onboarding, Ask AI, the empty Home's New
 * folder and the review page link straight to them). The panels and dialogs below are shared by it. */

/** `item` is a node key ("f:<id>" / "p:<id>"). `expand: "all"` opens with every folder expanded. `fresh` is a node key
 *  just created elsewhere (onboarding's new project): its path opens and its row is spotlit. */
export type Ui = { panel: string | null; item?: string; parent?: string; to?: string; q?: string; chip?: string; name?: string; expand?: string; fresh?: string };
const UI_KEYS = ["panel", "item", "parent", "to", "q", "chip", "name", "expand", "fresh"] as const;
/** "locations" was the old popover's tree; the sidebar tree is always there, so it only carries `q` / `expand` / `fresh`. */
const SELECTOR_PANELS = ["locations", "new-folder", "menu", "rename", "move", "access", "delete", "browse"];

/** The folder actions' state, read from and written to the URL (other `?panel=` values, e.g. the checklist, are left alone). */
export function useSelectorUi(): [Ui, (next: Ui | null) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const panel = params.get("panel");
  const ui: Ui = SELECTOR_PANELS.includes(panel ?? "")
    ? Object.fromEntries(UI_KEYS.map((k) => [k, params.get(k) ?? undefined])) as Ui
    : { panel: null };
  const set = (next: Ui | null) => {
    const p = new URLSearchParams(params.toString());
    // Only clear the keys this owns when it owns the panel (so a checklist panel isn't closed by clearing a search).
    if (SELECTOR_PANELS.includes(p.get("panel") ?? "") || next) UI_KEYS.forEach((k) => p.delete(k));
    if (next) UI_KEYS.forEach((k) => next[k] && p.set(k, next[k]!));
    const q = p.toString();
    router.replace(`${pathname}${q ? `?${q}` : ""}`, { scroll: false });
  };
  return [ui, set];
}

/** The Delete folder confirmation. */
export function DeleteFolderDialog({ name, open, onClose, onDelete }: { name: string; open: boolean; onClose: () => void; onDelete: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o, d) => !o && !isGuideEvent(d) && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>Grants set on this folder will be removed.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button variant="destructive" onClick={onDelete}>
            Delete folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


/** Rename in place (Foldering PRD, Story 3): same validation as Create. The
 *  error shows as the input's tooltip and border, keeping the row height. */
export function RenameBox({
  initial,
  error,
  onCommit,
  onCancel,
}: {
  initial: string;
  error: (value: string) => string | null;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = React.useState(initial);
  const message = error(value);
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit(value);
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancel();
        }
      }}
      onBlur={() => (message ? onCancel() : onCommit(value))}
      aria-label="Folder name"
      aria-invalid={!!message}
      title={message ?? undefined}
      className={cn(
        "h-6 min-w-0 flex-1 rounded border bg-background px-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        message ? "border-destructive" : "border-input",
      )}
    />
  );
}

/* ───────── Create new folder ───────── */

/** The "Create new folder" panel (Foldering PRD, Story 2): in a dialog from the sidebar tree, or over the bigger view.
 *  Without `onBack` it has no back arrow (nothing to go back to). */
export function NewFolderPanel({
  client,
  root,
  defaultParent,
  initialName,
  onBack,
  onCancel,
  onCreate,
}: {
  client: ClientConfig;
  root: FolderNode;
  defaultParent: string;
  initialName: string;
  onBack?: () => void;
  onCancel: () => void;
  onCreate: (parentId: string, name: string) => void;
}) {
  const options = folderOptions(client, root);
  // A folder already 4 levels deep can still be the default (New sub-folder on it): the form then shows why it can't.
  const startParent = options.find((o) => o.id === defaultParent && (!o.blocked || o.tooDeep))?.id ?? ROOT_FOLDER_ID;
  // Remounted per default parent (keyed by the host), so the state starts right.
  const [parentId, setParentId] = React.useState(startParent);
  const [name, setName] = React.useState(initialName);
  // Once created, the new folder is in the tree under this very name: don't flash "name taken" while the panel closes
  // (R16 · V-13).
  const [created, setCreated] = React.useState(false);

  const parent = findTrail(root, isFolderId(parentId))?.at(-1) as FolderNode | undefined;
  const trimmed = name.trim();
  const error = created
    ? null
    : trimmed.length > FOLDER_NAME_MAX
      ? `Use up to ${FOLDER_NAME_MAX} characters`
      : parent && nameTaken(client, parent.children, trimmed)
        ? NAME_TAKEN
        : null;
  const submit = () => {
    if (!trimmed || error || tooDeep || created) return;
    setCreated(true);
    onCreate(parentId, trimmed);
  };
  // Too deep: a folder inside this one would be level 5. Shown as an error on Location, and Create is off.
  const tooDeep = !!options.find((o) => o.id === parentId)?.tooDeep;

  return (
    <div className="flex flex-col">
      <div className={cn("flex items-center gap-1 border-b border-border py-1.5", onBack ? "px-1.5" : "h-10 px-3")}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
          </button>
        ) : null}
        <span className="text-sm font-semibold">Create new folder</span>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Folder name"
            aria-invalid={!!error}
            className={cn(
              "h-8 rounded-md border bg-background px-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              error ? "border-destructive" : "border-input",
            )}
          />
          {error ? <span className="text-xs font-normal text-destructive">{error}</span> : null}
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-medium">
          Location
          <Select items={Object.fromEntries(options.map((o) => [o.id, o.path]))} value={parentId} onValueChange={(v) => v && setParentId(String(v))}>
            <SelectTrigger
              size="sm"
              aria-label="Location"
              aria-invalid={tooDeep}
              aria-describedby={tooDeep ? "new-folder-location-error" : undefined}
              className={cn("w-full justify-start gap-2 font-normal", tooDeep && "border-destructive ring-3 ring-destructive/15")}
            >
              {/* The organization shows as its logo, a folder as a folder (as in Create project's folder picker). */}
              <LocationIcon client={client} top={parentId === root.id} />
              <SelectValue className="min-w-0 flex-1 truncate text-left" />
            </SelectTrigger>
            {/* p-1: rows sit 4px in from the list's edge, so the chosen row's tint doesn't run into its border. */}
            <SelectContent alignItemWithTrigger={false} className="p-1">
              {options.map((o) => (
                // Folders already 4 levels deep stay pickable: choosing one shows the error below.
                // The list shows the nesting: each folder indented under its parent, by its own name (the field keeps the path).
                <SelectItem
                  key={o.id}
                  value={o.id}
                  disabled={!!o.blocked && !o.tooDeep}
                  title={o.path}
                  style={{ paddingLeft: 8 + o.depth * LOCATION_INDENT }}
                  // [&>div]:items-center: the icon sits centred on the name's line (the item text is a flex row).
                  className={cn("pr-2 [&>div]:items-center", LOCATION_SELECTED)}
                >
                  <LocationIcon client={client} top={o.depth === 0} inList />
                  {o.path.split(" / ").at(-1)}
                  {o.blocked && !o.tooDeep ? <span className="text-xs text-muted-foreground">({o.blocked})</span> : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tooDeep ? (
            // The nesting limit, only when it's hit: an error in place of the path preview.
            <span id="new-folder-location-error" role="alert" className="flex items-start gap-1.5 text-xs font-normal text-destructive">
              <IconAlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              <span>
                {TOO_DEEP}
              </span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end gap-1.5 border-t border-border p-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={!trimmed || !!error || tooDeep}>
          Create folder
        </Button>
      </div>
    </div>
  );
}

/** Location lists indent each folder level by this much, so a folder sits under its parent. */
export const LOCATION_INDENT = 16;

/** A destination's icon in the Location picker: the organization's logo at the top level, otherwise a folder. */
function LocationIcon({ client, top, inList }: { client: ClientConfig; top: boolean; inList?: boolean }) {
  if (top) return <CompanyLogo clientId={client.id} className="row-logo size-4 shrink-0 rounded-[4px]" />;
  // In the list, a folder carries both icons: the chosen one shows the blue open folder (LOCATION_SELECTED).
  return inList ? (
    <>
      <IconFolderFilled className="row-closed size-4 shrink-0 text-muted-foreground" aria-hidden />
      <IconFolderOpen className="row-open hidden size-4 shrink-0 text-info" aria-hidden />
    </>
  ) : (
    <IconFolderFilled className="size-4 shrink-0 text-muted-foreground" aria-hidden />
  );
}

/** The chosen folder in a Location list: a light blue row, a blue open folder (a ring round the company's logo) and a
 *  medium-weight name, in place of a checkmark at the row's edge. Hover stays grey, so it never looks chosen. */
export const LOCATION_SELECTED =
  "[&>span:last-child]:hidden data-[selected]:bg-info/10 data-[selected]:font-medium data-[selected]:focus:bg-info/15 data-[selected]:[&_.row-closed]:hidden data-[selected]:[&_.row-open]:block data-[selected]:[&_.row-logo]:ring-2 data-[selected]:[&_.row-logo]:ring-info data-[selected]:[&_.row-logo]:ring-offset-1";

/** Every folder as a destination, with its full path; folders at level 4 or
 *  already holding 50 folders can't take another. */
export function folderOptions(client: ClientConfig, root: FolderNode) {
  const out: { id: string; path: string; depth: number; blocked?: string; tooDeep?: boolean }[] = [];
  const walk = (f: FolderNode, path: string[], depth: number) => {
    const here = [...path, f.name];
    const subFolders = f.children.filter((c) => c.kind === "folder").length;
    out.push({
      id: f.id,
      // The company is the first choice in every folder picker, shown by its name and logo alone.
      path: here.join(" / "),
      depth,
      tooDeep: depth >= MAX_FOLDER_DEPTH,
      blocked: depth >= MAX_FOLDER_DEPTH ? `level ${MAX_FOLDER_DEPTH}` : subFolders >= MAX_FOLDERS_PER_LEVEL ? `${MAX_FOLDERS_PER_LEVEL} folders` : undefined,
    });
    sortChildren(client, f.children).forEach((c) => c.kind === "folder" && walk(c, here, depth + 1));
  };
  walk(root, [], 0);
  return out;
}

/** R14: after a folder is made, move the projects still at the top level into it, in one go. Every project starts
 *  ticked; nobody's access changes, since the new folder sits inside the company and has no grants of its own. */
export function BulkMoveDialog({
  client,
  root,
  folderId,
  onClose,
  onMove,
}: {
  client: ClientConfig;
  root: FolderNode;
  folderId: string | null;
  onClose: () => void;
  onMove: (projectIds: string[], to: string) => void;
}) {
  const loose = root.children.filter((c) => c.kind === "project");
  const [skip, setSkip] = React.useState<string[]>([]);
  const target = folderId ? (findTrail(root, isFolderId(folderId))?.at(-1) as FolderNode | undefined) : undefined;
  const picked = loose.filter((c) => !skip.includes(c.id)).map((c) => c.id);
  return (
    <Dialog
      open={!!target}
      onOpenChange={(o) => {
        if (!o) {
          setSkip([]);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move projects to {target?.name}?</DialogTitle>
          <DialogDescription>These projects are at the top level of {client.company.name}. Untick any that should stay there.</DialogDescription>
        </DialogHeader>
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {loose.map((c) => {
            const project = client.projects.find((p) => p.id === c.id);
            const on = !skip.includes(c.id);
            return (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setSkip((s) => (on ? [...s, c.id] : s.filter((x) => x !== c.id)))}
                    className="size-4 accent-foreground"
                  />
                  <ProjectChip initials={project?.gameInitials ?? "··"} icon={project?.gameIcon} />
                  <span className="truncate">{nodeName(client, c)}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <IconUsers className="size-4 shrink-0" />
          Access stays the same: {target?.name} sits inside {client.company.name}, so everyone keeps the access they have.
        </p>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Not now</Button>} />
          <Button
            disabled={!picked.length}
            onClick={() => {
              if (!target) return;
              onMove(picked, target.id);
              setSkip([]);
            }}
          >
            Move {picked.length} {picked.length === 1 ? "project" : "projects"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Move to ───────── */

/** How each kind of change looks: who loses access first (the riskiest), then role changes, then who gains it. */
const CHANGE_STYLE = {
  loses: { label: "Loses access", icon: IconUserMinus, tone: "text-destructive", soft: "bg-destructive/10 text-destructive", avatar: "bg-destructive/12 text-destructive" },
  role: { label: "Role changes", icon: IconArrowsExchange, tone: "text-warning", soft: "bg-warning/12 text-warning", avatar: "bg-warning/15 text-warning" },
  gains: { label: "Gains access", icon: IconUserPlus, tone: "text-success", soft: "bg-success/12 text-success", avatar: "bg-success/12 text-success" },
} as const;
const CHANGE_ORDER = ["loses", "role", "gains"] as const;

const initialsOfUser = (name: string) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/** Names in a sentence: "Rita Gold", "Rita Gold and Omer Tal", "Rita Gold, Omer Tal and 3 others". */
const namesSentence = (names: string[]) =>
  names.length <= 2 ? names.join(" and ") : `${names.slice(0, 2).join(", ")} and ${names.length - 2} other${names.length - 2 === 1 ? "" : "s"}`;

/**
 * Move's access impact, summary first: one plain sentence per kind of change with the people's avatars ("Rita Gold
 * and Omer Tal lose access"), then Show details for each person's role now → after and where it comes from (the
 * closest grant). All environments.
 */
function AccessImpact({ impact }: { impact: AccessChange[] }) {
  const [open, setOpen] = React.useState(false);
  if (!impact.length) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
          <IconShieldCheck className="size-4" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Access stays the same</span>
          <span className="text-xs text-muted-foreground">No one gains, loses or changes access.</span>
        </div>
      </div>
    );
  }
  const sorted = [...impact].sort((x, y) => CHANGE_ORDER.indexOf(x.change) - CHANGE_ORDER.indexOf(y.change));
  const sentence = (k: (typeof CHANGE_ORDER)[number], people: AccessChange[]) => {
    const one = people.length === 1;
    if (k === "loses") return one ? "loses access" : "lose access";
    if (k === "gains") return one ? "gains access" : "gain access";
    return one ? `goes from ${people[0].from} to ${people[0].to}` : "change role";
  };
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <p className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Access changes</p>
      <div className="flex flex-col gap-2.5 px-3 py-3">
        {CHANGE_ORDER.map((k) => {
          const people = sorted.filter((c) => c.change === k);
          if (!people.length) return null;
          const st = CHANGE_STYLE[k];
          const shown = people.slice(0, 3);
          return (
            <div key={k} className="flex items-center gap-3">
              {/* The people, as a stack of avatars in the change's colour. */}
              <span className="flex shrink-0" aria-hidden>
                {shown.map((c, i) => (
                  <span
                    key={c.user}
                    className={cn("flex size-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-popover", st.avatar, i > 0 && "-ml-1.5")}
                  >
                    {initialsOfUser(c.user)}
                  </span>
                ))}
                {people.length > shown.length ? (
                  <span className="-ml-1.5 flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-popover">
                    +{people.length - shown.length}
                  </span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{namesSentence(people.map((c) => c.user))}</span> {sentence(k, people)}
              </span>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="self-start text-xs font-medium text-info underline-offset-4 hover:underline"
        >
          {open ? "Hide details" : "Show details"}
        </button>
      </div>
      {open ? (
        /* Details: each person's role now → after, in words, and the folder it comes from. */
        <ul className="max-h-52 divide-y divide-border overflow-y-auto border-t border-border">
          {sorted.map((c) => (
            <li key={c.user} className="flex items-center gap-3 px-3 py-2">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm text-foreground">{c.user}</span>
                {c.why ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {c.change === "loses" ? c.from : c.to} from {c.why}
                  </span>
                ) : null}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs">
                <RoleTag role={c.from ?? "No access"} muted={!c.from} />
                <IconArrowRight className="size-3 text-muted-foreground" aria-label="to" />
                <RoleTag role={c.to ?? "No access"} muted={!c.to} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** A role in Now → After, in words; "No access" is quieter (dashed). */
function RoleTag({ role, muted = false }: { role: string; muted?: boolean }) {
  return (
    <span className={cn("rounded-md border px-1.5 py-0.5", muted ? "border-dashed border-border text-muted-foreground" : "border-border font-medium text-foreground")}>
      {role}
    </span>
  );
}

/**
 * Move a folder or a project (Foldering PRD, Story 5): pick a destination —
 * invalid ones are greyed out with the reason — then confirm the access impact
 * per user, since the closest grant decides the role.
 */
export function MoveDialog({
  client,
  root,
  subjectKey,
  to,
  onChoose,
  onBack,
  onClose,
  onMove,
  onCreateFolder,
}: {
  client: ClientConfig;
  root: FolderNode;
  subjectKey: string | null;
  to: string | null;
  onChoose: (to: string) => void;
  onBack: () => void;
  onClose: () => void;
  onMove: (key: string, targetId: string) => void;
  /** Makes a folder inside `parentId` and returns its id; the dialog then picks it as the destination. */
  onCreateFolder?: (parentId: string, name: string) => string;
}) {
  const subjectTrail = subjectKey ? findTrail(root, matchKey(subjectKey)) : null;
  const subject = subjectTrail?.at(-1);
  const parent = subjectTrail?.at(-2) as FolderNode | undefined;
  const name = subject ? nodeName(client, subject) : "";
  const isFolder = subject?.kind === "folder";
  const height = isFolder ? folderHeight(subject as FolderNode) : 0;
  const targetTrail = to ? findTrail(root, isFolderId(to)) : null;
  const target = targetTrail?.at(-1) as FolderNode | undefined;

  const rows: React.ReactNode[] = [];
  const walk = (f: FolderNode, depth: number) => {
    const isSubject = isFolder && f.id === subject?.id;
    const level = depth + height;
    const subFolders = f.children.filter((c) => c.kind === "folder").length;
    const reason = isSubject
      ? "this folder"
      : f.id === parent?.id
        ? "moving from here"
        : isFolder && level > MAX_FOLDER_DEPTH
          ? `level ${level}`
          : isFolder && subFolders >= MAX_FOLDERS_PER_LEVEL
            ? `${MAX_FOLDERS_PER_LEVEL} folders`
            : subject && nameTaken(client, f.children, name, subjectKey!)
              ? "name taken"
              : null;
    rows.push(
      <button
        key={f.id}
        type="button"
        disabled={!!reason}
        title={reason === "name taken" ? NAME_TAKEN : reason?.startsWith("level") ? `Up to ${MAX_FOLDER_DEPTH} nested levels.` : undefined}
        onClick={() => onChoose(f.id)}
        aria-pressed={f.id === to}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-md pr-2 text-left text-sm hover:bg-accent/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
          f.id === to && "bg-accent font-medium text-accent-foreground hover:bg-accent",
        )}
        style={{ paddingLeft: 8 + depth * ROW_INDENT }}
      >
        {f.id === ROOT_FOLDER_ID ? (
          <CompanyLogo clientId={client.id} className="size-5 shrink-0 rounded-[5px]" />
        ) : (
          <IconFolderFilled className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 truncate">{f.name}</span>
        {reason ? <span className="text-[11px] text-muted-foreground">{reason}</span> : null}
        {f.id === to ? <IconCheck className="size-4 shrink-0" aria-hidden /> : null}
      </button>,
    );
    // A folder can't move into itself or its descendants, so those aren't listed.
    if (!isSubject) sortChildren(client, f.children).forEach((c) => c.kind === "folder" && walk(c, depth + 1));
  };
  if (subject) walk(root, 0);

  const impact = subject && parent && targetTrail ? accessImpact(client, subjectTrail!.slice(0, -1), targetTrail, subject) : [];

  /* Two steps (Foldering PRD, Story 5): choose a folder, then review the move and its access impact. */
  const [step, setStep] = React.useState<1 | 2>(1);

  /* New folder, right here: made inside the folder that's picked (or at the top level), then picked as the destination. */
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  // Another item to move: start again on step 1 with the New folder field closed.
  const [seenKey, setSeenKey] = React.useState(subjectKey);
  if (seenKey !== subjectKey) {
    setSeenKey(subjectKey);
    setStep(1);
    setCreating(false);
    setNewName("");
  }
  const newParent = target ?? root;
  const newParentDepth = (targetTrail?.length ?? 1) - 1;
  const newTrimmed = newName.trim();
  const newError = !newTrimmed
    ? null
    : newTrimmed.length > FOLDER_NAME_MAX
      ? `Use up to ${FOLDER_NAME_MAX} characters`
      : nameTaken(client, newParent.children, newTrimmed)
        ? NAME_TAKEN
        : null;
  // Too deep: the new folder (and, for a folder on the move, everything inside it) would pass level 4.
  const newTooDeep = newParentDepth + 1 + height > MAX_FOLDER_DEPTH;
  const createHere = () => {
    if (!onCreateFolder || !newTrimmed || newError || newTooDeep) return;
    const id = onCreateFolder(newParent.id, newTrimmed);
    setCreating(false);
    setNewName("");
    onChoose(id);
  };
  const cancelNew = () => {
    setCreating(false);
    setNewName("");
  };
  const newHint = newTooDeep
    ? TOO_DEEP
    : newError ?? `Inside ${newParent.id === ROOT_FOLDER_ID ? client.company.name : newParent.name}. ${name} moves into it.`;

  /* Step 2: the item in its folder now, and after the move. */
  const subjectIcon =
    subject?.kind === "folder" ? (
      <IconFolderFilled className="size-4 shrink-0 text-info" aria-hidden />
    ) : (
      (() => {
        const p = client.projects.find((x) => x.id === subject?.id);
        return <ProjectChip initials={p?.gameInitials ?? "··"} icon={p?.gameIcon} className="size-4 rounded-[4px] text-[7px]" />;
      })()
    );
  const miniTree = (label: string, trail: FolderNode[], after: boolean) => (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-border p-3">
      <span className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      {trail.map((f, i) => (
        <span key={f.id} className="flex h-6 min-w-0 items-center gap-1.5 text-xs" style={{ paddingLeft: i * 12 }}>
          {f.id === ROOT_FOLDER_ID ? (
            <CompanyLogo clientId={client.id} className="size-4 shrink-0 rounded-[4px]" />
          ) : (
            <IconFolderFilled className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span className={cn("truncate", i === trail.length - 1 && "font-medium")}>{nodeName(client, f)}</span>
        </span>
      ))}
      <span
        className={cn(
          "flex h-7 min-w-0 items-center gap-1.5 rounded-md px-1.5 text-xs font-semibold",
          after ? "border border-dashed border-info/60 bg-info/10" : "text-muted-foreground line-through decoration-muted-foreground/60",
        )}
        style={{ marginLeft: trail.length * 12 - 6 }}
      >
        {subjectIcon}
        <span className="truncate">{name}</span>
        {after ? <span className="ml-auto shrink-0 text-[11px] font-medium text-info">Moves here</span> : null}
      </span>
    </div>
  );

  return (
    <Dialog open={!!subject} onOpenChange={(o, d) => !o && !isGuideEvent(d) && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Move <span className="font-semibold">{name}</span>
          </DialogTitle>
          <DialogDescription>{isFolder ? "The folder and everything inside it moves together." : "Pick the folder this project should live in."}</DialogDescription>
        </DialogHeader>

        {/* Where you are in the move: 1 Choose folder, 2 Review. */}
        <ol className="-mt-2 flex items-center gap-4 text-xs text-muted-foreground" aria-label="Steps">
          {(["Choose folder", "Review"] as const).map((label, i) => {
            const on = step === i + 1;
            return (
              <li key={label} className={cn("flex items-center gap-1.5", on && "font-semibold text-foreground")} aria-current={on ? "step" : undefined}>
                <span className={cn("flex size-[18px] items-center justify-center rounded-full text-[11px] font-semibold", on ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>
                  {i + 1}
                </span>
                {label}
              </li>
            );
          })}
        </ol>

        {step === 1 ? (
          /* Step 1: the tree, with New folder as its last row. */
          <div className="max-h-72 overflow-y-auto rounded-md border border-border p-1">
            {rows}
            {/* Pinned to the bottom of the list, so it shows without scrolling. */}
            {onCreateFolder ? (
              <div className="sticky -bottom-1 -mx-1 -mb-1 border-t border-border bg-popover p-1">
              {creating ? (
                <div className="flex flex-col gap-1 px-1 pt-0.5 pb-0.5">
                  <div className="flex items-center gap-2">
                    <IconFolderPlus className="ml-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createHere();
                        if (e.key === "Escape") {
                          // Close the field, not the dialog.
                          e.preventDefault();
                          e.stopPropagation();
                          cancelNew();
                        }
                      }}
                      placeholder="Folder name"
                      aria-label={`New folder in ${newParent.name}`}
                      aria-invalid={!!newError || newTooDeep}
                      className={cn(
                        "h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        newError || newTooDeep ? "border-destructive" : "border-input",
                      )}
                    />
                    <Button size="sm" variant="ghost" onClick={cancelNew}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={createHere} disabled={!newTrimmed || !!newError || newTooDeep}>
                      Create
                    </Button>
                  </div>
                  <p className={cn("pl-7 text-xs", newError || newTooDeep ? "text-destructive" : "text-muted-foreground")}>{newHint}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex h-8 w-full items-center gap-2 rounded-md pr-2 pl-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <IconFolderPlus className="size-4 shrink-0" aria-hidden />
                  New folder{target ? ` in ${target.name}` : ""}
                </button>
              )}
              </div>
            ) : null}
          </div>
        ) : subjectTrail && targetTrail ? (
          /* Step 2: now and after, then what changes. */
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {miniTree("Now", subjectTrail.slice(0, -1) as FolderNode[], false)}
              {miniTree("After the move", targetTrail as FolderNode[], true)}
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <AccessImpact impact={impact} />
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {impact.length ? <li>Access changes apply in every environment.</li> : null}
                <li>Grants set directly on {name} stay with it.</li>
                {!isFolder ? <li>Folder totals will now include this project’s full history.</li> : null}
                {!isFolder ? <li>URLs, integrations and data don’t change.</li> : null}
              </ul>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {step === 1 ? (
            <>
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button disabled={!target} onClick={() => target && setStep(2)}>
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => subjectKey && target && onMove(subjectKey, target.id)}>{target ? `Move to ${target.name}` : "Move"}</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Who has access ───────── */

/** The access panel (Permissions PRD): who can reach this folder or project,
 *  their role, and whether it's set here or inherited. */
export function AccessDialog({
  client,
  root,
  subjectKey,
  onClose,
}: {
  client: ClientConfig;
  root: FolderNode;
  subjectKey: string | null;
  onClose: () => void;
}) {
  const trail = subjectKey ? findTrail(root, matchKey(subjectKey)) : null;
  const subject = trail?.at(-1);
  const people = trail ? effectiveAccess(client, trail) : [];
  return (
    <Dialog open={!!subject} onOpenChange={(o, d) => !o && !isGuideEvent(d) && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Who has access to {subject ? nodeName(client, subject) : ""}</DialogTitle>
          <DialogDescription>Grants on Company or a folder cascade down. The closest grant decides the role.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border rounded-md border border-border text-sm">
          {people.map((a) => (
            <li key={a.user} className="flex items-center justify-between gap-3 px-3 py-2">
              <span>{a.user}</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="text-foreground">{a.role}</span>· {a.direct ? "Set here" : `Inherited from ${a.source}`}
              </span>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="outline" disabled>
            Add people
          </Button>
          <DialogClose render={<Button>Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
