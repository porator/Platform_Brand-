import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/card.tsx (base-vega), translated to Tailwind 3:
 * gap-(--x) → gap-[--x]; --spacing(n) → theme(spacing.n); *:[img:first-child] → [&>img:first-child];
 * has-data-[x] → has-[[data-x]]; [.border-b] → [&.border-b]; @container/card-header → the
 * container-type / container-name it sets. The Card passes the appearance to its parts.
 */
const WORKSPACE_CARD = {
  root: 'group/card flex flex-col gap-[--card-spacing] overflow-hidden rounded-xl bg-card py-[--card-spacing] text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10 [--card-spacing:theme(spacing.6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:theme(spacing.4)] [&>img:first-child]:rounded-t-xl [&>img:last-child]:rounded-b-xl',
  header:
    'group/card-header [container-name:card-header] [container-type:inline-size] grid auto-rows-min items-start gap-1 rounded-t-xl px-[--card-spacing] has-[[data-slot=card-action]]:grid-cols-[1fr_auto] has-[[data-slot=card-description]]:grid-rows-[auto_auto] [&.border-b]:pb-[--card-spacing]',
  title: 'font-heading text-base leading-normal font-semibold group-data-[size=sm]/card:text-sm',
  description: 'text-sm text-muted-foreground',
  action: 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
  content: 'flex flex-col gap-3 px-[--card-spacing]',
  footer: 'flex items-center rounded-b-xl px-[--card-spacing] [&.border-t]:pt-[--card-spacing]',
} as const;

const CardAppearanceContext = React.createContext<UIAppearance>('default');

/** A part's appearance: its own prop, else the enclosing Card's. */
function useCardAppearance(own?: UIAppearance): UIAppearance {
  const inherited = React.useContext(CardAppearanceContext);
  return own ?? inherited;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  /** `workspace` renders the usability test's base-vega card and its parts (see UIAppearance). */
  appearance?: UIAppearance;
  /** Workspace only: the test's card density (`sm` tightens the spacing to 1rem). */
  size?: 'default' | 'sm';
}

export interface CardPartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Defaults to the enclosing Card's appearance. */
  appearance?: UIAppearance;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, elevated = false, interactive = false, appearance = 'default', size, ...props },
    ref
  ) => {
    if (appearance === 'workspace') {
      return (
        <CardAppearanceContext.Provider value="workspace">
          <div
            ref={ref}
            data-slot="card"
            data-size={size ?? 'default'}
            className={cn(
              WORKSPACE_CARD.root,
              elevated && 'shadow-md',
              interactive && 'cursor-pointer hover:shadow-md',
              className
            )}
            {...props}
          />
        </CardAppearanceContext.Provider>
      );
    }
    return (
      <CardAppearanceContext.Provider value="default">
        <div
          ref={ref}
          className={cn(
            'rounded-lg border border-border bg-card text-card-foreground shadow-xs transition-all',
            elevated && 'shadow-md',
            interactive && 'cursor-pointer hover:border-border-strong hover:shadow-md',
            className
          )}
          {...props}
        />
      </CardAppearanceContext.Provider>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardPartProps>(
  ({ className, appearance, ...props }, ref) =>
    useCardAppearance(appearance) === 'workspace' ? (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn(WORKSPACE_CARD.header, className)}
        {...props}
      />
    ) : (
      <div ref={ref} className={cn('flex flex-col space-y-1 p-5', className)} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, CardPartProps>(
  ({ className, appearance, ...props }, ref) =>
    useCardAppearance(appearance) === 'workspace' ? (
      <div
        ref={ref}
        data-slot="card-title"
        className={cn(WORKSPACE_CARD.title, className)}
        {...props}
      />
    ) : (
      <div
        ref={ref}
        className={cn('text-sm font-semibold leading-5 text-card-foreground', className)}
        {...props}
      />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, CardPartProps>(
  ({ className, appearance, ...props }, ref) =>
    useCardAppearance(appearance) === 'workspace' ? (
      <div
        ref={ref}
        data-slot="card-description"
        className={cn(WORKSPACE_CARD.description, className)}
        {...props}
      />
    ) : (
      <div ref={ref} className={cn('text-xs text-muted-foreground', className)} {...props} />
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, CardPartProps>(
  ({ className, appearance, ...props }, ref) =>
    useCardAppearance(appearance) === 'workspace' ? (
      <div
        ref={ref}
        data-slot="card-content"
        className={cn(WORKSPACE_CARD.content, className)}
        {...props}
      />
    ) : (
      <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, CardPartProps>(
  ({ className, appearance, ...props }, ref) =>
    useCardAppearance(appearance) === 'workspace' ? (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn(WORKSPACE_CARD.footer, className)}
        {...props}
      />
    ) : (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between border-t border-border bg-surface-subtle/50 px-5 py-3 rounded-b-lg',
          className
        )}
        {...props}
      />
    )
);
CardFooter.displayName = 'CardFooter';

/** The test's header action slot (top-right of a workspace CardHeader). Workspace look only. */
const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn(WORKSPACE_CARD.action, className)}
      {...props}
    />
  )
);
CardAction.displayName = 'CardAction';

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
