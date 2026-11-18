"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

type Opt = { value: string; label: string };
const itemsOf = (opts: Opt[]) => Object.fromEntries(opts.map((o) => [o.value, o.label]));

const ENVS: Opt[] = [
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "development", label: "Development" },
];
const REGIONS: Opt[] = [
  { value: "us", label: "US East" },
  { value: "eu", label: "EU West" },
  { value: "ap", label: "Asia Pacific" },
];
const REPOS: Opt[] = [
  { value: "a", label: "appcharge/new-gen-wire-design-system-navigation" },
  { value: "b", label: "appcharge/platform-web-dashboard-frontend" },
  { value: "c", label: "appcharge/infrastructure-terraform-modules" },
];
const TARGETS = {
  "prod-us": "Production · US East",
  "prod-eu": "Production · EU West",
  "stg-us": "Staging · US East",
  "stg-eu": "Staging · EU West (unavailable)",
};

export function SelectPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Form & Controls"
        title="Select"
        description={
          <>
            A control for picking one option from a list in a popover. It is the shadcn{" "}
            <Mono>Select</Mono> (Base UI) — keyboard-navigable, with grouped and disabled options.
            For a searchable list, use <Mono>Combobox</Mono> instead.
          </>
        }
      />

      <Section title="Basic example" description="A labelled select with a placeholder.">
        <Field className="max-w-xs">
          <FieldLabel htmlFor="sel-env">Environment</FieldLabel>
          <Select items={itemsOf(ENVS)} defaultValue="production">
            <SelectTrigger id="sel-env" className="w-full">
              <SelectValue placeholder="Select an environment" />
            </SelectTrigger>
            <SelectContent>
              {ENVS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>Where this build will be deployed.</FieldDescription>
        </Field>
      </Section>

      <Section title="States" description="Open is live — click a trigger. The others are shown explicitly.">
        <div className="flex flex-col gap-6">
          <Row label="Placeholder" className="max-w-xs">
            <Select items={itemsOf(REGIONS)}>
              <SelectTrigger aria-label="Region" className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Selected" className="max-w-xs">
            <Select items={itemsOf(REGIONS)} defaultValue="eu">
              <SelectTrigger aria-label="Region selected" className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Disabled" className="max-w-xs">
            <Select items={itemsOf(REGIONS)} defaultValue="us" disabled>
              <SelectTrigger aria-label="Region disabled" className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Error" className="max-w-xs">
            <Select items={itemsOf(REGIONS)}>
              <SelectTrigger aria-label="Region error" aria-invalid className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </div>
      </Section>

      <Section
        title="Grouped & disabled options"
        description="Group related options under labels; disable options that aren't available."
      >
        <Field className="max-w-xs">
          <FieldLabel htmlFor="sel-grp">Deploy target</FieldLabel>
          <Select items={TARGETS} defaultValue="prod-us">
            <SelectTrigger id="sel-grp" className="w-full">
              <SelectValue placeholder="Select a target" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Production</SelectLabel>
                <SelectItem value="prod-us">Production · US East</SelectItem>
                <SelectItem value="prod-eu">Production · EU West</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Staging</SelectLabel>
                <SelectItem value="stg-us">Staging · US East</SelectItem>
                <SelectItem value="stg-eu" disabled>
                  Staging · EU West (unavailable)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section
        title="Long labels"
        description="The popup matches the trigger width and truncates long values cleanly."
      >
        <Field className="max-w-xs">
          <FieldLabel htmlFor="sel-long">Repository</FieldLabel>
          <Select items={itemsOf(REPOS)} defaultValue="a">
            <SelectTrigger id="sel-long" className="w-full">
              <SelectValue placeholder="Select a repository" />
            </SelectTrigger>
            <SelectContent>
              {REPOS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Full keyboard support — open with Enter/Space/Arrows, type-ahead, Esc to close.",
            "The trigger is labelled by a <label> or aria-label and exposes the selected value.",
            "Grouped options use group labels; disabled options are skipped by the keyboard.",
            "Focus returns to the trigger on close; the popup never overflows the viewport.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
