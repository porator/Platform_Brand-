"use client";

/* An order's page (docs/orders-flow.md), opened from the Orders list (?order=<id>). Laid out after the reference
 * recording's order page, in this app's design system:
 *   top row     ‹ Back · Orders / <order>                         Refund · ↑ ↓
 *   title       the order ID, then who / when / where
 *   banner      the status and its last event (Alert, tinted by status)
 *   main        Products · Payment · Subscription plan · History (a vertical timeline) · Metadata — titles above cards
 *   side        Player · Order · Subscription · Soft currency · Upsell — plain sections split by separators, no cards
 * Fields follow Orders: Overview, Kabam Subscriptions §15–17, Soft Currency Story 12, Bonus Coupons req 7a and
 * Post-Purchase Upsell reqs 20–21. Components: Alert, AlertDialog, Badge, Breadcrumb, Button, Card, OrderStatusBadge,
 * Separator, SimpleTooltip, Tabs, Typography, Flex. */

import * as React from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { IconChevronDown as ChevronDown, IconChevronLeft as ChevronLeft, IconChevronUp as ChevronUp, IconCopy as Copy, IconPackage as Package } from "@/lib/icons";
import { toast } from "sonner";
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  EOrderStatusType,
  Flex,
  ORDER_STATUS_META,
  OrderStatusBadge,
  Separator,
  SimpleTooltip,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Typography,
} from "@/components/newgen-system-design";
import { DEFAULT_ENV_ID, MODULE_LABEL, projectHref } from "@/lib/newgen";
import { ORDER_TYPE_LABEL, canRefund, formatPrice, formatUsd, paymentDetails, refundOrder, type Order } from "@/lib/orders";

const DASH = "—";
const when = (d: Date) => format(d, "dd MMM yyyy, HH:mm");

/* ───────── the status banner (the reference's "Completed · Order created on …") ───────── */

type Tone = "success" | "warning" | "destructive" | "info" | "default";
const TONE: Partial<Record<EOrderStatusType, Tone>> = {
  [EOrderStatusType.SUCCEEDED]: "success",
  [EOrderStatusType.DISPUTE_WON]: "success",
  [EOrderStatusType.PENDING]: "warning",
  [EOrderStatusType.DISPUTE_OPEN]: "warning",
  [EOrderStatusType.EVIDENCE_SUBMITTED]: "info",
  [EOrderStatusType.FAILED]: "destructive",
  [EOrderStatusType.CHARGE_FAILED]: "destructive",
  [EOrderStatusType.REFUND_FAILED]: "destructive",
  [EOrderStatusType.DISPUTE_LOST]: "destructive",
};

function StatusBanner({ order: o }: { order: Order }) {
  const last = o.history[o.history.length - 1];
  const extra = o.softCurrency?.failure
    ? ` The player didn't have enough ${o.softCurrency.name}; no items were awarded.`
    : o.status === EOrderStatusType.REFUNDED
      ? " The player got a refund receipt by email."
      : o.test
        ? " A test order: it isn't counted in sales and can't be refunded."
        : "";
  return <Alert variant={TONE[o.status] ?? "default"} title={ORDER_STATUS_META[o.status].label} message={`${last.event} on ${when(last.date)}.${extra}`} />;
}

/* ───────── pieces ───────── */

const SectionTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <Flex justify="between" align="center" className="mb-2">
    <Typography tag="h3" variant="body" className="font-semibold">
      {children}
    </Typography>
    {action}
  </Flex>
);

function CopyButton({ label, value }: { label: string; value: string }) {
  return (
    <SimpleTooltip content={`Copy ${label.toLowerCase()}`} appearance="workspace">
      <Button
        appearance="workspace"
        variant="ghost"
        size="icon-xs"
        aria-label={`Copy ${label.toLowerCase()}`}
        onClick={() => {
          void navigator.clipboard?.writeText(value);
          toast.success(`${label} copied`);
        }}
      >
        <Copy />
      </Button>
    </SimpleTooltip>
  );
}

