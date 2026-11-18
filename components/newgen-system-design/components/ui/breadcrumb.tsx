import { Slot } from '@radix-ui/react-slot';
import { IconChevronRight, IconDots } from '@/lib/icons';
import { IconChevronRight as ChevronRight, IconDots as MoreHorizontal } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/breadcrumb.tsx (base-vega): data-slot on every
 * part, wrap-break-word (from the preset), tabler chevron / dots icons and a 20px ellipsis.
 * Base UI's render prop on BreadcrumbLink → asChild. The Breadcrumb passes the appearance to
 * its parts.
 */
const WORKSPACE_BREADCRUMB = {
  list: 'flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground sm:gap-2.5',
  item: 'inline-flex items-center gap-1.5',
  link: 'transition-colors hover:text-foreground',
  page: 'font-normal text-foreground',
  separator: '[&>svg]:size-3.5',
  ellipsis: 'flex size-5 items-center justify-center [&>svg]:size-4',
} as const;

const BreadcrumbAppearanceContext = React.createContext<UIAppearance>('default');

/** A part's appearance: its own prop, else the enclosing Breadcrumb's. */
function useBreadcrumbAppearance(own?: UIAppearance): UIAppearance {
  const inherited = React.useContext(BreadcrumbAppearanceContext);
  return own ?? inherited;
}

type WithAppearance<T> = T & {
  /** Defaults to the enclosing Breadcrumb's appearance. */
  appearance?: UIAppearance;
};

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
    /** `workspace` renders the usability test's base-vega breadcrumb and its parts. */
    appearance?: UIAppearance;
  }
>(({ appearance = 'default', ...props }, ref) => (
  <BreadcrumbAppearanceContext.Provider value={appearance}>
    {appearance === 'workspace' ? (
      <nav ref={ref} aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
    ) : (
      <nav ref={ref} aria-label="breadcrumb" {...props} />
    )}
  </BreadcrumbAppearanceContext.Provider>
));
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  WithAppearance<React.ComponentPropsWithoutRef<'ol'>>
>(({ className, appearance, ...props }, ref) =>
  useBreadcrumbAppearance(appearance) === 'workspace' ? (
    <ol
      ref={ref}
      data-slot="breadcrumb-list"
      className={cn(WORKSPACE_BREADCRUMB.list, className)}
      {...props}
    />
  ) : (
    <ol
      ref={ref}
      className={cn(
        'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
        className
      )}
      {...props}
    />
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  WithAppearance<React.ComponentPropsWithoutRef<'li'>>
>(({ className, appearance, ...props }, ref) =>
  useBreadcrumbAppearance(appearance) === 'workspace' ? (
    <li
      ref={ref}
      data-slot="breadcrumb-item"
      className={cn(WORKSPACE_BREADCRUMB.item, className)}
      {...props}
    />
  ) : (
    <li ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...props} />
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  WithAppearance<React.ComponentPropsWithoutRef<'a'> & { asChild?: boolean }>
>(({ asChild, className, appearance, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';
  return useBreadcrumbAppearance(appearance) === 'workspace' ? (
    <Comp
      ref={ref}
      data-slot="breadcrumb-link"
      className={cn(WORKSPACE_BREADCRUMB.link, className)}
      {...props}
    />
  ) : (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  WithAppearance<React.ComponentPropsWithoutRef<'span'>>
>(({ className, appearance, ...props }, ref) =>
  useBreadcrumbAppearance(appearance) === 'workspace' ? (
    <span
      ref={ref}
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(WORKSPACE_BREADCRUMB.page, className)}
      {...props}
    />
  ) : (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  appearance,
  ...props
}: WithAppearance<React.ComponentProps<'li'>>): React.ReactElement =>
  useBreadcrumbAppearance(appearance) === 'workspace' ? (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(WORKSPACE_BREADCRUMB.separator, className)}
      {...props}
    >
      {children ?? <IconChevronRight />}
    </li>
  ) : (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  appearance,
  ...props
}: WithAppearance<React.ComponentProps<'span'>>): React.ReactElement =>
  useBreadcrumbAppearance(appearance) === 'workspace' ? (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(WORKSPACE_BREADCRUMB.ellipsis, className)}
      {...props}
    >
      <IconDots />
      <span className="sr-only">More</span>
    </span>
  ) : (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-3.5" />
      <span className="sr-only">More</span>
    </span>
  );
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
