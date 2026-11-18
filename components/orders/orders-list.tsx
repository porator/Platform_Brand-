"use client";

/* The Orders list (docs/orders-flow.md · Module Management PRD Story 3 · Foldering PRD Stories 7–8): one list of
 * Paid, Free and Subscription orders for a project or a folder.
 *
 * Laid out after the reference recording (Reference/Screen Recording 2026-11-12 at 8.02.54): a floating toolbar above a
 * frameless table (grey header band, row lines) and a compact pager. The toolbar is the date range at the left, then one "Search and filter"
 * field (free-text ID search, plus filters added from it — MM's "+ add filter" — that show as removable chips), then
 * clear-all, show / hide filters and a Sort & columns menu. No saved views: no PRD asks for them.
 *
 * Built from the design system's parts: Table, Popover + Command (the filter picker), Badge (filter chips),
 * DropdownMenu (date range; sort and columns), Button, SimpleTooltip, OrderStatusBadge, EmptyState, Typography, Flex,
 * with TanStack Table (the package's own table engine) for sorting and pages. */

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { IconArrowDown as ArrowDown, IconArrowUp as ArrowUp, IconArrowsSort as ArrowUpDown, IconCalendar as Calendar, IconChevronDown as ChevronDown, IconChevronLeft as ChevronLeft, IconChevronRight as ChevronRight, IconEye as Eye, IconEyeOff as EyeOff, IconSearch as Search, IconX as X } from "@/lib/icons";
import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  EmptyState,
  Flex,
  ORDER_STATUS_META,
  OrderStatusBadge,
  Popover,
  PopoverAnchor,
  PopoverContent,
  SimpleTooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
  UICheckbox,
} from "@/components/newgen-system-design";
import { MODULE_LABEL, MODULE_IDS } from "@/lib/newgen";
import { DATE_PRESETS, DEVICE_OS, OFFER_TYPES, ORDER_TYPES, ORDER_TYPE_LABEL, STATUSES, formatPrice, presetDays, type Order } from "@/lib/orders";
import type { OrdersView } from "@/components/orders/orders-body";

const PAGE_SIZE = 25;

/* ───────── columns (MM Story 3: defaults, Date and Order ID can't be hidden) ───────── */

type ColId =
  | "date"
  | "id"
  | "project"
  | "module"
  | "type"
  | "offer"
  | "offerType"
  | "price"
  | "paymentMethod"
  | "playerId"
  | "status"
  | "transactionId"
  | "playerEmail"
  | "deviceOs"
  | "subscriptionId"
  | "paymentInCycle";

type Col = { id: ColId; label: string; locked?: boolean; hidden?: boolean; folderOnly?: boolean; sort: (o: Order) => number | string; cell: (o: Order) => React.ReactNode };

/** IDs (player, transaction, subscription) in the same type as every other cell: 14px Manrope, regular. */
const Mono = ({ children }: { children: string }) =>
  children ? (
    <Typography tag="span" variant="body-sm" className="whitespace-nowrap font-normal">
      {children}
    </Typography>
  ) : null;
const Text = ({ children }: { children: React.ReactNode }) => (
  <Typography tag="span" variant="body-sm" className="whitespace-nowrap font-normal">
    {children}
  </Typography>
);

