"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import { withBasePath } from "../../data";

export default function Resume() {
  return (
    <motion.section
      id="resume"
      className="relative z-10 mx-auto max-w-5xl px-6 py-28"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 className="section-heading">Resume</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={withBasePath("/resume/resume.pdf")}
            download
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-colors duration-200 hover:bg-white/90"
          >
            Download PDF
          </a>
          <a
            href={withBasePath("/resume/resume.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] px-5 py-2.5 text-[13px] font-medium text-white/85 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-white"
          >
            Open in New Tab
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-black/30">
        <iframe
          src={withBasePath("/resume/resume.pdf")}
          className="h-[80vh] w-full"
          title="Ali Tleis Resume"
        />
      </div>
    </motion.section>
  );
}
