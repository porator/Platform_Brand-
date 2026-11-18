"use client";

import * as React from "react";
import {
  IconSearch,
  IconSitemap,
  IconBell,
  IconTrash,
  IconArrowRight,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/foundations/icons";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "./_kit";

export function IconPage() {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ICONS.filter((e) => e.name.toLowerCase().includes(q)) : ICONS;
  }, [query]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Icon"
        description={
          <>
            A single icon system — <strong className="text-foreground">Phosphor Icons</strong> via{" "}
            <Mono>@/lib/icons</Mono> (from <Mono>@phosphor-icons/react</Mono>). Icons inherit{" "}
            <Mono>currentColor</Mono>, so they take their color from the surrounding text. See{" "}
            <Mono>Foundations → Icons</Mono> for the full reference; this page covers usage.
          </>
        }
      />

      <Section title="Basic usage" description="An icon renders at the current text size and color.">
        <Row label="Default">
          <IconSitemap className="text-foreground" />
        </Row>
      </Section>

      <Section title="Sizes" description="Set an explicit size via the size prop (px). 16–24px covers most UI.">
        <Row label="Scale">
          {[16, 20, 24, 32].map((s) => (
            <span key={s} className="flex items-center gap-2">
              <IconSitemap size={s} className="text-foreground" />
              <Mono className="text-muted-foreground">{s}</Mono>
            </span>
          ))}
        </Row>
      </Section>

      <Section
        title="Color inheritance"
        description="Icons use currentColor — no need to set their color directly. Color the text/container instead."
      >
        <Row label="currentColor">
          <IconBell className="text-foreground" />
          <IconBell className="text-muted-foreground" />
          <IconBell className="text-primary" />
          <IconBell className="text-destructive" />
          <IconBell className="text-success" />
        </Row>
      </Section>

      <Section
        title="Composition"
        description="Pair icons with text, or use icon-only inside an accessible control."
      >
        <Row label="Icon + text">
          <span className="inline-flex items-center gap-2 text-sm text-foreground">
            <IconArrowRight size={16} />
            Continue to builds
          </span>
        </Row>
        <Row label="In a control" hint="Decorative icon inside a labelled button.">
          <Button variant="outline">
            <IconTrash />
            Delete
          </Button>
          <Button size="icon" variant="outline" aria-label="Search">
            <IconSearch />
          </Button>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Decorative icons (next to a text label) should be hidden from assistive tech with{" "}
              <Mono>aria-hidden</Mono>.
            </>,
            <>
              Icon-only controls must carry an accessible name via <Mono>aria-label</Mono> on the
              control.
            </>,
            "Never use color alone to convey meaning — pair with text or shape.",
            "Keep interactive icon targets at least 24×24px (use the icon button size).",
          ]}
        />
      </Section>

      <Section title="Gallery" description={`${ICONS.length} curated icons — filter by name.`}>
        <div className="relative mb-5 max-w-sm">
          <IconSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            aria-label="Search icons"
            className="h-9 w-full border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No icons match <Mono>{query}</Mono>.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4 lg:grid-cols-6">
            {filtered.map(({ name, Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2.5 bg-background px-2 py-5 text-center"
              >
                <Icon size={22} className="text-foreground" />
                <span className="w-full truncate text-xs text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  );
}
