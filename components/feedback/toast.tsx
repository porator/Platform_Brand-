"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function ToastPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Toast"
        description={
          <>
            A brief, transient confirmation that a background action happened — powered by{" "}
            <Mono>sonner</Mono>. Toasts stack in a corner, auto-dismiss, and never block the UI. Use
            them for outcomes, not for information a user must act on.
          </>
        }
      />

      <Section title="Basic usage" description="A simple message, optionally with a description.">
        <Row label="Trigger">
          <Button onClick={() => toast("Build queued", { description: "Build #125 · Production" })}>
            Show toast
          </Button>
        </Row>
      </Section>

      <Section
        title="Status variants"
        description="Success, error, info, warning and loading — each with a matching icon."
      >
        <Row label="Status" className="gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Build published", { description: "Build #124 is live in Production." })}>
            Success
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.error("Build failed", { description: "Build #120 failed at the test stage." })}>
            Error
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("New region available", { description: "Asia Pacific is now deployable." })}>
            Info
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.warning("Approaching build limit", { description: "92% of monthly minutes used." })}>
            Warning
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.loading("Deploying…", { description: "Rolling out to Production." })}>
            Loading
          </Button>
        </Row>
      </Section>

      <Section
        title="With an action"
        description="A toast can offer a single follow-up action, e.g. undo or view."
      >
        <Row label="Action">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast("Release archived", {
                description: "Release v2.3.9 moved to archive.",
                action: { label: "Undo", onClick: () => toast.success("Restored") },
              })
            }
          >
            Archive with undo
          </Button>
        </Row>
      </Section>

      <Section
        title="Promise"
        description="Bind a toast to an async task — it shows loading, then resolves to success or error."
      >
        <Row label="Async">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1600)), {
                loading: "Promoting build…",
                success: "Build promoted to Production",
                error: "Promotion failed",
              })
            }
          >
            Run async task
          </Button>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Toasts render in an <Mono>aria-live</Mono> region, so they are announced without
              stealing focus.
            </>,
            "Status is conveyed by an icon and message text, not color alone.",
            "Actions inside a toast are real buttons, reachable by keyboard.",
            "Reserve toasts for transient outcomes — never for critical information or required actions.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
