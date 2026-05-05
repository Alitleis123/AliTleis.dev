"use client";

import { motion } from "framer-motion";
import {
  timeline,
  NOW_MARKER_LABEL,
  NOW_MARKER_SORTKEY,
  type TimelineEntry as TEntry,
} from "../../data";
import { fadeUp, mitGlow } from "../../lib/animations";
import TimelineEntry from "./TimelineEntry";

type Row = {
  key: string;
  experience?: TEntry;
  project?: TEntry;
  /** Whether this row sits above or below the NOW marker. */
  side: "above" | "below";
};

/**
 * Pair entries by index across the two tracks so both sides fill. Entries are
 * partitioned around the NOW marker first so future-dated work stays above it,
 * past work below it. This avoids the gappy single-side rows you get when you
 * pair on exact sortKey.
 */
function pairRows(entries: TEntry[], nowKey: string): Row[] {
  const exp = entries
    .filter((e) => e.track === "experience")
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  const proj = entries
    .filter((e) => e.track === "project")
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  const futureExp = exp.filter((e) => e.sortKey.localeCompare(nowKey) >= 0);
  const pastExp = exp.filter((e) => e.sortKey.localeCompare(nowKey) < 0);
  const futureProj = proj.filter((p) => p.sortKey.localeCompare(nowKey) >= 0);
  const pastProj = proj.filter((p) => p.sortKey.localeCompare(nowKey) < 0);

  const zip = (
    a: TEntry[],
    b: TEntry[],
    side: "above" | "below",
  ): Row[] => {
    const len = Math.max(a.length, b.length);
    return Array.from({ length: len }, (_, i) => ({
      key: `${side}-${i}`,
      experience: a[i],
      project: b[i],
      side,
    }));
  };

  return [...zip(futureExp, futureProj, "above"), ...zip(pastExp, pastProj, "below")];
}

function NowMarker() {
  return (
    <div className="relative my-1 flex items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <span className="relative rounded-full border border-[var(--border-hairline)] bg-[var(--background)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--text-dim)]">
        {NOW_MARKER_LABEL}
      </span>
    </div>
  );
}

function RailNode({ row }: { row: Row }) {
  const isIncoming = row.experience?.incoming || row.project?.incoming;
  return (
    <div className="relative flex h-full items-start justify-center">
      {isIncoming ? (
        <motion.div
          variants={mitGlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mt-8"
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
            style={{ background: "rgba(99,102,241,0.35)" }}
          />
          <span
            className="incoming-node-pulse relative block h-2.5 w-2.5 rounded-full"
            style={{
              background: "var(--accent-electric)",
              boxShadow: "0 0 18px rgba(99,102,241,1)",
            }}
            aria-hidden
          />
        </motion.div>
      ) : (
        <span
          className="timeline-node-glow relative mt-9 block h-1.5 w-1.5 rounded-full bg-zinc-300/85"
          aria-hidden
        />
      )}
    </div>
  );
}

export default function Timeline() {
  const rows = pairRows(timeline, NOW_MARKER_SORTKEY);
  // Index of the first row that falls below the "Now" marker.
  const belowNowStart = rows.findIndex((r) => r.side === "below");

  const experienceOnly = timeline
    .filter((e) => e.track === "experience")
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  const projectsOnly = timeline
    .filter((e) => e.track === "project")
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return (
    <motion.section
      id="timeline"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-16"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="mb-16">
        <div className="section-eyebrow mb-4">Experience · Projects</div>
        <h2 className="section-heading">Timeline</h2>
      </div>

      {/* Desktop: two parallel tracks with central rail */}
      <div className="relative hidden md:block">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(99,102,241,0.55) 50%, transparent 100%)",
          }}
        />

        <div className="space-y-5">
          {rows.map((row, idx) => (
            <div key={row.key}>
              {idx === belowNowStart ? <NowMarker /> : null}
              <div className="grid grid-cols-[1fr_56px_1fr] items-start gap-6">
                <div className="flex justify-end">
                  {row.experience ? (
                    <div className="w-full max-w-[440px]">
                      <TimelineEntry entry={row.experience} side="left" />
                    </div>
                  ) : null}
                </div>
                <RailNode row={row} />
                <div className="flex justify-start">
                  {row.project ? (
                    <div className="w-full max-w-[440px]">
                      <TimelineEntry entry={row.project} side="right" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: stacked — Experience first, then Projects */}
      <div className="md:hidden">
        <div className="section-eyebrow mb-4">Experience</div>
        <div className="space-y-6">
          {experienceOnly.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} side="left" />
          ))}
        </div>

        <div className="hairline my-12" />

        <div className="section-eyebrow mb-4">Projects</div>
        <div className="space-y-6">
          {projectsOnly.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} side="left" />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