/** A Payment row: label · detail · amount (the reference's three columns). */
function PayRow({ label, detail, amount, strong, muted }: { label: string; detail?: React.ReactNode; amount: React.ReactNode; strong?: boolean; muted?: boolean }) {
  const cls = strong ? "font-semibold" : "font-normal";
  return (
    <div className="grid grid-cols-[11rem_minmax(0,1fr)_auto] items-baseline gap-3 py-1">
      <Typography tag="span" variant="body-sm" className={cls} muted={muted}>
        {label}
      </Typography>
      <Typography tag="span" variant="body-sm" className="truncate font-normal" muted>
        {detail}
      </Typography>
      <Typography tag="span" variant="body-sm" tabular className={`text-right ${cls}`} muted={muted}>
        {amount}
      </Typography>
    </div>
  );
}

/** A side-column field: a small label above its value (the reference's "Currency" style). */
function SideField({ label, value, mono, copy }: { label: string; value: React.ReactNode; mono?: boolean; copy?: string }) {
  const empty = value === "" || value === null || value === undefined;
  return (
    <Flex direction="column" gap="none" className="py-1">
      <Typography tag="span" variant="caption" className="text-xs">
        {label}
      </Typography>
      <Flex align="center" gap="xs" className="min-w-0">
        <Typography tag="span" variant="body-sm" className={mono ? "truncate font-mono text-xs font-normal" : "font-normal"}>
          {empty ? DASH : value}
        </Typography>
        {copy && !empty ? <CopyButton label={label} value={copy} /> : null}
      </Flex>
    </Flex>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="xs">
      <Typography tag="h3" variant="body-sm" className="font-semibold">
        {title}
      </Typography>
      {children}
    </Flex>
  );
}

/* ───────── the page ───────── */

