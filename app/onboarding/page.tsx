import type { Metadata } from "next";
import { OrgOnboarding } from "@/components/onboarding/org-onboarding";

export const metadata: Metadata = { title: "Set up your organization · Appcharge" };

/** Organization onboarding (/onboarding): after signing in, before the company exists. */
export default function OnboardingPage() {
  return <OrgOnboarding />;
}
