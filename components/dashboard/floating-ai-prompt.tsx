"use client";

import * as React from "react";
import {
  IconPlus,
  IconMicrophone,
  IconLayoutSidebarRight,
  IconArrowUp,
  IconLoader2,
} from "@/lib/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AssistantPanel, useAssistant } from "@/components/dashboard/assistant-drawer";
import { AppchargeCoin } from "@/components/dashboard/appcharge-coin";
import { cn } from "@/lib/utils";

export interface FloatingAIPromptProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onAddContext?: () => void;
  onVoiceInput?: () => void;
  onExpand?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  /** Start as a short pill (mark + placeholder) and widen to the full bar once the user types. */
  collapsible?: boolean;
  /** Keep the full width even while empty (e.g. while a reply is showing above). */
  forceExpanded?: boolean;
  onFocusChange?: (focused: boolean) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  /** Content stacked above the bar, centred on it (replies). */
  above?: React.ReactNode;
  /** Inline completion: the text that would follow what's typed, shown in grey after it. Tab (or → at the end) accepts it. */
  ghost?: string;
  onAcceptGhost?: () => void;
  /** No side-panel button (and no divider): for a bar that lives inside a form, like Create project's store step. */
  noPanel?: boolean;
  /** Visual size: "default" (the floating bar), "inline" (shorter, a lighter shadow) or "hero" (the Overview's
   *  Sidekick-style box: the prompt on top, the mark and actions on a row under it). */
  variant?: "default" | "inline" | "hero";
}

/** Icon-only action with a tooltip — reuses the design-system Button + Tooltip. */
function PromptAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className="rounded-full text-muted-foreground"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Shopify-Sidekick-style floating AI prompt, built from the Appcharge design
 * system: a pill with the assistant mark, a prompt input, add-context and voice
 * actions, a divider, and an expand control that opens the assistant in a panel.
 */
