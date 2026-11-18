"use client";

import * as React from "react";
import {
  IconServer,
  IconDotsVertical,
  IconChevronRight,
  IconFolderFilled,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";
import { PROJECTS, StatusBadge } from "./_shared";

export function List({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={cn("divide-y divide-border overflow-hidden rounded-md border border-border", className)}>
      {children}
    </ul>
  );
}

export function ListItem({
  leading,
  title,
  description,
  meta,
  trailing,
  selected,
  disabled,
  className,
}: {
  leading?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "relative flex items-center gap-3 px-4 py-3",
        selected &&
          "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {leading ? <div className="flex shrink-0 items-center">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{title}</div>
        {description ? <div className="truncate text-sm text-muted-foreground">{description}</div> : null}
      </div>
      {meta ? <div className="shrink-0 text-sm text-muted-foreground tabular-nums">{meta}</div> : null}
      {trailing ? <div className="flex shrink-0 items-center gap-1">{trailing}</div> : null}
    </li>
  );
}

function ItemActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}>
        <IconDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectableProjects() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["Project Alpha"]));
  const toggle = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  return (
    <List className="max-w-lg">
      {PROJECTS.map((p) => (
        <ListItem
          key={p.name}
          selected={selected.has(p.name)}
          leading={
            <Checkbox
              aria-label={`Select ${p.name}`}
              checked={selected.has(p.name)}
              onCheckedChange={() => toggle(p.name)}
            />
          }
          title={p.name}
          description={p.environment}
          meta={`${p.builds} builds`}
        />
      ))}
    </List>
  );
}

export function ListPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Data Display"
        title="List"
        description={
          <>
            A flexible list for collections of records — projects, environments, testers, releases.
            Each row composes an optional leading element, a title and description, trailing metadata,
            status and actions. It renders content, not navigation.
          </>
        }
      />

      <Section title="Basic usage" description="A plain list of records.">
        <List className="max-w-lg">
          {["Production", "Staging", "Development"].map((env) => (
            <ListItem key={env} title={env} description="Environment" />
          ))}
        </List>
      </Section>

      <Section
        title="With leading icons or avatars"
        description="Lead with an icon for resources, or an avatar for people and projects."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <List>
            {["Production", "Staging", "Development"].map((env, i) => (
              <ListItem
                key={env}
                leading={<IconServer className={cn("size-4", i === 0 ? "text-success" : i === 1 ? "text-warning" : "text-muted-foreground")} />}
                title={env}
                description="Environment"
              />
            ))}
          </List>
          <List>
            {PROJECTS.map((p) => (
              <ListItem
                key={p.name}
                leading={
                  <Avatar size="sm">
                    <AvatarFallback>{p.initials}</AvatarFallback>
                  </Avatar>
                }
                title={p.name}
                description={p.environment}
              />
            ))}
          </List>
        </div>
      </Section>

      <Section
        title="Metadata, status & actions"
        description="Trailing content carries counts, status and a per-row menu."
      >
        <List className="max-w-xl">
          {PROJECTS.map((p) => (
            <ListItem
              key={p.name}
              leading={
                <Avatar size="sm">
                  <AvatarFallback>{p.initials}</AvatarFallback>
                </Avatar>
              }
              title={p.name}
              description={`${p.builds} builds · ${p.environment}`}
              trailing={
                <>
                  <StatusBadge status={p.status} />
                  <ItemActions />
                </>
              }
            />
          ))}
        </List>
      </Section>

      <Section title="Selectable" description="Rows with a checkbox and a selected background.">
        <SelectableProjects />
      </Section>

      <Section title="States" description="Loading skeletons and an empty list.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <List>
            {Array.from({ length: 3 }).map((_, i) => (
              <ListItem
                key={i}
                leading={<Skeleton className="size-8 rounded-full" />}
                title={<Skeleton className="h-4 w-32" />}
                description={<Skeleton className="mt-1 h-3 w-20" />}
              />
            ))}
          </List>
          <List className="flex items-center justify-center">
            <li className="px-6 py-10 text-center text-sm text-muted-foreground">
              No releases yet.
            </li>
          </List>
        </div>
      </Section>

      <Section
        title="Interactive rows"
        description="When a list row navigates, make the whole row a link with a trailing chevron — but prefer the Navigation components for primary navigation."
      >
        <List className="max-w-lg">
          {PROJECTS.map((p) => (
            <li key={p.name}>
              <a
                href={`#${p.name}`}
                className="flex items-center gap-3 px-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
              >
                <IconFolderFilled className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate text-sm font-medium text-foreground">{p.name}</span>
                <IconChevronRight className="size-4 text-muted-foreground" />
              </a>
            </li>
          ))}
        </List>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Rendered as a <Mono>&lt;ul&gt;</Mono> / <Mono>&lt;li&gt;</Mono> so the collection and its
              size are announced.
            </>,
            "Selection checkboxes are labelled per row; selected rows also read via the checkbox state.",
            "Interactive rows are real links/buttons with visible focus; status uses icon + label.",
            "Loading skeletons are decorative and don't trap focus.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
