"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  IconSettings,
  IconKey,
  IconBell,
  IconAdjustments,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldDescription, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

const SECTIONS = [
  { id: "general", label: "General", icon: IconSettings },
  { id: "access", label: "Access", icon: IconKey },
  { id: "notifications", label: "Notifications", icon: IconBell },
  { id: "advanced", label: "Advanced", icon: IconAdjustments },
];

export function SettingsPanel() {
  const [active, setActive] = React.useState("general");
  const [dirty, setDirty] = React.useState(false);
  const markDirty = () => setDirty(true);

  const save = () => {
    setDirty(false);
    toast.success("Settings saved");
  };
  const cancel = () => setDirty(false);

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex flex-col sm:flex-row">
        {/* Section nav */}
        <nav aria-label="Settings sections" className="shrink-0 border-b border-border p-2 sm:w-52 sm:border-b-0 sm:border-r">
          <ul className="flex gap-1 overflow-x-auto sm:flex-col">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActive(s.id)}
                  aria-current={active === s.id ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active === s.id
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <s.icon className="size-4" />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Section content */}
        <div className="min-w-0 flex-1 p-6">
          {active === "general" ? (
            <SettingsSection title="General" description="Basic details for this project.">
              <Field>
                <FieldLabel htmlFor="set-name">Project name</FieldLabel>
                <Input id="set-name" defaultValue="Project Alpha" onChange={markDirty} className="max-w-sm" />
              </Field>
              <Field>
                <FieldLabel htmlFor="set-region">Default region</FieldLabel>
                <Select items={{ us: "US East", eu: "EU West", ap: "Asia Pacific" }} defaultValue="us" onValueChange={markDirty}>
                  <SelectTrigger id="set-region" className="max-w-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">US East</SelectItem>
                    <SelectItem value="eu">EU West</SelectItem>
                    <SelectItem value="ap">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </SettingsSection>
          ) : active === "notifications" ? (
            <SettingsSection title="Notifications" description="Choose what you're emailed about.">
              {[
                ["Failed builds", "Get an email when a build fails.", true],
                ["New releases", "When a release is published.", false],
                ["Weekly summary", "A digest every Monday.", true],
              ].map(([label, desc, def]) => (
                <Field key={label as string} orientation="horizontal">
                  <FieldContent>
                    <FieldLabel>{label as string}</FieldLabel>
                    <FieldDescription>{desc as string}</FieldDescription>
                  </FieldContent>
                  <Switch defaultChecked={def as boolean} onCheckedChange={markDirty} aria-label={label as string} />
                </Field>
              ))}
            </SettingsSection>
          ) : active === "access" ? (
            <SettingsSection title="Access" description="Who can see and manage this project.">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Require 2-factor auth</FieldLabel>
                  <FieldDescription>Members must verify a code at sign-in.</FieldDescription>
                </FieldContent>
                <Switch defaultChecked onCheckedChange={markDirty} aria-label="Require 2-factor auth" />
              </Field>
            </SettingsSection>
          ) : (
            <SettingsSection title="Advanced" description="Expert options. Change with care.">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Debug logging</FieldLabel>
                  <FieldDescription>Verbose logs for troubleshooting.</FieldDescription>
                </FieldContent>
                <Switch onCheckedChange={markDirty} aria-label="Debug logging" />
              </Field>
            </SettingsSection>
          )}
        </div>
      </div>

      {/* Unsaved-changes footer */}
      {dirty ? (
        <div
          role="status"
          className="flex items-center justify-between gap-3 border-t border-border bg-muted/50 px-4 py-2.5"
        >
          <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={cancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={save}>
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Patterns"
        title="Settings"
        description={
          <>
            A sectioned settings surface — navigation on the side, a form in the content, and a
            save/cancel bar that appears only when there are unsaved changes.{" "}
            <strong className="text-foreground">When to use:</strong> any multi-section configuration
            screen. It composes Form & Controls with a section nav.
          </>
        }
      />

      <Section
        title="Anatomy"
        description="Switch sections on the left; edit fields on the right. Change any field to reveal the unsaved-changes bar, then Save or Cancel."
      >
        <SettingsPanel />
      </Section>

      <Section title="States">
        <A11yList
          items={[
            "Navigation — the active section is highlighted and marked aria-current.",
            "Clean — no unsaved-changes bar.",
            "Dirty — editing a field reveals the save/cancel bar.",
            "Saved — Save confirms with a toast and clears the dirty state.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The section list is a labelled <Mono>nav</Mono>; the active item uses{" "}
              <Mono>aria-current</Mono>.
            </>,
            "Each section has a heading; fields are labelled with descriptions where helpful.",
            "The unsaved-changes bar is a status region, announced when it appears.",
            "On mobile the section nav becomes a horizontally scrollable row above the form.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
