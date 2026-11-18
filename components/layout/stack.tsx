"use client";

import * as React from "react";
import { IconFilter, IconPlus } from "@/lib/icons";
import { Stack } from "./primitives";
import { Box } from "./_demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function StackPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Layout"
        title="Stack"
        description={
          <>
            A one-dimensional flex layout — vertical or horizontal — with consistent gaps, alignment
            and wrapping. Stack is the workhorse for forms, toolbars, metadata rows and action
            groups, so spacing stays on the scale everywhere.
          </>
        }
      />

      <Section title="Direction & gap" description="Vertical or horizontal, with a gap from the spacing scale.">
        <div className="flex flex-col gap-6">
          <Row label="Vertical · gap-3" className="max-w-sm">
            <Stack gap={3} className="w-full">
              <Box>Item one</Box>
              <Box>Item two</Box>
              <Box>Item three</Box>
            </Stack>
          </Row>
          <Row label="Horizontal · gap-2">
            <Stack direction="horizontal" gap={2}>
              <Box>A</Box>
              <Box>B</Box>
              <Box>C</Box>
            </Stack>
          </Row>
        </div>
      </Section>

      <Section
        title="Alignment & justification"
        description="Align on the cross axis and distribute on the main axis."
      >
        <div className="flex flex-col gap-4">
          <Row label="justify-between">
            <Stack direction="horizontal" justify="between" className="w-full max-w-md">
              <Box>Start</Box>
              <Box>End</Box>
            </Stack>
          </Row>
          <Row label="align-center">
            <Stack direction="horizontal" align="center" gap={3}>
              <Box className="h-14">Tall</Box>
              <Box>Short</Box>
            </Stack>
          </Row>
        </div>
      </Section>

      <Section
        title="Responsive direction & wrap"
        description="Stacks can switch from column on mobile to row on larger screens, and wrap when space runs out."
      >
        <div className="flex flex-col gap-6">
          <Row label="responsive" hint="Column on mobile → row at sm.">
            <Stack direction="responsive" gap={3} className="w-full">
              <Box className="flex-1">Primary</Box>
              <Box className="flex-1">Secondary</Box>
            </Stack>
          </Row>
          <Row label="wrap">
            <Stack direction="horizontal" gap={2} wrap className="max-w-xs">
              {Array.from({ length: 8 }).map((_, i) => (
                <Box key={i} className="w-16">
                  {i + 1}
                </Box>
              ))}
            </Stack>
          </Row>
        </div>
      </Section>

      <Section title="In practice" description="The patterns Stack is built for.">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Page header</p>
            <Stack direction="horizontal" align="center" justify="between" className="rounded-md border border-border p-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Projects</h3>
                <p className="text-sm text-muted-foreground">3 projects</p>
              </div>
              <Button size="sm">
                <IconPlus /> New
              </Button>
            </Stack>
          </div>

          {/* Toolbar */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Toolbar</p>
            <Stack direction="horizontal" gap={2} align="center" wrap className="rounded-md border border-border p-3">
              <Input aria-label="Search" placeholder="Search…" className="h-8 max-w-56" />
              <Button variant="outline" size="sm">
                <IconFilter /> Filter
              </Button>
              <Button size="sm" className="sm:ml-auto">
                Export
              </Button>
            </Stack>
          </div>

          {/* Metadata row */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Metadata row</p>
            <Stack direction="horizontal" gap={3} align="center" wrap className="text-sm text-muted-foreground">
              <span>v2.4.1</span>
              <span aria-hidden>·</span>
              <span>Production</span>
              <span aria-hidden>·</span>
              <Badge variant="success">Ready</Badge>
            </Stack>
          </div>

          {/* Form layout */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Form layout</p>
            <Stack gap={4} className="max-w-sm rounded-md border border-border p-4">
              <div className="grid gap-2">
                <Label htmlFor="st-name">Project name</Label>
                <Input id="st-name" placeholder="Project Delta" />
              </div>
              <Stack direction="horizontal" gap={2} justify="end">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Save</Button>
              </Stack>
            </Stack>
          </div>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Stack is presentational — it controls visual order without changing the DOM reading order.",
            <>
              Keep the DOM order meaningful; use <Mono>direction</Mono> for visual layout, not to
              reorder content for screen readers.
            </>,
            "Interactive children keep their own semantics and focus order.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
