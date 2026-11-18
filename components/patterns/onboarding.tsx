"use client";

import * as React from "react";
import { IconLoader2, IconCircleCheck } from "@/lib/icons";
import { Stepper, type Step } from "@/components/navigation/stepper";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PageShell, PageHeader, Section, A11yList } from "@/components/atoms/_kit";

const STEP_LABELS = ["Welcome", "Configure", "Review", "Complete"];

export function OnboardingWizard() {
  const [index, setIndex] = React.useState(0);
  const [finishing, setFinishing] = React.useState(false);
  const [name, setName] = React.useState("Project Alpha");
  const [environment, setEnvironment] = React.useState("production");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const steps: Step[] = STEP_LABELS.map((title, i) => ({
    title,
    state: i < index ? "completed" : i === index ? "current" : "upcoming",
  }));

  const next = () => {
    if (index === 2) {
      setFinishing(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setFinishing(false);
        setIndex(3);
      }, 1200);
      return;
    }
    setIndex((i) => Math.min(i + 1, 3));
  };
  const back = () => setIndex((i) => Math.max(i - 1, 0));
  const restart = () => setIndex(0);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Stepper steps={steps} />

      {index === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to New Gen Wire</CardTitle>
            <CardDescription>Let&apos;s set up your first project in a few steps.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You&apos;ll name your project, pick an environment, review, and you&apos;re done.
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={next}>Get started</Button>
          </CardFooter>
        </Card>
      ) : index === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Configure your project</CardTitle>
            <CardDescription>You can change these later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field>
              <FieldLabel htmlFor="ob-name">Project name</FieldLabel>
              <Input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
            </Field>
            <Field>
              <FieldLabel htmlFor="ob-env">Environment</FieldLabel>
              <Select
                items={{ production: "Production", staging: "Staging", development: "Development" }}
                value={environment}
                onValueChange={(v) => v && setEnvironment(v)}
              >
                <SelectTrigger id="ob-env" className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={back}>
              Back
            </Button>
            <Button onClick={next}>Continue</Button>
          </CardFooter>
        </Card>
      ) : index === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>Confirm your project details.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">Project name</dt>
                <dd className="font-medium text-foreground">{name}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">Environment</dt>
                <dd className="font-medium capitalize text-foreground">{environment}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={back} disabled={finishing}>
              Back
            </Button>
            <Button onClick={next} disabled={finishing}>
              {finishing ? (
                <>
                  <IconLoader2 className="animate-spin" /> Creating…
                </>
              ) : (
                "Create project"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert variant="success">
              <IconCircleCheck />
              <AlertTitle>You&apos;re all set</AlertTitle>
              <AlertDescription>“{name}” is ready in {environment}.</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={restart}>
              Start over
            </Button>
            <Button>Go to dashboard</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export function OnboardingPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Patterns"
        title="Onboarding"
        description={
          <>
            A guided, multi-step flow for first-time setup — progress is always visible and each step
            is focused. <strong className="text-foreground">When to use:</strong> initial setup or any
            linear wizard. It composes Stepper, Card, Form Controls, Button and Alert.
          </>
        }
      />

      <Section
        title="Anatomy"
        description="A Stepper tracks progress; each step is a focused Card. Walk through Welcome → Configure → Review → Complete; the Review step shows a loading state before completion."
      >
        <div className="rounded-md border border-border p-6">
          <OnboardingWizard />
        </div>
      </Section>

      <Section title="States">
        <A11yList
          items={[
            "Current step — highlighted in the Stepper; only its content is shown.",
            "Completed steps — marked done as the user advances.",
            "Loading — the final submit shows progress before completion.",
            "Complete — a success summary with a clear next action.",
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The Stepper is an ordered list labelled &quot;Progress&quot;; step status is conveyed by
              icon and text.
            </>,
            "Each step has a heading; form fields are labelled.",
            "Primary and back actions are clearly separated and keyboard-reachable.",
            "The completion summary is an alert, announced when reached; the layout stays single-column on mobile.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
