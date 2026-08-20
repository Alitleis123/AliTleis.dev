"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { HiOutlineLocationMarker } from "react-icons/hi";
import {
  timeline,
  isCurrentEntry,
  entryDuration,
  NOW_MARKER_LABEL,
  NOW_MARKER_SORTKEY,
  type TimelineEntry as TEntry,
} from "../../data";
import { fadeUp, timelineEntry as entryAnim } from "../../lib/animations";

function NowDivider() {
  return (
    <div className="relative grid grid-cols-1 items-center gap-5 py-4 pl-9 md:grid-cols-[200px_1fr] md:gap-12 md:pl-0">
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <span className="hidden h-px w-6 bg-white/15 md:block" />
        {/* nowrap: the flex-1 rule below would otherwise compress this label
            into four stacked lines at phone widths. */}
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.32em] text-white/65">
          {NOW_MARKER_LABEL.toUpperCase()}
        </span>
        <span className="block h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}

function LogoTile({ entry }: { entry: TEntry }) {
  const [errored, setErrored] = useState(false);
  const showImage = entry.icon && !errored;
  const isCurrent = isCurrentEntry(entry);

  if (showImage) {
    return (
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-[var(--surface-1)] md:h-16 md:w-16 ${
          isCurrent
            ? "border-[rgba(99,102,241,0.4)]"
            : "border-[var(--border-hairline)]"
        }`}
      >
        <img
          src={entry.icon}
          alt={entry.iconAlt ?? ""}
          onError={() => setErrored(true)}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Fallback: stylized monogram tile
  const text = entry.iconText ?? entry.title.slice(0, 2).toUpperCase();
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border font-mono font-semibold tracking-[0.06em] md:h-16 md:w-16 ${
        isCurrent ? "" : "bg-[var(--surface-1)]"
      } ${text.length > 2 ? "text-[10px]" : "text-[14px]"}`}
      style={
        isCurrent
          ? {
              borderColor: "rgba(99,102,241,0.45)",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(99,102,241,0.04))",
              color: "#dbeafe",
            }
          : { borderColor: "var(--border-hairline)", color: "rgba(255,255,255,0.85)" }
      }
    >
      {text}
    </div>
  );
}

function RailNode({ current, education }: { current?: boolean; education?: boolean }) {
  if (current) {
    return (
      <span aria-hidden className="relative z-10 flex h-3 w-3 items-center justify-center">
        <span
          className="absolute h-6 w-6 rounded-full blur-md"
          style={{ background: "rgba(99,102,241,0.45)" }}
        />
        <span
          className="current-node-pulse relative block h-3 w-3 rounded-full"
          style={{
            background: "var(--accent-electric)",
            boxShadow: "0 0 16px rgba(99,102,241,0.95)",
          }}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`relative z-10 block rounded-full border-2 ${
        education
          ? "h-3 w-3 border-white/35 bg-[var(--background)]"
          : "h-2.5 w-2.5 border-white/25 bg-[var(--background)]"
      }`}
      style={{ boxShadow: "0 0 0 4px var(--background)" }}
    />
  );
}

