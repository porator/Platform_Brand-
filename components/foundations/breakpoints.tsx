"use client";

import * as React from "react";
import { IconDeviceMobile, IconDeviceTablet, IconDeviceDesktop, IconDeviceImac } from "@/lib/icons";
import { PageShell, PageHeader, Section, Mono } from "./_kit";
import { BREAKPOINTS } from "./tokens";

function useViewportWidth() {
  const [w, setW] = React.useState<number | null>(null);
  React.useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

function activeBreakpoint(width: number) {
  // Highest breakpoint whose min-width is satisfied.
  let active = BREAKPOINTS[0];
  for (const bp of BREAKPOINTS) if (width >= bp.px) active = bp;
  return active;
}

const DEVICES: { label: string; px: string; Icon: typeof IconDeviceMobile }[] = [
  { label: "Mobile", px: "< 640px", Icon: IconDeviceMobile },
  { label: "Tablet", px: "≥ 768px", Icon: IconDeviceTablet },
  { label: "Desktop", px: "≥ 1024px", Icon: IconDeviceDesktop },
  { label: "Wide", px: "≥ 1280px", Icon: IconDeviceImac },
];

export function BreakpointsPage() {
  const width = useViewportWidth();
  const active = width != null ? activeBreakpoint(width) : null;

  return (
    <PageShell>
      <PageHeader
        title="Breakpoints"
        description={
          <>
            Responsive design uses Tailwind&apos;s mobile-first breakpoints. Styles apply from a
            breakpoint <em>up</em> — <Mono>md:grid-cols-2</Mono> takes effect at 768px and wider.
            Resize this panel, or use the Storybook viewport toolbar, to watch the active breakpoint
            change.
          </>
        }
      />

      <Section
        title="Live viewport"
        description="The current width of the preview and the breakpoint it resolves to."
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card px-6 py-5 text-card-foreground">
          <div>
            <p className="text-xs text-muted-foreground">Current width</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
              {width != null ? `${width}px` : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Active breakpoint</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {active ? active.name : "—"}
              {active && active.prefix !== "(none)" ? (
                <span className="ml-2 align-middle text-base font-normal text-muted-foreground">
                  <Mono>{active.prefix}</Mono>
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Scale"
        description="Six breakpoints, mobile-first. Base styles need no prefix."
      >
        <div className="overflow-hidden border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Prefix</th>
                <th className="px-4 py-2.5 font-medium">Min width</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Typical device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {BREAKPOINTS.map((bp) => {
                const isActive = active?.name === bp.name;
                return (
                  <tr key={bp.name} className={isActive ? "bg-accent/50" : undefined}>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {bp.name}
                      {isActive ? (
                        <span className="ml-2 inline-flex items-center bg-primary px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-primary-foreground">
                          active
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5"><Mono className="text-muted-foreground">{bp.prefix}</Mono></td>
                    <td className="px-4 py-2.5 tabular-nums">
                      <Mono className="text-foreground">{bp.px === 0 ? "0" : `${bp.px}px`}</Mono>
                      <span className="ml-2 text-muted-foreground">
                        <Mono>{bp.rem === 0 ? "0" : `${bp.rem}rem`}</Mono>
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{bp.role}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Target devices"
        description="The four device classes the product designs against."
      >
        <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          {DEVICES.map(({ label, px, Icon }) => (
            <div key={label} className="flex flex-col items-center gap-3 bg-card px-4 py-8 text-card-foreground">
              <Icon size={28} stroke={1.5} className="text-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">{label}</p>
                <Mono className="text-muted-foreground">{px}</Mono>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
