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
  SiAnthropic,
  SiJsonwebtokens,
} from "react-icons/si";
import { LuBrainCircuit, LuSparkles } from "react-icons/lu";
import { TbApi } from "react-icons/tb";
import { VscTerminalPowershell } from "react-icons/vsc";
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
  SiAnthropic,
  SiJsonwebtokens,
  FaJava,
  LuBrainCircuit,
  LuSparkles,
  TbApi,
  VscTerminalPowershell,
};

// Per-category accent for the left-border treatment on category headings.
const CATEGORY_ACCENT: Record<string, string> = {
  Languages: "border-indigo-400/70",
  "Frameworks & Frontend": "border-sky-400/70",
  "Backend & Tools": "border-emerald-400/70",
  Databases: "border-amber-400/70",
  "AI & ML": "border-violet-400/70",
};

function StackChip({ item, prominent = false }: { item: StackItem; prominent?: boolean }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/10 transition hover:border-white/20 hover:bg-white/[0.08] ${
        prominent
          ? "gap-2.5 bg-white/[0.07] px-4 py-2 text-[13px] text-white/90"
          : "gap-2 bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-white/80"
      }`}
    >
      {Icon ? (
        <Icon
          className={`${
            prominent ? "text-[17px]" : "text-[14px]"
          } text-zinc-200`}
        />
      ) : null}
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
          Tools I reach for first, and the wider system I&apos;m fluent in.
        </p>
      </div>

      {/* Core Stack — pinned */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#11141f] to-[#0a0c14] p-7 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3">
          <span className="block h-4 w-[3px] rounded-full bg-indigo-400" aria-hidden />
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-300">
            Core Stack
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
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
              {stackGroups.map((group) => {
                const accent = CATEGORY_ACCENT[group.title] ?? "border-white/40";
                return (
                  <div
                    key={group.title}
                    className="rounded-2xl border border-white/10 bg-[#0c0e16]/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.4)]"
                  >
                    <div className={`flex items-center gap-3 border-l-2 pl-3 ${accent}`}>
                      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-zinc-200">
                        {group.title}
                      </h3>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <StackChip key={item.name} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
