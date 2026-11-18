"use client";

import * as React from "react";
import { IconDeviceMobile } from "@/lib/icons";
import { SplitView } from "./primitives";
import { Box } from "./_demo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, A11yList } from "@/components/atoms/_kit";

/** Generic Editor + Preview composition — the primary Split View use case. */
export function EditorPreview() {
  return (
    <SplitView
      className="h-[26rem] overflow-hidden rounded-md border border-border"
      primaryClassName="lg:w-80"
      primary={
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">Configuration</p>
          </div>
          <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col px-3 pt-3">
            <TabsList variant="line" className="w-full justify-start border-b border-border">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="min-h-0 flex-1 space-y-4 overflow-auto py-4">
              <div className="grid gap-2">
                <Label htmlFor="sv-title">Headline</Label>
                <Input id="sv-title" defaultValue="Starter Pack" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sv-sub">Subtitle</Label>
                <Input id="sv-sub" defaultValue="Best value for new players" />
              </div>
            </TabsContent>
            <TabsContent value="theme" className="min-h-0 flex-1 py-4 text-sm text-muted-foreground">
              Theme settings…
            </TabsContent>
            <TabsContent value="pricing" className="min-h-0 flex-1 py-4 text-sm text-muted-foreground">
              Pricing settings…
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
            <Button variant="outline" size="sm">
              Reset
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
      }
      secondary={
        <div className="flex h-full flex-col bg-muted/40">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">Preview</p>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="flex aspect-[9/16] h-full max-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background text-muted-foreground">
              <IconDeviceMobile className="size-6" />
              <span className="text-xs">Store Preview</span>
            </div>
          </div>
        </div>
      }
    />
  );
}

export function SplitViewPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Layout"
        title="Split View"
        description={
          <>
            Two panes side by side — a primary and a secondary — that stack vertically on small
            screens. It&apos;s the backbone of editor/preview, list/detail and master/detail
            interfaces. Generic: pass any content to each pane.
          </>
        }
      />

      <Section
        title="Basic usage"
        description="A fixed-width primary pane and a flexible secondary, divided by a hairline. Narrow the viewport to see it stack."
      >
        <SplitView
          className="h-56 overflow-hidden rounded-md border border-border"
          primaryClassName="lg:w-64"
          primary={<Box className="h-full rounded-none border-0" >Primary · lg:w-64</Box>}
          secondary={<Box className="h-full rounded-none border-0" muted={false}>Secondary · flex-1</Box>}
        />
      </Section>

      <Section
        title="Proportions & order"
        description="Size the primary pane with any width class; reverse to put it on the right."
      >
        <div className="flex flex-col gap-4">
          <SplitView
            className="h-40 overflow-hidden rounded-md border border-border"
            primaryClassName="lg:w-1/2"
            primary={<Box className="h-full rounded-none border-0">lg:w-1/2</Box>}
            secondary={<Box className="h-full rounded-none border-0" muted={false}>flex-1</Box>}
          />
          <SplitView
            reverse
            className="h-40 overflow-hidden rounded-md border border-border"
            primaryClassName="lg:w-72"
            primary={<Box className="h-full rounded-none border-0">lg:w-72 · right</Box>}
            secondary={<Box className="h-full rounded-none border-0" muted={false}>flex-1 · left</Box>}
          />
        </div>
      </Section>

      <Section
        title="Composition — Editor + Preview"
        description="The canonical use: a configuration editor on the left, a live preview on the right. On mobile they stack, editor first."
      >
        <EditorPreview />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Each pane is an independent region; focus order follows the DOM (primary before secondary).",
            "On mobile the panes stack in reading order — the editor precedes its preview.",
            <>
              Give each pane a heading so its purpose is clear in the document outline.
            </>,
            "No focus is trapped between panes; the layout is purely structural.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