function Entry({ entry }: { entry: TEntry }) {
  const [open, setOpen] = useState(false);
  const isCurrent = isCurrentEntry(entry);
  const isEducation = entry.track === "education";
  const duration = entryDuration(entry);
  const chips = entry.tech ?? entry.education?.coursework ?? [];

  return (
    <motion.article
      variants={entryAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="relative grid grid-cols-1 gap-4 py-8 pl-9 md:grid-cols-[200px_1fr] md:gap-12 md:py-12 md:pl-0"
    >
      {/* The node hangs off the article rather than the meta column, so the
          column can be sticky without dragging the node down the rail. Its x
          matches the rail drawn by the parent (13px on mobile / 200px on
          desktop). Padding doesn't shift it — absolute offsets resolve against
          the article's padding edge. */}
      <div className="absolute left-[13px] top-[6px] z-10 -translate-x-1/2 md:left-[200px]">
        <RailNode current={isCurrent} education={isEducation} />
      </div>

      {/* Meta. On desktop this is a sticky left column; on phones a 200px column
          is impossible, so it becomes an inline wrapping row above the title.
          The outer div is left to stretch to the full grid-row height on
          purpose: that box is the sticky containing block, so the inner div has
          room to travel alongside a long expanded entry. Shrinking it
          (self-start) leaves nothing to stick within. */}
      <div>
      <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 md:sticky md:top-28 md:flex-col md:items-start md:gap-2.5">
        <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/85">
          {entry.range}
        </div>
        {duration ? (
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--text-faint)]">
            {duration}
          </div>
        ) : null}
        {entry.meta ? (
          <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--text-dim)]">
            <HiOutlineLocationMarker className="text-[12px]" />
            {entry.meta}
          </div>
        ) : null}
        {isCurrent ? (
          <span
            className="current-pill inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] md:mt-1"
            style={{
              borderColor: "rgba(99,102,241,0.45)",
              background: "rgba(99,102,241,0.10)",
              color: "#c7d2fe",
            }}
          >
            <span
              aria-hidden
              className="block h-1 w-1 rounded-full"
              style={{
                background: "var(--accent-electric)",
                boxShadow: "0 0 8px rgba(99,102,241,0.9)",
              }}
            />
            Current
          </span>
        ) : null}
        {isEducation ? (
          <span className="inline-flex w-fit rounded-full border border-[var(--border-hairline)] px-2 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-white/65 md:mt-1">
            Education
          </span>
        ) : null}
      </div>
      </div>

      {/* Right content */}
      <div className="flex flex-col gap-5 md:pl-6">
        {/* The entire header is the toggle — a much larger hit area than the
            old chip-sized button, and one control instead of two. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group/hdr -m-2 flex items-start justify-between gap-4 rounded-2xl p-2 text-left transition-colors duration-200 hover:bg-white/[0.02]"
        >
          <div className="flex min-w-0 items-start gap-4">
            <LogoTile entry={entry} />
            <div className="min-w-0">
              <h3 className="text-[1.5rem] font-light leading-[1.1] tracking-[-0.02em] text-white md:text-[1.85rem]">
                {entry.title}
                {isCurrent ? (
                  <span className="text-[var(--accent-electric)]">.</span>
                ) : null}
              </h3>
              {entry.subtitle ? (
                <div className="mt-1.5 text-[14px] text-[var(--text-muted)]">
                  {entry.subtitle}
                </div>
              ) : null}
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65 transition-[border-color,background-color,color] duration-200 group-hover/hdr:border-[var(--border-soft)] group-hover/hdr:bg-[var(--surface-2)] group-hover/hdr:text-white sm:px-3.5">
            {/* Label drops on phones so the title isn't squeezed to three lines;
                the chevron plus aria-expanded still convey state. */}
            <span className="hidden sm:inline">{open ? "Less" : "More"}</span>
            <motion.span
              aria-hidden
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex"
            >
              <FaChevronDown className="text-[9px]" />
            </motion.span>
          </span>
        </button>

        <p className="max-w-[42rem] text-[14.5px] leading-[1.75] text-[var(--text-muted)]">
          {entry.desc}
        </p>

        {/* Collapsed preview of the stack, so the timeline is scannable without
            opening every entry. */}
        {!open && chips.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.slice(0, 5).map((c) => (
              <span
                key={c}
                className="rounded-full border border-[var(--border-hairline)] bg-white/[0.02] px-2.5 py-1 text-[11px] tracking-tight text-white/70"
              >
                {c}
              </span>
            ))}
            {chips.length > 5 ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                +{chips.length - 5}
              </span>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-7 pt-2">
                {/* Standing note (e.g. clearance status) */}
                {entry.note ? (
                  <div
                    className="flex w-fit items-center gap-2.5 rounded-xl border px-3.5 py-2 font-mono text-[11px] tracking-tight"
                    style={{
                      borderColor: "rgba(99,102,241,0.28)",
                      background: "rgba(99,102,241,0.06)",
                      color: "#c7d2fe",
                    }}
                  >
                    <span
                      aria-hidden
                      className="current-dot block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--accent-electric)" }}
                    />
                    {entry.note}
                  </div>
                ) : null}

                {/* Education stats — only on expansion */}
                {isEducation && entry.education ? (
                  <div>
                    <SectionLabel>At a Glance</SectionLabel>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {entry.education.stats.map((s) => (
                        <div
                          key={s.label}
                          className="surface-lift flex flex-col gap-1 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4"
                        >
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[var(--text-dim)]">
                            {s.label}
                          </span>
                          <span className="tabular-figures text-[19px] font-light tracking-tight text-white">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Responsibilities & Impact */}
                {entry.bullets.length ? (
                  <div>
                    <SectionLabel>
                      {isEducation ? "Highlights" : "Responsibilities & Impact"}
                    </SectionLabel>
                    <ul className="mt-4 max-w-[44rem] space-y-3.5 text-[13.5px] leading-[1.7] text-[var(--text-muted)]">
                      {entry.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3.5">
                          <span
                            aria-hidden
                            className="mt-[9px] block h-[3px] w-[3px] shrink-0 rounded-full"
                            style={{
                              background: "var(--accent-electric)",
                              boxShadow: "0 0 6px rgba(99,102,241,0.55)",
                            }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Stack / Coursework */}
                {isEducation && entry.education ? (
                  <div>
                    <SectionLabel>Coursework</SectionLabel>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {entry.education.coursework.map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-[var(--border-hairline)] bg-white/[0.02] px-2.5 py-1 text-[11px] tracking-tight text-white/80"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : entry.tech?.length ? (
                  <div>
                    <SectionLabel>Stack</SectionLabel>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {entry.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[var(--border-hairline)] bg-white/[0.02] px-2.5 py-1 text-[11px] tracking-tight text-white/80"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Gallery */}
                {entry.images?.length ? (
                  <div>
                    <SectionLabel>Gallery</SectionLabel>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {entry.images.map((img) => (
                        <div
                          key={img.src}
                          className="overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-black/40"
                        >
                          <img
                            src={img.src}
                            alt={img.alt}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
      <span>{children}</span>
      <span className="block h-px flex-1 bg-white/10" />
    </div>
  );
}

export default function Timeline() {
  const entries = [...timeline].sort((a, b) =>
    b.sortKey.localeCompare(a.sortKey),
  );
  const belowNowStart = entries.findIndex(
    (e) => e.sortKey.localeCompare(NOW_MARKER_SORTKEY) < 0,
  );

  return (
    <motion.section
      id="timeline"
      className="relative z-10 mx-auto max-w-5xl px-6 pt-8 pb-32"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[var(--text-dim)]">
          03
        </span>
        <span className="block h-px w-10 bg-white/15" />
        <span className="section-eyebrow">Timeline</span>
      </div>

      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-2xl text-[2rem] font-light leading-[1.15] tracking-[-0.025em] text-white md:text-[2.4rem]">
          Where I&apos;ve worked, studied, and shipped.
        </h2>
        <span className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-dim)]">
          {String(entries.length).padStart(2, "0")} ENTRIES
        </span>
      </div>

      {/* Rail container — vertical line drawn between meta column and content column */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute left-[13px] top-0 bottom-0 w-px md:left-[200px]"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 6%, rgba(99,102,241,0.45) 50%, rgba(255,255,255,0.12) 94%, transparent 100%)",
          }}
        />

        {entries.map((entry, idx) => (
          <div key={entry.id}>
            {idx === belowNowStart ? <NowDivider /> : null}
            <Entry entry={entry} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
