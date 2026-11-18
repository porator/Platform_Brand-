"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { IconLayoutGrid, IconX } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useEmbedded } from "@/components/dashboard/flow-guide";

/* ------------------------------- NewGen menu ------------------------------ */
/* Cross-tool navigation (Design Hub, deck, tree, wireframes). Presentation
 * tooling, not dashboard chrome: a round floating button beside the review
 * button, opening the same four-column overlay the other tools carry. */

const APPS = [
  { group: "Design hub", title: "Design Hub", desc: "Presenting Appcharge — research, benchmark and recommendations.", href: "http://localhost:3500/Design%20hub-vs-001/NewGen-Design-Hub.html" },
  { group: "Design hub", title: "UX research", desc: "Journey maps, empathy map and usability findings, each traced to its evidence.", href: "http://localhost:3532/research" },
  { group: "Presentations", title: "Nested Project Hierarchy 0.1", desc: "The navigation & project structure deck.", href: "http://localhost:3200/" },
  { group: "Presentations", title: "The three user flows defined in the PRD", desc: "Step by step, each with a live walkthrough in Wireframes 004.", href: "/flows" },
  { group: "Tree diagram", title: "Dashboard Tree", desc: "Every dashboard page, mapped as a tree.", href: "http://localhost:3500/Tree%20diagram-vs-003/Dashboard-Tree-002.html" },
  { group: "Wireframes", title: "Wireframes 004", desc: "The clickable dashboard wireframe, version 004 — with the three PRD user flows.", href: "/dashboard" },
];
/** Columns in order; a column can hold more than one destination. */
const GROUPS = [...new Set(APPS.map((a) => a.group))];

export function NewGenMenu({ alone = false }: { alone?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const embedded = useEmbedded();
  // The destination you're on (local routes only) is marked as current.
  const pathname = usePathname();
  const isCurrent = (href: string) => href.startsWith("/") && pathname.startsWith(href);
  const btn = React.useRef<HTMLButtonElement>(null);
  const links = React.useRef<(HTMLAnchorElement | null)[]>([]);

  const close = React.useCallback(() => {
    setOpen(false);
    btn.current?.focus();
  }, []);

  React.useEffect(() => {
    if (open) links.current[0]?.focus();
  }, [open]);

  /* M toggles; while open, Escape closes and 1–6 jump. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "m" || e.key === "M") {
        if (!open && document.querySelector('[role="dialog"], [role="menu"]')) return;
        e.preventDefault();
        open ? close() : setOpen(true);
      } else if (open && e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (open && /^[1-6]$/.test(e.key)) {
        e.preventDefault();
        links.current[+e.key - 1]?.click();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Presentation tooling stays out of the deck's embedded live screens.
  if (embedded) return null;
  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Open NewGen menu (M)"
        title="NewGen menu (M)"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 z-50 flex size-12 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg outline-none transition-transform hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50",
          alone ? "right-5" : "right-20",
        )}
      >
        <IconLayoutGrid className="size-5" stroke={1.6} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="NewGen menu"
          onClick={close}
          className="fixed inset-0 z-[60] grid place-items-center bg-background/70 px-4 py-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-[1180px] overflow-y-auto rounded-3xl border border-border bg-background p-6 text-foreground shadow-2xl sm:p-11"
          >
            <div className="mb-6 flex items-center justify-between sm:mb-9">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Appcharge · NewGen</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconX className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
              {GROUPS.map((g) => (
                <section key={g}>
                  <h3 className="mb-4 border-b border-border pb-3.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {g}
                  </h3>
                  <div className="grid gap-4">
                  {APPS.filter((a) => a.group === g).map((a) => {
                    const i = APPS.indexOf(a);
                    return (
                  <a
                    key={a.title}
                    ref={(el) => {
                      links.current[i] = el;
                    }}
                    href={a.href}
                    aria-current={isCurrent(a.href) ? "page" : undefined}
                    onClick={isCurrent(a.href) ? (e) => (e.preventDefault(), close()) : undefined}
                    className="group grid grid-cols-[28px_1fr_auto] items-baseline py-1 outline-none"
                  >
                    <span className="text-xs tabular-nums text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className={cn(
                        "text-lg leading-snug tracking-tight transition-colors group-hover:text-foreground group-focus-visible:text-foreground",
                        isCurrent(a.href) ? "font-medium text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {a.title}
                    </span>
                    {isCurrent(a.href) ? <i className="size-1.5 self-center rounded-full bg-foreground" aria-hidden /> : <span />}
                    <span className="col-start-2 col-end-4 mt-1.5 text-[13px] leading-normal text-muted-foreground/80">{a.desc}</span>
                  </a>
                    );
                  })}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-border pt-4 text-[13px] text-muted-foreground/80">
              <span><Kbd>1</Kbd>–<Kbd>6</Kbd> open</span>
              <span><Kbd>M</Kbd> menu</span>
              <span><Kbd>Esc</Kbd> close</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mr-1.5 inline-grid h-[22px] min-w-[22px] place-items-center rounded-[5px] border border-border px-1.5 font-sans text-[11.5px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
