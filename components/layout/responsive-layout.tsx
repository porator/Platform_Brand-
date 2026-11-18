"use client";

import * as React from "react";
import { Grid, SplitView, Stack } from "./primitives";
import { Box } from "./_demo";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

function useViewportWidth() {
  const [w, setW] = React.useState<number | null>(null);
  React.useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

function activeBp(w: number) {
  if (w >= 1280) return "xl";
  if (w >= 1024) return "lg";
  if (w >= 768) return "md";
  if (w >= 640) return "sm";
  return "base";
}

export function ResponsiveLayoutPage() {
  const w = useViewportWidth();
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Layout"
        title="Responsive Layout"
        description={
          <>
            Layouts should <strong className="text-foreground">transform intentionally</strong>{" "}
            across breakpoints, not just shrink. The same content is reorganised so each viewport gets
            an appropriate structure. Resize the preview (or use the viewport toolbar) to watch these
            adapt.
          </>
        }
      />

      <Section title="Live viewport" description="The current width and the breakpoint it resolves to.">
        <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-6 py-5">
          <div>
            <p className="text-xs text-muted-foreground">Width</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
              {w != null ? `${w}px` : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Breakpoint</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{w != null ? activeBp(w) : "—"}</p>
          </div>
        </div>
      </Section>

      <Section
        title="Sidebar + content → drawer + content"
        description="On desktop the navigation is a persistent rail beside the content. On mobile it collapses to an off-canvas drawer behind a trigger — the content gets the full width. (Shown live in Navigation → Full Application Shell.)"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-3">
            <Mono className="text-muted-foreground">Desktop</Mono>
            <div className="mt-2 flex h-28 gap-2">
              <Box className="w-16">Rail</Box>
              <Box className="flex-1" muted={false}>
                Content
              </Box>
            </div>
          </div>
          <div className="rounded-md border border-border p-3">
            <Mono className="text-muted-foreground">Mobile</Mono>
            <div className="mt-2 flex h-28 flex-col gap-2">
              <Box className="h-8">☰ Top bar (drawer trigger)</Box>
              <Box className="flex-1" muted={false}>
                Content (full width)
              </Box>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Two-column grid → single column"
        description="A card grid is multi-column on wide screens and a single stacked column on mobile — live below."
      >
        <Grid cols={3} gap={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} className="h-16">
              Card {i + 1}
            </Box>
          ))}
        </Grid>
      </Section>

      <Section
        title="Split view → stacked view"
        description="Editor and preview sit side by side on desktop and stack vertically on mobile (editor first) — live below."
      >
        <SplitView
          className="h-56 overflow-hidden rounded-md border border-border"
          primaryClassName="lg:w-64"
          primary={<Box className="h-full rounded-none border-0">Editor</Box>}
          secondary={<Box className="h-full rounded-none border-0" muted={false}>Preview</Box>}
        />
      </Section>

      <Section
        title="Toolbar → stacked controls"
        description="A horizontal toolbar on desktop becomes a vertical stack on mobile so targets stay comfortable."
      >
        <Stack direction="responsive" gap={2} className="rounded-md border border-border p-3">
          <Box className="flex-1">Search</Box>
          <Box>Filter</Box>
          <Box>Create</Box>
        </Stack>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Reorganising layout must not scramble reading order — the DOM stays in a logical sequence across breakpoints.",
            "Mobile transforms (drawer, stacking) are intentional, not a shrunk desktop; touch targets stay adequate.",
            "Nothing important disappears at small sizes without an alternative (e.g. the sidebar becomes a drawer).",
          ]}
        />
      </Section>
    </PageShell>
  );
}
