"use client";

import * as React from "react";
import {
  IconSearch,
  IconMail,
  IconCurrencyDollar,
  IconEye,
  IconEyeOff,
} from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "./_kit";

function PasswordInput() {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative w-full max-w-sm">
      <Input
        type={show ? "text" : "password"}
        defaultValue="correct-horse"
        aria-label="Password"
        className="pr-9"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  );
}

export function InputPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Input"
        description={
          <>
            A single-line text field — the canonical input primitive. It is the shadcn{" "}
            <Mono>Input</Mono> (Base UI). Labels, help text and validation messaging are composed by{" "}
            <Mono>Form Field</Mono> (Phase 4); here we document the control itself.
          </>
        }
      />

      <Section title="Basic usage">
        <Row label="Default" className="max-w-sm">
          <Input aria-label="Project name" placeholder="Project name" />
        </Row>
      </Section>

      <Section
        title="States"
        description="Focus is live — click or tab into a field. The rest are shown explicitly."
      >
        <Row label="Placeholder" className="max-w-sm">
          <Input aria-label="Placeholder" placeholder="e.g. new-gen-wire" />
        </Row>
        <Row label="Value" className="max-w-sm">
          <Input aria-label="Value" defaultValue="new-gen-wire" />
        </Row>
        <Row label="Disabled" className="max-w-sm">
          <Input aria-label="Disabled" defaultValue="Locked" disabled />
        </Row>
        <Row label="Read-only" hint="Value is visible and selectable but not editable." className="max-w-sm">
          <Input aria-label="Read-only" defaultValue="org_8f3a21" readOnly />
        </Row>
        <Row label="Error" hint="Set aria-invalid; pair with a message in Form Field." className="max-w-sm">
          <Input aria-label="Error" defaultValue="not-an-email" aria-invalid />
        </Row>
      </Section>

      <Section
        title="Prefix & suffix"
        description="Adornments are composed around the Input with a relative wrapper and padding."
      >
        <Row label="Prefix icon" className="max-w-sm">
          <div className="relative w-full">
            <IconSearch
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input aria-label="Search" placeholder="Search projects…" className="pl-8" />
          </div>
        </Row>
        <Row label="Suffix icon" className="max-w-sm">
          <div className="relative w-full">
            <Input aria-label="Email" type="email" placeholder="you@company.com" className="pr-8" />
            <IconMail
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </Row>
        <Row label="Prefix text" hint="A currency adornment for numeric amounts." className="max-w-sm">
          <div className="relative w-full">
            <IconCurrencyDollar
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              className="pl-8"
            />
          </div>
        </Row>
      </Section>

      <Section
        title="Types"
        description="The native type drives the keyboard and validation. Password toggles visibility."
      >
        <Row label="Password" className="max-w-sm">
          <PasswordInput />
        </Row>
        <Row label="Numeric" className="max-w-sm">
          <Input aria-label="Quantity" type="number" inputMode="numeric" placeholder="0" />
        </Row>
        <Row label="Email" className="max-w-sm">
          <Input aria-label="Email address" type="email" placeholder="you@company.com" />
        </Row>
        <Row label="URL" className="max-w-sm">
          <Input aria-label="Repository URL" type="url" placeholder="https://github.com/…" />
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Every input needs an accessible name — a visible <Mono>&lt;label&gt;</Mono> (Form
              Field) or an <Mono>aria-label</Mono>.
            </>,
            "Visible focus ring via the ring token; disabled and read-only are distinct states.",
            <>
              Errors set <Mono>aria-invalid</Mono> and should reference a message via{" "}
              <Mono>aria-describedby</Mono>.
            </>,
            "Use the correct type/inputMode so mobile keyboards and validation match the data.",
            "The password visibility toggle is a labelled button, operable by keyboard.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
