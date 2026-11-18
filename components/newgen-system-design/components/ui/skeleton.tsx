import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

export function Skeleton({
  className,
  appearance = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  /** `workspace`: the usability test's base-vega skeleton (solid bg-muted). */
  appearance?: UIAppearance;
}): React.ReactElement {
  if (appearance === 'workspace') {
    return (
      <div
        data-slot="skeleton"
        className={cn('animate-pulse rounded-md bg-muted', className)}
        {...props}
      />
    );
  }
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/80', className)}
      {...props}
    />
  );
}
