"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { heroContainer, heroItem, staggerParent, staggerChild } from "../../lib/animations";
import {
  withBasePath,
  aboutClearance,
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
            className="font-mono font-medium leading-[0.9] tracking-[-0.05em] text-[var(--text-strong)]"
            style={{ fontSize: "var(--display)" }}
          >
            Ali Tleis<span className="text-[var(--accent-electric)]">.</span>
          </motion.h1>

          <motion.div variants={heroItem} className="mt-7">
            <span className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-[var(--signal-dim)] bg-[var(--signal-wash)] px-3.5 py-1.5 text-[11.5px] font-medium tracking-tight text-white/85">
              <span
                aria-hidden
                className="current-dot relative block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent-electric)" }}
              />
              <span className="text-white/95">Web Application Developer</span>
              <span className="text-[var(--text-faint)]">@</span>
              <span className="text-white/80">MIT Lincoln Laboratory</span>
            </span>
          </motion.div>

          <motion.p
            variants={heroItem}
            className="mt-8 max-w-[36rem] text-[15px] leading-[1.7] text-[var(--text-muted)]"
          >
            CS student at Northeastern, currently on a seven-month co-op at
            MIT Lincoln Laboratory. I build production software end-to-end —
            full-stack platforms, automation pipelines, and tooling people
            actually use.
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
            {/* No glow blob — the frame and the grid behind it do the work. */}
            <div className="relative aspect-[3/4] w-[15rem] overflow-hidden rounded-lg border border-[var(--border-soft)] sm:w-[17rem] md:w-[20rem]">
              <img
                src={withBasePath("/portrait/36B2F96D-AEC4-4C74-BA04-B7D58EE30BE0.webp")}
                alt="Ali Tleis portrait"
                decoding="async"
                fetchPriority="high"
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
          <p className="max-w-[54ch] text-[18px] leading-[1.7] text-[var(--text-muted)]">
            The work I gravitate toward is the kind that ships: full systems
            with database schemas underneath them, Python and Lua pipelines
            handling the parts no one wants to do by hand, and a clean front
            end on top. Fast, considered, and quietly opinionated.
          </p>
        </motion.div>

        <motion.div variants={staggerChild} className="md:col-span-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                Clearance
              </span>
              <span className="inline-flex items-center gap-2 text-[13px] tracking-tight text-white/85">
                <span
                  aria-hidden
                  className="current-dot block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--accent-electric)" }}
                />
                {aboutClearance}
              </span>
            </div>
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
      </motion.div>
    </section>
  );
}
