"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { LuChevronDown, LuChrome, LuExternalLink, LuGithub } from "react-icons/lu";
import { featuredProjects, otherWork, type Project } from "../../data";
import { COVER_MAP } from "../../lib/projectCovers";
import {
  holdRamp,
  stepProgress,
  stepThrough,
  usePresentation,
  useScriptedScroll,
} from "../presentation";
import Plate from "./Plate";

/**
 * Projects as a bin with a source monitor.
 *
 * Featured work and other work are separate. Flattening all eight into one
 * list promoted four coursework repos to the same standing as a shipped
 * DaVinci Resolve plugin, and gave them a full detail pane they have nothing
 * to fill with. Other work is four compact rows, a name and a stack line and
 * a link, which is all any of them needs.
 *
 * The monitor shows the project's drawn cover first and its screenshots as
 * alternate takes underneath. The covers are the artwork that was made for
 * these projects; a screenshot of a marketing page is a record of one. Using
 * the screenshot as the headline image meant every project led with a wall of
 * unreadable 12px type.
 */
export default function Bin() {
  const { presenting, progress } = usePresentation();
  const [manualSel, setManualSel] = useState(0);
  const [manualNotes, setManualNotes] = useState(false);
  const [manualTake, setManualTake] = useState(0);
  const notesRef = useRef<HTMLDivElement>(null);

  const count = featuredProjects.length;

  // Scripted: one slot per project, and inside each slot the notes open a
  // third of the way through and then walk themselves.
  const autoSel = stepThrough(progress, count);
  const slot = stepProgress(progress, count);
  const autoNotes = slot > 0.34;

  const sel = presenting ? autoSel : manualSel;
  const notesOpen = presenting ? autoNotes : manualNotes;
  const take = presenting ? 0 : manualTake;

  const p = featuredProjects[sel];
  const Cover = p.coverKey ? COVER_MAP[p.coverKey] : null;
  // Take 0 is the drawn cover when there is one, then the screenshots.
  const takes = [
    ...(Cover ? [{ kind: "cover" as const }] : []),
    ...(p.gallery ?? []).map((g) => ({ kind: "shot" as const, ...g })),
  ];
  const current = takes[Math.min(take, takes.length - 1)];

  useScriptedScroll(
    notesRef,
    presenting && autoNotes,
    holdRamp((slot - 0.34) / 0.66, 0.16),
  );

  const selectProject = (i: number) => {
    setManualSel(i);
    setManualNotes(false);
    setManualTake(0);
  };

  return (
    <div className="st-seq relative flex h-full min-h-full flex-col lg:flex-row">
      <Plate src="plate-projects.webp" />

      <div className="relative shrink-0 border-b border-[var(--st-line)] bg-[var(--st-panel)]/85 backdrop-blur-sm lg:flex lg:w-[248px] lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 border-b border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2">
          <span className="st-label">Featured</span>
          <span className="st-tc ml-auto text-[var(--st-faint)]">{count}</span>
        </div>

        <div className="flex overflow-x-auto lg:block lg:overflow-x-visible">
          {featuredProjects.map((item, i) => (
            <SourceRow
              key={item.id}
              item={item}
              index={i}
              on={i === sel}
              onSelect={() => selectProject(i)}
            />
          ))}
        </div>

        {/* Other work. Compact by design: no preview, no detail pane, no
            expander, because there is nothing behind them worth opening. */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 border-y border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2">
            <span className="st-label">Other work</span>
            <span className="st-tc ml-auto text-[var(--st-faint)]">
              {otherWork.length}
            </span>
          </div>
          {otherWork.map((item) => (
            <a
              key={item.id}
              href={item.repo ?? item.demo ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-b border-[var(--st-line)] px-3 py-2 transition-colors duration-150 hover:bg-[var(--st-hover)]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] tracking-[-0.01em] text-[var(--st-dim)]">
                  {item.title}
                </span>
                <span className="st-tc block truncate text-[9.5px] text-[var(--st-faint)]">
                  {[item.range, item.tech?.[0]].filter(Boolean).join(" · ")}
                </span>
              </span>
              {item.repo ? (
                <LuGithub
                  aria-hidden
                  className="shrink-0 text-[13px] text-[var(--st-faint)]"
                />
              ) : null}
            </a>
          ))}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col justify-center px-[4%] py-[3%]">
        {/* Keyed on the project, so stepping to the next one fades the
            monitor and the copy in together instead of swapping them. */}
        <div
          key={p.id}
          className="st-reveal grid gap-x-9 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center"
        >
          <div className="min-w-0">
            <div className="relative aspect-video w-full overflow-hidden rounded-[3px] border border-[var(--st-line-strong)] bg-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
              {current?.kind === "cover" && Cover ? (
                <Cover />
              ) : current?.kind === "shot" ? (
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  className="object-contain"
                />
              ) : (
                <span className="st-hatch absolute inset-0 opacity-60" />
              )}
            </div>

            {/* Alternate takes. The cover first, then the real captures. */}
            {takes.length > 1 ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {takes.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setManualTake(i)}
                    aria-label={
                      t.kind === "cover" ? "Show the cover" : `Show screen ${i}`
                    }
                    aria-pressed={i === Math.min(take, takes.length - 1)}
                    className="relative h-[34px] w-[58px] shrink-0 overflow-hidden rounded-[2px] border transition-colors duration-150"
                    style={{
                      borderColor:
                        i === Math.min(take, takes.length - 1)
                          ? "var(--st-accent)"
                          : "var(--st-line-strong)",
                      background: "var(--st-stage)",
                    }}
                  >
                    {t.kind === "cover" && Cover ? (
                      <Cover />
                    ) : t.kind === "shot" ? (
                      <Image
                        src={t.src}
                        alt=""
                        fill
                        sizes="58px"
                        className="object-cover"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <span className="st-eyebrow">
                P/{String(sel + 1).padStart(2, "0")}
              </span>
              <span className="st-tc ml-auto shrink-0 text-[var(--st-faint)]">
                {p.range}
              </span>
            </div>

            <h2 className="st-h mt-2.5">{p.title}</h2>

            {p.subtitle ? (
              <p className="st-tc mt-1.5 text-[var(--st-accent)]">
                {p.subtitle}
              </p>
            ) : null}

            <p className="st-lede mt-4 max-w-[44ch]">{p.desc}</p>

            {p.tech?.length ? (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.tech.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="rounded-[3px] border border-[var(--st-line-strong)] bg-[var(--st-panel)] px-2 py-1 text-[11.5px] tracking-[-0.01em] text-[var(--st-dim)]"
                  >
                    {t}
                  </span>
                ))}
                {p.tech.length > 5 ? (
                  <span className="st-tc self-center text-[var(--st-faint)]">
                    +{p.tech.length - 5}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {p.demo ? (
                <a
                  href={p.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="st-btn st-btn-primary gap-1.5 px-3"
                >
                  <LuExternalLink aria-hidden className="text-[12px]" />
                  Live
                </a>
              ) : null}
              {p.store ? (
                <a
                  href={p.store}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="st-btn gap-1.5 px-3"
                >
                  <LuChrome aria-hidden className="text-[12px]" />
                  Web Store
                </a>
              ) : null}
              {p.repo ? (
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="st-btn gap-1.5 px-3"
                >
                  <LuGithub aria-hidden className="text-[12px]" />
                  Source
                </a>
              ) : null}

              {p.bullets?.length ? (
                <button
                  type="button"
                  onClick={() => setManualNotes((o) => !o)}
                  aria-expanded={notesOpen}
                  className="st-btn ml-auto gap-1.5 px-2.5"
                >
                  Notes {String(p.bullets.length).padStart(2, "0")}
                  <LuChevronDown
                    aria-hidden
                    className="text-[12px] transition-transform duration-200"
                    style={{ transform: notesOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Notes. Capped and scrolled inside itself, so opening them cannot
            push the rest of the comp out of the frame, and so the guided run
            has something bounded to walk down. */}
        {notesOpen && p.bullets?.length ? (
          <div
            ref={notesRef}
            className="st-reveal st-viewer-scroll mt-6 max-h-[26vh] overflow-y-auto border-t border-[var(--st-line)] pt-4"
            style={{ scrollBehavior: presenting ? "auto" : "smooth" }}
          >
            <ul className="max-w-[78ch] pr-2">
              {p.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-4 border-b border-[var(--st-line)] py-3 last:border-b-0"
                >
                  <span className="st-tc shrink-0 pt-[5px] text-[10px] text-[var(--st-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="st-body">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** One row in the featured list, with its poster frame. */
function SourceRow({
  item,
  index,
  on,
  onSelect,
}: {
  item: Project;
  index: number;
  on: boolean;
  onSelect: () => void;
}) {
  const Cover = item.coverKey ? COVER_MAP[item.coverKey] : null;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex w-[190px] shrink-0 items-center gap-2.5 border-r border-[var(--st-line)] px-3 py-2.5 text-left transition-colors duration-150 lg:w-full lg:border-r-0 lg:border-b ${
        on ? "bg-[var(--st-sel)]" : "hover:bg-[var(--st-hover)]"
      }`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: on ? "var(--st-accent)" : "transparent" }}
      />
      <span
        aria-hidden
        className="relative h-[28px] w-[48px] shrink-0 overflow-hidden rounded-[2px] border"
        style={{
          borderColor: on ? "var(--st-sel-line)" : "var(--st-line-strong)",
          background: "var(--st-stage)",
          filter: on ? "none" : "saturate(0.5) brightness(0.8)",
        }}
      >
        {Cover ? (
          <Cover />
        ) : (
          <span className="st-hatch absolute inset-0 opacity-70" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="st-tc block text-[9.5px] text-[var(--st-faint)]">
          P/{String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`block truncate text-[12.5px] tracking-[-0.01em] ${
            on ? "text-[var(--st-text)]" : "text-[var(--st-dim)]"
          }`}
        >
          {item.title}
        </span>
      </span>
    </button>
  );
}
