import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { IconCheck, IconChevronRight } from '@/lib/icons';
import { IconCheck as Check, IconChevronRight as ChevronRight, IconCircle as Circle } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/dropdown-menu.tsx (base-vega), translated to
 * Tailwind 3 / Radix: --available-height / --anchor-width / --transform-origin → Radix's
 * dropdown-menu variables (so the menu is as wide as its trigger unless a width is passed);
 * data-open / data-closed / data-popup-open → data-[state=…]; data-disabled → data-[disabled];
 * data-inset → data-[inset]; outline-hidden → outline-none; focus:**: → [&:focus_*]:;
 * *:[svg] → [&>svg]. Its defaults apply (content align start / sideOffset 4; sub-content
 * sideOffset 0 / alignOffset -3), and checkbox / radio items show a check on the right.
 * DropdownMenuContent passes the appearance to every part inside it.
 */
const WORKSPACE_MENU = {
  content:
    'z-50 max-h-[--radix-dropdown-menu-content-available-height] w-[--radix-dropdown-menu-trigger-width] min-w-32 origin-[--radix-dropdown-menu-content-transform-origin] overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:overflow-hidden data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  subContent:
    'w-auto min-w-[96px] rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  label: 'px-2 py-1.5 text-xs font-medium text-muted-foreground data-[inset]:pl-8',
  item: "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground [&:not([data-variant=destructive]):focus_*]:text-accent-foreground data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&[data-variant=destructive]>svg]:text-destructive",
  subTrigger:
    "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground [&:not([data-variant=destructive]):focus_*]:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  choiceItem:
    "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground [&:focus_*]:text-accent-foreground data-[inset]:pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  indicator: 'pointer-events-none absolute right-2 flex items-center justify-center',
  separator: '-mx-1 my-1 h-px bg-border',
  shortcut:
    'ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground',
} as const;

const MenuAppearanceContext = React.createContext<UIAppearance>('default');

/** A part's appearance: its own prop, else the enclosing DropdownMenuContent's. */
function useMenuAppearance(own?: UIAppearance): UIAppearance {
  const inherited = React.useContext(MenuAppearanceContext);
  return own ?? inherited;
}

type WithAppearance<T> = T & {
  /** Defaults to the enclosing DropdownMenuContent's appearance. */
  appearance?: UIAppearance;
};

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  WithAppearance<
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
      inset?: boolean;
    }
  >
>(({ className, inset, children, appearance, ...props }, ref) =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(WORKSPACE_MENU.subTrigger, className)}
      {...props}
    >
      {children}
      <IconChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  ) : (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
  )
);
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>
>(({ className, appearance, sideOffset, alignOffset, ...props }, ref) =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      data-slot="dropdown-menu-sub-content"
      sideOffset={sideOffset ?? 0}
      alignOffset={alignOffset ?? -3}
      className={cn(WORKSPACE_MENU.content, WORKSPACE_MENU.subContent, className)}
      {...props}
    />
  ) : (
    <DefaultDropdownMenuSubContent
      ref={ref}
      className={className}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      {...props}
    />
  )
);
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DefaultDropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      className
    )}
    {...props}
  />
));
DefaultDropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    /**
     * `workspace` renders the usability test's base-vega menu and passes the appearance to
     * every item, label, separator and sub-menu inside it (see UIAppearance).
     */
    appearance?: UIAppearance;
  }
>(({ appearance = 'default', children, className, align, sideOffset, ...rest }, ref) =>
  appearance === 'workspace' ? (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-slot="dropdown-menu-content"
        align={align ?? 'start'}
        sideOffset={sideOffset ?? 4}
        className={cn(WORKSPACE_MENU.content, className)}
        {...rest}
      >
        <MenuAppearanceContext.Provider value="workspace">{children}</MenuAppearanceContext.Provider>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  ) : (
    <DefaultDropdownMenuContent
      ref={ref}
      className={className}
      align={align}
      sideOffset={sideOffset}
      {...rest}
    >
      <MenuAppearanceContext.Provider value="default">{children}</MenuAppearanceContext.Provider>
    </DefaultDropdownMenuContent>
  )
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DefaultDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DefaultDropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  WithAppearance<
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
      inset?: boolean;
      destructive?: boolean;
      /** The test's name for `destructive` (workspace). */
      variant?: 'default' | 'destructive';
    }
  >
>(({ className, inset, destructive = false, variant, appearance, ...props }, ref) =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant ?? (destructive ? 'destructive' : 'default')}
      className={cn(WORKSPACE_MENU.item, className)}
      {...props}
    />
  ) : (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
      (destructive || variant === 'destructive') &&
        'text-destructive focus:bg-destructive-subtle focus:text-destructive',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
  )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  WithAppearance<
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> & {
      /** Workspace only: indents the label to line up with icon items. */
      inset?: boolean;
    }
  >
>(({ className, children, checked, appearance, inset, ...props }, ref) =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(WORKSPACE_MENU.choiceItem, className)}
      checked={checked}
      {...props}
    >
      <span className={WORKSPACE_MENU.indicator} data-slot="dropdown-menu-checkbox-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <IconCheck />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  ) : (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="size-4 text-primary" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
  )
);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  WithAppearance<
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & {
      /** Workspace only: indents the label to line up with icon items. */
      inset?: boolean;
    }
  >
>(({ className, children, appearance, inset, ...props }, ref) =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(WORKSPACE_MENU.choiceItem, className)}
      {...props}
    >
      <span className={WORKSPACE_MENU.indicator} data-slot="dropdown-menu-radio-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <IconCheck />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  ) : (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="size-2 fill-primary text-primary" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
  )
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  WithAppearance<
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
      inset?: boolean;
    }
  >
>(({ className, inset, appearance, ...props }, ref) =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <DropdownMenuPrimitive.Label
      ref={ref}
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(WORKSPACE_MENU.label, className)}
      {...props}
    />
  ) : (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2.5 py-1.5 text-xs font-semibold text-muted-foreground',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
  )
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>
>(({ className, appearance, ...props }, ref) =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      data-slot="dropdown-menu-separator"
      className={cn(WORKSPACE_MENU.separator, className)}
      {...props}
    />
  ) : (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  appearance,
  ...props
}: WithAppearance<React.HTMLAttributes<HTMLSpanElement>>): React.ReactElement =>
  useMenuAppearance(appearance) === 'workspace' ? (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(WORKSPACE_MENU.shortcut, className)}
      {...props}
    />
  ) : (
    <span className={cn('ml-auto font-mono text-xs text-muted-foreground', className)} {...props} />
  );
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
