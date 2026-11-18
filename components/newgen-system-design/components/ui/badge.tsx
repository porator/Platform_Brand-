import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { IconX as X } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-primary/20 bg-primary-subtle text-primary',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border bg-card text-foreground',
        success: 'border-success/20 bg-success-subtle text-success',
        warning: 'border-warning/25 bg-warning-subtle text-warning',
        destructive: 'border-destructive/20 bg-destructive-subtle text-destructive',
        info: 'border-info/20 bg-info-subtle text-info',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-0.5 text-xs',
        lg: 'px-2.5 py-1 text-xs',
      },
      pill: {
        true: 'rounded-full',
        false: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      pill: false,
    },
  }
);

const DOT_COLORS: Record<NonNullable<VariantProps<typeof badgeVariants>['variant']>, string> = {
  default: 'bg-primary',
  secondary: 'bg-muted-foreground',
  outline: 'bg-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
};

/*
 * workspace: the usability test's components/ui/badge.tsx (base-vega, with its extended status
 * variants), translated to Tailwind 3: has-data-[x] → has-[[data-x]]; size-3! → !size-3;
 * [a]:hover → [a&]:hover; color-mix arbitrary colours typed with `color:`. Base UI's
 * render={<a />} → asChild.
 */
const WORKSPACE_BADGE_BASE =
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-[[data-icon=inline-end]]:pr-1.5 has-[[data-icon=inline-start]]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:!size-3';

const WORKSPACE_BADGE_VARIANT = {
  default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
  destructive:
    'bg-destructive/10 text-[color:color-mix(in_oklch,var(--destructive),var(--foreground)_24%)] focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/20',
  outline: 'border-border text-foreground [a&]:hover:bg-muted [a&]:hover:text-muted-foreground',
  ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
  link: 'text-primary underline-offset-4 hover:underline',
  success: 'bg-success/10 text-success [a&]:hover:bg-success/20 dark:bg-success/15',
  warning: 'bg-warning/10 text-warning [a&]:hover:bg-warning/20 dark:bg-warning/15',
  info: 'bg-info/10 text-info [a&]:hover:bg-info/20 dark:bg-info/15',
  neutral: 'bg-muted text-foreground [a&]:hover:bg-muted/80',
} as const;

type DefaultBadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
/** Badge variants. `neutral`, `ghost` and `link` are workspace-only; by default they render as `secondary`. */
export type BadgeVariant = DefaultBadgeVariant | keyof typeof WORKSPACE_BADGE_VARIANT;

/** The workspace (base-vega) badge classes for a variant. */
export function workspaceBadgeVariants({
  variant = 'default',
  className,
}: { variant?: BadgeVariant | null; className?: string } = {}): string {
  return cn(WORKSPACE_BADGE_BASE, WORKSPACE_BADGE_VARIANT[variant ?? 'default'], className);
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    Omit<VariantProps<typeof badgeVariants>, 'variant'> {
  /** Variant. With `appearance="workspace"` it defaults to `default`, as in the test. */
  variant?: BadgeVariant | null;
  /** `workspace` renders the usability test's base-vega badge (see UIAppearance). */
  appearance?: UIAppearance;
  dot?: boolean;
  isRemovable?: boolean;
  onRemove?: () => void;
  dataTestId?: string;
  /** Workspace only: renders the child element (e.g. an `<a>`) with the badge's classes. */
  asChild?: boolean;
}

function Badge({
  appearance = 'default',
  ...rest
}: BadgeProps): React.ReactElement {
  if (appearance === 'workspace') return <WorkspaceBadge {...rest} />;
  const { variant, asChild: _asChild, ...props } = rest;
  return (
    <DefaultBadge
      variant={
        variant === 'neutral' || variant === 'ghost' || variant === 'link' ? 'secondary' : variant
      }
      {...props}
    />
  );
}

/** The test's badge: its classes, children laid out directly (no truncating span). */
function WorkspaceBadge({
  className,
  variant = 'default',
  size: _size,
  pill: _pill,
  dot = false,
  isRemovable = false,
  onRemove,
  children,
  dataTestId,
  asChild = false,
  ...props
}: Omit<BadgeProps, 'appearance'>): React.ReactElement {
  if (asChild) {
    return (
      <Slot
        data-slot="badge"
        data-testid={dataTestId}
        className={workspaceBadgeVariants({ variant, className })}
        {...props}
      >
        {children}
      </Slot>
    );
  }
  return (
    <span
      data-slot="badge"
      data-testid={dataTestId}
      className={workspaceBadgeVariants({ variant, className })}
      {...props}
    >
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />}
      {children}
      {isRemovable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove badge"
          className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-sm opacity-65 transition-opacity hover:bg-black/10 hover:opacity-100"
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
}

function DefaultBadge({
  className,
  variant = 'secondary',
  size = 'md',
  pill = false,
  dot = false,
  isRemovable = false,
  onRemove,
  children,
  dataTestId,
  ...props
}: Omit<BadgeProps, 'appearance' | 'variant' | 'asChild'> & {
  variant?: DefaultBadgeVariant | null;
}): React.ReactElement {
  return (
    <span
      data-testid={dataTestId}
      className={cn(badgeVariants({ variant, size, pill }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn('size-1.5 rounded-full shrink-0', DOT_COLORS[variant ?? 'secondary'])}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{children}</span>
      {isRemovable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove badge"
          className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-sm opacity-65 hover:opacity-100 hover:bg-black/10 transition-opacity"
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
