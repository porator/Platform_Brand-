# Orders: flow and requirements

Built in `components/orders/` from the vendored design system (`components/newgen-system-design`).
Sources (Confluence, read 12 Nov 2026):
- **MM**: Module Management PRD, Story 3
- **SC**: Soft Currency PRD, Story 12, plus its HLD and ACDEV-31387
- **BC**: Added Value: Bonus Coupons PRD
- **PPU**: Post-Purchase Upsell PRD
- **KS**: Kabam Subscriptions MVP PRD and its Refunds appendix
- **OV**: Orders: Overview
- **ST**: Orders statuses
- **FOLD**: Foldering PRD

## Journey

```
Sidebar › Orders (project or folder scope)
  └─ Orders list ── search · filters · date range · Columns · sort · pages
       └─ row click ─► Order details (same URL + ?order=<id>)
             ├─ ← Orders (back, keeps the list's filters)
             ├─ ↑ ↓ previous / next order in the list's current order
             ├─ Refund (eligible statuses only) ─► confirm ─► Refunded + history event
             ├─ Upsell ⇄ parent order links
             └─ Project link (folder scope) ─► the project's own Orders
```

## Orders list
Laid out after the reference recording:
- The toolbar is its own floating bar.
- Below it, a frameless table: a grey header band and thin row lines.
- Then a small pager.
- Every cell, IDs included, is 14px Manrope, regular.

- **Toolbar**, left to right:
  - date range;
  - "Search and filter" field;
  - clear all;
  - show / hide filters;
  - Sort & columns.
- **Scope.**
  - Project view lists the project's orders.
  - Folder and Company views roll up every accessible project in the subtree, with a Project column and filter [FOLD Story 7].
  - The list follows the current environment. Sandbox orders carry a "Test" badge [MM; ENV].
- **Order types.** Paid, Free and Subscription in one list. The old tabs become the Order type filter [MM Story 3].
- **Search and filter.** One field for both:
  - Typing searches Order ID, Player ID, Player email, Transaction ID, Receipt number and Subscription ID [MM].
  - Focusing the field opens "Filter by", where you pick a field, then its values. This is MM's "+ add filter".
  - Values are a multi-select: a checkbox per value, a search box, and Filters (back), Select all / Clear and Done below. The menu stays open while you tick.
  - Each filter becomes a removable chip ("Status is Failed, Refunded"). Clicking a chip edits it; Backspace in an empty field removes the last one.
  - Fields: Order type, Module (only modules in scope), Status, Offer type and Device OS.
  - Folder views add Project and Environment [FOLD Story 8]. Environment defaults to Production; adding "All sandboxes" brings in test orders.
- **Date range:** default 30 days, max 180.
- **Columns** [MM].
  - Visible by default: Date, Order ID, Project (folder views), Module, Order type, Offer / plan name, Price, Payment method, Player ID, Status.
  - Hidden by default: Offer type, Transaction ID, Player email, Device OS, Subscription ID, Payment # in cycle.
  - Date and Order ID can't be hidden.
  - The Sort & columns menu shows and hides columns and has "Reset to default". The layout is saved per view (project or folder) in this browser.
- **Sort.** Newest first by default. Change it from Sort & columns › Sort by, or by clicking a column header.
- **Pager.** "1–25 of 393" with previous and next. Previous / next on an order follow the list's filters and sort.
- **Free orders** show "Free". Payment Links and Direct Checkout show the session's item name as sent, or an empty cell.
- **Missing values** show an empty cell [MM].
- **Not built: saved views.** The recording has them ("Completed", "Copy of All", rename, duplicate, delete), but no PRD asks for them.

## Order details (full page, laid out after the reference)
- **Top row:**
  - a back arrow with an "Orders / <order ID>" breadcrumb;
  - Refund, only for Succeeded and Dispute won, never on Free or soft-currency orders [OV; SC];
  - joined previous / next arrows.
