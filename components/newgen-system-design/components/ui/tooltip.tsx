import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/tooltip.tsx TooltipContent (base-vega): a
 * foreground-coloured chip with a rounded 10px diamond arrow, side top / sideOffset 4. Translated
 * to Tailwind 3 / Radix: origin-(--transform-origin) → Radix's variable; data-open → Radix's
 * delayed-open / instant-open; **:data-[slot=kbd] → [&_[data-slot=kbd]]. The arrow is drawn
 * on a zero-height Radix Arrow (so Radix adds nothing to the side offset, as Base UI doesn't),
 * its ::after being the test's diamond.
 */
const WORKSPACE_TOOLTIP_CONTENT =
  'z-50 inline-flex w-fit max-w-xs origin-[--radix-tooltip-content-transform-origin] items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-[[data-slot=kbd]]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 [&_[data-slot=kbd]]:relative [&_[data-slot=kbd]]:isolate [&_[data-slot=kbd]]:z-50 [&_[data-slot=kbd]]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95';

const WORKSPACE_TOOLTIP_ARROW =
  'relative z-50 block h-0 w-2.5 after:absolute after:left-0 after:top-0 after:size-2.5 after:translate-y-[calc(-50%-2px)] after:rotate-45 after:rounded-[2px] after:bg-foreground';

export enum ETooltipSide {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    /** `workspace` renders the usability test's base-vega tooltip, arrow included. */
    appearance?: UIAppearance;
  }
>(({ appearance = 'default', ...rest }, ref) =>
  appearance === 'workspace' ? (
    <WorkspaceTooltipContent ref={ref} {...rest} />
  ) : (
    <DefaultTooltipContent ref={ref} {...rest} />
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const WorkspaceTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, side = 'top', sideOffset = 4, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      data-slot="tooltip-content"
      side={side}
      sideOffset={sideOffset}
      className={cn(WORKSPACE_TOOLTIP_CONTENT, className)}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow asChild>
        <span className={WORKSPACE_TOOLTIP_ARROW} />
      </TooltipPrimitive.Arrow>
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
WorkspaceTooltipContent.displayName = 'WorkspaceTooltipContent';

const DefaultTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-w-xs overflow-hidden rounded-md border border-border bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
DefaultTooltipContent.displayName = TooltipPrimitive.Content.displayName;

export interface ISimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  /** `workspace` renders the usability test's base-vega tooltip content. */
  appearance?: UIAppearance;
}

export const SimpleTooltip: React.FC<ISimpleTooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 180,
  className,
  appearance,
}) => (
  <TooltipProvider delayDuration={delayDuration}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className={className}
        {...(appearance ? { appearance } : {})}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
