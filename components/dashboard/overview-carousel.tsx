"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * The project Overview's carousel (Figma 137:9684, node 137:10129): what Appcharge can do, between the AI prompt and the
 * go-live guide. The active slide sits in the middle (600 × 304); its neighbours peek in at both edges, scaled to 88%
 * (526 × 268) and faded into the page; dots underneath. Clicking a neighbour or a dot, or the arrow keys, moves it.
 */

type Slide = { id: string; title: string; description: string; image: string };

// Slide 1 is the design's; 2 and 3 use the modules' own descriptions (lib/newgen.ts, Add module).
const SLIDES: Slide[] = [
  {
    id: "api",
    title: "API for everything",
    description:
      "Every surface from offers to analytics, securely exposed via API.",
    image: "/overview/slide-api.jpg",
  },
  {
    id: "webstore",
    title: "A store of your own",
    description: "Your own webstore, with offers your players come back for.",
    image: "/overview/slide-webstore.jpg",
  },
  {
    id: "checkout",
    title: "Checkout anywhere",
    description: "Appcharge’s checkout inside your own web store.",
    image: "/overview/slide-checkout.jpg",
  },
];

/** Where a slide sits relative to the active one: -1 left, 0 centre, 1 right (wrapping round). */
const offsetOf = (i: number, active: number, n: number) => {
  const d = (((i - active) % n) + n) % n;
  return d === 0 ? 0 : d === 1 ? 1 : -1;
};

export function OverviewCarousel({ className }: { className?: string }) {
  const n = SLIDES.length;
  const [state, setState] = React.useState({ active: 0, prev: 0 });
  const go = (i: number) =>
    setState((s) => ({ prev: s.active, active: ((i % n) + n) % n }));

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What you can do with Appcharge"
      className={cn(
        "@container flex flex-col gap-[17px] outline-none",
        className,
      )}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(state.active + 1);
        else if (e.key === "ArrowLeft") go(state.active - 1);
      }}
    >
      {/* The active card is 600px wide (narrower when the page is), its neighbours 88% of it, 16px apart. */}
      <div
        className="relative w-full overflow-hidden [--w:min(600px,calc(100cqw-96px))]"
        style={{ height: "calc(var(--w) * 304 / 600)" }}
      >
        {SLIDES.map((s, i) => {
          const at = offsetOf(i, state.active, n);
          // A slide wrapping from one side to the other jumps instead of sliding across the middle.
          const jumps = Math.abs(at - offsetOf(i, state.prev, n)) > 1;
          const centre = at === 0;
          return (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${s.title}`}
              aria-hidden={!centre}
              onClick={centre ? undefined : () => go(i)}
              className={cn(
                "absolute top-0 left-1/2 aspect-[600/304] w-(--w) overflow-hidden rounded-[18px] bg-[#e9e9e9]",
                centre ? "z-[1]" : "cursor-pointer",
                !jumps &&
                  "transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
              )}
              style={{
                transform: `translateX(calc(-50% + ${at} * (var(--w) * 0.94 + 16px))) scale(${centre ? 1 : 0.88})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static slide art */}
              <img
                src={s.image}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              {/* Figma's Noise effect (monotone, 1.2px grain, 65% density, #1F1F1F at 17%) as a tile; a soft scrim keeps the
                  text legible. */}
              <div aria-hidden className="absolute inset-0 bg-[url(/overview/noise.png)] bg-size-[200px]" />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-[rgb(12_10_9/0.12)] to-transparent" />
              <div
                className={cn(
                  "absolute bottom-9 left-[30px] flex items-start gap-[18px] transition-opacity duration-300",
                  centre ? "opacity-100" : "opacity-0",
                )}
              >
                {/* The glass ring (Figma "Glass Effect"): a 10% white fill with Figma's Glass effect (6px blur, light from the
                    top-left at 70%, refraction approximated by a soft lens highlight), and a 3px light ring with an upward glow. */}
                <span
                  aria-hidden
                  className="relative size-[50px] shrink-0 overflow-hidden rounded-full bg-white/10 shadow-[0_-9.7px_19.5px_rgb(255_255_255/0.2)] backdrop-blur-[6px] backdrop-brightness-110 backdrop-saturate-150"
                >
                  <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_28%,rgb(255_255_255/0.28),rgb(255_255_255/0.06)_45%,transparent_70%)]" />
                  <span className="absolute inset-0 rounded-full shadow-[inset_1.5px_1.5px_1.5px_rgb(255_255_255/0.7),inset_-1px_-1px_1.5px_rgb(12_10_9/0.08)]" />
                  <span className="absolute inset-0 rounded-full border-3 border-[rgb(241_241_241/0.8)]" />
                </span>
                <div className="flex w-[306px] max-w-[calc(var(--w)-140px)] flex-col gap-1 pt-1.5 text-white">
                  <p className="text-base leading-tight font-semibold">
                    {s.title}
                  </p>
                  <p className="text-sm leading-5 text-white/85">
                    {s.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {/* The neighbours fade into the page at both edges. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[38px] bg-linear-to-r from-white to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[38px] bg-linear-to-l from-white to-transparent"
        />
      </div>

      <div className="flex items-center justify-center gap-2 p-2.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show slide ${i + 1}: ${s.title}`}
            aria-current={i === state.active}
            onClick={() => go(i)}
            className={cn(
              "size-2 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              i === state.active
                ? "bg-[#7A817D]"
                : "bg-[#D8D8D8] hover:bg-[#b8b8b8]",
            )}
          />
        ))}
      </div>
    </section>
  );
}
