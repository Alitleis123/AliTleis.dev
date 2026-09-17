"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { timeline, entryDuration, isCurrentEntry } from "../../data";
import {
  holdRamp,
  stepProgress,
  stepThrough,
  usePresentation,
  useScriptedScroll,
} from "../presentation";
import Plate from "./Plate";

/**
 * Experience as stacked layers.
 *
 * The document renders this as a vertical rail with expandable cards. Layers
 * are the native shape for the same data, one row per role, ordered in time,
 * with its properties opening underneath the way a layer's transform group
 * does.
 *
 * Rows carry the company mark and the headline outcome. Both were already in
 * the data and neither was on screen, which left seven near-identical grey
 * text rows and no way to tell the seven month Lincoln Laboratory co-op from
 * a one line entry.
 */
export default function Tracks() {
  const { presenting, progress } = usePresentation();
  const [manualOpen, setManualOpen] = useState<string | null>(
    timeline[0]?.id ?? null,
  );
  const listRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLUListElement>(null);

  // Scripted: one slot per role, notes a third of the way into each.
  const autoIdx = stepThrough(progress, timeline.length);
  const slot = stepProgress(progress, timeline.length);
  const autoOpenId = timeline[autoIdx]?.id ?? null;
  const autoNotes = slot > 0.34;

  const open = presenting ? autoOpenId : manualOpen;
  /**
   * Bullets are folded away, keyed by entry.
   *
   * Expanded by default, one open role ran the comp 111px past the bottom of
   * the frame on a desktop and 66px on a phone, so the only way to read the
   * layer list was to scroll a viewer. The summary and the measured outcomes
   * stay on show and the eight supporting lines are one click behind a count,
   * which is the same bargain the projects bin makes.
   */
  const [manualNotes, setManualNotes] = useState<string | null>(null);
  const notes = presenting ? (autoNotes ? autoOpenId : null) : manualNotes;

  useScriptedScroll(
    notesRef,
    presenting && autoNotes,
    holdRamp((slot - 0.34) / 0.66, 0.16),
  );

  /**
   * Keep the role the run is on inside the layer list.
   *
   * The list is the scroll container, so by the fourth slot the open row can
   * sit below the fold and the guided run would be narrating something off
   * screen.
   */
  useEffect(() => {
    if (!presenting || !open) return;
    const row = listRef.current?.querySelector(`[data-entry="${open}"]`);
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [presenting, open]);

  return (
    <div className="st-seq relative flex h-full min-h-full flex-col px-[4%] py-[3%]">
      <Plate src="plate-experience.webp" scrim={0.6} />
      <div className="relative flex shrink-0 items-baseline gap-3">
        <span className="st-eyebrow">Layers</span>
        <span className="st-label">{timeline.length} in sequence</span>
      </div>

      <div
        ref={listRef}
        className="st-viewer-scroll relative mt-5 min-h-0 flex-1 overflow-y-auto pr-1"
      >
        {timeline.map((e, i) => {
          const isOpen = open === e.id;
          const dur = entryDuration(e);
          const current = isCurrentEntry(e);
          return (
            <div
              key={e.id}
              data-entry={e.id}
              className="border-t border-[var(--st-line)] last:border-b"
            >
              <button
                type="button"
                onClick={() => {
                  setManualOpen(isOpen ? null : e.id);
                  setManualNotes(null);
                }}
                aria-expanded={isOpen}
                className={`relative flex w-full items-center gap-3.5 py-3.5 pl-3 pr-1 text-left transition-colors duration-150 ${
                  isOpen ? "bg-[var(--st-sel)]" : "hover:bg-[var(--st-hover)]"
                }`}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[2px]"
                  style={{
                    background: isOpen ? "var(--st-accent)" : "transparent",
                  }}
                />

                <span className="st-tc w-5 shrink-0 text-[10px] text-[var(--st-faint)]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Company mark, which is the fastest way to tell these rows
                    apart. Falls back to initials where there is no logo. */}
                <span
                  aria-hidden
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-[var(--st-line-strong)] bg-[var(--st-panel-hi)]"
                >
                  {e.icon ? (
                    <Image
                      src={e.icon}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-contain p-[3px]"
                    />
                  ) : (
                    <span className="st-tc text-[9px] text-[var(--st-faint)]">
                      {e.iconText ?? e.title.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-medium tracking-[-0.015em] text-[var(--st-text)]">
                      {e.title}
                    </span>
                    {current ? (
                      <span className="shrink-0 rounded-full bg-[var(--st-sel)] px-1.5 py-[1px] text-[9.5px] uppercase tracking-[0.1em] text-[var(--st-accent)]">
                        Current
                      </span>
                    ) : null}
                  </span>
                  {e.subtitle ? (
                    <span className="mt-0.5 block truncate text-[12.5px] text-[var(--st-dim)]">
                      {e.subtitle}
                    </span>
                  ) : null}
                </span>

                {/* The headline number, on the row rather than hidden behind
                    the expander. Retired once the row is open, where the same
                    figure is already set large underneath. */}
                {e.metrics?.length && !isOpen ? (
                  <span className="hidden shrink-0 items-baseline gap-1.5 xl:flex">
                    <span className="st-tc text-[15px] text-[var(--st-accent)]">
                      {e.metrics[0].value}
                    </span>
                    <span className="st-label max-w-[10rem] truncate">
                      {e.metrics[0].label}
                    </span>
                  </span>
                ) : null}

                <span className="hidden shrink-0 text-right sm:block">
                  <span className="st-tc block text-[10.5px] text-[var(--st-dim)]">
                    {e.range}
                  </span>
                  {dur ? (
                    <span className="st-label block">{dur}</span>
                  ) : null}
                </span>

                <span
                  aria-hidden
                  className="st-tc w-4 shrink-0 text-center text-[var(--st-faint)]"
                  style={{
                    transform: isOpen ? "rotate(90deg)" : "none",
                    transition: "transform 200ms ease",
                  }}
                >
                  &rsaquo;
                </span>
              </button>

              {isOpen ? (
                <div className="st-reveal grid gap-x-10 gap-y-6 pb-6 pl-[4.25rem] pr-1 pt-1 lg:grid-cols-[minmax(0,1fr)_236px]">
                  <div className="min-w-0">
                    <p className="st-lede max-w-[62ch]">{e.desc}</p>

                    {e.metrics?.length ? (
                      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                        {e.metrics.map((m) => (
                          <div key={m.label}>
                            <div className="st-metric-v">{m.value}</div>
                            <div className="st-label mt-1.5">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {e.bullets.length ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setManualNotes((n) => (n === e.id ? null : e.id))
                          }
                          aria-expanded={notes === e.id}
                          className="st-btn mt-6 gap-1.5 px-2.5"
                        >
                          Notes {String(e.bullets.length).padStart(2, "0")}
                          <LuChevronDown
                            aria-hidden
                            className="text-[12px] transition-transform duration-200"
                            style={{
                              transform:
                                notes === e.id ? "rotate(180deg)" : "none",
                            }}
                          />
                        </button>

                        {notes === e.id ? (
                          <ul
                            ref={notesRef}
                            className="st-reveal st-viewer-scroll mt-4 max-h-[24vh] max-w-[70ch] overflow-y-auto pr-2"
                          >
                            {e.bullets.map((b, k) => (
                              <li
                                key={k}
                                className="flex gap-4 border-t border-[var(--st-line)] py-3"
                              >
                                <span className="st-tc shrink-0 pt-[5px] text-[10px] text-[var(--st-faint)]">
                                  {String(k + 1).padStart(2, "0")}
                                </span>
                                <span className="st-body">{b}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-col gap-5">
                    {e.tech?.length ? (
                      <div>
                        <span className="st-label">Stack</span>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {e.tech.slice(0, 8).map((t) => (
                            <span
                              key={t}
                              className="rounded-[3px] border border-[var(--st-line-strong)] bg-[var(--st-panel)] px-2 py-1 text-[11.5px] tracking-[-0.01em] text-[var(--st-dim)]"
                            >
                              {t}
                            </span>
                          ))}
                          {e.tech.length > 8 ? (
                            <span className="st-tc self-center text-[var(--st-faint)]">
                              +{e.tech.length - 8}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {e.education?.stats?.length ? (
                      <div className="border-t border-[var(--st-line)] pt-5">
                        {e.education.stats.map((s) => (
                          <div
                            key={s.label}
                            className="flex items-baseline gap-3 py-1"
                          >
                            <span className="st-label">{s.label}</span>
                            <span className="st-tc ml-auto text-[var(--st-dim)]">
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {e.education?.coursework?.length ? (
                      <div className="border-t border-[var(--st-line)] pt-5">
                        <span className="st-label">Coursework</span>
                        <div className="mt-2 flex flex-col gap-1.5">
                          {e.education.coursework.map((c) => (
                            <span
                              key={c}
                              className="text-[12.5px] leading-[1.5] text-[var(--st-dim)]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {e.note ? (
                      <p className="border-t border-[var(--st-line)] pt-5 text-[12px] leading-[1.65] text-[var(--st-faint)]">
                        {e.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
