"use client";

import * as React from "react";
import {
  IconDeviceDesktop,
  IconDeviceTablet,
  IconDeviceMobile,
  IconRefresh,
  IconExternalLink,
  IconCircleFilled,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader, Section, A11yList } from "@/components/atoms/_kit";

type Device = "desktop" | "tablet" | "mobile";

const FRAME: Record<Device, string> = {
  desktop: "w-full max-w-2xl aspect-[16/10]",
  tablet: "w-[22rem] aspect-[3/4]",
  mobile: "w-[16rem] aspect-[9/16]",
};

/** A mock Appcharge store rendered inside the preview frame. */
function StorePreview() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">Store</span>
        <span className="text-xs text-muted-foreground">Project Alpha</span>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Best value</p>
          <p className="mt-1 text-base font-semibold">Starter Pack</p>
          <p className="text-sm text-muted-foreground">1,200 coins + 3 boosters</p>
          <Button size="sm" className="mt-3 w-full">
            $4.99
          </Button>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-base font-semibold">Coin Bundle</p>
          <p className="text-sm text-muted-foreground">600 coins</p>
          <Button size="sm" variant="outline" className="mt-3 w-full">
            $2.99
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppPreview({
  environment = "Production",
  defaultDevice = "mobile",
  className,
}: {
  environment?: string;
  defaultDevice?: Device;
  className?: string;
}) {
  const [device, setDevice] = React.useState<Device>(defaultDevice);

  return (
    <div className={cn("overflow-hidden rounded-md border border-border", className)}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-2">
        <Badge variant="neutral" className="gap-1.5">
          <IconCircleFilled className="size-2 text-success" aria-hidden />
          {environment}
        </Badge>
        <Tabs value={device} onValueChange={(v) => setDevice(v as Device)} className="ml-auto">
          <TabsList aria-label="Preview device">
            <TabsTrigger value="desktop" aria-label="Desktop">
              <IconDeviceDesktop />
            </TabsTrigger>
            <TabsTrigger value="tablet" aria-label="Tablet">
              <IconDeviceTablet />
            </TabsTrigger>
            <TabsTrigger value="mobile" aria-label="Mobile">
              <IconDeviceMobile />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Reload preview">
            <IconRefresh />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Open in new tab">
            <IconExternalLink />
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex min-h-80 items-center justify-center bg-muted/40 p-6">
        <div className={cn("overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all", FRAME[device])}>
          <StorePreview />
        </div>
      </div>
    </div>
  );
}

export function AppPreviewPage() {
  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Product Components"
        title="App Preview"
        description={
          <>
            A live preview of an Appcharge store, framed for a target device. It shows which
            environment is being previewed and lets you switch between desktop, tablet and mobile. It
            composes Tabs, Badge, Button and Card, and is used inside editor workflows.
          </>
        }
      />

      <Section
        title="Default"
        description="An environment indicator, device controls and the framed store. Switch devices to resize the frame."
      >
        <AppPreview />
      </Section>

      <Section
        title="Desktop frame"
        description="The same preview at desktop proportions."
      >
        <AppPreview defaultDevice="desktop" environment="Staging" />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Device controls are a labelled tablist; each option has an accessible name.",
            "Preview controls (reload, open) are labelled icon buttons.",
            <>
              The environment is shown as a labelled badge with a status dot, not color alone.
            </>,
            "The frame resizes responsively and the preview content scrolls within it.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
