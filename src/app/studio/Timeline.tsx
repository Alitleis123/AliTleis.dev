"use client";

import { useCallback, useEffect, useRef } from "react";
import { AUDIO_LABEL, COMPS, STARTS, TOTAL, compAt, timecode } from "./comps";
import { BARS } from "./waveform";

/**
 * The timeline, and the only navigation on this route.
 *
 * Clips sit end to end on one video track rather than each getting a row of
 * their own. The row-per-clip version read as a Gantt chart, because a
 * staircase of bars is what project software draws and not what a sequence
 * looks like. An editor butts clips together on V1 and reads position as time.
 *
 * If the page also carried a normal nav bar then this would be a decoration,
 * so it does not.
 */

/**
 * Height of the video track, and so of the filmstrip inside it.
 *
 * 52px made the thumbnails a texture you had to lean in for. The timeline is
 * the only navigation on this route, so it earns the height: at 72 the frames
 * are actually legible and the clip you are about to open is recognisable
 * before you click it.
 */
/**
 * Track heights.
 *
 * V1 is tall because it carries the filmstrips, which are the one place the
 * generated artwork is legible at a glance, and a clip you cannot read the
 * picture on is just a coloured bar. The phone keeps its own, shorter value:
 * there the stage has no spare height to give, and the compact track is one
 * row rather than two.
 */
const V_TRACK = 96;
const A_TRACK = 44;
const V_TRACK_SM = 78;

/**
 * One bar per ~6px of a 1440px track, which is dense enough to read as audio.
 *
 * Heights are rounded to two decimals rather than left as raw ratios. An
 * unrounded ratio serializes into the server HTML at full precision and comes
 * back shorter once the browser has parsed and re-serialized the inline style,
 * which React reports as a hydration mismatch on every single load.
 */
