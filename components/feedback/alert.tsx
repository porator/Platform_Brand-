"use client";

import * as React from "react";
import {
  IconInfoCircle,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertOctagon,
  IconX,
} from "@/lib/icons";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

const VARIANTS = [
  { variant: "default" as const, icon: IconInfoCircle, title: "Heads up", desc: "A neutral, informational message about this view." },
  { variant: "info" as const, icon: IconInfoCircle, title: "New region available", desc: "Asia Pacific is now available for production deployments." },
  { variant: "success" as const, icon: IconCircleCheck, title: "Build published", desc: "Build #124 was promoted to Production successfully." },
  { variant: "warning" as const, icon: IconAlertTriangle, title: "Approaching build limit", desc: "You've used 92% of your monthly build minutes." },
  { variant: "destructive" as const, icon: IconAlertOctagon, title: "Build failed", desc: "Build #120 failed during the test stage. Review the logs." },
];

function DismissibleAlert() {
  const [open, setOpen] = React.useState(true);
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Show alert again
      </Button>
    );
  }
  return (
    <Alert variant="info">
      <IconInfoCircle />
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription>Deployments will pause on Sunday 02:00–03:00 UTC.</AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="icon-xs" aria-label="Dismiss alert" onClick={() => setOpen(false)}>
          <IconX />
        </Button>
      </AlertAction>
    </Alert>
  );
}

export function AlertPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Alert"
        description={
          <>
            A persistent, inline message that stays in the layout — built on the shadcn{" "}
            <Mono>Alert</Mono>. Use it for contextual information tied to a view. For transient
            confirmations, use a <Mono>Toast</Mono> instead.
          </>
        }
      />

      <Section title="Basic usage" description="An icon, a title and a description.">
        <Alert className="max-w-xl">
          <IconInfoCircle />
          <AlertTitle>This environment is read-only</AlertTitle>
          <AlertDescription>
            Production is locked during an active rollout. Changes will be available once it
            completes.
          </AlertDescription>
        </Alert>
      </Section>

      <Section
        title="Variants"
        description="Default plus semantic variants (info, success, warning, destructive) using the status tokens — reinforced with an icon, never color alone."
      >
        <div className="flex max-w-xl flex-col gap-3">
          {VARIANTS.map((v) => (
            <Alert key={v.variant} variant={v.variant}>
              <v.icon />
              <AlertTitle>{v.title}</AlertTitle>
              <AlertDescription>{v.desc}</AlertDescription>
            </Alert>
          ))}
        </div>
      </Section>

      <Section title="Dismissible" description="An alert the user can close via an action in the corner.">
        <div className="max-w-xl">
          <DismissibleAlert />
        </div>
      </Section>

      <Section
        title="With an action"
        description="Alerts can carry an inline action or link within the description."
      >
        <Alert variant="warning" className="max-w-xl">
          <IconAlertTriangle />
          <AlertTitle>Payment method expiring</AlertTitle>
          <AlertDescription>
            Your card ending 6411 expires next month.{" "}
            <a href="#billing">Update billing</a> to avoid interruption.
          </AlertDescription>
        </Alert>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Exposes <Mono>role=&quot;alert&quot;</Mono> so the message is announced when it
              appears.
            </>,
            "Status is carried by an icon and title text, not color alone.",
            "The dismiss control is a labelled button, reachable by keyboard.",
            "All variants meet WCAG AA contrast in light and dark.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
