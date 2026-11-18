"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  IconBuildingStore,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconExternalLink,
  IconMailForward,
  IconPlus,
} from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSetup } from "@/components/dashboard/setup-checklist";
import { StorePreviewDialog } from "@/components/dashboard/create-project-flow";
import { CreateSandboxDialog } from "@/components/dashboard/create-sandbox-dialog";
import { MODULE_ICON } from "@/components/dashboard/project-bits";
import { OnboardingDialog, OnboardingEntry } from "@/components/dashboard/onboarding-timeline";
import { PageHeaderActions } from "@/components/dashboard/page-header-slot";
import { TeamSection } from "@/components/dashboard/team-setup";
import { OverviewCarousel } from "@/components/dashboard/overview-carousel";
import { projectBrand } from "@/components/brand-dna/use-brand-context";
import { useFolderTree, useSandboxes } from "@/components/dashboard/providers";
import { effectiveAccess, findTrail, isProjectId } from "@/lib/folders";
import { stepsFor, type GoLiveStep } from "@/lib/setup";
import { clientForProject, projectHref, DEFAULT_ENV_ID, MODULE_IDS, MODULE_LABEL, MODULES, type ModuleId, type Project } from "@/lib/newgen";
import { cn } from "@/lib/utils";

/** What each go-live step asks for, in a line (the setup guide's open step). */
const STEP_HELP: Record<string, string> = {
  secure: "Sign every request between your servers and Appcharge, so nobody can fake a purchase.",
  awarding: "Tell us which URL grants the items to the player after a purchase.",
  "player-auth": "Let players log in to the store with their game account.",
  personalization: "Send each player's offers and prices when they open the store.",
  "domain-webstore": "Choose the address players visit, like store.yourgame.com.",
  "checkout-session": "Create and cancel checkout sessions from your game server.",
  "domain-payment-links": "Choose the address your Payment Links use.",
  "domain-direct-checkout": "Choose the address your checkout opens on.",
};
/** The picture card beside the go-live steps (hidden for now). */
const SHOW_GUIDE_ART = false;
/** How many go-live steps the Overview shows at once (the full list is in the setup checklist). */
const VISIBLE_STEPS = 5;
/** The setup guide's green (Figma 128:1997): done ticks, their rail, "Done" and the progress bar. */
const GUIDE_GREEN = "#43C171";
/** Roughly how long each step takes a developer (the timeline's right column). */
const STEP_TIME: Record<string, string> = {
  secure: "15m",
  awarding: "15m",
  "player-auth": "30m",
  personalization: "20m",
  "domain-webstore": "5m",
  "checkout-session": "30m",
  "domain-payment-links": "5m",
  "domain-direct-checkout": "5m",
};
/** A step's short name for buttons and "Next: …" (the part before any brackets). */
const shortLabel = (s: GoLiveStep) => s.label.replace(/\s*\(.*\)\s*$/, "");
/** The open step's button ("Set up awarding", Figma 137:9684): short enough that it, Send to a developer and Mark as
 *  done always share one line. Steps not listed use their name. */
const SETUP_BUTTON: Record<string, string> = {
  secure: "Set up request signing",
  "player-auth": "Set up player login",
  personalization: "Set up personalization",
};
const setupLabel = (s: GoLiveStep) => SETUP_BUTTON[s.id] ?? `Set up ${shortLabel(s).toLowerCase()}`;

/**
 * Project Overview (new project, usability test 004): the lean page — the setup guide inline (1), the store and its
 * environments (2), the modules with each one's next step (5) and who has access (6).
 * Preview store and Add module sit in the page header.
 */
