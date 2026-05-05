"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ComponentType } from "react";
import { FaArrowUpRightFromSquare, FaGithub, FaChevronDown } from "react-icons/fa6";
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
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiOpenai,
  SiAnthropic,
  SiOpencv,
  SiFfmpeg,
  SiLinux,
  SiDocker,
  SiGit,
  SiGooglechrome,
  SiExpress,
} from "react-icons/si";
import { TbApi, TbBrandAzure } from "react-icons/tb";
import { VscTerminalPowershell } from "react-icons/vsc";
import { LuBrainCircuit, LuMonitor } from "react-icons/lu";
import { timelineEntry } from "../../lib/animations";
import type { TimelineEntry as TEntry } from "../../data";

type Props = {
  entry: TEntry;
  side: "left" | "right";
};

type IconCmp = ComponentType<{ className?: string }>;

// Resolve a tech-name string to an icon component.
const TECH_ICON: Record<string, IconCmp> = {
  React: SiReact,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  Python: SiPython,
  "Next.js": SiNextdotjs,
  "Node.js": SiNodedotjs,
  "Tailwind CSS": SiTailwindcss,
  "Framer Motion": SiFramer,
  MongoDB: SiMongodb,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  Java: FaJava,
  "C++": SiCplusplus,
  "C#": SiSharp,
  Lua: SiLua,
  Kotlin: SiKotlin,
  OpenCV: SiOpencv,
  FFmpeg: SiFfmpeg,
  Linux: SiLinux,
  Docker: SiDocker,
  Git: SiGit,
  "Azure DevOps": TbBrandAzure,
  "AI Integration": LuBrainCircuit,
  "REST APIs": TbApi,
  PowerShell: VscTerminalPowershell,
  Windows: LuMonitor,
  WinPE: LuMonitor,
  "DaVinci Resolve": LuMonitor,
  "Chrome Extensions MV3": SiGooglechrome,
  "OpenAI API": SiOpenai,
  Anthropic: SiAnthropic,
  Express: SiExpress,
};

function TechPill({ name }: { name: string }) {
  const Icon = TECH_ICON[name];
  return (
    <span className="pill px-2.5 py-1 text-[10.5px] tracking-tight">
      {Icon ? <Icon className="text-[12px] text-zinc-200" /> : null}
      <span>{name}</span>
    </span>
  );
}

function IconTile({ entry }: { entry: TEntry }) {
  if (entry.iconText) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[9.5px] font-semibold tracking-[0.08em]"
        style={{
          borderColor: "rgba(99,102,241,0.45)",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(99,102,241,0.04))",
          color: "#dbeafe",
        }}
      >
        {entry.iconText}
      </div>
    );
  }
  if (entry.icon) {
    return (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-black/40">
        <img
          src={entry.icon}
          alt={entry.iconAlt ?? ""}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 shrink-0 rounded-lg border border-[var(--border-hairline)] bg-black/40" />
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`tl-${entry.id}-details`}
        className={`group relative w-full rounded-xl border p-6 text-left transition-[border-color,background-color,box-shadow] duration-200 ${
          isIncoming
            ? "border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.045)] hover:border-[rgba(99,102,241,0.6)] hover:bg-[rgba(99,102,241,0.07)] hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]"
            : "border-[var(--border-hairline)] bg-[var(--surface-1)] hover:border-[var(--border-soft)] hover:bg-[var(--surface-2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.04)]"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <IconTile entry={entry} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 pr-8">
              <h3 className="text-[15px] font-medium tracking-tight text-white">
                {entry.title}
              </h3>
              {isIncoming ? (
                <span
                  className="incoming-pill rounded-full border px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.18em]"
                  style={{
                    borderColor: "rgba(99,102,241,0.45)",
                    background: "rgba(99,102,241,0.10)",
                    color: "#c7d2fe",
                  }}
                >
                  Incoming
                </span>
              ) : null}
            </div>
            {entry.subtitle ? (
              <div className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">
                {entry.subtitle}
              </div>
            ) : null}
            <div className="mt-1.5 text-[10.5px] uppercase tracking-[0.22em] text-[var(--text-dim)]">
              {entry.range}
              {entry.meta ? (
                <span className="text-[var(--text-faint)]"> · {entry.meta}</span>
              ) : null}
            </div>
            <p className="mt-3 text-[13px] leading-[1.65] text-[var(--text-muted)]">
              {entry.desc}
            </p>
          </div>

          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-hairline)] text-white/55 transition-colors duration-200 group-hover:border-[var(--border-soft)] group-hover:text-white/90"
          >
            <FaChevronDown className="text-[10px]" />
          </motion.span>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={`tl-${entry.id}-details`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden"
            >
              <div className="hairline mt-6" />
              <ul className="mt-6 space-y-3 pl-5 text-[13px] leading-[1.75] text-[var(--text-muted)]">
                {entry.bullets.map((b) => (
                  <li key={b} className="list-disc marker:text-[var(--text-faint)]">
                    {b}
                  </li>
                ))}
              </ul>

              {entry.tech?.length ? (
                <>
                  <div className="hairline mt-7" />
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {entry.tech.map((t) => (
                      <TechPill key={t} name={t} />
                    ))}
                  </div>
                </>
              ) : null}

              {entry.track === "project" && (entry.demo || entry.repo) ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.demo ? (
                    <a
                      href={entry.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] px-3 py-1.5 text-[11px] text-white/85 transition-colors duration-200 hover:border-[var(--border-soft)] hover:bg-white/[0.04]"
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
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] px-3 py-1.5 text-[11px] text-white/85 transition-colors duration-200 hover:border-[var(--border-soft)] hover:bg-white/[0.04]"
                    >
                      <FaGithub className="text-[12px]" />
                      GitHub
                    </a>
                  ) : null}
                </div>
              ) : null}
              <div className="h-2" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
