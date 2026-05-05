"use client";

import { useEffect, useState } from "react";

const NAV_SECTIONS = [
  { id: "about",    label: "About" },
  { id: "projects", label: "Projects" },
  { id: "timeline", label: "Timeline" },
  { id: "stack",    label: "Stack" },
  { id: "resume",   label: "Resume" },
  { id: "contact",  label: "Contact" },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
      className={`fixed top-0 left-0 right-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-b border-[var(--border-hairline)] bg-[rgba(10,12,18,0.78)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#about"
          className="text-[15px] font-medium tracking-tight text-white/90 transition-colors duration-200 hover:text-white"
        >
          Ali Tleis
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 text-[13px] md:flex">
          {NAV_SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`transition-colors duration-200 ${
                active === id
                  ? "text-white"
                  : "text-white/55 hover:text-white/90"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href={`${basePath}/resume/resume.pdf`}
          download
          className="hidden rounded-full border border-[var(--border-soft)] bg-transparent px-4 py-1.5 text-[12.5px] font-medium tracking-tight text-white/85 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-white md:inline-flex"
        >
          Download Resume
        </a>

        <button
          type="button"
          className="flex flex-col justify-center gap-[5px] p-2 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          <span className={`block h-[1.5px] w-5 origin-center bg-white/80 transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block h-[1.5px] w-5 bg-white/80 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-[1.5px] w-5 origin-center bg-white/80 transition-all duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      {menuOpen ? (
        <div className="md:hidden">
          <div className="mx-4 mb-4 flex flex-col gap-1 rounded-2xl border border-[var(--border-soft)] bg-[rgba(10,12,18,0.95)] p-3 text-sm backdrop-blur-xl">
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
            <a
              href={`${basePath}/resume/resume.pdf`}
              download
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-center text-sm font-medium text-white/90 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04]"
            >
              Download Resume
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
