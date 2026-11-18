import { IconSearch as Search } from '@/lib/icons';
import React from 'react';

import { cn } from '../../utils/cn';
import { Badge } from '../ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { Button, type ButtonProps } from '../ui/button';
import { Input } from '../ui/input';
import { Typography } from '../ui/typography';

export interface BreadcrumbEntry {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  /**
   * `workspace` is the Projects & Navigation header: a location bar above the title, a
   * scope summary under it, no bottom border, and the shell's padding (px-4 pt-5 sm:px-6).
   * `default` is the portal page header with breadcrumbs, search and buttons.
   */
  variant?: 'default' | 'workspace';
  /** A node above the title (e.g. a LocationBar). Takes the place of `breadcrumbs`. */
  breadcrumb?: React.ReactNode;
  /**
   * `workspace`: a node at the top right, on the location bar's row (the test moved its search
   * there from the sidebar; ⌘K still opens it).
   */
  search?: React.ReactNode;
  /** A node under the title (e.g. a ScopeSummary). Shown after `subTitle`. */
  meta?: React.ReactNode;
  /** Extra controls at the end of the title row (after the built-in buttons). */
  actions?: React.ReactNode;
  /** Heading level of the title: h1 for a page's title, h2 inside a page (default h2; h1 for `workspace`). */
  headingLevel?: 'h1' | 'h2';
  subTitle?: string;
  environment?: 'production' | 'sandbox';
  breadcrumbs?: BreadcrumbEntry[];
  isSearchVisible?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  isCreateButton?: boolean;
  primaryButtonIcon?: React.ReactNode;
  secondaryButtonIcon?: React.ReactNode;
  primaryButtonVariant?: ButtonProps['variant'];
  secondaryButtonVariant?: ButtonProps['variant'];
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  primaryButtonState?: {
    disabled?: boolean;
    hidden?: boolean;
    isLoading?: boolean;
  };
  className?: string;
  dataTestId?: string;
}

/**
 * The Projects & Navigation workspace header, master (components/dashboard/shell.tsx `<header>`):
 * the location bar with the search at its right, the page title lower in the workspace, clear of
 * the top bar (`<h1 className="mt-12 text-title text-foreground">`), then the scope summary
 * (`meta`). `subTitle` renders in the summary line's style.
 */
const WorkspacePageHeader: React.FC<PageHeaderProps> = ({
  title,
  subTitle,
  breadcrumb,
  search,
  meta,
  actions,
  headingLevel: Heading = 'h1',
  className,
  dataTestId,
}) => (
  <header data-testid={dataTestId} className={cn('px-4 pt-5 sm:px-6', className)}>
    {search ? (
      <div className="flex items-center gap-3">
        {breadcrumb}
        {/* Search, at the top right of the workspace. */}
        <div className="shrink-0">{search}</div>
      </div>
    ) : (
      breadcrumb
    )}
    {actions ? (
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <Heading className="min-w-0 text-title text-foreground">{title}</Heading>
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      </div>
    ) : (
      <Heading className="mt-12 text-title text-foreground">{title}</Heading>
    )}
    {subTitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subTitle}</p> : null}
    {meta}
  </header>
);

export const PageHeader: React.FC<PageHeaderProps> = (props) =>
  props.variant === 'workspace' ? (
    <WorkspacePageHeader {...props} />
  ) : (
    <PortalPageHeader {...props} />
  );

const PortalPageHeader: React.FC<PageHeaderProps> = ({
  title,
  subTitle,
  breadcrumb,
  meta,
  actions,
  headingLevel = 'h2',
  environment,
  breadcrumbs = [],
  isSearchVisible = false,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  primaryButtonText,
  secondaryButtonText,
  isCreateButton = false,
  primaryButtonIcon,
  secondaryButtonIcon,
  primaryButtonVariant = 'default',
  secondaryButtonVariant = 'outline',
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  primaryButtonState = { disabled: false, hidden: false, isLoading: false },
  className,
  dataTestId,
}) => (
  <div
    data-testid={dataTestId}
    className={cn('flex flex-col gap-3 border-b border-border pb-5', className)}
  >
    {breadcrumb}
    {!breadcrumb && breadcrumbs.length > 0 && (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${item.label}-${idx}`}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href} onClick={item.onClick}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )}

    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <Typography tag={headingLevel} variant="h3">
            {title}
          </Typography>
          {environment && (
            <Badge variant={environment === 'sandbox' ? 'warning' : 'success'} dot pill size="sm">
              {environment === 'sandbox' ? 'Sandbox' : 'Live'}
            </Badge>
          )}
        </div>
        {subTitle && (
          <Typography variant="body-sm" muted>
            {subTitle}
          </Typography>
        )}
        {meta}
      </div>

      <div className="flex items-center gap-2.5">
        {isSearchVisible && (
          <Input
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            leftIcon={<Search />}
            className="w-60"
          />
        )}
        {secondaryButtonText && (
          <Button
            variant={secondaryButtonVariant}
            leftIcon={secondaryButtonIcon}
            onClick={onSecondaryButtonClick}
          >
            {secondaryButtonText}
          </Button>
        )}
        {primaryButtonText && !primaryButtonState.hidden && (
          <Button
            variant={primaryButtonVariant}
            isCreateButton={isCreateButton}
            leftIcon={primaryButtonIcon}
            disabled={primaryButtonState.disabled}
            isLoading={primaryButtonState.isLoading}
            onClick={onPrimaryButtonClick}
          >
            {primaryButtonText}
          </Button>
        )}
        {actions}
      </div>
    </div>
  </div>
);

export interface SectionHeaderProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  dataTestId?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  className,
  dataTestId,
}) => {
  if (!title && !description) return null;

  return (
    <div
      data-testid={dataTestId}
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div className="flex flex-col gap-1">
        {title && (
          <Typography tag="h4" variant="h4">
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="body-sm" muted>
            {description}
          </Typography>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export { PageHeader as PortalHeader };