function columnsFor(open: (o: Order) => void): Col[] {
  return [
    { id: "date", label: "Date", locked: true, sort: (o) => o.date.getTime(), cell: (o) => <Text>{format(o.date, "dd MMM yyyy, HH:mm")}</Text> },
    {
      id: "id",
      label: "Order ID",
      locked: true,
      sort: (o) => o.id,
      cell: (o) => (
        <Flex gap="sm" align="center">
          {/* The ID is the row's keyboard stop: Enter opens the order (the whole row opens it on click). */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open(o);
            }}
            className="rounded-sm text-sm font-normal whitespace-nowrap text-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {o.id}
          </button>
          {o.test ? (
            <Badge variant="warning" size="sm" pill>
              Test
            </Badge>
          ) : null}
          {o.parentOrderId ? (
            <Badge variant="info" size="sm" pill>
              Upsell
            </Badge>
          ) : null}
        </Flex>
      ),
    },
    { id: "project", label: "Project", folderOnly: true, sort: (o) => o.projectName, cell: (o) => <Text>{o.projectName}</Text> },
    { id: "module", label: "Module", sort: (o) => MODULE_LABEL[o.module], cell: (o) => <Text>{MODULE_LABEL[o.module]}</Text> },
    { id: "type", label: "Order type", sort: (o) => o.type, cell: (o) => <Text>{ORDER_TYPE_LABEL[o.type]}</Text> },
    { id: "offer", label: "Offer / plan name", sort: (o) => o.offerName, cell: (o) => <Text>{o.offerName}</Text> },
    { id: "offerType", label: "Offer type", hidden: true, sort: (o) => o.offerType, cell: (o) => <Text>{o.offerType}</Text> },
    { id: "price", label: "Price", sort: (o) => o.price * o.usdRate, cell: (o) => <Text>{formatPrice(o)}</Text> },
    { id: "paymentMethod", label: "Payment method", sort: (o) => o.paymentMethod, cell: (o) => <Text>{o.paymentMethod}</Text> },
    { id: "playerId", label: "Player ID", sort: (o) => o.playerId, cell: (o) => <Mono>{o.playerId}</Mono> },
    { id: "status", label: "Status", sort: (o) => ORDER_STATUS_META[o.status].label, cell: (o) => <OrderStatusBadge status={o.status} /> },
    { id: "transactionId", label: "Transaction ID", hidden: true, sort: (o) => o.transactionId, cell: (o) => <Mono>{o.transactionId}</Mono> },
    { id: "playerEmail", label: "Player email", hidden: true, sort: (o) => o.playerEmail, cell: (o) => <Text>{o.playerEmail}</Text> },
    { id: "deviceOs", label: "Device OS", hidden: true, sort: (o) => o.deviceOs, cell: (o) => <Text>{o.deviceOs}</Text> },
    { id: "subscriptionId", label: "Subscription ID", hidden: true, sort: (o) => o.subscriptionId, cell: (o) => <Mono>{o.subscriptionId}</Mono> },
    { id: "paymentInCycle", label: "Payment # in cycle", hidden: true, sort: (o) => o.paymentInCycle ?? 0, cell: (o) => <Text>{o.paymentInCycle ?? ""}</Text> },
  ];
}

/* ───────── list state: kept per view while you move between the list and an order (in memory) ───────── */

type FilterKey = "types" | "projects" | "modules" | "statuses" | "envs" | "offerTypes" | "devices";
export type ListState = { search: string; preset: string; sort: SortingState; showFilters: boolean } & Record<FilterKey, string[]>;
const EMPTY: ListState = {
  search: "",
  preset: "30d",
  sort: [{ id: "date", desc: true }],
  showFilters: true,
  types: [],
  modules: [],
  statuses: [],
  projects: [],
  envs: [],
  offerTypes: [],
  devices: [],
};
const listStates = new Map<string, ListState>();
export const listStateFor = (key: string) => listStates.get(key) ?? EMPTY;

/** The order the list last showed (filters and sort), per view: the order page's previous / next follow it. */
const listOrder = new Map<string, string[]>();
export const listOrderFor = (key: string) => listOrder.get(key);

/* Columns: saved per view (project / folder) in this browser (MM: "saved per user, separately for Project and Folder view"). */
const colsKey = (folder: boolean) => `orders:columns:${folder ? "folder" : "project"}`;
function readCols(folder: boolean): ColId[] | null {
  try {
    const raw = window.localStorage.getItem(colsKey(folder));
    return raw ? (JSON.parse(raw) as ColId[]) : null;
  } catch {
    return null;
  }
}
function writeCols(folder: boolean, cols: ColId[] | null) {
  try {
    if (cols) window.localStorage.setItem(colsKey(folder), JSON.stringify(cols));
    else window.localStorage.removeItem(colsKey(folder));
  } catch {
    /* storage unavailable: keep the in-memory choice */
  }
}

type FilterField = { key: FilterKey; label: string; options: { value: string; label: string }[] };

/* ───────── the list ───────── */

