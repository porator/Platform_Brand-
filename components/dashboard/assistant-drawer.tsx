"use client";

import * as React from "react";
import { IconArrowUp, IconArrowsDiagonal, IconArrowsDiagonalMinimize2, IconHistory, IconMicrophone, IconPlus, IconX } from "@/lib/icons";
import { toast } from "sonner";
import { AppchargeCoin, AppchargeMark } from "@/components/dashboard/appcharge-coin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/components/ai/view-transition";

/** The Recents button in the assistant's header (past conversations): hidden for now. */
const SHOW_RECENTS = false;

/**
 * The AI assistant as a drawer that's part of the workspace (Sidekick-style): opened from the Ask AI bar's side-panel
 * button, it docks to the right of the page, which narrows to make room. No layer over the page and no backdrop.
 */
/** One exchange: what was asked, and the reply (null while the assistant is thinking). */
export type Turn = { you: string; ai: React.ReactNode | null };
/** Turns a prompt into the assistant's reply. The Ask AI bar registers one that can create projects. */
export type Responder = (prompt: string) => React.ReactNode;

const FALLBACK = "Thanks. In this prototype the assistant doesn’t answer yet, but this is where it would.";

type Conversation = { turns: Turn[]; send: (prompt: string) => void; reset: () => void };
type Assistant = Conversation & {
  open: boolean;
  setOpen: (v: boolean) => void;
  /** The full-page AI workspace (ai-workspace.tsx): the conversation takes over the workspace panel. */
  workspace: boolean;
  setWorkspace: (v: boolean) => void;
  /** Every prompt asked this session, newest first (the composer's Recents). */
  recents: string[];
  /** Sets who answers prompts (kept in a ref, so it can change every render). */
  setResponder: (r: Responder | null) => void;
};
const AssistantContext = React.createContext<Assistant | null>(null);

/** The workspace's assistant drawer, when there is one (the dashboard shell). */
export const useAssistant = () => React.useContext(AssistantContext);

