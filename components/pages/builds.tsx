"use client";

import * as React from "react";
import { IconPlus } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { SearchAndFilter } from "@/components/patterns/search-filter";
import { AppFrame } from "./_frame";

export function BuildsPage() {
  return (
    <AppFrame
      sidebarActive="Projects"
      resource="builds"
      title="Builds"
      description="Compile, track and promote builds for Project Alpha in Production."
      actions={
        <Button size="sm">
          <IconPlus /> New build
        </Button>
      }
    >
      {/* The complete search + filter + builds table composition, reused as-is. */}
      <SearchAndFilter />
    </AppFrame>
  );
}
