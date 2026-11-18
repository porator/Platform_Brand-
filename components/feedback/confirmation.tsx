"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: {
  trigger: React.ReactElement;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ConfirmationPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Confirmation"
        description={
          <>
            A deliberate check before a consequential action — the shadcn <Mono>AlertDialog</Mono>.
            Unlike a Modal, it is narrowly scoped to a yes/no decision and always keeps focus until
            the user chooses. Use it for destructive or irreversible actions.
          </>
        }
      />

      <Section
        title="Destructive confirmation"
        description="The canonical pattern — confirm before deleting. The confirm action is clearly destructive."
      >
        <Row label="Delete">
          <ConfirmDialog
            destructive
            trigger={<Button variant="destructive">Delete project</Button>}
            title="Delete Project Alpha?"
            description="This permanently removes the project, its builds and releases. This action cannot be undone."
            confirmLabel="Delete project"
            cancelLabel="Cancel"
            onConfirm={() => toast.success("Project deleted")}
          />
        </Row>
      </Section>

      <Section
        title="Non-destructive confirmation"
        description="Also useful for significant but safe actions — a positive confirm instead of destructive."
      >
        <Row label="Promote">
          <ConfirmDialog
            trigger={<Button>Promote to Production</Button>}
            title="Promote build #124 to Production?"
            description="This build will serve live traffic immediately. You can roll back from the releases page."
            confirmLabel="Promote"
            onConfirm={() => toast.success("Promoting to Production…")}
          />
        </Row>
      </Section>

      <Section
        title="Reusable component"
        description="One ConfirmDialog wraps any trigger, so product code asks for confirmation consistently."
      >
        <Row label="Any trigger" className="gap-2">
          <ConfirmDialog
            destructive
            trigger={<Button variant="outline" size="sm">Archive</Button>}
            title="Archive this release?"
            description="Archived releases are hidden from the list but can be restored later."
            confirmLabel="Archive"
            onConfirm={() => toast("Release archived")}
          />
          <ConfirmDialog
            trigger={<Button variant="outline" size="sm">Reset environment</Button>}
            title="Reset Staging?"
            description="This clears all builds in Staging and starts fresh."
            confirmLabel="Reset"
            onConfirm={() => toast("Environment reset")}
          />
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Uses <Mono>role=&quot;alertdialog&quot;</Mono>, so assistive tech announces it as an
              important interruption.
            </>,
            "Focus is trapped until the user confirms or cancels; it does not dismiss on outside click.",
            "The destructive action uses the destructive token and a clear verb label — never just an icon.",
            "Cancel is always present and reachable; Esc cancels.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
