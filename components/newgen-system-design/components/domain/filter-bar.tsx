import { IconCalendar as Calendar, IconRotateCounterClockwise as RotateCcw, IconSearch as Search } from '@/lib/icons';
import React from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MultiSelect, type MultiSelectOption } from '../ui/multi-select';
import { SelectDropdown, type SelectOption } from '../ui/select';

export interface FilterGroupConfig {
  id: string;
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterGroupConfig[];
  dateRangePreset?: string;
  dateRangeOptions?: SelectOption[];
  onDateRangeChange?: (preset: string) => void;
  onClearFilters?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
  dataTestId?: string;
}

const DEFAULT_DATE_PRESETS: SelectOption[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'all', label: 'All time' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Filter by ID, player, or email...',
  filters = [],
  dateRangePreset,
  dateRangeOptions = DEFAULT_DATE_PRESETS,
  onDateRangeChange,
  onClearFilters,
  rightSlot,
  className,
  dataTestId,
}) => {
  const hasActiveFilters =
    Boolean(searchValue.trim()) ||
    filters.some((f) => f.selectedValues.length > 0) ||
    (dateRangePreset !== undefined && dateRangePreset !== '30d');

  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border bg-surface-subtle/60 p-2.5',
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {onSearchChange && (
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<Search />}
            className="w-64"
          />
        )}

        {filters.map((filter) => (
          <MultiSelect
            key={filter.id}
            placeholder={filter.label}
            options={filter.options}
            value={filter.selectedValues}
            onChange={filter.onChange}
            className="w-48"
          />
        ))}

        {onDateRangeChange && (
          <SelectDropdown
            options={dateRangeOptions.map((o) => ({
              ...o,
              leftIcon: <Calendar className="size-3.5 text-muted-foreground" />,
            }))}
            value={dateRangePreset ?? '30d'}
            onValueChange={onDateRangeChange}
            className="w-44"
          />
        )}

        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="size-3.5" />}
            onClick={onClearFilters}
          >
            Reset
          </Button>
        )}
      </div>

      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
};
