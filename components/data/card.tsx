"use client";

import * as React from "react";
import { IconDotsVertical, IconDeviceMobile, IconCheck } from "@/lib/icons";
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
import { StatusBadge } from "./_shared";

function mediaUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#e7e5e4"/><rect x="128" y="62" width="64" height="56" rx="8" fill="#a8a29e"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function CardMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Card actions" />}>
        <IconDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectableCard() {
  const [selected, setSelected] = React.useState(true);
  return (
    <button
      type="button"
      onClick={() => setSelected((s) => !s)}
      aria-pressed={selected}
      className="text-left outline-none"
    >
      <Card className={cn("transition-shadow", selected ? "ring-2 ring-ring" : "hover:ring-foreground/20")}>
        <CardHeader>
          <CardTitle>Project Alpha</CardTitle>
          <CardDescription>Production · 128 builds</CardDescription>
          <CardAction>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {selected ? <IconCheck className="size-3.5" /> : null}
            </span>
          </CardAction>
        </CardHeader>
      </Card>
    </button>
  );
}

export function CardPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Data Display"
        title="Card"
        description={
          <>
            A surface that groups related content and actions — built on the shadcn <Mono>Card</Mono>{" "}
            primitives (Header, Title, Description, Action, Content, Footer). Use it for records,
            summaries and media previews.
          </>
        }
      />

      <Section title="Basic usage" description="Title, description and content.">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Project Alpha</CardTitle>
            <CardDescription>Your production mobile app.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            128 builds · 14 testers · 6 releases
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Header, actions & footer"
        description="A record card: title + description, a menu action in the header, metadata in the content, and footer actions."
      >
        <Card className="max-w-sm">
          <CardHeader className="border-b">
            <CardTitle>Release v2.4.1</CardTitle>
            <CardDescription>Production · Oct 6, 2026</CardDescription>
            <CardAction>
              <CardMenu />
            </CardAction>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-muted-foreground">Rollout status</span>
            <StatusBadge status="Ready" />
          </CardContent>
          <CardFooter className="border-t">
            <Button variant="outline" size="sm">
              View details
            </Button>
            <Button size="sm">Promote</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section
        title="With media"
        description="A leading media region (e.g. an app preview) rounds to the card and drops the top padding automatically."
      >
        <Card className="max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative inline data-URI placeholder, not a real asset */}
          <img src={mediaUri()} alt="App preview" className="aspect-video w-full object-cover" />
          <CardHeader>
            <CardTitle>App Preview</CardTitle>
            <CardDescription>Project Alpha · v2.4.1</CardDescription>
            <CardAction>
              <IconDeviceMobile className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
        </Card>
      </Section>

      <Section
        title="Selectable, interactive & disabled"
        description="Cards can be pressable (selection), navigable (hover lift), or disabled."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Selectable</p>
            <SelectableCard />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Interactive</p>
            <a href="#project" className="block outline-none">
              <Card className="transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
                <CardHeader>
                  <CardTitle>Project Beta</CardTitle>
                  <CardDescription>Staging · 42 builds</CardDescription>
                </CardHeader>
              </Card>
            </a>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
            <Card aria-disabled className="pointer-events-none opacity-60">
              <CardHeader>
                <CardTitle>Project Gamma</CardTitle>
                <CardDescription>Archived</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Content cards are plain containers; the heading conveys structure to screen readers.",
            <>
              Selectable cards are buttons with <Mono>aria-pressed</Mono>; navigable cards are links
              with visible focus.
            </>,
            "Disabled cards are aria-disabled and removed from interaction.",
            "Actions inside a card are independently focusable and labelled.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
