"use client";

import * as React from "react";
import {
  IconPlus,
  IconDownload,
  IconTrash,
  IconSettings,
  IconLoader2,
  IconArrowRight,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "./_kit";

const VARIANTS: { variant: React.ComponentProps<typeof Button>["variant"]; label: string; usage: string }[] = [
  { variant: "default", label: "Default", usage: "The primary action in a view. Use one per surface." },
  { variant: "secondary", label: "Secondary", usage: "A secondary action shown alongside the primary." },
  { variant: "outline", label: "Outline", usage: "Neutral action; pairs well in toolbars and groups." },
  { variant: "ghost", label: "Ghost", usage: "Low-emphasis action, often icon-only or in dense UI." },
  { variant: "destructive", label: "Destructive", usage: "Dangerous or irreversible actions (delete, remove)." },
  { variant: "link", label: "Link", usage: "Navigational action that reads as inline text." },
];

export function ButtonPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Button"
        description={
          <>
            Triggers an action or event. Built on the shadcn <Mono>Button</Mono> (Base UI), it covers
            six variants and a full size range, and auto-sizes any icon child. Use exactly one
            high-emphasis (default) button per surface.
          </>
        }
      />

      <Section title="Basic usage" description="The default button, used for the primary action.">
        <Row label="Default">
          <Button>Create project</Button>
        </Row>
      </Section>

      <Section
        title="Variants"
        description="Six emphasis levels. Each has an intended role — pick by importance, not by color."
      >
        <div>
          {VARIANTS.map((v) => (
            <Row key={v.label} label={v.label} hint={v.usage}>
              <Button variant={v.variant}>{v.label}</Button>
            </Row>
          ))}
        </div>
      </Section>

      <Section
        title="Sizes"
        description="Small, default and large share the type scale; the icon size is a square target for icon-only actions."
      >
        <Row label="Scale">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <IconPlus />
          </Button>
        </Row>
      </Section>

      <Section
        title="States"
        description="Hover, focus and active are live — interact with the buttons to see them. Disabled and loading are shown explicitly."
      >
        <Row label="Interactive" hint="Hover, tab to focus, press for the active nudge.">
          <Button>Hover / focus / press</Button>
        </Row>
        <Row label="Disabled" hint="Non-interactive; reduced opacity, no pointer events.">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
        </Row>
        <Row label="Loading" hint="Disable the button and show a spinner during async work.">
          <Button disabled>
            <IconLoader2 className="animate-spin" />
            Saving…
          </Button>
        </Row>
      </Section>

      <Section
        title="Composition"
        description="Icons compose automatically — a leading or trailing icon, or icon-only with an accessible label."
      >
        <Row label="Icon + label">
          <Button>
            <IconDownload />
            Download
          </Button>
          <Button variant="outline">
            Continue
            <IconArrowRight />
          </Button>
        </Row>
        <Row label="Icon only" hint="Always provide an aria-label for icon-only controls.">
          <Button size="icon" variant="outline" aria-label="Settings">
            <IconSettings />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Add">
            <IconPlus />
          </Button>
        </Row>
        <Row label="Destructive action">
          <Button variant="destructive">
            <IconTrash />
            Delete
          </Button>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Renders a native <Mono>&lt;button&gt;</Mono> — focusable, Enter/Space activate it.
            </>,
            "Visible focus ring via the ring token; never removed.",
            "Icon-only buttons require an aria-label (shown above).",
            <>
              Disabled buttons set <Mono>disabled</Mono> and drop pointer events; avoid disabling
              without explanation.
            </>,
            "All variants meet WCAG AA contrast in light and dark.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
