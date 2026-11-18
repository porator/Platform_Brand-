import { cva, type VariantProps } from 'class-variance-authority';
import { IconAlertCircle as AlertCircle, IconCircleCheck as CheckCircle2, IconInfoCircle as Info, IconAlertTriangle as TriangleAlert, IconX as X } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-xs',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-subtle text-foreground',
        info: 'border-info/25 bg-info-subtle text-foreground',
        success: 'border-success/25 bg-success-subtle text-foreground',
        warning: 'border-warning/30 bg-warning-subtle text-foreground',
        destructive: 'border-destructive/25 bg-destructive-subtle text-foreground',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const VARIANT_ICONS: Record<
  NonNullable<VariantProps<typeof alertVariants>['variant']>,
  React.ReactNode
> = {
  default: <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />,
  info: <Info className="size-4 text-info shrink-0 mt-0.5" />,
  success: <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />,
  warning: <TriangleAlert className="size-4 text-warning shrink-0 mt-0.5" />,
  destructive: <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />,
};

/*
 * workspace: the usability test's components/ui/alert.tsx (base-vega, with its extended status
 * variants): a grid of an optional leading icon, AlertTitle and AlertDescription, plus an
 * AlertAction pinned top-right. Translated to Tailwind 3: has-data-[x] → has-[[data-x]];
 * *:[svg] → [&>svg]; *:data-[slot=x] → [&>[data-slot=x]]; [&_a]:hover → [&_a:hover].
 */
const WORKSPACE_ALERT_BASE =
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-[[data-slot=alert-action]]:relative has-[[data-slot=alert-action]]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 [&>svg]:row-span-2 [&>svg]:translate-y-0.5 [&>svg]:text-current [&>svg:not([class*='size-'])]:size-4";

const WORKSPACE_ALERT_VARIANT = {
  default: 'bg-card text-card-foreground',
  destructive:
    'bg-card text-destructive [&>[data-slot=alert-description]]:text-destructive/90 [&>svg]:text-current',
  success:
    'border-success/40 bg-card text-card-foreground [&>svg]:text-success [&>[data-slot=alert-title]]:text-success',
  warning:
    'border-warning/40 bg-card text-card-foreground [&>svg]:text-warning [&>[data-slot=alert-title]]:text-warning',
  info: 'border-info/40 bg-card text-card-foreground [&>svg]:text-info [&>[data-slot=alert-title]]:text-info',
} as const;

const WORKSPACE_ALERT_PART = {
  title:
    'font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a:hover]:text-foreground',
  description:
    'text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a:hover]:text-foreground [&_p:not(:last-child)]:mb-4',
  action: 'absolute top-2.5 right-3',
} as const;

/** The workspace (base-vega) alert classes for a variant. */
export function workspaceAlertVariants({
  variant = 'default',
  className,
}: {
  variant?: keyof typeof WORKSPACE_ALERT_VARIANT | null;
  className?: string;
} = {}): string {
  return cn(WORKSPACE_ALERT_BASE, WORKSPACE_ALERT_VARIANT[variant ?? 'default'], className);
}

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertVariants> {
  /**
   * `workspace` renders the usability test's base-vega alert: a container for an icon,
   * AlertTitle, AlertDescription and AlertAction (children), with the variant defaulting to
   * `default`. `title` / `message` / `action` still render, as AlertTitle / AlertDescription /
   * AlertAction.
   */
  appearance?: UIAppearance;
  title?: React.ReactNode;
  message?: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
  dataTestId?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant: variantProp,
      title,
      message,
      children,
      onClose,
      action,
      dataTestId,
      appearance = 'default',
      ...props
    },
    ref
  ) => {
    if (appearance === 'workspace') {
      return (
      <div
        ref={ref}
        data-slot="alert"
        role="alert"
        data-testid={dataTestId}
        className={workspaceAlertVariants({ variant: variantProp, className })}
        {...props}
      >
        {children}
        {title && <AlertTitle>{title}</AlertTitle>}
        {message && <AlertDescription>{message}</AlertDescription>}
        {action && <AlertAction>{action}</AlertAction>}
        {onClose && (
          <AlertAction>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close alert"
              className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </AlertAction>
        )}
      </div>
      );
    }
    const variant = variantProp === undefined ? 'info' : variantProp;
    return (
    <div
      ref={ref}
      role="alert"
      data-testid={dataTestId}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {VARIANT_ICONS[variant ?? 'info']}
      <div className="flex flex-1 flex-col gap-0.5">
        {title && <div className="font-semibold leading-5">{title}</div>}
        <div className="text-muted-foreground leading-5">{message ?? children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          className="rounded-sm p-1 text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
    );
  }
);
Alert.displayName = 'Alert';

/** The test's alert title (workspace look). */
const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-title"
      className={cn(WORKSPACE_ALERT_PART.title, className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

/** The test's alert description (workspace look). */
const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn(WORKSPACE_ALERT_PART.description, className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

/** The test's top-right alert action slot (workspace look). */
const AlertAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-action"
      className={cn(WORKSPACE_ALERT_PART.action, className)}
      {...props}
    />
  )
);
AlertAction.displayName = 'AlertAction';

export const InfoBanner = Alert;
export { AlertAction, AlertDescription, AlertTitle, alertVariants };
