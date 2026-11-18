"use client";

/* Orders for a project or a folder (docs/orders-flow.md). The list, or — with ?order=<id> — that order's page.
 * The URL keeps everything else (env, folder, client), so Back returns to the same list with its filters. */

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/newgen-system-design";
import { OrdersList, listOrderFor } from "@/components/orders/orders-list";
import { OrderDetails } from "@/components/orders/order-details";
import { useSetup } from "@/components/dashboard/setup-checklist";
import { MAX_DAYS, ordersFor, useOrdersVersion, type Order, type ScopeProject } from "@/lib/orders";
import type { Environment, Project } from "@/lib/newgen";

export type OrdersView = {
  /** One list state per view (a project, or a folder of a client). */
  key: string;
  folder: boolean;
  projects: ScopeProject[];
  /** Project view: the environment selector is on a sandbox, so every order is a test order. */
  sandbox: boolean;
};

export function OrdersBody({ view }: { view: OrdersView }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const orderId = params.get("order");
  const version = useOrdersVersion();

  const orders = React.useCallback(
    (days: number, sandbox: boolean) => ordersFor(view.projects, days, sandbox),
    // A refund (version) re-reads the orders with it applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view.projects, version],
  );

  const go = React.useCallback(
    (id: string | null) => {
      const p = new URLSearchParams(params.toString());
      if (id) p.set("order", id);
      else p.delete("order");
      const q = p.toString();
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
      document.getElementById("main-content")?.closest(".overflow-auto")?.scrollTo({ top: 0 });
    },
    [params, pathname, router],
  );
  const open = React.useCallback((o: Order) => go(o.id), [go]);

  if (!orderId) return <OrdersList view={view} orders={orders} onOpen={open} />;

  // The order page: look it up across the longest range in the list's environment (folder view: either).
  const pools = view.folder ? [false, true] : [view.sandbox];
  const pool = pools.flatMap((s) => orders(MAX_DAYS, s));
  const order = pool.find((o) => o.id === orderId);
  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description={`No order ${orderId} in the last ${MAX_DAYS} days here. It may belong to another project or environment.`}
        buttonText="Back to orders"
        onClick={() => go(null)}
      />
    );
  }
  const related = order.parentOrderId
    ? pool.filter((o) => o.id === order.parentOrderId)
    : pool.filter((o) => order.upsellOrderIds.includes(o.id));
  // Previous / next follow the list as it was last shown (its filters); otherwise every order, newest first.
  const ids = listOrderFor(view.key) ?? pool.map((o) => o.id);
  const i = ids.indexOf(order.id);

  return (
    <OrderDetails
      key={order.id}
      order={order}
      related={related}
      folder={view.folder}
      onBack={() => go(null)}
      onOpen={(id) => go(id)}
      prevId={i > 0 ? ids[i - 1] : undefined}
      nextId={i >= 0 && i < ids.length - 1 ? ids[i + 1] : undefined}
    />
  );
}

/** A project's Orders: its modules as set up now; a sandbox environment shows test orders (MM Story 3). */
export function ProjectOrdersBody({ project, env }: { project: Project; env: Environment }) {
  const { modules } = useSetup(project);
  const key = modules.join(",");
  const projects = React.useMemo(() => [{ id: project.id, name: project.project, modules: key ? (key.split(",") as ScopeProject["modules"]) : [] }], [project.id, project.project, key]);
  return <OrdersBody view={{ key: `project:${project.id}:${env.id}`, folder: false, projects, sandbox: env.kind === "sandbox" }} />;
}
