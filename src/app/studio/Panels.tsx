"use client";

import { LuVolume2, LuVolumeX } from "react-icons/lu";
import ViewSwitch from "../components/ViewSwitch";
import {
  COMPS,
  FPS,
  STARTS,
  TOTAL,
  clipLength,
  compAt,
  timecode,
} from "./comps";

/**
 * The project panel. A list of comps, which is how an editor opens one.
 *
 * Rows carry a poster frame rather than a drawn icon. Seven 47px rows left
 * roughly 370px of empty panel underneath them, which read as a layout bug
 * rather than as breathing room, and a 24x18 outlined square with a dot in it
 * was standing in for artwork that already exists on disk.
 */
export function ProjectPanel({
  time,
  onSeek,
}: {
  time: number;
  onSeek: (t: number) => void;
}) {
  const active = compAt(time);

  return (
    <aside className="st-boot-panel hidden w-[216px] shrink-0 flex-col border-r border-[var(--st-line)] bg-[var(--st-panel)] lg:flex">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2">
        <span className="st-label">Project</span>
        <span className="st-tc ml-auto text-[var(--st-faint)]">
          {COMPS.length}
        </span>
      </div>

      {/* The separators carry on past the last item.
          Seven rows in a panel this tall leave roughly 250px underneath them,
          and a hard stop followed by flat grey read as a broken layout. A bin
          in list view keeps ruling the empty rows, so the rhythm continues and
          the space stops looking like a mistake. */}
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 55.25px, var(--st-line) 55.25px 56.25px)",
        }}
      >
        {COMPS.map((c, i) => {
          const on = i === active;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSeek(STARTS[i] + 0.01)}
              className={`relative flex w-full items-center gap-2.5 border-b border-[var(--st-line)] px-3 py-2.5 text-left transition-colors duration-150 ${
                on ? "bg-[var(--st-sel)]" : "hover:bg-[var(--st-hover)]"
              }`}
            >
              {/* Selected marker, full-bleed on the leading edge the way a
                  highlighted row is flagged in a real bin. */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[2px]"
                style={{ background: on ? "var(--st-accent)" : "transparent" }}
              />

              {/* Poster frame, taken from the clip's own filmstrip. 400% wide
                  isolates frame one of the four the strip holds. */}
              <span
                aria-hidden
                className="h-[26px] w-[44px] shrink-0 rounded-[2px] border"
                style={{
                  borderColor: on
                    ? "var(--st-sel-line)"
                    : "var(--st-line-strong)",
                  backgroundImage: `url(${c.thumb})`,
                  backgroundSize: "400% 100%",
                  backgroundPosition: "0 0",
                  filter: on ? "none" : "saturate(0.45) brightness(0.8)",
                }}
              />

              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[12.5px] tracking-[-0.01em] ${
                    on ? "text-[var(--st-text)]" : "text-[var(--st-dim)]"
                  }`}
                >
                  {c.name}
                </span>
                <span className="st-tc block text-[10px] text-[var(--st-faint)]">
                  {clipLength(c.duration)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Project info. A real bin puts the sequence's settings at the bottom,
          and it is the honest way to fill the space the list does not use.

          The second link out to the written page used to live here. Two
          controls that looked nothing alike, in opposite corners, both going
          to the same place and neither saying so plainly, is worse than one.
          It is in the top bar only now. */}
      <div className="shrink-0 border-t border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2.5">
        {[
          ["Duration", timecode(TOTAL)],
          ["Frame rate", `${FPS} fps`],
          ["Tracks", "V1 · A1"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2 py-[3px]">
            <span className="st-label">{k}</span>
            <span className="st-tc ml-auto text-[10px] text-[var(--st-dim)]">
              {v}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/**
 * Transport and file identity, the strip across the top of the application.
 *
 * The reel starts paused, which makes play the one thing a first-time visitor
 * has to be able to find. It gets the accent and twice the width of the
 * shuttle keys rather than sitting in a row of three identical grey buttons.
 */
export function TopBar({
  time,
  playing,
  muted,
  showMute,
  onPlayToggle,
  onStep,
  onMuteToggle,
}: {
  time: number;
  playing: boolean;
  muted: boolean;
  showMute: boolean;
  onPlayToggle: () => void;
  onStep: (dir: -1 | 1) => void;
  onMuteToggle: () => void;
}) {
  const active = compAt(time);

  /*
   * Positioned with a z-index of its own, so the view switch's preview can
   * hang below the bar.
   *
   * The boot animation runs on this element with fill-mode both, which leaves
   * transform holding an animated value rather than `none`. A transform makes
   * the element a stacking context, so the preview's z-50 was scoped to inside
   * the header and painted under the panels beneath it: the top strip of the
   * image showed and the rest vanished behind the composition header. Nothing
   * else in this route goes above z-20, so 40 clears all of it.
   */
  return (
    <header className="vt-topbar relative z-40 flex shrink-0 items-center gap-3 border-b border-[var(--st-line)] bg-[var(--st-chrome)] px-3 py-2">
      <span className="vt-wordmark text-[13px] font-medium tracking-[-0.02em] text-[var(--st-text)]">
        Ali&nbsp;Tleis
      </span>
      {/* Named on its own so it pops rather than cross-fading. It exists in
          this bar only, so there is nothing on the other side to morph into. */}
      <span className="vt-filename st-tc hidden text-[var(--st-faint)] sm:block">
        portfolio.aep
      </span>

      {/* Transport. J K L is muscle memory for anyone who edits. */}
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label="Previous composition"
          className="st-btn"
        >
          <span aria-hidden>&#9664;&#9664;</span>
        </button>
        <button
          type="button"
          onClick={onPlayToggle}
          aria-label={playing ? "Pause" : "Play"}
          className="st-btn-play"
        >
          <span aria-hidden>{playing ? "‖" : "▶"}</span>
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label="Next composition"
          className="st-btn"
        >
          <span aria-hidden>&#9654;&#9654;</span>
        </button>

        {/* Mute, next to play. That is where a player keeps it, so there is
            nothing to learn, and it is the only control the audio needs.
            Absent entirely when there is no bed to mute. */}
        {showMute ? (
          <button
            type="button"
            onClick={onMuteToggle}
            aria-pressed={muted}
            aria-label={muted ? "Unmute the reel" : "Mute the reel"}
            className="st-btn"
          >
            {muted ? (
              <LuVolumeX aria-hidden className="text-[13px]" />
            ) : (
              <LuVolume2 aria-hidden className="text-[13px]" />
            )}
          </button>
        ) : null}
      </div>

      <span className="st-tc ml-1 hidden text-[var(--st-accent)] sm:block">
        {timecode(time)}
      </span>
      <span className="st-label hidden md:block">
        {String(active + 1).padStart(2, "0")}/
        {String(COMPS.length).padStart(2, "0")}
      </span>

      {/* Both destinations, current one marked. See ViewSwitch for why this
          is not a single button. */}
      <ViewSwitch />
    </header>
  );
}
