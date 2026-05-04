"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaMapMarkerAlt } from "react-icons/fa";
import { fadeUp } from "../../lib/animations";
import { withBasePath } from "../../data";

export default function Contact() {
  return (
    <motion.section
      id="contact"
      className="relative z-10 mx-auto max-w-6xl px-6 py-24"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="rounded-3xl border border-white/10 bg-[#0d0f18]/90 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="section-title bg-gradient-to-r from-indigo-400 via-zinc-200 to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
              Let&apos;s Connect
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-300">
              If you&apos;d like to reach out about opportunities, projects, or
              anything else, feel free to get in touch.
            </p>

            <blockquote className="mt-6 border-l-2 border-indigo-500/50 pl-4">
              <p className="text-sm italic text-zinc-400">
                &ldquo;Make it work, make it right, make it fast.&rdquo;
              </p>
              <cite className="mt-1 block text-xs not-italic text-zinc-600">
                — Kent Beck
              </cite>
            </blockquote>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="mailto:tleis.a@northeastern.edu"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                <FaEnvelope className="text-base" />
                Email Me
              </a>
              <a
                href={withBasePath("/resume/resume.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-6 py-3 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/30"
              >
                <FaDownload className="text-sm" />
                View Resume
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/70 via-black/40 to-black/20 p-6 shadow-[inset_0_0_30px_rgba(99,102,241,0.08)]">
            <div className="space-y-5">
              <div>
                <span className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Email
                </span>
                <a
                  href="mailto:tleis.a@northeastern.edu"
                  className="mt-1.5 inline-flex items-center gap-2 text-base font-medium text-white transition hover:text-indigo-200"
                >
                  <FaEnvelope className="text-sm text-zinc-400" />
                  tleis.a@northeastern.edu
                </a>
              </div>

              <div className="h-px w-full bg-white/5" />

              <div>
                <span className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Location
                </span>
                <p className="mt-1.5 inline-flex items-center gap-2 text-base font-medium text-white">
                  <FaMapMarkerAlt className="text-sm text-zinc-400" />
                  Boston, MA
                </p>
              </div>

              <div className="h-px w-full bg-white/5" />

              <div>
                <span className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Socials
                </span>
                <div className="mt-3 flex gap-3">
                  <a
                    href="https://github.com/Alitleis123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <FaGithub className="text-lg" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ali-tleis-091800247/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <FaLinkedin className="text-lg" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
