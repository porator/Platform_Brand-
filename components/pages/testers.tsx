"use client";

import * as React from "react";
import { TesterList } from "@/components/product/tester-list";
import { AppFrame } from "./_frame";

export function TestersPage() {
  return (
    <AppFrame
      sidebarActive="Projects"
      resource="testers"
      title="Testers"
      description="The people who can test builds for Project Alpha in Production."
    >
      {/* The Tester List product component (search, selection, bulk actions), reused as-is. */}
      <TesterList />
    </AppFrame>
  );
}
