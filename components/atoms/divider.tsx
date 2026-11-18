"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "./_kit";

export function DividerPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Divider"
        description={
          <>
            A thin rule that separates content. It is the shadcn <Mono>Separator</Mono> (Base UI),
            using the <Mono>border</Mono> token in both orientations.
          </>
        }
      />

      <Section title="Horizontal" description="The default — separates stacked blocks of content.">
        <Row label="Default" className="w-full max-w-md flex-col items-stretch">
          <p className="text-sm text-foreground">Project settings</p>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">Danger zone</p>
        </Row>
      </Section>

      <Section title="Vertical" description="Separates inline items — breadcrumbs, metadata, toolbars.">
        <Row label="Inline">
          <div className="flex h-5 items-center gap-3 text-sm text-muted-foreground">
            <span>Overview</span>
            <Separator orientation="vertical" />
            <span>Builds</span>
            <Separator orientation="vertical" />
            <span>Settings</span>
          </div>
        </Row>
      </Section>

      <Section
        title="With content"
        description="A labelled divider — a separator on each side of centered text, e.g. between sections or auth options."
      >
        <Row label="Labelled" className="w-full max-w-md">
          <div className="flex w-full items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
        </Row>
      </Section>

      <Section
        title="In context"
        description="Spacing is owned by the layout — the divider itself is just the line."
      >
        <Row label="List" className="w-full max-w-md">
          <div className="w-full border border-border">
            {["Dashboard", "Projects", "Releases"].map((item, i, arr) => (
              <React.Fragment key={item}>
                <div className="px-4 py-3 text-sm text-foreground">{item}</div>
                {i < arr.length - 1 ? <Separator /> : null}
              </React.Fragment>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Exposes <Mono>role=&quot;separator&quot;</Mono> with the correct orientation.
            </>,
            "Purely decorative dividers add no focus stop and don't interrupt reading order.",
            "Relies on the border token, so it remains visible in light and dark.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
