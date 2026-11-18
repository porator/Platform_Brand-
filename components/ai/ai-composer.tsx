"use client";

import * as React from "react";
import { toast } from "sonner";
import { IconArrowUp, IconDots, IconHistory, IconLoader2, IconMicrophone, IconPaperclip } from "@/lib/icons";
import { AppchargeCoin } from "@/components/dashboard/appcharge-coin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** The composer's shared element name: the Overview's composer and the workspace's dock morph into each other. */
export const COMPOSER_TRANSITION = "ai-composer";

export type AIComposerProps = {
  placeholder: string;
  /** Called with the trimmed prompt. Return nothing; the composer clears itself. */
  onSubmit: (prompt: string) => void;
  /** Disables sending and shows the spinner (e.g. while the AI is generating). */
  loading?: boolean;
  /** Earlier prompts, newest first: the Recents menu fills the composer with one. */
  recents?: string[];
  /** "hero" on the Overview, "dock" at the bottom of the AI workspace (same size; both one line until you type more). */
  variant?: "hero" | "dock";
  autoFocus?: boolean;
  className?: string;
};

const MAX_HEIGHT = 168;
/** The Recents menu (earlier prompts): hidden for now. */
const SHOW_RECENTS = false;
/** The Attach a file button: hidden for now. */
const SHOW_ATTACH = false;

/**
 * The AI prompt composer (Overview and AI workspace): the Appcharge coin on the left, the prompt growing with what's
 * typed, and Recents, Attach, More and Send on the right. Enter sends, Shift + Enter adds a line; Send is off while
 * the prompt is empty or the AI is answering.
 */
export function AIComposer({ placeholder, onSubmit, loading, recents = [], autoFocus, className }: AIComposerProps) {
  const [text, setText] = React.useState("");
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0 && !loading;

  // Grow with the text, up to MAX_HEIGHT, then scroll inside.
  const fit = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, []);
  React.useLayoutEffect(fit, [text, fit]);
  React.useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const submit = () => {
    const v = text.trim();
    if (!v || loading) return;
    onSubmit(v);
    setText("");
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };
  const use = (prompt: string) => {
    setText(prompt);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(prompt.length, prompt.length);
    });
  };
  const soon = (title: string, description?: string) => () => toast(title, { description });

  return (
    <div
      // The shared element of the Overview → workspace transition (view transitions).
      style={{ viewTransitionName: COMPOSER_TRANSITION }}
      className={cn(
        // One row, 56px tall (like the floating Ask AI bar): the coin, the prompt, the actions. It grows downward as
        // the prompt wraps, with the coin and actions staying on the last line.
        "flex w-full cursor-text items-end gap-1 rounded-[28px] border border-border bg-background py-2.5 pr-2 pl-3 transition-[border-color,box-shadow] focus-within:border-foreground/12",
        "shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-8px_rgb(0_0_0/0.12)] focus-within:shadow-[0_1px_2px_rgb(0_0_0/0.05),0_12px_28px_-10px_rgb(0_0_0/0.18)]",
        className,
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.focus();
      }}
    >
      <span className="flex h-[34px] w-7 shrink-0 items-center justify-center" aria-hidden>
        {loading ? <IconLoader2 className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" /> : <AppchargeCoin size={22} />}
      </span>
      <textarea
        ref={ref}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="block min-h-[34px] min-w-0 flex-1 resize-none bg-transparent py-[5px] text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
      />
      <div className="flex shrink-0 items-center gap-0.5">

        {/* Recent prompts (and the divider after them): hidden for now; flip SHOW_RECENTS to bring them back. */}
        {SHOW_RECENTS ? (
          <>
        {/* Recent prompts: fill the composer with one. */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full px-2.5 text-muted-foreground" aria-label="Recent prompts" />}
          >
            <IconHistory className="size-4" />
            <span className="hidden sm:inline">Recents</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Recent prompts</DropdownMenuLabel>
              {recents.length ? (
                recents.map((r) => (
                  <DropdownMenuItem key={r} onClick={() => use(r)}>
                    <span className="truncate">{r}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  Nothing yet: your prompts will show here.
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          </>
        ) : null}

        {/* Attach a file: hidden for now; flip SHOW_ATTACH to bring it back. */}
        {SHOW_ATTACH ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Attach a file" className="rounded-full text-muted-foreground" onClick={soon("Attach a file", "Files and screenshots — coming soon.")}>
            <IconPaperclip className="size-4" />
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="More options" className="rounded-full text-muted-foreground" />}>
            <IconDots className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={soon("Voice input", "Talk to Appcharge AI — coming soon.")}>
                <IconMicrophone className="size-4" />
                Voice input
              </DropdownMenuItem>
              <DropdownMenuItem onClick={soon("Page context", "Ask about what’s on this page — coming soon.")}>
                <IconPaperclip className="size-4" />
                Use this page as context
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="button" size="icon-sm" aria-label="Send" disabled={!canSend} onClick={submit} className="ml-1 rounded-full disabled:opacity-30">
          {loading ? <IconLoader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <IconArrowUp className="size-4" weight="bold" />}
        </Button>
      </div>
    </div>
  );
}
