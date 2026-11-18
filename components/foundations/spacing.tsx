"use client";

import * as React from "react";
import { PageShell, PageHeader, Section, Mono, MetaLabel } from "./_kit";
import { SPACING_SCALE } from "./tokens";

function ScaleRow({ step, rem }: { step: string; rem: number }) {
  const px = rem * 16;
  return (
    <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-t border-border py-2.5 first:border-t-0">
      <Mono className="text-foreground">{step}</Mono>
      <div className="flex items-center">
        <div
          className="h-4 bg-primary"
          style={{ width: `${rem}rem` }}
          aria-hidden
        />
      </div>
      <div className="flex items-baseline gap-4 tabular-nums">
        <Mono className="text-foreground">{rem}rem</Mono>
        <Mono className="w-12 text-right text-muted-foreground">{px}px</Mono>
      </div>
    </div>
  );
}

export function SpacingPage() {
  return (
    <PageShell>
      <PageHeader
        title="Spacing"
        description={
          <>
            A single modular scale drives all padding, margin and gap. One unit equals{" "}
            <Mono>0.25rem</Mono> (4px), so <Mono>p-4</Mono> is <Mono>1rem</Mono>. Using the scale
            consistently is what gives layouts their rhythm.
          </>
        }
      />

      <Section
        title="Scale"
        description="Each step maps to the number in a Tailwind spacing utility — p-, m-, gap-, space-, size- and friends."
      >
        <div className="mb-3 grid grid-cols-[3.5rem_1fr_auto] gap-4">
          <MetaLabel>Step</MetaLabel>
          <MetaLabel>Visual</MetaLabel>
          <span className="text-right">
            <MetaLabel>Value</MetaLabel>
          </span>
        </div>
        <div>
          {SPACING_SCALE.map((s) => (
            <ScaleRow key={s.step} step={s.step} rem={s.rem} />
          ))}
        </div>
      </Section>

      <Section
        title="Rhythm in practice"
        description="The same scale applied as stacked gaps and container padding."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border border-border bg-card p-6 text-card-foreground">
            <p className="text-sm font-medium">Vertical stack — gap-4</p>
            <div className="mt-4 flex flex-col gap-4">
              {["Projects", "Builds", "Releases"].map((x) => (
                <div key={x} className="border border-border bg-background px-4 py-3 text-sm">
                  {x}
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border bg-card p-6 text-card-foreground">
            <p className="text-sm font-medium">Padding steps</p>
            <div className="mt-4 space-y-3">
              {[
                ["p-2", "0.5rem"],
                ["p-4", "1rem"],
                ["p-6", "1.5rem"],
              ].map(([cls, val]) => (
                <div key={cls} className="flex items-center gap-3">
                  <Mono className="w-12 text-muted-foreground">{cls}</Mono>
                  <div className="border border-border bg-background" style={{ padding: val }}>
                    <div className="size-6 bg-accent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
