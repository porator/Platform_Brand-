"use client";

import * as React from "react";
import {
  IconPlus,
  IconFilter,
  IconSearch,
  IconDotsVertical,
  IconUsers,
  IconRocket,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ExampleSidebar } from "@/components/navigation/_shared";
import { TopBar, ProjectSwitcher, EnvironmentSwitcher } from "@/components/navigation/top-bar";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { List, ListItem } from "./list";
import { BuildsTable } from "./table";
import { Stat } from "./stat";
import { EmptyState } from "./empty-state";
import { PROJECTS, StatusBadge } from "./_shared";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

/* ---------------------------------------------------------------- Project list */

export function ProjectListComposition() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground">{PROJECTS.length} projects</p>
        </div>
        <Button size="sm">
          <IconPlus /> New project
        </Button>
      </div>
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
            description={`${p.builds} builds · ${p.environment}`}
            trailing={
              <>
                <StatusBadge status={p.status} />
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`${p.name} actions`} />}>
                    <IconDotsVertical />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Open</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
          />
        ))}
      </List>
    </div>
  );
}

/* ------------------------------------------------------------- Builds table */

export function BuildsTableComposition() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Builds</h2>
        <p className="text-sm text-muted-foreground">Project Alpha · Production</p>
      </div>
      <div className="my-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <InputGroup className="h-9 max-w-xs">
          <InputGroupAddon>
            <IconSearch aria-hidden />
          </InputGroupAddon>
          <InputGroupInput type="search" placeholder="Search builds…" aria-label="Search builds" />
        </InputGroup>
        <Button variant="outline" size="sm">
          <IconFilter /> Filter
        </Button>
        <Button size="sm" className="sm:ml-auto">
          <IconPlus /> New build
        </Button>
      </div>
      <BuildsTable selectable />
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing <span className="text-foreground">1–5</span> of{" "}
          <span className="text-foreground">196</span>
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Release overview */

export function ReleaseOverviewComposition() {
  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Release v2.4.1</CardTitle>
          <CardDescription>Project Alpha · Production · Oct 6, 2026</CardDescription>
          <CardAction>
            <StatusBadge status="Building" />
          </CardAction>
        </CardHeader>
        <CardContent className="gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Testers" value="312" icon={IconUsers} />
            <Stat label="Releases" value="6" icon={IconRocket} />
          </div>
          <Progress value={68} className="[&_[data-slot=progress-indicator]]:bg-success">
            <ProgressLabel className="text-foreground">Rollout</ProgressLabel>
            <ProgressValue />
          </Progress>
          <p className="text-sm text-muted-foreground">68% of devices updated · crash-free 99.4%</p>
        </CardContent>
        <CardFooter className="border-t">
          <Button variant="outline" size="sm">
            Pause rollout
          </Button>
          <Button size="sm">Promote to 100%</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------ Empty projects */

export function EmptyProjectsComposition() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Projects</h2>
        <Button size="sm">
          <IconPlus /> Create project
        </Button>
      </div>
      <EmptyState
        icon={<IconPlus className="size-5" />}
        title="No projects yet"
        description="Create your first project to start managing your environments and releases."
        primaryAction={
          <Button>
            <IconPlus /> Create project
          </Button>
        }
        secondaryAction={<Button variant="outline">Import existing</Button>}
      />
    </div>
  );
}

/* ---------------------------------------------- Application context (shell) */

function ProjectsTable() {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
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
          {PROJECTS.map((p) => (
            <TableRow key={p.name}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback>{p.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{p.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{p.environment}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground tabular-nums">{p.builds}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ApplicationContextComposition() {
  return (
    <SidebarProvider>
      <ExampleSidebar collapsible="icon" active={{ top: "Projects" }} />
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
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <Breadcrumbs trail={["Projects", "All Projects"]} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
              <p className="mt-1 text-sm text-muted-foreground">All projects in this workspace.</p>
            </div>
            <Button>
              <IconPlus /> Create Project
            </Button>
          </div>

          <div className="my-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <InputGroup className="h-9 max-w-xs">
              <InputGroupAddon>
                <IconSearch aria-hidden />
              </InputGroupAddon>
              <InputGroupInput type="search" placeholder="Search projects…" aria-label="Search projects" />
            </InputGroup>
            <Button variant="outline" size="sm">
              <IconFilter /> Filter
            </Button>
          </div>

          <ProjectsTable />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
