"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  IconBuildingStore,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleFilled,
  IconFolderPlus,
  IconFolders,
  IconPlus,
  IconSearch,
  IconX,
  IconFolderFilled,
} from "@/lib/icons";
import { InviteRightPerson } from "@/components/usability/invite-right-person";
import { AppchargeLogo, CompanyLogo } from "@/components/dashboard/logo";
import { useFolderTree } from "@/components/dashboard/providers";
import { FOLDER_NAME_MAX, NAME_TAKEN, insertFolder, makeFolderId } from "@/lib/folders";
import { DEFAULT_CLIENT_ID, MAX_FOLDER_DEPTH, ROOT_FOLDER_ID, getClient, type ClientId, type FolderNode } from "@/lib/newgen";
import { markStartChoiceSeen, startChoiceSeen } from "@/lib/usability-session";
import { cn } from "@/lib/utils";

type Choice = "folders" | "project";
type Step = "choose" | "folders";

/** Same brand system as Create project (Appcharge website, Figma "The Web"): a deep panel per choice, its accent on
 *  the chosen card, charcoal pill buttons, Gellix. */
const THEMES: Record<Choice | "none", { accent: string; tint: string; panel: string }> = {
  none: { accent: "#272727", tint: "#f4f4f5", panel: "#272727" },
  folders: { accent: "#338DE8", tint: "#EAF3FD", panel: "#24293E" },
  project: { accent: "#AA49EB", tint: "#F1E0FF", panel: "#34243E" },
};
/** The dark buttons: a soft top-to-bottom gradient. */
const CHARCOAL = "linear-gradient(180deg, #272727 0%, #302F2F 100%)";

/** A folder being set up in onboarding: one row of the list, in tree order, with its depth (1 = under Company). */
type Draft = { id: number; name: string; depth: number };

/** Ready-made structures to start from (the first is the Foldering PRD's example tree). */
const EXAMPLES: { label: string; folders: [string, number][] }[] = [
  { label: "By genre", folders: [["Casual Games", 1], ["Puzzle Studio", 2], ["Strategy Games", 1]] },
  { label: "By studio", folders: [["London Studio", 1], ["Sydney Studio", 1], ["Las Vegas Studio", 1]] },
  { label: "By team", folders: [["Live Ops", 1], ["Marketing", 1], ["Finance", 1]] },
];

let nextDraftId = 1;
const draft = (name: string, depth: number): Draft => ({ id: nextDraftId++, name, depth });

/** Each row's parent row (the nearest row above it one level up), or null for a top-level folder. */
function parentsOf(drafts: Draft[]): (number | null)[] {
  return drafts.map((d, i) => {
    for (let j = i - 1; j >= 0; j--) if (drafts[j].depth === d.depth - 1) return j;
    return null;
  });
}

/**
 * First-time landing (usability test), in the same split layout as Create project (Figma's onboarding).
 *   1. "How do you want to start?": Organize with folders, or Start with one project.
 *   2. Folders → "Set up your folders": name folders and sub-folders right here (up to 4 levels, names unique at
 *      each level, Foldering PRD Story 2), watching the tree build in the preview; Create folders adds them to the
 *      company and opens them all expanded in the sidebar's Folders & projects tree.
 *   Project → Create project (Project Lifecycle PRD), destined for the Company root (Foldering PRD, Story 6).
 * Start with one project is the primary path (preselected; Continue goes to Create project); Organize with folders is a
 * smaller secondary option below it that opens the folders step. Shows once per session.
 * No "I'll do it later": every step's main button goes on. "I'm not the right person" opens an invite for whoever should
 * do the setup, then closes onboarding.
 */
