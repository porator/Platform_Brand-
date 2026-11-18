"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrandDNA } from "@/components/brand-dna/brand-dna";
import { AppchargeLogo } from "@/components/dashboard/logo";
import { markSignInTransition, SignInHandoff } from "@/components/auth/sign-in-transition";
import { paletteFromFile } from "@/lib/game-palette";
import {
  initialsOf,
  logoDataUrl,
  ONBOARDING_HOME,
  saveOrganization,
  type Organization,
} from "@/lib/organization";
import {
  IconBuilding,
  IconChartBar,
  IconChevronDown,
  IconChevronLeft,
  IconFolderPlus,
  IconHome2,
  IconPlus,
  IconReceipt2,
  IconSettings,
  IconUpload,
  IconX,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

/*
 * Organization onboarding: between signing in and the company. Two short steps (your organization's details, then
 * its logo, which gives its brand colours), with a live preview of the dashboard on the right. Finishing saves the
 * organization (lib/organization.ts) and lands in the company's Overview: "Start by organizing your company".
 */

const CHARCOAL = "linear-gradient(180deg, #272727 0%, #302F2F 100%)";
const field =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/15";
const DOMAIN = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;
const STEPS = 2;

export function OrgOnboarding() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [logo, setLogo] = React.useState<{ src: string; file: string } | null>(
    null,
  );
  const [colors, setColors] = React.useState<string[]>([]);
  const [reading, setReading] = React.useState(false);
  const [tried, setTried] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    router.prefetch(ONBOARDING_HOME);
  }, [router]);

  const nameError =
    name.trim().length < 2 ? "Enter your organization's name" : null;
  const websiteError =
    website.trim() && !DOMAIN.test(website.trim())
      ? "Enter a website like king.com"
      : null;

  const org: Organization = {
    name: name.trim(),
    website: website.trim() || undefined,
    logo: logo?.src,
    brandColors: colors,
  };

  const next = () => {
    setTried(true);
    if (nameError || websiteError) return;
    setTried(false);
    setStep(2);
  };
  const finish = () => {
    saveOrganization(org);
    setLeaving(true);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setTimeout(
      () => {
        markSignInTransition();
        router.push(ONBOARDING_HOME);
      },
      reduce ? 0 : 450,
    );
  };

  const onFile = async (file?: File | null) => {
    if (!file || !(file.type.startsWith("image/") || /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(file.name))) return;
    setReading(true);
    const [src, pal] = await Promise.all([
      logoDataUrl(file),
      paletteFromFile(file),
    ]);
    setReading(false);
    if (!src) return;
    setLogo({ src, file: file.name });
    setColors(pal?.colors ?? []);
  };

  return (
    <div
      className={cn(
        "font-brand grid min-h-svh bg-white transition-opacity duration-[450ms] ease-out motion-reduce:transition-none lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
        leaving && "opacity-0",
      )}
    >
      <section className="flex min-h-svh animate-in flex-col px-6 pt-5 pb-8 duration-500 fade-in-0 slide-in-from-bottom-1 sm:px-12 lg:px-16">
        {/* Progress, and where you are. */}
        <div
          className="mt-3 h-1 w-full max-w-[34rem] overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progress"
          aria-valuenow={step * 50}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full transition-[width,background-color] duration-500"
            style={{
              width: `${(step / STEPS) * 100}%`,
              background: colors[0] ?? "#338DE8",
            }}
          />
        </div>
        <div className="mt-3 flex h-10 items-center gap-2 text-sm text-muted-foreground">
          <AppchargeLogo className="size-6" />
          <span>Set up your organization</span>
          <span className="flex-1" />
          <span className="tabular-nums">
            Step {step} of {STEPS}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div
            key={step}
            className="w-full max-w-[34rem] animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            {step === 1 ? (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
              >
                <h1 className="text-[36px] leading-[1.08] font-[450] tracking-[-0.035em] text-[#272727]">
                  What&apos;s your organization called?
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                  It&apos;s the top of your dashboard: your studios, games and
                  projects sit inside it.
                </p>
                <div className="mt-8 flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="org-name"
                      className="text-sm font-medium text-foreground"
                    >
                      Organization name
                    </label>
                    <input
                      id="org-name"
                      autoFocus
                      autoComplete="organization"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. King"
                      aria-invalid={tried && !!nameError}
                      aria-describedby={
                        tried && nameError ? "org-name-error" : undefined
                      }
                      className={field}
                    />
                    {tried && nameError ? (
                      <p
                        id="org-name-error"
                        className="text-xs text-destructive"
                      >
                        {nameError}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="org-website"
                      className="flex items-baseline gap-1.5 text-sm font-medium text-foreground"
                    >
                      Website{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        Optional
                      </span>
                    </label>
                    <input
                      id="org-website"
                      inputMode="url"
                      autoComplete="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="king.com"
                      aria-invalid={tried && !!websiteError}
                      aria-describedby={
                        tried && websiteError ? "org-website-error" : undefined
                      }
                      className={field}
                    />
                    {tried && websiteError ? (
                      <p
                        id="org-website-error"
                        className="text-xs text-destructive"
                      >
                        {websiteError}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button type="submit" hidden />
              </form>
            ) : (
              <div>
                <h1 className="text-[36px] leading-[1.08] font-[450] tracking-[-0.035em] text-[#272727]">
                  Add your logo
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                  We&apos;ll take your brand colours from it, so your dashboard
                  feels like yours.
                </p>
                <LogoDrop
                  logo={logo}
                  reading={reading}
                  onFile={onFile}
                  onRemove={() => (setLogo(null), setColors([]))}
                />
                {colors.length ? (
                  <div className="mt-5 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Brand colours
                    </span>
                    <span className="flex gap-1.5">
                      {colors.map((c) => (
                        <span
                          key={c}
                          title={c}
                          className="size-6 rounded-full ring-1 ring-black/10"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                  </div>
                ) : (
                  <p className="mt-4 text-[13px] text-muted-foreground">
                    No logo yet? Skip it and add one later in Settings.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              aria-label="Back"
              className="-ml-2 flex size-11.5 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <IconChevronLeft className="size-5" />
            </button>
          ) : null}
          <span className="flex-1" />
          {step === 2 && !logo ? (
            <button
              type="button"
              onClick={finish}
              className="h-11.5 rounded-full px-5 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip for now
            </button>
          ) : null}
          <button
            type="button"
            onClick={step === 1 ? next : finish}
            disabled={step === 2 && !logo}
            className="h-11.5 shrink-0 rounded-[200px] px-7 text-[15px] font-medium whitespace-nowrap text-white shadow-md transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
            style={{ background: CHARCOAL }}
          >
            {step === 1 ? "Continue" : "Create organization"}
          </button>
        </div>
      </section>

      {/* The preview: your dashboard taking shape, on your organization's Brand DNA. */}
      <aside className="hidden p-1 lg:sticky lg:top-0 lg:block lg:h-svh">
        {/* The same frame as the sign-in page's visual: a rounded panel inset 4px from the window. */}
        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[18px] p-10 xl:p-16">
          <BrandDNA contextType="organization" contextId="onboarding" brandColors={colors.length ? colors : undefined} className="absolute inset-0" />
          <DashboardPreview org={org} />
          {/* Coming from sign-in: its animated scene, cross-fading into this preview. */}
          <SignInHandoff />
        </div>
      </aside>
    </div>
  );
}

/* ── The logo drop zone ─────────────────────────────────────────────────────────────────────────────────────────── */
function LogoDrop({
  logo,
  reading,
  onFile,
  onRemove,
}: {
  logo: { src: string; file: string } | null;
  reading: boolean;
  onFile: (f?: File | null) => void;
  onRemove: () => void;
}) {
  const input = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);
  if (logo) {
    return (
      <div className="mt-8 flex items-center gap-4 rounded-xl border border-border p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- the uploaded logo */}
        <img
          src={logo.src}
          alt="Your logo"
          className="size-14 shrink-0 rounded-full object-cover ring-1 ring-black/5"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {logo.file}
          </p>
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Replace
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove logo"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconX className="size-4" />
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "mt-8 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
          over
            ? "border-foreground/40 bg-muted/60"
            : "border-foreground/20 hover:bg-muted/40",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <IconUpload className="size-5" />
        </span>
        <span className="text-[15px] font-medium text-foreground">
          {reading ? "Reading your logo…" : "Drop your logo here, or browse"}
        </span>
        <span className="text-[13px] text-muted-foreground">
          PNG, JPG or SVG · square works best
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        aria-label="Upload logo"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </>
  );
}

/* ── The live preview: the dashboard you're about to land in ───────────────────────────────────────────────────── */
function OrgMark({
  org,
  className,
}: {
  org: Organization;
  className?: string;
}) {
  if (org.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- the uploaded logo
      <img
        src={org.logo}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[9px] font-semibold text-white",
        className,
      )}
      style={
        org.brandColors?.[0] ? { background: org.brandColors[0] } : undefined
      }
    >
      {org.name ? initialsOf(org.name) : <IconBuilding className="size-3" />}
    </span>
  );
}

function DashboardPreview({ org }: { org: Organization }) {
  const name = org.name || "Your organization";
  const nav: [typeof IconHome2, string][] = [
    [IconHome2, "Overview"],
    [IconReceipt2, "Orders"],
    [IconChartBar, "Analytics"],
    [IconSettings, "Administration"],
  ];
  return (
    <div
      aria-hidden
      className="relative w-full max-w-[760px] overflow-hidden rounded-2xl border border-black/5 bg-[#F6F6F6] font-sans shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)]"
    >
      {/* Top bar: the organization in the breadcrumb. */}
      <div className="flex items-center gap-3 px-4 py-3">
        <AppchargeLogo className="size-6" />
        <span className="ml-14 flex min-w-0 items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1 text-[13px] font-semibold shadow-xs">
          <OrgMark org={org} className="size-5" />
          <span
            className={cn("truncate", !org.name && "text-muted-foreground")}
          >
            {name}
          </span>
          <IconChevronDown className="size-3 text-muted-foreground" />
        </span>
        <span className="text-[12px] text-muted-foreground">
          Environment <span className="text-foreground">· All production</span>
        </span>
      </div>
      <div className="flex gap-2 px-2 pb-2">
        {/* Sidebar */}
        <div className="flex w-36 shrink-0 flex-col gap-1 py-1">
          {nav.map(([I, l], i) => (
            <span
              key={l}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px]",
                i === 0
                  ? "bg-white font-medium shadow-xs"
                  : "text-muted-foreground",
              )}
            >
              <I className="size-3.5" />
              {l}
            </span>
          ))}
        </div>
        {/* The company's Overview */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
          <BrandDNA
            contextType="organization"
            contextId="onboarding-preview"
            brandColors={org.brandColors?.length ? org.brandColors : undefined}
            className="rounded-[12px]"
          >
            <div className="flex min-h-[96px] items-end gap-2.5 p-4">
              <OrgMark org={org} className="size-8 text-[11px]" />
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate font-brand text-[17px] leading-tight font-medium text-[#272727]",
                    !org.name && "text-[#272727]/50",
                  )}
                >
                  {name}
                </p>
                <p className="truncate text-[11px] text-foreground/70">
                  {org.website
                    ? org.website.replace(/^https?:\/\//, "")
                    : "0 projects"}
                </p>
              </div>
            </div>
          </BrandDNA>
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-6 text-center">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <IconFolderPlus className="size-4" />
            </span>
            <p className="text-[13px] font-semibold text-foreground">
              Start by organizing your company
            </p>
            <p className="text-[11px] text-muted-foreground">
              Make folders for your studios or game genres, then create projects
              inside them.
            </p>
            <span className="mt-1.5 flex gap-1.5">
              <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px]">
                <IconFolderPlus className="size-3" />
                New folder
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#272727] px-2.5 py-1 text-[11px] text-white">
                <IconPlus className="size-3" />
                Create project
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
