"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/**
 * The page header row (shell.tsx), Shopify-style: the title on the left, a short grey description beside it, and the
 * page's actions on the right, all on one line. A page fills the description and actions from its own body with
 * <PageHeaderMeta> and <PageHeaderActions>, which render into the shell's header.
 *
 * The slots find the shell's elements by id and keep watching the DOM, so they follow the live element (on a full
 * reload the header can mount after the page body, or mount twice).
 */
export const PAGE_HEADER_META_ID = "page-header-meta";
export const PAGE_HEADER_ACTIONS_ID = "page-header-actions";

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.body, { childList: true, subtree: true });
  return () => mo.disconnect();
}

function useSlot(id: string) {
  // Read after mount (never during hydration, when the server value — no element — would stick), then follow the DOM.
  const [el, setEl] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    const read = () => setEl(document.getElementById(id));
    read();
    return subscribe(read);
  }, [id]);
  return el;
}

export function PageHeaderMeta({ children }: { children: React.ReactNode }) {
  const el = useSlot(PAGE_HEADER_META_ID);
  return el ? createPortal(children, el) : null;
}

export function PageHeaderActions({ children }: { children: React.ReactNode }) {
  const el = useSlot(PAGE_HEADER_ACTIONS_ID);
  return el ? createPortal(children, el) : null;
}
