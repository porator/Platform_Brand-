"use client";

import * as React from "react";
import { IconChevronDown, IconX, IconDotsVertical } from "@/lib/icons";
import { PageShell, PageHeader, Section, Mono } from "./_kit";

const PRINCIPLES: { interaction: string; duration: string; easing: string; purpose: string }[] = [
  { interaction: "Hover / color", duration: "150ms", easing: "ease (default)", purpose: "Immediate feedback on intent" },
  { interaction: "Focus ring", duration: "150ms", easing: "ease-out", purpose: "Show keyboard position" },
  { interaction: "Expand / collapse", duration: "300ms", easing: "ease-out", purpose: "Reveal without losing place" },
  { interaction: "Dropdown / popover", duration: "200ms", easing: "ease-out", purpose: "Anchor appears from trigger" },
  { interaction: "Modal / dialog", duration: "300ms", easing: "ease-out", purpose: "Shift focus to a new layer" },
  { interaction: "Tooltip", duration: "150ms", easing: "ease-out", purpose: "Lightweight, transient hint" },
];

function DemoCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col border border-border bg-card text-card-foreground">
      <div className="flex min-h-36 flex-1 items-center justify-center p-6">{children}</div>
      <div className="border-t border-border px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

export function MotionPage() {
  const [open, setOpen] = React.useState(false); // collapse
  const [menu, setMenu] = React.useState(false); // dropdown
  const [modal, setModal] = React.useState(false);

  return (
    <PageShell>
      <PageHeader
        title="Motion"
        description={
          <>
            Motion is <strong className="text-foreground">subtle, fast and purposeful</strong>.
            Transitions clarify a change of state — they never decorate. Durations stay short and
            easing favors <Mono>ease-out</Mono>, matching the restrained shadcn aesthetic.
          </>
        }
      />

      <Section
        title="Principles"
        description="Consistent timing and easing across every interaction."
      >
        <div className="overflow-hidden border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-2.5 font-medium">Interaction</th>
                <th className="px-4 py-2.5 font-medium">Duration</th>
                <th className="px-4 py-2.5 font-medium">Easing</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PRINCIPLES.map((p) => (
                <tr key={p.interaction}>
                  <td className="px-4 py-2.5 text-foreground">{p.interaction}</td>
                  <td className="px-4 py-2.5"><Mono className="text-muted-foreground">{p.duration}</Mono></td>
                  <td className="px-4 py-2.5"><Mono className="text-muted-foreground">{p.easing}</Mono></td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{p.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Live examples" description="Interact with each surface to feel the timing.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Hover */}
          <DemoCard title="Hover" hint="transition-colors · 150ms">
            <button className="inline-flex h-9 items-center bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/85">
              Hover me
            </button>
          </DemoCard>

          {/* Focus */}
          <DemoCard title="Focus" hint="Tab in · ring appears over 150ms">
            <input
              aria-label="Focus demo"
              placeholder="Focus me"
              className="h-9 w-40 border border-input bg-background px-3 text-sm text-foreground outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </DemoCard>

          {/* Expand / collapse */}
          <DemoCard title="Expand / collapse" hint="grid-rows · 300ms ease-out">
            <div className="w-full">
              <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                Details
                <IconChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <p className="border border-t-0 border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Hidden content that reveals smoothly without a layout jump.
                  </p>
                </div>
              </div>
            </div>
          </DemoCard>

          {/* Dropdown */}
          <DemoCard title="Dropdown" hint="animate-in fade + slide · 200ms">
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                aria-expanded={menu}
                className="inline-flex h-9 items-center gap-1.5 border border-input bg-background px-3 text-sm text-foreground"
              >
                Actions
                <IconDotsVertical size={15} className="text-muted-foreground" />
              </button>
              {menu ? (
                <div className="absolute left-0 top-full z-10 mt-1 w-40 origin-top border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200">
                  {["Rename", "Duplicate", "Delete"].map((x) => (
                    <button
                      key={x}
                      onClick={() => setMenu(false)}
                      className="block w-full px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {x}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </DemoCard>

          {/* Tooltip */}
          <DemoCard title="Tooltip" hint="group-hover fade · 150ms">
            <span className="group relative inline-flex">
              <span className="inline-flex h-9 cursor-default items-center border border-input bg-background px-4 text-sm text-foreground">
                Hover for hint
              </span>
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap border border-border bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                Helpful hint
              </span>
            </span>
          </DemoCard>

          {/* Modal */}
          <DemoCard title="Modal" hint="backdrop + zoom · 300ms ease-out">
            <button
              onClick={() => setModal(true)}
              className="inline-flex h-9 items-center bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Open dialog
            </button>
          </DemoCard>
        </div>
      </Section>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in-0 duration-200"
            onClick={() => setModal(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Example dialog"
            className="relative w-full max-w-sm border border-border bg-popover p-6 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold">Dialog</h3>
              <button
                onClick={() => setModal(false)}
                aria-label="Close"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconX size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Enters with a soft backdrop fade and a subtle zoom. Click the backdrop or the close
              button to dismiss.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModal(false)}
                className="inline-flex h-9 items-center border border-input bg-background px-4 text-sm font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => setModal(false)}
                className="inline-flex h-9 items-center bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
