"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconFilter,
  IconChevronDown,
  IconRocket,
  IconArchive,
  IconTrash,
  IconX,
  IconDotsVertical,
} from "@/lib/icons";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tag } from "@/components/data/tag";
import { SearchInput } from "@/components/form/search";
import { StatusBadge, PROJECTS, type Project } from "@/components/data/_shared";
import { ConfirmDialog } from "@/components/feedback/confirmation";
import { ExampleSidebar } from "@/components/navigation/_shared";
import { TopBar, ProjectSwitcher, EnvironmentSwitcher } from "@/components/navigation/top-bar";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { PageLayout } from "@/components/layout/primitives";
import { CreateProjectForm } from "./create-edit";
import { EditorPreview } from "@/components/layout/split-view";
import { OnboardingWizard } from "./onboarding";

/* ----------------------------------------- Shared shell wrapper (chrome) */

function Shell({ activeTop, children }: { activeTop?: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ExampleSidebar collapsible="icon" active={{ top: activeTop }} />
      <SidebarInset className="min-w-0">
        <TopBar
          left={
            <>
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <ProjectSwitcher />
              <span className="hidden sm:inline-flex">
                <EnvironmentSwitcher />
              </span>
            </>
          }
        />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/* ----------------------------------------- 1. Project Management workspace */

const STATUSES = ["Ready", "Building", "Queued"];

function ProjectsManager() {
  const [query, setQuery] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const toggleStatus = (s: string) =>
    setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (statuses.length && !statuses.includes(p.status)) return false;
      return true;
    });
  }, [query, statuses]);

  const allChecked = results.length > 0 && results.every((p) => selected.has(p.name));
  const some = selected.size > 0 && !allChecked;
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(results.map((p) => p.name)));
  const toggleOne = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const count = selected.size;
  const act = (verb: string) => {
    toast.success(`${verb} ${count} ${count === 1 ? "project" : "projects"}`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Search projects…"
          className="sm:max-w-xs"
        />
        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
            <IconFilter className="size-3.5" /> Status
            {statuses.length > 0 ? (
              <Badge variant="secondary" className="ml-0.5">
                {statuses.length}
              </Badge>
            ) : null}
            <IconChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-1">
            {STATUSES.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
                <Checkbox checked={statuses.includes(s)} onCheckedChange={() => toggleStatus(s)} />
                {s}
              </label>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {statuses.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((s) => (
            <Tag key={s} onRemove={() => toggleStatus(s)}>
              {s}
            </Tag>
          ))}
          <Button variant="ghost" size="xs" onClick={() => setStatuses([])}>
            Clear filters
          </Button>
        </div>
      ) : null}

      {/* Table with bulk actions */}
      <div className="overflow-hidden rounded-md border border-border">
        {count > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
            <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => setSelected(new Set())}>
              <IconX />
            </Button>
            <span className="text-sm font-medium text-foreground">{count} selected</span>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => act("Published")}>
                <IconRocket /> Publish
              </Button>
              <Button variant="outline" size="sm" onClick={() => act("Archived")}>
                <IconArchive /> Archive
              </Button>
              <ConfirmDialog
                destructive
                trigger={
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <IconTrash /> Delete
                  </Button>
                }
                title={`Delete ${count} ${count === 1 ? "project" : "projects"}?`}
                description="This permanently removes the selected projects. This can't be undone."
                confirmLabel="Delete"
                onConfirm={() => act("Deleted")}
              />
            </div>
          </div>
        ) : null}

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox aria-label="Select all projects" checked={allChecked} indeterminate={some} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="hidden sm:table-cell">Environment</TableHead>
              <TableHead className="hidden md:table-cell">Builds</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-24 text-center align-middle text-sm text-muted-foreground">
                  No projects match your search and filters.
                </TableCell>
              </TableRow>
            ) : (
              results.map((p: Project) => {
                const isSelected = selected.has(p.name);
                return (
                  <TableRow key={p.name} data-state={isSelected ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox aria-label={`Select ${p.name}`} checked={isSelected} onCheckedChange={() => toggleOne(p.name)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback>{p.initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{p.environment}</TableCell>
                    <TableCell className="hidden md:table-cell tabular-nums text-muted-foreground">{p.builds}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`${p.name} actions`} />}>
                          <IconDotsVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Open</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ProjectManagementComposition() {
  return (
    <Shell activeTop="Projects">
      <PageLayout
        breadcrumbs={<Breadcrumbs label="Projects" trail={["Projects", "All Projects"]} />}
        title="Projects"
        description="Search, filter and manage all projects in this workspace."
        actions={
          <Button>
            <IconPlus /> Create Project
          </Button>
        }
      >
        <ProjectsManager />
      </PageLayout>
    </Shell>
  );
}

/* ----------------------------------------- 2. Create Project */

export function CreateProjectComposition() {
  return (
    <Shell activeTop="Projects">
      <PageLayout
        breadcrumbs={<Breadcrumbs label="Create project" trail={["Projects", "New project"]} />}
        title="Create project"
        description="Set up a new project and its first environment."
      >
        <CreateProjectForm />
      </PageLayout>
    </Shell>
  );
}

/* ----------------------------------------- 3. Editor Workflow */

export function EditorWorkflowComposition() {
  return (
    <Shell activeTop="Releases">
      <PageLayout
        breadcrumbs={<Breadcrumbs label="Editor" trail={["Releases", "Store", "Editor"]} />}
        title="Store configuration"
        description="Edit the store on the left; preview updates on the right."
        actions={<Button>Publish</Button>}
      >
        <EditorPreview />
      </PageLayout>
    </Shell>
  );
}

/* ----------------------------------------- 4. Onboarding */

export function OnboardingComposition() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex h-14 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-xs font-bold">A</span>
          </div>
          <span className="text-sm font-semibold">Appcharge</span>
        </div>
      </header>
      <main className="flex-1 px-6 py-12">
        <OnboardingWizard />
      </main>
    </div>
  );
}

/* ----------------------------------------- 5. Responsive Application */

export function ResponsiveApplicationComposition() {
  // The same Project Management workflow — resize the viewport (or use the
  // toolbar) to see the sidebar become a drawer, the toolbar stack, and the
  // table prioritize columns.
  return <ProjectManagementComposition />;
}
