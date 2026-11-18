"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { clientForProject, getClient, getProject, type ClientConfig, type Project } from "@/lib/newgen";

/** Whose brand the Brand DNA wears: the organization's, or the project's. */
export type BrandContext = {
  contextType: "organization" | "project";
  contextId: string;
  name: string;
  /** A defined palette (the company's brand colours, or the project's store colours). */
  brandColors?: string[];
  /** Brand art the palette can be read from (a project's app icon). */
  brandIcon?: string;
};

export function projectBrand(project: Project): BrandContext {
  return { contextType: "project", contextId: project.id, name: project.game, brandColors: project.storeColors, brandIcon: project.gameIcon };
}

export function organizationBrand(client: ClientConfig): BrandContext {
  // The organization's own palette only: never its projects' colours.
  return { contextType: "organization", contextId: client.id, name: client.company.name, brandColors: client.company.brandColors };
}

/**
 * The active brand context, read from the same navigation the dashboard uses (shell.tsx): /dashboard/company is the
 * organization (whose client rides ?client=), /dashboard/<projectId> is a project. Pass the page's project when it
 * has one; a project made in this session (Create project) isn't in the static data the route resolves against.
 */
export function useBrandContext(project?: Project): BrandContext {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (project) return projectBrand(project);
  const segment = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean)[0];
  if (!segment || segment === "company") return organizationBrand(getClient(searchParams.get("client")));
  const client = clientForProject(segment);
  return projectBrand(getProject(client, segment));
}
