"use client";

import * as React from "react";
import { IconSelector, IconCheck, IconPlus } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";
import { PROJECTS, RECENT_PROJECT_IDS, type Project } from "./_data";

export function ProjectSelector({
  value,
  onValueChange,
  className,
  id,
}: {
  value: string;
  onValueChange?: (id: string) => void;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = PROJECTS.find((p) => p.id === value) ?? PROJECTS[0];
  const recent = PROJECTS.filter((p) => RECENT_PROJECT_IDS.includes(p.id));

  const Item = ({ p }: { p: Project }) => (
    <CommandItem
      value={`${p.name} ${p.store}`}
      onSelect={() => {
        onValueChange?.(p.id);
        setOpen(false);
      }}
      className="gap-2.5"
    >
      <Avatar size="sm">
        <AvatarFallback>{p.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-sm font-medium">{p.name}</div>
        <div className="truncate text-xs text-muted-foreground">{p.store}</div>
      </div>
      <IconCheck className={cn("size-4 shrink-0", p.id === value ? "opacity-100" : "opacity-0")} aria-hidden />
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select project"
            className={cn("h-11 w-60 justify-start gap-2.5 px-2.5", className)}
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{selected.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 text-left leading-tight">
          <div className="truncate text-sm font-medium">{selected.name}</div>
          <div className="truncate text-xs font-normal text-muted-foreground">{selected.store}</div>
        </div>
        <IconSelector className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search projects…" />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup heading="Recent">
              {recent.map((p) => (
                <Item key={p.id} p={p} />
              ))}
            </CommandGroup>
            <CommandGroup heading="All projects">
              {PROJECTS.map((p) => (
                <Item key={p.id} p={p} />
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="create project" className="gap-2.5 text-muted-foreground">
                <IconPlus className="size-4" />
                Create project
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ProjectSelectorPage() {
  const [project, setProject] = React.useState("alpha");
  return (
    <PageShell>
      <PageHeader
        eyebrow="Product Components"
        title="Project Selector"
        description={
          <>
            Switches the active <strong className="text-foreground">project</strong> — the level
            below the company in the Appcharge hierarchy. It composes Popover + Command + Avatar: the
            current project is always visible, and a search finds projects fast.
          </>
        }
      />

      <Section title="Default" description="The current project with its store type; click to open and search.">
        <Row label="Selector">
          <ProjectSelector value={project} onValueChange={setProject} />
        </Row>
      </Section>

      <Section
        title="Open"
        description="Recent projects, all projects, a search field, the selected check, and a create action."
      >
        <A11yList
          items={[
            "Recent — the projects you've visited most, surfaced first.",
            "All projects — the full list, searchable by name or store.",
            "Selected — marked with a check, not color alone.",
            "Create project — a clear entry point at the bottom.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The trigger exposes <Mono>role=&quot;combobox&quot;</Mono> with{" "}
              <Mono>aria-expanded</Mono> and an accessible name.
            </>,
            "Type to filter; Arrow keys move, Enter selects, Esc closes and returns focus.",
            "Each project is a Command item with its name and store; the current one is checked.",
            "The popover flips to stay in view on small screens.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
