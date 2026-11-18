import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { IconPlus as Plus, IconUpload as Upload } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { Spinner } from './spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-[0.5px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 border border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground border border-border shadow-xs hover:bg-accent hover:border-border-strong',
        outline:
          'bg-card text-foreground border border-border shadow-xs hover:bg-surface-subtle hover:border-border-strong',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 border border-transparent',
        success:
          'bg-success text-success-foreground shadow-sm hover:opacity-90 border border-transparent',
        warning:
          'bg-warning text-warning-foreground shadow-sm hover:opacity-90 border border-transparent',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
        text: 'text-primary hover:bg-primary-subtle/60',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-sm',
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-3.5 py-1.5',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * `default` is this package's own look. `workspace` renders the Projects & Navigation usability
 * test's base-vega atom class for class (see each primitive's WORKSPACE_* constants), for the
 * workspace screens built from it. Compound primitives pass it from their root / content to
 * their parts.
 */
export type UIAppearance = 'default' | 'workspace';

/*
 * workspace: the usability test's components/ui/button.tsx (shadcn base-vega, customised: pills
 * everywhere, a dark gradient primary, and heights 2px taller than stock: xs 26, sm 34,
 * default 38, lg 42px), translated to Tailwind 3: ring-3 → ring-[3px];
 * active:not-aria-[haspopup] → [&:active:not([aria-haspopup])]; in-data-[slot=button-group] →
 * [[data-slot=button-group]_&]; has-data-[x] → has-[[data-x]]; bg-linear-to-b →
 * bg-gradient-to-b; color-mix arbitrary colours typed with `color:`.
 */
const WORKSPACE_BUTTON_BASE =
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&:active:not([aria-haspopup])]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const WORKSPACE_BUTTON_VARIANT = {
  default:
    'rounded-[200px] border-0 bg-clip-border bg-primary bg-gradient-to-b from-[#272727] to-[#302F2F] text-primary-foreground shadow-md hover:opacity-90 dark:bg-none dark:hover:bg-primary/80',
  outline:
    'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-[color:color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
  ghost:
    'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
  destructive:
    'bg-destructive/10 text-[color:color-mix(in_oklch,var(--destructive),var(--foreground)_24%)] hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
  link: 'text-primary underline-offset-4 hover:underline',
} as const;

const WORKSPACE_BUTTON_SIZE = {
  default:
    'h-9.5 gap-1.5 px-3.5 [[data-slot=button-group]_&]:rounded-md has-[[data-icon=inline-end]]:pr-2.5 has-[[data-icon=inline-start]]:pl-2.5',
  xs: "h-6.5 gap-1 px-2.5 text-xs [[data-slot=button-group]_&]:rounded-md has-[[data-icon=inline-end]]:pr-1.5 has-[[data-icon=inline-start]]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: 'h-8.5 gap-1 px-3 [[data-slot=button-group]_&]:rounded-md has-[[data-icon=inline-end]]:pr-1.5 has-[[data-icon=inline-start]]:pl-1.5',
  lg: 'h-10.5 gap-1.5 px-4 has-[[data-icon=inline-end]]:pr-2.5 has-[[data-icon=inline-start]]:pl-2.5',
  icon: 'size-9.5',
  'icon-xs':
    "size-6.5 [[data-slot=button-group]_&]:rounded-md [&_svg:not([class*='size-'])]:size-3",
  'icon-sm': 'size-8.5 [[data-slot=button-group]_&]:rounded-md',
  'icon-lg': 'size-10.5',
} as const;

type DefaultButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;
type DefaultButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = DefaultButtonSize | keyof typeof WORKSPACE_BUTTON_SIZE;

/**
 * The workspace (base-vega) button classes. Variants and sizes the test's button lacks fall
 * back to its `default` ones (success / warning / text → default; size names map 1:1).
 */
export function workspaceButtonVariants({
  variant,
  size,
  className,
}: {
  variant?: DefaultButtonVariant | null;
  size?: ButtonSize | null;
  className?: string;
} = {}): string {
  const v =
    variant && variant in WORKSPACE_BUTTON_VARIANT
      ? (variant as keyof typeof WORKSPACE_BUTTON_VARIANT)
      : 'default';
  return cn(
    WORKSPACE_BUTTON_BASE,
    WORKSPACE_BUTTON_VARIANT[v],
    WORKSPACE_BUTTON_SIZE[size ?? 'default'],
    className
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, 'size'> {
  /**
   * Size. `icon-xs`, `icon-sm` and `icon-lg` are the workspace (base-vega) sizes; with the
   * default appearance they render as `icon`.
   */
  size?: ButtonSize | null;
  /** `workspace` renders the usability test's base-vega button (see UIAppearance). */
  appearance?: UIAppearance;
  asChild?: boolean;
  isLoading?: boolean;
  isCreateButton?: boolean;
  isUploadButton?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  kbd?: string;
  dataTestId?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      isLoading = false,
      isCreateButton = false,
      isUploadButton = false,
      leftIcon,
      rightIcon,
      kbd,
      disabled,
      children,
      dataTestId,
      type = 'button',
      appearance = 'default',
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const workspace = appearance === 'workspace';

    const resolvedLeftIcon = React.useMemo(() => {
      if (isLoading) return <Spinner size="sm" />;
      if (isCreateButton) return leftIcon ?? <Plus className="size-4" />;
      return leftIcon ?? null;
    }, [isLoading, isCreateButton, leftIcon]);

    const resolvedRightIcon = React.useMemo(() => {
      if (isUploadButton && !isLoading) return rightIcon ?? <Upload className="size-4" />;
      return rightIcon ?? null;
    }, [isUploadButton, isLoading, rightIcon]);

    if (workspace) {
      const classes = workspaceButtonVariants({ variant, size, className });
      if (asChild) {
        return (
          <Comp
            data-slot="button"
            className={classes}
            ref={ref}
            data-testid={dataTestId}
            {...props}
          >
            {children}
          </Comp>
        );
      }
      // The test's button lays its icon and label out as direct flex children (no span), so
      // its gap separates them.
      return (
        <Comp
          data-slot="button"
          type={type}
          className={classes}
          ref={ref}
          disabled={disabled || isLoading}
          data-testid={dataTestId}
          {...props}
        >
          {resolvedLeftIcon}
          {children}
          {resolvedRightIcon}
          {kbd && (
            <kbd className="ml-1 inline-flex h-4 items-center rounded-sm border border-current/20 bg-black/10 px-1 font-mono text-xs font-medium opacity-80">
              {kbd}
            </kbd>
          )}
        </Comp>
      );
    }

    const defaultSize: DefaultButtonSize | null | undefined =
      size === 'icon-xs' || size === 'icon-sm' || size === 'icon-lg' ? 'icon' : size;

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size: defaultSize, className }))}
          ref={ref}
          data-testid={dataTestId}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        type={type}
        className={cn(buttonVariants({ variant, size: defaultSize, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        data-testid={dataTestId}
        {...props}
      >
        {resolvedLeftIcon}
        {children && <span>{children}</span>}
        {resolvedRightIcon}
        {kbd && (
          <kbd className="ml-1 inline-flex h-4 items-center rounded-sm border border-current/20 bg-black/10 px-1 font-mono text-xs font-medium opacity-80">
            {kbd}
          </kbd>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants, Button as UIButton };
