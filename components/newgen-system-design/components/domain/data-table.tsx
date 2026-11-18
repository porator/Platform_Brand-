import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { IconArrowDown as ArrowDown, IconArrowUp as ArrowUp, IconArrowsSort as ArrowUpDown, IconChevronLeft as ChevronLeft, IconChevronRight as ChevronRight } from '@/lib/icons';
import React from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { UICheckbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { EmptyState } from './empty-state';

export interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  isLoading?: boolean;
  selectable?: boolean;
  pageSize?: number;
  showPagination?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  dataTestId?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  isLoading = false,
  selectable = false,
  pageSize = 8,
  showPagination = true,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  onRowClick,
  className,
  dataTestId,
}: DataTableProps<T>): React.ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const finalColumns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!selectable) return columns;
    const selectionCol: ColumnDef<T, unknown> = {
      id: '__select__',
      header: ({ table }) => (
        <UICheckbox
          aria-label="Select all rows"
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
          }
          onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
        />
      ),
      cell: ({ row }) => (
        <UICheckbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(val) => row.toggleSelected(!!val)}
        />
      ),
    };
    return [selectionCol, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div
        data-testid={dataTestId}
        className={cn('rounded-lg border border-border bg-card p-4 space-y-3', className)}
      >
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        dataTestId={dataTestId}
        title={emptyTitle}
        description={emptyDescription}
        hideButton
      />
    );
  }

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div data-testid={dataTestId} className={cn('space-y-2.5', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {sorted === 'asc' ? (
                          <ArrowUp className="size-3 text-primary" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="size-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="size-3 opacity-45" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
              onClick={() => onRowClick?.(row.original)}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div>
            {selectable && selectedCount > 0 ? (
              <span className="font-medium text-foreground">
                {selectedCount} of {data.length} row(s) selected
              </span>
            ) : (
              <span>
                Showing <strong className="font-medium text-foreground">{table.getRowModel().rows.length}</strong> of{' '}
                <strong className="font-medium text-foreground">{data.length}</strong> results
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              leftIcon={<ChevronLeft className="size-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              rightIcon={<ChevronRight className="size-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