export function StartChoice() {
  const router = useRouter();
  const client = getClient(DEFAULT_CLIENT_ID);
  const { root, edit } = useFolderTree(client);
  const [open, setOpen] = React.useState(() => !startChoiceSeen());
  const [step, setStep] = React.useState<Step>("choose");
  // One project is the primary path, so it starts selected; folders is the secondary option.
  const [choice, setChoice] = React.useState<Choice | null>("project");
  const [hover, setHover] = React.useState<Choice | null>(null);
  const [drafts, setDrafts] = React.useState<Draft[]>(() => [draft("", 1)]);
  const [focusId, setFocusId] = React.useState<number | null>(null);

  const shown: Choice | "none" = step === "folders" ? "folders" : hover ?? choice ?? "none";
  const theme = THEMES[shown];
  const company = client.company.name;

  const [inviteOpen, setInviteOpen] = React.useState(false);
  /** After the invite is sent: close onboarding gracefully and leave the participant on the company's Home. */
  const invited = (email: string) => {
    close();
    router.push("/dashboard/company/home");
    toast(`Invite sent to ${email}`);
  };

  const close = () => {
    markStartChoiceSeen();
    setOpen(false);
  };

  // Validation (Foldering PRD, Story 2): trimmed, up to 50 characters, unique among siblings (case-insensitive).
  const parents = parentsOf(drafts);
  const errors = drafts.map((d, i) => {
    const name = d.name.trim();
    if (!name) return null;
    if (name.length > FOLDER_NAME_MAX) return `Use up to ${FOLDER_NAME_MAX} characters`;
    const clash = drafts.some((o, j) => j < i && parents[j] === parents[i] && o.name.trim().toLowerCase() === name.toLowerCase());
    const takenAtRoot = parents[i] === null && root.children.some((c) => c.kind === "folder" && c.name.toLowerCase() === name.toLowerCase());
    return clash || takenAtRoot ? NAME_TAKEN : null;
  });
  // A named folder can't sit inside an unnamed one.
  const orphan = drafts.some((d, i) => d.name.trim() && parents[i] !== null && !drafts[parents[i]!].name.trim());
  const named = drafts.filter((d) => d.name.trim()).length;
  const canCreate = named > 0 && errors.every((e) => !e) && !orphan;

  const update = (id: number, name: string) => setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)));
  /** A new row after `index` and everything inside it, at `depth`. */
  const addAfter = (index: number, depth: number) => {
    setDrafts((ds) => {
      let at = index + 1;
      while (at < ds.length && ds[at].depth > ds[index].depth) at++;
      const d = draft("", depth);
      setFocusId(d.id);
      return [...ds.slice(0, at), d, ...ds.slice(at)];
    });
  };
  const addTop = () =>
    setDrafts((ds) => {
      const d = draft("", 1);
      setFocusId(d.id);
      return [...ds, d];
    });
  /** Removes a folder and the folders inside it. */
  const remove = (index: number) =>
    setDrafts((ds) => {
      let end = index + 1;
      while (end < ds.length && ds[end].depth > ds[index].depth) end++;
      const next = [...ds.slice(0, index), ...ds.slice(end)];
      return next.length ? next : [draft("", 1)];
    });

  const createFolders = () => {
    if (!canCreate) return;
    // Build the nested folders from the rows (unnamed rows are left out), then add the top level under Company.
    const nodes = drafts.map((d) => (d.name.trim() ? ({ kind: "folder", id: makeFolderId(d.name), name: d.name.trim(), children: [] } as FolderNode) : null));
    const tops: FolderNode[] = [];
    drafts.forEach((_, i) => {
      const n = nodes[i];
      if (!n) return;
      const p = parents[i];
      if (p === null) tops.push(n);
      else nodes[p]!.children.push(n);
    });
    edit((t) => tops.reduce((tree, f) => insertFolder(tree, ROOT_FOLDER_ID, f), t));
    toast(`${named} ${named === 1 ? "folder" : "folders"} created in ${company}`);
    close();
    router.push(`/dashboard/company/home?panel=locations&expand=all`);
  };

  const go = () => {
    if (!choice) return;
    if (choice === "folders") {
      setStep("folders");
      return;
    }
    close();
    // From onboarding: Create project keeps the onboarding exits on each of its steps.
    router.push(`/dashboard/create-project?client=${client.id}&from=${ROOT_FOLDER_ID}&onboarding=1`);
  };

  const projectText = `Set up a store for one game now. It sits under ${company}, and you can move it into a folder later.`;

  // The folders step has one more screen after the choice; one project continues in Create project.
  const progress = step === "choose" ? 0.5 : 1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup
          className={cn(
            "font-brand fixed inset-0 z-50 grid overflow-y-auto bg-background outline-none duration-300 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
        >
          <section className="flex min-h-svh flex-col px-6 pt-5 pb-8 sm:px-12 lg:px-16">
            <div className="flex h-10 items-center gap-2.5">
              {step === "folders" ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep("choose");
                    setChoice("project");
                  }}
                  aria-label="Back"
                  className="-ml-2 flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                >
                  <IconChevronLeft className="size-5" />
                </button>
              ) : (
                <>
                  <AppchargeLogo className="size-7" />
                  <span className="text-[15px] font-semibold tracking-tight text-foreground">appcharge</span>
                </>
              )}
              <span className="flex-1" />
              {/* The alternative exit, on every step: hand the setup to someone else. */}
              <button type="button" onClick={() => setInviteOpen(true)} className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
                I&apos;m not the right person
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center py-10">
              <div key={step} className="w-full max-w-[34rem] animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                {step === "choose" ? (
                  <>
                    <div className="mb-8">
                      <DialogPrimitive.Title className="text-[36px] font-[450] leading-[1.08] tracking-[-0.035em] text-[#272727]">How do you want to start?</DialogPrimitive.Title>
                      <p className="mt-2 text-[15px] text-muted-foreground">Pick what fits {company} today. You can do the other any time.</p>
                    </div>
                    {/* Primary: one project. Large, selected, marked Recommended; Continue goes to Create project. */}
                    <button
                      type="button"
                      aria-pressed={choice === "project"}
                      onClick={() => {
                        setChoice("project");
                        setHover(null);
                      }}
                      onMouseEnter={() => setHover("project")}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover("project")}
                      onBlur={() => setHover(null)}
                      className="flex w-full items-start gap-4 rounded-xl border-2 px-5 py-5 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
                      style={{ borderColor: THEMES.project.accent, background: THEMES.project.tint }}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white" style={{ color: THEMES.project.accent }}>
                        <IconBuildingStore className="size-5" stroke={1.6} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[17px] font-medium text-foreground">Start with one project</span>
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: THEMES.project.accent }}>
                            Recommended
                          </span>
                        </span>
                        <span className="text-sm leading-relaxed text-muted-foreground">{projectText}</span>
                      </span>
                    </button>

                    {/* Secondary: folders first. A smaller option below; it opens the folders step directly. */}
                    <button
                      type="button"
                      onClick={() => {
                        setChoice("folders");
                        setHover(null);
                        setStep("folders");
                      }}
                      onMouseEnter={() => setHover("folders")}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover("folders")}
                      onBlur={() => setHover(null)}
                      className="group mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
                    >
                      <IconFolders className="size-4 shrink-0 text-muted-foreground" stroke={1.6} />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="font-medium text-foreground">Or organize with folders first</span>
                        <span className="text-muted-foreground"> · studios, genres or teams</span>
                      </span>
                      <IconChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <DialogPrimitive.Title className="text-[36px] font-[450] leading-[1.08] tracking-[-0.035em] text-[#272727]">Set up your folders</DialogPrimitive.Title>
                      <p className="mt-2 text-[15px] text-muted-foreground">
                        A folder for each studio, genre or team. Add folders inside them, up to {MAX_FOLDER_DEPTH} levels deep. You can change them any time.
                      </p>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Start from an example:</span>
                      {EXAMPLES.map((ex) => (
                        <button
                          key={ex.label}
                          type="button"
                          onClick={() => setDrafts(ex.folders.map(([n, d]) => draft(n, d)))}
                          className="rounded-full border border-border px-3 py-1 transition-colors hover:border-foreground/30 hover:bg-muted"
                        >
                          {ex.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex max-h-[min(22rem,45vh)] flex-col gap-2 overflow-y-auto py-1 pr-1">
                      {drafts.map((d, i) => (
                        <FolderInput
                          key={d.id}
                          d={d}
                          error={errors[i] ?? (d.name.trim() && parents[i] !== null && !drafts[parents[i]!].name.trim() ? "Name the folder it's in first" : null)}
                          autoFocus={focusId === d.id || (i === 0 && focusId === null)}
                          onChange={(v) => update(d.id, v)}
                          onEnter={() => addAfter(i, d.depth)}
                          onAddInside={d.depth < MAX_FOLDER_DEPTH ? () => addAfter(i, d.depth + 1) : undefined}
                          onRemove={() => remove(i)}
                          accent={THEMES.folders.accent}
                        />
                      ))}
                    </div>
                    <button type="button" onClick={addTop} className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      <IconPlus className="size-4" />
                      Add folder
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-1 w-36 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progress" aria-valuenow={progress * 100} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full transition-[width,background-color] duration-500" style={{ width: `${progress * 100}%`, background: theme.accent }} />
              </div>
              <span className="flex-1" />
              <button
                type="button"
                onClick={step === "choose" ? go : createFolders}
                disabled={step === "choose" ? !choice : !canCreate}
                className="h-11 rounded-[200px] shadow-md px-7 text-[15px] font-medium text-white transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
                style={{ background: CHARCOAL }}
              >
                {step === "choose" ? "Continue" : named > 1 ? `Create ${named} folders` : "Create folder"}
              </button>
            </div>
          </section>

          {/* The preview: what each choice leads to, in its brand colour; on the folders step, the tree as it's typed. */}
          <aside className="hidden items-center justify-center p-10 transition-colors duration-500 lg:sticky lg:top-0 lg:flex lg:h-svh xl:p-16" style={{ background: theme.panel }}>
            <div aria-hidden className="w-full max-w-[860px] overflow-hidden rounded-2xl border border-black/5 bg-background shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium">
                  <AppchargeLogo className="size-5 shrink-0" />
                  {shown === "project" ? "New project" : "Projects"}
                  <IconChevronDown className="size-3.5 text-muted-foreground" />
                </span>
                <span className="flex-1" />
                <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium">
                  <IconCircleFilled className="size-2 text-[#16a34a]" />
                  Production
                </span>
              </div>
              <div className="relative h-[min(30rem,62vh)] overflow-hidden bg-muted/30">
                <div key={step === "folders" ? "folders-step" : shown} className="size-full animate-in fade-in-0 duration-500">
                  {shown === "project" ? (
                    <ProjectPreview accent={THEMES.project.accent} />
                  ) : (
                    <TreePreview
                      clientId={client.id}
                      company={company}
                      folders={step === "folders" ? drafts : shown === "folders" ? EXAMPLES[0].folders.map(([n, d], i) => ({ id: -i - 1, name: n, depth: d })) : []}
                      live={step === "folders"}
                      accent={THEMES.folders.accent}
                      tint={THEMES.folders.tint}
                    />
                  )}
                </div>
              </div>
            </div>
          </aside>
          <InviteRightPerson open={inviteOpen} onOpenChange={setInviteOpen} company={company} onDone={invited} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** One folder row on the folders step: indented by depth, with "add a folder inside" and remove. Enter adds the next one. */
function FolderInput({
  d,
  error,
  autoFocus,
  onChange,
  onEnter,
  onAddInside,
  onRemove,
  accent,
}: {
  d: Draft;
  error: string | null;
  autoFocus: boolean;
  onChange: (v: string) => void;
  onEnter: () => void;
  onAddInside?: () => void;
  onRemove: () => void;
  accent: string;
}) {
  return (
    <div style={{ paddingLeft: (d.depth - 1) * 24 }}>
      <div
        className={cn(
          "group flex h-11 items-center gap-2 rounded-lg border bg-background pr-1.5 pl-3 transition-colors focus-within:ring-[3px] focus-within:ring-ring/20",
          error ? "border-destructive" : "border-input focus-within:border-foreground/40",
        )}
      >
        <IconFolderFilled className="size-4 shrink-0" style={{ color: d.name.trim() ? accent : undefined }} />
        <input
          autoFocus={autoFocus}
          value={d.name}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
          placeholder={d.depth === 1 ? "Folder name, e.g. Casual Games" : "Folder inside, e.g. Puzzle Studio"}
          aria-label={d.depth === 1 ? "Folder name" : `Folder name, level ${d.depth}`}
          aria-invalid={!!error}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        {onAddInside ? (
          <button type="button" onClick={onAddInside} title="Add a folder inside" aria-label="Add a folder inside" className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <IconFolderPlus className="size-4" />
          </button>
        ) : null}
        <button type="button" onClick={onRemove} title="Remove" aria-label="Remove folder" className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <IconX className="size-4" />
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/**
 * The scope selector: the empty company until a choice is made; the Foldering PRD's example tree when folders are
 * pointed at; and on the folders step, the folders as they're typed (an unnamed one shows as a placeholder).
 */
function TreePreview({
  clientId,
  company,
  folders,
  live,
  accent,
  tint,
}: {
  clientId: ClientId;
  company: string;
  folders: Draft[];
  live: boolean;
  accent: string;
  tint: string;
}) {
  const indent = (d: number) => ({ paddingLeft: 12 + d * 20 });
  const shown = live ? folders.filter((f, i) => f.name.trim() || i === folders.length - 1 || folders.length === 1) : folders;
  return (
    <div className="flex size-full items-start justify-center overflow-y-auto p-8">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm text-muted-foreground">
          <IconSearch className="size-4" />
          Search folders or projects
        </div>
        <div className="flex flex-col gap-0.5 p-2">
          <div className="flex h-9 items-center gap-2 rounded-md text-sm" style={indent(0)}>
            <IconChevronDown className="size-3.5 text-muted-foreground" />
            <CompanyLogo clientId={clientId} className="size-5 rounded-[5px]" />
            <span className="font-medium">{company}</span>
          </div>
          {shown.length ? (
            shown.map((f, i) => {
              const hasChildren = shown[i + 1]?.depth > f.depth;
              return (
                <div key={f.id} className="flex h-9 items-center gap-2 rounded-md pr-3 text-sm" style={{ ...indent(f.depth), background: f.name.trim() ? tint : undefined }}>
                  {hasChildren ? <IconChevronDown className="size-3.5 text-muted-foreground" /> : <IconChevronRight className="size-3.5 text-muted-foreground" />}
                  <IconFolderFilled className="size-4" style={{ color: f.name.trim() ? accent : undefined }} />
                  {f.name.trim() ? <span className="min-w-0 flex-1 truncate">{f.name.trim()}</span> : <span className="h-2 w-28 rounded-full bg-muted" />}
                  {f.name.trim() ? (
                    <span className="ml-auto text-[10px] font-semibold" style={{ color: accent }}>
                      New folder
                    </span>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="py-2 text-xs text-muted-foreground" style={indent(1)}>
              No folders or projects yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** One project: a store taking shape for the game, before the game is known. */
function ProjectPreview({ accent }: { accent: string }) {
  return (
    <div className="flex size-full flex-col gap-4 p-8">
      <div className="flex items-center gap-4">
        <span className="size-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#F7CE46] via-[#FE7558] to-[#A033E8]" />
        <div className="flex flex-col gap-2">
          <span className="h-3 w-48 rounded-full bg-foreground/20" />
          <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            <IconBuildingStore className="size-3" />
            Webstore
          </span>
        </div>
        <span className="flex-1" />
        <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: accent }}>
          New
        </span>
      </div>
      <span className="h-36 shrink-0 rounded-xl bg-gradient-to-r from-foreground/10 to-foreground/5" />
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        <span className="rounded-xl bg-foreground/[0.07]" />
        <span className="rounded-xl bg-foreground/[0.07]" />
        <span className="rounded-xl bg-foreground/[0.07]" />
      </div>
    </div>
  );
}
