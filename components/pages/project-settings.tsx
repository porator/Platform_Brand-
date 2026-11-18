"use client";

import * as React from "react";
import { SettingsPanel } from "@/components/patterns/settings";
import { AppFrame, Subsection } from "./_frame";

export function ProjectSettingsPage() {
  return (
    <AppFrame
      sidebarActive="Projects"
      resource="settings"
      title="Settings"
      description="Configuration for Project Alpha — general details, access, notifications and advanced options."
    >
      {/* The Settings pattern (section nav + fields + unsaved-changes footer), reused as-is. */}
      <Subsection title="Project configuration">
        <SettingsPanel />
      </Subsection>
    </AppFrame>
  );
}
