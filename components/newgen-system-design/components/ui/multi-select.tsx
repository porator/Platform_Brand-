import { IconChevronDown as ChevronDown, IconSearch as Search, IconX as X } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { Badge } from './badge';
import { UICheckbox } from './checkbox';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface MultiSelectOption {
  label: string;
  value: string;
  secondaryLabel?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  showSelectAll?: boolean;
  selectAllLabel?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  dataTestId?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  label,
  placeholder = 'Select options...',
  showSelectAll = true,
  selectAllLabel = 'Select all',
  showSearch = true,
  searchPlaceholder = 'Filter options...',
  emptyLabel = 'No options found',
  disabled = false,
  className,
  dataTestId,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!query.trim()) return options;
    const lower = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, query]);

  const allSelected = options.length > 0 && value.length === options.length;

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  const renderSummary = () => {
    if (value.length === 0) {
      return <span className="text-muted-foreground/80">{placeholder}</span>;
    }
    if (allSelected && options.length > 1) {
      return <span className="font-medium text-foreground">All selected ({options.length})</span>;
    }
    if (value.length <= 2) {
      return (
        <div className="flex items-center gap-1 overflow-hidden">
          {value.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <Badge key={val} variant="secondary" size="sm">
                {opt?.label ?? val}
              </Badge>
            );
          })}
        </div>
      );
    }
    return <span className="font-medium text-foreground">{value.length} selected</span>;
  };

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            data-testid={dataTestId}
            className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground shadow-xs transition-all hover:border-border-strong focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="truncate">{renderSummary()}</div>
            <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
              {value.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear selection"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onChange([]);
                    }
                  }}
                  className="rounded-sm p-0.5 hover:bg-accent hover:text-foreground"
                >
                  <X className="size-3.5" />
                </span>
              )}
              <ChevronDown
                className={cn('size-4 transition-transform duration-150', open && 'rotate-180')}
              />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0"
        >
          {showSearch && (
            <div className="flex items-center border-b border-border px-3 py-2">
              <Search className="mr-2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="max-h-[240px] overflow-y-auto p-1">
            {showSelectAll && !query.trim() && options.length > 1 && (
              <label className="flex cursor-pointer items-center gap-2.5 rounded-md border-b border-border/60 px-2.5 py-2 text-sm font-medium hover:bg-accent">
                <UICheckbox
                  checked={allSelected ? true : value.length > 0 ? 'indeterminate' : false}
                  onCheckedChange={toggleAll}
                />
                <span>{selectAllLabel}</span>
              </label>
            )}
            {filteredOptions.length === 0 ? (
              <div className="py-5 text-center text-xs text-muted-foreground">{emptyLabel}</div>
            ) : (
              filteredOptions.map((opt) => {
                const checked = value.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center justify-between gap-2.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-accent"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <UICheckbox
                        checked={checked}
                        onCheckedChange={() => toggleOption(opt.value)}
                      />
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {opt.secondaryLabel && (
                      <span className="text-xs text-muted-foreground">{opt.secondaryLabel}</span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
