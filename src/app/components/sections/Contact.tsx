"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
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
      {/* Decorative separator */}
      <div className="mx-auto mb-16 flex w-full max-w-md items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <span
          className="block h-1.5 w-1.5 rounded-full"
          style={{
            background: "rgba(99,102,241,0.65)",
            boxShadow: "0 0 14px rgba(99,102,241,0.55)",
          }}
          aria-hidden
        />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </div>

      <div className="text-center">
        <h2 className="section-heading">Get in touch.</h2>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-[1.7] text-[var(--text-muted)]">
          I&apos;m always open to interesting conversations, collaborations, and
          opportunities. Reach out, I reply to everything.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href="mailto:tleis.a@northeastern.edu"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[14.5px] font-medium text-black transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.18)]"
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

        <p className="mt-8 text-[12px] tracking-tight text-[var(--text-dim)]">
          Boston, MA
        </p>
      </div>
    </motion.section>
  );
}
