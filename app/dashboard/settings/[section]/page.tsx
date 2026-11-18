"use client";

import { useParams, useSearchParams } from "next/navigation";
import { IconSettings } from "@/lib/icons";
import { getClient, sectionLabel } from "@/lib/newgen";
import { EmptyState } from "@/components/data/empty-state";

/** A settings section. The nav + "Back to dashboard" live in the layout. */
export default function SettingsSectionPage() {
  const params = useParams();
  const client = getClient(useSearchParams().get("client"));
  const section = Array.isArray(params.section) ? params.section[0] : (params.section ?? "admin-general");
  const label = sectionLabel(client, section);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{label}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{client.company.name} · Settings</p>
      <div className="mt-8">
        <EmptyState
          icon={<IconSettings className="size-5" />}
          title={`${label} settings`}
          description="This page isn't built in the prototype yet."
        />
      </div>
    </div>
  );
}
