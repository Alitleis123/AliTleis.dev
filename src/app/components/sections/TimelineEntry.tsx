"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";
import { timelineEntry } from "../../lib/animations";
import type { TimelineEntry as TEntry } from "../../data";

type Props = {
  entry: TEntry;
  /** Which side of the rail this card sits on (desktop). */
  side: "left" | "right";
};

const badgeTone: Record<string, string> = {
  blue: "border-indigo-400/40 bg-indigo-500/15 text-indigo-100",
  green: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  amber: "border-amber-400/40 bg-amber-500/10 text-amber-100",
  violet: "border-violet-400/40 bg-violet-500/10 text-violet-100",
};

function IconTile({ entry }: { entry: TEntry }) {
  if (entry.iconText) {
    // Text-monogram fallback (MIT LL).
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-400/50 bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 text-[10px] font-bold tracking-[0.1em] text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
        {entry.iconText}
      </div>
    );
  }
  if (entry.icon) {
    return (
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <img
          src={entry.icon}
          alt={entry.iconAlt ?? ""}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="h-12 w-12 shrink-0 rounded-xl border border-white/10 bg-black/40" />
  );
}

export default function TimelineEntry({ entry, side }: Props) {
  const [open, setOpen] = useState(false);
  const isIncoming = entry.incoming;

  return (
    <motion.div
      variants={timelineEntry}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className={`relative w-full ${side === "right" ? "md:ml-auto" : ""}`}
    >
      <div
        className={`relative rounded-2xl border bg-[#0d0f18]/90 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition ${
          isIncoming
            ? "border-indigo-400/50 shadow-[0_0_50px_rgba(99,102,241,0.25)]"
            : "border-white/10"
        }`}
      >
        {isIncoming ? (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl"
            style={{
              background:
                "radial-gradient(120% 120% at 0% 0%, rgba(99,102,241,0.18), transparent 60%)",
            }}
          />
        ) : null}

        <div className="relative flex items-start gap-4">
          <IconTile entry={entry} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold text-white">
                {entry.title}
              </h3>
              {entry.badges?.map((b) => (
                <span
                  key={b.label}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] ${
                    badgeTone[b.tone] ?? badgeTone.violet
                  } ${b.label === "Incoming" ? "incoming-pill" : ""}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
            {entry.subtitle ? (
              <div className="mt-0.5 text-[13px] text-zinc-300">
                {entry.subtitle}
              </div>
            ) : null}
            <div className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {entry.range}
              {entry.meta ? <span className="text-zinc-600"> · {entry.meta}</span> : null}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-zinc-300">
              {entry.desc}
            </p>
            {entry.note ? (
              <p className="mt-1 text-[11px] italic text-zinc-500">
                {entry.note}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
            aria-expanded={open}
            aria-controls={`tl-${entry.id}-details`}
          >
            {open ? "Hide" : "Expand"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={`tl-${entry.id}-details`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative overflow-hidden"
            >
              <ul className="mt-4 space-y-2 pl-5 text-[13px] text-zinc-300">
                {entry.bullets.map((b) => (
                  <li key={b} className="list-disc">
                    {b}
                  </li>
                ))}
              </ul>

              {entry.tech?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              {entry.track === "project" && (entry.demo || entry.repo) ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.demo ? (
                    <a
                      href={entry.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/85 transition hover:border-white/25 hover:bg-white/10"
                    >
                      <FaArrowUpRightFromSquare className="text-[10px]" />
                      Live Demo
                    </a>
                  ) : null}
                  {entry.repo ? (
                    <a
                      href={entry.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/85 transition hover:border-white/25 hover:bg-white/10"
                    >
                      <FaGithub className="text-[12px]" />
                      GitHub
                    </a>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
