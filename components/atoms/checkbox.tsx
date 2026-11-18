"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageShell, PageHeader, Section, Mono, MetaLabel, Row, A11yList } from "./_kit";

function StateCell({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {children}
      <MetaLabel>{caption}</MetaLabel>
    </div>
  );
}

export function CheckboxPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Checkbox"
        description={
          <>
            A control for a boolean or multi-select choice. Built on the shadcn <Mono>Checkbox</Mono>{" "}
            (Base UI), with checked, indeterminate and error states.
          </>
        }
      />

      <Section title="Basic usage" description="A checkbox paired with a clickable label.">
        <Row label="Default">
          <Label htmlFor="cb-basic">
            <Checkbox id="cb-basic" defaultChecked />
            Enable notifications
          </Label>
        </Row>
      </Section>

      <Section
        title="States"
        description="Every state the control can take. Focus is live — tab to a checkbox to see the ring."
      >
        <Row label="All states" className="gap-8">
          <StateCell caption="Unchecked">
            <Checkbox aria-label="Unchecked" />
          </StateCell>
          <StateCell caption="Checked">
            <Checkbox aria-label="Checked" defaultChecked />
          </StateCell>
          <StateCell caption="Indeterminate">
            <Checkbox aria-label="Indeterminate" indeterminate />
          </StateCell>
          <StateCell caption="Disabled">
            <Checkbox aria-label="Disabled" disabled />
          </StateCell>
          <StateCell caption="Disabled + checked">
            <Checkbox aria-label="Disabled checked" disabled defaultChecked />
          </StateCell>
          <StateCell caption="Error">
            <Checkbox aria-label="Error" aria-invalid />
          </StateCell>
        </Row>
      </Section>

      <Section
        title="With label & description"
        description="Associate a label with the control; add a description for extra context."
      >
        <Row label="Labelled" align="start" className="flex-col gap-6">
          <div className="flex items-start gap-3">
            <Checkbox id="cb-terms" defaultChecked className="mt-0.5" />
            <div className="grid gap-1">
              <Label htmlFor="cb-terms">Accept terms and conditions</Label>
              <p className="text-sm text-muted-foreground">
                You agree to our processing of your project data.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="cb-err" aria-invalid aria-describedby="cb-err-msg" className="mt-0.5" />
            <div className="grid gap-1">
              <Label htmlFor="cb-err">Required consent</Label>
              <p id="cb-err-msg" className="text-sm text-destructive">
                This field is required.
              </p>
            </div>
          </div>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Keyboard operable — Space toggles; the label is part of the click target.",
            "Visible focus ring via the ring token.",
            <>
              Indeterminate is exposed to assistive tech (not merely a visual dash).
            </>,
            <>
              Errors use <Mono>aria-invalid</Mono> and reference the message with{" "}
              <Mono>aria-describedby</Mono>.
            </>,
          ]}
        />
      </Section>
    </PageShell>
  );
}
