"use client";

import { AssistantProvider } from "@/components/dashboard/assistant-drawer";
import { CreateProjectModalProvider } from "@/components/dashboard/create-project-modal";
import { AddModuleModalProvider } from "@/components/dashboard/add-module-modal";
import * as React from "react";
import { usePathname } from "next/navigation";
import { hasStarted, markStarted } from "@/lib/usability-session";
import { DashboardProviders } from "@/components/dashboard/providers";
import { DashboardShell } from "@/components/dashboard/shell";
import { SignInReveal } from "@/components/auth/sign-in-transition";
import { applyOrganization, readOrganization } from "@/lib/organization";

/** The organization from onboarding (session), as a string snapshot: "" on the server and before onboarding. */
const noSubscribe = () => () => {};
const orgSnapshot = () => {
  const o = readOrganization();
  return o ? JSON.stringify(o) : "";
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The organization set up in onboarding: written into the company record before anything renders, and the
  // dashboard keyed on it, so after a refresh it re-renders with your organization instead of the sample one.
  const org = React.useSyncExternalStore(noSubscribe, orgSnapshot, () => "");
  if (org) applyOrganization(JSON.parse(org));
  // No intro: every dashboard page opens directly (a refresh or a shared link no longer starts over).
  if (!hasStarted()) markStarted();
  // The Settings and Store areas have their own two-pane chrome, and project
  // creation is a focused full-page flow, so they opt out of the main shell.
  const standalone =
    (pathname?.startsWith("/dashboard/settings") ||
      pathname?.startsWith("/dashboard/store") ||
      pathname?.startsWith("/dashboard/create-project") ||
      pathname?.startsWith("/dashboard/review")) ??
    false;
  return (
    <DashboardProviders key={org ? "org" : "sample"}>
      {/* Right after signing in: the sign-in scene, full screen, dissolving to reveal the dashboard. */}
      <SignInReveal />
      {/* Suspense boundary for URL-driven chrome (useSearchParams). */}
      <React.Suspense fallback={null}>
        {/* From the dashboard, Create project opens in a dialog over the page (onboarding keeps its full page). */}
        <CreateProjectModalProvider>
          {/* Add module opens the same kind of dialog, on the modules step with that module checked. */}
          <AddModuleModalProvider>
          {standalone ? (
            children
          ) : (
            // The AI assistant docks into the workspace as a drawer (opened from the Ask AI bar).
            <AssistantProvider>
              <DashboardShell>{children}</DashboardShell>
            </AssistantProvider>
          )}
          </AddModuleModalProvider>
        </CreateProjectModalProvider>
        {/* Start on the intro lands straight on the dashboard: no "How do you want to start?" screen for now
            (components/usability/start-choice.tsx is kept to bring back). */}
      </React.Suspense>
    </DashboardProviders>
  );
}
