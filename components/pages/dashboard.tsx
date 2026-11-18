"use client";

import * as React from "react";
import {
  IconFolders,
  IconHammer,
  IconUsers,
  IconRocket,
  IconPlus,
  IconArrowRight,
  IconCircleFilled,
} from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Stat } from "@/components/data/stat";
import { StatusBadge, PROJECTS as DATA_PROJECTS } from "@/components/data/_shared";
import { envTone } from "@/components/product/_data";
import { AppFrame, Subsection } from "./_frame";

const METRICS = [
  { label: "Projects", value: "14", icon: IconFolders, trend: { dir: "up" as const, value: "+2" }, supporting: "this month" },
  { label: "Builds", value: "128", icon: IconHammer, trend: { dir: "up" as const, value: "+12%" }, supporting: "this week" },
  { label: "Active testers", value: "312", icon: IconUsers, trend: { dir: "up" as const, value: "+8%" }, supporting: "vs last month" },
  { label: "Releases", value: "6", icon: IconRocket, trend: { dir: "neutral" as const, value: "0%" }, supporting: "this month" },
];

const ACTIVITY = [
  { who: "Ava Morgan", initials: "AM", what: "published", target: "v2.4.1 to Production", when: "12m ago" },
  { who: "Kai Price", initials: "KP", what: "started a build", target: "#1843 on Staging", when: "1h ago" },
  { who: "Jordan Diaz", initials: "JD", what: "invited", target: "3 testers to Project Beta", when: "3h ago" },
  { who: "Sam Lee", initials: "SL", what: "updated settings", target: "Project Gamma", when: "yesterday" },
];

const ENV_STATUS: Record<string, "operational" | "degraded" | "offline"> = {
  Production: "operational",
  Staging: "degraded",
  Development: "offline",
};

export function DashboardPage() {
  return (
    <AppFrame
      companyLevel
      sidebarActive="Dashboard"
      pageName="Dashboard"
      title="Dashboard"
      description="Your Appcharge workspace at a glance — across every project."
      actions={
        <Button size="sm">
          <IconPlus /> New project
        </Button>
      }
      contentClassName="flex flex-col gap-8"
    >
      {/* Company metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="p-4">
            <Stat {...m} />
          </Card>
        ))}
      </div>

      {/* Projects overview */}
      <Subsection
        title="Projects"
        action={
          <Button variant="ghost" size="sm">
            View all <IconArrowRight />
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_PROJECTS.map((p) => (
            <Card key={p.name} className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2.5">
                <Avatar size="sm">
                  <AvatarFallback>{p.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconCircleFilled className={`size-2 ${envTone(ENV_STATUS[p.environment])}`} aria-hidden />
                    {p.environment}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
                <span>{p.builds} builds</span>
                <Button variant="ghost" size="xs">
                  Open <IconArrowRight />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Subsection>

      {/* Recent activity */}
      <Subsection title="Recent activity">
        <Card className="divide-y divide-border p-0">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Avatar size="sm">
                <AvatarFallback>{a.initials}</AvatarFallback>
              </Avatar>
              <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{a.who}</span> {a.what}{" "}
                <span className="text-foreground">{a.target}</span>
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">{a.when}</span>
            </div>
          ))}
        </Card>
      </Subsection>
    </AppFrame>
  );
}
