import { IconCheck as Check, IconCopy as Copy } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';
import { Label } from './label';

export type InputValidationState = 'default' | 'error' | 'success';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  description?: string;
  state?: InputValidationState;
  isHorizontal?: boolean;
  isRequired?: boolean;
  infoTooltipContent?: React.ReactNode;
  infoTooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixAddon?: React.ReactNode;
  suffixAddon?: React.ReactNode;
  enableCopy?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  dataTestId?: string;
  descriptionDataTestId?: string;
  /**
   * `workspace` renders the usability test's base-vega input and label; the error state then
   * shows through aria-invalid, as in the test.
   */
  appearance?: UIAppearance;
}

/*
 * workspace: the usability test's components/ui/input.tsx (base-vega), translated to Tailwind 3
 * (ring-3 → ring-[3px]).
 */
const WORKSPACE_INPUT =
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40';

const STATE_RING_CLASSES: Record<InputValidationState, string> = {
  default:
    'border-input focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20',
  error:
    'border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20',
  success:
    'border-success focus-visible:border-success focus-visible:ring-2 focus-visible:ring-success/20',
};

const STATE_TEXT_CLASSES: Record<InputValidationState, string> = {
  default: 'text-muted-foreground',
  error: 'text-destructive',
  success: 'text-success',
};

const UIInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    /** `workspace` renders the usability test's base-vega input (see UIAppearance). */
    appearance?: UIAppearance;
  }
>(({ className, type = 'text', appearance = 'default', ...props }, ref) =>
  appearance === 'workspace' ? (
    <input
      type={type}
      ref={ref}
      data-slot="input"
      className={cn(WORKSPACE_INPUT, className)}
      {...props}
    />
  ) : (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground shadow-xs transition-all file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground/75 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-60',
        className
      )}
      {...props}
    />
  )
);
UIInput.displayName = 'UIInput';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      state = 'default',
      isHorizontal = false,
      isRequired = false,
      infoTooltipContent,
      infoTooltipSide = 'top',
      leftIcon,
      rightIcon,
      prefixAddon,
      suffixAddon,
      enableCopy = false,
      className,
      inputClassName,
      labelClassName,
      dataTestId,
      descriptionDataTestId,
      id,
      value,
      defaultValue,
      appearance = 'default',
      ...props
    },
    ref
  ) => {
    const workspace = appearance === 'workspace';
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
      const textToCopy = String(value ?? defaultValue ?? '');
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        void navigator.clipboard.writeText(textToCopy);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };

    return (
      <div
        className={cn(
          'flex w-full',
          isHorizontal ? 'flex-row items-center gap-4' : 'flex-col gap-1.5',
          className
        )}
      >
        {label && (
          <Label
            htmlFor={inputId}
            isRequired={isRequired}
            infoTooltipContent={infoTooltipContent}
            infoTooltipSide={infoTooltipSide}
            className={cn(isHorizontal && 'min-w-[140px] shrink-0', labelClassName)}
            {...(workspace ? { appearance } : {})}
          >
            {label}
          </Label>
        )}

        <div className="flex flex-1 flex-col gap-1">
          <div className="relative flex items-center">
            {prefixAddon && (
              <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-input bg-surface-subtle px-2.5 text-xs font-medium text-muted-foreground">
                {prefixAddon}
              </span>
            )}
            {leftIcon && (
              <span className="pointer-events-none absolute left-3 inline-flex items-center text-muted-foreground [&_svg]:size-4">
                {leftIcon}
              </span>
            )}
            <UIInput
              ref={ref}
              id={inputId}
              value={value}
              defaultValue={defaultValue}
              data-testid={dataTestId}
              aria-invalid={state === 'error'}
              {...(workspace ? { appearance } : {})}
              className={cn(
                !workspace && STATE_RING_CLASSES[state],
                leftIcon && 'pl-9',
                (rightIcon || enableCopy) && 'pr-9',
                prefixAddon && 'rounded-l-none',
                suffixAddon && 'rounded-r-none',
                inputClassName
              )}
              {...props}
            />
            {(rightIcon || enableCopy) && (
              <span className="absolute right-2.5 inline-flex items-center text-muted-foreground [&_svg]:size-4">
                {enableCopy ? (
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy value"
                    className="rounded-sm p-1 hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                ) : (
                  rightIcon
                )}
              </span>
            )}
            {suffixAddon && (
              <span className="inline-flex h-9 items-center rounded-r-md border border-l-0 border-input bg-surface-subtle px-2.5 text-xs font-medium text-muted-foreground">
                {suffixAddon}
              </span>
            )}
          </div>

          {description && (
            <p
              data-testid={descriptionDataTestId}
              className={cn('text-xs leading-4', STATE_TEXT_CLASSES[state])}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input, UIInput };
