"use client";

import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

/** Build a page list with ellipses: 1 … 4 5 6 … 20 */
function pageRange(current: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const add = (n: number | "…") => out.push(n);
  const window = 1;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - window && p <= current + window)) {
      add(p);
    } else if (out[out.length - 1] !== "…") {
      add("…");
    }
  }
  return out;
}

function Pager({
  total = 20,
  initial = 1,
  label,
}: {
  total?: number;
  initial?: number;
  label?: string;
}) {
  const [page, setPage] = React.useState(initial);
  const go = (p: number) => setPage(Math.min(Math.max(1, p), total));
  const atStart = page === 1;
  const atEnd = page === total;

  return (
    <Pagination aria-label={label}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={atStart}
            tabIndex={atStart ? -1 : undefined}
            className={atStart ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              go(page - 1);
            }}
          />
        </PaginationItem>
        {pageRange(page, total).map((p, i) =>
          p === "…" ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                aria-current={p === page ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(p);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={atEnd}
            tabIndex={atEnd ? -1 : undefined}
            className={atEnd ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              go(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function CompactPager({ total = 12 }: { total?: number }) {
  const [page, setPage] = React.useState(5);
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {page} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page === total} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function PaginationPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Navigation"
        title="Pagination"
        description={
          <>
            Moves through a paged list or table — the shadcn <Mono>Pagination</Mono>. It shows the
            current page, collapses long ranges with an ellipsis, and disables the ends. Pair it with
            a page-size control on data tables.
          </>
        }
      />

      <Section title="Basic usage" description="A middle page — both directions available, range collapsed with ellipses.">
        <Pager total={20} initial={6} label="Builds pagination" />
      </Section>

      <Section title="Boundary states" description="At the first page Previous is disabled; at the last page Next is disabled.">
        <div className="flex flex-col gap-6">
          <Row label="First page" className="w-full">
            <Pager total={20} initial={1} label="First-page example" />
          </Row>
          <Row label="Last page" className="w-full">
            <Pager total={20} initial={20} label="Last-page example" />
          </Row>
        </div>
      </Section>

      <Section
        title="Compact variant"
        description="For tight toolbars — a label with Previous / Next buttons only."
      >
        <CompactPager />
      </Section>

      <Section
        title="In context — list footer with page size"
        description="The common table footer: result count, page size, and the pager."
      >
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground">1–10</span> of{" "}
            <span className="text-foreground">196</span> builds
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows</span>
              <Select items={{ "10": "10", "20": "20", "50": "50" }} defaultValue="10">
                <SelectTrigger size="sm" aria-label="Rows per page" className="w-18">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Pager total={20} initial={1} label="List footer pagination" />
          </div>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Wrapped in <Mono>&lt;nav aria-label=&quot;pagination&quot;&gt;</Mono>; the current page
              carries <Mono>aria-current=&quot;page&quot;</Mono>.
            </>,
            "Every control is keyboard reachable; disabled ends are removed from the tab order.",
            "Previous / Next have text labels, not icon-only, for clear screen-reader output.",
            "Page numbers remain legible and tappable at mobile sizes.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
