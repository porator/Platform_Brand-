"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconArrowRight, IconX } from "@/lib/icons";
import { FolderPlusIcon, PuzzlePieceIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { FloatingAIPrompt } from "@/components/dashboard/floating-ai-prompt";
import { useAssistant } from "@/components/dashboard/assistant-drawer";
import { ShorthandMark } from "@/components/dashboard/logo";
import { useFolderTree } from "@/components/dashboard/providers";
import { useAddModule } from "@/components/dashboard/add-module-modal";
import { Button } from "@/components/ui/button";
import { TOO_DEEP, findTrail, insertFolder, isFolderId, isProjectId, makeFolderId, projectCount, trailNames } from "@/lib/folders";
import { MAX_FOLDER_DEPTH, MODULE_IDS, MODULE_LABEL, ROOT_FOLDER_ID, type ClientConfig, type FolderNode, type ModuleId, type Project } from "@/lib/newgen";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Ask AI → create a project (usability test). There's no real AI: the prompt is
 * read for a module and a game (a name after "for", or an App Store / Google
 * Play link). The reply is a card with what was understood; Create project and
 * Edit details both hand off to the real Create project flow, prefilled, so the
 * AI path ends exactly where the wizard does.
 * ------------------------------------------------------------------------- */

const STORE_LINK = /https?:\/\/(?:apps\.apple\.com|play\.google\.com)\/\S+/i;
const INTENT = /\b(create|new|set ?up|start|make|add|build|launch|open)\b/i;
const OBJECT = /\b(project|store|webstore|web store|payment links?|direct checkout|checkout)\b/i;

/** Which module the prompt asks for; a Webstore unless another is named. */
function readModule(text: string): ModuleId {
  if (/payment links?/i.test(text)) return "payment-links";
  if (/direct checkout|checkout/i.test(text)) return "direct-checkout";
  return "webstore";
}

/** A store link's game, read from the link itself ("…/app/candy-crush-saga/id553…" → Candy Crush Saga); Create project
 *  then reads the real store page. */
function titleFromLink(link: string): string {
  try {
    const url = new URL(link);
    const slug = url.host === "apps.apple.com" ? url.pathname.match(/\/app\/([^/]+)\/id\d+/)?.[1] : url.searchParams.get("id")?.split(".").at(-1);
    if (!slug) return "the game in your link";
    return decodeURIComponent(slug).split(/[-_]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  } catch {
    return "the game in your link";
  }
}

/** Words that describe a game rather than name one ("my new puzzle game"): such a phrase is never used as a name. */
const GENERIC = /\b(my|our|a|an|the|new|game|games|app|one|some|this|that|it|project|store|folder)\b/gi;

/** "… in the Evergreen folder" / "… in Big Fish": a destination folder named in the prompt (R19). */
function readFolder(text: string, folders: FolderNode[]): FolderNode | undefined {
  const t = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  // Longest names first, so "Big Fish Casino" wins over "Big Fish".
  return [...folders]
    .sort((a, b) => b.name.length - a.name.length)
    .find((f) => ["in", "into", "under", "inside"].some((w) => [`${w} ${f.name.toLowerCase()}`, `${w} the ${f.name.toLowerCase()}`].some((p) => t.includes(` ${p} `) || t.includes(` ${p}.`))));
}

/** Every folder under the company (not the company itself). */
function foldersOf(root: FolderNode): FolderNode[] {
  return root.children.flatMap((c) => (c.kind === "folder" ? [c, ...foldersOf(c)] : []));
}

/** The game: the store link (its title read from the link), or a name after "for" (R19: never the raw prompt). */
function readGame(text: string): { q: string; title: string } | null {
  const link = text.match(STORE_LINK)?.[0];
  if (link) return { q: link, title: titleFromLink(link) };
  const raw = text.match(/\bfor\s+(.+)$/i)?.[1];
  if (!raw) return null;
  // Drop a trailing destination ("… in the Evergreen folder") and quotes, then check it reads like a game's name.
  const name = raw
    .replace(/\s+(in|into|under|inside)\s+(the\s+)?\S.*$/i, "")
    .replace(/["“”'’.!?]+$/g, "")
    .replace(/^["“”'‘]+/, "")
    .trim();
  const words = name.split(/\s+/).filter(Boolean);
  const meaningful = name.replace(GENERIC, "").trim();
  // A description, not a title: "my new puzzle game", "a casino app", "our next one".
  const described = /^(my|our|a|an|the|new|next|some|this|that)\b/i.test(name) || /\b(game|games|app|one)$/i.test(name);
  if (!name || words.length > 5 || described || !meaningful || meaningful.length < 2) return null;
  return { q: name, title: name };
}

/** A folder request ("create a folder for puzzle games", "folders called Studio 01 and Studio 02", "organize my
 *  company"), with the names if given (several, split on commas and "and"). */
function readFolderRequest(text: string): { names: string[] } | null {
  if (!/\b(folders?|organi[sz]e|structure|group)\b/i.test(text)) return null;
  const list = text.match(/\b(?:called|named|for)\s+(.+?)\s*$/i)?.[1] ?? "";
  const names = list
    .split(/\s*(?:,|\band\b|&)\s*/i)
    .map((n) => n.replace(/^["“']|["”']$/g, "").trim())
    .filter((n) => n && n.split(/\s+/).length <= 5 && !/^(my|our|the)?\s*(company|studios?|games?)$/i.test(n))
    .map((n) => n[0].toUpperCase() + n.slice(1));
  return { names };
}

/** "Add a module…": the module named (if any) and the project named (if any). */
const ADD_MODULE = /\badd\b.*\b(modules?|payment links?|direct checkout|checkout|webstore|web store)\b/i;
function namedModule(text: string): ModuleId | undefined {
  if (/payment links?/i.test(text)) return "payment-links";
  if (/direct checkout|\bcheckout\b/i.test(text)) return "direct-checkout";
  if (/web ?store/i.test(text)) return "webstore";
  return undefined;
}

/* ───────── Inline completion ─────────
 * Completes what's typed with the creation flow's own words: a verb gets "a Webstore project for ",
 * a partial module ("pay") becomes "Payment Links project for ", a module gets "project for ", and
 * "project" gets "for ". It stops once a game follows "for". */
const MODULE_WORDS = MODULE_IDS.map((m) => MODULE_LABEL[m]);
const VERBS = ["Create", "Add", "New", "Set up", "Start", "Make", "Build", "Launch"];
const KEYWORDS: { word: string; then: string }[] = [
  ...MODULE_WORDS.map((word) => ({ word, then: " project for " })),
  { word: "project", then: " for " },
  ...VERBS.map((word) => ({ word, then: " a Webstore project for " })),
];

export function completePrompt(text: string): { rest: string; value: string } | null {
  if (!text.trim() || /\bfor\s+\S/i.test(text) || STORE_LINK.test(text)) return null;
  if (/\s$/.test(text)) {
    const t = text.trimEnd().toLowerCase();
    const add = (rest: string) => ({ rest, value: text + rest });
    if (MODULE_WORDS.some((m) => t.endsWith(m.toLowerCase()))) return add("project for ");
    if (t.endsWith("project") || t.endsWith("store")) return add("for ");
    if (VERBS.some((v) => t.endsWith(v.toLowerCase()))) return add("a Webstore project for ");
    if (t === "a" || t.endsWith(" a")) return add("Webstore project for ");
    return null;
  }
  // The last word (or words, for "Payment Li…") as a prefix of a keyword, from a word boundary.
  for (const { word, then } of KEYWORDS) {
    for (let i = Math.max(0, text.length - word.length); i < text.length; i++) {
      if (i > 0 && !/\s/.test(text[i - 1])) continue;
      const tail = text.slice(i);
      if (tail.length < 2 || !word.toLowerCase().startsWith(tail.toLowerCase())) continue;
      // Keep the typed casing at the start of the prompt for verbs; use the flow's own spelling for modules.
      const canonical = VERBS.includes(word) && i > 0 ? word.toLowerCase() : word;
      const value = text.slice(0, i) + canonical + then;
      return { rest: value.slice(text.length), value };
    }
  }
  return null;
}

type Reply =
  | { kind: "card"; q: string; title: string; module: ModuleId; folderId: string }
  | { kind: "ask"; module: ModuleId }
  | { kind: "folder"; names: string[] }
  | { kind: "module"; module?: ModuleId; projectId?: string }
  | { kind: "help" };

/** The three test tasks, as one-click prompts (the same words the intro uses). Phosphor icons, fill weight, grey. */
const TASK_PROMPTS = [
  { icon: FolderPlusIcon, label: "Organize your company", prompt: "Organize my company into folders" },
  { icon: StorefrontIcon, label: "Create a new project", prompt: "Create a new project" },
  { icon: PuzzlePieceIcon, label: "Add a module to an existing project", prompt: "Add a module to an existing project" },
];

/** The floating prompt, short until the user types, completing a create-a-project request inline, with replies above it. */
export function AiCreateProject({
  client,
  folderId: folderInView,
  project,
  className,
  variant = "default",
}: {
  client: ClientConfig;
  folderId?: string;
  /** R19: the project in view, as context (its folder for a new project; "add a module" means this project). */
  project?: Project;
  className?: string;
  /** "hero": the Overview's in-page box (always full width, Shopify Home style) instead of the floating bar. */
  variant?: "default" | "hero";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { root } = useFolderTree(client);
  // In a project, new projects default to that project's folder.
  const projectFolder = project ? findTrail(root, isProjectId(project.id))?.at(-2)?.id : undefined;
  const folderId = folderInView ?? projectFolder ?? ROOT_FOLDER_ID;
  const [text, setText] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const { edit } = useFolderTree(client);
  const openAddModule = useAddModule();
  /** The company's projects, in the tree (the ones a module can be added to). */
  const projects = client.projects.filter((p) => findTrail(root, isProjectId(p.id)));
  const [thinking, setThinking] = React.useState(false);
  const [reply, setReply] = React.useState<Reply | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // The destination: the folder in view, shown with its full path.
  const trail = findTrail(root, isFolderId(folderId)) ?? [root];
  // Folders can't go past level 4: the folder in view already at level 4 takes no more.
  const folderTooDeep = trail.length - 1 >= MAX_FOLDER_DEPTH;
  const destination = trailNames(client, trail).join(" / ");
  const noProjectYet = projectCount(root) === 0;
  // Completion while the company has no project yet (the prototype creates one project).
  const completion = noProjectYet && !thinking ? completePrompt(text) : null;
  // The ghost shows the completion exactly as it will be accepted, after the text as typed.
  const ghost = completion && completion.value.toLowerCase().startsWith(text.toLowerCase()) ? completion.value.slice(text.length) : undefined;

  /** What the prompt asks for: a project card, a question back (which game?), or how to use it. */
  const understand = (v: string, asked: ModuleId | null): Reply => {
    // A reply to "Which game is it for?" carries the module it was asked about.
    const q = asked && !INTENT.test(v) ? `Create a ${MODULE_LABEL[asked]} project for ${v}` : v;
    // R19: a folder request is a folder request, not a project for a game called "puzzle games".
    const folderAsk = readFolderRequest(v);
    if (folderAsk && !/\bproject\b/i.test(v)) return { kind: "folder", names: folderAsk.names };
    const mod = readModule(q);
    // "Add <module> to <project>": the project named, else the one in view, else a pick from the company's projects.
    if (ADD_MODULE.test(q)) {
      const lower = q.toLowerCase();
      const named = projects.find((p) => lower.includes(p.project.toLowerCase()) || lower.includes(p.game.toLowerCase()));
      return { kind: "module", module: namedModule(q), projectId: named?.id ?? project?.id };
    }
    const game = readGame(q);
    if (!INTENT.test(q) && !OBJECT.test(q) && !game) return { kind: "help" };
    if (!game) return { kind: "ask", module: mod };
    const named = readFolder(q, foldersOf(root));
    return { kind: "card", q: game.q, title: game.title, module: mod, folderId: named?.id ?? folderId };
  };
  const answer = (v: string) => setReply(understand(v, null));

  // In the dashboard, sending opens the assistant drawer and the conversation continues there.
  const assistant = useAssistant();
  const asked = React.useRef<ModuleId | null>(null);

  const submit = (v: string) => {
    if (assistant) {
      setText("");
      assistant.setOpen(true);
      assistant.send(v);
      return;
    }
    setText("");
    setReply(null);
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      // A reply to "Which game is it for?" carries the module it was asked about.
      answer(reply?.kind === "ask" && !INTENT.test(v) ? `Create a ${MODULE_LABEL[reply.module]} project for ${v}` : v);
    }, 700);
  };

  /** A one-click prompt (a task suggestion): sent as if typed. */
  const ask = (v: string) => submit(v);

  const href = (r: Extract<Reply, { kind: "card" }>, step: "2" | "done") =>
    `/dashboard/create-project?${new URLSearchParams({ from: r.folderId, folder: r.folderId, q: r.q, mods: r.module, step, via: "ai" })}`;
  const pathOf = (id: string) => trailNames(client, findTrail(root, isFolderId(id)) ?? [root]).join(" / ");

  /** The reply's content, the same in the drawer and above the bar. */
  const replyBody = (reply: Reply) => (
    <>
      {reply.kind === "card" ? (
        <>
          <p className="text-sm text-foreground">Here&apos;s the project I&apos;ll create. Everything can be changed.</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Game</dt>
            <dd className="font-medium text-foreground">{reply.title}</dd>
            <dt className="text-muted-foreground">Folder</dt>
            <dd className="text-foreground">
              {pathOf(reply.folderId)} <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">Suggested</span>
            </dd>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground">{reply.module === "webstore" ? `${reply.title} Store` : reply.title}</dd>
            <dt className="text-muted-foreground">Module</dt>
            <dd className="text-foreground">{MODULE_LABEL[reply.module]}</dd>
            {reply.module === "webstore" ? (
              <>
                <dt className="text-muted-foreground">Starter content</dt>
                <dd className="text-foreground">On</dd>
              </>
            ) : null}
          </dl>
          <div className="mt-4 flex gap-2">
            {/* An arrow on every button that takes you into the dashboard (not on ones that act right here in the chat). */}
            <Button size="sm" onClick={() => router.push(href(reply, "done"))}>
              Create project
              <IconArrowRight data-icon="inline-end" aria-hidden />
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push(href(reply, "2"))}>
              Edit details
              <IconArrowRight data-icon="inline-end" aria-hidden />
            </Button>
          </div>
        </>
      ) : reply.kind === "folder" ? (
        <>
          <p className="text-sm text-foreground">
            {folderTooDeep ? (
              // The 4-level limit, as the AI's answer (it won't make folders here).
              <span className="text-destructive">
                {destination} is already {MAX_FOLDER_DEPTH} levels deep, so I can&apos;t make a folder inside it. {TOO_DEEP.split(". ")[0]}.
                Pick a folder higher up and ask again.
              </span>
            ) : reply.names.length > 1 ? (
              <>
                I&apos;ll make {reply.names.length} folders in {destination}: {reply.names.map((n, i) => (
                  <React.Fragment key={n}>
                    {i ? (i === reply.names.length - 1 ? " and " : ", ") : null}
                    <span className="font-medium">{n}</span>
                  </React.Fragment>
                ))}
                .
              </>
            ) : reply.names.length ? (
              <>
                I&apos;ll make a folder called <span className="font-medium">{reply.names[0]}</span> in {destination}. You can pick another place before it&apos;s created.
              </>
            ) : (
              <>
                Folders group your projects, for example one per studio or genre, and folders can sit inside folders. Name the first one, or tell me
                several: &ldquo;Create folders called Studio 01 and Studio 02&rdquo;.
              </>
            )}
          </p>
          <div className="mt-4 flex gap-2">
            {folderTooDeep ? null : reply.names.length > 1 ? (
              <Button
                size="sm"
                onClick={() => {
                  // Straight into the company, at the folder in view, one after another.
                  reply.names.forEach((n) => edit((t) => insertFolder(t, folderId, { kind: "folder", id: makeFolderId(n), name: n, children: [] })));
                  toast(`${reply.names.length} folders created in ${destination}`);
                }}
              >
                Create {reply.names.length} folders
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  router.replace(`${pathname}?${new URLSearchParams({ panel: "new-folder", parent: folderId, ...(reply.names[0] ? { name: reply.names[0] } : {}) })}`, { scroll: false })
                }
              >
                {reply.names.length ? "Create folder" : "New folder"}
                <IconArrowRight data-icon="inline-end" aria-hidden />
              </Button>
            )}
          </div>
        </>
      ) : reply.kind === "module" ? (
        (() => {
          const target = projects.find((p) => p.id === reply.projectId);
          const what = reply.module ? MODULE_LABEL[reply.module] : "a module";
          if (target)
            return (
              <>
                <p className="text-sm text-foreground">
                  Add <span className="font-medium">{what}</span> to {target.project}? It goes to Production and every sandbox. You can’t remove it later.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => openAddModule(target, reply.module)}>
                    {reply.module ? `Add ${what}` : "Choose a module"}
                    <IconArrowRight data-icon="inline-end" aria-hidden />
                  </Button>
                </div>
              </>
            );
          if (!projects.length)
            return (
              <p className="text-sm text-foreground">
                There&apos;s no project yet to add a module to. Create one first: &ldquo;Create a Webstore project for Word Rush&rdquo;.
              </p>
            );
          return (
            <>
              <p className="text-sm text-foreground">Which project should get {what}?</p>
              <div className="mt-3 flex flex-col gap-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openAddModule(p, reply.module)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    {p.gameIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.gameIcon} alt="" className="size-5 rounded-[5px] object-cover" />
                    ) : (
                      <span className="flex size-5 items-center justify-center rounded-[5px] bg-muted text-[8px] font-semibold">{p.gameInitials}</span>
                    )}
                    <span className="min-w-0 flex-1 truncate">{p.project}</span>
                  </button>
                ))}
              </div>
            </>
          );
        })()
      ) : reply.kind === "ask" ? (
        <p className="text-sm text-foreground">
          Which game is the {MODULE_LABEL[reply.module]} project for? Type its exact name or paste its App Store or Google Play link, and I&apos;ll look it up.
        </p>
      ) : (
        <>
          <p className="text-sm text-foreground">I can organize your company into folders, create a project, or add a module to a project. Pick one, or just ask.</p>
          <TaskButtons onPick={(v) => ask(v)} />
        </>
      )}
    </>
  );
  // Focused and empty: the three test tasks as one-click starts, above the bar.
  const suggestions =
    focused && !text && !reply && !thinking ? (
      <ReplyCard onClose={() => inputRef.current?.blur()}>
        <p className="text-sm text-foreground">What do you want to do?</p>
        <TaskButtons onPick={(v) => ask(v)} />
      </ReplyCard>
    ) : null;
  const above = reply ? <ReplyCard onClose={() => setReply(null)}>{replyBody(reply)}</ReplyCard> : suggestions;

  // The drawer's replies come from here too, so asking there can create a project.
  React.useEffect(() => {
    assistant?.setResponder((v) => {
      const r = understand(v, asked.current);
      asked.current = r.kind === "ask" ? r.module : null;
      return replyBody(r);
    });
  });


  return (
    <FloatingAIPrompt
      className={className}
      value={text}
      onValueChange={setText}
      onSubmit={submit}
      isLoading={thinking}
      collapsible={variant !== "hero"}
      forceExpanded={!!reply}
      variant={variant}
      ghost={ghost}
      onAcceptGhost={() => completion && setText(completion.value)}
      inputRef={inputRef}
      onFocusChange={setFocused}
      placeholder={reply?.kind === "ask" ? "Game name or store link…" : variant === "hero" ? "Work with Appcharge AI" : "Ask AI anything…"}
      above={above}
    />
  );
}

/** The assistant's reply, floating above the prompt. */
function ReplyCard({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className={cn("relative w-full max-w-[460px] rounded-2xl border border-border bg-background p-4 pr-10 shadow-lg", "animate-in fade-in-0 slide-in-from-bottom-2 duration-200")}>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ShorthandMark className="size-3.5 text-foreground" />
        Appcharge AI
      </div>
      {children}
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
        <IconX className="size-4" />
      </button>
    </div>
  );
}

/** The three test tasks as buttons (the intro's words). Mouse-down keeps the prompt focused, so the click lands. */
function TaskButtons({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mt-3 flex flex-col gap-1">
      {TASK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
        <button
          key={label}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(prompt)}
          className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
        >
          <Icon weight="fill" className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
