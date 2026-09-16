"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LuArrowRight, LuClapperboard } from "react-icons/lu";
import { withBasePath } from "../data";
import { fadeUp } from "../lib/animations";

/**
 * The way into the editing suite, in the body of the page.
 *
 * The nav carries a link to it, but a link in a bar full of other links is
 * something you notice only if you are already looking. This sits directly
 * under the hero, early enough that anyone who scrolls at all will meet it,
 * and it shows a real screenshot so the offer is legible before you commit a
 * click to it.
 *
 * Deliberately not a full section with its own number in the 01 to 07
 * sequence. It is a door, not a chapter, so it stays slimmer than the
 * sections around it and does not take a heading of the same weight.
 */
export default function StudioInvite() {
  return (
    <motion.section
      className="relative z-10 mx-auto max-w-6xl px-6 py-10"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Link
        href="/studio"
        className="group grid gap-6 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 transition-[border-color,background-color] duration-300 hover:border-[var(--signal-dim)] hover:bg-[var(--surface-2)] sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center sm:p-6"
      >
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[var(--signal)]">
            <LuClapperboard aria-hidden className="text-[13px]" />
            Same work, different interface
          </span>

          <h2 className="mt-3 text-[var(--step-3)] font-light leading-[1.1] tracking-[-0.03em] text-white">
            See this as an editing suite.
          </h2>

          <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.7] text-[var(--text-muted)]">
            The same portfolio built as the software I edit in. Every section is
            a composition on one timeline, so you can scrub between them, open
            the notes on any project, or press play and let it walk you through
            the whole thing.
          </p>

          <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium tracking-tight text-white">
            Open the editing suite
            <LuArrowRight
              aria-hidden
              className="text-[14px] transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>

        {/* A real capture of the route, so the door shows the room. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-black">
          <Image
            src={withBasePath("/switch/studio.webp")}
            alt="The portfolio rendered as a video editor, with a composition viewer and a scrubbable timeline"
            fill
            sizes="(min-width: 640px) 260px, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          />
        </div>
      </Link>
    </motion.section>
  );
}
