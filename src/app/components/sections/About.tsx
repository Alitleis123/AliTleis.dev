"use client";

import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import { fadeUp } from "../../lib/animations";

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
      className="relative z-10 mx-auto max-w-6xl px-6 pb-20"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-7 text-zinc-300">
        CS student at Northeastern, incoming Web Application Developer at{" "}
        <span className="text-indigo-300">MIT Lincoln Laboratory</span>. I build
        things that feel good to use — clean interfaces, solid architecture,
        and attention to detail.
      </p>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Education */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f18]/90 p-6 shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-400">
            Education
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">
            Northeastern University
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            B.S. Computer Science · Class of 2028
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
            <FaMapMarkerAlt className="text-xs" />
            Boston, MA
          </p>
          <div className="mt-5 h-px w-full bg-white/5" />
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              Coursework
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {coursework.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-400"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* What I Do */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f18]/90 p-6 shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-400">
            What I Do
          </div>
          <div className="mt-4 space-y-4">
            {pillars.map((item) => (
              <div key={item.label}>
                <div className="text-sm font-medium text-white">
                  {item.label}
                </div>
                <div className="mt-0.5 text-sm text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
        Outside of code: lifting, video editing in DaVinci, the occasional
        competitive FPS.
      </p>
    </motion.section>
  );
}
