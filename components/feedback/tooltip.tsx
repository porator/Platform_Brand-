"use client";

import * as React from "react";
import { IconSettings, IconInfoCircle } from "@/lib/icons";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function TooltipPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Tooltip"
        description={
          <>
            A small label that appears on hover or focus to clarify a control — the shadcn{" "}
            <Mono>Tooltip</Mono>. Use it for supplementary hints, never for essential information or
            interactive content.
          </>
        }
      />

      <Section title="Basic usage" description="Hover or focus the trigger to reveal its label.">
        <Row label="Default">
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
            <TooltipContent>Deploys the current build</TooltipContent>
          </Tooltip>
        </Row>
      </Section>

      <Section title="Placements" description="Tooltips can anchor on any side and flip to stay in view.">
        <Row label="Sides" className="gap-6">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger render={<Button variant="outline" size="sm" className="capitalize">{side}</Button>} />
              <TooltipContent side={side}>Anchored {side}</TooltipContent>
            </Tooltip>
          ))}
        </Row>
      </Section>

      <Section
        title="On icon-only controls"
        description="The most common use — giving an icon button an accessible, visible label."
      >
        <Row label="Icon buttons" className="gap-2">
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Settings" />}>
              <IconSettings />
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="About" />}>
              <IconInfoCircle />
            </TooltipTrigger>
            <TooltipContent>About this project</TooltipContent>
          </Tooltip>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Shows on hover and on keyboard focus; dismisses on blur or Esc.",
            <>
              The tooltip is supplementary — icon-only controls still carry an{" "}
              <Mono>aria-label</Mono> so they are named even without hovering.
            </>,
            "Never put essential information or interactive elements inside a tooltip.",
            "Content uses the popover tokens, legible in light and dark.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
