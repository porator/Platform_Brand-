"use client";

import * as React from "react";
import {
  IconCircleCheck,
  IconLoader2,
  IconClock,
  IconX,
} from "@/lib/icons";
import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */
/*  Example data — realistic New Gen Wire content (kept out of the primitives) */
/* -------------------------------------------------------------------------- */

export type BuildStatus = "Ready" | "Building" | "Queued" | "Failed";

export type Build = {
  id: string;
  version: string;
  environment: "Production" | "Staging" | "Development";
  status: BuildStatus;
  created: string;
  author: string;
  authorInitials: string;
};

export const BUILDS: Build[] = [
  { id: "#124", version: "v2.4.1", environment: "Production", status: "Ready", created: "Oct 6, 2026", author: "Ava Morgan", authorInitials: "AM" },
  { id: "#123", version: "v2.4.0", environment: "Production", status: "Ready", created: "Oct 5, 2026", author: "Jordan Diaz", authorInitials: "JD" },
  { id: "#122", version: "v2.4.0-rc.2", environment: "Staging", status: "Building", created: "Oct 5, 2026", author: "Kai Price", authorInitials: "KP" },
  { id: "#121", version: "v2.4.0-rc.1", environment: "Staging", status: "Queued", created: "Oct 4, 2026", author: "Ava Morgan", authorInitials: "AM" },
  { id: "#120", version: "v2.3.9", environment: "Development", status: "Failed", created: "Oct 3, 2026", author: "Sam Lee", authorInitials: "SL" },
];

export type Project = {
  name: string;
  initials: string;
  environment: string;
  builds: number;
  status: BuildStatus;
};

export const PROJECTS: Project[] = [
  { name: "Project Alpha", initials: "PA", environment: "Production", builds: 128, status: "Ready" },
  { name: "Project Beta", initials: "PB", environment: "Staging", builds: 42, status: "Building" },
  { name: "Project Gamma", initials: "PG", environment: "Development", builds: 7, status: "Queued" },
];

/* -------------------------------------------------------------------------- */
/*  Status → Badge mapping (token-based; status is text + icon, never color    */
/*  alone). Reused across Table, List and the compositions.                    */
/* -------------------------------------------------------------------------- */

const STATUS_MAP: Record<
  BuildStatus,
  { variant: React.ComponentProps<typeof Badge>["variant"]; icon: React.ComponentType<{ className?: string }>; spin?: boolean }
> = {
  Ready: { variant: "success", icon: IconCircleCheck },
  Building: { variant: "info", icon: IconLoader2, spin: true },
  Queued: { variant: "neutral", icon: IconClock },
  Failed: { variant: "destructive", icon: IconX },
};

export function StatusBadge({ status }: { status: BuildStatus }) {
  const { variant, icon: Icon, spin } = STATUS_MAP[status];
  return (
    <Badge variant={variant}>
      <Icon className={spin ? "animate-spin" : undefined} />
      {status}
    </Badge>
  );
}