export function OrderDetails({
  order,
  related,
  onBack,
  onOpen,
  prevId,
  nextId,
  folder,
}: {
  order: Order;
  /** The upsell's first order, or the first order's upsells (looked up by the page). */
  related: Order[];
  onBack: () => void;
  onOpen: (id: string) => void;
  prevId?: string;
  nextId?: string;
  folder: boolean;
}) {
  const o = order;
  const soft = !!o.softCurrency;
  const free = o.type === "free";
  const sub = o.type === "subscription";
  const pay = paymentDetails(o);
  const local = !!o.currency && o.currency !== "USD" && !soft;
  const usd = (n: number) => (local ? formatUsd(n * o.usdRate) : null);
  const earned = o.status === EOrderStatusType.SUCCEEDED || o.status === EOrderStatusType.DISPUTE_WON;
  const items = o.products.length;

  const metadata = {
    order_id: o.id,
    module: o.module,
    order_type: o.type,
    provider: soft ? "softCurrency" : free ? "free" : "appcharge",
    transaction_type: o.parentOrderId ? "post_purchase_upsell" : "purchase",
    parent_order_id: o.parentOrderId,
    subscription_id: o.subscriptionId || null,
    player_id: o.playerId,
    offer: { name: o.offerName, external_id: o.offerExternalId, type: o.offerType },
    price: { amount: o.price, currency: o.currency || null },
    coupon: o.coupon,
    soft_currency: o.softCurrency,
    status: o.status,
    test: o.test,
    created_at: o.date.toISOString(),
  };

  // History as a timeline, newest first, grouped by day.
  const events = [...o.history].reverse();

  return (
    <Flex direction="column" gap="lg" className="mx-auto w-full max-w-5xl">
      {/* Top row: back and where you are; Refund and previous / next at the right. */}
      <Flex justify="between" align="center" gap="md">
        <Flex align="center" gap="sm" className="min-w-0">
          <SimpleTooltip content="Back to orders" appearance="workspace">
            <Button appearance="workspace" variant="ghost" size="icon-sm" aria-label="Back to orders" onClick={onBack}>
              <ChevronLeft />
            </Button>
          </SimpleTooltip>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button type="button" onClick={onBack}>
                    Orders
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-mono text-xs">{o.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Flex>
        <Flex align="center" gap="sm">
          {canRefund(o) ? <RefundButton order={o} /> : null}
          <Flex gap="none" className="overflow-hidden rounded-full border border-border">
            <SimpleTooltip content="Previous order" appearance="workspace">
              <Button appearance="workspace" variant="ghost" size="icon-sm" className="rounded-none" aria-label="Previous order" disabled={!prevId} onClick={() => prevId && onOpen(prevId)}>
                <ChevronUp />
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content="Next order" appearance="workspace">
              <Button appearance="workspace" variant="ghost" size="icon-sm" className="rounded-none" aria-label="Next order" disabled={!nextId} onClick={() => nextId && onOpen(nextId)}>
                <ChevronDown />
              </Button>
            </SimpleTooltip>
          </Flex>
        </Flex>
      </Flex>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        {/* Main column */}
        <Flex direction="column" gap="xl" className="min-w-0">
          <Flex direction="column" gap="md">
            <Flex direction="column" gap="xs">
              <Flex align="center" gap="sm" wrap>
                <Typography tag="h2" variant="h3" className="font-mono text-xl">
                  {o.id}
                </Typography>
                {o.test ? (
                  <Badge variant="warning" pill>
                    Test
                  </Badge>
                ) : null}
                {o.parentOrderId ? (
                  <Badge variant="info" pill>
                    Upsell
                  </Badge>
                ) : null}
              </Flex>
              <Typography variant="caption">
                {[`Player ${o.playerId}`, when(o.date), folder ? o.projectName : null, MODULE_LABEL[o.module], ORDER_TYPE_LABEL[o.type]].filter(Boolean).join(" · ")}
              </Typography>
            </Flex>
            <StatusBanner order={o} />
          </Flex>

          <section>
            <SectionTitle>Products</SectionTitle>
            <Card>
              {o.products.map((p, i) => (
                <React.Fragment key={p.externalId || p.name}>
                  {i ? <Separator /> : null}
                  <Flex align="center" gap="md" className="p-4">
                    <Flex align="center" justify="center" className="size-10 shrink-0 rounded-md border border-border bg-muted">
                      <Package className="size-4 text-muted-foreground" aria-hidden />
                    </Flex>
                    <Flex direction="column" gap="none" className="min-w-0 flex-1">
                      <Typography tag="span" variant="body-sm" className="truncate">
                        {p.name}
                      </Typography>
                      <Typography tag="span" variant="caption" className="truncate text-xs">
                        {[o.offerName && o.offerName !== p.name ? o.offerName : null, p.externalId || null].filter(Boolean).join(" · ") || DASH}
                      </Typography>
                    </Flex>
                    <Flex align="center" gap="sm" className="shrink-0">
                      <Badge variant="secondary">
                        ×{p.quantity.toLocaleString("en-US")}
                        {/* Bonus coupon: "Coins 100,000 + 20,000 bonus" (BC req 7a). */}
                        {p.bonus ? ` + ${p.bonus.toLocaleString("en-US")} bonus` : ""}
                      </Badge>
                      <Typography tag="span" variant="body-sm" tabular className="w-24 text-right">
                        {i === 0 ? formatPrice(o) : ""}
                      </Typography>
                    </Flex>
                  </Flex>
                </React.Fragment>
              ))}
              {o.coupon ? (
                <>
                  <Separator />
                  <Flex gap="sm" align="center" className="px-4 py-3">
                    <Badge variant="success" pill>
                      {o.coupon.type}
                    </Badge>
                    <Typography variant="caption" className="text-xs">
                      +{o.coupon.percent}% bonus on every matching item. The price didn&apos;t change.
                    </Typography>
                  </Flex>
                </>
              ) : null}
            </Card>
          </section>

          {/* Payment (OV). Soft-currency and free orders have no payment, tax or fee (SC-HLD), only their total. */}
          <section>
            <SectionTitle>Payment</SectionTitle>
            <Card className="px-4 py-3">
              {free ? (
                <PayRow label="Total" detail={`${items} ${items === 1 ? "item" : "items"} · no payment`} amount="Free" strong />
              ) : soft ? (
                <>
                  <PayRow label="Paid with" detail="Soft currency" amount={o.softCurrency?.name ?? "N/A"} />
                  <PayRow label="Total" amount={formatPrice(o)} strong />
                </>
              ) : (
                <>
                  <PayRow label="Subtotal" detail={`${items} ${items === 1 ? "item" : "items"}`} amount={formatPrice(o, pay.subtotal)} />
                  <PayRow label="Discount" amount={formatPrice(o, pay.discount)} />
                  <PayRow label="Tax" detail={`${Math.round(o.taxRate * 100)}%, included`} amount={formatPrice(o, pay.tax)} />
                  <PayRow label="Total" detail={usd(pay.collected)} amount={`${formatPrice(o, pay.collected)} ${o.currency}`} strong />
                  <Separator className="my-2" />
                  <PayRow label="Payment method" amount={o.paymentMethod} muted />
                  <PayRow label="Exchange cost" detail={usd(pay.exchange)} amount={formatPrice(o, pay.exchange)} muted />
                  <PayRow label="Estimated fee" detail={earned ? usd(pay.fee) : null} amount={earned ? formatPrice(o, pay.fee) : "N/A"} muted />
                  <PayRow label="Estimated net revenue" detail={earned ? usd(pay.net) : null} amount={earned ? formatPrice(o, pay.net) : "N/A"} muted />
                </>
              )}
            </Card>
          </section>

          {/* Subscription plan (KS §17.1): hidden on renewals. */}
          {sub && o.paymentInCycle === 1 ? (
            <section>
              <SectionTitle>Subscription plan</SectionTitle>
              <Card className="px-4 py-3">
                <PayRow label="Plan name" amount={o.offerName} />
                <PayRow label="Billing cycle" amount={o.billingCycle} />
                <PayRow label="Price" detail={usd(o.price)} amount={formatPrice(o)} />
              </Card>
            </section>
          ) : null}

          {/* History (OV: status, event, date) as the reference's timeline: a line, a dot per event, days as headings. */}
          <section>
            <SectionTitle>History</SectionTitle>
            <div className="relative ml-1.5 border-l border-border pl-6">
              {events.map((h, i) => {
                const newDay = i === 0 || !isSameDay(h.date, events[i - 1].date);
                return (
                  <React.Fragment key={`${h.event}-${i}`}>
                    {newDay ? (
                      <Typography variant="caption" className={i ? "pt-4 pb-1 text-xs" : "pb-1 text-xs"}>
                        {format(h.date, "dd MMM yyyy")}
                      </Typography>
                    ) : null}
                    <Flex align="center" gap="md" className="relative py-1.5">
                      <span aria-hidden className={`absolute -left-[1.85rem] size-2.5 rounded-full border-2 border-background ${i === 0 ? "bg-foreground" : "bg-muted-foreground/50"}`} />
                      <Typography tag="span" variant="body-sm" className="flex-1 font-normal" muted={i !== 0}>
                        {h.event}
                      </Typography>
                      <OrderStatusBadge status={h.status} />
                      <Typography tag="span" variant="caption" tabular className="w-12 text-right text-xs">
                        {format(h.date, "HH:mm")}
                      </Typography>
                    </Flex>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Metadata with a Formatted / Raw toggle (KS §17.2). */}
          <section>
            <Tabs appearance="workspace" defaultValue="formatted">
              <SectionTitle
                action={
                  <TabsList>
                    <TabsTrigger value="formatted">Formatted</TabsTrigger>
                    <TabsTrigger value="raw">Raw</TabsTrigger>
                  </TabsList>
                }
              >
                Metadata
              </SectionTitle>
              <Card className="px-4 py-3">
                <TabsContent value="formatted" className="mt-0">
                  <PayRow label="Provider" amount={metadata.provider} />
                  <PayRow label="Transaction type" amount={metadata.transaction_type} />
                  <PayRow label="Offer external ID" amount={o.offerExternalId || DASH} />
                  <PayRow label="Offer type" amount={o.offerType || DASH} />
                </TabsContent>
                <TabsContent value="raw" className="mt-0">
                  <Typography tag="code" variant="code" className="block overflow-x-auto whitespace-pre bg-transparent px-0 text-xs">
                    {JSON.stringify(metadata, null, 2)}
                  </Typography>
                </TabsContent>
              </Card>
            </Tabs>
          </section>
        </Flex>

        {/* Side column: plain sections, as in the reference. */}
        <Flex direction="column" gap="lg" className="min-w-0 lg:pt-1">
          <SideSection title="Player">
            <SideField label="Player ID" value={o.playerId} mono copy={o.playerId} />
            <SideField label="Email" value={o.playerEmail} />
            <SideField label="Location" value={[o.zip, o.state, o.country].filter(Boolean).join(", ")} />
            <SideField label="Device OS" value={o.deviceOs} />
          </SideSection>

          {/* Soft Currency Story 12: name at order time and the whole-number amount. */}
          {soft ? (
            <>
              <Separator />
              <SideSection title="Soft currency">
                <SideField label="Soft currency name" value={o.softCurrency?.name ?? "N/A"} />
                <SideField label="Soft currency amount" value={o.softCurrency ? o.softCurrency.amount.toLocaleString("en-US") : "N/A"} />
              </SideSection>
            </>
          ) : null}

          <Separator />
          <SideSection title="Order">
            <SideField
              label="Project"
              value={
                folder ? (
                  // Folder view: the project's own Orders (Foldering PRD Story 7: selecting a project drills in).
                  <Button appearance="workspace" variant="link" className="h-auto p-0" asChild>
                    <Link href={projectHref(o.projectId, "orders", DEFAULT_ENV_ID)}>{o.projectName}</Link>
                  </Button>
                ) : (
                  o.projectName
                )
              }
            />
            <SideField label="Module" value={MODULE_LABEL[o.module]} />
            <SideField label="Order type" value={ORDER_TYPE_LABEL[o.type]} />
            <SideField label={sub ? "Plan name" : "Offer name"} value={o.offerName} />
            <SideField label="Receipt number" value={o.receiptNumber} mono />
            <SideField label="Publisher transaction ID" value={o.transactionId} mono copy={o.transactionId} />
            <SideField label="Order ID" value={o.id} mono copy={o.id} />
          </SideSection>

          {sub ? (
            <>
              <Separator />
              <SideSection title="Subscription">
                <SideField label="Subscription ID" value={o.subscriptionId} mono copy={o.subscriptionId} />
                <SideField label="Payment # in cycle" value={o.paymentInCycle} />
                <SideField label="Billing cycle" value={o.billingCycle} />
              </SideSection>
            </>
          ) : null}

          {/* Post-purchase upsell (PPU 20–21): an upsell links to its first order; the first order lists its upsells. */}
          {related.length ? (
            <>
              <Separator />
              <SideSection title={o.parentOrderId ? "Upsell of" : "Upsell orders"}>
                {related.map((r) => (
                  <Flex key={r.id} direction="column" gap="xs" className="py-1">
                    <Button appearance="workspace" variant="link" className="h-auto justify-start p-0 font-mono text-xs" onClick={() => onOpen(r.id)}>
                      {r.id}
                    </Button>
                    <Flex align="center" gap="sm">
                      <Typography variant="caption" className="text-xs">
                        {r.offerName} · {formatPrice(r)}
                      </Typography>
                      <OrderStatusBadge status={r.status} />
                    </Flex>
                  </Flex>
                ))}
              </SideSection>
            </>
          ) : null}
        </Flex>
      </div>
    </Flex>
  );
}

/** Refund: one charge, in full (Orders: Overview; for a subscription it doesn't cancel the plan, KS appendix §1). */
function RefundButton({ order }: { order: Order }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button appearance="workspace" variant="outline" size="sm">
          Refund
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Refund {formatPrice(order)}?</AlertDialogTitle>
          <AlertDialogDescription>
            The player gets the full amount back to {order.paymentMethod} and a refund receipt by email.
            {order.type === "subscription" ? " The subscription stays active; cancel it from the subscription's page." : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              refundOrder(order.id);
              toast.success("Order refunded", { description: `${formatPrice(order)} back to ${order.paymentMethod}` });
            }}
          >
            Refund
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
