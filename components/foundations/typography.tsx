"use client";

import * as React from "react";
import { PageShell, PageHeader, Section, Mono, MetaLabel, useTextMetrics } from "./_kit";
import { TYPE_SCALE, type TypeRole } from "./tokens";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <MetaLabel>{label}</MetaLabel>
      <Mono className="text-foreground">{value}</Mono>
    </div>
  );
}

function Specimen({ role }: { role: TypeRole }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const m = useTextMetrics(ref);

  return (
    <div className="border-t border-border py-7 first:border-t-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-foreground">{role.name}</span>
        <Mono className="text-muted-foreground">{role.utility}</Mono>
      </div>
      <p ref={ref} className={`mt-3 text-foreground ${role.utility}`}>
        {role.sample}
      </p>
      <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
        <Metric label="Size" value={m?.fontSize ?? "—"} />
        <Metric label="Weight" value={m?.fontWeight ?? "—"} />
        <Metric label="Line height" value={m?.lineHeight ?? "—"} />
        <Metric label="Letter spacing" value={m?.letterSpacing ?? "—"} />
      </div>
    </div>
  );
}

function FontCard({
  name,
  role,
  cssVar,
  className,
}: {
  name: string;
  role: string;
  cssVar: string;
  className: string;
}) {
  return (
    <div className="border border-border bg-card p-6 text-card-foreground">
      <div className={`text-6xl leading-none text-foreground ${className}`}>Aa</div>
      <div className="mt-6 flex items-baseline justify-between gap-3">
        <span className="text-base font-medium">{name}</span>
        <Mono className="text-muted-foreground">{cssVar}</Mono>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{role}</p>
      <p className={`mt-4 text-sm text-foreground ${className}`}>
        The quick brown fox jumps over the lazy dog
      </p>
      <p className={`mt-1 text-sm tabular-nums text-muted-foreground ${className}`}>
        0123456789 — &amp; @ # % ( )
      </p>
    </div>
  );
}

export function TypographyPage() {
  return (
    <PageShell>
      <PageHeader
        title="Typography"
        description={
          <>
            Three typefaces carry the system: <strong className="text-foreground">Manrope</strong> for
            all UI and headings, and <strong className="text-foreground">Geist Mono</strong> for code, and <strong className="text-foreground">Gellix</strong> for onboarding and Create project
            and numeric data. The scale maps named roles to Tailwind utilities; every metric below is
            measured live from the rendered text.
          </>
        }
      />

      <Section
        title="Font families"
        description="Loaded from the design system's fonts.css (the Storybook source) and exposed as CSS variables."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FontCard name="Manrope" role="Sans — UI & headings" cssVar="--font-sans" className="font-sans" />
          <FontCard name="Geist Mono" role="Mono — code & data" cssVar="--font-mono" className="font-mono" />
          <FontCard name="Gellix" role="Brand — onboarding & Create project" cssVar="--font-brand" className="font-brand" />
        </div>
      </Section>

      <Section
        title="Type scale"
        description="From Display down to Caption. Sizes, weights and spacing come straight from the project's Tailwind configuration — nothing is invented."
      >
        <div>
          {TYPE_SCALE.map((role) => (
            <Specimen key={role.name} role={role} />
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
