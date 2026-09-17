"use client";

import { LuArrowDownToLine } from "react-icons/lu";
import { RESUME_HREF } from "../data";

/**
 * The resume download, as a standing control rather than a nav button.
 *
 * It used to sit in the top bar, where it was the widest thing in a row that
 * also had to hold seven section links, Ask AI and the view switch, and where
 * it stopped the section links from being centred. Down here it is the only
 * thing in the corner, so it can be the one filled control on the page and
 * still leave the bar to navigation.
 *
 * Accent filled on purpose. Every other floating control on this route is an
 * outlined pill on black, so the one action a recruiter came for should not
 * look like another utility.
 */
export default function ResumeButton() {
  return (
    <a
      href={RESUME_HREF}
      download
      aria-label="Download resume, PDF"
      className="group fixed bottom-6 right-6 z-50 inline-flex h-11 items-center gap-2.5 rounded-full bg-[var(--accent-electric)] px-4 text-[13px] font-semibold tracking-tight text-[#2a1a02] shadow-[0_10px_30px_-8px_rgba(var(--signal-rgb),0.55)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(var(--signal-rgb),0.7)] focus-visible:-translate-y-0.5"
    >
      {/* Nudges down on hover, which is the direction the file is going. */}
      <LuArrowDownToLine
        aria-hidden
        className="text-[16px] transition-transform duration-300 group-hover:translate-y-0.5"
      />
      Resume
      <span className="text-[11px] font-medium opacity-60">PDF</span>
    </a>
  );
}
