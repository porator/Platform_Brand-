"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

export function RadioPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Radio"
        description={
          <>
            A control for choosing one option from a set. Built on the shadcn <Mono>RadioGroup</Mono>{" "}
            (Base UI). Always use radios in a labelled group — never a single radio.
          </>
        }
      />

      <Section title="Basic usage" description="A radio group with one option selected by default.">
        <RadioGroup defaultValue="comfortable" className="max-w-xs">
          {[
            ["compact", "Compact"],
            ["comfortable", "Comfortable"],
            ["spacious", "Spacious"],
          ].map(([value, label]) => (
            <Label key={value} htmlFor={`d-${value}`}>
              <RadioGroupItem id={`d-${value}`} value={value} />
              {label}
            </Label>
          ))}
        </RadioGroup>
      </Section>

      <Section
        title="States"
        description="The control's states. Focus is live — tab into a group to see the ring."
      >
        <Row label="All states" className="gap-8">
          <StateCell caption="Default">
            <RadioGroup>
              <RadioGroupItem value="a" aria-label="Default" />
            </RadioGroup>
          </StateCell>
          <StateCell caption="Selected">
            <RadioGroup defaultValue="a">
              <RadioGroupItem value="a" aria-label="Selected" />
            </RadioGroup>
          </StateCell>
          <StateCell caption="Disabled">
            <RadioGroup>
              <RadioGroupItem value="a" aria-label="Disabled" disabled />
            </RadioGroup>
          </StateCell>
          <StateCell caption="Disabled + selected">
            <RadioGroup defaultValue="a">
              <RadioGroupItem value="a" aria-label="Disabled selected" disabled />
            </RadioGroup>
          </StateCell>
          <StateCell caption="Error">
            <RadioGroup>
              <RadioGroupItem value="a" aria-label="Error" aria-invalid />
            </RadioGroup>
          </StateCell>
        </Row>
      </Section>

      <Section
        title="With labels & descriptions"
        description="Give each option a label and, where helpful, a supporting description."
      >
        <RadioGroup defaultValue="prod" className="max-w-md gap-4">
          {[
            ["prod", "Production", "Live environment serving real users."],
            ["staging", "Staging", "Pre-release environment for final checks."],
            ["dev", "Development", "Sandbox for in-progress work."],
          ].map(([value, label, desc]) => (
            <div key={value} className="flex items-start gap-3">
              <RadioGroupItem id={`e-${value}`} value={value} className="mt-0.5" />
              <div className="grid gap-1">
                <Label htmlFor={`e-${value}`}>{label}</Label>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Arrow keys move between options; the group is a single tab stop (roving focus).",
            "Each option has a clickable label associated by id.",
            "Visible focus ring via the ring token.",
            <>
              Group-level errors use <Mono>aria-invalid</Mono>; keep an error message nearby.
            </>,
          ]}
        />
      </Section>
    </PageShell>
  );
}
