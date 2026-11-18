"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconChecklist, IconCircleCheckFilled, IconPlus } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useProjectModules } from "@/components/dashboard/providers";
import { useAddModule } from "@/components/dashboard/add-module-modal";
import { useSetup } from "@/components/dashboard/setup-checklist";
import { stepsFor } from "@/lib/setup";
import { MODULES, MODULE_IDS, MODULE_LABEL, type ModuleId, type Project } from "@/lib/newgen";
import { cn } from "@/lib/utils";

/** Each module's cover (public/modules), from the Figma covers. */
const MODULE_COVER: Record<string, string> = {
  webstore: "/modules/webstore.jpg",
  "payment-links": "/modules/payment-links.jpg",
  "direct-checkout": "/modules/direct-checkout.jpg",
  "app-direct": "/modules/app-direct.jpg",
};

/** Merge params into the current URL (undefined removes one). */
function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (next: Record<string, string | undefined>, mode: "push" | "replace" = "replace") => {
    const p = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    const q = p.toString();
    router[mode](`${pathname}${q ? `?${q}` : ""}`, { scroll: false });
  };
}

/**
 * Administration › Module management (Module Management PRD, Story 1): every
 * module as Added (Setting up / Live), Available or Coming soon. Adding one
 * asks for confirmation — it reaches Production and every sandbox, and can't
 * be removed.
 */
