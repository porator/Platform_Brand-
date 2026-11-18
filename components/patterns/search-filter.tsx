"use client";

import * as React from "react";
import { IconChevronDown } from "@/lib/icons";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/data/tag";
import { SearchInput } from "@/components/form/search";
import { BuildsTable } from "@/components/data/table";
import { BUILDS } from "@/components/data/_shared";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

const ENVIRONMENTS = ["Production", "Staging", "Development"];
const STATUSES = ["Ready", "Building", "Queued", "Failed"];

export function SearchAndFilter() {
  const [query, setQuery] = React.useState("");
  const [environment, setEnvironment] = React.useState<string | undefined>();
  const [statuses, setStatuses] = React.useState<string[]>([]);

  const toggleStatus = (s: string) =>
    setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return BUILDS.filter((b) => {
      if (q && !(`build ${b.id} ${b.version}`.toLowerCase().includes(q))) return false;
      if (environment && b.environment !== environment) return false;
      if (statuses.length && !statuses.includes(b.status)) return false;
      return true;
    });
  }, [query, environment, statuses]);

  const activeCount = (environment ? 1 : 0) + statuses.length;
  const hasCriteria = query.length > 0 || activeCount > 0;

  const clearAll = () => {
    setEnvironment(undefined);
    setStatuses([]);
  };

  return (
    <div className="space-y-4">
      {/* Search + filter controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Search builds…"
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={Object.fromEntries(ENVIRONMENTS.map((e) => [e, e]))}
            value={environment ?? ""}
            onValueChange={(v) => setEnvironment(v ?? undefined)}
          >
            <SelectTrigger size="sm" aria-label="Environment" className="w-36">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              {ENVIRONMENTS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
              Status
              {statuses.length > 0 ? (
                <Badge variant="secondary" className="ml-0.5">
                  {statuses.length}
                </Badge>
              ) : null}
              <IconChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1">
              {STATUSES.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
                  <Checkbox checked={statuses.includes(s)} onCheckedChange={() => toggleStatus(s)} />
                  {s}
                </label>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters */}
      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {environment ? <Tag onRemove={() => setEnvironment(undefined)}>{environment}</Tag> : null}
          {statuses.map((s) => (
            <Tag key={s} onRemove={() => toggleStatus(s)}>
              {s}
            </Tag>
          ))}
          <Button variant="ghost" size="xs" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      ) : null}

      {/* Results */}
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
        <BuildsTable
          data={results}
          withActions
          emptyMessage={
            hasCriteria
              ? "No builds match your search and filters. Try widening them."
              : "No builds yet."
          }
        />
      </div>
    </div>
  );
}

export function SearchFilterPage() {
  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Patterns"
        title="Search & Filter"
        description={
          <>
            Search, filters and results working as one — the standard way to find things in a list or
            table. <strong className="text-foreground">When to use:</strong> any collection large
            enough that scanning isn&apos;t enough. It composes Search, Filters and the Table/List.
          </>
        }
      />

      <Section
        title="Anatomy"
        description="A search field and filter controls drive a live result set below. Type a version, pick an environment, or toggle statuses — the table updates and shows an empty state when nothing matches."
      >
        <div className="rounded-md border border-border p-4">
          <SearchAndFilter />
        </div>
      </Section>

      <Section title="States">
        <A11yList
          items={[
            "Default — all results shown, no criteria.",
            "Searching / filtered — the result count updates as criteria change.",
            "No results — a clear empty state with guidance to widen the search.",
            "Clear filters — resets the active set without clearing the search text.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The search field is a labelled <Mono>type=&quot;search&quot;</Mono>; filter controls are
              labelled and keyboard-operable.
            </>,
            "The result count is text, announced as it changes; the table keeps semantic markup.",
            "Active filters are removable chips with accessible labels.",
            "Controls wrap on mobile; the table scrolls horizontally with prioritized columns.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
