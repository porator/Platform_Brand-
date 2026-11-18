"use client";

import * as React from "react";
import {
  IconClock,
  IconLoader2,
  IconCircleCheck,
  IconX,
  IconBan,
  IconProgress,
  IconPencil,
  IconRocket,
  IconFlask,
  IconMailForward,
  IconUserCheck,
  IconUserX,
  IconUserExclamation,
} from "@/lib/icons";
import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */
/*  Appcharge product data — Company → Project → Environment → Resource        */
/* -------------------------------------------------------------------------- */

export type Project = { id: string; name: string; store: string; initials: string };

export const PROJECTS: Project[] = [
  { id: "alpha", name: "Project Alpha", store: "Production Store", initials: "PA" },
  { id: "beta", name: "Project Beta", store: "Mobile Store", initials: "PB" },
  { id: "gamma", name: "Project Gamma", store: "Web Store", initials: "PG" },
];

export const RECENT_PROJECT_IDS = ["alpha", "beta"];

export type EnvStatus = "operational" | "degraded" | "offline";
export type Environment = { id: string; name: string; status: EnvStatus };

export const ENVIRONMENTS: Environment[] = [
  { id: "production", name: "Production", status: "operational" },
  { id: "staging", name: "Staging", status: "degraded" },
  { id: "development", name: "Development", status: "offline" },
];

/* -------------------------------- Build status ---------------------------- */

export type BuildStatusValue =
  | "Queued"
  | "Building"
  | "Processing"
  | "Ready"
  | "Failed"
  | "Cancelled";

export const BUILD_STATUS: Record<
  BuildStatusValue,
  { variant: React.ComponentProps<typeof Badge>["variant"]; icon: React.ComponentType<{ className?: string }>; spin?: boolean }
> = {
  Queued: { variant: "neutral", icon: IconClock },
  Building: { variant: "info", icon: IconLoader2, spin: true },
  Processing: { variant: "info", icon: IconProgress, spin: true },
  Ready: { variant: "success", icon: IconCircleCheck },
  Failed: { variant: "destructive", icon: IconX },
  Cancelled: { variant: "neutral", icon: IconBan },
};

/* ------------------------------ Release status ---------------------------- */

export type ReleaseStatusValue = "Draft" | "Testing" | "Ready" | "Published" | "Failed";

export const RELEASE_STATUS: Record<
  ReleaseStatusValue,
  { variant: React.ComponentProps<typeof Badge>["variant"]; icon: React.ComponentType<{ className?: string }> }
> = {
  Draft: { variant: "neutral", icon: IconPencil },
  Testing: { variant: "warning", icon: IconFlask },
  Ready: { variant: "success", icon: IconCircleCheck },
  Published: { variant: "success", icon: IconRocket },
  Failed: { variant: "destructive", icon: IconX },
};

export function ReleaseStatusBadge({ status }: { status: ReleaseStatusValue }) {
  const { variant, icon: Icon } = RELEASE_STATUS[status];
  return (
    <Badge variant={variant}>
      <Icon />
      {status}
    </Badge>
  );
}

export type Release = {
  version: string;
  status: ReleaseStatusValue;
  environment: string;
  date: string;
  build: string;
  testers: number;
};

export const RELEASES: Release[] = [
  { version: "v2.4.1", status: "Published", environment: "Production", date: "Oct 6, 2026", build: "#1842", testers: 312 },
  { version: "v2.4.0-rc.2", status: "Testing", environment: "Staging", date: "Oct 5, 2026", build: "#1839", testers: 48 },
  { version: "v2.5.0", status: "Draft", environment: "Development", date: "Oct 4, 2026", build: "—", testers: 0 },
];

/* ------------------------------- Tester status ---------------------------- */

export type TesterStatusValue = "Invited" | "Active" | "Expired" | "Removed";

export const TESTER_STATUS: Record<
  TesterStatusValue,
  { variant: React.ComponentProps<typeof Badge>["variant"]; icon: React.ComponentType<{ className?: string }> }
> = {
  Invited: { variant: "info", icon: IconMailForward },
  Active: { variant: "success", icon: IconUserCheck },
  Expired: { variant: "warning", icon: IconUserExclamation },
  Removed: { variant: "neutral", icon: IconUserX },
};

export function TesterStatusBadge({ status }: { status: TesterStatusValue }) {
  const { variant, icon: Icon } = TESTER_STATUS[status];
  return (
    <Badge variant={variant}>
      <Icon />
      {status}
    </Badge>
  );
}

export type Tester = {
  name: string;
  email: string;
  initials: string;
  role: string;
  status: TesterStatusValue;
  added: string;
};

export const TESTERS: Tester[] = [
  { name: "Ava Morgan", email: "ava@appcharge.com", initials: "AM", role: "Admin", status: "Active", added: "Sep 2, 2026" },
  { name: "Jordan Diaz", email: "jordan@appcharge.com", initials: "JD", role: "Tester", status: "Active", added: "Sep 14, 2026" },
  { name: "Kai Price", email: "kai@appcharge.com", initials: "KP", role: "Tester", status: "Invited", added: "Oct 1, 2026" },
  { name: "Sam Lee", email: "sam@appcharge.com", initials: "SL", role: "Tester", status: "Expired", added: "Jul 20, 2026" },
  { name: "Rae Okoye", email: "rae@appcharge.com", initials: "RO", role: "Viewer", status: "Removed", added: "Jun 3, 2026" },
];

/* ------------------------------ Env status dot ---------------------------- */

const ENV_TONE: Record<EnvStatus, string> = {
  operational: "text-success",
  degraded: "text-warning",
  offline: "text-muted-foreground",
};

export function envTone(status: EnvStatus) {
  return ENV_TONE[status];
}
