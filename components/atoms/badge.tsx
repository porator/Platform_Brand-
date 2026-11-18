"use client";

import * as React from "react";
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconX,
  IconPoint,
} from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "./_kit";

export function BadgePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Badge"
        description={
          <>
            A compact label for status, counts and metadata. Built on the shadcn <Mono>Badge</Mono>{" "}
            (Base UI). Alongside the four base variants, the system adds soft, token-based{" "}
            <strong className="text-foreground">semantic status</strong> variants.
          </>
        }
      />

      <Section title="Basic usage">
        <Row label="Default">
          <Badge>Badge</Badge>
        </Row>
      </Section>

      <Section
        title="Variants"
        description="The four base variants from the preset — emphasis by weight, not hue."
      >
        <Row label="Base">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Row>
      </Section>

      <Section
        title="Semantic status"
        description="Extended variants for product status. Soft, token-based surfaces — Success / Warning / Info use new status tokens, Error reuses destructive, Neutral reuses muted."
      >
        <Row label="Status" hint="Color is reinforced with an icon so meaning never relies on hue alone.">
          <Badge variant="success">
            <IconCircleCheck />
            Success
          </Badge>
          <Badge variant="warning">
            <IconAlertTriangle />
            Warning
          </Badge>
          <Badge variant="destructive">
            <IconX />
            Error
          </Badge>
          <Badge variant="info">
            <IconInfoCircle />
            Info
          </Badge>
          <Badge variant="neutral">
            <IconPoint />
            Neutral
          </Badge>
        </Row>
      </Section>

      <Section
        title="With & without icon"
        description="A leading icon is auto-sized. Use icons to reinforce status; omit them for plain labels and counts."
      >
        <Row label="With icon">
          <Badge variant="success">
            <IconCircleCheck />
            Passed
          </Badge>
          <Badge variant="destructive">
            <IconX />
            Failed
          </Badge>
        </Row>
        <Row label="Without icon">
          <Badge variant="secondary">v1.4.2</Badge>
          <Badge variant="neutral">Draft</Badge>
          <Badge>3</Badge>
        </Row>
      </Section>

      <Section
        title="Interactive"
        description="Badges are labels, not controls. When one must be actionable, render it as a link or button so it is focusable — hover state applies automatically."
      >
        <Row label="As a link" hint="Rendered via the Base UI render prop as an <a>.">
          <Badge variant="outline" render={<a href="#interactive" />}>
            Clearable filter
            <IconX />
          </Badge>
        </Row>
        <Row label="Disabled" hint="Not applicable — a plain badge is non-interactive. Use the neutral/muted variant to read as inactive.">
          <Badge variant="neutral">Inactive</Badge>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Status is conveyed by icon + text, not color alone.",
            <>
              Decorative — a badge renders as a <Mono>&lt;span&gt;</Mono> by default and adds no
              semantics; the label text carries the meaning.
            </>,
            "Actionable badges render as a link or button so they are keyboard-focusable.",
            "All variants meet WCAG AA contrast in light and dark.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
