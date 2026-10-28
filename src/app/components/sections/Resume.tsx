"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeUp } from "../../lib/animations";
import { RESUME_HREF, RESUME_PREVIEW_SRC } from "../../data";

export default function Resume() {
  return (
    <motion.section
      id="resume"
      className="relative z-10 mx-auto max-w-6xl px-6 py-28"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="mb-10 flex items-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[var(--text-dim)]">
          06
        </span>
        <span className="block h-px w-10 bg-white/15" />
        <span className="section-eyebrow">Resume</span>
      </div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-2xl text-[2rem] font-light leading-[1.15] tracking-[-0.025em] text-white md:text-[2.4rem]">
          Resume PDF.
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={RESUME_HREF}
            download
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,255,255,0.18)]"
          >
            Download PDF
          </a>
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] px-5 py-2.5 text-[13px] font-medium text-white/85 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-white"
          >
            Open in New Tab
          </a>
        </div>
      </div>

      {/* A picture of page one rather than the PDF itself. An iframe of a PDF
          shows nothing at all on Android Chrome, and on desktop it brought a
          whole PDF viewer process into the page's scrolling. The page is the
          link, so the PDF is one click away either way. */}
      <a
        href={RESUME_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the resume PDF in a new tab"
        className="mx-auto block w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[var(--border-soft)] hover:shadow-[0_18px_50px_-20px_rgba(255,255,255,0.18)]"
      >
        <Image
          src={RESUME_PREVIEW_SRC}
          alt="Page one of Ali Tleis's resume"
          width={900}
          height={1165}
          sizes="(min-width: 800px) 768px, 100vw"
          className="h-auto w-full"
        />
      </a>
    </motion.section>
  );
}