export default function Timeline({
  time,
  playing,
  scrubbing,
  hint,
  onSeek,
  onScrubStart,
  onScrubEnd,
}: {
  time: number;
  playing: boolean;
  scrubbing: boolean;
  /** Shown until the visitor takes control, then it retires. */
  hint: boolean;
  onSeek: (t: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const timeFromEl = useCallback(
    (el: HTMLDivElement | null, clientX: number) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      // A zero width box makes this 0/0, and NaN propagates all the way to the
      // playhead and the timecode readout. Reachable if a measurement lands
      // while a track is between breakpoints and neither is laid out.
      if (r.width <= 0) return 0;
      const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      return ratio * TOTAL;
    },
    [],
  );

  const timeFromEvent = useCallback(
    (clientX: number) =>
      timeFromEl(
        // Whichever track is actually on screen at this width.
        trackRef.current?.getBoundingClientRect().width
          ? trackRef.current
          : compactRef.current,
        clientX,
      ),
    [timeFromEl],
  );

  // Pointer capture on the window rather than the track, so a fast drag that
  // leaves the element does not drop the scrub halfway.
  useEffect(() => {
    if (!scrubbing) return;
    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      onSeek(timeFromEvent(e.clientX));
    };
    const up = () => {
      draggingRef.current = false;
      onScrubEnd();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [scrubbing, onSeek, onScrubEnd, timeFromEvent]);

  const active = compAt(time);
  const pct = (t: number) => `${Math.round((t / TOTAL) * 1e4) / 1e2}%`;

  // Measured off the event's own target rather than a ref. Both tracks share
  // this handler and only one of them is mounted at a given width, so
  // currentTarget is always the right element, and nothing has to read a ref
  // during render to find out which.
  const beginScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    onScrubStart();
    onSeek(timeFromEl(e.currentTarget, e.clientX));
  };

  /** A clip, filmstrip and all. Shared by the full and compact tracks. */
  const Clip = ({ i, compact }: { i: number; compact?: boolean }) => {
    const c = COMPS[i];
    const on = i === active;
    return (
      <div
        className={`absolute inset-y-[2px] overflow-hidden rounded-[2px] border transition-colors duration-150 ${
          on
            ? "z-10 border-[var(--st-accent)]"
            : "border-[var(--st-line-strong)]"
        }`}
        style={{ left: pct(STARTS[i]), width: pct(c.duration) }}
      >
        {/* The footage. background-repeat rather than an <img>, because a clip
            longer than one pass of the strip should repeat the way a real
            thumbnail track does instead of stretching a single frame. */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${c.thumb})`,
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat-x",
            opacity: on ? 1 : 0.68,
            filter: on ? "none" : "saturate(0.45) brightness(0.85)",
          }}
        />
        {/* Frame divisions. A fixed pixel cadence, so they stay frame-sized
            whatever the clip's duration works out to in CSS percent. */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.42) 0 1px, transparent 1px 42px)",
          }}
        />
        {/* Selected clips get the accent wash every editor expects. */}
        {on ? (
          <span
            aria-hidden
            className="absolute inset-0 bg-[var(--st-clip-on)] mix-blend-screen"
          />
        ) : null}
        {/* Name plate, bottom-left, over a gradient so it survives bright
            footage underneath. */}
        <span className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-[5px] pt-5">
          <span
            className={`truncate ${compact ? "text-[10px]" : "text-[11px]"} font-medium tracking-[-0.01em] ${
              on ? "text-white" : "text-white/75"
            }`}
          >
            {c.name}
          </span>
          {!compact ? (
            <span className="st-tc ml-auto shrink-0 pl-2 text-[8.5px] text-white/50">
              {c.kind}
            </span>
          ) : null}
        </span>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-col border-t border-[var(--st-line)] bg-[var(--st-panel)]">
      {/* Panel header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-[var(--st-line)] px-3 py-1.5">
        <span className="st-label">Timeline</span>
        <span className="st-tc text-[var(--st-dim)]">{timecode(time)}</span>
        {hint ? (
          <span className="st-label ml-auto hidden text-[var(--st-accent)] md:block">
            Drag to scrub · space to play · J K L to shuttle
          </span>
        ) : (
          <span className="st-label ml-auto hidden sm:block">
            {COMPS.length} comps · {timecode(TOTAL)}
          </span>
        )}
      </div>

      {/* Compact single track, phones only. */}
      <div
        ref={compactRef}
        className="relative shrink-0 cursor-ew-resize select-none touch-none sm:hidden"
        style={{ height: V_TRACK_SM }}
        onPointerDown={beginScrub}
        role="slider"
        aria-label="Seek through the reel"
        aria-valuemin={0}
        aria-valuemax={Math.round(TOTAL)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={COMPS[active].name}
        tabIndex={0}
      >
        {COMPS.map((c, i) => (
          <Clip key={c.id} i={i} compact />
        ))}
        <Playhead left={pct(time)} still={playing || scrubbing} />
      </div>

      {/* Full track stack. */}
      <div className="hidden min-h-0 sm:flex">
        {/* Track headers. V1 and A1, the way the left gutter of a sequence
            labels them. The comp list lives in the project panel instead, so
            this column stays narrow. */}
        <div className="w-[64px] shrink-0 border-r border-[var(--st-line)]">
          <div className="h-6 border-b border-[var(--st-line)]" />
          {[
            ["V1", V_TRACK],
            ["A1", A_TRACK],
          ].map(([label, h]) => (
            <div
              key={label as string}
              className="flex items-center gap-1.5 border-b border-[var(--st-line)] px-2"
              style={{ height: h as number }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--st-line-strong)]"
              />
              <span className="st-label text-[var(--st-dim)]">{label}</span>
            </div>
          ))}
        </div>

        {/* Track area. Click or drag anywhere to seek. */}
        <div
          ref={trackRef}
          className="relative min-w-0 flex-1 cursor-ew-resize select-none touch-none"
          onPointerDown={beginScrub}
          role="slider"
          aria-label="Seek through the reel"
          aria-valuemin={0}
          aria-valuemax={Math.round(TOTAL)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={COMPS[active].name}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onSeek(Math.max(0, time - 1));
            if (e.key === "ArrowRight") onSeek(Math.min(TOTAL, time + 1));
          }}
        >
          {/* Ruler */}
          <div className="relative h-6 border-b border-[var(--st-line)]">
            {Array.from(
              { length: Math.floor(TOTAL / 5) + 1 },
              (_, k) => k * 5,
            ).map((s) => (
              <span
                key={s}
                className="absolute top-0 flex h-full items-center"
                style={{ left: pct(s) }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-2 w-px bg-[var(--st-line-strong)]"
                />
                <span className="st-tc pl-1.5 text-[9px] text-[var(--st-faint)]">
                  {s}s
                </span>
              </span>
            ))}
          </div>

          {/* V1. Every clip, butted end to end. */}
          <div
            className="relative border-b border-[var(--st-line)]"
            style={{ height: V_TRACK }}
          >
            {COMPS.map((c, i) => (
              <Clip key={c.id} i={i} />
            ))}
          </div>

          {/* A1. Decorative, but a sequence with a silent audio track looks
              unfinished, and the clip boundaries land in the same places. */}
          <div
            className="relative overflow-hidden border-b border-[var(--st-line)] bg-[rgba(90,150,120,0.07)]"
            style={{ height: A_TRACK }}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-1/2 flex h-full -translate-y-1/2 items-center gap-px"
            >
              {BARS.map((v, i) => (
                <span
                  key={i}
                  className="min-w-0 flex-1 rounded-[0.5px]"
                  style={{
                    height: `${v}%`,
                    backgroundColor:
                      i / BARS.length >= STARTS[active] / TOTAL &&
                      i / BARS.length <
                        (STARTS[active] + COMPS[active].duration) / TOTAL
                        ? "var(--st-audio)"
                        : "var(--st-audio-dim)",
                  }}
                />
              ))}
            </div>
            {/* Clip seams, so the audio reads as cut in the same places. */}
            {STARTS.slice(1).map((s) => (
              <span
                key={s}
                aria-hidden
                className="absolute inset-y-0 w-px bg-black/50"
                style={{ left: pct(s) }}
              />
            ))}
            {/* Name plate, the way V1's clips carry theirs, so the music is
                something you read before you press play. Corner anchored and
                faded out to the right rather than run full width: a scrim
                across the whole lane would dull every bar in it, and only the
                clip's head needs to be legible. */}
            <span className="pointer-events-none absolute left-0 top-0 z-10 flex max-w-[60%] items-center bg-gradient-to-r from-black/85 via-black/60 to-transparent py-[3px] pl-2 pr-8">
              <span className="st-tc min-w-0 truncate text-[10px] text-[var(--st-audio)]">
                {AUDIO_LABEL}
              </span>
            </span>
          </div>

          <Playhead left={pct(time)} still={playing || scrubbing} />
        </div>
      </div>
    </div>
  );
}

/**
 * The playhead. Snapping the transition off while it runs keeps it from
 * lagging one frame behind its own animation.
 */
function Playhead({ left, still }: { left: string; still: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-20 w-px bg-[var(--st-accent)]"
      style={{
        left,
        transition: still
          ? "none"
          : "left 220ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <span className="absolute -left-[5px] top-0 h-2.5 w-[11px] rounded-b-[2px] bg-[var(--st-accent)]" />
    </div>
  );
}
