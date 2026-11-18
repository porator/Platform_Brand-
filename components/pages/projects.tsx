"use client";

import * as React from "react";
import { IconPlus, IconCircleFilled, IconArrowRight } from "@/lib/icons";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/form/search";
import { EmptyState } from "@/components/data/empty-state";
import { StatusBadge, PROJECTS as DATA_PROJECTS } from "@/components/data/_shared";
import { CreateProjectForm } from "@/components/patterns/create-edit";
import { envTone } from "@/components/product/_data";
import { AppFrame, Subsection } from "./_frame";

const ENV_STATUS: Record<string, "operational" | "degraded" | "offline"> = {
  Production: "operational",
  Staging: "degraded",
  Development: "offline",
};

function CreateProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>
        <IconPlus /> New project
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Add a new project to the Appcharge workspace.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm />
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA_PROJECTS.filter(
      (p) => (!q || p.name.toLowerCase().includes(q)) && (status === "all" || p.status === status),
    );
  }, [query, status]);

  return (
    <AppFrame
      companyLevel
      sidebarActive="Projects"
      pageName="Projects"
      title="Projects"
      description="Every project in the Appcharge workspace. Open one to enter its environments and resources."
      actions={<CreateProjectDialog />}
      contentClassName="flex flex-col gap-4"
    >
      <Subsection title={`All projects (${DATA_PROJECTS.length})`}>
        {/* Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="Search projects…"
            className="sm:max-w-xs"
          />
          <Select items={{ all: "All statuses", Ready: "Ready", Building: "Building", Queued: "Queued", Failed: "Failed" }} value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger size="sm" aria-label="Filter by status" className="w-40 sm:ml-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Building">Building</SelectItem>
              <SelectItem value="Queued">Queued</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {results.length === 0 ? (
          <EmptyState
            title="No projects match"
            description="Try a different search or clear the status filter."
            primaryAction={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
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
                {results.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback>{p.initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <IconCircleFilled className={`size-2 ${envTone(ENV_STATUS[p.environment])}`} aria-hidden />
                        {p.environment}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell tabular-nums text-muted-foreground">{p.builds}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label={`Open ${p.name}`}>
                        <IconArrowRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Subsection>
    </AppFrame>
  );
}
