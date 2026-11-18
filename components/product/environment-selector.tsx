"use client";

import * as React from "react";
import { IconSelector, IconCheck, IconCircleFilled } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PageShell, PageHeader, Section, Row, A11yList } from "@/components/atoms/_kit";
import { ENVIRONMENTS, envTone, type EnvStatus } from "./_data";

const STATUS_LABEL: Record<EnvStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  offline: "Offline",
};

export function EnvironmentSelector({
  value,
  onValueChange,
  id,
  className,
}: {
  value: string;
  onValueChange?: (id: string) => void;
  id?: string;
  className?: string;
}) {
  const current = ENVIRONMENTS.find((e) => e.id === value) ?? ENVIRONMENTS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            id={id}
            variant="outline"
            size="sm"
            aria-label="Select environment"
            className={cn("gap-2 font-medium", className)}
          />
        }
      >
        <IconCircleFilled className={cn("size-2.5", envTone(current.status))} aria-hidden />
        {current.name}
        <IconSelector className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Environment</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ENVIRONMENTS.map((e) => (
          <DropdownMenuItem key={e.id} onClick={() => onValueChange?.(e.id)} className="gap-2.5">
            <IconCircleFilled className={cn("size-2.5", envTone(e.status))} aria-hidden />
            <div className="flex-1 leading-tight">
              <div className="text-sm">{e.name}</div>
              <div className="text-xs text-muted-foreground">{STATUS_LABEL[e.status]}</div>
            </div>
            {e.id === value ? <IconCheck className="size-4" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EnvironmentSelectorPage() {
  const [env, setEnv] = React.useState("production");
  return (
    <PageShell>
      <PageHeader
        eyebrow="Product Components"
        title="Environment Selector"
        description={
          <>
            Switches the active <strong className="text-foreground">environment</strong> within a
            project — the level below Project in the hierarchy. Each environment carries a semantic
            status so you can see health at a glance.
          </>
        }
      />

      <Section
        title="Default"
        description="The active environment with a status dot; open to switch. Status tones use the success / warning / muted tokens."
      >
        <Row label="Selector">
          <EnvironmentSelector value={env} onValueChange={setEnv} />
        </Row>
      </Section>

      <Section
        title="Status treatment"
        description="Production is operational (success), Staging degraded (warning), Development offline (muted) — reinforced with a label, never color alone."
      >
        <Row label="Statuses" className="gap-5">
          {ENVIRONMENTS.map((e) => (
            <span key={e.id} className="inline-flex items-center gap-2 text-sm">
              <IconCircleFilled className={cn("size-2.5", envTone(e.status))} aria-hidden />
              {e.name}
              <span className="text-muted-foreground">· {STATUS_LABEL[e.status]}</span>
            </span>
          ))}
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "A labelled menu button with the current environment and its status.",
            "Keyboard operable — open with Enter/Space, Arrows move, Esc closes and restores focus.",
            "Status is conveyed by a dot and a text label, meeting AA in both themes.",
            "Sits below the Project Selector in the hierarchy — Company → Project → Environment.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
