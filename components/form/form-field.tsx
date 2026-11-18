"use client";

import * as React from "react";
import { IconCircleCheck } from "@/lib/icons";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

export function FormFieldPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Form & Controls"
        title="Form Field"
        description={
          <>
            The canonical wrapper every form control uses: <strong className="text-foreground">label
            · control · description · validation</strong>. Built on the shadcn <Mono>Field</Mono>{" "}
            system, it gives any control — Input, Select, Checkbox, Radio, Switch — a consistent
            structure and accessible wiring.
          </>
        }
      />

      <Section title="Basic example" description="Label, control and a description, stacked.">
        <Field className="max-w-sm">
          <FieldLabel htmlFor="ff-name">Project name</FieldLabel>
          <Input id="ff-name" defaultValue="New Gen Wire" />
          <FieldDescription>Shown across the dashboard.</FieldDescription>
        </Field>
      </Section>

      <Section
        title="Required, optional & helper text"
        description="Mark requirement explicitly; helper text sits beneath the control."
      >
        <FieldGroup className="max-w-sm">
          <Field>
            <FieldLabel htmlFor="ff-slug">
              Slug{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </FieldLabel>
            <Input id="ff-slug" defaultValue="new-gen-wire" required />
            <FieldDescription>Used in URLs — lowercase, dashes only.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="ff-desc">
              Description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input id="ff-desc" placeholder="A short summary" />
          </Field>
        </FieldGroup>
      </Section>

      <Section title="Validation states" description="Error, success and disabled.">
        <FieldGroup className="max-w-sm">
          <Field data-invalid>
            <FieldLabel htmlFor="ff-err">Email</FieldLabel>
            <Input id="ff-err" type="email" defaultValue="not-an-email" aria-invalid aria-describedby="ff-err-msg" />
            <FieldError id="ff-err-msg">Enter a valid email address.</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="ff-ok">Email</FieldLabel>
            <Input id="ff-ok" type="email" defaultValue="pat@appcharge.com" aria-describedby="ff-ok-msg" />
            <p id="ff-ok-msg" className="flex items-center gap-1.5 text-sm text-success">
              <IconCircleCheck className="size-4" aria-hidden />
              Address verified.
            </p>
          </Field>
          <Field data-disabled>
            <FieldLabel htmlFor="ff-dis">Organisation</FieldLabel>
            <Input id="ff-dis" defaultValue="Appcharge" disabled />
            <FieldDescription>Managed by your administrator.</FieldDescription>
          </Field>
        </FieldGroup>
      </Section>

      <Section
        title="Across every control"
        description="The same pattern wraps each control type — vertical for inputs, horizontal for toggles."
      >
        <FieldGroup className="max-w-md">
          {/* Select */}
          <Field>
            <FieldLabel htmlFor="ff-env">Environment</FieldLabel>
            <Select
              items={{ production: "Production", staging: "Staging", development: "Development" }}
              defaultValue="production"
            >
              <SelectTrigger id="ff-env" className="w-full">
                <SelectValue placeholder="Select an environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>Target for this deployment.</FieldDescription>
          </Field>

          {/* Checkbox */}
          <Field orientation="horizontal">
            <Checkbox id="ff-notify" defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor="ff-notify" className="font-normal">
                Email me on failed builds
              </FieldLabel>
              <FieldDescription>Only failures, never successes.</FieldDescription>
            </FieldContent>
          </Field>

          {/* Radio group in a fieldset */}
          <FieldSet>
            <FieldLegend variant="label">Visibility</FieldLegend>
            <FieldDescription>Who can see this project.</FieldDescription>
            <RadioGroup defaultValue="team" className="mt-1">
              {[
                ["team", "Team", "Everyone in the workspace."],
                ["private", "Private", "Only you and invited members."],
              ].map(([value, label, desc]) => (
                <Field key={value} orientation="horizontal">
                  <RadioGroupItem id={`ff-v-${value}`} value={value} />
                  <FieldContent>
                    <FieldLabel htmlFor={`ff-v-${value}`} className="font-normal">
                      {label}
                    </FieldLabel>
                    <FieldDescription>{desc}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </RadioGroup>
          </FieldSet>

          {/* Switch */}
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="ff-2fa">Require 2-factor auth</FieldLabel>
              <FieldDescription>Members must verify a code at sign-in.</FieldDescription>
            </FieldContent>
            <Switch id="ff-2fa" defaultChecked />
          </Field>
        </FieldGroup>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Every control is associated with its label via <Mono>htmlFor</Mono>/<Mono>id</Mono>.
            </>,
            <>
              Descriptions and errors are linked with <Mono>aria-describedby</Mono>; the error
              renders in <Mono>role=&quot;alert&quot;</Mono> so changes are announced.
            </>,
            <>
              Invalid state propagates from <Mono>data-invalid</Mono> on the field, tinting the label
              and message with the destructive token.
            </>,
            "Grouped choices use a fieldset and legend; toggles use a horizontal field with the control as the hit target.",
            "Requirement is stated in text, not conveyed by color alone.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
