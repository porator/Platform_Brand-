"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

function toArray(v: number | readonly number[]): number[] {
  return Array.isArray(v) ? [...v] : [v as number];
}

function SliderField({
  label,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  formatValue,
  description,
  disabled,
  ariaLabel,
}: {
  label?: string;
  defaultValue: number[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  formatValue?: (v: number[]) => string;
  description?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [value, setValue] = React.useState<number[]>(defaultValue);
  const display = formatValue
    ? formatValue(value)
    : value.map((v) => `${v}${unit}`).join(" – ");

  return (
    <Field className="max-w-sm">
      {label ? (
        <div className="flex items-center justify-between">
          <FieldLabel>{label}</FieldLabel>
          <Mono className="text-foreground tabular-nums">{display}</Mono>
        </div>
      ) : null}
      <Slider
        aria-label={ariaLabel ?? label}
        value={value}
        onValueChange={(v) => setValue(toArray(v))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="mt-1"
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

export function SliderPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Form & Controls"
        title="Slider"
        description={
          <>
            Selects a numeric value or range by dragging along a track — the shadcn{" "}
            <Mono>Slider</Mono> (Base UI). Pair it with a live value readout so the current setting is
            always legible.
          </>
        }
      />

      <Section title="Basic example" description="A single value with a live readout and unit.">
        <SliderField
          label="Build timeout"
          defaultValue={[45]}
          min={0}
          max={120}
          step={5}
          unit=" min"
          description="Builds exceeding this limit are cancelled automatically."
        />
      </Section>

      <Section title="States" description="Default, bounds and disabled.">
        <div className="flex flex-col gap-8">
          <Row label="Default" className="max-w-sm">
            <SliderField label="Concurrency" defaultValue={[8]} min={1} max={32} />
          </Row>
          <Row label="Minimum" className="max-w-sm">
            <SliderField label="Concurrency" defaultValue={[1]} min={1} max={32} />
          </Row>
          <Row label="Maximum" className="max-w-sm">
            <SliderField label="Concurrency" defaultValue={[32]} min={1} max={32} />
          </Row>
          <Row label="Disabled" className="max-w-sm">
            <SliderField label="Concurrency" defaultValue={[8]} min={1} max={32} disabled />
          </Row>
        </div>
      </Section>

      <Section
        title="Range"
        description="Two thumbs select a lower and upper bound — e.g. a memory allocation window."
      >
        <SliderField
          label="Memory allocation"
          defaultValue={[4, 16]}
          min={0}
          max={32}
          step={1}
          unit=" GB"
          ariaLabel="Memory allocation range"
          description="Autoscaling stays within this range."
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Each thumb is a slider role with min, max and current value exposed to assistive tech.",
            "Keyboard operable — Arrows adjust by step, Home/End jump to the bounds.",
            "Visible focus ring on the active thumb; disabled sliders are non-interactive.",
            "A text readout accompanies the track so the value never relies on position alone.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
