import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { IconCheck, IconMinus } from '@/lib/icons';
import { IconCheck as Check, IconMinus as Minus } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';
import { Label } from './label';

/*
 * workspace: the usability test's components/ui/checkbox.tsx (base-vega), translated to
 * Tailwind 3 / Radix: data-checked → data-[state=checked]; data-indeterminate →
 * data-[state=indeterminate]; not-data-checked → [&:not([data-state=checked])];
 * group-has-disabled → group-has-[:disabled]; ring-3 → ring-[3px]. Base UI's keepMounted
 * indicator → Radix forceMount, with both icons toggled by the root's state.
 */
const WORKSPACE_CHECKBOX = {
  root: 'group/checkbox peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input shadow-xs transition-shadow outline-none group-has-[:disabled]/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:[&:not([data-state=checked])]:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground group-has-[:focus-visible]/field-label:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary dark:data-[state=indeterminate]:bg-primary',
  indicator: 'grid place-content-center text-current transition-none [&>svg]:size-3.5',
} as const;

type UICheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  /** `workspace` renders the usability test's base-vega checkbox (see UIAppearance). */
  appearance?: UIAppearance;
  /** The test's (Base UI) indeterminate flag: shows the dash, as `checked="indeterminate"` does. */
  indeterminate?: boolean;
};

export interface CheckboxProps extends UICheckboxProps {
  label?: string;
  description?: string;
  isDisabled?: boolean;
  variant?: 'default' | 'card';
  dataTestId?: string;
}

const UICheckbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, UICheckboxProps>(
  ({ appearance = 'default', indeterminate, ...rest }, ref) => {
    const props = indeterminate ? { ...rest, checked: 'indeterminate' as const } : rest;
    return appearance === 'workspace' ? (
      <WorkspaceCheckbox ref={ref} {...props} />
    ) : (
      <DefaultCheckbox ref={ref} {...props} />
    );
  }
);
UICheckbox.displayName = CheckboxPrimitive.Root.displayName;

const WorkspaceCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(WORKSPACE_CHECKBOX.root, className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      forceMount
      data-slot="checkbox-indicator"
      className={WORKSPACE_CHECKBOX.indicator}
    >
      <IconCheck className="hidden group-data-[state=checked]/checkbox:block" />
      <IconMinus className="hidden group-data-[state=indeterminate]/checkbox:block" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
WorkspaceCheckbox.displayName = 'WorkspaceCheckbox';

const DefaultCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-[4px] border border-input bg-card shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      {props.checked === 'indeterminate' ? (
        <Minus className="size-3 stroke-[2.5]" />
      ) : (
        <Check className="size-3 stroke-[2.5]" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
DefaultCheckbox.displayName = 'DefaultCheckbox';

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  (
    {
      label,
      description,
      isDisabled = false,
      disabled,
      variant = 'default',
      className,
      dataTestId,
      id,
      appearance,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const resolvedDisabled = disabled ?? isDisabled;

    if (!label && !description) {
      return (
        <UICheckbox
          ref={ref}
          id={checkboxId}
          disabled={resolvedDisabled}
          data-testid={dataTestId}
          className={className}
          appearance={appearance}
          {...props}
        />
      );
    }

    return (
      <div
        className={cn(
          'flex items-start gap-2.5',
          variant === 'card' &&
            'rounded-lg border border-border bg-card p-3.5 shadow-xs hover:border-border-strong transition-colors',
          resolvedDisabled && 'opacity-60 cursor-not-allowed',
          className
        )}
      >
        <UICheckbox
          ref={ref}
          id={checkboxId}
          disabled={resolvedDisabled}
          data-testid={dataTestId}
          className="mt-0.5"
          appearance={appearance}
          {...props}
        />
        <div className="flex flex-col gap-0.5 leading-none">
          {label && (
            <Label htmlFor={checkboxId} className="cursor-pointer font-medium" appearance={appearance}>
              {label}
            </Label>
          )}
          {description && <p className="text-xs leading-4 text-muted-foreground">{description}</p>}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox, UICheckbox };