export function ModuleManagementBody({ project }: { project: Project }) {
  const params = useSearchParams();
  const setParams = useUrlParams();
  const { modules } = useProjectModules(project);
  const addModule = useAddModule();
  const setup = useSetup(project);
  const isAdmin = params.get("as") !== "developer";
  const dialogModule = params.get("dialog") === "add-module" ? (params.get("module") as ModuleId) : null;
  const pending = dialogModule && MODULE_IDS.includes(dialogModule) ? dialogModule : null;
  const justAdded = params.get("added") as ModuleId | null;

  const addedMods = MODULES.filter((m) => !m.soon && modules.includes(m.id as ModuleId));
  const moreMods = MODULES.filter((m) => m.soon || !modules.includes(m.id as ModuleId));

  // A link to "Add <module>" (Ask AI, the review page, the flow guide: ?dialog=add-module&module=…) opens the Add module
  // dialog on its modules step with that module checked, like the page's own Add buttons.
  React.useEffect(() => {
    if (!pending) return;
    if (!modules.includes(pending)) addModule(project, pending);
    setParams({ dialog: undefined, module: undefined, conflict: undefined }, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <p className="text-body text-muted-foreground">
        Modules are the ways {project.project} sells. Each one is added to Production and every sandbox at once.
      </p>


      {/* Your modules: what the project has, each with its setup progress. Add more: the rest, to add or coming soon.
          Covers from Figma (Interface — Editor Tool, "Section 1"). */}
      {addedMods.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">Your modules</h2>
          <ul className="flex flex-col gap-3">
            {addedMods.map((m) => {
              const id = m.id as ModuleId;
              const live = setup.isLive(id);
              const steps = stepsFor(id);
              const n = live ? steps.length : steps.filter((st) => setup.isDone(st.id)).length;
              return (
                <li key={m.id} className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-card p-3 shadow-card sm:flex-row sm:items-center", justAdded === m.id && "ring-2 ring-info/40")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={MODULE_COVER[m.id]} alt="" className="aspect-[16/9] w-full shrink-0 rounded-xl object-cover sm:w-52" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-foreground">{m.label}</span>
                      <Badge variant={live ? "success" : "warning"}>{live ? "Live" : `Setting up · ${n}/${steps.length}`}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{m.description}</span>
                    {live ? (
                      <span className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <IconCircleCheckFilled className="size-4 text-success" />
                        All go-live steps done
                      </span>
                    ) : (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-label={`${n} of ${steps.length} steps done`}>
                          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${steps.length ? (n / steps.length) * 100 : 0}%` }} />
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setParams({ panel: "checklist" })}>
                          <IconChecklist />
                          Open checklist
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {moreMods.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">Add more</h2>
          {/* Laid out like Your modules' cards: the cover as a thumbnail on the left, the details and Add on the right. */}
          <ul className="flex flex-col gap-3">
            {moreMods.map((m) => (
              <li key={m.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-3 shadow-card sm:flex-row sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={MODULE_COVER[m.id]} alt="" className={cn("aspect-[16/9] w-full shrink-0 rounded-xl object-cover sm:w-52", m.soon && "opacity-60 saturate-50")} />
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:pr-2">
                  <span className="text-base font-semibold text-foreground">{m.label}</span>
                  <span className="text-sm text-muted-foreground">{m.description}</span>
                  <div className="mt-3">
                    {m.soon ? (
                      <Badge variant="outline">Coming soon</Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!isAdmin}
                        title={isAdmin ? undefined : "Only Admins can add modules"}
                        // The Add module dialog, on the modules step with this one checked, then a success step.
                        onClick={() => addModule(project, m.id as ModuleId)}
                      >
                        <IconPlus />
                        Add {m.label}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {isAdmin ? "Modules can’t be removed once added." : "Only Admins can add modules. You’re viewing as Developer."}
      </p>

    </div>
  );
}

const METHODS: { id: string; label: string; unsupported?: ModuleId[] }[] = [
  { id: "cards", label: "Credit and debit cards" },
  { id: "apple-pay", label: "Apple Pay" },
  { id: "google-pay", label: "Google Pay" },
  { id: "paypal", label: "PayPal" },
  { id: "bank", label: "Bank transfer", unsupported: ["payment-links"] },
];
const PROJECT_DEFAULT: Record<string, boolean> = { cards: true, "apple-pay": true, "google-pay": true, paypal: true, bank: false };

/**
 * Finance › Payment Methods (Module Management PRD, Story 4): one project
 * default, with per-module overrides. A module shows each method as Inherited
 * or Overridden; only methods the module supports are listed.
 */
export function PaymentMethodsBody({ project }: { project: Project }) {
  const params = useSearchParams();
  const setParams = useUrlParams();
  const { modules } = useProjectModules(project);
  const selected = modules.includes(params.get("module") as ModuleId) ? (params.get("module") as ModuleId) : null;
  const [defaults, setDefaults] = React.useState(PROJECT_DEFAULT);
  const [overrides, setOverrides] = React.useState<Partial<Record<ModuleId, Record<string, boolean>>>>({});

  const rows = METHODS.filter((m) => !selected || !m.unsupported?.includes(selected));
  const value = (id: string) => (selected ? overrides[selected]?.[id] ?? defaults[id] : defaults[id]);
  const set = (id: string, on: boolean) => {
    if (!selected) setDefaults((d) => ({ ...d, [id]: on }));
    else setOverrides((o) => ({ ...o, [selected]: { ...o[selected], [id]: on } }));
  };
  const reset = (id: string) =>
    setOverrides((o) => {
      const next = { ...o[selected!] };
      delete next[id];
      return { ...o, [selected!]: next };
    });

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-0.5 text-nav font-medium" role="tablist" aria-label="Module">
        {[null, ...modules].map((m) => (
          <button
            key={m ?? "all"}
            type="button"
            role="tab"
            aria-selected={selected === m}
            onClick={() => setParams({ module: m ?? undefined })}
            className={cn("h-7 rounded-md px-3", selected === m ? "bg-background shadow-xs" : "text-muted-foreground hover:text-foreground")}
          >
            {m ? MODULE_LABEL[m] : "All modules (default)"}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {selected
          ? `${MODULE_LABEL[selected]} uses the project default unless you override a method here.`
          : "The project default. Every module uses it unless it overrides a method."}
      </p>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {rows.map((m) => {
          const overridden = selected ? overrides[selected]?.[m.id] !== undefined : false;
          return (
            <li key={m.id} className="flex items-center gap-3 px-5 py-3 text-sm">
              <span className="flex-1">{m.label}</span>
              {selected ? (
                <span className="flex items-center gap-2">
                  <Badge variant={overridden ? "warning" : "neutral"}>{overridden ? "Overridden" : "Inherited"}</Badge>
                  {overridden ? (
                    <Button size="xs" variant="ghost" onClick={() => reset(m.id)}>
                      Reset to project default
                    </Button>
                  ) : null}
                </span>
              ) : null}
              <Switch checked={value(m.id)} onCheckedChange={(v) => set(m.id, v)} aria-label={m.label} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
