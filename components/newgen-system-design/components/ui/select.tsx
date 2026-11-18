import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as SelectPrimitive from '@radix-ui/react-select';
import { IconCheck, IconChevronDown, IconChevronUp, IconSelector } from '@/lib/icons';
import { Command as CommandPrimitive } from 'cmdk';
import { IconCheck as Check, IconChevronDown as ChevronDown } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import type { InputValidationState } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface SelectOption {
  value: string;
  label: string;
  secondaryLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  dataTestId?: string;
}

export interface SelectDropdownProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: SelectOption) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  searchable?: boolean;
  isRequired?: boolean;
  disabled?: boolean;
  state?: InputValidationState;
  infoTooltipContent?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  dataTestId?: string;
  /**
   * `workspace` renders the usability test's base-vega select: its trigger (w-fit, selector
   * icon), popup (trigger-wide, ring) and items (check on the right). The popup opens below the
   * trigger (Base UI's align-item-with-trigger mode has no Radix counterpart).
   */
  appearance?: UIAppearance;
}

/*
 * workspace: the usability test's components/ui/select.tsx, translated to Tailwind 3 / this
 * popover + cmdk build: data-placeholder → data-[placeholder]; *:data-[slot=select-value] →
 * [&>[data-slot=select-value]]; --anchor-width / --available-height / --transform-origin →
 * Radix popover variables; item focus → cmdk's data-[selected=true].
 */
