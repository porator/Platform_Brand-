"use client";

import * as React from "react";
import { IconArrowsDiagonalMinimize2, IconNotePencil, IconX } from "@/lib/icons";
import { AppchargeCoin, AppchargeMark } from "@/components/dashboard/appcharge-coin";
import { useAssistant, type Turn } from "@/components/dashboard/assistant-drawer";
import { Button } from "@/components/ui/button";
import { AIComposer } from "@/components/ai/ai-composer";
import { withViewTransition } from "@/components/ai/view-transition";
import { cn } from "@/lib/utils";

/*
 * The Overview's AI experience (Shopify Home / Sidekick style):
 *   OverviewPrompt  — the greeting and the centred composer on the Overview;
 *   AIWorkspace     — after a prompt, the conversation takes over the workspace panel (navigation stays);
 *   AIConversation  — the scrolling list of AIMessage (you, right) and AIResponse (the AI, left);
 *   AIComposer      — ai-composer.tsx, shared by both, so it morphs from the centre to the bottom.
 * Conversation state lives in the shell's AssistantProvider (assistant-drawer.tsx): turns, send, reset, recents,
 * and `workspace` (which view shows). Replies come from the registered Responder — today the prototype's mock that
 * can create folders and projects; a real AI API plugs in there.
 */

export { withViewTransition };

/** Overview → workspace / workspace → Overview / a fresh conversation. */
export function useAIWorkspace() {
  const assistant = useAssistant();
  return {
    assistant,
    /** Ask from the Overview: the conversation takes over the workspace, with this prompt as its first message. */
    start: (prompt: string) =>
      withViewTransition(() => {
        if (!assistant) return;
        assistant.setOpen(false);
        assistant.reset();
        assistant.send(prompt);
        assistant.setWorkspace(true);
      }),
    /** Back to the Overview (the conversation is kept; its prompts stay in Recents). */
    close: () => withViewTransition(() => assistant?.setWorkspace(false)),
    /** Clear the conversation and stay in the workspace, on its empty state. */
    restart: () => withViewTransition(() => assistant?.reset()),
    /** Collapse to the docked side panel (the drawer), keeping the conversation; the page comes back beside it. */
    collapse: () =>
      withViewTransition(() => {
        assistant?.setWorkspace(false);
        assistant?.setOpen(true);
      }),
  };
}


/** The project Overview's AI entry (Figma 130:2442): a Gellix greeting, then the composer as the page's main
 *  interaction. */
export function OverviewPrompt({ className }: { className?: string }) {
  const { assistant, start } = useAIWorkspace();
  return (
    <section aria-label="Ask Appcharge AI" className={cn("mx-auto flex w-full max-w-[560px] flex-col items-center gap-8", className)}>
      <h2 className="text-center font-brand text-[31px] leading-[1.05] font-medium tracking-[-0.02em] text-[#272727] text-balance">
        You’re in!
        <br />
        Let’s make your webstore thrive.
      </h2>
      <AIComposer variant="hero" placeholder="How can I help you today?" onSubmit={start} recents={assistant?.recents} />
    </section>
  );
}

/** A message you sent: right-aligned, in a soft bubble. */
export function AIMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap text-foreground">{children}</p>
    </div>
  );
}

/** The AI's reply: left-aligned with the Appcharge mark; three pulsing dots while it's generating. */
export function AIResponse({ children, loading }: { children?: React.ReactNode; loading?: boolean }) {
  return (
    <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
      <AppchargeMark className="mt-0.5 size-6 shrink-0" />
      {loading ? (
        <span className="flex items-center gap-1 pt-2.5" role="status" aria-label="Appcharge AI is answering">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" style={{ animationDelay: `${d * 150}ms` }} />
          ))}
        </span>
      ) : (
        // Formatted replies: paragraphs, lists, links and the reply's own buttons.
        <div className="min-w-0 flex-1 text-[15px] leading-6 text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      )}
    </div>
  );
}

/** The conversation, oldest first. */
export function AIConversation({ turns }: { turns: Turn[] }) {
  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      {turns.map((t, i) => (
        <React.Fragment key={i}>
          <AIMessage>{t.you}</AIMessage>
          <AIResponse loading={t.ai === null}>{t.ai}</AIResponse>
        </React.Fragment>
      ))}
    </div>
  );
}

const NO_TURNS: Turn[] = [];
const STARTERS = ["Organize my company into folders", "Create a new project", "Add a module to an existing project"];

/** The full-page AI workspace inside the workspace panel: a top bar, the conversation, and the composer at the bottom. */
export function AIWorkspace() {
  const { assistant, close, restart, collapse } = useAIWorkspace();
  const turns = assistant?.turns ?? NO_TURNS;
  const generating = turns.length > 0 && turns.at(-1)!.ai === null;
  const title = turns[0]?.you ?? "New conversation";
  const end = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border/80 px-4 sm:px-6">
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground" title={title}>
          {title}
        </h1>
        {/* New conversation, collapse to the side panel, close: round icon buttons (Sidekick-style). */}
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="outline" size="icon-sm" aria-label="New conversation" title="New conversation" className="rounded-full" onClick={restart} disabled={!turns.length}>
            <IconNotePencil className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Collapse to the side panel" title="Collapse to the side panel" className="rounded-full" onClick={collapse}>
            <IconArrowsDiagonalMinimize2 className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close and go back to the Overview" title="Close" className="rounded-full" onClick={close}>
            <IconX className="size-4" />
          </Button>
        </div>
      </div>

      {/* Scrolls on its own; the navigation and the composer stay put. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6">
          {turns.length ? (
            <AIConversation turns={turns} />
          ) : (
            <div className="flex flex-col items-center gap-4 pt-[10vh] text-center animate-in fade-in-0 duration-300 motion-reduce:animate-none">
              <AppchargeCoin size={52} />
              <p className="text-xl font-medium tracking-tight text-foreground">Where should we begin?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <Button key={s} type="button" variant="outline" size="sm" className="h-8 px-3 text-nav" onClick={() => assistant?.send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div ref={end} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[720px] shrink-0 px-4 pt-2 pb-4 sm:px-6">
        <AIComposer placeholder="Ask with AI..." onSubmit={(p) => assistant?.send(p)} loading={generating} recents={assistant?.recents} autoFocus />
      </div>
    </div>
  );
}