export function FloatingAIPrompt({
  placeholder = "Ask AI anything…",
  value,
  onValueChange,
  onSubmit,
  onAddContext,
  onVoiceInput,
  onExpand,
  isLoading,
  disabled,
  className,
  collapsible = false,
  forceExpanded = false,
  onFocusChange,
  inputRef,
  above,
  ghost,
  onAcceptGhost,
  noPanel = false,
  variant = "default",
}: FloatingAIPromptProps) {
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState("");
  const [busy, setBusy] = React.useState(false); // prototype processing state
  const [expanded, setExpanded] = React.useState(false);
  const text = controlled ? value! : internal;
  const loading = isLoading || busy;

  const setText = (v: string) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
  };

  const submit = () => {
    const v = text.trim();
    if (!v || loading || disabled) return;
    if (onSubmit) {
      onSubmit(v);
    } else {
      // No integration wired yet: show the processing state, then clear.
      setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        if (!controlled) setInternal("");
        onValueChange?.("");
      }, 900);
      return;
    }
    if (!controlled) setInternal("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const atEnd = e.currentTarget.selectionStart === e.currentTarget.value.length;
    if (ghost && (e.key === "Tab" || (e.key === "ArrowRight" && atEnd))) {
      e.preventDefault();
      onAcceptGhost?.();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const addContext = onAddContext ?? (() => toast("Attach context", { description: "Files, screenshots and page context — coming soon." }));
  const voiceInput = onVoiceInput ?? (() => toast("Voice input", { description: "Talk to Copilot — coming soon." }));
  // Open the assistant: docked in the workspace when there's a drawer (dashboard), else in a side sheet.
  const assistant = useAssistant();
  const expand = () => {
    onExpand?.();
    if (assistant) assistant.setOpen(true);
    else setExpanded(true);
  };

  const canSubmit = text.trim().length > 0 && !loading && !disabled;
  // Short until there's something typed (or a reply is showing); the width animates between the two.
  const short = collapsible && !forceExpanded && text.length === 0 && !loading;

  // The hero box (Overview): a roomy prompt with the mark bottom-left and the actions bottom-right, like Shopify Home.
  const hero = (
    <div className="w-full max-w-[680px] rounded-[20px] border border-border bg-background px-4 pt-3.5 pb-3 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-8px_rgb(0_0_0/0.12)] transition-colors focus-within:border-foreground/25">
      <div className="relative flex min-h-11 items-start">
        {ghost ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-[15px] leading-6 whitespace-pre">
            <span className="invisible">{text}</span>
            <span className="text-muted-foreground/60">{ghost}</span>
            <kbd className="ml-2 rounded border border-border px-1 font-sans text-[10px] leading-4 text-muted-foreground">Tab</kbd>
          </div>
        ) : null}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          ref={inputRef}
          placeholder={placeholder}
          disabled={disabled || loading}
          aria-label="Ask AI anything"
          className="relative w-full bg-transparent text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
      </div>
      <div className="mt-1 flex items-center gap-0.5">
        <span className="flex size-7 shrink-0 items-center justify-center" aria-hidden>
          {loading ? <IconLoader2 className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" /> : <AppchargeCoin size={22} />}
        </span>
        <span className="flex-1" />
        <PromptAction label="Add context" onClick={addContext} disabled={disabled}>
          <IconPlus className="size-4" />
        </PromptAction>
        <PromptAction label="Voice input" onClick={voiceInput} disabled={disabled}>
          <IconMicrophone className="size-4" />
        </PromptAction>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        {canSubmit ? (
          <PromptAction label="Send" onClick={submit}>
            <IconArrowUp className="size-4" />
          </PromptAction>
        ) : (
          <PromptAction label="Open in side panel" onClick={expand} disabled={disabled}>
            <IconLayoutSidebarRight className="size-4" />
          </PromptAction>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider delay={200} closeDelay={80}>
      <div className={cn("flex w-full max-w-[680px] flex-col items-center gap-2", className)}>
      {above}
      {variant === "hero" ? hero : (
      <div
        className={cn(
          "flex w-full items-center gap-1.5 rounded-full border border-border bg-background pr-2 pl-3 transition-[max-width] duration-300 ease-out motion-reduce:transition-none",
          variant === "inline" ? "h-12 shadow-sm focus-within:border-foreground/25" : "h-14 shadow-lg",
          short ? "max-w-[380px]" : "max-w-[680px]",
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center text-foreground" aria-hidden>
          {loading ? (
            <IconLoader2 className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" />
          ) : (
            // The Appcharge mark as a coin that flips now and then (still for reduced motion).
            <AppchargeCoin size={22} />
          )}
        </span>

        <div className="relative flex min-w-0 flex-1 items-center">
        {/* Inline completion: the typed text (invisible, for spacing) then the suggested rest in grey. */}
        {ghost ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm whitespace-pre">
            <span className="invisible">{text}</span>
            <span className="text-muted-foreground/60">{ghost}</span>
            <kbd className="ml-2 rounded border border-border px-1 font-sans text-[10px] leading-4 text-muted-foreground">Tab</kbd>
          </div>
        ) : null}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          ref={inputRef}
          placeholder={placeholder}
          disabled={disabled || loading}
          aria-label="Ask AI anything"
          className="relative min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
        </div>

        {/* Always there, even on the short pill: add context, voice, and open in the side panel (Sidekick-style). */}
        <div className="flex shrink-0 items-center gap-0.5">
          <PromptAction label="Add context" onClick={addContext} disabled={disabled}>
            <IconPlus className="size-4" />
          </PromptAction>
          <PromptAction label="Voice input" onClick={voiceInput} disabled={disabled}>
            <IconMicrophone className="size-4" />
          </PromptAction>
          {noPanel ? null : <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />}
          {canSubmit ? (
            <PromptAction label="Send" onClick={submit}>
              <IconArrowUp className="size-4" />
            </PromptAction>
          ) : noPanel ? null : (
            <PromptAction label="Open in side panel" onClick={expand} disabled={disabled}>
              <IconLayoutSidebarRight className="size-4" />
            </PromptAction>
          )}
        </div>
      </div>
      )}
      </div>

      {/* Outside the dashboard shell (no workspace drawer), the assistant opens in a side sheet instead. */}
      <Sheet open={expanded} onOpenChange={setExpanded}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="top-2! right-2! bottom-2! h-auto! w-[calc(100vw-1rem)] gap-0 overflow-hidden rounded-2xl border border-border p-0 sm:max-w-[400px]"
        >
          <SheetTitle className="sr-only">Appcharge AI</SheetTitle>
          <SheetDescription className="sr-only">Work with AI across your stores, offers and data.</SheetDescription>
          <AssistantPanel onClose={() => setExpanded(false)} className="h-full" />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
