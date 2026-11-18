import * as React from 'react';

import { cn } from '../../utils/cn';
import { Button, type ButtonProps } from '../ui/button';

/*
 * The usability test's empty state, from master (components/data/empty-state.tsx): fills the
 * space where data would be, with a reason and a way forward. A dashed, rounded-md panel with a
 * round muted icon tile (destructive for load errors), an h3 title, a short description and the
 * actions below (secondary before primary).
 *
 * This replaces the package's earlier portal empty state. The test's props (icon, title,
 * description, primaryAction, secondaryAction, tone, className) are the API; the package's
 * earlier props still compile and render in the test's look:
 *   - buttonText / onClick / disableButton / hideButton / buttonLeftIcon → a workspace Button,
 *     shown as the primary action (after `primaryAction` when both are given);
 *   - extraButtons → small outline buttons pinned to the top-right corner;
 *   - headingLevel, children (rendered below the actions) and dataTestId;
 *   - variant is accepted and ignored: every empty state is the test's now.
 */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  /** The heading (an h3 by default). The test requires it; it stays optional for older callers. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** The main way forward, as a node (e.g. a Button). */
  primaryAction?: React.ReactNode;
  /** A second, lighter way forward (e.g. an outline Button), shown before the primary one. */
  secondaryAction?: React.ReactNode;
  /** `destructive` for load errors: the icon tile turns destructive. */
  tone?: 'default' | 'destructive';
  className?: string;

  /** Heading level of the title (default h3, as in the test). */
  headingLevel?: 'h2' | 'h3' | 'h4';
  /** Anything below the actions, e.g. a short list of what happens next. */
  children?: React.ReactNode;
  dataTestId?: string;

  /** @deprecated Pass a Button as `primaryAction`. Renders a workspace Button with this label. */
  buttonText?: string;
  /** @deprecated With `buttonText`: the button's click handler. */
  onClick?: () => void;
  /** @deprecated With `buttonText`: hides the button. */
  hideButton?: boolean;
  /** @deprecated With `buttonText`: disables the button. */
  disableButton?: boolean;
  /** @deprecated With `buttonText`: an icon before the label. */
  buttonLeftIcon?: React.ReactNode;
  /** @deprecated Small outline buttons in the top-right corner. */
  extraButtons?: ButtonProps[];
  /** @deprecated Ignored: every empty state renders the test's look. */
  variant?: 'default' | 'workspace';
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tone = 'default',
  className,
  headingLevel: Heading = 'h3',
  children,
  dataTestId,
  buttonText,
  onClick,
  hideButton = false,
  disableButton = false,
  buttonLeftIcon,
  extraButtons = [],
}: EmptyStateProps): React.ReactElement {
  const legacyButton =
    !hideButton && buttonText ? (
      <Button appearance="workspace" onClick={onClick} disabled={disableButton}>
        {buttonLeftIcon}
        {buttonText}
      </Button>
    ) : null;

  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border px-6 py-12 text-center',
        extraButtons.length > 0 && 'relative',
        className
      )}
    >
      {extraButtons.length > 0 ? (
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {extraButtons.map((btn, index) => (
            <Button key={index} size="sm" variant="outline" appearance="workspace" {...btn} />
          ))}
        </div>
      ) : null}
      {icon ? (
        <div
          className={cn(
            'flex size-11 items-center justify-center rounded-full',
            tone === 'destructive'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        {title ? (
          <Heading className="text-base font-semibold text-foreground">{title}</Heading>
        ) : null}
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {primaryAction || secondaryAction || legacyButton ? (
        <div className="mt-2 flex items-center gap-2">
          {secondaryAction}
          {primaryAction}
          {legacyButton}
        </div>
      ) : null}
      {children}
    </div>
  );
}
