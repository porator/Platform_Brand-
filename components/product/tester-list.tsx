"use client";

import * as React from "react";
import { toast } from "sonner";
import { IconMailForward, IconUserX, IconDotsVertical, IconX, IconPlus } from "@/lib/icons";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/form/search";
import { ConfirmDialog } from "@/components/feedback/confirmation";
import { PageShell, PageHeader, Section, A11yList } from "@/components/atoms/_kit";
import { TESTERS, TesterStatusBadge } from "./_data";

export function TesterList({ withToolbar = true }: { withToolbar?: boolean }) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return TESTERS.filter((t) => !q || `${t.name} ${t.email}`.toLowerCase().includes(q));
  }, [query]);

  const allChecked = results.length > 0 && results.every((t) => selected.has(t.email));
  const some = selected.size > 0 && !allChecked;
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(results.map((t) => t.email)));
  const toggleOne = (email: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });

  const count = selected.size;
  const act = (verb: string) => {
    toast.success(`${verb} ${count} ${count === 1 ? "tester" : "testers"}`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      {withToolbar ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="Search testers…"
            className="sm:max-w-xs"
          />
          <Button size="sm" className="sm:ml-auto">
            <IconPlus /> Invite tester
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-border">
        {count > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
            <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => setSelected(new Set())}>
              <IconX />
            </Button>
            <span className="text-sm font-medium text-foreground">{count} selected</span>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => act("Re-invited")}>
                <IconMailForward /> Resend invite
              </Button>
              <ConfirmDialog
                destructive
                trigger={
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <IconUserX /> Remove
                  </Button>
                }
                title={`Remove ${count} ${count === 1 ? "tester" : "testers"}?`}
                description="They will lose access to builds in this environment. You can re-invite them later."
                confirmLabel="Remove"
                onConfirm={() => act("Removed")}
              />
            </div>
          </div>
        ) : null}

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox aria-label="Select all testers" checked={allChecked} indeterminate={some} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Tester</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Added</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-24 text-center align-middle text-sm text-muted-foreground">
                  No testers match your search.
                </TableCell>
              </TableRow>
            ) : (
              results.map((t) => {
                const isSelected = selected.has(t.email);
                return (
                  <TableRow key={t.email} data-state={isSelected ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox aria-label={`Select ${t.name}`} checked={isSelected} onCheckedChange={() => toggleOne(t.email)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback>{t.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 leading-tight">
                          <div className="truncate font-medium text-foreground">{t.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{t.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{t.role}</TableCell>
                    <TableCell>
                      <TesterStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums">{t.added}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`${t.name} actions`} />}>
                          <IconDotsVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Resend invite</DropdownMenuItem>
                          <DropdownMenuItem>Change role</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function TesterListPage() {
  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Product Components"
        title="Tester List"
        description={
          <>
            The people who can test an Appcharge build in an environment — with role, status and
            lifecycle (invited → active → expired → removed). It composes Table, Avatar, Badge,
            Checkbox, Search and Bulk Actions; nothing is rebuilt.
          </>
        }
      />

      <Section
        title="Default"
        description="Search, select and act on testers. Status covers Invited, Active, Expired and Removed."
      >
        <TesterList />
      </Section>

      <Section title="States & composition">
        <A11yList
          items={[
            "Invited / Active / Expired / Removed — each a semantic status badge with an icon.",
            "Selection reveals a bulk toolbar (Resend invite · Remove), with Remove confirmed.",
            "Search filters by name or email; the table prioritizes columns on small screens.",
            "Reuses the Bulk Actions and Search patterns — no duplicated logic.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Semantic table markup with per-row selection labels and an indeterminate select-all.",
            <>
              Each tester has an accessible name/email; actions are labelled menu buttons.
            </>,
            "Status is icon + label; destructive bulk removal routes through a confirmation.",
            "The toolbar wraps and columns hide on mobile so the list stays usable.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
