import * as React from 'react';

import { cn } from '../../utils/cn';
import type { UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/table.tsx (base-vega): a bare scrolling
 * container (no card frame), 40px foreground heads and 8px cells. Tailwind 3: has-aria-expanded
 * → has-[[aria-expanded=true]]; [&>tr]:last (Tailwind 4 applies variants left to right) →
 * [&>tr:last-child]. The Table passes the appearance to its parts.
 */
const WORKSPACE_TABLE = {
  container: 'relative w-full overflow-x-auto',
  table: 'w-full caption-bottom text-sm',
  header: '[&_tr]:border-b',
  body: '[&_tr:last-child]:border-0',
  footer: 'border-t bg-muted/50 font-medium [&>tr:last-child]:border-b-0',
  row: 'border-b transition-colors hover:bg-muted/50 has-[[aria-expanded=true]]:bg-muted/50 data-[state=selected]:bg-muted',
  head: 'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0',
  cell: 'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
  caption: 'mt-4 text-sm text-muted-foreground',
} as const;

const TableAppearanceContext = React.createContext<UIAppearance>('default');

/** A part's appearance: its own prop, else the enclosing Table's. */
function useTableAppearance(own?: UIAppearance): UIAppearance {
  const inherited = React.useContext(TableAppearanceContext);
  return own ?? inherited;
}

type WithAppearance<T> = T & {
  /** `workspace` renders the usability test's base-vega table; parts default to the Table's. */
  appearance?: UIAppearance;
};

const Table = React.forwardRef<
  HTMLTableElement,
  WithAppearance<React.HTMLAttributes<HTMLTableElement>>
>(({ className, appearance = 'default', ...props }, ref) => (
  <TableAppearanceContext.Provider value={appearance}>
    {appearance === 'workspace' ? (
      <div data-slot="table-container" className={WORKSPACE_TABLE.container}>
        <table
          ref={ref}
          data-slot="table"
          className={cn(WORKSPACE_TABLE.table, className)}
          {...props}
        />
      </div>
    ) : (
      <div className="relative w-full overflow-auto rounded-lg border border-border bg-card shadow-xs">
        <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
      </div>
    )}
  </TableAppearanceContext.Provider>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  WithAppearance<React.HTMLAttributes<HTMLTableSectionElement>>
>(({ className, appearance, ...props }, ref) =>
  useTableAppearance(appearance) === 'workspace' ? (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn(WORKSPACE_TABLE.header, className)}
      {...props}
    />
  ) : (
    <thead
      ref={ref}
      className={cn('bg-surface-subtle/80 [&_tr]:border-b [&_tr]:border-border', className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  WithAppearance<React.HTMLAttributes<HTMLTableSectionElement>>
>(({ className, appearance, ...props }, ref) =>
  useTableAppearance(appearance) === 'workspace' ? (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn(WORKSPACE_TABLE.body, className)}
      {...props}
    />
  ) : (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  WithAppearance<React.HTMLAttributes<HTMLTableSectionElement>>
>(({ className, appearance, ...props }, ref) =>
  useTableAppearance(appearance) === 'workspace' ? (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn(WORKSPACE_TABLE.footer, className)}
      {...props}
    />
  ) : (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-border bg-surface-subtle/60 font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  WithAppearance<React.HTMLAttributes<HTMLTableRowElement>>
>(({ className, appearance, ...props }, ref) =>
  useTableAppearance(appearance) === 'workspace' ? (
    <tr ref={ref} data-slot="table-row" className={cn(WORKSPACE_TABLE.row, className)} {...props} />
  ) : (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-colors hover:bg-surface-subtle/60 data-[state=selected]:bg-primary-subtle/40',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  WithAppearance<React.ThHTMLAttributes<HTMLTableCellElement>>
>(({ className, appearance, ...props }, ref) =>
  useTableAppearance(appearance) === 'workspace' ? (
    <th ref={ref} data-slot="table-head" className={cn(WORKSPACE_TABLE.head, className)} {...props} />
  ) : (
    <th
      ref={ref}
      className={cn(
        'h-9 px-4 text-left align-middle text-xs font-semibold uppercase text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  WithAppearance<React.TdHTMLAttributes<HTMLTableCellElement>>
>(({ className, appearance, ...props }, ref) =>
  useTableAppearance(appearance) === 'workspace' ? (
    <td ref={ref} data-slot="table-cell" className={cn(WORKSPACE_TABLE.cell, className)} {...props} />
  ) : (
    <td
      ref={ref}
      className={cn(
        'px-4 py-3 align-middle text-sm text-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  WithAppearance<React.HTMLAttributes<HTMLTableCaptionElement>>
>(({ className, appearance, ...props }, ref) =>
  useTableAppearance(appearance) === 'workspace' ? (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn(WORKSPACE_TABLE.caption, className)}
      {...props}
    />
  ) : (
    <caption ref={ref} className={cn('mt-3 text-xs text-muted-foreground', className)} {...props} />
  )
);
TableCaption.displayName = 'TableCaption';

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
