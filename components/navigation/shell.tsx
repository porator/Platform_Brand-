"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExampleSidebar } from "./_shared";
import { Breadcrumbs } from "./breadcrumbs";
import { TopBar, ProjectSwitcher, EnvironmentSwitcher } from "./top-bar";

export function AppShellPage() {
  return (
    <SidebarProvider>
      <ExampleSidebar collapsible="icon" active={{ project: "Project Alpha", leaf: "Builds" }} />
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
          <Breadcrumbs trail={["Projects", "Project Alpha", "Builds"]} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <div className="px-4 pt-5 sm:px-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Builds</h1>
              <Badge variant="secondary">12</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Builds for Project Alpha in Production.
            </p>
          </div>

          <Tabs defaultValue="builds" className="mt-4 px-4 sm:px-6">
            <TabsList variant="line" className="w-full justify-start border-b border-border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="builds">Builds</TabsTrigger>
              <TabsTrigger value="testers">Testers</TabsTrigger>
              <TabsTrigger value="releases">Releases</TabsTrigger>
            </TabsList>
            <TabsContent value="builds" className="py-6">
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Page content — this is a navigation composition, not a finished page.
              </div>
            </TabsContent>
            <TabsContent value="overview" className="py-6">
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Overview content
              </div>
            </TabsContent>
            <TabsContent value="testers" className="py-6">
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Testers content
              </div>
            </TabsContent>
            <TabsContent value="releases" className="py-6">
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Releases content
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