- **Title:** the order ID, Test and Upsell badges, then "Player · date · project (folder views) · module · order type".
- **Status banner:** tinted by status. It shows the status and its last event with the date, plus a note for soft-currency failures, refunds and test orders.
- **Main column.** Section titles sit above their cards.
  - **Products:** an icon tile, name, offer and external ID, a quantity chip with the coupon bonus ("×60,000 + 12,000 bonus" [BC 7a]) and the price, then the coupon note.
  - **Payment:**
    - label · detail · amount rows: Subtotal, Discount, Tax and a bold Total, with the USD value when the currency is local [OV];
    - under a divider: payment method, exchange cost, estimated fee and estimated net revenue (N/A unless earned).
    - Soft-currency and Free orders show only their total [SC-HLD].
  - **Subscription plan:** plan name, billing cycle and price. Hidden on renewals [KS §17.1].
  - **History:** a vertical timeline, newest first and grouped by day, with each event's status badge and time [OV].
  - **Metadata:** Formatted / Raw toggle [KS §17.2].
- **Side column.** Plain sections split by separators, with no cards; each field is a small label above its value, and IDs have copy buttons.
  - **Player:** ID, email, location, Device OS.
  - **Soft currency:** name and amount [SC Story 12].
  - **Order:** project (a link to the project's Orders in folder views), module, order type, offer or plan name, receipt number, publisher transaction ID, order ID.
  - **Subscription:** ID, payment # in cycle, billing cycle.
  - **Upsell:** "Upsell of" or "Upsell orders" links [PPU 20–21].
- **Not built:** the reference's comment box under the timeline, because no PRD asks for comments on orders.

## Open questions (documents disagree or are silent)
1. **Soft-currency orders in the dashboard.**
   - SC Story 12 adds fields to order details, but the SC-HLD keeps soft orders out of the dashboards "until the next phase".
   - **Built:** they're in the list as Paid orders with payment method "Soft currency" and a price in the soft currency. There's no new Order type.
2. **Upsell in the list.** No source defines a column, filter or order type for it. **Built:** links only in order details, with an "Upsell" badge next to the Order ID.
3. **Coupon fields.** BC stores the coupon type and bonus quantity, but OV only has "Applied discount". **Built:** the "+ bonus" product line, and the coupon type in Products.
4. **Free-order statuses** are still open [MM]. **Built:** Succeeded or Failed.
5. **Missing-value display varies:** "-" in OV, "N/A" in OV and SC, an empty cell in MM. **Built:** empty cells in the list, "—" in details, "N/A" for an undefined fee or soft-currency value.
6. **Undefined in every source:**
   - export, resend receipt and bulk actions (none added);
   - time zone (local time shown);
   - list currency format (each order in its own currency; details add USD);
   - which roles can refund.
7. **Status definitions disagree** between ST and OV: Dispute won "in favour of" whom, and Canceled vs Expired for timeouts. **Built:** the design system's `ORDER_STATUS_META` labels.
8. **Subscription channels:** MM says Webstore and Direct Checkout; KS says Kabam's hosted webstore only. **Built:** both modules.

## Design-system gaps (noted, not filled with custom UI)
- **Search and filter.** There's no such component. The field is assembled from Popover, Command and Badge around a bare text input, because the package's Input is a whole bordered field. FilterBar isn't used: it shows every filter at once and can't add filters one by one [MM].
- **Columns:** no drag to reorder and no column width control [MM].
- **DataTable** (not used; the list is the package's Table driven by TanStack Table, the engine DataTable itself uses):
  - no controlled sort, column visibility or page size (the 180-day / 100-row fetch is mocked);
  - no row-level `href` or keyboard focus on rows, so the Order ID cell is a button (Tab, then Enter) and a click anywhere on the row opens the order;
  - no `appearance="workspace"`, so it keeps the package's default look.
- **Timeline:** no history or timeline component. History uses the Table.
- **Tailwind 3 syntax in the package.** The package is written for Tailwind 3, and this app runs Tailwind 4.
  - Its `appearance="workspace"` Card uses `px-[--card-spacing]` / `[--card-spacing:theme(…)]`, which compile to nothing here, so the card loses its padding. Order details uses the default Card.
  - The `w-[--radix-…-trigger-width]` popover widths have the same problem: they fall back to content width.
  - Fix in the package by moving to the `(--var)` syntax.