export function ProjectHome({ project }: { project: Project }) {
  const client = clientForProject(project.id);
  const setup = useSetup(project);
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [storeOpen, setStoreOpen] = React.useState(false);
  const env = params.get("env") ?? DEFAULT_ENV_ID;

  const hasStore = setup.modules.includes("webstore");
  const stepsDone = setup.steps.filter((s) => setup.isDone(s.id)).length;
  const live = setup.modules.length > 0 && setup.settingUp.length === 0;
  // Direct Checkout's onboarding plan follows its own go-live steps.
  const hasCheckout = setup.modules.includes("direct-checkout");
  const goLive = stepsFor("direct-checkout").map((s) => ({ id: s.id, label: s.label, done: setup.isDone(s.id) }));
  const checkoutLive = setup.isLive("direct-checkout");
  const [planOpen, setPlanOpen] = React.useState(params.get("onboarding") === "1");

  /** Merge into this page's URL (the checklist drawer is URL-driven). */
  const open = (next: Record<string, string>) => {
    const p = new URLSearchParams(params.toString());
    p.delete("welcome");
    Object.entries(next).forEach(([k, v]) => p.set(k, v));
    router.replace(`${pathname}?${p}`, { scroll: false });
  };
  const modulesHref = projectHref(project.id, "adm-modules", DEFAULT_ENV_ID);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      {/* The page header row (shell.tsx): just the title, with Preview store and Add module on the right (no description
          line on the Overview; the Store card says whether it's live). */}
      <PageHeaderActions>
        {hasStore ? (
          <Button size="sm" variant="outline" className="h-8 px-3 text-nav" onClick={() => setStoreOpen(true)}>
            <IconExternalLink />
            Preview store
          </Button>
        ) : null}
        <Button size="sm" className="h-8 px-3 text-nav" nativeButton={false} render={<Link href={modulesHref} />}>
          <IconPlus />
          Add module
        </Button>
      </PageHeaderActions>

      {/* What Appcharge can do (Figma 137:9684): a carousel between the AI prompt and the go-live guide. */}
      <OverviewCarousel className="mb-3" />

      {/* 1 · Setup guide: the go-live steps on the page, the next one open with its own button. Folds away once
          every module is live. */}
      {setup.steps.length ? (
        // Figma 130:2442 / 137:9684: a picture card (381 × 365) beside the go-live timeline; stacked on narrow screens.
        <div className={cn("grid items-start gap-7", SHOW_GUIDE_ART && "md:grid-cols-[minmax(0,381px)_minmax(0,1fr)]")}>
        {/* The picture card (Figma 137:9684, "Rectangle 8"): grey waves with fine grain and a white point, filling the card.
            Hidden for now; the go-live steps take the full width. Flip SHOW_GUIDE_ART to bring it back. */}
        {SHOW_GUIDE_ART ? (
          // eslint-disable-next-line @next/next/no-img-element -- static decorative art
          <img src="/overview/guide-art.jpg" alt="" aria-hidden className="aspect-[381/365] w-full rounded-[18px] object-cover" />
        ) : null}
        <SetupGuide
          project={project}
          steps={setup.steps}
          isDone={setup.isDone}
          toggle={setup.toggle}
          done={stepsDone}
          hrefFor={(s) => projectHref(project.id, s.section, env)}
          onViewAll={() => open({ panel: "checklist" })}
        />
        </div>
      ) : null}

      {/* Who has access, right after the go-live steps (inherited from the folders above). A new project (or a
          first-time company) starts with "Set up your team"; after an invite, People with access. */}
      <TeamCard project={project} client={client} firstTime={setup.created || client.id.startsWith("acme-ft")} />

      {/* Direct Checkout: the ~3-week onboarding plan (Confluence: Onboarding - Web Checkout). */}
      {hasCheckout ? (
        <>
          <OnboardingEntry goLive={goLive} live={checkoutLive} onView={() => setPlanOpen(true)} />
          <OnboardingDialog open={planOpen} onOpenChange={setPlanOpen} goLive={goLive} live={checkoutLive} onOpenChecklist={() => open({ panel: "checklist" })} />
        </>
      ) : null}

      {/* 2 · Store & environments, beside 5 · Modules. */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <StoreCard project={project} client={client} live={live} hasStore={hasStore} env={env} onPreview={() => setStoreOpen(true)} />
        <ModulesCard project={project} setup={setup} modulesHref={modulesHref} onChecklist={() => open({ panel: "checklist" })} />
      </div>


      <StorePreviewDialog project={project} open={storeOpen} onOpenChange={setStoreOpen} />
    </div>
  );
}

