"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent, staggerChild } from "../../lib/animations";

const pillars = [
  {
    label: "AI-Integrated Web Systems",
    desc: "Web apps that wrap LLM and AI workflows behind clean interfaces.",
  },
  {
    label: "UI & Motion",
    desc: "Clean interfaces with purposeful animation using React and Framer Motion.",
  },
  {
    label: "Creative Tooling",
    desc: "Video editing pipelines, browser extensions, and automation scripts.",
  },
];

const coursework = [
  "Algorithms & Data Structures",
  "Object-Oriented Design",
  "Artificial Intelligence",
  "Discrete Structures",
  "Programming in C++",
  "Fundamentals of CS 1 & 2",
];

export default function About() {
  return (
    <motion.section
      id="about-details"
      className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-8 md:pb-32"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mb-14 max-w-2xl">
        <p className="text-[18px] leading-[1.65] text-[var(--text-muted)]">
          CS student at Northeastern, incoming Web Application Developer at MIT
          Lincoln Laboratory. I build things that feel good to use: clean
          interfaces, solid architecture, and attention to detail.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
        <div className="editorial-card p-7">
          <div className="section-eyebrow mb-5">Education</div>
          <h3 className="text-[17px] font-medium tracking-tight text-white">
            Northeastern University
          </h3>
          <p className="mt-1.5 text-[13.5px] text-[var(--text-muted)]">
            B.S. Computer Science · Class of 2028
          </p>
          <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">Boston, MA</p>

          <div className="hairline mt-6" />

          <div className="mt-5 text-[10.5px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
            Coursework
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {coursework.map((c) => (
              <span
                key={c}
                className="pill px-2.5 py-1 text-[10.5px]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="editorial-card p-7"
        >
          <div className="section-eyebrow mb-5">What I Do</div>
          <div className="space-y-6">
            {pillars.map((item) => (
              <motion.div key={item.label} variants={staggerChild}>
                <div className="text-[15px] font-medium tracking-tight text-white">
                  {item.label}
                </div>
                <div className="mt-1.5 text-[13.5px] leading-[1.65] text-[var(--text-muted)]">
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <p className="mt-10 text-[13px] text-[var(--text-dim)]">
        Outside of code: weight lifting, video editing in DaVinci.
      </p>
    </motion.section>
  );
}
