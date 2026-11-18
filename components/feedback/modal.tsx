"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function ModalPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Modal"
        description={
          <>
            A focused overlay that interrupts the flow for a single task — the shadcn{" "}
            <Mono>Dialog</Mono>. It dims the page, traps focus, and must be dismissed deliberately.
            Reserve it for tasks that need the user&apos;s full attention.
          </>
        }
      />

      <Section title="Basic usage" description="A title, description and footer actions.">
        <Row label="Default">
          <Dialog>
            <DialogTrigger render={<Button>Open dialog</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a tester</DialogTitle>
                <DialogDescription>
                  They&apos;ll get access to builds in this environment.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button>Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
      </Section>

      <Section
        title="With a form"
        description="A common pattern — a short form inside the dialog, submitted from the footer."
      >
        <Row label="Create">
          <Dialog>
            <DialogTrigger render={<Button variant="outline">New project</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
                <DialogDescription>Give your project a name to get started.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="m-name">Project name</Label>
                  <Input id="m-name" placeholder="e.g. Project Delta" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-slug">Slug</Label>
                  <Input id="m-slug" placeholder="project-delta" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
      </Section>

      <Section title="Sizes" description="Constrain the width to the content.">
        <Row label="Scale" className="gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm">Small</Button>} />
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Small dialog</DialogTitle>
                <DialogDescription>For a quick confirmation or a single field.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button>Done</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm">Large</Button>} />
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Large dialog</DialogTitle>
                <DialogDescription>For richer content or a multi-column form.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button>Done</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
      </Section>

      <Section title="Scrollable" description="Long content scrolls within the dialog; header and footer stay put.">
        <Row label="Overflow">
          <Dialog>
            <DialogTrigger render={<Button variant="outline">Release notes</Button>} />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Release notes · v2.4.1</DialogTitle>
                <DialogDescription>Everything included in this release.</DialogDescription>
              </DialogHeader>
              <div className="max-h-72 space-y-3 overflow-y-auto text-sm text-muted-foreground">
                {Array.from({ length: 12 }).map((_, i) => (
                  <p key={i}>
                    Change #{i + 1} — improved build caching and reduced cold-start time across
                    environments.
                  </p>
                ))}
              </div>
              <DialogFooter>
                <DialogClose render={<Button>Close</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Uses <Mono>role=&quot;dialog&quot;</Mono> with <Mono>aria-modal</Mono>; the title and
              description name and describe it.
            </>,
            "Focus moves into the dialog on open, is trapped within it, and returns to the trigger on close.",
            "Dismisses on Esc, the close button, or an outside click.",
            "The dimmed backdrop makes the modal context obvious; content scrolls without losing the header.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
