import { IconLoader2 as Loader2, type IconProps as LucideProps } from '@/lib/icons';
import React from 'react';

import { cn } from '../../utils/cn';

export interface ISpinnerProps extends LucideProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ISpinnerProps['size']>, string> = {
  xs: 'size-3',
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

export function Spinner({ className, size = 'md', ...props }: ISpinnerProps): React.ReactElement {
  return (
    <Loader2
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('animate-spin text-current shrink-0', SIZE_CLASSES[size], className)}
      {...props}
    />
  );
}
