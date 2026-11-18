import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';
import type { InputValidationState } from './input';
import { Label } from './label';

/*
 * workspace: the usability test's components/ui/textarea.tsx (base-vega), translated to
 * Tailwind 3 (ring-3 → ring-[3px]; field-sizing-content comes from the preset).
 */
const WORKSPACE_TEXTAREA =
  'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  state?: InputValidationState;
  isRequired?: boolean;
  infoTooltipContent?: React.ReactNode;
  showCount?: boolean;
  dataTestId?: string;
  /**
   * `workspace` renders the usability test's base-vega textarea and label; the error state then
   * shows through aria-invalid, as in the test.
   */
  appearance?: UIAppearance;
}

const UITextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /** `workspace` renders the usability test's base-vega textarea (see UIAppearance). */
    appearance?: UIAppearance;
  }
>(({ className, appearance = 'default', ...props }, ref) =>
  appearance === 'workspace' ? (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(WORKSPACE_TEXTAREA, className)}
      {...props}
    />
  ) : (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[84px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-all placeholder:text-muted-foreground/75 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-60',
      className
    )}
    {...props}
  />
  )
);
UITextarea.displayName = 'UITextarea';

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      description,
      state = 'default',
      isRequired = false,
      infoTooltipContent,
      showCount = false,
      maxLength,
      value,
      defaultValue,
      className,
      dataTestId,
      id,
      onChange,
      appearance = 'default',
      ...props
    },
    ref
  ) => {
    const workspace = appearance === 'workspace';
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const [charCount, setCharCount] = React.useState<number>(
      String(value ?? defaultValue ?? '').length
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        {(label || (showCount && maxLength)) && (
          <div className="flex items-center justify-between">
            {label ? (
              <Label
                htmlFor={textareaId}
                isRequired={isRequired}
                infoTooltipContent={infoTooltipContent}
                appearance={appearance}
              >
                {label}
              </Label>
            ) : (
              <span />
            )}
            {showCount && maxLength && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <UITextarea
          ref={ref}
          id={textareaId}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          data-testid={dataTestId}
          onChange={handleChange}
          appearance={appearance}
          aria-invalid={workspace && state === 'error' ? true : props['aria-invalid']}
          className={cn(
            !workspace &&
              state === 'error' &&
              'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            !workspace &&
              state === 'success' &&
              'border-success focus-visible:border-success focus-visible:ring-success/20'
          )}
          {...props}
        />
        {description && (
          <p
            className={cn(
              'text-xs leading-4',
              state === 'error'
                ? 'text-destructive'
                : state === 'success'
                  ? 'text-success'
                  : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, UITextarea };
