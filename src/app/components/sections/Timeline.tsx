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
  sortKey: string;
  experience?: TEntry;
  project?: TEntry;
};

function groupRows(entries: TEntry[]): Row[] {
  const sorted = [...entries].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  const rows: Row[] = [];
  for (const e of sorted) {
    const existing = rows.find((r) => r.sortKey === e.sortKey);
    if (existing) {
      if (e.track === "experience") existing.experience = e;
      else existing.project = e;
    } else {
      rows.push({
        sortKey: e.sortKey,
        experience: e.track === "experience" ? e : undefined,
        project: e.track === "project" ? e : undefined,
      });
    }
  }
  return rows;
}

function NowMarker() {
  return (
    <div className="relative my-2 flex items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
      <span className="relative rounded-full border border-indigo-400/30 bg-[#0d0f18] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-indigo-200/80">
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
          className="relative mt-7"
        >
          <span className="absolute inset-0 -m-1 rounded-full bg-indigo-500/30 blur-md" aria-hidden />
          <span
            className="incoming-node-pulse relative block h-5 w-5 rounded-full border-2 border-indigo-300 bg-indigo-500 shadow-[0_0_22px_rgba(99,102,241,0.85)]"
            aria-hidden
          />
        </motion.div>
      ) : (
        <span
          className="relative mt-9 block h-3 w-3 rounded-full border border-white/30 bg-[#0d0f18]"
          aria-hidden
        />
      )}
    </div>
  );
}

export default function Timeline() {
  const rows = groupRows(timeline);
  // Index of the first row that falls below the "Now" marker.
  const belowNowStart = rows.findIndex(
    (r) => r.sortKey.localeCompare(NOW_MARKER_SORTKEY) < 0,
  );

  const experienceOnly = timeline
    .filter((e) => e.track === "experience")
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  const projectsOnly = timeline
    .filter((e) => e.track === "project")
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return (
    <motion.section
      id="timeline"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="mb-12 text-center">
        <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
          Experience · Projects
        </div>
        <h2 className="section-title text-3xl font-bold text-white">Timeline</h2>
      </div>

      {/* Desktop: two parallel tracks with central rail */}
      <div className="relative hidden md:block">
        <div
          aria-hidden
          className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-gradient-to-b from-indigo-400/40 via-violet-400/25 to-zinc-500/15"
        />

        <div className="space-y-10">
          {rows.map((row, idx) => (
            <div key={row.sortKey}>
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
        <div className="mb-4 text-[10px] uppercase tracking-[0.3em] text-indigo-300/80">
          Experience
        </div>
        <div className="space-y-6">
          {experienceOnly.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} side="left" />
          ))}
        </div>

        <div className="my-10 h-px w-full bg-white/5" />

        <div className="mb-4 text-[10px] uppercase tracking-[0.3em] text-indigo-300/80">
          Projects
        </div>
        <div className="space-y-6">
          {projectsOnly.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} side="left" />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
