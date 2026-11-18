"use client";

import * as React from "react";
import { IconPlus } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/form/search";
import { EmptyState } from "@/components/data/empty-state";
import { ReleaseCard } from "@/components/product/release-card";
import { RELEASES } from "@/components/product/_data";
import { AppFrame, Subsection } from "./_frame";

export function ReleasesPage() {
  const [query, setQuery] = React.useState("");

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASES.filter((r) => !q || `${r.version} ${r.status} ${r.environment}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <AppFrame
      sidebarActive="Projects"
      resource="releases"
      title="Releases"
      description="Versioned releases for Project Alpha in Production — their status, build and testers."
      actions={
        <Button size="sm">
          <IconPlus /> New release
        </Button>
      }
      contentClassName="flex flex-col gap-4"
    >
      <Subsection title={`All releases (${RELEASES.length})`}>
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Search releases…"
          className="sm:max-w-xs"
        />
        {results.length === 0 ? (
          <EmptyState
            title="No releases match"
            description="Try a different search term."
            primaryAction={
              <Button size="sm" variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((r) => (
              <ReleaseCard key={r.version} release={r} />
            ))}
          </div>
        )}
      </Subsection>
    </AppFrame>
  );
}
