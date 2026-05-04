"use client";

import { motion } from "framer-motion";
import { FaGithub, FaDownload } from "react-icons/fa";
import { heroContainer, heroItem } from "../../lib/animations";
import { withBasePath } from "../../data";

export default function Hero() {
  return (
    <section
      id="about"
      className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-12"
    >
      <div className="grid w-full grid-cols-1 items-center gap-16 md:grid-cols-2">
        <div className="flex flex-col">
          <motion.h1
            className="mb-5 text-[5.5rem] font-light leading-[1.02] tracking-tight md:text-[6rem]"
            variants={heroContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={heroItem} className="block">
              Ali
            </motion.span>
            <motion.span variants={heroItem} className="block">
              Tleis
            </motion.span>
          </motion.h1>

          <motion.div
            className="mb-6"
            variants={heroItem}
            initial="hidden"
            animate="visible"
          >
            <a
              href="#timeline"
              className="incoming-badge group inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-2 text-[12px] font-medium tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-500/15"
            >
              <span aria-hidden className="text-sm leading-none">⚡</span>
              <span className="text-indigo-200">Incoming</span>
              <span className="text-indigo-400/60">·</span>
              <span>MIT Lincoln Laboratory</span>
              <span className="text-indigo-400/60">·</span>
              <span className="text-indigo-200/80">
                Web Application Developer (AI Integration)
              </span>
            </a>
          </motion.div>

          <motion.p
            className="max-w-xl text-lg leading-8 text-zinc-400"
            variants={heroItem}
            initial="hidden"
            animate="visible"
          >
            CS student at Northeastern. I build things that feel good to use —
            clean interfaces, solid architecture, and attention to detail.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3 pointer-events-auto"
            variants={heroItem}
            initial="hidden"
            animate="visible"
          >
            <a
              href={withBasePath("/resume/resume.pdf")}
              download
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] transition hover:bg-indigo-400"
            >
              <FaDownload className="text-sm" />
              Download Resume
            </a>
            <a
              href="https://github.com/Alitleis123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              <FaGithub className="text-base" />
              GitHub
            </a>
          </motion.div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-500/25 shadow-[0_0_60px_rgba(99,102,241,0.15),0_0_120px_rgba(56,189,248,0.07)]">
            <img
              src={withBasePath("/portrait/36B2F96D-AEC4-4C74-BA04-B7D58EE30BE0.jpg")}
              alt="Ali Tleis portrait"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
