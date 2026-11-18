"use client";

import * as React from "react";
import {
  IconFolders,
  IconSearch,
  IconFilter,
  IconAlertTriangle,
  IconRefresh,
  IconPlus,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tone = "default",
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  tone?: "default" | "destructive";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {primaryAction || secondaryAction ? (
        <div className="mt-2 flex items-center gap-2">
          {secondaryAction}
          {primaryAction}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyStatePage() {
  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Data Display"
        title="Empty State"
        description={
          <>
            Fills the space where data would be — with a reason and a way forward. A good empty state
            is never a dead end: it explains why there is nothing here and offers the next action.
          </>
        }
      />

      <Section
        title="First-time setup (no data)"
        description="The most common case — nothing exists yet, so the primary action is to create."
      >
        <EmptyState
          icon={<IconFolders className="size-5" />}
          title="No projects yet"
          description="Create your first project to start managing your environments and releases."
          primaryAction={
            <Button>
              <IconPlus /> Create project
            </Button>
          }
          secondaryAction={<Button variant="outline">Import</Button>}
        />
      </Section>

      <Section title="No search results" description="A query returned nothing — suggest adjusting it.">
        <EmptyState
          icon={<IconSearch className="size-5" />}
          title="No results for “v3.0”"
          description="No builds match your search. Check the spelling or try a different version."
          primaryAction={<Button variant="outline">Clear search</Button>}
        />
      </Section>

      <Section title="Filtered results" description="Active filters hide everything — offer to reset them.">
        <EmptyState
          icon={<IconFilter className="size-5" />}
          title="No builds match these filters"
          description="Try widening the environment or status filters to see more builds."
          primaryAction={<Button variant="outline">Reset filters</Button>}
        />
      </Section>

      <Section title="Error / retry" description="Something failed to load — explain and let the user retry.">
        <EmptyState
          tone="destructive"
          icon={<IconAlertTriangle className="size-5" />}
          title="Couldn’t load builds"
          description="There was a problem reaching the build service. Check your connection and try again."
          primaryAction={
            <Button>
              <IconRefresh /> Retry
            </Button>
          }
          secondaryAction={<Button variant="ghost">Contact support</Button>}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The title is a real heading (<Mono>&lt;h3&gt;</Mono>) so the state is announced in the
              document outline.
            </>,
            "Actions are standard buttons — keyboard reachable with visible focus.",
            "The error variant pairs the destructive token with an icon and a clear message.",
            "Decorative icons are not announced; the text carries the meaning.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
