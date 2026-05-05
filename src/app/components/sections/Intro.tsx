"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { heroContainer, heroItem, staggerParent, staggerChild } from "../../lib/animations";
import {
  withBasePath,
  aboutPillars,
  aboutLanguages,
  aboutHobbies,
} from "../../data";

export default function Intro() {
  return (
    <section
      id="about"
      className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-28 md:pt-20 md:pb-36"
    >
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 items-start gap-12 sm:grid-cols-[1.25fr_0.75fr] sm:gap-12 md:gap-20"
      >
        {/* LEFT — name, role, bio, CTAs */}
        <div className="flex flex-col">
          <motion.h1
            variants={heroItem}
            className="font-mono text-[4rem] font-light leading-[0.95] tracking-[-0.045em] text-white md:text-[6.75rem]"
          >
            Ali Tleis<span className="text-[var(--accent-electric)]">.</span>
          </motion.h1>

          <motion.div variants={heroItem} className="mt-7">
            <span className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-[rgba(99,102,241,0.28)] bg-[rgba(99,102,241,0.045)] px-3.5 py-1.5 text-[11.5px] font-medium tracking-tight text-white/85">
              <span
                aria-hidden
                className="incoming-dot relative block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent-electric)" }}
              />
              <span className="text-white/95">Incoming Web Application Developer</span>
              <span className="text-[var(--text-faint)]">@</span>
              <span className="text-white/80">MIT Lincoln Laboratory</span>
            </span>
          </motion.div>

          <motion.p
            variants={heroItem}
            className="mt-8 max-w-[36rem] text-[16px] leading-[1.7] text-[var(--text-muted)]"
          >
            CS student at Northeastern. I build production software
            end-to-end. Full-stack web platforms, automation pipelines, and
            tooling that real people actually use. Pragmatic by default,
            polished where it matters.
          </motion.p>

          <motion.div
            variants={heroItem}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="https://www.linkedin.com/in/ali-tleis-091800247/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,255,255,0.18)]"
            >
              <FaLinkedin className="text-[14px]" />
              LinkedIn
            </a>
            <a
              href="https://github.com/Alitleis123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-5 py-2.5 text-[13px] font-medium text-white/85 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-white"
            >
              <FaGithub className="text-[14px]" />
              GitHub
            </a>
          </motion.div>
        </div>

        {/* RIGHT — portrait */}
        <motion.div
          variants={heroItem}
          className="flex justify-center sm:justify-end"
        >
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 30% 20%, rgba(99,102,241,0.18), transparent 70%), radial-gradient(50% 50% at 80% 80%, rgba(56,189,248,0.10), transparent 65%)",
              }}
            />
            <div className="relative aspect-[3/4] w-[15rem] overflow-hidden rounded-[2rem] border border-[var(--border-soft)] sm:w-[17rem] md:w-[20rem]">
              <img
                src={withBasePath("/portrait/36B2F96D-AEC4-4C74-BA04-B7D58EE30BE0.jpg")}
                alt="Ali Tleis portrait"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Continuation — about narrative + capabilities, flows from hero */}
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-24 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-x-16"
      >
        <motion.div variants={staggerChild} className="md:col-span-7">
          <p className="text-[18px] leading-[1.7] text-[var(--text-muted)] md:text-[19px]">
            Currently studying Computer Science at Northeastern, joining MIT
            Lincoln Laboratory in July 2026 for a six-month co-op on the AI
            integration team. The work I gravitate toward is the kind that
            ships, full systems with database schemas underneath them, Python
            and Lua pipelines handling the parts no one wants to do by hand,
            and a clean front end on top.
          </p>
          <p className="mt-5 text-[15.5px] leading-[1.7] text-[var(--text-muted)]">
            I care about software that respects the person on the other side of
            it. Fast, considered, and quietly opinionated.
          </p>
        </motion.div>

        <motion.div variants={staggerChild} className="md:col-span-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                Spoken Languages
              </span>
              <span className="text-[13px] tracking-tight text-white/85">
                {aboutLanguages.map((l, i) => (
                  <span key={l.name}>
                    {l.name}
                    <span className="text-[var(--text-faint)]"> ({l.level.toLowerCase()})</span>
                    {i < aboutLanguages.length - 1 ? <span className="text-[var(--text-faint)]"> · </span> : null}
                  </span>
                ))}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                Off-clock
              </span>
              <span className="text-[13px] tracking-tight text-white/85">
                {aboutHobbies.map((h, i) => (
                  <span key={h.name}>
                    {h.name}
                    {i < aboutHobbies.length - 1 ? <span className="text-[var(--text-faint)]"> · </span> : null}
                  </span>
                ))}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                Based in
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-white/85">
                <HiOutlineLocationMarker className="text-[14px] text-[var(--text-dim)]" />
                Boston, MA
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerChild} className="md:col-span-12 mt-4">
          <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
            <span>What I do</span>
            <span className="block h-px flex-1 bg-white/10" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {aboutPillars.map((p, i) => (
              <div
                key={p.label}
                className="group relative flex flex-col gap-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-7 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--border-soft)] hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-dim)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="block h-px w-8 bg-white/15 transition-all duration-300 group-hover:w-12 group-hover:bg-[var(--accent-electric)]" />
                </div>
                <div className="text-[17px] font-medium tracking-tight text-white">
                  {p.label}
                </div>
                <p className="text-[13.5px] leading-[1.7] text-[var(--text-muted)]">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
