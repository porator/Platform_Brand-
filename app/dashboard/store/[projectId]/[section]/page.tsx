"use client";

import { useParams } from "next/navigation";
import { IconBuildingStore } from "@/lib/icons";
import { clientForProject, sectionLabel } from "@/lib/newgen";
import { EmptyState } from "@/components/data/empty-state";

/** A store section. The nav + environment selector live in the layout. */
export default function StoreSectionPage() {
  const params = useParams();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : (params.projectId ?? "");
  const section = Array.isArray(params.section) ? params.section[0] : (params.section ?? "");
  const client = clientForProject(projectId);
  const label = sectionLabel(client, section);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{label}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Store · {label}</p>
      <div className="mt-8">
        <EmptyState
          icon={<IconBuildingStore className="size-5" />}
          title={`${label}`}
          description="This page isn't built in the prototype yet."
        />
      </div>
    </div>
  );
}
