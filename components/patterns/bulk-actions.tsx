"use client";

import * as React from "react";
import { toast } from "sonner";
import { IconRocket, IconArchive, IconTrash, IconX } from "@/lib/icons";
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
import { Mono as InlineMono } from "@/components/atoms/_kit";
import { StatusBadge, BUILDS } from "@/components/data/_shared";
import { ConfirmDialog } from "@/components/feedback/confirmation";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

export function BulkActionsTable() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const allChecked = BUILDS.every((b) => selected.has(b.id));
  const some = selected.size > 0 && !allChecked;

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(BUILDS.map((b) => b.id)));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = selected.size;
  const clear = () => setSelected(new Set());
  const act = (verb: string) => {
    toast.success(`${verb} ${count} ${count === 1 ? "build" : "builds"}`);
    clear();
  };

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {/* Bulk action toolbar — appears when rows are selected */}
      {count > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
          <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={clear}>
            <IconX />
          </Button>
          <span className="text-sm font-medium text-foreground">{count} selected</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => act("Published")}>
              <IconRocket /> Publish
            </Button>
            <Button variant="outline" size="sm" onClick={() => act("Archived")}>
              <IconArchive /> Archive
            </Button>
            <ConfirmDialog
              destructive
              trigger={
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <IconTrash /> Delete
                </Button>
              }
              title={`Delete ${count} ${count === 1 ? "build" : "builds"}?`}
              description="This permanently removes the selected builds. This action cannot be undone."
              confirmLabel="Delete"
              onConfirm={() => act("Deleted")}
            />
          </div>
        </div>
      ) : null}

      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all builds"
                checked={allChecked}
                indeterminate={some}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Build</TableHead>
            <TableHead className="hidden sm:table-cell">Version</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BUILDS.map((b) => {
            const isSelected = selected.has(b.id);
            return (
              <TableRow key={b.id} data-state={isSelected ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select build ${b.id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleOne(b.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback>{b.authorInitials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">Build {b.id}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <InlineMono className="text-muted-foreground">{b.version}</InlineMono>
                </TableCell>
                <TableCell>
                  <StatusBadge status={b.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function BulkActionsPage() {
  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="Patterns"
        title="Bulk Actions"
        description={
          <>
            Act on many rows at once — select, then apply an action to the whole selection.{" "}
            <strong className="text-foreground">When to use:</strong> any table where users routinely
            publish, archive or delete in batches. It composes Table, Checkbox, a toolbar and the
            Confirmation flow.
          </>
        }
      />

      <Section
        title="Anatomy"
        description="Select rows to reveal a contextual toolbar with a selection count and bulk actions. Select-all supports an indeterminate state; Delete confirms before acting."
      >
        <BulkActionsTable />
      </Section>

      <Section title="States">
        <A11yList
          items={[
            "None selected — the toolbar is hidden; only the table shows.",
            "One / multiple selected — the toolbar appears with an accurate count.",
            "All selected — the header checkbox is checked (indeterminate when only some are).",
            "Destructive action — Delete always routes through a confirmation dialog.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Each checkbox is labelled per row; the select-all reflects indeterminate state.",
            <>
              The selection count is text (<Mono>N selected</Mono>), announced as it changes.
            </>,
            "Bulk actions are standard buttons; the destructive one confirms via role=alertdialog.",
            "The toolbar wraps on small screens so actions stay reachable.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
