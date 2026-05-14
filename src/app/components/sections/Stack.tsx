"use client";

import { motion } from "framer-motion";
import { type ComponentType } from "react";
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
  SiJsonwebtokens,
  SiJest,
  SiJunit5,
  SiHeroku,
  SiArduino,
  SiGooglegemini,
} from "react-icons/si";
import { LuBrainCircuit } from "react-icons/lu";
import { TbApi } from "react-icons/tb";
import { VscTerminalPowershell, VscAzureDevops } from "react-icons/vsc";
import { fadeUp, staggerParent, staggerChild } from "../../lib/animations";
import { coreStack, stackGroups, type StackItem } from "../../data";

type IconCmp = ComponentType<{ className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, IconCmp> = {
  SiReact, SiTypescript, SiJavascript, SiPython, SiCplusplus, SiSharp, SiLua,
  SiKotlin, SiNextdotjs, SiNodedotjs, SiTailwindcss, SiFramer, SiMui, SiVite,
  SiReactrouter, SiGit, SiGithub, SiDocker, SiLinux, SiOpencv, SiFfmpeg,
  SiMongodb, SiPostgresql, SiMysql, SiJsonwebtokens, SiJest, SiJunit5,
  SiHeroku, SiArduino, SiGooglegemini,
  FaJava, LuBrainCircuit, TbApi, VscTerminalPowershell, VscAzureDevops,
};

// Brand colors — applied to icons for personality.
const ICON_COLOR: Record<string, string> = {
  React: "#61DAFB",
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#FFD43B",
  "Next.js": "#FFFFFF",
  "Node.js": "#5FA04E",
  "Tailwind CSS": "#06B6D4",
  Git: "#F05032",
  MongoDB: "#47A248",
  Java: "#EA2D2E",
  "C++": "#00599C",
  "C#": "#9B4F96",
  Lua: "#74C7EC",
  Kotlin: "#7F52FF",
  "Framer Motion": "#FFFFFF",
  MUI: "#007FFF",
  Vite: "#646CFF",
  "React Router": "#CA4245",
  "Node.js / Express": "#5FA04E",
  "REST APIs": "#F472B6",
  "JWT Auth": "#FB7185",
  "Git / GitHub": "#FFFFFF",
  Docker: "#2496ED",
  Linux: "#FCC624",
  OpenCV: "#5C3EE8",
  FFmpeg: "#65C77D",
  PowerShell: "#5391FE",
  PostgreSQL: "#4169E1",
  MySQL: "#4479A1",
  "Azure DevOps": "#0078D7",
  Jest: "#C21325",
  JUnit: "#25A162",
  Heroku: "#430098",
  Arduino: "#00979D",
  "Gemini API": "#8E75E2",
  "LLM Integration": "#A78BFA",
};

function Chip({ item }: { item: StackItem }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  const color = ICON_COLOR[item.name] ?? "#E5E7EB";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-white/[0.025] px-3 py-1.5 text-[12px] tracking-tight text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-[var(--border-soft)] hover:bg-white/[0.05] hover:text-white">
      {Icon ? <Icon className="text-[13px]" style={{ color }} /> : null}
      {item.name}
    </span>
  );
}

function CoreTile({ item }: { item: StackItem }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  const color = ICON_COLOR[item.name] ?? "#E5E7EB";
  return (
    <div
      className="group relative flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] py-6 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-soft)] hover:bg-[var(--surface-2)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60% 60% at 50% 0%, ${color}1f, transparent 70%)`,
        }}
      />
      {Icon ? (
        <Icon className="relative text-[28px] transition-transform duration-300 group-hover:scale-110" style={{ color }} />
      ) : null}
      <span className="relative text-[12px] tracking-tight text-white/85">{item.name}</span>
    </div>
  );
}

export default function Stack() {
  return (
    <motion.section
      id="stack"
      className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-24"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[var(--text-dim)]">
          04
        </span>
        <span className="block h-px w-10 bg-white/15" />
        <span className="section-eyebrow">Stack</span>
      </div>

      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-2xl text-[2rem] font-light leading-[1.15] tracking-[-0.025em] text-white md:text-[2.4rem]">
          The tools I reach for first.
        </h2>
        <span className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-dim)]">
          CORE · {coreStack.length.toString().padStart(2, "0")} TOOLS
        </span>
      </div>

      {/* Core grid — featured, visual */}
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
      >
        {coreStack.map((item) => (
          <motion.div key={item.name} variants={staggerChild}>
            <CoreTile item={item} />
          </motion.div>
        ))}
      </motion.div>

      {/* Categorical breakdown — labeled rows */}
      <div className="mt-12 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-7 md:p-9">
        <div className="grid gap-x-10 gap-y-7 md:grid-cols-[180px_1fr]">
          {stackGroups.map((group, i) => (
            <RowEntry key={group.title} group={group} divider={i > 0} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function RowEntry({
  group,
  divider,
}: {
  group: { title: string; items: StackItem[] };
  divider: boolean;
}) {
  return (
    <>
      <div
        className={`flex items-start ${divider ? "md:border-t md:border-[var(--border-hairline)] md:pt-7" : ""}`}
      >
        <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
          {group.title}
        </span>
      </div>
      <div
        className={`flex flex-wrap gap-1.5 ${divider ? "md:border-t md:border-[var(--border-hairline)] md:pt-7" : ""}`}
      >
        {group.items.map((item) => (
          <Chip key={item.name} item={item} />
        ))}
      </div>
    </>
  );
}
