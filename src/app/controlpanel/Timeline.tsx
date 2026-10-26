"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buckets, clock, day, plural, type Range, type Visitor } from "./model";

/**
 * The range as a sequence. Each recent visitor gets a video track, each of
 * their sessions is a clip on it, and A1 is the whole site's traffic drawn as
 * a waveform. The playhead sits at now, on the right edge, the way a live
 * recording grows.
 *
 * Hovering or dragging across it reads out the moment under the pointer and
 * how many views landed there.
 */

const TRACK_H = 30;
const AUDIO_H = 44;

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
  everyone,
  range,
  selected,
  onSelect,
  tracks,
}: {
  /** Visitors active in the range, most recent first. */
  people: Visitor[];
  /** Everyone, for the traffic lane. */
  everyone: Map<string, Visitor>;
  range: Range;
  selected: string | null;
  onSelect: (key: string) => void;
  tracks: number;
}) {
  const laneRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const shown = people.slice(0, tracks);
  const pct = (t: number) => `${Math.min(100, Math.max(0, ((t - range.start) / range.ms) * 100))}%`;

  const BARS = 96;
  const traffic = useMemo(() => buckets(everyone, range, BARS), [everyone, range]);
  const peak = Math.max(1, ...traffic);
  const rule = useMemo(() => ticks(range), [range]);

  // Labels need about 54px each, so a phone shows every other day or fewer.
  // The tick marks stay, only the text thins out.
  const [laneW, setLaneW] = useState(0);
  useEffect(() => {
    const el = laneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLaneW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const every = laneW ? Math.max(1, Math.ceil((rule.list.length * 54) / laneW)) : rule.list.length;
  // Clear of the NOW flag in the corner.
  const labelled = (t: number, i: number) =>
    i % every === 0 && laneW > 0 && ((t - range.start) / range.ms) * laneW < laneW - 44;

  // A session that just happened starts at the right edge, under the NOW
  // line. Pulled in far enough to stay visible beside it.
  const clipLeft = (t: number) => `min(${pct(t)}, calc(100% - 7px))`;

  const at = (clientX: number) => {
    const r = laneRef.current?.getBoundingClientRect();
    if (!r || r.width <= 0) return null;
    return range.start + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * range.ms;
  };
  const hoverBar = hover == null ? null : Math.min(BARS - 1, Math.floor(((hover - range.start) / range.ms) * BARS));

  return (
    <div className="flex min-w-0 select-none flex-col bg-[var(--st-panel)]">
      <div className="flex">
        {/* Track headers, the column every NLE keeps at the left. */}
        <div className="w-[104px] shrink-0 border-r border-[var(--st-line)] bg-[var(--st-panel-hi)] sm:w-[132px]">
          <div className="flex h-[24px] items-center border-b border-[var(--st-line)] px-2">
            <span className="st-tc text-[10px] text-[var(--st-faint)]">{range.label}</span>
          </div>
          {shown.map((v, i) => (
            <button
              key={v.key}
              type="button"
              onClick={() => onSelect(v.key)}
              style={{ height: TRACK_H }}
              className={`flex w-full items-center gap-1.5 border-b border-[var(--st-line)] px-2 text-left transition-colors ${
                selected === v.key ? "bg-[var(--st-sel)]" : "hover:bg-[var(--st-hover)]"
              }`}
            >
              <span className="st-tc shrink-0 text-[10px] text-[var(--st-faint)]">V{shown.length - i}</span>
              <span
                className={`truncate text-[11.5px] ${v.known ? "text-[var(--st-text)]" : "text-[var(--st-dim)]"}`}
              >
                {v.name}
              </span>
            </button>
          ))}
          <div style={{ height: AUDIO_H }} className="flex items-center gap-1.5 px-2">
            <span className="st-tc text-[10px] text-[var(--st-faint)]">A1</span>
            <span className="truncate text-[11.5px] text-[var(--st-dim)]">Traffic</span>
          </div>
        </div>

        <div
          ref={laneRef}
          className="relative min-w-0 flex-1 touch-pan-y"
          onPointerMove={(e) => setHover(at(e.clientX))}
          onPointerDown={(e) => setHover(at(e.clientX))}
          onPointerLeave={() => setHover(null)}
        >
          {/* Ruler. */}
          <div className="relative h-[24px] overflow-hidden border-b border-[var(--st-line)] bg-[var(--st-panel-hi)]">
            {rule.list.map((t, i) => (
              <span key={t} className="absolute top-0 flex h-full items-end pb-[3px]" style={{ left: pct(t) }}>
                <span className="absolute bottom-0 left-0 h-[6px] w-px bg-[var(--st-line-strong)]" />
                {labelled(t, i) && <span className="st-tc pl-1 text-[var(--st-faint)]">{rule.label(t)}</span>}
              </span>
            ))}
          </div>

          {/* Faint gridlines down through the tracks, from each tick. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[24px]">
            {rule.list.map((t) => (
              <span key={t} className="absolute inset-y-0 w-px bg-white/[0.035]" style={{ left: pct(t) }} />
            ))}
          </div>

          {/* Video tracks. */}
          {shown.map((v) => (
            <div key={v.key} style={{ height: TRACK_H }} className="relative border-b border-[var(--st-line)]">
              {v.sessions
                .filter((s) => s.end >= range.start)
                .map((s) => {
                  const on = selected === v.key;
                  return (
                    <button
                      key={s.start}
                      type="button"
                      aria-label={`${v.name}, ${plural(s.views.length, "view")} at ${clock(s.start)}`}
                      onClick={() => onSelect(v.key)}
                      className="absolute top-[4px] flex items-center overflow-hidden rounded-[2px] border px-1 transition-[filter] hover:brightness-125"
                      style={{
                        left: clipLeft(s.start),
                        width: `max(4px, calc(${pct(s.end)} - ${pct(s.start)}))`,
                        height: TRACK_H - 8,
                        background: on ? "var(--st-accent)" : v.known ? "var(--st-clip-on)" : "var(--st-clip)",
                        borderColor: on ? "transparent" : v.known ? "var(--st-sel-line)" : "var(--st-line-strong)",
                      }}
                    >
                      <span
                        className={`truncate text-[10px] leading-none ${on ? "text-[#2a1a02]" : "text-[var(--st-dim)]"}`}
                      >
                        {s.views.length > 1 ? `${s.views.length} views` : s.views[0].path}
                      </span>
                    </button>
                  );
                })}
            </div>
          ))}

          {/* A1, the traffic waveform, mirrored like an audio clip. */}
          <div style={{ height: AUDIO_H }} className="relative flex items-center bg-[rgba(186,196,104,0.05)]">
            {traffic.map((n, i) => (
              <span
                key={i}
                className="flex h-full flex-1 items-center justify-center"
                style={{ opacity: hoverBar === i ? 1 : 0.85 }}
              >
                <span
                  className="w-[60%] max-w-[6px] rounded-[1px]"
                  style={{
                    height: n ? `${Math.max(8, (n / peak) * 86)}%` : "2px",
                    background: n ? "var(--st-audio)" : "var(--st-audio-dim)",
                  }}
                />
              </span>
            ))}
          </div>

          {/* Now. */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-[var(--st-accent)]" />
          <span
            aria-hidden
            className="st-tc pointer-events-none absolute right-[3px] top-[5px] rounded-[2px] bg-[var(--st-accent)] px-1 text-[9px] leading-[14px] text-[#2a1a02]"
          >
            NOW
          </span>

          {/* The scrub readout. */}
          {hover != null && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-px bg-white/60"
                style={{ left: pct(hover) }}
              />
              <span
                className="st-tc pointer-events-none absolute bottom-[6px] z-10 -translate-x-1/2 whitespace-nowrap rounded-[2px] border border-[var(--st-line-strong)] bg-[var(--st-chrome)] px-1.5 py-0.5 text-[10px] text-[var(--st-text)]"
                style={{ left: `clamp(48px, ${pct(hover)}, calc(100% - 48px))` }}
              >
                {range.ms <= DAY ? clock(hover) : `${day(hover)} ${clock(hover)}`} ·{" "}
                {plural(hoverBar == null ? 0 : traffic[hoverBar], "view")}
              </span>
            </>
          )}
        </div>
      </div>

      {people.length > shown.length && (
        <p className="st-tc border-t border-[var(--st-line)] px-3 py-1.5 text-[10px] text-[var(--st-faint)]">
          {plural(people.length - shown.length, "more visitor")} in Visitors
        </p>
      )}
      {!people.length && (
        <p className="st-tc border-t border-[var(--st-line)] px-3 py-1.5 text-[10px] text-[var(--st-faint)]">
          No sessions in this range.
        </p>
      )}
    </div>
  );
}

