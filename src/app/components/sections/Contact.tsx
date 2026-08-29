"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { fadeUp } from "../../lib/animations";

export default function Contact() {
  return (
    <motion.section
      id="contact"
      className="relative z-10 mx-auto max-w-3xl px-6 py-32"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mb-10 flex items-center justify-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[var(--text-dim)]">
          06
        </span>
        <span className="block h-px w-10 bg-white/15" />
        <span className="section-eyebrow">Contact</span>
      </div>

      <div className="text-center">
        <h2 className="text-[2.25rem] font-light leading-[1.15] tracking-[-0.025em] text-white md:text-[2.75rem]">
          Get in touch<span className="text-[var(--accent-electric)]">.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.7] text-[var(--text-muted)]">
          I&apos;m always open to interesting conversations, collaborations, and
          opportunities. Reach out, I reply to everything.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href="mailto:tleis.a@northeastern.edu"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[14px] font-medium text-black transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.18)]"
          >
            <FaEnvelope className="text-[15px]" />
            <span>tleis.a@northeastern.edu</span>
          </a>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <a
            href="https://github.com/Alitleis123"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] text-white/75 transition-[border-color,background-color,color] duration-200 hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
          >
            <FaGithub className="text-[17px]" />
          </a>
          <a
            href="https://www.linkedin.com/in/ali-tleis-091800247/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] text-white/75 transition-[border-color,background-color,color] duration-200 hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
          >
            <FaLinkedin className="text-[17px]" />
          </a>
        </div>

        <p className="mt-8 inline-flex items-center justify-center gap-1.5 text-[12px] tracking-tight text-[var(--text-dim)]">
          <HiOutlineLocationMarker className="text-[13px]" />
          Boston, MA
        </p>
      </div>
    </motion.section>
  );
}