export function OrdersList({ view, orders, onOpen }: { view: OrdersView; orders: (days: number, sandbox: boolean) => Order[]; onOpen: (o: Order) => void }) {
  const folder = view.folder;
  const [state, setState] = React.useState<ListState>(() => listStateFor(view.key));
  const update = React.useCallback(
    (patch: Partial<ListState>) =>
      setState((s) => {
        const next = { ...s, ...patch };
        listStates.set(view.key, next);
        return next;
      }),
    [view.key],
  );

  /* columns */
  const all = React.useMemo(() => columnsFor(onOpen).filter((c) => folder || !c.folderOnly), [folder, onOpen]);
  const defaults = React.useMemo(() => all.filter((c) => !c.hidden).map((c) => c.id), [all]);
  const [visible, setVisible] = React.useState<ColId[]>(defaults);
  React.useEffect(() => {
    const saved = readCols(folder);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one read of the saved layout after hydration
    if (saved) setVisible(saved);
  }, [folder]);
  const toggleCol = (id: ColId, on: boolean) => {
    const next = all.map((c) => c.id).filter((c) => (c === id ? on : visible.includes(c)));
    setVisible(next);
    writeCols(folder, next);
  };
  const resetCols = () => {
    setVisible(defaults);
    writeCols(folder, null);
  };
  const shown = all.filter((c) => c.locked || visible.includes(c.id));

  /* data: Production (default) and / or all sandboxes in a folder; the environment selector in a project */
  const withProduction = folder ? !state.envs.length || state.envs.includes("production") : !view.sandbox;
  const withSandboxes = folder ? state.envs.includes("sandbox") : view.sandbox;
  const days = presetDays(state.preset);
  const source = React.useMemo(() => {
    const out = [...(withProduction ? orders(days, false) : []), ...(withSandboxes ? orders(days, true) : [])];
    return withProduction && withSandboxes ? out.sort((a, b) => b.date.getTime() - a.date.getTime()) : out;
  }, [orders, days, withProduction, withSandboxes]);

  const fields: FilterField[] = [
    { key: "types", label: "Order type", options: ORDER_TYPES.map((t) => ({ value: t, label: ORDER_TYPE_LABEL[t] })) },
    ...(folder ? [{ key: "projects" as const, label: "Project", options: view.projects.map((p) => ({ value: p.id, label: p.name })) }] : []),
    { key: "modules", label: "Module", options: MODULE_IDS.filter((m) => view.projects.some((p) => p.modules.includes(m))).map((m) => ({ value: m, label: MODULE_LABEL[m] })) },
    { key: "statuses", label: "Status", options: STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label })) },
    ...(folder
      ? [
          {
            key: "envs" as const,
            label: "Environment",
            options: [
              { value: "production", label: "Production" },
              { value: "sandbox", label: "All sandboxes" },
            ],
          },
        ]
      : []),
    { key: "offerTypes", label: "Offer type", options: [...OFFER_TYPES, "Subscription", "Upsell"].map((t) => ({ value: t, label: t })) },
    { key: "devices", label: "Device OS", options: DEVICE_OS.map((d) => ({ value: d, label: d })) },
  ];

  const filtered = React.useMemo(() => {
    const q = state.search.trim().toLowerCase();
    return source.filter((o) => {
      if (state.types.length && !state.types.includes(o.type)) return false;
      if (state.modules.length && !state.modules.includes(o.module)) return false;
      if (state.statuses.length && !state.statuses.includes(o.status)) return false;
      if (state.projects.length && !state.projects.includes(o.projectId)) return false;
      if (state.offerTypes.length && !state.offerTypes.includes(o.offerType)) return false;
      if (state.devices.length && !state.devices.includes(o.deviceOs)) return false;
      if (!q) return true;
      return [o.id, o.playerId, o.playerEmail, o.transactionId, o.receiptNumber, o.subscriptionId].some((v) => v.toLowerCase().includes(q));
    });
  }, [source, state]);

  /* table */
  const columns = React.useMemo<ColumnDef<Order, unknown>[]>(
    () => shown.map((c) => ({ id: c.id, header: c.label, accessorFn: c.sort, sortDescFirst: c.id === "date", cell: ({ row }) => c.cell(row.original) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, visible],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table, the package's own table engine
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting: state.sort },
    onSortingChange: (u) => update({ sort: typeof u === "function" ? u(state.sort) : u }),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  });
  const sortedIds = table.getSortedRowModel().rows.map((r) => r.original.id);
  React.useEffect(() => {
    listOrder.set(view.key, sortedIds);
  });

  const anyFilter = fields.some((f) => state[f.key].length) || !!state.search.trim();
  const { pageIndex } = table.getState().pagination;
  const total = filtered.length;
  const from = total ? pageIndex * PAGE_SIZE + 1 : 0;
  const to = Math.min(total, (pageIndex + 1) * PAGE_SIZE);
  const sortCol = state.sort[0];

  return (
    <Flex direction="column" gap="sm">
      {/* Toolbar, its own floating bar above a frameless table (as in the reference): date range · Search and filter ·
          clear · show / hide filters · Sort & columns */}
      <Flex align="center" gap="sm" className="rounded-xl border border-border bg-card p-1.5 shadow-xs">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="xs" leftIcon={<Calendar className="size-3.5" />} rightIcon={<ChevronDown className="size-3.5" />}>
              {DATE_PRESETS.find((p) => p.value === state.preset)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuRadioGroup value={state.preset} onValueChange={(v) => update({ preset: v })}>
              {DATE_PRESETS.map((p) => (
                <DropdownMenuRadioItem key={p.value} value={p.value}>
                  {p.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <SearchAndFilter fields={fields} state={state} update={update} showChips={state.showFilters} />

        {anyFilter ? (
          <SimpleTooltip content="Clear search and filters">
            <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Clear search and filters" onClick={() => update({ ...EMPTY, preset: state.preset, sort: state.sort, showFilters: state.showFilters })}>
              <X className="size-3.5" />
            </Button>
          </SimpleTooltip>
        ) : null}
        <SimpleTooltip content={state.showFilters ? "Hide filters" : "Show filters"}>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label={state.showFilters ? "Hide filters" : "Show filters"}
            aria-pressed={!state.showFilters}
            onClick={() => update({ showFilters: !state.showFilters })}
          >
            {state.showFilters ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </Button>
        </SimpleTooltip>
        <DropdownMenu>
          <SimpleTooltip content="Sort and columns">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Sort and columns">
                <ArrowUpDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </SimpleTooltip>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Sort by: {all.find((c) => c.id === sortCol?.id)?.label ?? "Date"}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52">
                <DropdownMenuRadioGroup value={sortCol?.id ?? "date"} onValueChange={(id) => update({ sort: [{ id, desc: sortCol?.desc ?? true }] })}>
                  {shown.map((c) => (
                    <DropdownMenuRadioItem key={c.id} value={c.id}>
                      {c.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortCol?.desc ? "desc" : "asc"} onValueChange={(d) => update({ sort: [{ id: sortCol?.id ?? "date", desc: d === "desc" }] })}>
                  <DropdownMenuRadioItem value="desc">{sortCol?.id === "date" ? "Newest first" : "Descending"}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="asc">{sortCol?.id === "date" ? "Oldest first" : "Ascending"}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            {all.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={c.locked || visible.includes(c.id)}
                disabled={c.locked}
                onCheckedChange={(on) => toggleCol(c.id, !!on)}
                onSelect={(e) => e.preventDefault()}
              >
                {c.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={resetCols}>Reset to default</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>

      {total === 0 ? (
        <EmptyState className="border-0 shadow-none" title="No orders match" description="Try another search, filter or date range." />
      ) : (
        <Table appearance="workspace">
          {/* The header row is a soft grey band; rows are split by lines, with no frame around the table. */}
          <TableHeader className="[&_tr]:border-0">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/60 hover:bg-muted/60">
                {hg.headers.map((h, i) => {
                  const sorted = h.column.getIsSorted();
                  return (
                    <TableHead key={h.id} className={i === 0 ? "rounded-l-lg pl-4" : i === hg.headers.length - 1 ? "rounded-r-lg pr-4" : undefined} aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}>
                      <button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sorted === "asc" ? <ArrowUp className="size-3" /> : sorted === "desc" ? <ArrowDown className="size-3" /> : null}
                      </button>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} onClick={() => onOpen(row.original)} className="cursor-pointer">
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell key={cell.id} className={i === 0 ? "pl-4" : i === row.getVisibleCells().length - 1 ? "pr-4" : undefined}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pager: "1–25 of 393" with previous / next, as in the reference. */}
      <Flex align="center" justify="between" className="px-4">
        <Typography variant="caption" aria-live="polite">
          {total ? `${from}–${to} of ${total.toLocaleString("en-US")}` : "0 orders"}
          {withSandboxes ? (withProduction ? " · including test orders" : " · test orders") : ""}
        </Typography>
        <Flex gap="xs">
          <Button variant="outline" size="icon" className="size-7" aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="size-7" aria-label="Next page" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRight className="size-3.5" />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

/* ───────── Search and filter: free-text ID search plus filters picked from it (shown as chips) ───────── */

function SearchAndFilter({ fields, state, update, showChips }: { fields: FilterField[]; state: ListState; update: (p: Partial<ListState>) => void; showChips: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [field, setField] = React.useState<FilterKey | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const current = fields.find((f) => f.key === field);
  const q = state.search.trim().toLowerCase();
  const matching = fields.filter((f) => !q || f.label.toLowerCase().includes(q));

  const toggle = (key: FilterKey, value: string) => {
    const cur = state[key];
    update({ [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] } as Partial<ListState>);
  };
  const chipText = (f: FilterField) => {
    const labels = state[f.key].map((v) => f.options.find((o) => o.value === v)?.label ?? v);
    return `${f.label} is ${labels.length > 2 ? `${labels.slice(0, 2).join(", ")} +${labels.length - 2}` : labels.join(", ")}`;
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setField(null);
      }}
    >
      <PopoverAnchor asChild>
        <Flex
          align="center"
          gap="xs"
          wrap
          className="min-h-8 min-w-0 flex-1 cursor-text rounded-md px-1.5"
          onClick={() => {
            inputRef.current?.focus();
            setOpen(true);
          }}
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          {showChips
            ? fields
                .filter((f) => state[f.key].length)
                .map((f) => (
                  <Badge
                    key={f.key}
                    variant="info"
                    size="sm"
                    isRemovable
                    onRemove={() => update({ [f.key]: [] } as Partial<ListState>)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setField(f.key);
                      setOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    {chipText(f)}
                  </Badge>
                ))
            : null}
          {/* The field's text input. The package's Input is a full bordered field, so a bare input sits inside this one. */}
          <input
            ref={inputRef}
            value={state.search}
            onChange={(e) => {
              update({ search: e.target.value });
              setField(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpen(false);
              if (e.key === "Backspace" && !state.search) {
                const last = [...fields].reverse().find((f) => state[f.key].length);
                if (last) update({ [last.key]: [] } as Partial<ListState>);
              }
            }}
            placeholder="Search and filter"
            aria-label="Search orders by order, player, transaction, receipt or subscription ID, or add a filter"
            className="h-7 min-w-40 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Flex>
      </PopoverAnchor>
      <PopoverContent align="start" className="w-64 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        {current ? (
          // A field's values: a multi-select (check as many as you like; the list stays open), with Back, Select all /
          // Clear and Done below.
          <Command>
            <CommandInput placeholder={`Search ${current.label.toLowerCase()}…`} autoFocus />
            <CommandList>
              <CommandEmpty>No options</CommandEmpty>
              <CommandGroup heading={`${current.label} is any of`}>
                {current.options.map((o) => {
                  const on = state[current.key].includes(o.value);
                  return (
                    <CommandItem key={o.value} value={o.label} onSelect={() => toggle(current.key, o.value)} aria-checked={on} role="menuitemcheckbox">
                      <UICheckbox checked={on} tabIndex={-1} aria-hidden className="pointer-events-none" />
                      {o.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <Flex align="center" justify="between" gap="sm" className="border-t border-border p-1.5">
              <Button variant="ghost" size="xs" leftIcon={<ChevronLeft className="size-3.5" />} onClick={() => setField(null)}>
                Filters
              </Button>
              <Flex align="center" gap="xs">
                {state[current.key].length === current.options.length ? (
                  <Button variant="ghost" size="xs" onClick={() => update({ [current.key]: [] } as Partial<ListState>)}>
                    Clear
                  </Button>
                ) : (
                  <Button variant="ghost" size="xs" onClick={() => update({ [current.key]: current.options.map((o) => o.value) } as Partial<ListState>)}>
                    Select all
                  </Button>
                )}
                <Button size="xs" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </Flex>
            </Flex>
          </Command>
        ) : (
          <Command shouldFilter={false}>
            <CommandList>
              {q ? (
                <CommandGroup>
                  <CommandItem value="__search" onSelect={() => setOpen(false)}>
                    <Search className="size-3.5" />
                    Search IDs for “{state.search.trim()}”
                  </CommandItem>
                </CommandGroup>
              ) : null}
              {matching.length ? (
                <CommandGroup heading="Filter by">
                  {matching.map((f) => (
                    <CommandItem key={f.key} value={f.key} onSelect={() => setField(f.key)}>
                      {f.label}
                      {state[f.key].length ? (
                        <Typography tag="span" variant="caption" className="ml-auto text-xs">
                          {state[f.key].length}
                        </Typography>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
