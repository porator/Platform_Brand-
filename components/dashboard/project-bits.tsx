"use client";

import * as React from "react";
import { IconBuildingStore, IconCreditCard, IconLink } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useDemo } from "@/components/dashboard/providers";
import { baseModules, MODULE_LABEL, type ClientConfig, type ModuleId, type Project } from "@/lib/newgen";

/** Small pieces shared by the scope selector (FolderSelector) and the All projects view. */

/** A project's game icon, or its initials when it has none. */
export function ProjectChip({ initials, icon, className }: { initials: string; icon?: string; className?: string }) {
  if (icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" className={cn("size-5 shrink-0 rounded-[5px] object-cover", className)} />;
  }
  return (
    <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-muted text-[9px] font-semibold text-muted-foreground", className)}>
      {initials}
    </span>
  );
}

export const MODULE_ICON: Record<ModuleId, React.ComponentType<{ className?: string }>> = {
  webstore: IconBuildingStore,
  "payment-links": IconLink,
  "direct-checkout": IconCreditCard,
};

/** Usability test: every module of a project as its own chip on the project's one row (icon + name). The chips are
 *  labels, not destinations: no hover, no check, no menu, so picking the project is the only choice in the row. */
export function ModuleBadge({ modules }: { modules: ModuleId[] }) {
  if (!modules.length) return null;
  return (
    <span className="flex flex-wrap items-center gap-1" aria-label={`Modules: ${modules.map((m) => MODULE_LABEL[m]).join(", ")}`}>
      {modules.map((m) => {
        const Icon = MODULE_ICON[m] ?? IconBuildingStore;
        return (
          <span key={m} className="pointer-events-none flex items-center gap-1 rounded px-1.5 py-px text-[11px] leading-4 whitespace-nowrap text-muted-foreground ring-1 ring-border" aria-hidden>
            <Icon className="size-3" />
            {MODULE_LABEL[m]}
          </span>
        );
      })}
    </span>
  );
}

/** A project's modules now: what it was created with, plus any added later. */
export function useModulesOf() {
  const { createdModules, added } = useDemo();
  return React.useCallback(
    (p: Project): ModuleId[] => {
      const base = createdModules[p.id] ?? baseModules(p);
      return [...base, ...(added[p.id] ?? []).filter((m) => !base.includes(m))];
    },
    [createdModules, added],
  );
}

/** Company badge colours by company (default: the brand blue). King: its gold. */
const COMPANY_MARK_BG: Record<string, string> = { King: "linear-gradient(180deg, #FFC93C 0%, #F5A000 100%)" };

/** The company's mark (breadcrumb, Folders & projects): a round badge with its initials, in the company's colour. */
export function CompanyMark({ client, className }: { client: ClientConfig; className?: string }) {
  const initials = client.company.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn("flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[9px] font-semibold text-white", className)}
      style={COMPANY_MARK_BG[client.company.name] ? { background: COMPANY_MARK_BG[client.company.name] } : undefined}
    >
      {initials}
    </span>
  );
}
