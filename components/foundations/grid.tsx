"use client";

import * as React from "react";
import { PageShell, PageHeader, Section, Mono } from "./_kit";

function Cell({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex min-h-10 items-center justify-center border border-border bg-muted text-xs text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
}

export function GridLayoutPage() {
  return (
    <PageShell>
      <PageHeader
        title="Grid & Layout"
        description={
          <>
            Layout is built with CSS Grid and Flexbox through Tailwind utilities. A centered{" "}
            <Mono>max-w</Mono> container holds content; a 12-column grid and consistent{" "}
            <Mono>gap</Mono> steps structure it; responsive prefixes adapt it across breakpoints.
          </>
        }
      />

      <Section
        title="Container"
        description="Content sits in a centered container with a max width and symmetric horizontal padding."
      >
        <div className="border border-dashed border-border p-3">
          <div className="mx-auto max-w-3xl border border-border bg-card px-6 py-5 text-card-foreground">
            <p className="text-sm font-medium">mx-auto · max-w-3xl · px-6</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The dashed area is the viewport; the solid card is the constrained container.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="12-column grid"
        description="A base 12-track grid. Spans compose any layout — sidebars, split views, card decks."
      >
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Cell key={i}>{i + 1}</Cell>
            ))}
          </div>
          <div className="grid grid-cols-12 gap-2">
            <Cell className="col-span-3">col-span-3</Cell>
            <Cell className="col-span-6">col-span-6</Cell>
            <Cell className="col-span-3">col-span-3</Cell>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <Cell className="col-span-4">sidebar · 4</Cell>
            <Cell className="col-span-8">content · 8</Cell>
          </div>
        </div>
      </Section>

      <Section
        title="Responsive columns"
        description="One pattern, four layouts. This deck is grid-cols-1 → sm:2 → lg:3 → xl:4. Resize the viewport (or use the toolbar) to see it reflow."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Cell key={i} className="h-16">
              card {i + 1}
            </Cell>
          ))}
        </div>
      </Section>

      <Section title="Gap scale" description="Grid and flex gaps use the same spacing scale.">
        <div className="space-y-4">
          {["gap-2", "gap-4", "gap-8"].map((g) => (
            <div key={g}>
              <Mono className="text-muted-foreground">{g}</Mono>
              <div className={`mt-1.5 flex ${g}`}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Cell key={i} className="w-20">
                    &nbsp;
                  </Cell>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Alignment"
        description="Flex alignment on both axes — the backbone of toolbars, list rows and headers."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ["justify-start", "justify-start"],
            ["justify-center", "justify-center"],
            ["justify-between", "justify-between"],
          ].map(([cls, label]) => (
            <div key={cls} className="border border-border p-3">
              <Mono className="text-muted-foreground">{label}</Mono>
              <div className={`mt-2 flex items-center ${cls} gap-2`}>
                <div className="size-8 bg-primary" />
                <div className="size-8 bg-secondary" />
                <div className="size-8 bg-accent" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Horizontal & vertical spacing"
        description="space-x and space-y insert consistent gaps between siblings without wrapping them in a grid."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border border-border p-4">
            <Mono className="text-muted-foreground">space-x-4</Mono>
            <div className="mt-3 flex space-x-4">
              {["A", "B", "C"].map((x) => (
                <Cell key={x} className="w-16 py-2">
                  {x}
                </Cell>
              ))}
            </div>
          </div>
          <div className="border border-border p-4">
            <Mono className="text-muted-foreground">space-y-3</Mono>
            <div className="mt-3 flex flex-col space-y-3">
              {["Row one", "Row two", "Row three"].map((x) => (
                <Cell key={x} className="py-2">
                  {x}
                </Cell>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
