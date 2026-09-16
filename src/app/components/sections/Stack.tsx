"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent, staggerChild } from "../../lib/animations";
import { coreStack, stackGroups, type StackItem } from "../../data";
import { ICON_MAP, techColor } from "../../lib/techIcons";

function Chip({ item }: { item: StackItem }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  const color = techColor(item.name);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-white/[0.025] px-3 py-1.5 text-[12px] tracking-tight text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-[var(--border-soft)] hover:bg-white/[0.05] hover:text-white">
      {Icon ? <Icon className="text-[13px]" style={{ color }} /> : null}
      {item.name}
    </span>
  );
}

function CoreTile({ item }: { item: StackItem }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  const color = techColor(item.name);
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
          What I build with.
        </h2>
        <span className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-dim)]">
          CORE · {coreStack.length.toString().padStart(2, "0")} TOOLS
        </span>
      </div>

      {/* Core grid, featured, visual */}
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

      {/* Categorical breakdown, labeled rows */}
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
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
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
