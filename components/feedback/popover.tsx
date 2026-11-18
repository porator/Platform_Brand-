"use client";

import * as React from "react";
import { IconInfoCircle } from "@/lib/icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function PopoverPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Popover"
        description={
          <>
            A floating panel anchored to a trigger — the shadcn <Mono>Popover</Mono>. Unlike a
            Tooltip, a popover can hold rich, interactive content: details, quick forms, or a small
            menu. It traps focus while open and dismisses on Esc or outside click.
          </>
        }
      />

      <Section title="Basic usage" description="A trigger that opens a small panel of content.">
        <Row label="Default">
          <Popover>
            <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Environment</PopoverTitle>
                <PopoverDescription>
                  Production serves live traffic. Changes take effect immediately.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </Row>
      </Section>

      <Section
        title="With a form"
        description="Popovers are ideal for a focused inline edit — rename, filter, quick settings."
      >
        <Row label="Quick edit">
          <Popover>
            <PopoverTrigger render={<Button variant="outline">Rename project</Button>} />
            <PopoverContent className="w-72">
              <PopoverHeader>
                <PopoverTitle>Rename project</PopoverTitle>
              </PopoverHeader>
              <div className="grid gap-2">
                <Label htmlFor="pop-name">Project name</Label>
                <Input id="pop-name" defaultValue="Project Alpha" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Save</Button>
              </div>
            </PopoverContent>
          </Popover>
        </Row>
      </Section>

      <Section title="Placements" description="Anchor on any side; the popover flips to stay on screen.">
        <Row label="Sides" className="gap-3">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Popover key={side}>
              <PopoverTrigger render={<Button variant="outline" size="sm" className="capitalize">{side}</Button>} />
              <PopoverContent side={side} className="w-48">
                <div className="flex items-center gap-2 text-sm">
                  <IconInfoCircle className="size-4 text-muted-foreground" />
                  Opens to the {side}.
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "Opens on click; focus moves into the panel and returns to the trigger on close.",
            "Dismisses on Esc or an outside click; the trigger exposes its expanded state.",
            "Interactive content (inputs, buttons) is fully keyboard operable inside the panel.",
            "The panel flips and never overflows the viewport on small screens.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
