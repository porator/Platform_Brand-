"use client";

import { useParams, useSearchParams } from "next/navigation";
import { clientForProject, getProject, getEnvironment, sectionLabel } from "@/lib/newgen";
import { HomeBody, NotInTest, PlaceholderBody, UndocumentedBody } from "@/components/dashboard/bodies";
import { ModuleManagementBody, PaymentMethodsBody } from "@/components/dashboard/module-bodies";
import { ProjectHome } from "@/components/dashboard/project-home";
import { useWireframe } from "@/components/dashboard/providers";

/** Project-scoped section. The client is resolved from the project id. Home
 *  renders the overview; an undocumented project renders a graceful empty
 *  state; every other section renders a scaffold. Environment comes from ?env=. */
export default function ProjectSectionPage() {
  const params = useParams<{ projectId: string; section: string }>();
  const searchParams = useSearchParams();

  const client = clientForProject(params.projectId);
  const project = getProject(client, params.projectId);
  const env = getEnvironment(client, searchParams.get("env") ?? "production");
  const section = params.section ?? "home";
  const { wireframe } = useWireframe();

  if (project.undocumented) return <UndocumentedBody project={project} />;
  // Test mode: project Home is the next-steps page (R17 · R20); the full overview is outside the test.
  if (section === "home") return wireframe ? <ProjectHome project={project} /> : <HomeBody env={env} />;
  // Orders isn't part of this test: it says so (the Orders list and order page stay in components/orders).
  if (section === "orders") return <NotInTest page="Orders" />;
  if (section === "adm-modules") return <ModuleManagementBody project={project} />;
  if (section === "fin-payment-methods") return <PaymentMethodsBody project={project} />;
  return <PlaceholderBody section={sectionLabel(client, section)} project={project} env={env} />;
}
