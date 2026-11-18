import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/separator.tsx (base-vega), translated to Radix:
 * data-horizontal / data-vertical → data-[orientation=horizontal|vertical]. Base UI's separator
 * is semantic, so the workspace one defaults to decorative={false}.
 */
const WORKSPACE_SEPARATOR =
  'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch';

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  label?: string;
  /** `workspace` renders the usability test's base-vega separator (see UIAppearance). */
  appearance?: UIAppearance;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = 'horizontal', decorative, label, appearance = 'default', ...props }, ref) => {
  if (appearance === 'workspace') {
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        data-slot="separator"
        decorative={decorative ?? false}
        orientation={orientation}
        className={cn(WORKSPACE_SEPARATOR, className)}
        {...props}
      />
    );
  }
  if (label && orientation === 'horizontal') {
    return (
      <div className={cn('relative flex items-center py-2', className)}>
        <div className="flex-grow border-t border-border" />
        <span className="mx-3 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex-grow border-t border-border" />
      </div>
    );
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative ?? true}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
