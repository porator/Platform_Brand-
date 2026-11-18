"use client";

import * as React from "react";
import { IconDotsVertical } from "@/lib/icons";
import { PageShell, PageHeader, Section, Mono } from "./_kit";

const SHADOWS: { cls: string; name: string; use: string }[] = [
  { cls: "shadow-xs", name: "shadow-xs", use: "Resting controls, inputs" },
  { cls: "shadow-sm", name: "shadow-sm", use: "Cards, raised rows" },
  { cls: "shadow-md", name: "shadow-md", use: "Dropdowns, popovers" },
  { cls: "shadow-lg", name: "shadow-lg", use: "Dialogs, sheets" },
  { cls: "shadow-xl", name: "shadow-xl", use: "Command palette, spotlight" },
];

export function ElevationPage() {
  return (
    <PageShell>
      <PageHeader
        title="Elevation"
        description={
          <>
            The system is <strong className="text-foreground">border-led and flat</strong> — a
            technical look where hierarchy comes first from hairline borders and layered surface
            tokens. Shadows are deliberately restrained and reserved for content that genuinely
            floats above the page (overlays).
          </>
        }
      />

      <Section
        title="Surface hierarchy"
        description="Depth is expressed by stacking background → card → popover tokens, each separated by a border rather than a heavy shadow."
      >
        <div className="border border-border bg-background p-6">
          <Mono className="text-muted-foreground">bg-background</Mono>
          <div className="mt-3 border border-border bg-card p-6 text-card-foreground">
            <Mono className="text-muted-foreground">bg-card</Mono>
            <div className="mt-3 border border-border bg-popover p-6 text-popover-foreground shadow-md">
              <Mono className="text-muted-foreground">bg-popover · shadow-md</Mono>
              <p className="mt-2 text-sm">The floating layer is the only one that casts a shadow.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Shadow scale"
        description="A restrained ramp. Most of the UI stays at xs–sm; md and above signal an overlay."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SHADOWS.map((s) => (
            <div key={s.cls} className="flex flex-col gap-4">
              <div
                className={`flex h-24 items-center justify-center border border-border bg-card text-card-foreground ${s.cls}`}
              >
                <Mono className="text-muted-foreground">{s.name}</Mono>
              </div>
              <p className="text-xs text-muted-foreground">{s.use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Borders as the primary separator"
        description="Because radius is 0 and surfaces are flat, the border token does most of the structural work."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="divide-y divide-border border border-border">
            {["Dashboard", "Projects", "Builds", "Releases"].map((x) => (
              <div key={x} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-foreground">{x}</span>
                <IconDotsVertical size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="border border-border bg-card p-4 text-card-foreground">
              <p className="text-sm font-medium">Bordered card</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Default resting surface — <Mono>border</Mono> + <Mono>bg-card</Mono>, no shadow.
              </p>
            </div>
            <div className="border border-border bg-popover p-4 text-popover-foreground shadow-md">
              <p className="text-sm font-medium">Overlay surface</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Lifted surface — adds <Mono>shadow-md</Mono> to read as floating.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
