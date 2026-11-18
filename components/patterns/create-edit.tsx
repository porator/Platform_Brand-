"use client";

import * as React from "react";
import { IconLoader2, IconCircleCheck, IconAlertOctagon } from "@/lib/icons";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

type Status = "idle" | "loading" | "success" | "error";

/** A reusable create/edit form with validation, loading, success and error. */
export function CreateProjectForm() {
  const [name, setName] = React.useState("");
  const [environment, setEnvironment] = React.useState("production");
  const [platform, setPlatform] = React.useState("ios");
  const [description, setDescription] = React.useState("");
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Project name is required.");
      return;
    }
    setNameError(null);
    setStatus("loading");
    clearTimeout(timer.current);
    // Simulate a request: names containing "fail" error, others succeed.
    timer.current = setTimeout(() => {
      setStatus(name.toLowerCase().includes("fail") ? "error" : "success");
    }, 1200);
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-5" noValidate>
      {status === "success" ? (
        <Alert variant="success">
          <IconCircleCheck />
          <AlertTitle>Project created</AlertTitle>
          <AlertDescription>“{name}” is ready. You can now add an environment.</AlertDescription>
        </Alert>
      ) : null}
      {status === "error" ? (
        <Alert variant="destructive">
          <IconAlertOctagon />
          <AlertTitle>Couldn&apos;t create project</AlertTitle>
          <AlertDescription>Something went wrong. Check the details and try again.</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={!!nameError || undefined}>
          <FieldLabel htmlFor="ce-name">
            Project name{" "}
            <span className="text-destructive" aria-hidden>
              *
            </span>
          </FieldLabel>
          <Input
            id="ce-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Project Delta"
            aria-invalid={!!nameError || undefined}
            aria-describedby={nameError ? "ce-name-err" : undefined}
            required
          />
          {nameError ? (
            <FieldError id="ce-name-err">{nameError}</FieldError>
          ) : (
            <FieldDescription>Shown across the dashboard. Tip: include “fail” to see the error state.</FieldDescription>
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="ce-env">Environment</FieldLabel>
            <Select
              items={{ production: "Production", staging: "Staging", development: "Development" }}
              value={environment}
              onValueChange={(v) => v && setEnvironment(v)}
            >
              <SelectTrigger id="ce-env" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="ce-platform">Platform</FieldLabel>
            <Select
              items={{ ios: "iOS", android: "Android", web: "Web" }}
              value={platform}
              onValueChange={(v) => v && setPlatform(v)}
            >
              <SelectTrigger id="ce-platform" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="ce-desc">
            Description <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Textarea
            id="ce-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short summary of this project."
            className="min-h-20"
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={status === "loading"}>
          Cancel
        </Button>
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <IconLoader2 className="animate-spin" /> Creating…
            </>
          ) : (
            "Create project"
          )}
        </Button>
      </div>
    </form>
  );
}

export function CreateEditPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Patterns"
        title="Create / Edit"
        description={
          <>
            The standard form workflow for creating or editing a record — fields, validation,
            submission feedback. <strong className="text-foreground">When to use:</strong> any
            create or edit flow. It composes Form Field, Input, Select, Button and Alert.
          </>
        }
      />

      <Section
        title="Anatomy"
        description="A labelled form with a required field, grouped selects, an optional textarea, and submit feedback. Submit empty to see validation; submit to see loading → success; include “fail” in the name to see the error state."
      >
        <div className="rounded-md border border-border p-6">
          <CreateProjectForm />
        </div>
      </Section>

      <Section title="States">
        <A11yList
          items={[
            "Default — an empty, ready form.",
            "Validation — inline field errors block submit until resolved.",
            "Loading — the submit button shows progress and disables actions.",
            "Success / error — a summary Alert confirms the outcome at the top of the form.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Every field is labelled; errors use <Mono>aria-invalid</Mono> +{" "}
              <Mono>aria-describedby</Mono> and render in a <Mono>role=&quot;alert&quot;</Mono>.
            </>,
            "The success/error summary is an alert, announced when it appears.",
            "Required is marked in text and with the native required attribute.",
            "Actions disable during submission to prevent double-submits; the form reflows to one column on mobile.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
