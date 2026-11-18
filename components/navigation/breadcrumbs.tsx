"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function Breadcrumbs({ trail, label }: { trail: string[]; label?: string }) {
  return (
    <Breadcrumb aria-label={label}>
      <BreadcrumbList>
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <React.Fragment key={`${crumb}-${i}`}>
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{crumb}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href="#">{crumb}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {last ? null : <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function BreadcrumbsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Navigation"
        title="Breadcrumbs"
        description={
          <>
            Shows the path to the current page and lets you climb back up it — the shadcn{" "}
            <Mono>Breadcrumb</Mono>. Parents are links; the current page is plain text. It supports
            arbitrary depth and collapses the middle when space is tight.
          </>
        }
      />

      <Section title="Basic usage" description="A single parent and the current page.">
        <Breadcrumbs label="Basic example" trail={["Projects", "Project Alpha"]} />
      </Section>

      <Section
        title="Multiple levels"
        description="The full product path: organisation → project → resource → item. Parents are clickable; the last crumb is the current page."
      >
        <div className="flex flex-col gap-5">
          <Row label="Depth 3" className="w-full">
            <Breadcrumbs label="Depth 3 example" trail={["Projects", "Project Alpha", "Builds"]} />
          </Row>
          <Row label="Depth 4" className="w-full">
            <Breadcrumbs label="Depth 4 example" trail={["Projects", "Project Alpha", "Builds", "Build #124"]} />
          </Row>
        </div>
      </Section>

      <Section
        title="Collapsed / overflow"
        description="For deep trails, collapse the middle into a menu so the first and last crumbs always stay visible."
      >
        <Breadcrumb aria-label="Overflow example">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Appcharge</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-label="Show collapsed path"
                >
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Project Alpha</DropdownMenuItem>
                  <DropdownMenuItem>Production</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Builds</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Build #124</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Wrapped in a <Mono>&lt;nav aria-label=&quot;breadcrumb&quot;&gt;</Mono> landmark.
            </>,
            <>
              The current page is marked with <Mono>aria-current=&quot;page&quot;</Mono> and is not a
              link.
            </>,
            "Separators are decorative and hidden from assistive tech.",
            "The overflow menu is keyboard-operable and announces the hidden crumbs.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
