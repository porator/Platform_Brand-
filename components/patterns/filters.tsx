"use client";

import * as React from "react";
import { IconChevronDown } from "@/lib/icons";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/data/tag";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

const ENVIRONMENTS = ["Production", "Staging", "Development"];
const STATUSES = ["Ready", "Building", "Queued", "Failed"];
const PLATFORMS = ["iOS", "Android", "Web"];

type FilterState = { environment?: string; statuses: string[]; platform?: string };

/** A reusable filter bar: controls + active-filter chips + clear. Generic. */
export function FilterBar() {
  const [filters, setFilters] = React.useState<FilterState>({
    environment: "Production",
    statuses: ["Ready"],
    platform: "iOS",
  });

  const toggleStatus = (s: string) =>
    setFilters((f) => ({
      ...f,
      statuses: f.statuses.includes(s) ? f.statuses.filter((x) => x !== s) : [...f.statuses, s],
    }));

  const activeCount =
    (filters.environment ? 1 : 0) + filters.statuses.length + (filters.platform ? 1 : 0);

  const clearAll = () => setFilters({ statuses: [] });

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={Object.fromEntries(ENVIRONMENTS.map((e) => [e, e]))}
          value={filters.environment ?? ""}
          onValueChange={(v) => setFilters((f) => ({ ...f, environment: v ?? undefined }))}
        >
          <SelectTrigger size="sm" aria-label="Environment" className="w-40">
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
          <PopoverTrigger
            render={<Button variant="outline" size="sm" className="gap-1.5" />}
          >
            Status
            {filters.statuses.length > 0 ? (
              <Badge variant="secondary" className="ml-0.5">
                {filters.statuses.length}
              </Badge>
            ) : null}
            <IconChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-1">
            {STATUSES.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={filters.statuses.includes(s)}
                  onCheckedChange={() => toggleStatus(s)}
                />
                {s}
              </label>
            ))}
          </PopoverContent>
        </Popover>

        <Select
          items={Object.fromEntries(PLATFORMS.map((p) => [p, p]))}
          value={filters.platform ?? ""}
          onValueChange={(v) => setFilters((f) => ({ ...f, platform: v ?? undefined }))}
        >
          <SelectTrigger size="sm" aria-label="Platform" className="w-36">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filters */}
      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activeCount} active
          </span>
          {filters.environment ? (
            <Tag onRemove={() => setFilters((f) => ({ ...f, environment: undefined }))}>
              {filters.environment}
            </Tag>
          ) : null}
          {filters.statuses.map((s) => (
            <Tag key={s} onRemove={() => toggleStatus(s)}>
              {s}
            </Tag>
          ))}
          {filters.platform ? (
            <Tag onRemove={() => setFilters((f) => ({ ...f, platform: undefined }))}>
              {filters.platform}
            </Tag>
          ) : null}
          <Button variant="ghost" size="xs" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No filters applied.</p>
      )}
    </div>
  );
}

export function FiltersPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Patterns"
        title="Filters"
        description={
          <>
            A composed pattern for narrowing a collection — Select, a multi-select Popover, and
            removable Tag chips for the active set.{" "}
            <strong className="text-foreground">When to use:</strong> above any list or table that
            can be filtered by more than one dimension.
          </>
        }
      />

      <Section
        title="Anatomy"
        description="Filter controls (Select · Popover + Checkbox · Select) over a row of removable active-filter tags with a clear-all."
      >
        <div className="rounded-md border border-border p-4">
          <FilterBar />
        </div>
      </Section>

      <Section
        title="States"
        description="Interact above to move between these: no filters, some active (chips appear), and a filter count on the Status control."
      >
        <A11yList
          items={[
            "Empty — no filters applied; the chip row shows a hint.",
            "Active — each selection appears as a removable chip; a count summarizes it.",
            "Clear all — one action resets every dimension.",
            "The Status control shows a count badge so its multi-select state is visible when collapsed.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Each control is labelled; the multi-select popover uses real checkboxes with labels.",
            <>
              Active filters are removable with labelled controls (<Mono>Remove …</Mono>), reachable
              by keyboard.
            </>,
            "Status is reinforced by text in each chip, not color.",
            "The whole bar wraps on small screens so no control is clipped.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
