"use client";

import * as React from "react";
import { IconSelector, IconCheck, IconLoader2 } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Field, FieldLabel } from "@/components/ui/field";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export type ComboOption = { value: string; label: string };

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  disabled,
  simulateLoading,
  id,
  ariaLabel,
  triggerClassName,
}: {
  options: ComboOption[];
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  simulateLoading?: boolean;
  id?: string;
  ariaLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selected = options.find((o) => o.value === value);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && simulateLoading) {
      setLoading(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setLoading(false), 650);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !selected && "text-muted-foreground",
              triggerClassName,
            )}
          />
        }
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <IconSelector className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-52 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <IconLoader2 className="size-4 animate-spin" aria-hidden />
                Loading…
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((o) => (
                    <CommandItem
                      key={o.value}
                      value={o.label}
                      onSelect={() => {
                        onValueChange?.(o.value);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate">{o.label}</span>
                      <IconCheck
                        className={cn(
                          "ml-auto size-4",
                          value === o.value ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const REPOS: ComboOption[] = [
  { value: "nav", label: "new-gen-wire-navigation" },
  { value: "web", label: "platform-web-dashboard" },
  { value: "infra", label: "infrastructure-terraform" },
  { value: "sdk", label: "client-sdk-typescript" },
  { value: "docs", label: "developer-docs-site" },
  { value: "api", label: "core-api-gateway" },
];

export function ComboboxPage() {
  const [repo, setRepo] = React.useState<string>("nav");
  const [repo2, setRepo2] = React.useState<string>("");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Form & Controls"
        title="Combobox"
        description={
          <>
            A searchable single-select — <Mono>Command</Mono> inside a <Mono>Popover</Mono>. Use it
            when a <Mono>Select</Mono> would be too long to scan. Typing filters the list; keyboard
            navigation is built in.
          </>
        }
      />

      <Section title="Basic example" description="A labelled, searchable repository picker.">
        <Field className="max-w-xs">
          <FieldLabel htmlFor="cb-repo">Repository</FieldLabel>
          <Combobox
            id="cb-repo"
            options={REPOS}
            value={repo}
            onValueChange={setRepo}
            placeholder="Select a repository"
            searchPlaceholder="Search repositories…"
          />
        </Field>
      </Section>

      <Section
        title="States"
        description="Open, searching and no-results are live — click a control and type. The rest are explicit."
      >
        <div className="flex flex-col gap-6">
          <Row label="Empty" className="max-w-xs">
            <Combobox
              options={REPOS}
              value={repo2}
              onValueChange={setRepo2}
              placeholder="Select a repository"
              ariaLabel="Repository (empty)"
            />
          </Row>
          <Row label="Selected" className="max-w-xs">
            <Combobox options={REPOS} value="web" onValueChange={() => {}} ariaLabel="Repository (selected)" />
          </Row>
          <Row label="Loading" hint="Simulates an async fetch each time it opens." className="max-w-xs">
            <Combobox
              options={REPOS}
              value=""
              onValueChange={() => {}}
              placeholder="Select a repository"
              ariaLabel="Repository (loading)"
              simulateLoading
            />
          </Row>
          <Row label="Disabled" className="max-w-xs">
            <Combobox options={REPOS} value="nav" disabled ariaLabel="Repository (disabled)" />
          </Row>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The trigger exposes <Mono>role=&quot;combobox&quot;</Mono> and{" "}
              <Mono>aria-expanded</Mono>, and is labelled by its field label.
            </>,
            "Type to filter; Arrow keys move, Enter selects, Esc closes and returns focus.",
            "The selected option is marked with a check, not color alone.",
            "The popover flips and never overflows the viewport on small screens.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
