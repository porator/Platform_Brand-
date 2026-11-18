"use client";

import * as React from "react";
import { IconX, IconTag, IconDeviceMobile } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function Tag({
  children,
  icon,
  onRemove,
  onClick,
  selected,
  disabled,
  className,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
    selected
      ? "border-primary bg-primary/10 text-foreground"
      : "border-border bg-background text-muted-foreground",
    disabled && "pointer-events-none text-muted-foreground line-through",
    className,
  );

  // Selectable (filter) tag — the whole chip is a button.
  if (onClick && !onRemove) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(classes, "cursor-pointer outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50", selected && "hover:bg-primary/15")}
      >
        {icon}
        {children}
      </button>
    );
  }

  // Static or removable tag.
  return (
    <span className={classes}>
      {icon}
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${typeof children === "string" ? children : "tag"}`}
          className="-mr-0.5 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <IconX className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

function RemovableTags() {
  const [tags, setTags] = React.useState(["mobile", "ios", "beta", "internal"]);
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Tag key={t} onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}>
          {t}
        </Tag>
      ))}
      {tags.length === 0 ? <span className="text-sm text-muted-foreground">All tags removed.</span> : null}
    </div>
  );
}

function FilterTags() {
  const [active, setActive] = React.useState<Set<string>>(new Set(["Production"]));
  const toggle = (t: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  return (
    <div className="flex flex-wrap gap-2">
      {["Production", "Staging", "Development"].map((t) => (
        <Tag key={t} onClick={() => toggle(t)} selected={active.has(t)}>
          {t}
        </Tag>
      ))}
    </div>
  );
}

export function TagPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Data Display"
        title="Tag"
        description={
          <>
            A chip for <strong className="text-foreground">classification, categorization and
            filtering</strong>. Unlike a Badge — which signals a short semantic <em>status</em> — a
            Tag is user-oriented metadata you can add, remove and filter by.
          </>
        }
      />

      <Section
        title="Badge vs Tag"
        description="They look similar but mean different things. Pick by intent."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-5">
            <div className="flex items-center gap-2">
              <Badge variant="success">Ready</Badge>
              <Badge variant="info">Building</Badge>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">Badge — status</p>
            <p className="text-sm text-muted-foreground">System-owned semantic state. Not interactive.</p>
          </div>
          <div className="rounded-md border border-border p-5">
            <div className="flex items-center gap-2">
              <Tag icon={<IconTag className="size-3" />}>mobile</Tag>
              <Tag>beta</Tag>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">Tag — classification</p>
            <p className="text-sm text-muted-foreground">User-owned labels for grouping and filtering.</p>
          </div>
        </div>
      </Section>

      <Section title="Variants & states" description="Default, with icon, selected, disabled.">
        <Row label="Variants">
          <Tag>default</Tag>
          <Tag icon={<IconDeviceMobile className="size-3" />}>ios</Tag>
          <Tag selected>selected</Tag>
          <Tag disabled>disabled</Tag>
        </Row>
      </Section>

      <Section title="Removable" description="Tags applied to a record can be removed. Each has a labelled remove control.">
        <RemovableTags />
      </Section>

      <Section
        title="Filtering"
        description="As filter chips, tags toggle a selection. Selected uses the primary token at low opacity — no new colors."
      >
        <FilterTags />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Filter tags are toggle buttons with <Mono>aria-pressed</Mono>; selected state is
              reinforced by the fill, not color alone.
            </>,
            "Each removable tag has a labelled remove button, reachable by keyboard.",
            "Disabled tags are non-interactive; static tags add no focus stops.",
            "Selected styling uses the primary token at low opacity — AA-legible in both themes.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
