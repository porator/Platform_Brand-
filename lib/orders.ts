/* Mock orders for the Orders pages (docs/orders-flow.md). One list of Paid, Free and Subscription orders, each
 * carrying the module it was sold through (Module Management PRD, Story 3), plus the details the order page shows:
 * Orders: Overview (payment details, products, history), Soft Currency Story 12, Bonus Coupons req 7, Post-Purchase
 * Upsell reqs 20–21 and Kabam Subscriptions §17. Every order is generated from the project id and the day, so a
 * project always shows the same orders. Refunds made in the prototype live in memory until a reload. */

import * as React from "react";
import { addDays, addMinutes, differenceInCalendarDays, eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import { EOrderStatusType } from "@/components/newgen-system-design";
import type { ModuleId } from "@/lib/newgen";

/* ───────── seeded randomness ───────── */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rand(key: string): number {
  let t = hash(key) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T,>(key: string, xs: readonly T[]) => xs[Math.floor(rand(key) * xs.length) % xs.length];
const weighted = <T,>(key: string, xs: readonly (readonly [T, number])[]) => {
  const total = xs.reduce((a, [, w]) => a + w, 0);
  let r = rand(key) * total;
  for (const [x, w] of xs) {
    r -= w;
    if (r <= 0) return x;
  }
  return xs[xs.length - 1][0];
};
const hex = (key: string, n: number) => Array.from({ length: n }, (_, i) => Math.floor(rand(`${key}:${i}`) * 16).toString(16)).join("");

/* ───────── vocabulary ───────── */

export type OrderType = "paid" | "free" | "subscription";
export const ORDER_TYPE_LABEL: Record<OrderType, string> = { paid: "Paid", free: "Free", subscription: "Subscription" };
export const ORDER_TYPES = Object.keys(ORDER_TYPE_LABEL) as OrderType[];

/** The statuses the prototype generates, from the design system's order statuses (Orders statuses, Orders: Overview). */
export const STATUSES: EOrderStatusType[] = [
  EOrderStatusType.SUCCEEDED,
  EOrderStatusType.PENDING,
  EOrderStatusType.FAILED,
  EOrderStatusType.CHARGE_FAILED,
  EOrderStatusType.REFUNDED,
  EOrderStatusType.REFUND_FAILED,
  EOrderStatusType.DISPUTE_OPEN,
  EOrderStatusType.EVIDENCE_SUBMITTED,
  EOrderStatusType.DISPUTE_WON,
  EOrderStatusType.DISPUTE_LOST,
  EOrderStatusType.CANCELED,
  EOrderStatusType.PAYMENT_EXPIRED,
];

/** Refund is offered only for these (Orders: Overview); never on Free or soft-currency orders. */
const REFUNDABLE = new Set<EOrderStatusType>([EOrderStatusType.SUCCEEDED, EOrderStatusType.DISPUTE_WON]);

export const OFFER_TYPES = ["Bundle", "PopUp", "SpecialOffer", "RollingOffer", "DailyBonus"] as const;
export const DEVICE_OS = ["iOS", "Android", "Windows", "Mac OS"] as const;

const WEBSTORE_OFFERS = [
  { name: "Starter Bundle", type: "Bundle", price: 4.99, item: "Coins", qty: 25_000 },
  { name: "Coin Pack S", type: "Bundle", price: 1.99, item: "Coins", qty: 10_000 },
  { name: "Coin Pack M", type: "Bundle", price: 9.99, item: "Coins", qty: 60_000 },
  { name: "Mega Coin Pack", type: "Bundle", price: 49.99, item: "Coins", qty: 100_000 },
  { name: "Weekend Offer", type: "SpecialOffer", price: 19.99, item: "Gems", qty: 2_400 },
  { name: "Comeback Deal", type: "PopUp", price: 2.99, item: "Lives", qty: 10 },
  { name: "Gem Chest", type: "RollingOffer", price: 9.99, item: "Gems", qty: 1_100 },
  { name: "Daily Deal", type: "SpecialOffer", price: 0.99, item: "Boosters", qty: 3 },
] as const;
const FREE_OFFERS = [
  { name: "Daily Bonus · Day 3", type: "DailyBonus", item: "Coins", qty: 500 },
  { name: "Free Coins", type: "Bundle", item: "Coins", qty: 1_000 },
  { name: "Welcome Gift", type: "PopUp", item: "Gems", qty: 20 },
  { name: "Rolling Offer · Free step", type: "RollingOffer", item: "Boosters", qty: 1 },
] as const;
/** Soft-currency offers (Webstore only, Soft Currency PRD): priced in the game's soft currency. */
const SOFT_OFFERS = [
  { name: "Booster Crate", type: "Bundle", item: "Boosters", qty: 5, cost: 1_200 },
  { name: "Extra Lives", type: "SpecialOffer", item: "Lives", qty: 5, cost: 450 },
  { name: "Hammer Pack", type: "Bundle", item: "Hammers", qty: 3, cost: 2_500 },
] as const;
const PLANS = [
  { name: "VIP Pass · Monthly", cycle: "Monthly", price: 9.99 },
  { name: "Gold Club · Weekly", cycle: "Weekly", price: 4.99 },
] as const;
/** Payment Links and Direct Checkout: the item name as the game sent it in the checkout session — formats vary. */
const SESSION_ITEMS = [
  { name: "gems_500", price: 4.99 },
  { name: "com.game.coins.1200", price: 9.99 },
  { name: "Gem Pack (x1200)", price: 9.99 },
  { name: "SKU-STARTER-01", price: 2.99 },
  { name: "battle_pass_s12", price: 14.99 },
  { name: "Energy Refill", price: 0.99 },
  { name: "", price: 19.99 },
] as const;
/** Post-purchase upsell offers: US / CA, card or wallets only (PPU). */
const UPSELL_OFFERS = [
  { name: "Add 50% more coins", price: 2.99, item: "Coins", qty: 30_000 },
  { name: "Booster bundle add-on", price: 1.99, item: "Boosters", qty: 5 },
] as const;
const METHODS = [
  ["Card **** 4242", 0.42],
  ["Card **** 1881", 0.08],
  ["Apple Pay", 0.24],
  ["Google Pay", 0.14],
  ["PayPal", 0.12],
] as const;
const UPSELL_METHODS = new Set(["Card **** 4242", "Card **** 1881", "Apple Pay", "Google Pay"]);
/** Country → currency, tax rate and a sample state / zip (state only for US and CA, Orders: Overview). */
const COUNTRIES = [
  { country: "United States", code: "US", currency: "USD", rate: 1, tax: 0.07, states: ["CA", "TX", "NY", "WA"], zip: "94107", w: 0.46 },
  { country: "Canada", code: "CA", currency: "CAD", rate: 0.73, tax: 0.13, states: ["ON", "BC", "QC"], zip: "M5V 2T6", w: 0.08 },
  { country: "Germany", code: "DE", currency: "EUR", rate: 1.08, tax: 0.19, states: [], zip: "10115", w: 0.14 },
  { country: "United Kingdom", code: "GB", currency: "GBP", rate: 1.27, tax: 0.2, states: [], zip: "SW1A 1AA", w: 0.12 },
  { country: "Brazil", code: "BR", currency: "BRL", rate: 0.18, tax: 0.17, states: [], zip: "01310-100", w: 0.08 },
  { country: "Israel", code: "IL", currency: "ILS", rate: 0.27, tax: 0.18, states: [], zip: "6100000", w: 0.12 },
] as const;
type Country = (typeof COUNTRIES)[number];

/* ───────── the order ───────── */

export type Product = {
  name: string;
  externalId: string;
  quantity: number;
  /** Bonus coupon: extra quantity on top (Bonus Coupons req 7a: "Coins 100,000 + 20,000 bonus"). */
  bonus?: number;
};
export type HistoryEvent = { status: EOrderStatusType; event: string; date: Date };

export type Order = {
  id: string;
  date: Date;
  projectId: string;
  projectName: string;
  module: ModuleId;
  type: OrderType;
  /** Offer name; plan name for subscriptions; for Payment Links / Direct Checkout the session's item name as sent (may be empty). */
  offerName: string;
  offerExternalId: string;
  offerType: string;
  /** In the order's own currency; 0 for free orders; the soft-currency cost for soft-currency orders. */
  price: number;
  currency: string;
  /** The currency's USD rate (1 for USD). */
  usdRate: number;
  paymentMethod: string;
  playerId: string;
  playerEmail: string;
  deviceOs: string;
  country: string;
  state: string;
  zip: string;
  transactionId: string;
  receiptNumber: string;
  status: EOrderStatusType;
  /** Subscriptions (Kabam Subscriptions §17): the subscription, its plan's billing cycle and which charge this is. */
  subscriptionId: string;
  billingCycle: string;
  paymentInCycle: number | null;
  /** Soft Currency Story 12: the currency's name at order time and the whole-number amount. */
  softCurrency: { name: string; amount: number; failure?: string } | null;
  /** Bonus coupon applied (Bonus Coupons req 7): its type; the bonus sits on the product lines. */
  coupon: { type: string; percent: number } | null;
  /** Post-purchase upsell (PPU reqs 20–21): the first order of the session, or the upsells made after it. */
  parentOrderId: string | null;
  upsellOrderIds: string[];
  products: Product[];
  discount: number;
  taxRate: number;
  /** Sandbox order, or a Production order through a mock endpoint. */
  test: boolean;
  history: HistoryEvent[];
};

export type ScopeProject = { id: string; name: string; modules: ModuleId[] };

/** Daily orders a module of a project takes (fixed per project). */
function dailyCount(p: ScopeProject, m: ModuleId, date: Date): number {
  const base = m === "webstore" ? 7 + rand(`${p.id}:oc`) * 8 : 2 + rand(`${p.id}:oc:${m}`) * 4;
  const weekend = [0, 6].includes(date.getDay()) ? 1.2 : 1;
  return Math.round(base * weekend * (0.7 + rand(`${p.id}:${m}:${format(date, "yyyy-MM-dd")}:n`) * 0.6));
}

const money = (n: number) => Math.round(n * 100) / 100;
const externalId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function historyFor(k: string, when: Date, status: EOrderStatusType, type: OrderType, soft: boolean): HistoryEvent[] {
  const at = (min: number) => addMinutes(when, min);
  const created: HistoryEvent = { status: EOrderStatusType.CREATED, event: type === "subscription" ? "Charge attempted" : "Checkout opened", date: when };
  const paid = (min = 1): HistoryEvent => ({ status: EOrderStatusType.SUCCEEDED, event: soft ? "Soft currency charged; items awarded" : type === "free" ? "Items awarded" : "Payment succeeded; items awarded", date: at(min) });
  switch (status) {
    case EOrderStatusType.SUCCEEDED:
      return [created, paid()];
    case EOrderStatusType.PENDING:
      return [created, { status, event: "Waiting for the payment provider", date: at(1) }];
    case EOrderStatusType.FAILED:
      return [created, { status, event: type === "free" ? "Award failed" : "Payment declined (not charged)", date: at(2) }];
    case EOrderStatusType.CHARGE_FAILED:
      return [created, { status, event: soft ? "Charge failed: INSUFFICIENT_SOFT_CURRENCY" : "Charged; award failed", date: at(1) }];
    case EOrderStatusType.REFUNDED:
      return [created, paid(), { status, event: "Refunded in full", date: addDays(at(1), 1 + Math.floor(rand(`${k}:rd`) * 6)) }];
    case EOrderStatusType.REFUND_FAILED:
      return [created, paid(), { status, event: "Refund failed at the payment provider", date: addDays(at(1), 2) }];
    case EOrderStatusType.DISPUTE_OPEN:
      return [created, paid(), { status, event: "Dispute opened by the player's bank", date: addDays(at(1), 9) }];
    case EOrderStatusType.EVIDENCE_SUBMITTED:
      return [created, paid(), { status: EOrderStatusType.DISPUTE_OPEN, event: "Dispute opened by the player's bank", date: addDays(at(1), 8) }, { status, event: "Evidence submitted", date: addDays(at(1), 10) }];
    case EOrderStatusType.DISPUTE_WON:
      return [created, paid(), { status: EOrderStatusType.DISPUTE_OPEN, event: "Dispute opened by the player's bank", date: addDays(at(1), 6) }, { status, event: "Dispute won", date: addDays(at(1), 21) }];
    case EOrderStatusType.DISPUTE_LOST:
      return [created, paid(), { status: EOrderStatusType.DISPUTE_OPEN, event: "Dispute opened by the player's bank", date: addDays(at(1), 5) }, { status, event: type === "subscription" ? "Dispute lost; subscription canceled" : "Dispute lost", date: addDays(at(1), 25) }];
    case EOrderStatusType.CANCELED:
      return [created, { status, event: "Canceled by the player", date: at(3) }];
    case EOrderStatusType.PAYMENT_EXPIRED:
      return [created, { status, event: "No purchase within an hour", date: at(60) }];
    default:
      return [created];
  }
}

function makeOrder(p: ScopeProject, m: ModuleId, date: Date, i: number, sandbox: boolean): Order {
  const k = `${p.id}:${m}:${format(date, "yyyy-MM-dd")}:${i}`;
  // Subscriptions sell through Webstore and Direct Checkout (MM Story 2); Free orders are Webstore offers.
  const type: OrderType =
    m === "webstore"
      ? weighted(`${k}:t`, [["paid", 0.68], ["free", 0.22], ["subscription", 0.1]] as const)
      : m === "direct-checkout"
        ? weighted(`${k}:t`, [["paid", 0.9], ["subscription", 0.1]] as const)
        : "paid";
  const when = addMinutes(date, Math.floor(rand(`${k}:min`) * 1440));
  const player = String(100000000 + Math.floor(rand(`${k}:pl`) * 9000) * 1373);
  const c: Country = weighted(`${k}:c`, COUNTRIES.map((x) => [x, x.w] as const));
  // Soft-currency offers: Webstore paid orders only (Soft Currency PRD, out of scope for Payment Links / checkout-only).
  const soft = m === "webstore" && type === "paid" && rand(`${k}:soft`) < 0.12;

  let offerName = "";
  let offerType = "";
  let usdPrice = 0;
  let products: Product[] = [];
  let billingCycle = "";
  let softCurrency: Order["softCurrency"] = null;
  if (type === "subscription") {
    const plan = pick(`${k}:plan`, PLANS);
    offerName = plan.name;
    offerType = "Subscription";
    usdPrice = plan.price;
    billingCycle = plan.cycle;
    products = [{ name: plan.name, externalId: externalId(plan.name), quantity: 1 }];
  } else if (type === "free") {
    const o = pick(`${k}:fo`, FREE_OFFERS);
    offerName = o.name;
    offerType = o.type;
    products = [{ name: o.item, externalId: externalId(o.item), quantity: o.qty }];
  } else if (soft) {
    const o = pick(`${k}:so`, SOFT_OFFERS);
    offerName = o.name;
    offerType = o.type;
    products = [{ name: o.item, externalId: externalId(o.item), quantity: o.qty }];
    softCurrency = { name: "Gems", amount: o.cost };
  } else if (m === "webstore") {
    const o = pick(`${k}:o`, WEBSTORE_OFFERS);
    offerName = o.name;
    offerType = o.type;
    usdPrice = o.price;
    products = [{ name: o.item, externalId: externalId(o.item), quantity: o.qty }];
  } else {
    const o = pick(`${k}:si`, SESSION_ITEMS);
    offerName = o.name;
    usdPrice = o.price;
    products = [{ name: o.name || "Item", externalId: o.name, quantity: 1 }];
  }

  const status: EOrderStatusType = soft
    ? weighted(`${k}:s`, [[EOrderStatusType.SUCCEEDED, 0.9], [EOrderStatusType.CHARGE_FAILED, 0.1]] as const)
    : type === "free"
      ? weighted(`${k}:s`, [[EOrderStatusType.SUCCEEDED, 0.95], [EOrderStatusType.FAILED, 0.05]] as const)
      : weighted(`${k}:s`, [
          [EOrderStatusType.SUCCEEDED, 0.82],
          [EOrderStatusType.PENDING, 0.02],
          [EOrderStatusType.FAILED, 0.04],
          [EOrderStatusType.REFUNDED, 0.03],
          [EOrderStatusType.REFUND_FAILED, 0.005],
          [EOrderStatusType.DISPUTE_OPEN, 0.006],
          [EOrderStatusType.EVIDENCE_SUBMITTED, 0.004],
          [EOrderStatusType.DISPUTE_WON, 0.004],
          [EOrderStatusType.DISPUTE_LOST, 0.004],
          [EOrderStatusType.CANCELED, 0.02],
          [EOrderStatusType.PAYMENT_EXPIRED, 0.02],
        ] as const);
  if (soft && status === EOrderStatusType.CHARGE_FAILED && softCurrency) softCurrency = { ...softCurrency, failure: "INSUFFICIENT_SOFT_CURRENCY" };

  // Bonus coupon: Webstore and checkout-only, not Payment Links (BC); the price doesn't change.
  const coupon =
    type === "paid" && !soft && m !== "payment-links" && rand(`${k}:cp`) < 0.14 ? { type: "Bonus coupon", percent: pick(`${k}:cpp`, [10, 20, 25]) } : null;
  if (coupon) products = products.map((pr) => ({ ...pr, bonus: Math.round((pr.quantity * coupon.percent) / 100) }));

  const charged = type !== "free" && !soft;
  const paidMethod = charged ? weighted(`${k}:pm`, METHODS) : soft ? "Soft currency" : "";
  const price = charged ? money(usdPrice / c.rate) : soft && softCurrency ? softCurrency.amount : 0;
  const reached = ![EOrderStatusType.FAILED, EOrderStatusType.PENDING, EOrderStatusType.CANCELED, EOrderStatusType.PAYMENT_EXPIRED, EOrderStatusType.CHARGE_FAILED].includes(status);
  const subId = type === "subscription" ? `sub_${hex(`${p.id}:${player}:sub`, 14)}` : "";

  return {
    id: hex(`${k}:id`, 24),
    date: when,
    projectId: p.id,
    projectName: p.name,
    module: m,
    type,
    offerName,
    offerExternalId: type === "subscription" ? subId : offerName ? externalId(offerName) : "",
    offerType,
    price,
    currency: soft && softCurrency ? softCurrency.name : charged ? c.currency : "",
    usdRate: charged ? c.rate : 1,
    paymentMethod: paidMethod,
    playerId: player,
    // Free orders usually don't collect an email.
    playerEmail: !charged && rand(`${k}:em`) < 0.85 ? "" : `player${player.slice(-5)}@${pick(`${k}:dom`, ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"])}`,
    deviceOs: weighted(`${k}:os`, [["iOS", 0.42], ["Android", 0.4], ["Windows", 0.12], ["Mac OS", 0.06]] as const),
    country: c.country,
    state: c.states.length ? pick(`${k}:st`, c.states) : "",
    zip: charged ? c.zip : "",
    transactionId: charged ? `${hex(`${k}:tx`, 8)}-${hex(`${k}:tx2`, 4)}-${hex(`${k}:tx3`, 4)}-${hex(`${k}:tx4`, 4)}-${hex(`${k}:tx5`, 12)}` : "",
    receiptNumber: charged && reached ? `${format(when, "yyMMdd")}-${String(Math.floor(rand(`${k}:rc`) * 900000) + 100000)}` : "",
    status,
    subscriptionId: subId,
    billingCycle,
    paymentInCycle: type === "subscription" ? 1 + Math.floor(rand(`${k}:cyc`) * 6) : null,
    softCurrency,
    coupon,
    parentOrderId: null,
    upsellOrderIds: [],
    products,
    discount: 0,
    taxRate: charged ? c.tax : 0,
    test: sandbox || rand(`${k}:mock`) < 0.004,
    history: historyFor(k, when, status, type, soft),
  };
}

/** A post-purchase upsell after `parent` in the same checkout session: its own order, receipt and tax (PPU 20–21). */
function makeUpsell(parent: Order): Order {
  const k = `${parent.id}:up`;
  const o = pick(`${k}:o`, UPSELL_OFFERS);
  const when = addMinutes(parent.date, 1);
  const status = weighted(`${k}:s`, [[EOrderStatusType.SUCCEEDED, 0.94], [EOrderStatusType.REFUNDED, 0.03], [EOrderStatusType.FAILED, 0.03]] as const);
  return {
    ...parent,
    id: hex(`${k}:id`, 24),
    date: when,
    offerName: o.name,
    offerExternalId: externalId(o.name),
    offerType: "Upsell",
    price: money(o.price / parent.usdRate),
    status,
    transactionId: `${hex(`${k}:tx`, 8)}-${hex(`${k}:tx2`, 4)}-${hex(`${k}:tx3`, 4)}-${hex(`${k}:tx4`, 4)}-${hex(`${k}:tx5`, 12)}`,
    receiptNumber: status === EOrderStatusType.FAILED ? "" : `${format(when, "yyMMdd")}-${String(Math.floor(rand(`${k}:rc`) * 900000) + 100000)}`,
    coupon: null,
    parentOrderId: parent.id,
    upsellOrderIds: [],
    products: [{ name: o.item, externalId: externalId(o.item), quantity: o.qty }],
    history: historyFor(k, when, status, "paid", false),
  };
}

const eligibleForUpsell = (o: Order) =>
  o.type === "paid" &&
  !o.softCurrency &&
  o.module !== "payment-links" &&
  (o.country === "United States" || o.country === "Canada") &&
  UPSELL_METHODS.has(o.paymentMethod) &&
  o.status === EOrderStatusType.SUCCEEDED;

/* ───────── queries ───────── */

/** The longest range the list fetches (today's grid caps the date range at 180 days). */
export const MAX_DAYS = 180;
export type DatePreset = "1d" | "7d" | "30d" | "90d" | "180d";
export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "1d", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "180d", label: "Last 180 days" },
];
export const presetDays = (p: string) => Number.parseInt(p, 10) || 30;

