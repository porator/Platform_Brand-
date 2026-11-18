"use client";

import * as React from "react";
import { IconSearch, IconX, IconLoader2, IconFileText } from "@/lib/icons";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search…",
  loading,
  shortcut,
  ariaLabel = "Search",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  shortcut?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {loading ? (
        <InputGroupAddon align="inline-end">
          <IconLoader2 className="animate-spin" aria-hidden />
        </InputGroupAddon>
      ) : value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={onClear}>
            <IconX />
          </InputGroupButton>
        </InputGroupAddon>
      ) : shortcut ? (
        <InputGroupAddon align="inline-end">
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[0.625rem] text-muted-foreground">
            {shortcut}
          </kbd>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

const PAGES = [
  "Dashboard",
  "Projects",
  "Builds",
  "Releases",
  "Testers",
  "Settings",
  "Environment variables",
  "Access tokens",
  "Audit log",
];

export function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [committed, setCommitted] = React.useState("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced "search": show a brief loading state, then commit the query.
  function handleChange(v: string) {
    setQuery(v);
    clearTimeout(timer.current);
    if (!v) {
      setLoading(false);
      setCommitted("");
      return;
    }
    setLoading(true);
    timer.current = setTimeout(() => {
      setCommitted(v);
      setLoading(false);
    }, 400);
  }

  const results = React.useMemo(() => {
    const q = committed.trim().toLowerCase();
    if (!q) return [];
    return PAGES.filter((p) => p.toLowerCase().includes(q));
  }, [committed]);

  const showPanel = query.length > 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Form & Controls"
        title="Search"
        description={
          <>
            A reusable search control — the <Mono>Input</Mono> atom in an <Mono>InputGroup</Mono> with
            a leading icon, a clear action and an optional shortcut hint. Generic and reusable across
            any surface.
          </>
        }
      />

      <Section
        title="Basic example"
        description="Type to search a list; results appear below with a brief loading state, and the clear button resets it."
      >
        <div className="max-w-sm">
          <SearchInput
            value={query}
            onChange={handleChange}
            onClear={() => handleChange("")}
            placeholder="Search pages…"
            loading={loading}
          />
          {showPanel ? (
            <div className="mt-2 border border-border bg-popover text-popover-foreground shadow-sm">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                  <IconLoader2 className="size-4 animate-spin" aria-hidden />
                  Searching…
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results for <Mono>{committed}</Mono>.
                </div>
              ) : (
                <ul className="py-1">
                  {results.map((r) => (
                    <li key={r}>
                      <button className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                        <IconFileText className="size-4 text-muted-foreground" aria-hidden />
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </Section>

      <Section title="States" description="Focus is live. The remaining states are shown explicitly.">
        <div className="flex flex-col gap-6">
          <Row label="Empty" className="max-w-sm">
            <SearchInput value="" onChange={() => {}} placeholder="Search…" />
          </Row>
          <Row label="Filled" className="max-w-sm">
            <SearchInput value="releases" onChange={() => {}} onClear={() => {}} />
          </Row>
          <Row label="Loading" className="max-w-sm">
            <SearchInput value="rel" onChange={() => {}} loading />
          </Row>
          <Row label="With shortcut" hint="Hint a global ⌘K palette when empty." className="max-w-sm">
            <SearchInput value="" onChange={() => {}} shortcut="⌘K" placeholder="Search everything…" />
          </Row>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Uses <Mono>type=&quot;search&quot;</Mono> with an accessible label, so it is announced
              as a search field.
            </>,
            "The clear control is a labelled button, reachable and operable by keyboard.",
            "Loading and empty-result states are communicated as text, not spinner-only.",
            "The shortcut hint is decorative; the field works without it.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
