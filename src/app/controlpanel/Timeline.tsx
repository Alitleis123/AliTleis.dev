"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clock, day, plural, stamp, type Range, type Visitor } from "./model";

/**
 * The range as a comp's layers. Each recent visitor is one layer with a
 * keyframe at every visit. The playhead sits at now, on the right edge, the
 * way a live recording grows.
 */

const ROW_H = 40;

/** Ruler steps, chosen per range so the labels never crowd. */
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
function ticks(r: Range) {
  const step = r.ms <= DAY ? 3 * HOUR : r.ms <= 7 * DAY ? DAY : r.ms <= 30 * DAY ? 5 * DAY : 15 * DAY;
  const first = new Date(r.start);
  if (step < DAY) first.setMinutes(0, 0, 0);
  else first.setHours(0, 0, 0, 0);
  const out: number[] = [];
  for (let t = first.getTime(); t <= r.end; t += step) {
    // Stepping by a fixed length drifts an hour across a DST change, so each
    // day tick is snapped back to its midnight.
    const d = new Date(t);
    if (step >= DAY) d.setHours(0, 0, 0, 0);
    if (d.getTime() >= r.start) out.push(d.getTime());
  }
  return { list: out, label: (t: number) => (step < DAY ? clock(t).replace(":00", "") : day(t)) };
}

export default function Timeline({
  people,
  range,
  selected,
  onSelect,
  tracks,
}: {
  /** Visitors active in the range, most recent first. */
  people: Visitor[];
  range: Range;
  selected: string | null;
  onSelect: (key: string) => void;
  tracks: number;
}) {
  const laneRef = useRef<HTMLDivElement>(null);
  const shown = people.slice(0, tracks);
  const at = (t: number) => Math.min(100, Math.max(0, ((t - range.start) / range.ms) * 100));
  // A keyframe's center, held 7px inside each edge so the whole diamond
  // stays in the lane, at the range's start and at now.
  const key = (t: number) => `clamp(7px, ${at(t)}%, calc(100% - 7px))`;
  const rule = useMemo(() => ticks(range), [range]);

  // Labels need about 60px each, so a phone shows every other day or fewer.
  const [laneW, setLaneW] = useState(0);
  useEffect(() => {
    const el = laneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLaneW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const every = laneW ? Math.max(1, Math.ceil((rule.list.length * 60) / laneW)) : rule.list.length;
  // Clear of the NOW flag in the corner.
  const labelled = (t: number, i: number) => i % every === 0 && laneW > 0 && (at(t) / 100) * laneW < laneW - 48;

  return (
    <div className="flex min-w-0 select-none bg-[var(--st-panel)]">
      {/* Layer names, the column every comp keeps at the left. */}
      <div className="w-[128px] shrink-0 border-r border-[var(--st-line)] sm:w-[168px]">
        <div className="h-[26px] border-b border-[var(--st-line)] bg-[var(--st-panel-hi)]" />
        {shown.map((v) => {
          const visits = v.sessions.filter((s) => s.end >= range.start);
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => onSelect(v.key)}
              style={{ height: ROW_H }}
              className={`flex w-full items-center border-b border-[var(--st-line)] px-3 text-left transition-colors ${
                selected === v.key ? "bg-[var(--st-sel)]" : "hover:bg-[var(--st-hover)]"
              }`}
            >
              <span className="min-w-0">
                <span className={`block truncate text-[12.5px] ${v.known ? "text-[var(--st-text)]" : "text-[var(--st-dim)]"}`}>
                  {v.name}
                </span>
                <span className="block truncate text-[11px] text-[var(--st-faint)]">
                  {visits.length ? plural(visits.length, "visit") : "asked only"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div ref={laneRef} className="relative min-w-0 flex-1">
        {/* Ruler. */}
        <div className="relative h-[26px] overflow-hidden border-b border-[var(--st-line)] bg-[var(--st-panel-hi)]">
          {rule.list.map((t, i) => (
            <span key={t} className="absolute top-0 flex h-full items-center" style={{ left: `${at(t)}%` }}>
              <span className="absolute bottom-0 left-0 h-[6px] w-px bg-[var(--st-line-strong)]" />
              {labelled(t, i) && <span className="st-tc pl-1.5 text-[var(--st-faint)]">{rule.label(t)}</span>}
            </span>
          ))}
        </div>

        {/* Faint gridlines down through the layers, from each tick. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[26px]">
          {rule.list.map((t) => (
            <span key={t} className="absolute inset-y-0 w-px bg-white/[0.04]" style={{ left: `${at(t)}%` }} />
          ))}
        </div>

        {shown.map((v) => {
          const visits = v.sessions.filter((s) => s.end >= range.start);
          return (
            <div
              key={v.key}
              style={{ height: ROW_H }}
              className={`relative border-b border-[var(--st-line)] ${selected === v.key ? "bg-[var(--st-sel)]" : ""}`}
            >
              {visits.map((s) => (
                <button
                  key={s.start}
                  type="button"
                  title={`${stamp(s.start)} · ${plural(s.views.length, "page")}`}
                  aria-label={`${v.name}, ${plural(s.views.length, "page")} on ${stamp(s.start)}`}
                  onClick={() => onSelect(v.key)}
                  className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1px] bg-[var(--st-accent)] transition-transform hover:scale-125"
                  style={{ left: key(s.start) }}
                />
              ))}
            </div>
          );
        })}

        {/* Now. */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-[var(--st-accent)]" />
        <span
          aria-hidden
          className="st-tc pointer-events-none absolute right-[3px] top-[6px] rounded-[2px] bg-[var(--st-accent)] px-1 text-[9px] leading-[14px] text-[#2a1a02]"
        >
          NOW
        </span>

        {!people.length && (
          <p className="px-3 py-3 text-[12px] text-[var(--st-faint)]">Nobody visited in this range.</p>
        )}
      </div>
    </div>
  );
}
