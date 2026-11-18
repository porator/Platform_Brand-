"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/**
 * Pixel Measurement Mode — a Figma-style inspection tool inside the prototype (a design/QA aid, not product UI).
 *
 * Available only in local development, or on any build when the URL has `?measure=1` (remembered for the tab), so
 * usability participants never see it. A floating ruler button or Shift + M toggles it.
 *
 * While active: hover outlines the element under the cursor with its W × H; click locks it as the reference; hovering
 * another element draws red guides with the edge gaps (or the insets when one sits inside the other), the
 * centre-to-centre horizontal / vertical distances and the diagonal. Esc clears the measurement; Shift + M (or the
 * button) turns it off.
 *
 * How it stays out of the way: everything draws in its own fixed overlay (pointer-events: none), portalled to <body>;
 * the dashboard's DOM and CSS are never touched; pointer, click and drag events are swallowed in the capture phase
 * only while the tool is on, so nothing underneath activates; when off, no listeners are attached. Positions come from
 * getBoundingClientRect(), i.e. rendered CSS pixels after transforms and zoom.
 */

const STORAGE_KEY = "measure-tool";
const BLUE = "#0D99FF";
const RED = "#F24822";
type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };

const toBox = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
};
const px = (n: number) => `${Math.round(n * 10) / 10}`.replace(/\.0$/, "");
const isOwn = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-measure-ui]");
const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/** Is the tool allowed here? Local development, or `?measure=1` (kept for the tab so in-app navigation keeps it). */
function useAllowed() {
  return React.useSyncExternalStore(
    () => () => {},
    () => {
      try {
        if (new URLSearchParams(window.location.search).get("measure") === "1") sessionStorage.setItem(STORAGE_KEY, "1");
        return process.env.NODE_ENV === "development" || sessionStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        return process.env.NODE_ENV === "development";
      }
    },
    () => false,
  );
}

