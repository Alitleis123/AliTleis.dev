"use client";

import { useEffect, useState } from "react";
import { RESUME_HREF } from "../data";
import Link from "next/link";
import { LuClapperboard } from "react-icons/lu";
import ViewSwitch from "./ViewSwitch";

const NAV_SECTIONS = [
  { id: "about",    label: "About" },
  { id: "projects", label: "Projects" },
  { id: "timeline", label: "Timeline" },
  { id: "stack",    label: "Stack" },
  { id: "offclock", label: "Off-clock" },
  { id: "resume",   label: "Resume" },
  { id: "contact",  label: "Contact" },
];

export default function NavBar() {
  const [active, setActive] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      /* A background at every scroll position, not only once you have moved.

         This bar runs the full width of the window while every other thing on
         the page sits in a centred 1104px column, so its right hand controls
         ended 163px outside everything else with nothing behind them, floating
         on the starfield. Edge to edge is only legible as chrome if it looks
         like chrome. It still darkens on scroll, just from something rather
         than from nothing. */
      className={`fixed top-0 left-0 right-0 z-30 border-b backdrop-blur-xl transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-[var(--border-hairline)] bg-[rgba(10,10,11,0.86)]"
          : "border-[rgba(255,255,255,0.055)] bg-[rgba(10,10,11,0.55)]"
      }`}
    >
      {/* Full width and px-3, the same as the studio's top bar, so the view
          switch lands on identical coordinates on both routes. As a centred
          max-w-6xl band this bar put the switch 424px further left and 8px
          higher than the studio's, so moving between the two views made the
          one control common to both jump across the screen.

          Three flex groups rather than a centred overlay.

          The section nav used to be absolutely positioned and translated to
          the centre, which meant it reserved no width in this row, so it ran
          straight under the right hand controls: 152px of overlap at 768 and
          24px at 1024, before anything was added to the bar. In flow the
          browser keeps them apart, at the cost of the links no longer being
          pixel centred.

          Everything steps at lg rather than md now. Below that the row cannot
          hold seven links plus two buttons plus the switch, so the menu takes
          over, which is also where the links were legible anyway. */}
      <div className="relative flex items-center justify-between gap-4 px-3 py-2">
        <a
          href="#about"
          className="shrink-0 text-[15px] font-medium tracking-tight text-white/90 transition-colors duration-200 hover:text-white"
        >
          Ali Tleis
        </a>

        <nav className="hidden items-center gap-6 text-[13px] lg:flex">
          {NAV_SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`whitespace-nowrap transition-colors duration-200 ${
                active === id
                  ? "text-white"
                  : "text-white/55 hover:text-white/90"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {/* Opens the palette via a window event rather than lifted state,
              the two components share nothing else. */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            aria-label="Ask AI about this site"
            className="ai-pill relative hidden items-center gap-2 rounded-full border border-[var(--border-hairline)] px-3.5 py-1.5 text-[12px] text-white/70 transition-colors duration-200 hover:bg-white/[0.03] hover:text-white lg:inline-flex"
          >
            Ask AI
            <kbd className="rounded border border-[var(--border-hairline)] px-1 font-mono text-[10px] tracking-wider text-[var(--text-faint)]">
              ⌘K
            </kbd>
          </button>

          <a
            href={RESUME_HREF}
            download
            /* Filled, matching the hero's LinkedIn button, because three
               outlined pills of the same weight gave the eye nothing to land
               on and the widest of them was the least important. */
            className="hidden whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-[13px] font-medium tracking-tight text-black transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.16)] lg:inline-flex"
          >
            Download Resume
          </a>

          {/* Last, because it is last in the studio's bar. Same control, same
              corner, same pixels. */}
          <div className="hidden lg:block">
            <ViewSwitch tone="document" />
          </div>

        <button
          type="button"
          className="flex flex-col justify-center gap-[5px] p-2 lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          <span className={`block h-[1.5px] w-5 origin-center bg-white/80 transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block h-[1.5px] w-5 bg-white/80 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-[1.5px] w-5 origin-center bg-white/80 transition-all duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="lg:hidden">
          <div className="mx-4 mb-4 flex flex-col gap-1 rounded-2xl border border-[var(--border-soft)] bg-[rgba(16,16,18,0.96)] p-3 text-sm backdrop-blur-xl">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-2.5 transition-colors duration-200 ${
                  active === id
                    ? "bg-white/[0.06] text-white"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.dispatchEvent(new Event("open-command-palette"));
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium text-white/90 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04]"
            >
              Ask AI
            </button>

            <a
              href={RESUME_HREF}
              download
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-center text-sm font-medium text-white/90 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04]"
            >
              Download Resume
            </a>

            {/* Without this a phone on the reading view has no route back to
                the editing suite, since the switcher above is desktop only. */}
            <Link
              href="/studio"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-center text-sm font-medium text-white/90 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04]"
            >
              <LuClapperboard aria-hidden />
              Editing suite
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
