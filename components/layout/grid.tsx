"use client";

import * as React from "react";
import { IconFolders, IconHammer, IconUsers, IconRocket } from "@/lib/icons";
import { Grid } from "./primitives";
import { Box } from "./_demo";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Stat } from "@/components/data/stat";
import { StatusBadge, PROJECTS } from "@/components/data/_shared";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

const METRICS = [
  { label: "Projects", value: "14", icon: IconFolders },
  { label: "Builds", value: "128", icon: IconHammer },
  { label: "Testers", value: "312", icon: IconUsers },
  { label: "Releases", value: "6", icon: IconRocket },
];

export function GridPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Layout"
        title="Grid"
        description={
          <>
            A two-dimensional layout for collections — stats, cards, decks. It reflows responsively
            (1 → 2 → N columns) or auto-fits a minimum column width, with gap control on both axes.
          </>
        }
      />

      <Section title="Responsive columns" description="One prop, four layouts — grid reflows 1 → 2 → N as the viewport grows.">
        <Grid cols={4} gap={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} className="h-16">
              {i + 1}
            </Box>
          ))}
        </Grid>
      </Section>

      <Section title="Gap control" description="A single gap, or independent column and row gaps.">
        <div className="flex flex-col gap-6">
          <div>
            <Mono className="text-muted-foreground">gap-6</Mono>
            <Grid cols={3} gap={6} className="mt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} className="h-12" />
              ))}
            </Grid>
          </div>
          <div>
            <Mono className="text-muted-foreground">colGap-8 · rowGap-2</Mono>
            <Grid cols={3} colGap={8} rowGap={2} className="mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i} className="h-10" />
              ))}
            </Grid>
          </div>
        </div>
      </Section>

      <Section
        title="Auto-fit"
        description="When you don't know the count, auto-fit packs as many columns as fit a minimum width."
      >
        <Grid minColWidth="12rem" gap={3}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Box key={i} className="h-14">
              min 12rem
            </Box>
          ))}
        </Grid>
      </Section>

      <Section title="Stats" description="A metric grid — one stat per card.">
        <Grid cols={4} gap={4}>
          {METRICS.map((m) => (
            <Card key={m.label} size="sm" className="px-5">
              <Stat label={m.label} value={m.value} icon={m.icon} />
            </Card>
          ))}
        </Grid>
      </Section>

      <Section title="Project cards" description="A card deck, reusing the Card component.">
        <Grid cols={3} gap={4}>
          {PROJECTS.map((p) => (
            <Card key={p.name}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>
                  {p.builds} builds · {p.environment}
                </CardDescription>
                <CardAction>
                  <StatusBadge status={p.status} />
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Grid is presentational; the DOM order is the reading order, so keep children in a sensible sequence.",
            "Card and Stat children keep their own heading and status semantics.",
            "Columns collapse to one on mobile so nothing is clipped or side-scrolled.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
