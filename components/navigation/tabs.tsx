"use client";

import * as React from "react";
import {
  IconLayoutDashboard,
  IconHammer,
  IconUsers,
  IconRocket,
  IconSettings,
} from "@/lib/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="border border-t-0 border-border p-5 text-sm text-muted-foreground">{children}</div>;
}

export function TabsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Navigation"
        title="Tabs"
        description={
          <>
            Switches between views of the same resource without leaving the page — the shadcn{" "}
            <Mono>Tabs</Mono> (Base UI). Use the <Mono>line</Mono> variant for page-level product
            navigation and the <Mono>default</Mono> segmented variant for compact in-card switches.
          </>
        }
      />

      <Section
        title="Basic usage"
        description="Page-level product tabs (line variant) with content panels."
      >
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builds">Builds</TabsTrigger>
            <TabsTrigger value="testers">Testers</TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Panel>Project summary, recent activity and health.</Panel>
          </TabsContent>
          <TabsContent value="builds">
            <Panel>The list of builds for this environment.</Panel>
          </TabsContent>
          <TabsContent value="testers">
            <Panel>People with access to test this project.</Panel>
          </TabsContent>
          <TabsContent value="releases">
            <Panel>Published releases and rollout status.</Panel>
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        title="Variants"
        description="Line (underline) for page navigation; default (segmented) for compact switches."
      >
        <div className="flex flex-col gap-8">
          <Row label="Line" className="w-full">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList variant="line" className="w-full justify-start border-b border-border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="builds">Builds</TabsTrigger>
                <TabsTrigger value="releases">Releases</TabsTrigger>
              </TabsList>
            </Tabs>
          </Row>
          <Row label="Segmented" className="w-full">
            <Tabs defaultValue="day">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </Row>
        </div>
      </Section>

      <Section
        title="Icons, counts & states"
        description="Tabs can carry an icon and a count badge; unavailable tabs are disabled."
      >
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            <TabsTrigger value="overview">
              <IconLayoutDashboard />
              Overview
            </TabsTrigger>
            <TabsTrigger value="builds">
              <IconHammer />
              Builds
              <Badge variant="secondary" className="ml-1">
                12
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="testers">
              <IconUsers />
              Testers
            </TabsTrigger>
            <TabsTrigger value="releases">
              <IconRocket />
              Releases
            </TabsTrigger>
            <TabsTrigger value="settings" disabled>
              <IconSettings />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Panel>Icon + label tabs, with a live count on Builds and a disabled Settings tab.</Panel>
          </TabsContent>
          <TabsContent value="builds">
            <Panel>12 builds in this environment.</Panel>
          </TabsContent>
          <TabsContent value="testers">
            <Panel>Testers list.</Panel>
          </TabsContent>
          <TabsContent value="releases">
            <Panel>Releases list.</Panel>
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        title="Scrollable (responsive)"
        description="When tabs exceed the available width they scroll horizontally rather than wrapping. Narrow the viewport to try it."
      >
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto border-b border-border">
            <TabsList variant="line" className="w-max">
              {["Overview", "Builds", "Testers", "Releases", "Analytics", "Integrations", "Webhooks", "Settings"].map(
                (t) => (
                  <TabsTrigger key={t} value={t.toLowerCase()}>
                    {t}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </div>
          <TabsContent value="overview">
            <Panel>A long tab set scrolls horizontally on small screens.</Panel>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Implements the ARIA tabs pattern — role=tablist / tab / tabpanel.",
            "Arrow keys move between tabs; the active tab is linked to its panel.",
            "Disabled tabs are skipped by the keyboard and marked aria-disabled.",
            "The active tab is indicated by the underline/fill and aria-selected, not color alone.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
