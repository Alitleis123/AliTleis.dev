"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import { withBasePath } from "../../data";

export default function Resume() {
  return (
    <motion.section
      id="resume"
      className="relative z-10 mx-auto max-w-5xl px-6 py-24"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="mb-10 text-center">
        <h2 className="section-title text-3xl font-bold text-white">Resume</h2>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0d0f18]/90 p-6">
        <div className="mb-5 flex flex-wrap justify-end gap-3">
          <a
            href={withBasePath("/resume/resume.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
          >
            Open in New Tab
          </a>
          <a
            href={withBasePath("/resume/resume.pdf")}
            download
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            Download PDF
          </a>
        </div>

        <div className="relative h-[80vh] w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <iframe
            src={withBasePath("/resume/resume.pdf")}
            className="h-full w-full"
            title="Ali Tleis Resume"
          />
        </div>
      </div>
    </motion.section>
  );
}
