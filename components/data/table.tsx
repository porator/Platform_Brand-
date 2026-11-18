"use client";

import * as React from "react";
import {
  IconArrowsSort,
  IconArrowUp,
  IconArrowDown,
  IconDotsVertical,
  IconEye,
  IconRefresh,
  IconTrash,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";
import { BUILDS, StatusBadge, type Build } from "./_shared";

type SortKey = "id" | "version" | "created";

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" } | null;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? IconArrowsSort : sort!.dir === "asc" ? IconArrowUp : IconArrowDown;
  return (
    <TableHead className={className} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="-ml-1 inline-flex items-center gap-1.5 rounded-sm px-1 py-0.5 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {label}
        <Icon className={cn("size-3.5", active ? "text-foreground" : "text-muted-foreground")} aria-hidden />
      </button>
    </TableHead>
  );
}

function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Build actions" className="ml-auto" />}
      >
        <IconDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem>
          <IconEye /> View details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconRefresh /> Re-run build
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <IconTrash /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BuildsTable({
  data = BUILDS,
  selectable = false,
  loading = false,
  withActions = true,
  emptyMessage,
}: {
  data?: Build[];
  selectable?: boolean;
  loading?: boolean;
  withActions?: boolean;
  emptyMessage?: string;
}) {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const onSort = (k: SortKey) =>
    setSort((s) => (s?.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }));

  const rows = React.useMemo(() => {
    if (!sort) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [data, sort]);

  const allChecked = selectable && rows.length > 0 && rows.every((r) => selected.has(r.id));
  const colCount = 5 + (selectable ? 1 : 0) + (withActions ? 1 : 0);

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="w-full overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {selectable ? (
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all builds"
                  checked={allChecked}
                  indeterminate={!allChecked && selected.size > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
            ) : null}
            <SortableHead label="Build" sortKey="id" sort={sort} onSort={onSort} />
            <SortableHead label="Version" sortKey="version" sort={sort} onSort={onSort} className="hidden md:table-cell" />
            <TableHead className="hidden sm:table-cell">Environment</TableHead>
            <TableHead>Status</TableHead>
            <SortableHead label="Created" sortKey="created" sort={sort} onSort={onSort} className="hidden lg:table-cell" />
            {withActions ? (
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {selectable ? (
                  <TableCell>
                    <Skeleton className="size-4" />
                  </TableCell>
                ) : null}
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                {withActions ? (
                  <TableCell>
                    <Skeleton className="size-6" />
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colCount} className="h-28 text-center align-middle whitespace-normal text-sm text-muted-foreground">
                {emptyMessage ?? "No builds found."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((build) => {
              const isSelected = selected.has(build.id);
              const disabled = build.status === "Failed";
              return (
                <TableRow
                  key={build.id}
                  data-state={isSelected ? "selected" : undefined}
                  aria-disabled={disabled || undefined}
                  className={disabled ? "opacity-60" : undefined}
                >
                  {selectable ? (
                    <TableCell>
                      <Checkbox
                        aria-label={`Select build ${build.id}`}
                        checked={isSelected}
                        disabled={disabled}
                        onCheckedChange={() => toggleOne(build.id)}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarFallback>{build.authorInitials}</AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="font-medium text-foreground">Build {build.id}</div>
                        <div className="text-xs text-muted-foreground">{build.author}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Mono className="text-muted-foreground">{build.version}</Mono>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{build.environment}</TableCell>
                  <TableCell>
                    <StatusBadge status={build.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums">{build.created}</TableCell>
                  {withActions ? (
                    <TableCell>
                      <RowActions />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function TablePage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Data Display"
        title="Table"
        description={
          <>
            A production data table built on the shadcn <Mono>Table</Mono> primitives. It is generic
            — pass any rows — and composes selection, sorting, status badges, avatars, metadata and
            row actions. The example data is a build list for a New Gen Wire project.
          </>
        }
      />

      <Section
        title="Basic usage"
        description="Sortable headers, selectable rows, status badges, author avatars and a per-row actions menu. Click a column header to sort; use the checkboxes to select."
      >
        <BuildsTable selectable />
      </Section>

      <Section title="States" description="Loading, empty and a disabled (failed) row.">
        <div className="flex flex-col gap-8">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Loading</p>
            <BuildsTable loading selectable />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Empty</p>
            <BuildsTable data={[]} emptyMessage="No builds in this environment yet." />
          </div>
        </div>
      </Section>

      <Section
        title="Responsive behavior"
        description="Columns are prioritized, not squeezed: Environment hides below sm, Version below md, Created below lg, and the whole table scrolls horizontally as a last resort. Narrow the viewport to see it adapt."
      >
        <BuildsTable />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Semantic <Mono>&lt;table&gt;</Mono> markup — header cells, rows and body are real table
              elements with proper relationships.
            </>,
            <>
              Sortable columns expose <Mono>aria-sort</Mono>; each header is a button operable by
              keyboard.
            </>,
            "Selection checkboxes are labelled per row, with a select-all that reflects an indeterminate state.",
            "Status is conveyed by an icon + label, never color alone; row actions are a labelled menu button.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
