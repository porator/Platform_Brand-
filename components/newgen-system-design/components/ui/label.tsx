import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { IconInfoCircle as Info } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';
import { SimpleTooltip } from './tooltip';

const labelVariants = cva(
  'inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60'
);

/** workspace: the usability test's components/ui/label.tsx (base-vega). */
const WORKSPACE_LABEL =
  'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50';

export interface ILabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  isRequired?: boolean;
  infoTooltipContent?: React.ReactNode;
  infoTooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  /** `workspace` renders the usability test's base-vega label (children laid out directly). */
  appearance?: UIAppearance;
}

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, ILabelProps>(
  (
    {
      className,
      children,
      isRequired,
      infoTooltipContent,
      infoTooltipSide = 'top',
      appearance = 'default',
      ...props
    },
    ref
  ) => (
    <LabelPrimitive.Root
      ref={ref}
      {...(appearance === 'workspace' ? { 'data-slot': 'label' } : {})}
      className={cn(appearance === 'workspace' ? WORKSPACE_LABEL : labelVariants(), className)}
      {...props}
    >
      {appearance === 'workspace' ? children : <span>{children}</span>}
      {isRequired && (
        <span className="text-destructive font-semibold" aria-hidden="true">
          *
        </span>
      )}
      {infoTooltipContent && (
        <SimpleTooltip content={infoTooltipContent} side={infoTooltipSide}>
          <span
            role="img"
            aria-label="More information"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-help"
          >
            <Info className="size-3.5" />
          </span>
        </SimpleTooltip>
      )}
    </LabelPrimitive.Root>
  )
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label, labelVariants };
