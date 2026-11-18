import { type DialogProps } from '@radix-ui/react-dialog';
import { IconCheck, IconSearch } from '@/lib/icons';
import { Command as CommandPrimitive } from 'cmdk';
import { IconSearch as Search } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';
import {
  Dialog,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';

/*
 * workspace: the usability test's components/ui/command.tsx (base-vega) with its input-group
 * field, translated to Tailwind 3: cls! → !cls; outline-hidden → outline-none; **:[x] → [&_x];
 * in-data-[slot=dialog-content] → [[data-slot=dialog-content]_&]; has-data-[x] → has-[[data-x]].
 * cmdk marks every item data-selected="true" / "false", so the test's data-selected: reads as
 * data-[selected=true] (the highlighted row). Tailwind 3's preflight leaves inputs a UA
 * background, hence bg-transparent on the field. Command (or a workspace CommandDialog) passes
 * the appearance to the parts inside it.
 */
const WORKSPACE_COMMAND = {
  root: 'flex size-full flex-col overflow-hidden !rounded-xl bg-popover p-1 text-popover-foreground',
  dialogContent: 'top-1/3 translate-y-0 overflow-hidden !rounded-xl p-0',
  inputWrapper: 'p-1 pb-0',
  inputGroup:
    'group/input-group relative flex !h-8 w-full min-w-0 items-center !rounded-lg border border-input/30 bg-input/30 !shadow-none transition-[color,box-shadow] outline-none has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-[3px] has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:bg-input/30 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 [&:has(>[data-align=inline-start])>input]:pl-1.5 [&>[data-slot=input-group-addon]]:!pl-2',
  inputAddon:
    "order-first flex h-auto cursor-text items-center justify-center gap-2 py-1.5 pl-2 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  input:
    'w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
  list: 'no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none',
  empty: 'py-6 text-center text-sm',
  group:
    'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
  separator: '-mx-1 h-px w-auto bg-border',
  item: "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none [[data-slot=dialog-content]_&]:!rounded-lg data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&[data-selected=true]_svg]:text-foreground",
  itemCheck:
    'ml-auto opacity-0 group-has-[[data-slot=command-shortcut]]/command-item:hidden group-data-[checked=true]/command-item:opacity-100',
  shortcut:
    'ml-auto text-xs tracking-widest text-muted-foreground group-data-[selected=true]/command-item:text-foreground',
} as const;

const CommandAppearanceContext = React.createContext<UIAppearance>('default');

/** A part's appearance: its own prop, else the enclosing Command's (or CommandDialog's). */
function useCommandAppearance(own?: UIAppearance): UIAppearance {
  const inherited = React.useContext(CommandAppearanceContext);
  return own ?? inherited;
}

type WithAppearance<T> = T & {
  /** Defaults to the enclosing Command's appearance. */
  appearance?: UIAppearance;
};

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof CommandPrimitive>>
>(({ className, appearance, ...props }, ref) => {
  const resolved = useCommandAppearance(appearance);
  return (
    <CommandAppearanceContext.Provider value={resolved}>
      {resolved === 'workspace' ? (
        <CommandPrimitive
          ref={ref}
          data-slot="command"
          className={cn(WORKSPACE_COMMAND.root, className)}
          {...props}
        />
      ) : (
        <CommandPrimitive
          ref={ref}
          className={cn(
            'flex h-full w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground',
            className
          )}
          {...props}
        />
      )}
    </CommandAppearanceContext.Provider>
  );
});
Command.displayName = CommandPrimitive.displayName;

export interface CommandDialogProps extends DialogProps {
  /**
   * `workspace` renders the usability test's CommandDialog: its dialog card a third of the way
   * down (no close button by default), with screen-reader title and description. As in the
   * test, the children supply their own <Command>, which inherits the appearance.
   */
  appearance?: UIAppearance;
  /** Workspace: the screen-reader title (default "Command Palette"). */
  title?: string;
  /** Workspace: the screen-reader description. */
  description?: string;
  /** Workspace: classes for the dialog card. */
  className?: string;
  /** Workspace: shows the dialog's close button (default false). */
  showCloseButton?: boolean;
  /** Workspace: further props for the dialog card (test ids, focus handlers…). */
  contentProps?: Omit<DialogContentProps, 'appearance' | 'className' | 'children'> & {
    [dataAttribute: `data-${string}`]: string | undefined;
  };
}

const CommandDialog = ({
  appearance = 'default',
  title = 'Command Palette',
  description = 'Search for a command to run...',
  className,
  showCloseButton = false,
  contentProps,
  children,
  ...props
}: CommandDialogProps): React.ReactElement =>
  appearance === 'workspace' ? (
    <Dialog {...props}>
      <DialogContent
        appearance="workspace"
        showCloseButton={showCloseButton}
        {...contentProps}
        className={cn(WORKSPACE_COMMAND.dialogContent, className)}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CommandAppearanceContext.Provider value="workspace">{children}</CommandAppearanceContext.Provider>
      </DialogContent>
    </Dialog>
  ) : (
    <DefaultCommandDialog {...props}>{children}</DefaultCommandDialog>
  );

const DefaultCommandDialog = ({ children, ...props }: DialogProps): React.ReactElement => (
  <Dialog {...props}>
    <DialogContent className="overflow-hidden p-0 shadow-lg">
      <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-10 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2">
        {children}
      </Command>
    </DialogContent>
  </Dialog>
);

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>>
>(({ className, appearance, ...props }, ref) =>
  useCommandAppearance(appearance) === 'workspace' ? (
    <div data-slot="command-input-wrapper" className={WORKSPACE_COMMAND.inputWrapper}>
      <div data-slot="input-group" role="group" className={WORKSPACE_COMMAND.inputGroup}>
        <CommandPrimitive.Input
          ref={ref}
          data-slot="command-input"
          className={cn(WORKSPACE_COMMAND.input, className)}
          {...props}
        />
        {/* The test's InputGroupAddon: clicking it focuses the field. */}
        <div
          role="group"
          data-slot="input-group-addon"
          data-align="inline-start"
          className={WORKSPACE_COMMAND.inputAddon}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('button')) return;
            event.currentTarget.parentElement?.querySelector('input')?.focus();
          }}
        >
          <IconSearch className="size-4 shrink-0 opacity-50" />
        </div>
      </div>
    </div>
  ) : (
  <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
    <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
  )
);
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>
>(({ className, appearance, ...props }, ref) =>
  useCommandAppearance(appearance) === 'workspace' ? (
    <CommandPrimitive.List
      ref={ref}
      data-slot="command-list"
      className={cn(WORKSPACE_COMMAND.list, className)}
      {...props}
    />
  ) : (
    <CommandPrimitive.List
      ref={ref}
      className={cn('max-h-[260px] overflow-y-auto overflow-x-hidden p-1', className)}
      {...props}
    />
  )
);
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>
>(({ appearance, ...props }, ref) =>
  useCommandAppearance(appearance) === 'workspace' ? (
    <CommandPrimitive.Empty
      ref={ref}
      data-slot="command-empty"
      {...props}
      className={cn(WORKSPACE_COMMAND.empty, props.className)}
    />
  ) : (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-xs text-muted-foreground"
    {...props}
  />
  )
);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>
>(({ className, appearance, ...props }, ref) =>
  useCommandAppearance(appearance) === 'workspace' ? (
    <CommandPrimitive.Group
      ref={ref}
      data-slot="command-group"
      className={cn(WORKSPACE_COMMAND.group, className)}
      {...props}
    />
  ) : (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]: [&_[cmdk-group-heading]]:text-muted-foreground',
      className
    )}
    {...props}
  />
  )
);
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>>
>(({ className, appearance, ...props }, ref) =>
  useCommandAppearance(appearance) === 'workspace' ? (
    <CommandPrimitive.Separator
      ref={ref}
      data-slot="command-separator"
      className={cn(WORKSPACE_COMMAND.separator, className)}
      {...props}
    />
  ) : (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 h-px bg-border', className)}
      {...props}
    />
  )
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  WithAppearance<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>
>(({ className, appearance, children, ...props }, ref) =>
  useCommandAppearance(appearance) === 'workspace' ? (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      className={cn(WORKSPACE_COMMAND.item, className)}
      {...props}
    >
      {children}
      <IconCheck className={WORKSPACE_COMMAND.itemCheck} />
    </CommandPrimitive.Item>
  ) : (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      className
    )}
    {...props}
  >
    {children}
  </CommandPrimitive.Item>
  )
);
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  appearance,
  ...props
}: WithAppearance<React.HTMLAttributes<HTMLSpanElement>>): React.ReactElement =>
  useCommandAppearance(appearance) === 'workspace' ? (
    <span
      data-slot="command-shortcut"
      className={cn(WORKSPACE_COMMAND.shortcut, className)}
      {...props}
    />
  ) : (
    <span className={cn('ml-auto font-mono text-xs text-muted-foreground', className)} {...props} />
  );
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
