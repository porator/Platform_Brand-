"use client";

import * as React from "react";
import { PageShell, PageHeader, Section, Mono, ThemedPanel, useCssVarValues } from "./_kit";
import { COLOR_GROUPS, ALL_COLOR_VARS, type ColorToken } from "./tokens";

function TokenRow({ token, value }: { token: ColorToken; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="size-10 shrink-0 border border-border"
        style={{ background: `var(${token.cssVar})` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">{token.name}</span>
          <Mono className="shrink-0 text-muted-foreground">{token.cssVar}</Mono>
        </div>
        <div className="mt-0.5 truncate">
          <Mono className="text-xs text-muted-foreground">{value || "—"}</Mono>
        </div>
      </div>
    </div>
  );
}

function ColorPanel({ theme }: { theme: "light" | "dark" }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const values = useCssVarValues(ref, ALL_COLOR_VARS);

  return (
    <ThemedPanel theme={theme} className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-sm font-medium text-foreground">
          {theme === "light" ? "Light" : "Dark"}
        </span>
        <Mono className="text-muted-foreground">
          {theme === "light" ? ".light / :root" : ".dark"}
        </Mono>
      </div>
      <div ref={ref} className="divide-y divide-border px-5">
        {COLOR_GROUPS.map((group) => (
          <div key={group.title} className="py-4">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
              {group.title}
            </p>
            <div className="mt-1 divide-y divide-border">
              {group.tokens.map((t) => (
                <TokenRow key={t.cssVar} token={t} value={values[t.cssVar]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ThemedPanel>
  );
}

/** A worked example: real components rendered in both themes. */
function UsageRow({ theme }: { theme: "light" | "dark" }) {
  return (
    <ThemedPanel theme={theme} className="p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex h-9 items-center bg-primary px-4 text-sm font-medium text-primary-foreground">
            Primary
          </button>
          <button className="inline-flex h-9 items-center border border-input bg-background px-4 text-sm font-medium text-foreground">
            Outline
          </button>
          <button className="inline-flex h-9 items-center bg-secondary px-4 text-sm font-medium text-secondary-foreground">
            Secondary
          </button>
          <button className="inline-flex h-9 items-center border border-destructive bg-background px-4 text-sm font-medium text-destructive">
            Destructive
          </button>
        </div>
        <div className="border border-border bg-card p-4 text-card-foreground">
          <p className="text-sm font-medium">Card surface</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Muted foreground text sits on the card background.
          </p>
          <span className="mt-3 inline-flex items-center bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            secondary badge
          </span>
        </div>
      </div>
    </ThemedPanel>
  );
}

export function ColorsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Colors"
        description={
          <>
            Every color is a <strong className="text-foreground">semantic token</strong> defined
            once as a CSS custom property in <Mono>app/globals.css</Mono> and consumed through
            Tailwind utilities. Nothing is hardcoded — the values below are read live from the
            rendered DOM, so they always reflect the real <Mono>base-vega</Mono> preset.
          </>
        }
      />

      <Section
        title="Semantic tokens"
        description="The same token names resolve to different values in light and dark. Each swatch shows the token, its CSS variable and the resolved value for that theme."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ColorPanel theme="light" />
          <ColorPanel theme="dark" />
        </div>
      </Section>

      <Section
        title="Tokens in context"
        description="How the semantic relationships read when applied to real UI — actions, surfaces and text — in both themes."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UsageRow theme="light" />
          <UsageRow theme="dark" />
        </div>
      </Section>
    </PageShell>
  );
}
