import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Container — centered, max-width, responsive horizontal padding             */
/* -------------------------------------------------------------------------- */

const CONTAINER_MAX = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
} as const;

export function Container({
  size = "lg",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: keyof typeof CONTAINER_MAX }) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", CONTAINER_MAX[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stack — flex row/column with gap, alignment, justification, wrap           */
/* -------------------------------------------------------------------------- */

const GAP: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};
const ALIGN = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch", baseline: "items-baseline" } as const;
const JUSTIFY = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between", around: "justify-around" } as const;

export function Stack({
  direction = "vertical",
  gap = 4,
  align,
  justify,
  wrap = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  direction?: "vertical" | "horizontal" | "responsive";
  gap?: keyof typeof GAP;
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
}) {
  const dir =
    direction === "vertical"
      ? "flex-col"
      : direction === "horizontal"
        ? "flex-row"
        : "flex-col sm:flex-row";
  return (
    <div
      className={cn(
        "flex",
        dir,
        GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Grid — responsive columns or auto-fit, with gap control                    */
/* -------------------------------------------------------------------------- */

const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export function Grid({
  cols = 3,
  gap = 4,
  colGap,
  rowGap,
  minColWidth,
  className,
  children,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  cols?: keyof typeof COLS;
  gap?: keyof typeof GAP;
  colGap?: keyof typeof GAP;
  rowGap?: keyof typeof GAP;
  minColWidth?: string;
}) {
  if (minColWidth) {
    return (
      <div
        className={cn("grid", GAP[gap], className)}
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid",
        COLS[cols],
        colGap || rowGap ? "" : GAP[gap],
        colGap && GAP[colGap].replace("gap-", "gap-x-"),
        rowGap && GAP[rowGap].replace("gap-", "gap-y-"),
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Split View — two panes, flexible proportions, stacks on small screens      */
/* -------------------------------------------------------------------------- */

export function SplitView({
  primary,
  secondary,
  primaryClassName,
  secondaryClassName,
  divider = true,
  reverse = false,
  className,
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  /** Width of the primary pane at lg+ (e.g. "lg:w-96", "lg:w-1/2"). */
  primaryClassName?: string;
  secondaryClassName?: string;
  divider?: boolean;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col lg:flex-row", reverse && "lg:flex-row-reverse", className)}>
      <div className={cn("min-w-0 shrink-0", primaryClassName ?? "lg:w-96")}>{primary}</div>
      <div
        className={cn(
          "min-w-0 flex-1",
          divider && (reverse ? "lg:border-r" : "lg:border-l"),
          "border-border",
          secondaryClassName,
        )}
      >
        {secondary}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Layout — the canonical in-shell page body                             */
/* -------------------------------------------------------------------------- */

export function PageLayout({
  breadcrumbs,
  title,
  description,
  actions,
  tabs,
  secondary,
  children,
  className,
}: {
  breadcrumbs?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  secondary?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {breadcrumbs ? (
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 sm:px-6">
          {breadcrumbs}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <header className="px-4 pt-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              {description ? (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>
          {tabs ? <div className="mt-4">{tabs}</div> : null}
        </header>

        <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
          <div className="min-w-0 flex-1">{children}</div>
          {secondary ? <aside className="w-full shrink-0 lg:w-72">{secondary}</aside> : null}
        </div>
      </div>
    </div>
  );
}
