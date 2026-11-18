"use client";

import * as React from "react";
import { IconDotsVertical, IconUsers } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";
import { ReleaseStatusBadge, RELEASES, type Release, type ReleaseStatusValue } from "./_data";

const PRIMARY_ACTION: Record<ReleaseStatusValue, string> = {
  Draft: "Edit",
  Testing: "Review",
  Ready: "Publish",
  Published: "View",
  Failed: "Retry",
};

function ReleaseMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Release actions" />}>
        <IconDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ReleaseCard({
  release,
  variant = "card",
  className,
}: {
  release: Release;
  variant?: "card" | "row";
  className?: string;
}) {
  const primary = PRIMARY_ACTION[release.status];

  if (variant === "row") {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center",
          className,
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{release.version}</span>
            <ReleaseStatusBadge status={release.status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            <span>{release.environment}</span>
            <span aria-hidden>·</span>
            <span>{release.date}</span>
            <span aria-hidden>·</span>
            <Mono>{release.build}</Mono>
            {release.testers > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <IconUsers className="size-3.5" aria-hidden /> {release.testers}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ReleaseMenu />
          <Button size="sm">{primary}</Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b">
        <CardTitle>{release.version}</CardTitle>
        <CardDescription>
          {release.environment} · {release.date}
        </CardDescription>
        <CardAction>
          <ReleaseStatusBadge status={release.status} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Build <Mono className="text-foreground">{release.build}</Mono>
        </span>
        {release.testers > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <IconUsers className="size-4" aria-hidden /> {release.testers} testers
          </span>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between border-t">
        <ReleaseMenu />
        <Button size="sm">{primary}</Button>
      </CardFooter>
    </Card>
  );
}

const STATES: ReleaseStatusValue[] = ["Draft", "Testing", "Ready", "Published", "Failed"];

export function ReleaseCardPage() {
  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Product Components"
        title="Release Card"
        description={
          <>
            Summarizes an Appcharge release — version, status, environment, build reference and tester
            count — with a primary action that adapts to the release state. It reuses Card, Badge and
            Button, and works as a card or a compact row.
          </>
        }
      />

      <Section title="Default (card)" description="The full card layout.">
        <ReleaseCard release={RELEASES[0]} className="max-w-sm" />
      </Section>

      <Section
        title="States"
        description="Draft → Testing → Ready → Published, plus Failed. The primary action changes with the state (Edit · Review · Publish · View · Retry)."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATES.map((status, i) => (
            <ReleaseCard key={status} release={{ ...RELEASES[i % RELEASES.length], status, version: RELEASES[0].version }} />
          ))}
        </div>
      </Section>

      <Section
        title="Compact row"
        description="For lists and tables — horizontal on desktop, stacking on mobile."
      >
        <div className="flex flex-col gap-3">
          {RELEASES.map((r) => (
            <ReleaseCard key={r.version} release={r} variant="row" />
          ))}
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "The version is the card heading; status is an icon + label, not color alone.",
            "The primary action and the overflow menu are independently focusable and labelled.",
            "The card reflows naturally; the row variant stacks on mobile so actions stay reachable.",
            "Metadata uses tabular/mono figures for alignment.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
