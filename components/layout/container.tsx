"use client";

import * as React from "react";
import { Container } from "./primitives";
import { Box } from "./_demo";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

export function ContainerPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Layout"
        title="Container"
        description={
          <>
            Centers content and caps its width, with responsive horizontal padding that grows with
            the viewport. It is the outermost wrapper for page content — everything else nests inside
            it.
          </>
        }
      />

      <Section title="Basic usage" description="Centered, max-width, with responsive gutters.">
        <div className="rounded-md border border-dashed border-border py-4">
          <Container size="md">
            <Box className="h-16">Centered content · max-w-5xl · px grows at sm / lg</Box>
          </Container>
        </div>
      </Section>

      <Section
        title="Sizes"
        description="From a reading-width column to full-bleed. The dashed area is the viewport; the solid box is the container."
      >
        <div className="flex flex-col gap-4">
          {([
            ["sm", "max-w-3xl — forms, reading"],
            ["md", "max-w-5xl — default page width"],
            ["lg", "max-w-6xl — dense dashboards"],
            ["xl", "max-w-7xl — wide tables"],
            ["full", "max-w-none — full-bleed"],
          ] as const).map(([size, label]) => (
            <div key={size} className="rounded-md border border-dashed border-border py-3">
              <Container size={size}>
                <Box className="h-12">
                  <Mono>{label}</Mono>
                </Box>
              </Container>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Responsive padding"
        description="Horizontal padding steps up with the breakpoints — 16px on mobile, 24px at sm, 32px at lg — so content never touches the edge."
      >
        <A11yList
          items={[
            "Mobile — px-4 (16px gutters).",
            "Tablet (sm) — px-6 (24px).",
            "Desktop (lg+) — px-8 (32px).",
            "The container is a plain presentational wrapper; it adds no semantics or focus stops.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
