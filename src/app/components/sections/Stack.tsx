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
import { FaChevronDown } from "react-icons/fa6";
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
  Languages: "border-purple-400/80",
  "Frameworks & Frontend": "border-sky-400/80",
  "Backend & Tools": "border-teal-400/80",
  Databases: "border-emerald-400/80",
  "AI & ML": "border-[#6366f1]",
};

function StackChip({ item, prominent = false }: { item: StackItem; prominent?: boolean }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-white/[0.025] text-white/85 transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-[var(--border-soft)] hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_18px_rgba(255,255,255,0.05)] ${
        prominent
          ? "px-4 py-2 text-[13.5px] tracking-tight"
          : "px-2.5 py-1 text-[11px] tracking-tight"
      }`}
    >
      {Icon ? (
        <Icon
          className={`${
            prominent ? "text-[16px]" : "text-[12.5px]"
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
      <div className="mb-12 max-w-2xl">
        <h2 className="section-heading">Stack</h2>
        <p className="mt-4 text-[15.5px] leading-[1.7] text-[var(--text-muted)]">
          The tools I reach for first, and the wider system I&apos;m fluent in. This is what I actually build with.
        </p>
      </div>

      {/* Core Stack — pinned, featured */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] p-9"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(56,189,248,0.04) 50%, rgba(15,17,24,0.6) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="block h-4 w-[2px] rounded-full"
            style={{ background: "var(--accent-electric)" }}
            aria-hidden
          />
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
            Core Stack
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {coreStack.map((item) => (
            <StackChip key={item.name} item={item} prominent />
          ))}
        </div>
      </div>

      {/* More toggle */}
      <div className="mt-7 flex justify-center">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--border-soft)] bg-white/[0.03] px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.24em] text-white/80 transition-[border-color,background-color,color] duration-200 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
          aria-expanded={expanded}
          aria-controls="stack-more"
        >
          <span>{expanded ? "Hide" : "More"}</span>
          <motion.span
            aria-hidden
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center"
          >
            <FaChevronDown className="text-[10px]" />
          </motion.span>
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
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {stackGroups.map((group) => {
                const accent = CATEGORY_ACCENT[group.title] ?? "border-white/40";
                const isAi = group.title === "AI & ML";
                return (
                  <div
                    key={group.title}
                    className="rounded-xl border border-[var(--border-soft)] p-6 transition-[border-color,background-color] duration-200 hover:border-white/15"
                    style={{
                      background: isAi
                        ? "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.015) 60%, rgba(15,17,24,0.4))"
                        : "var(--surface-1)",
                    }}
                  >
                    <div className={`flex items-center gap-3 border-l-2 pl-3.5 ${accent}`}>
                      <h3 className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-zinc-100">
                        {group.title}
                      </h3>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-1.5">
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
