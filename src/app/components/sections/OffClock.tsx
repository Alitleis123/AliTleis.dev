"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { FaArrowUpRightFromSquare, FaMagnifyingGlassPlus } from "react-icons/fa6";
import { fadeUp, staggerParent, staggerChild } from "../../lib/animations";
import {
  offClockProfile,
  offClockFrames,
  offClockExtras,
  offClockNote,
} from "../../data";
import Lightbox, { type LightboxState } from "../Lightbox";

/** Everything openable, in the order it should read in the lightbox. */
const GALLERY = [
  { src: offClockProfile.src, alt: offClockProfile.alt },
  ...offClockFrames.map((f) => ({ src: f.src, alt: f.alt })),
  ...offClockExtras,
];

export default function OffClock() {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const openAt = (index: number) =>
    setLightbox({ images: GALLERY, index, title: "Off-clock" });

  return (
    <motion.section
      id="offclock"
      className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-32"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[var(--text-dim)]">
          05
        </span>
        <span className="block h-px w-10 bg-white/15" />
        <span className="section-eyebrow">Off-clock</span>
      </div>

      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-2xl text-[2rem] font-light leading-[1.15] tracking-[-0.025em] text-white md:text-[2.4rem]">
          Where the editing happens.
        </h2>
        <span className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-dim)]">
          {String(offClockFrames.length).padStart(2, "0")} FRAMES
        </span>
      </div>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10"
      >
        {/* Left: the write-up, then the project files it describes. */}
        <motion.div variants={staggerChild} className="lg:col-span-7">
          <p className="max-w-[54ch] text-[15px] leading-[1.75] text-[var(--text-muted)]">
            {offClockNote}
          </p>

          <div className="mt-9 grid grid-cols-3 gap-3">
            {offClockFrames.map((frame, i) => (
              <button
                key={frame.id}
                type="button"
                // +1 because the profile is the gallery's first image.
                onClick={() => openAt(i + 1)}
                className="group/f text-left"
                aria-label={`Open ${frame.label} full size`}
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-black/40 transition-colors duration-300 group-hover/f:border-[var(--border-soft)]">
                  <img
                    src={frame.src}
                    alt={frame.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover saturate-[0.7] brightness-[0.88] transition-[transform,filter] duration-500 group-hover/f:scale-[1.04] group-hover/f:saturate-100 group-hover/f:brightness-100"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/f:opacity-100">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white/90 backdrop-blur-md">
                      <FaMagnifyingGlassPlus className="text-[10px]" />
                    </span>
                  </span>
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)] transition-colors duration-200 group-hover/f:text-[var(--text-muted)]">
                  {frame.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right: the account, in the device it is actually read on. */}
        <motion.div
          variants={staggerChild}
          className="flex flex-col items-center lg:col-span-5 lg:-mt-6"
        >
          <Phone onOpen={() => openAt(0)} />

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              {offClockProfile.stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="tabular-figures text-[17px] font-medium tracking-tight text-white">
                    {s.value}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text-dim)]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* The link: an underline that draws itself rather than a button. */}
            <a
              href={offClockProfile.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/l relative inline-flex items-center gap-2 py-1 text-[13px] tracking-tight text-[var(--text-muted)] transition-colors duration-300 hover:text-white"
            >
              {offClockProfile.handle}
              <FaArrowUpRightFromSquare className="text-[10px] transition-transform duration-300 group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5" />
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-px w-0 bg-[var(--accent-electric)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/l:w-full"
              />
            </a>
          </div>
        </motion.div>
      </motion.div>

      <Lightbox
        state={lightbox}
        onClose={() => setLightbox(null)}
        onIndexChange={(i) => setLightbox((s) => (s ? { ...s, index: i } : s))}
      />
    </motion.section>
  );
}

/**
 * The device.
 *
 * This was CSS once: gradients pretending to be titanium, a div pretending to
 * be a dynamic island. It never read as a phone, because the things that sell
 * one are lens compression, a real specular falloff and a camera cutout with
 * actual depth, none of which a border-radius can do. It is now a generated
 * product render with the real screenshot composited onto the glass, cut out
 * to alpha so it sits on the page rather than in a panel.
 */
function Phone({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative flex w-full justify-center">
      {/* Pool of light behind the body, with no edges of its own. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 34% at 50% 44%, rgba(var(--signal-rgb),0.10), transparent 72%)",
        }}
      />

      <button
        type="button"
        onClick={onOpen}
        aria-label="Open the profile full size"
        className="group/p relative block w-[188px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 sm:w-[208px]"
      >
        <img
          src={offClockProfile.device}
          alt={offClockProfile.alt}
          loading="lazy"
          decoding="async"
          className="relative block w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.75)]"
        />

        <span className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center opacity-0 transition-opacity duration-300 group-hover/p:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-white backdrop-blur-md">
            <FaMagnifyingGlassPlus className="text-[10px]" />
            VIEW
          </span>
        </span>
      </button>
    </div>
  );
}
