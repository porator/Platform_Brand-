"use client";

import * as React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function DrawerPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Drawer"
        description={
          <>
            A panel that slides in from an edge — the shadcn <Mono>Sheet</Mono>. Use it for secondary
            tasks beside the main content: filters, details, settings, or a record&apos;s side panel.
            It&apos;s the same primitive the mobile Sidebar uses.
          </>
        }
      />

      <Section title="Basic usage" description="Opens from the right over a dimmed backdrop.">
        <Row label="Default">
          <Sheet>
            <SheetTrigger render={<Button variant="outline">Open drawer</Button>} />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Build #124</SheetTitle>
                <SheetDescription>Details for this build.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 px-4 text-sm text-muted-foreground">
                Version v2.4.1 · Production · Ready · Created Oct 6, 2026.
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline">Close</Button>} />
                <Button>Re-run build</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Row>
      </Section>

      <Section title="Sides" description="A drawer can enter from any edge.">
        <Row label="Edges" className="gap-2">
          {(["left", "right", "top", "bottom"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger render={<Button variant="outline" size="sm" className="capitalize">{side}</Button>} />
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle className="capitalize">{side} drawer</SheetTitle>
                  <SheetDescription>Slides in from the {side}.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          ))}
        </Row>
      </Section>

      <Section
        title="Filters panel"
        description="A realistic use — a filter drawer beside a list or table."
      >
        <Row label="Filters">
          <Sheet>
            <SheetTrigger render={<Button variant="outline">Filters</Button>} />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter builds</SheetTitle>
                <SheetDescription>Narrow the list by these criteria.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 px-4">
                <div className="grid gap-2">
                  <Label htmlFor="d-version">Version</Label>
                  <Input id="d-version" placeholder="e.g. v2.4" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="d-failed">Only failed builds</Label>
                  <Switch id="d-failed" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="d-prod">Production only</Label>
                  <Switch id="d-prod" defaultChecked />
                </div>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline">Reset</Button>} />
                <SheetClose render={<Button>Apply filters</Button>} />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Exposes <Mono>role=&quot;dialog&quot;</Mono> with <Mono>aria-modal</Mono>; title and
              description name it.
            </>,
            "Focus moves into the drawer, is trapped, and returns to the trigger on close.",
            "Dismisses on Esc, the close button, or a tap on the backdrop.",
            "Form controls inside are fully keyboard operable with visible focus.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