const WORKSPACE_SELECT = {
  trigger:
    "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 [&>[data-slot=select-value]]:line-clamp-1 [&>[data-slot=select-value]]:flex [&>[data-slot=select-value]]:items-center [&>[data-slot=select-value]]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  value: 'flex flex-1 text-left',
  content:
    'relative isolate z-50 max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] min-w-36 origin-[--radix-popover-content-transform-origin] overflow-x-hidden overflow-y-auto rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  group: 'scroll-my-1 p-1',
  item: "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&[data-selected=true]_*]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span:last-child]:flex [&>span:last-child]:items-center [&>span:last-child]:gap-2",
  itemText: 'flex flex-1 shrink-0 gap-2 whitespace-nowrap',
  indicator: 'pointer-events-none absolute right-2 flex size-4 items-center justify-center',
} as const;

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  description,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No matching options',
  searchable = false,
  isRequired = false,
  disabled = false,
  state = 'default',
  infoTooltipContent,
  className,
  triggerClassName,
  dataTestId,
  appearance = 'default',
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);

  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === selectedValue),
    [options, selectedValue]
  );

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return;
    setInternalValue(opt.value);
    onValueChange?.(opt.value, opt);
    setOpen(false);
  };

  if (appearance === 'workspace') {
    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        {label && (
          <Label
            appearance="workspace"
            isRequired={isRequired}
            infoTooltipContent={infoTooltipContent}
          >
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              data-testid={dataTestId}
              aria-expanded={open}
              aria-invalid={state === 'error' || undefined}
              data-slot="select-trigger"
              data-size="default"
              data-placeholder={selectedOption ? undefined : ''}
              className={cn(WORKSPACE_SELECT.trigger, triggerClassName)}
            >
              <span data-slot="select-value" className={WORKSPACE_SELECT.value}>
                {selectedOption ? (
                  <>
                    {selectedOption.leftIcon}
                    {selectedOption.label}
                  </>
                ) : (
                  placeholder
                )}
              </span>
              <IconSelector className="pointer-events-none size-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              data-slot="select-content"
              align="start"
              sideOffset={4}
              className={WORKSPACE_SELECT.content}
            >
              <CommandPrimitive>
                {searchable && <CommandInput placeholder={searchPlaceholder} />}
                <CommandPrimitive.List>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandPrimitive.Group data-slot="select-group" className={WORKSPACE_SELECT.group}>
                    {options.map((opt) => (
                      <CommandPrimitive.Item
                        key={opt.value}
                        value={`${opt.label} ${opt.secondaryLabel ?? ''}`}
                        disabled={opt.disabled}
                        data-testid={opt.dataTestId}
                        data-slot="select-item"
                        onSelect={() => handleSelect(opt)}
                        className={WORKSPACE_SELECT.item}
                      >
                        <span className={WORKSPACE_SELECT.itemText}>
                          {opt.leftIcon}
                          {opt.label}
                          {opt.secondaryLabel && (
                            <span className="text-muted-foreground">{opt.secondaryLabel}</span>
                          )}
                          {opt.rightIcon}
                        </span>
                        {opt.value === selectedValue && (
                          <span className={WORKSPACE_SELECT.indicator}>
                            <IconCheck className="pointer-events-none" />
                          </span>
                        )}
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                </CommandPrimitive.List>
              </CommandPrimitive>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </Popover>
        {description && (
          <p
            className={cn(
              'text-xs leading-4',
              state === 'error'
                ? 'text-destructive'
                : state === 'success'
                  ? 'text-success'
                  : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <Label isRequired={isRequired} infoTooltipContent={infoTooltipContent}>
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            data-testid={dataTestId}
            aria-expanded={open}
            className={cn(
              'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground shadow-xs transition-all hover:border-border-strong focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-60',
              state === 'error' && 'border-destructive focus-visible:border-destructive',
              state === 'success' && 'border-success focus-visible:border-success',
              triggerClassName
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedOption?.leftIcon}
              {selectedOption ? (
                <span className="font-normal text-foreground">{selectedOption.label}</span>
              ) : (
                <span className="text-muted-foreground/80">{placeholder}</span>
              )}
              {selectedOption?.secondaryLabel && (
                <span className="text-xs text-muted-foreground">
                  {selectedOption.secondaryLabel}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
              {selectedOption?.rightIcon}
              <ChevronDown
                className={cn('size-4 transition-transform duration-150', open && 'rotate-180')}
              />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
        >
          <Command>
            {searchable && <CommandInput placeholder={searchPlaceholder} />}
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = opt.value === selectedValue;
                  return (
                    <CommandItem
                      key={opt.value}
                      value={`${opt.label} ${opt.secondaryLabel ?? ''}`}
                      disabled={opt.disabled}
                      data-testid={opt.dataTestId}
                      onSelect={() => handleSelect(opt)}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {opt.leftIcon}
                        <span>{opt.label}</span>
                        {opt.secondaryLabel && (
                          <span className="text-xs text-muted-foreground">
                            {opt.secondaryLabel}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {opt.rightIcon}
                        {isSelected && <Check className="size-4 text-primary" />}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {description && (
        <p
          className={cn(
            'text-xs leading-4',
            state === 'error'
              ? 'text-destructive'
              : state === 'success'
                ? 'text-success'
                : 'text-muted-foreground'
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

/*
 * The test's compound select (components/ui/select.tsx, base-vega on Base UI's Select), on
 * Radix Select, for screens that compose it part by part. Workspace look only. `Select` is
 * this package's options-driven SelectDropdown, so the root is exported as SelectRoot.
 * Translated to Tailwind 3 / Radix: data-placeholder → data-[placeholder]; data-disabled →
 * data-[disabled]; data-open / data-closed → data-[state=…]; *:data-[slot=x] →
 * [&>[data-slot=x]]; *:[span]:last → [&>span:last-child]; --available-height / --anchor-width /
 * --transform-origin → Radix's --radix-select-* variables. Base UI's alignItemWithTrigger
 * (default true) → Radix position="item-aligned" (false → "popper", which honours side /
 * align / offsets). Base UI's `items` map is accepted and ignored: Radix shows the selected
 * item's text in SelectValue itself.
 */
const WORKSPACE_SELECT_PARTS = {
  trigger: WORKSPACE_SELECT.trigger,
  content:
    'relative isolate z-50 max-h-[--radix-select-content-available-height] w-[--radix-select-trigger-width] min-w-36 origin-[--radix-select-content-transform-origin] overflow-x-hidden overflow-y-auto rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  group: 'scroll-my-1 p-1',
  value: 'flex flex-1 text-left',
  label: 'px-2 py-1.5 text-xs text-muted-foreground',
  item: "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground [&:not([data-variant=destructive]):focus_*]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span:last-child]:flex [&>span:last-child]:items-center [&>span:last-child]:gap-2",
  itemText: 'flex flex-1 shrink-0 gap-2 whitespace-nowrap',
  indicator: 'pointer-events-none absolute right-2 flex size-4 items-center justify-center',
  separator: 'pointer-events-none -mx-1 my-1 h-px bg-border',
  scrollUp:
    "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
  scrollDown:
    "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
} as const;

/** The test's Select root (Radix Select.Root). `items` is Base UI's label map, ignored here. */
function SelectRoot({
  items: _items,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root> & {
  items?: unknown;
}): React.ReactElement {
  return <SelectPrimitive.Root {...props} />;
}

const SelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Group
    ref={ref}
    data-slot="select-group"
    className={cn(WORKSPACE_SELECT_PARTS.group, className)}
    {...props}
  />
));
SelectGroup.displayName = 'SelectGroup';

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> & { className?: string }
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    data-slot="select-value"
    className={cn(WORKSPACE_SELECT_PARTS.value, className)}
    {...props}
  />
));
SelectValue.displayName = 'SelectValue';

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'default' }
>(({ className, size = 'default', children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    data-size={size}
    className={cn(WORKSPACE_SELECT_PARTS.trigger, className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <IconSelector className="pointer-events-none size-4 text-muted-foreground" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(WORKSPACE_SELECT_PARTS.scrollUp, className)}
    {...props}
  >
    <IconChevronUp />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn(WORKSPACE_SELECT_PARTS.scrollDown, className)}
    {...props}
  >
    <IconChevronDown />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = 'SelectScrollDownButton';

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>, 'position'> & {
    /** Base UI's align-item-with-trigger mode (Radix item-aligned); false opens a popper. */
    alignItemWithTrigger?: boolean;
  }
>(
  (
    {
      className,
      children,
      side = 'bottom',
      sideOffset = 4,
      align = 'center',
      alignOffset = 0,
      alignItemWithTrigger = true,
      ...props
    },
    ref
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        data-align-trigger={alignItemWithTrigger}
        position={alignItemWithTrigger ? 'item-aligned' : 'popper'}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(WORKSPACE_SELECT_PARTS.content, className)}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = 'SelectContent';

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(WORKSPACE_SELECT_PARTS.label, className)}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(WORKSPACE_SELECT_PARTS.item, className)}
    {...props}
  >
    <SelectPrimitive.ItemText className={WORKSPACE_SELECT_PARTS.itemText}>
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className={WORKSPACE_SELECT_PARTS.indicator}>
      <IconCheck className="pointer-events-none" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn(WORKSPACE_SELECT_PARTS.separator, className)}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';

export {
  SelectDropdown as InputSelectDropdown,
  SelectDropdown as Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
