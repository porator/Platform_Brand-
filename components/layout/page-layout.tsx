"use client";

import * as React from "react";
import { IconFilter, IconPlus } from "@/lib/icons";
import { PageLayout } from "./primitives";
import { Box } from "./_demo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

function Tabset() {
  return (
    <Tabs defaultValue="builds">
      <TabsList variant="line" className="w-full justify-start border-b border-border">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="builds">Builds</TabsTrigger>
        <TabsTrigger value="testers">Testers</TabsTrigger>
        <TabsTrigger value="releases">Releases</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function PageLayoutPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Layout"
        title="Page Layout"
        description={
          <>
            The canonical structure for a page&apos;s body inside the application shell — breadcrumbs,
            a header (title, description, actions), tabs, content, and an optional secondary aside. It
            standardizes where everything goes so every screen feels the same.
          </>
        }
      />

      <Section
        title="Anatomy"
        description="Breadcrumbs → header (title · description · actions) → tabs → content. Shown here as the page body; the sidebar and top bar come from the shell."
      >
        <div className="h-[28rem] overflow-hidden rounded-md border border-border bg-background">
          <PageLayout
            breadcrumbs={<Breadcrumbs label="Page layout example" trail={["Projects", "Project Alpha", "Builds"]} />}
            title={
              <span className="inline-flex items-center gap-3">
                Builds <Badge variant="secondary">12</Badge>
              </span>
            }
            description="Builds for Project Alpha in Production."
            actions={
              <>
                <Button variant="outline" size="sm">
                  <IconFilter /> Filter
                </Button>
                <Button size="sm">
                  <IconPlus /> New build
                </Button>
              </>
            }
            tabs={<Tabset />}
          >
            <Box className="h-40" muted>
              Page content
            </Box>
          </PageLayout>
        </div>
      </Section>

      <Section
        title="With secondary content"
        description="An optional aside (details, activity, help) sits beside the main content on wide screens and below it on mobile."
      >
        <div className="h-[26rem] overflow-hidden rounded-md border border-border bg-background">
          <PageLayout
            breadcrumbs={<Breadcrumbs label="Page layout secondary example" trail={["Projects", "Project Alpha"]} />}
            title="Overview"
            description="A summary of this project."
            actions={<Button size="sm">Edit</Button>}
            secondary={
              <div className="rounded-md border border-border p-4">
                <p className="text-sm font-medium text-foreground">Activity</p>
                <p className="mt-1 text-sm text-muted-foreground">Recent changes appear here.</p>
              </div>
            }
          >
            <Box className="h-40" muted>
              Main content
            </Box>
          </PageLayout>
        </div>
      </Section>

      <Section
        title="In the shell"
        description="Wrapped by the Sidebar + Top Bar, Page Layout completes the application frame. See the full composition in Layout + Patterns → Project Management."
      >
        <A11yList
          items={[
            "Sidebar (nav landmark) + Top Bar (header) + Page Layout (main) form the complete frame.",
            "Page Layout provides the single <h1> for the page and a consistent action area.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The page title is the page&apos;s single <Mono>&lt;h1&gt;</Mono>, anchoring the heading
              hierarchy.
            </>,
            "Breadcrumbs are a labelled nav landmark; the content region reads after the header.",
            "On mobile, the secondary aside moves below the main content, preserving reading order.",
            "Actions are grouped and keyboard-reachable; tabs follow the ARIA tabs pattern.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
