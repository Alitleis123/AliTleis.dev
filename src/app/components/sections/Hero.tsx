"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { heroContainer, heroItem } from "../../lib/animations";
import { withBasePath } from "../../data";


export default function Hero() {
  return (
    <section
      id="about"
      className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-28 md:pt-28 md:pb-36"
    >
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="grid w-full grid-cols-1 items-center gap-16 md:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="flex flex-col">
          <motion.h1
            variants={heroItem}
            className="font-mono text-[4.5rem] font-light leading-[0.98] tracking-[-0.04em] text-white md:text-[6.25rem]"
          >
            Ali Tleis
          </motion.h1>

          <motion.div variants={heroItem} className="mt-7">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[11.5px] font-medium tracking-tight text-white/80">
              <span
                aria-hidden
                className="incoming-dot block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent-electric)" }}
              />
              <span>Incoming</span>
              <span className="text-[var(--text-faint)]">·</span>
              <span>MIT Lincoln Laboratory</span>
              <span className="text-[var(--text-faint)]">·</span>
              <span className="text-white/65">
                Web Application Developer (AI Integration)
              </span>
            </span>
          </motion.div>

          <motion.p
            variants={heroItem}
            className="mt-7 max-w-xl text-[15.5px] leading-[1.7] text-[var(--text-muted)]"
          >
            CS student at Northeastern. I build things that feel good to use —
            clean interfaces, solid architecture, and attention to detail.
          </motion.p>

          <motion.div
            variants={heroItem}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a
              href="https://www.linkedin.com/in/ali-tleis-091800247/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-colors duration-200 hover:bg-white/90"
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

        <motion.div
          variants={heroItem}
          className="flex justify-center md:justify-end"
        >
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border-soft)]">
            <img
              src={withBasePath("/portrait/36B2F96D-AEC4-4C74-BA04-B7D58EE30BE0.jpg")}
              alt="Ali Tleis portrait"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
