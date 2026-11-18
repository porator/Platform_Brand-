import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/popover.tsx PopoverContent (base-vega),
 * translated to Tailwind 3 / Radix: origin-(--transform-origin) → Radix's transform-origin
 * variable; outline-hidden → outline-none; data-open / data-closed → data-[state=…], with the
 * 100ms repeated under them (tailwindcss-animate's animate-in sets 150ms). Its defaults
 * (align center, sideOffset 4) apply. PopoverHeader / PopoverTitle / PopoverDescription are the
 * test's extra parts (workspace look only).
 */
const WORKSPACE_POPOVER_CONTENT =
  'z-50 flex w-72 origin-[--radix-popover-content-transform-origin] flex-col gap-4 rounded-md bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:duration-100 data-[state=closed]:duration-100';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    /** `workspace` renders the usability test's base-vega popover (see UIAppearance). */
    appearance?: UIAppearance;
  }
>(({ appearance = 'default', ...rest }, ref) =>
  appearance === 'workspace' ? (
    <WorkspacePopoverContent ref={ref} {...rest} />
  ) : (
    <DefaultPopoverContent ref={ref} {...rest} />
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const WorkspacePopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(WORKSPACE_POPOVER_CONTENT, className)}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
WorkspacePopoverContent.displayName = 'WorkspacePopoverContent';

const DefaultPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 6, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
DefaultPopoverContent.displayName = PopoverPrimitive.Content.displayName;

/** The test's popover header (workspace look): a 4px-gap column for PopoverTitle / PopoverDescription. */
const PopoverHeader = ({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement => (
  <div data-slot="popover-header" className={cn('flex flex-col gap-1 text-sm', className)} {...props} />
);
PopoverHeader.displayName = 'PopoverHeader';

/** The test's popover title (workspace look; Base UI's Popover.Title is an h2). */
const PopoverTitle = ({ className, ...props }: React.ComponentProps<'h2'>): React.ReactElement => (
  <h2 data-slot="popover-title" className={cn('font-medium', className)} {...props} />
);
PopoverTitle.displayName = 'PopoverTitle';

/** The test's popover description (workspace look). */
const PopoverDescription = ({
  className,
  ...props
}: React.ComponentProps<'p'>): React.ReactElement => (
  <p data-slot="popover-description" className={cn('text-muted-foreground', className)} {...props} />
);
PopoverDescription.displayName = 'PopoverDescription';

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