const cache = new Map<string, Order[]>();

/** Every order of the given projects in the last `days` days, newest first (memoized; refunds applied). */
export function ordersFor(projects: ScopeProject[], days: number, sandbox = false): Order[] {
  const key = `${projects.map((p) => `${p.id}:${p.modules.join(",")}`).join("|")}:${days}:${sandbox}`;
  let base = cache.get(key);
  if (!base) {
    const out: Order[] = [];
    const today = startOfDay(new Date());
    for (const date of eachDayOfInterval({ start: subDays(today, days - 1), end: today })) {
      if (differenceInCalendarDays(date, today) > 0) continue;
      for (const p of projects) {
        for (const m of p.modules) {
          const n = sandbox ? Math.max(1, Math.round(dailyCount(p, m, date) / 6)) : dailyCount(p, m, date);
          for (let i = 0; i < n; i++) {
            const o = makeOrder(p, m, date, i, sandbox);
            out.push(o);
            if (eligibleForUpsell(o) && rand(`${o.id}:hasUp`) < 0.12) {
              const up = makeUpsell(o);
              o.upsellOrderIds = [up.id];
              out.push(up);
            }
          }
        }
      }
    }
    const now = Date.now();
    base = out.filter((o) => o.date.getTime() <= now).sort((a, b) => b.date.getTime() - a.date.getTime());
    cache.set(key, base);
  }
  return base.map(withRefund);
}

