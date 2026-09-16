"use client";

import { type ReactNode, type RefObject } from "react";
import { COMPS, compAt } from "./comps";

/**
 * The composition viewer.
 *
 * Draft quality while scrubbing is not a workaround dressed up as a feature.
 * Every NLE drops resolution during a drag and renders properly on release,
 * because compositing every intermediate frame is wasted work. Here the cost
 * being avoided is laying out and painting a full section on every pointer
 * move, so the same trick applies for the same reason.
 */
export default function Viewer({
  time,
  scrubbing,
  zoom,
  scrollRef,
  children,
}: {
  time: number;
  scrubbing: boolean;
  zoom: number;
  /** Owned by the studio, which resets it when the active comp changes. */
  scrollRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const active = compAt(time);
  const comp = COMPS[active];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--st-panel)]">
      {/* Panel header. Raised a step above the panel, so the seam reads without
          needing a brighter rule across it. */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2">
        <span
          aria-hidden
          className="h-3 w-[3px] shrink-0 rounded-full bg-[var(--st-accent)]"
        />
        <span
          key={comp.id}
          className="st-reveal text-[12.5px] font-medium tracking-[-0.01em] text-[var(--st-text)]"
        >
          {comp.name}
        </span>
        <span className="st-label hidden sm:block">{comp.kind}</span>
        <span className="st-tc ml-auto text-[var(--st-faint)]">{zoom}%</span>
      </div>

      {/* Stage */}
      <div className="st-grain relative min-h-0 flex-1 overflow-hidden bg-[var(--st-stage)]">
        {/* Layer host. Each comp is absolutely positioned inside this and
            scrolls itself, so two of them can occupy the frame at once while
            one dissolves into the other. */}
        <div
          ref={scrollRef}
          className="absolute inset-0"
          style={{
            filter: scrubbing ? "blur(3px) saturate(0.55)" : "none",
            opacity: scrubbing ? 0.5 : 1,
            transition: scrubbing
              ? "none"
              : "filter 260ms ease, opacity 260ms ease",
            pointerEvents: scrubbing ? "none" : "auto",
          }}
        >
          {children}
        </div>

        {/* Draft badge, only while the drag is live. */}
        {scrubbing ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="st-label rounded border border-[var(--st-accent-dim)] bg-[var(--st-panel)] px-2 py-1 text-[var(--st-accent)]">
              Draft
            </span>
            <span className="text-[26px] font-light tracking-[-0.02em] text-white/90">
              {comp.name}
            </span>
            <span className="st-tc text-[var(--st-dim)]">
              {String(active + 1).padStart(2, "0")} / {String(COMPS.length).padStart(2, "0")}
            </span>
          </div>
        ) : null}

        {/* Corner ticks rather than full safe-area rectangles. Two dashed
            boxes drawn over every comp added four long lines that crossed the
            content and read as a stray table border, which cost more than the
            reference they bought. Ticks say the same thing at the corners and
            leave the frame alone. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[6]">
          {[
            "left-3 top-3 border-l border-t",
            "right-3 top-3 border-r border-t",
            "left-3 bottom-3 border-b border-l",
            "right-3 bottom-3 border-b border-r",
          ].map((pos) => (
            <span
              key={pos}
              className={`absolute h-3.5 w-3.5 border-white/15 ${pos}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