/** A conversation: each prompt gets a short "thinking" beat, then the responder's reply. */
function useConversationState(responder: React.RefObject<Responder | null>): Conversation {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const send = React.useCallback(
    (prompt: string) => {
      const v = prompt.trim();
      if (!v) return;
      setTurns((t) => [...t, { you: v, ai: null }]);
      window.setTimeout(() => {
        const ai = responder.current?.(v) ?? FALLBACK;
        setTurns((t) => t.map((turn, i) => (i === t.length - 1 && turn.ai === null ? { ...turn, ai } : turn)));
      }, 700);
    },
    [responder],
  );
  const reset = React.useCallback(() => setTurns([]), []);
  return { turns, send, reset };
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [workspace, setWorkspace] = React.useState(false);
  const [recents, setRecents] = React.useState<string[]>([]);
  const responder = React.useRef<Responder | null>(null);
  const { turns, send: say, reset } = useConversationState(responder);
  const send = React.useCallback(
    (prompt: string) => {
      const v = prompt.trim();
      if (v) setRecents((r) => [v, ...r.filter((x) => x !== v)].slice(0, 8));
      say(prompt);
    },
    [say],
  );
  const setResponder = React.useCallback((r: Responder | null) => {
    responder.current = r;
  }, []);
  const value = React.useMemo(
    () => ({ open, setOpen, workspace, setWorkspace, recents, turns, send, reset, setResponder }),
    [open, workspace, recents, turns, send, reset, setResponder],
  );
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

/** The drawer's contents: Recents and controls on top, the conversation (or a welcome) in the middle, the prompt below. */
export function AssistantPanel({
  onClose,
  className,
  expanded,
  onToggleExpand,
}: {
  onClose: () => void;
  className?: string;
  /** Docked drawer only: whether it's widened, and the toggle for the Expand button (no button without it). */
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const [text, setText] = React.useState("");
  // The workspace's conversation (shared with the Ask AI bar), or a local one outside the dashboard.
  const assistant = useAssistant();
  const noResponder = React.useRef<Responder | null>(null);
  const local = useConversationState(noResponder);
  const { turns, send: say } = assistant ?? local;
  const end = React.useRef<HTMLDivElement>(null);
  const soon = (title: string, description = "Coming soon.") => () => toast(title, { description });
  // Keep the newest exchange in view.
  React.useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  const send = () => {
    if (!text.trim()) return;
    say(text);
    setText("");
  };

  return (
    <div className={cn("flex min-h-0 flex-col bg-background", className)}>
      <div className="flex items-center gap-1 p-3">
        {/* Recents is hidden for now; flip SHOW_RECENTS to bring it back. */}
        {SHOW_RECENTS ? (
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={soon("Recents", "Your past conversations — coming soon.")}>
            <IconHistory className="size-4" />
            Recents
          </Button>
        ) : null}
        <span className="flex-1" />
        {/* Expand: widens the docked panel (Settings was here). */}
        {onToggleExpand ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Collapse assistant" : "Open the full AI workspace"}
            title={expanded ? "Collapse" : "Open the full AI workspace"}
            aria-pressed={expanded}
            className="rounded-full text-muted-foreground"
            onClick={onToggleExpand}
          >
            {expanded ? <IconArrowsDiagonalMinimize2 className="size-4" /> : <IconArrowsDiagonal className="size-4" />}
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Close assistant" className="rounded-full text-muted-foreground" onClick={onClose}>
          <IconX className="size-4" />
        </Button>
      </div>

      {turns.length ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2 text-sm" aria-live="polite">
          {turns.map((t, i) => (
            <React.Fragment key={i}>
              <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-muted px-3 py-2">{t.you}</p>
              <div className="flex max-w-[92%] items-start gap-2 self-start text-foreground">
                <AppchargeMark className="mt-0.5 size-5 shrink-0" />
                {t.ai === null ? (
                  <span className="flex items-center gap-1 pt-1.5" aria-label="Thinking">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" style={{ animationDelay: `${d * 150}ms` }} />
                    ))}
                  </span>
                ) : (
                  <div className="min-w-0 flex-1">{t.ai}</div>
                )}
              </div>
            </React.Fragment>
          ))}
          <div ref={end} />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <AppchargeCoin size={52} />
          <p className="text-xl font-medium tracking-tight text-foreground">Where should we begin?</p>
        </div>
      )}

      <div className="p-3">
        {/* Floating prompt: 14px corners (DS xl, like the panels), the DS border token, see-through, and a soft drop shadow in the DS base black at 8%. */}
        <div className="rounded-xl border border-border bg-transparent p-3 shadow-[0_10px_24px_0_rgb(0_0_0/0.08)] focus-within:border-foreground/25">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Work with Appcharge AI"
            rows={2}
            aria-label="Ask AI anything"
            className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-1 flex items-center gap-0.5">
            <span className="flex-1" />
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Add context" className="rounded-full text-muted-foreground" onClick={soon("Attach context", "Files, screenshots and page context — coming soon.")}>
              <IconPlus className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Voice input" className="rounded-full text-muted-foreground" onClick={soon("Voice input")}>
              <IconMicrophone className="size-4" />
            </Button>
            {text.trim() ? (
              <Button type="button" size="icon-sm" aria-label="Send" onClick={send} className="ml-1 rounded-full">
                <IconArrowUp className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The docked drawer: a card beside the page, the same height, with the workspace frame showing between them. */
export function AssistantDrawer() {
  const assistant = useAssistant();
  if (!assistant?.open) return null;
  // Expand opens the full AI workspace (ai-workspace.tsx) with the same conversation; its Collapse brings it back here.
  const expand = () =>
    withViewTransition(() => {
      assistant.setOpen(false);
      assistant.setWorkspace(true);
    });
  return (
    <aside
      data-docked-drawer
      aria-label="Appcharge AI"
      className="ml-2 flex w-[380px] shrink-0 animate-in flex-col overflow-hidden rounded-xl bg-white shadow-(--frame-shadow) fade-in-0 slide-in-from-right-4 duration-200 motion-reduce:animate-none"
    >
      <AssistantPanel onClose={() => assistant.setOpen(false)} onToggleExpand={expand} className="h-full" />
    </aside>
  );
}
