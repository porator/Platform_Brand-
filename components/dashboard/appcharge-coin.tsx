"use client";

/**
 * The Appcharge mark (its stacked colour rings around the dark "a" disc, from the brand logo) as a 3D coin that flips
 * around its vertical axis now and then. Built from layered discs: a front face, a back face, and thin edge layers in
 * between that give it thickness as it turns. Holds still for people who prefer reduced motion.
 */
const RINGS: { x: number; y: number; s: number; fill: string }[] = [
  { x: 2.492, y: 0.621, s: 41.512, fill: "#A033E8" },
  { x: 0.414, y: 0, s: 41.512, fill: "#6CCD3F" },
  { x: 0.625, y: 2.906, s: 41.512, fill: "#FE7558" },
  { x: 0, y: 0.828, s: 41.512, fill: "#338DE8" },
  { x: 0.828, y: 1.867, s: 41.512, fill: "#F7CE46" },
  { x: 1.25, y: 1.453, s: 41.097, fill: "#5FE5D9" },
];
const A =
  "M21.443 31.4525C16.2136 31.4525 12.4531 27.445 12.4531 22.2381C12.4531 17.0312 16.2136 13.0615 21.443 13.0615C26.6724 13.0615 30.4328 17.0312 30.4328 22.2381C30.4328 22.3038 30.4328 22.3695 30.4312 22.4353V30.7147C30.4312 30.8462 30.3251 30.9513 30.1962 30.9513H26.1925C26.062 30.9513 25.9575 30.8445 25.9575 30.7147V22.1806C25.933 19.251 24.043 17.1807 21.4446 17.1807C18.8462 17.1807 16.9317 19.2789 16.9317 22.2381C16.9317 25.1973 18.8299 27.2955 21.4446 27.2955C22.3113 27.2955 23.0996 27.0687 23.7655 26.658C23.9222 26.561 24.1246 26.6711 24.1246 26.8568V30.8938C24.1246 31.0006 24.0544 31.0959 23.9516 31.1238C23.1649 31.3374 22.326 31.4508 21.4462 31.4508L21.443 31.4525Z";

function Face({ className = "size-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44.004 44.418" className={className} aria-hidden>
      {RINGS.map((r) => (
        <rect key={r.fill} x={r.x} y={r.y} width={r.s} height={r.s} rx={r.s / 2} fill={r.fill} />
      ))}
      <rect x="1.414" y="2.258" width="39.892" height="39.893" rx="19.946" fill="#272727" />
      <path d={A} fillRule="evenodd" clipRule="evenodd" fill="white" />
    </svg>
  );
}

export function AppchargeCoin({ size = 48, className }: { size?: number; className?: string }) {
  const depth = Math.max(1, size * 0.06); // half the coin's thickness, in px (scales with the coin)
  const edges = [-2, -1, 0, 1, 2];
  return (
    <span className={className} style={{ width: size, height: size, perspective: size * 8, display: "inline-block" }} role="img" aria-label="Appcharge">
      <span className="coin-flip relative block size-full">
        {/* The rim: dark discs stacked through the coin's thickness, seen edge-on mid-flip. */}
        {edges.map((z) => (
          <span key={z} className="absolute inset-[3%] rounded-full bg-[#3a2a55]" style={{ transform: `translateZ(${(z * depth) / 2.5}px)` }} />
        ))}
        <span className="absolute inset-0" style={{ transform: `translateZ(${depth}px)`, backfaceVisibility: "hidden" }}>
          <Face />
        </span>
        <span className="absolute inset-0" style={{ transform: `rotateY(180deg) translateZ(${depth}px)`, backfaceVisibility: "hidden" }}>
          <Face />
        </span>
      </span>
    </span>
  );
}

/** The same mark, flat and still: for small places like the assistant's replies. */
export function AppchargeMark({ className }: { className?: string }) {
  return <Face className={className} />;
}
