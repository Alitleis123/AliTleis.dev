"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ComponentType } from "react";
import { FaJava } from "react-icons/fa";
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiCplusplus,
  SiSharp,
  SiLua,
  SiKotlin,
  SiNextdotjs,
  SiNodedotjs,
  SiTailwindcss,
  SiFramer,
  SiMui,
  SiVite,
  SiReactrouter,
  SiGit,
  SiGithub,
  SiDocker,
  SiLinux,
  SiOpencv,
  SiFfmpeg,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiOpenai,
} from "react-icons/si";
import { fadeUp } from "../../lib/animations";
import { coreStack, stackGroups, type StackItem } from "../../data";

type IconCmp = ComponentType<{ className?: string }>;

const ICON_MAP: Record<string, IconCmp> = {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiCplusplus,
  SiSharp,
  SiLua,
  SiKotlin,
  SiNextdotjs,
  SiNodedotjs,
  SiTailwindcss,
  SiFramer,
  SiMui,
  SiVite,
  SiReactrouter,
  SiGit,
  SiGithub,
  SiDocker,
  SiLinux,
  SiOpencv,
  SiFfmpeg,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiOpenai,
  FaJava,
};

function StackChip({ item, prominent = false }: { item: StackItem; prominent?: boolean }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 ${
        prominent ? "bg-white/[0.06]" : "bg-white/5"
      } px-3.5 py-1.5 text-[12px] text-white/85`}
    >
      {Icon ? <Icon className="text-base text-zinc-300" /> : null}
      <span>{item.name}</span>
    </span>
  );
}

export default function Stack() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.section
      id="stack"
      className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-10"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="mb-10 text-center">
        <h2 className="section-title text-3xl font-bold text-white">Stack</h2>
        <p className="mt-3 text-sm text-zinc-400">
          Tools I reach for first — and the wider system I&apos;m fluent in.
        </p>
      </div>

      {/* Core Stack — pinned */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f18]/90 p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-400">
          Core Stack
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {coreStack.map((item) => (
            <StackChip key={item.name} item={item} prominent />
          ))}
        </div>
      </div>

      {/* More toggle */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
          aria-expanded={expanded}
          aria-controls="stack-more"
        >
          {expanded ? "Hide" : "More"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id="stack-more"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {stackGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5"
                >
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300">
                    {group.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <StackChip key={item.name} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