export function MeasureTool() {
  const allowed = useAllowed();
  const [active, setActive] = React.useState(false);
  const [hover, setHover] = React.useState<Element | null>(null);
  const [ref, setRef] = React.useState<Element | null>(null);
  const [, setTick] = React.useState(0); // re-measure on scroll / resize

  // Shift + M toggles (never while typing in a field); Esc clears the measurement.
  React.useEffect(() => {
    if (!allowed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "m" && !isTyping(e.target)) {
        e.preventDefault();
        setActive((v) => !v);
        setRef(null);
        setHover(null);
      } else if (e.key === "Escape" && active) {
        e.preventDefault();
        e.stopPropagation();
        setRef(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [allowed, active]);

  // While active: track the element under the cursor and swallow interactions in the capture phase.
  React.useEffect(() => {
    if (!active) return;
    const pick = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      return el && !isOwn(el) ? el : null;
    };
    const onMove = (e: PointerEvent) => {
      if (isOwn(e.target)) return setHover(null);
      setHover(pick(e.clientX, e.clientY));
    };
    const block = (e: Event) => {
      if (isOwn(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    const onClick = (e: MouseEvent) => {
      if (isOwn(e.target)) return;
      block(e);
      const el = pick(e.clientX, e.clientY);
      if (el) setRef(el);
    };
    const onLeave = () => setHover(null);
    const onFrame = () => setTick((t) => t + 1);
    const blocked = ["pointerdown", "pointerup", "mousedown", "mouseup", "dblclick", "auxclick", "contextmenu", "dragstart", "touchstart", "submit"];
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("click", onClick, true);
    blocked.forEach((t) => window.addEventListener(t, block, { capture: true, passive: false }));
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onFrame, true);
    window.addEventListener("resize", onFrame);
    // Crosshair everywhere while measuring (on the overlay root, not the page's own elements).
    const style = document.createElement("style");
    style.setAttribute("data-measure-ui", "");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);
    return () => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("click", onClick, true);
      blocked.forEach((t) => window.removeEventListener(t, block, { capture: true }));
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onFrame, true);
      window.removeEventListener("resize", onFrame);
      style.remove();
    };
  }, [active]);

  if (!allowed) return null;

  const toggle = () => {
    setActive((v) => !v);
    setRef(null);
    setHover(null);
  };

  const a = ref && ref.isConnected ? toBox(ref) : null;
  const b = hover && hover !== ref && hover.isConnected ? toBox(hover) : null;
  const hoverOnly = !a && hover && hover.isConnected ? toBox(hover) : null;

  return createPortal(
    <div data-measure-ui="" aria-hidden={!active}>
      {/* The floating ruler button (bottom-right). */}
      <button
        type="button"
        data-measure-ui=""
        onClick={toggle}
        title="Measurement (⇧M)"
        aria-label={active ? "Exit measurement mode" : "Measurement mode"}
        aria-pressed={active}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 2147483647,
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? "#E5F2FF" : "#FFFFFF",
          color: active ? BLUE : "#3F3F46",
          boxShadow: active ? `0 0 0 1.5px ${BLUE}, 0 4px 12px rgb(0 0 0 / 0.12)` : "0 0 0 1px rgb(0 0 0 / 0.08), 0 4px 12px rgb(0 0 0 / 0.12)",
          cursor: "pointer",
        }}
      >
        {/* Lucide "ruler" */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
          <path d="m14.5 12.5 2-2" />
          <path d="m11.5 9.5 2-2" />
          <path d="m8.5 6.5 2-2" />
          <path d="m17.5 15.5 2-2" />
        </svg>
      </button>

      {active ? (
        <div data-measure-ui="" style={{ position: "fixed", inset: 0, zIndex: 2147483646, pointerEvents: "none" }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {hoverOnly ? <Outline box={hoverOnly} /> : null}
            {a ? <Outline box={a} strong /> : null}
            {a && b ? (
              <>
                <Outline box={b} />
                <Guides a={a} b={b} />
              </>
            ) : null}
          </svg>
          {hoverOnly ? <SizeLabel box={hoverOnly} /> : null}
          {a ? <SizeLabel box={a} /> : null}
          {a && b ? <GuideLabels a={a} b={b} /> : null}
          {/* A hint while nothing is locked yet. */}
          {!a ? (
            <div style={{ ...hintStyle }}>Measurement · click an element to start · Esc clears · ⇧M exits</div>
          ) : (
            <div style={{ ...hintStyle }}>Hover another element to measure · click to pick a new reference · Esc clears</div>
          )}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}

const hintStyle: React.CSSProperties = {
  position: "fixed",
  right: 60,
  bottom: 22,
  font: "500 11px/16px system-ui, -apple-system, sans-serif",
  color: "#fff",
  background: "rgb(24 24 27 / 0.9)",
  padding: "4px 8px",
  borderRadius: 6,
  whiteSpace: "nowrap",
};

function Outline({ box, strong }: { box: Box; strong?: boolean }) {
  return (
    <rect
      x={box.left + 0.5}
      y={box.top + 0.5}
      width={Math.max(0, box.width - 1)}
      height={Math.max(0, box.height - 1)}
      fill={strong ? "rgb(13 153 255 / 0.06)" : "none"}
      stroke={BLUE}
      strokeWidth={strong ? 1.5 : 1}
    />
  );
}

function Label({ x, y, text, color = RED }: { x: number; y: number; text: string; color?: string }) {
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        font: "600 11px/14px system-ui, -apple-system, sans-serif",
        color: "#fff",
        background: color,
        padding: "1px 5px",
        borderRadius: 4,
        whiteSpace: "nowrap",
        boxShadow: "0 0 0 1px rgb(255 255 255 / 0.9)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {text}
    </div>
  );
}

/** W × H, centred under the element (above it when there's no room below). */
function SizeLabel({ box }: { box: Box }) {
  const below = box.bottom + 14 < window.innerHeight;
  return <Label x={box.left + box.width / 2} y={below ? box.bottom + 11 : box.top - 11} text={`${px(box.width)} × ${px(box.height)}`} color={BLUE} />;
}

type Seg = { x1: number; y1: number; x2: number; y2: number; value: number; dashed?: boolean };

/** The guides between reference A and hovered B: edge gaps (or insets when nested) and centre-to-centre distances. */
function measure(a: Box, b: Box): { edges: Seg[]; centres: Seg[]; diagonal: Seg | null } {
  const edges: Seg[] = [];
  const contains = (o: Box, i: Box) => i.left >= o.left && i.right <= o.right && i.top >= o.top && i.bottom <= o.bottom;
  const nested = contains(a, b) ? { o: a, i: b } : contains(b, a) ? { o: b, i: a } : null;
  if (nested) {
    // One inside the other: the four insets, like Figma.
    const { o, i } = nested;
    const cy = i.top + i.height / 2;
    const cx = i.left + i.width / 2;
    if (i.left - o.left > 0) edges.push({ x1: o.left, y1: cy, x2: i.left, y2: cy, value: i.left - o.left });
    if (o.right - i.right > 0) edges.push({ x1: i.right, y1: cy, x2: o.right, y2: cy, value: o.right - i.right });
    if (i.top - o.top > 0) edges.push({ x1: cx, y1: o.top, x2: cx, y2: i.top, value: i.top - o.top });
    if (o.bottom - i.bottom > 0) edges.push({ x1: cx, y1: i.bottom, x2: cx, y2: o.bottom, value: o.bottom - i.bottom });
  } else {
    // Side by side: the horizontal gap at the shared band (or B's middle), the vertical gap likewise.
    const yBand = Math.max(a.top, b.top) < Math.min(a.bottom, b.bottom) ? (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2 : b.top + b.height / 2;
    const xBand = Math.max(a.left, b.left) < Math.min(a.right, b.right) ? (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2 : b.left + b.width / 2;
    if (b.left >= a.right) edges.push({ x1: a.right, y1: yBand, x2: b.left, y2: yBand, value: b.left - a.right });
    else if (a.left >= b.right) edges.push({ x1: b.right, y1: yBand, x2: a.left, y2: yBand, value: a.left - b.right });
    if (b.top >= a.bottom) edges.push({ x1: xBand, y1: a.bottom, x2: xBand, y2: b.top, value: b.top - a.bottom });
    else if (a.top >= b.bottom) edges.push({ x1: xBand, y1: b.bottom, x2: xBand, y2: a.top, value: a.top - b.bottom });
  }
  // Centre to centre: an L of dashed legs (horizontal, then vertical) and the diagonal.
  const ax = a.left + a.width / 2, ay = a.top + a.height / 2, bx = b.left + b.width / 2, by = b.top + b.height / 2;
  const centres: Seg[] = [];
  if (Math.abs(bx - ax) >= 1) centres.push({ x1: ax, y1: ay, x2: bx, y2: ay, value: Math.abs(bx - ax), dashed: true });
  if (Math.abs(by - ay) >= 1) centres.push({ x1: bx, y1: ay, x2: bx, y2: by, value: Math.abs(by - ay), dashed: true });
  const d = Math.hypot(bx - ax, by - ay);
  const diagonal = Math.abs(bx - ax) >= 1 && Math.abs(by - ay) >= 1 ? { x1: ax, y1: ay, x2: bx, y2: by, value: d, dashed: true } : null;
  return { edges, centres, diagonal };
}

function Guides({ a, b }: { a: Box; b: Box }) {
  const { edges, centres, diagonal } = measure(a, b);
  const line = (s: Seg, i: number, opacity = 1) => (
    <g key={i} opacity={opacity}>
      <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={RED} strokeWidth={1} strokeDasharray={s.dashed ? "3 3" : undefined} />
      {!s.dashed ? (
        // End ticks on edge gaps.
        s.y1 === s.y2 ? (
          <>
            <line x1={s.x1} y1={s.y1 - 4} x2={s.x1} y2={s.y1 + 4} stroke={RED} />
            <line x1={s.x2} y1={s.y2 - 4} x2={s.x2} y2={s.y2 + 4} stroke={RED} />
          </>
        ) : (
          <>
            <line x1={s.x1 - 4} y1={s.y1} x2={s.x1 + 4} y2={s.y1} stroke={RED} />
            <line x1={s.x2 - 4} y1={s.y2} x2={s.x2 + 4} y2={s.y2} stroke={RED} />
          </>
        )
      ) : null}
    </g>
  );
  const ax = a.left + a.width / 2, ay = a.top + a.height / 2, bx = b.left + b.width / 2, by = b.top + b.height / 2;
  return (
    <>
      {diagonal ? line(diagonal, 100, 0.45) : null}
      {centres.map((s, i) => line(s, 200 + i, 0.6))}
      {edges.map((s, i) => line(s, i))}
      <circle cx={ax} cy={ay} r={2.5} fill={RED} />
      <circle cx={bx} cy={by} r={2.5} fill={RED} />
    </>
  );
}

function GuideLabels({ a, b }: { a: Box; b: Box }) {
  const { edges, centres, diagonal } = measure(a, b);
  const mid = (s: Seg) => ({ x: (s.x1 + s.x2) / 2, y: (s.y1 + s.y2) / 2 });
  return (
    <>
      {edges.map((s, i) => (
        <Label key={`e${i}`} {...mid(s)} text={`${px(s.value)} px`} />
      ))}
      {centres.map((s, i) => {
        const m = mid(s);
        // Centre legs: offset from the line so they don't sit on top of edge labels; muted.
        return <Label key={`c${i}`} x={m.x + (s.y1 === s.y2 ? 0 : 22)} y={m.y + (s.y1 === s.y2 ? -12 : 0)} text={`↔ ${px(s.value)}`.replace("↔", s.y1 === s.y2 ? "↔" : "↕")} color="#A1301A" />;
      })}
      {diagonal ? <Label {...mid(diagonal)} text={`⤡ ${px(diagonal.value)}`} color="#A1301A" /> : null}
    </>
  );
}