/* ───────── refunds made in the prototype (in memory) ───────── */

const refunds = new Map<string, Date>();
const listeners = new Set<() => void>();
let version = 0;

function withRefund(o: Order): Order {
  const at = refunds.get(o.id);
  if (!at) return o;
  return { ...o, status: EOrderStatusType.REFUNDED, history: [...o.history, { status: EOrderStatusType.REFUNDED, event: "Refund requested from the dashboard", date: at }] };
}

export const canRefund = (o: Order) => o.type !== "free" && !o.softCurrency && REFUNDABLE.has(o.status) && !o.test;

export function refundOrder(id: string) {
  refunds.set(id, new Date());
  version++;
  listeners.forEach((l) => l());
}

/** Re-renders when a refund is made, so the list and the order page pick it up. */
export function useOrdersVersion() {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
    () => 0,
  );
}

/* ───────── formatting ───────── */

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", CAD: "CA$", EUR: "€", GBP: "£", BRL: "R$", ILS: "₪" };

/** A price in its own currency ("Free" for free orders; "1,200 Gems" for soft currency). */
export function formatPrice(o: Order, amount = o.price): string {
  if (o.type === "free") return "Free";
  if (o.softCurrency) return `${Math.round(amount).toLocaleString("en-US")} ${o.softCurrency.name}`;
  const sym = CURRENCY_SYMBOL[o.currency];
  const n = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return sym ? `${sym}${n}` : `${n} ${o.currency}`;
}
export const formatUsd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Payment details (Orders: Overview): what was collected and what's left after tax, exchange and fees. */
export function paymentDetails(o: Order) {
  const subtotal = o.price;
  const collected = money(subtotal - o.discount);
  const tax = money(collected - collected / (1 + o.taxRate));
  const exchange = o.currency === "USD" ? 0 : money(collected * 0.01);
  const fee = money(collected * 0.05);
  const net = money(collected - tax - exchange - fee);
  return { subtotal, discount: o.discount, collected, tax, exchange, fee, net };
}
