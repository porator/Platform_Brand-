"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
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

export function SwitchPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Switch"
        description={
          <>
            Toggles a single setting on or off, taking effect immediately. Built on the shadcn{" "}
            <Mono>Switch</Mono> (Base UI). Use it for instant settings; use a checkbox for choices
            that are submitted with a form.
          </>
        }
      />

      <Section title="Basic usage" description="A switch with a clickable label.">
        <Row label="Default">
          <Label htmlFor="sw-basic">
            <Switch id="sw-basic" defaultChecked />
            Auto-deploy on merge
          </Label>
        </Row>
      </Section>

      <Section title="States" description="Focus is live — tab to a switch to see the ring.">
        <Row label="All states" className="gap-8">
          <StateCell caption="Off">
            <Switch aria-label="Off" />
          </StateCell>
          <StateCell caption="On">
            <Switch aria-label="On" defaultChecked />
          </StateCell>
          <StateCell caption="Disabled">
            <Switch aria-label="Disabled" disabled />
          </StateCell>
          <StateCell caption="Disabled + on">
            <Switch aria-label="Disabled on" disabled defaultChecked />
          </StateCell>
        </Row>
      </Section>

      <Section title="Sizes" description="Default and a compact small size for dense rows.">
        <Row label="Scale">
          <Switch size="sm" defaultChecked aria-label="Small" />
          <Switch size="default" defaultChecked aria-label="Default" />
        </Row>
      </Section>

      <Section
        title="With label & description"
        description="A common settings-row pattern: label and description on the left, switch on the right."
      >
        <Row label="Settings row" className="w-full max-w-md">
          <div className="flex w-full items-start justify-between gap-6">
            <div className="grid gap-1">
              <Label htmlFor="sw-desc">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive an email when a build finishes.
              </p>
            </div>
            <Switch id="sw-desc" defaultChecked className="mt-0.5" />
          </div>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Exposes <Mono>role=&quot;switch&quot;</Mono> with its on/off state.
            </>,
            "Keyboard operable — Space/Enter toggles; the label is part of the target.",
            "Visible focus ring via the ring token.",
            "Reserve switches for changes that apply instantly, without a submit step.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