// The Overview cards: 18px corners, a soft half-strength border and a lifted shadow.
const CARD = "overflow-hidden rounded-[18px] border border-[rgb(231_229_228/0.5)] bg-white shadow-[0_8px_24px_0_rgb(0_0_0/0.10),0_1px_2px_0_rgb(0_0_0/0.04)]";
const CARD_HEAD = "flex items-center gap-2 border-b border-border px-5 py-3";

/* ------------------------------------------------------------------------------------------------------------------ */
/* 1 · Setup guide                                                                                                     */
/* ------------------------------------------------------------------------------------------------------------------ */

function SetupGuide({
  project,
  steps,
  isDone,
  toggle,
  done,
  hrefFor,
  onViewAll,
}: {
  project: Project;
  steps: GoLiveStep[];
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  done: number;
  hrefFor: (s: GoLiveStep) => string;
  /** Opens the full setup checklist (every step, every module). */
  onViewAll: () => void;
}) {
  const next = steps.find((s) => !isDone(s.id));
  // The open step: the next one by default; clicking another step's name opens it instead.
  const [openId, setOpenId] = React.useState<string | null>(null);
  const openStep = steps.find((s) => s.id === openId && !isDone(s.id)) ?? next;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  // At most VISIBLE_STEPS on the Overview: a window that keeps the open step in view, with the step before it for
  // context; the rest are one click away in the full checklist.
  const at = Math.max(0, steps.findIndex((s) => s.id === openStep?.id));
  const start = Math.max(0, Math.min(at - 1, steps.length - VISIBLE_STEPS));
  const shown = steps.slice(start, start + VISIBLE_STEPS);
  const hidden = steps.length - shown.length;
  return (
    // An activity timeline (Figma 128:1997): each step a dot with a fading rail under it; the step in progress has a pale
    // green dot and opens with its buttons; done steps get a green tick.
    <section aria-labelledby="setup-guide-title" className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <h2 id="setup-guide-title" className="text-base font-semibold text-[#272727]">
          Get {project.project} live
        </h2>
        <span className="text-[13px] text-muted-foreground">
          {done} of {steps.length} done
        </span>
        <span className="ml-auto h-1 w-28 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Go-live progress">
          <span className="block h-full rounded-full transition-[width]" style={{ width: `${pct}%`, background: GUIDE_GREEN }} />
        </span>
      </div>

      <ol className="relative">
        {shown.map((s) => {
          const isDoneStep = isDone(s.id);
          const isOpen = openStep?.id === s.id;
          // The rail under each dot fades out before the next one (Figma 128:1997): green under a done step, pale green
          // under the step in progress, grey under the rest.
          const rail = isDoneStep
            ? `linear-gradient(${GUIDE_GREEN}, rgb(255 255 255 / 0))`
            : isOpen
              ? "linear-gradient(#AFAEAD, rgb(255 255 255 / 0))"
              : "linear-gradient(#F5F5F4 31%, rgb(255 255 255 / 0))";
          return (
            <li key={s.id} className="relative grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-x-4">
              <span aria-hidden className="absolute top-[31px] -bottom-[9px] left-[13px] w-0.5 rounded-full" style={{ background: rail }} />
              {/* The dot: a grey point in a soft ring; a green tick when done. Clicking it marks the step done / not done. */}
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-label={isDoneStep ? `Mark ${shortLabel(s)} as not done` : `Mark ${shortLabel(s)} as done`}
                className="relative z-[1] mt-1.5 flex size-7 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {isDoneStep ? (
                  <span className="flex size-4 items-center justify-center rounded-full text-white" style={{ background: GUIDE_GREEN }}>
                    <IconCheck className="size-2.5" weight="bold" />
                  </span>
                ) : (
                  // The step in progress: an empty dashed ring (Figma 137:9684); the rest: grey ring, faint centre.
                  isOpen ? (
                    <span className="size-3.5 rounded-full border border-dashed border-[#AFAEAD]" />
                  ) : (
                    <span className="flex size-3.5 items-center justify-center rounded-full bg-[#F5F5F4]">
                      <span className="size-1.5 rounded-full bg-[rgb(12_10_8/0.3)]" />
                    </span>
                  )
                )}
              </button>

              <div className="min-w-0 py-2">
                <button
                  type="button"
                  onClick={() => setOpenId(s.id)}
                  disabled={isDoneStep}
                  className={cn(
                    "flex min-w-0 items-center gap-2 text-left text-sm leading-6 outline-none focus-visible:underline",
                    isDoneStep ? "text-[#43C171]" : isOpen ? "font-semibold text-[#272727]" : "text-[#AFAEAD]",
                  )}
                >
                  <span className="truncate">{s.label}</span>
                </button>
                {isOpen ? (
                  <div className="mt-1 flex flex-col gap-3">
                    <p className="text-[13px] leading-5 text-muted-foreground">{STEP_HELP[s.id] ?? "Finish this step to go live."}</p>
                    {/* One line, always: a short "Set up …" (Figma 137:9684); it would truncate before anything wrapped. */}
                    {/* The times column only sits beside the step names, so the actions run on under it (-mr-10). */}
                    <div className="-mr-10 flex min-w-0 flex-nowrap items-center gap-2">
                      <Button
                        size="sm"
                        className="h-8 min-w-0 shrink px-3 text-nav"
                        nativeButton={false}
                        render={<Link href={hrefFor(s)} title={setupLabel(s)} />}
                      >
                        <span className="truncate">{setupLabel(s)}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0 px-3 text-nav"
                        onClick={() => toast("Link copied for your developer", { description: `${shortLabel(s)} · ${project.project}` })}
                      >
                        <IconMailForward />
                        Send to a developer
                      </Button>
                      <button type="button" onClick={() => toggle(s.id)} className="ml-1 shrink-0 text-xs whitespace-nowrap text-muted-foreground underline underline-offset-2 hover:text-foreground">
                        Mark as done
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Right: done, or roughly how long it takes. */}
              <span className={cn("pt-2 leading-6 tabular-nums", isDoneStep ? "text-[13px] font-bold" : "text-[11px] text-muted-foreground")} style={isDoneStep ? { color: GUIDE_GREEN } : undefined}>
                {isDoneStep ? "Done" : (STEP_TIME[s.id] ?? "")}
              </span>
            </li>
          );
        })}
      </ol>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={onViewAll}
          className="ml-[44px] inline-flex w-fit items-center gap-1 rounded-md text-[13px] font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          View all {steps.length} steps
          <IconChevronRight className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* 2 · Store & environments                                                                                            */
/* ------------------------------------------------------------------------------------------------------------------ */

function StoreCard({
  project,
  client,
  live,
  hasStore,
  env,
  onPreview,
}: {
  project: Project;
  client: ReturnType<typeof clientForProject>;
  live: boolean;
  hasStore: boolean;
  env: string;
  onPreview: () => void;
}) {
  const { byProject } = useSandboxes();
  const [createOpen, setCreateOpen] = React.useState(false);
  const environments = [...client.environments, ...(byProject[project.id] ?? [])];
  const url = project.productionStoreUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const copy = () => {
    void navigator.clipboard?.writeText(project.productionStoreUrl ?? "").catch(() => {});
    toast("Store link copied");
  };
  return (
    <section className={CARD} aria-labelledby="store-card-title">
      <div className={CARD_HEAD}>
        <h2 id="store-card-title" className="text-sm font-semibold text-foreground">
          {hasStore ? "Store" : "Environments"}
        </h2>
        <span className="ml-auto">{live ? <Badge variant="success">Live</Badge> : <Badge variant="warning">Not live</Badge>}</span>
      </div>
      {hasStore && url ? (
        <div className="flex items-center gap-2 border-b border-border px-5 py-2.5">
          <IconBuildingStore className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate rounded-md bg-muted px-2 py-0.5 text-[13px] text-foreground">{url}</span>
          <span className="ml-auto flex shrink-0 gap-1">
            <Button size="xs" variant="secondary" onClick={copy}>
              <IconCopy />
              Copy
            </Button>
            <Button size="xs" variant="secondary" onClick={onPreview}>
              <IconExternalLink />
              Preview
            </Button>
          </span>
        </div>
      ) : null}
      <ul>
        {environments.map((e) => (
          <li key={e.id} className="border-b border-border last:border-b-0">
            <Link href={projectHref(project.id, "home", e.id)} className="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors hover:bg-muted/50">
              <span className="size-2 shrink-0 rounded-full" style={{ background: e.color }} />
              <span className="text-foreground">{e.name}</span>
              <span className="text-xs text-muted-foreground">{e.kind === "production" ? "Real players" : "Test data"}</span>
              {e.id === env ? <span className="ml-auto text-xs text-muted-foreground">You’re here</span> : null}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-2 px-5 py-2.5">
          <span className="text-xs text-muted-foreground">
            {environments.some((e) => e.kind === "sandbox") ? "Test changes before players see them." : "No sandbox yet. Test changes before players see them."}
          </span>
          <Button size="xs" variant="outline" className="ml-auto" onClick={() => setCreateOpen(true)}>
            <IconPlus />
            Create sandbox
          </Button>
        </li>
      </ul>
      <CreateSandboxDialog open={createOpen} onOpenChange={setCreateOpen} projectId={project.id} sectionId="home" environments={environments} />
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* 5 · Modules                                                                                                         */
/* ------------------------------------------------------------------------------------------------------------------ */

function ModulesCard({
  project,
  setup,
  modulesHref,
  onChecklist,
}: {
  project: Project;
  setup: ReturnType<typeof useSetup>;
  modulesHref: string;
  onChecklist: () => void;
}) {
  const others = MODULE_IDS.filter((m) => !setup.modules.includes(m));
  const describe = (m: ModuleId) => MODULES.find((x) => x.id === m)?.description ?? "";
  return (
    <section className={CARD} aria-labelledby="modules-card-title">
      <div className={CARD_HEAD}>
        <h2 id="modules-card-title" className="text-sm font-semibold text-foreground">
          Modules
        </h2>
      </div>
      <ul>
        {setup.modules.map((m) => {
          const Icon = MODULE_ICON[m] ?? IconBuildingStore;
          const steps = stepsFor(m);
          const doneN = steps.filter((s) => setup.isDone(s.id)).length;
          const nextStep = steps.find((s) => !setup.isDone(s.id));
          return (
            <li key={m} className="flex items-center gap-2.5 border-b border-border px-5 py-2.5 text-sm">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-foreground">{MODULE_LABEL[m]}</span>
                {!setup.isLive(m) && nextStep ? <span className="block truncate text-xs text-muted-foreground">Next: {shortLabel(nextStep)}</span> : null}
              </span>
              {setup.isLive(m) ? (
                <Badge variant="success">Live</Badge>
              ) : (
                <button type="button" onClick={onChecklist} title="Open the setup checklist" className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  <Badge variant="warning" className="cursor-pointer transition-colors hover:bg-warning/20">
                    Setting up · {doneN}/{steps.length}
                    <IconChevronRight data-icon="inline-end" aria-hidden />
                  </Badge>
                </button>
              )}
            </li>
          );
        })}
        {/* The ways to sell this project doesn't have yet: quiet rows, each one click from Module management. */}
        {others.map((m) => {
          const Icon = MODULE_ICON[m] ?? IconBuildingStore;
          return (
            <li key={m} className="flex items-center gap-2.5 border-b border-border px-5 py-2.5 text-sm last:border-b-0">
              <Icon className="size-4 shrink-0 text-muted-foreground/70" />
              <span className="min-w-0 flex-1">
                <span className="block text-muted-foreground">{MODULE_LABEL[m]}</span>
                <span className="block truncate text-xs text-muted-foreground/80">{describe(m)}</span>
              </span>
              <Button size="xs" variant="secondary" nativeButton={false} render={<Link href={modulesHref} />} aria-label={`Add ${MODULE_LABEL[m]} to ${project.project}`}>
                Add
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* 6 · Team & access                                                                                                   */
/* ------------------------------------------------------------------------------------------------------------------ */

function TeamCard({ project, client, firstTime }: { project: Project; client: ReturnType<typeof clientForProject>; firstTime: boolean }) {
  const { root } = useFolderTree(client);
  const trail = findTrail(root, isProjectId(project.id)) ?? [root];
  const inherited = effectiveAccess(client, trail);
  return <TeamSection projectId={project.id} projectName={project.project} firstTime={firstTime} inherited={inherited} brand={projectBrand(project)} />;
}
