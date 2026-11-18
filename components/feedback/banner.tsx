"use client";

import * as React from "react";
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconSparkles,
  IconX,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

type BannerVariant = "info" | "warning" | "success" | "promo";

const VARIANT_CLASS: Record<BannerVariant, string> = {
  info: "bg-info/10 text-foreground [&_[data-slot=banner-icon]]:text-info",
  warning: "bg-warning/10 text-foreground [&_[data-slot=banner-icon]]:text-warning",
  success: "bg-success/10 text-foreground [&_[data-slot=banner-icon]]:text-success",
  promo: "bg-primary text-primary-foreground [&_[data-slot=banner-icon]]:text-primary-foreground",
};

export function Banner({
  variant = "info",
  icon,
  children,
  action,
  onDismiss,
  label = "Notification",
  className,
}: {
  variant?: BannerVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-sm",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {icon ? (
        <span data-slot="banner-icon" className="flex shrink-0 [&>svg]:size-4">
          {icon}
        </span>
      ) : null}
      <div className="flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={cn(
            "shrink-0 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            variant === "promo" ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <IconX className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function DismissibleBanner() {
  const [open, setOpen] = React.useState(true);
  if (!open)
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Show banner again
      </Button>
    );
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Banner
        variant="warning"
        icon={<IconAlertTriangle />}
        label="Usage warning"
        onDismiss={() => setOpen(false)}
        action={
          <Button variant="outline" size="xs">
            Review usage
          </Button>
        }
      >
        You&apos;ve used 92% of your monthly build minutes.
      </Banner>
    </div>
  );
}

export function BannerPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Feedback"
        title="Banner"
        description={
          <>
            A full-width message pinned to the top of a page or section — for announcements,
            system-wide notices and promotions. Unlike an <Mono>Alert</Mono> (inline, contextual) a
            banner spans the layout and usually carries a single action.
          </>
        }
      />

      <Section title="Variants" description="Info, warning and success tints, plus a solid promo banner.">
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-md border border-border">
            <Banner variant="info" icon={<IconInfoCircle />} label="Maintenance notice">
              Scheduled maintenance on Sunday 02:00–03:00 UTC. Deployments will pause.
            </Banner>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <Banner variant="warning" icon={<IconAlertTriangle />} label="Trial notice">
              Your trial ends in 3 days.
            </Banner>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <Banner variant="success" icon={<IconCircleCheck />} label="System status">
              All systems operational.
            </Banner>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <Banner
              variant="promo"
              icon={<IconSparkles />}
              label="Product announcement"
              action={
                <Button variant="secondary" size="xs">
                  Learn more
                </Button>
              }
            >
              New: environment-level analytics are now available.
            </Banner>
          </div>
        </div>
      </Section>

      <Section title="With action & dismiss" description="A banner can pair a single action with a close control.">
        <DismissibleBanner />
      </Section>

      <Section
        title="In a page"
        description="Pinned above the content it concerns — spanning the full width of the layout."
      >
        <div className="overflow-hidden rounded-md border border-border">
          <Banner variant="info" icon={<IconInfoCircle />} label="Environment notice" onDismiss={() => {}}>
            You are viewing <strong className="font-medium">Staging</strong>. Changes here don&apos;t affect
            Production.
          </Banner>
          <div className="flex h-32 items-center justify-center bg-background text-sm text-muted-foreground">
            Page content
          </div>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Rendered as a labelled <Mono>region</Mono> landmark so it can be found and skipped.
            </>,
            "Meaning is carried by an icon and text, not color alone.",
            "The dismiss control and action are keyboard-reachable buttons with visible focus.",
            "Tints keep text at AA contrast; the promo banner uses the primary pairing.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
