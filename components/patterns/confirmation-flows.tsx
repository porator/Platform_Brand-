"use client";

import * as React from "react";
import { toast } from "sonner";
import { IconLoader2, IconAlertOctagon } from "@/lib/icons";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/feedback/confirmation";
import { PageShell, PageHeader, Section, Row, Mono, A11yList } from "@/components/atoms/_kit";

/**
 * A confirmation workflow that performs async work — shows a loading state and,
 * on failure, an inline error with retry. Built from the AlertDialog primitives
 * (the Phase-7 Confirmation handles the simple synchronous case).
 */
export function AsyncConfirm({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  run,
}: {
  trigger: React.ReactElement;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  run: () => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");

  const handle = async () => {
    setStatus("loading");
    try {
      await run();
      setStatus("idle");
      setOpen(false);
    } catch {
      setStatus("error");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next);
        if (!next) setStatus("idle");
      }}
    >
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {status === "error" ? (
          <Alert variant="destructive">
            <IconAlertOctagon />
            <AlertTitle>That didn&apos;t work</AlertTitle>
            <AlertDescription>The action failed. You can try again.</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={status === "loading"}>Cancel</AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handle}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <IconLoader2 className="animate-spin" /> Working…
              </>
            ) : status === "error" ? (
              "Retry"
            ) : (
              confirmLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Guard an action behind an unsaved-changes check. */
function UnsavedGuard() {
  const [dirty, setDirty] = React.useState(true);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch id="cf-dirty" checked={dirty} onCheckedChange={setDirty} />
        <Label htmlFor="cf-dirty">Has unsaved changes</Label>
      </div>
      {dirty ? (
        <ConfirmDialog
          destructive
          trigger={<Button variant="outline">Leave page</Button>}
          title="Leave without saving?"
          description="You have unsaved changes. If you leave now, they will be lost."
          confirmLabel="Leave"
          cancelLabel="Stay"
          onConfirm={() => {
            setDirty(false);
            toast("Left the page");
          }}
        />
      ) : (
        <Button variant="outline" onClick={() => toast("Left the page")}>
          Leave page
        </Button>
      )}
    </div>
  );
}

const wait = (ok: boolean) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (ok ? resolve() : reject()), 1200));

export function ConfirmationFlowsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Patterns"
        title="Confirmation Flows"
        description={
          <>
            Workflows built on the Confirmation component for the moments that need a deliberate
            check — delete, publish, discard, and leaving an unsaved page.{" "}
            <strong className="text-foreground">When to use:</strong> before any consequential or
            irreversible action. These compose Confirmation, async feedback and Alert.
          </>
        }
      />

      <Section
        title="Simple confirmations"
        description="Synchronous yes/no decisions, routed through the Phase-7 Confirmation component."
      >
        <Row label="Neutral & destructive" className="gap-2">
          <ConfirmDialog
            trigger={<Button>Publish release</Button>}
            title="Publish this release?"
            description="It will serve live traffic immediately."
            confirmLabel="Publish"
            onConfirm={() => toast.success("Release published")}
          />
          <ConfirmDialog
            destructive
            trigger={<Button variant="destructive">Delete build</Button>}
            title="Delete build #124?"
            description="This permanently removes the build. This can't be undone."
            confirmLabel="Delete"
            onConfirm={() => toast.success("Build deleted")}
          />
        </Row>
      </Section>

      <Section
        title="Async confirmation (loading · error · success)"
        description="When the action is a request, the dialog stays open to show progress — and an inline error with retry if it fails."
      >
        <Row label="Async" className="gap-2">
          <AsyncConfirm
            trigger={<Button variant="outline">Promote (succeeds)</Button>}
            title="Promote to Production?"
            description="This build will serve live traffic."
            confirmLabel="Promote"
            run={async () => {
              await wait(true);
              toast.success("Promoted to Production");
            }}
          />
          <AsyncConfirm
            destructive
            trigger={<Button variant="outline">Delete (fails)</Button>}
            title="Delete project?"
            description="This permanently removes the project and its data."
            confirmLabel="Delete"
            run={async () => {
              await wait(false);
            }}
          />
        </Row>
      </Section>

      <Section
        title="Discard / leave unsaved"
        description="Guard navigation when there are unsaved changes — toggle the state, then try to leave."
      >
        <UnsavedGuard />
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              All flows use <Mono>role=&quot;alertdialog&quot;</Mono> with a trapped focus and a clear
              cancel.
            </>,
            "Async flows disable actions while working and surface failures as an in-dialog alert.",
            "Destructive confirms use the destructive token and an explicit verb, never an icon alone.",
            "Outcomes are announced via toast or an alert region.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
