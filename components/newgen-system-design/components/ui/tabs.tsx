import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

export type TabsVariant = 'segmented' | 'underline';

/*
 * workspace: the usability test's components/ui/tabs.tsx (base-vega on Base UI's Tabs),
 * translated to Tailwind 3 / Radix: data-horizontal / data-vertical (and the group-data
 * forms) → data-[orientation=…]; data-active → data-[state=active]; has-data-[x] →
 * has-[[data-x]]. Radix sets data-orientation on the root itself. The Tabs root passes the
 * appearance to its list, triggers and content. The list's variants are the test's
 * `default` (muted pill) and `line` (underline); this package's `segmented` / `underline`
 * map onto them.
 */
const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const WORKSPACE_TABS = {
  root: 'group/tabs flex gap-2 data-[orientation=horizontal]:flex-col',
  trigger: cn(
    "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-[[data-icon=inline-end]]:pr-1.5 has-[[data-icon=inline-start]]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent',
    'data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground',
    'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100'
  ),
  content: 'flex-1 text-sm outline-none',
} as const;

const TabsAppearanceContext = React.createContext<UIAppearance>('default');

/** A part's appearance: its own prop, else the enclosing Tabs'. */
function useTabsAppearance(own?: UIAppearance): UIAppearance {
  const inherited = React.useContext(TabsAppearanceContext);
  return own ?? inherited;
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    /** `workspace` renders the usability test's base-vega tabs and passes it to the parts. */
    appearance?: UIAppearance;
  }
>(({ className, appearance = 'default', orientation = 'horizontal', ...props }, ref) => (
  <TabsAppearanceContext.Provider value={appearance}>
    {appearance === 'workspace' ? (
      <TabsPrimitive.Root
        ref={ref}
        data-slot="tabs"
        orientation={orientation}
        className={cn(WORKSPACE_TABS.root, className)}
        {...props}
      />
    ) : (
      <TabsPrimitive.Root ref={ref} orientation={orientation} className={className} {...props} />
    )}
  </TabsAppearanceContext.Provider>
));
Tabs.displayName = TabsPrimitive.Root.displayName;

/** A list variant: this package's `segmented` / `underline`, or the test's `default` / `line`. */
export type TabsListVariant = TabsVariant | NonNullable<VariantProps<typeof tabsListVariants>['variant']>;

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsListVariant;
  /** Defaults to the enclosing Tabs' appearance. */
  appearance?: UIAppearance;
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, appearance, ...props }, ref) => {
    if (useTabsAppearance(appearance) === 'workspace') {
      const v = variant === 'line' || variant === 'underline' ? 'line' : 'default';
      return (
        <TabsPrimitive.List
          ref={ref}
          data-slot="tabs-list"
          data-variant={v}
          className={cn(tabsListVariants({ variant: v }), className)}
          {...props}
        />
      );
    }
    const v: TabsVariant = variant === 'underline' || variant === 'line' ? 'underline' : 'segmented';
    return (
      <TabsPrimitive.List
        ref={ref}
        data-variant={v}
        className={cn(
          v === 'segmented'
            ? 'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground border border-border/60'
            : 'inline-flex h-10 w-full items-center gap-6 border-b border-border text-muted-foreground',
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Default look only (the workspace trigger follows its list's variant). */
  variant?: TabsVariant;
  count?: number | string;
  icon?: React.ReactNode;
  /** Defaults to the enclosing Tabs' appearance. */
  appearance?: UIAppearance;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant = 'segmented', count, icon, children, appearance, ...props }, ref) =>
  useTabsAppearance(appearance) === 'workspace' ? (
    // The test's trigger lays its icon and label out as direct flex children.
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(WORKSPACE_TABS.trigger, className)}
      {...props}
    >
      {icon}
      {children}
      {count !== undefined && <span className="tabular-nums text-muted-foreground">{count}</span>}
    </TabsPrimitive.Trigger>
  ) : (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50',
      variant === 'segmented'
        ? 'rounded-md px-3 py-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs'
        : 'relative h-10 px-1 pb-2.5 pt-2 text-muted-foreground hover:text-foreground data-[state=active]:text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-transparent data-[state=active]:after:bg-primary',
      className
    )}
    {...props}
  >
    {icon && <span className="[&_svg]:size-3.5">{icon}</span>}
    <span>{children}</span>
    {count !== undefined && (
      <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.2 text-xs font-semibold tabular-nums text-muted-foreground">
        {count}
      </span>
    )}
  </TabsPrimitive.Trigger>
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    /** Defaults to the enclosing Tabs' appearance. */
    appearance?: UIAppearance;
  }
>(({ className, appearance, ...props }, ref) =>
  useTabsAppearance(appearance) === 'workspace' ? (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn(WORKSPACE_TABS.content, className)}
      {...props}
    />
  ) : (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
      className
    )}
    {...props}
  />
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
  Tabs as UITabs,
  TabsList as UITabsList,
  TabsTrigger as UITabsTrigger,
};
