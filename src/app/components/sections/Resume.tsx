"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { fadeUp } from "../../lib/animations";
import { RESUME_HREF } from "../../data";

/**
 * Mounts the PDF iframe only once the section is near the viewport. Embedding a
 * PDF spins up Chromium's PDFium viewer in its own process and makes it a
 * participant in page compositing and scroll hit-testing — keeping it mounted
 * from first paint made scrolling the whole page choppy.
 */
function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      // Start loading a screen early so it's ready by the time it's reached.
      { rootMargin: "600px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);

  return { ref, near };
}

export default function Resume() {
  const { ref: frameRef, near: showFrame } = useNearViewport<HTMLDivElement>();

  return (
    <motion.section
      id="resume"
      className="relative z-10 mx-auto max-w-5xl px-6 py-28"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="mb-10 flex items-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[var(--text-dim)]">
          05
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

      <div
        ref={frameRef}
        className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-black/30"
      >
        <div className="relative w-full" style={{ paddingTop: "129.4%" }}>
          {showFrame ? (
            <iframe
              src={`${RESUME_HREF}#view=FitH&toolbar=0&navpanes=0`}
              className="absolute inset-0 h-full w-full"
              title="Ali Tleis Resume"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                Loading preview…
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
