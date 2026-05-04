"use client";

import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";

const NAV_SECTIONS = [
  { id: "about",    label: "About" },
  { id: "timeline", label: "Timeline" },
  { id: "stack",    label: "Stack" },
  { id: "resume",   label: "Resume" },
  { id: "contact",  label: "Contact" },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function NavBar() {
  const [active, setActive] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm text-white/60 md:flex">
        {NAV_SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`relative transition-colors duration-200 ${
              active === id ? "nav-link-active text-white" : "hover:text-white/90"
            }`}
          >
            {label}
          </a>
        ))}

        <span className="mx-1 h-4 w-px bg-white/10" />

        <a
          href={`${basePath}/resume/resume.pdf`}
          download
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition hover:bg-indigo-400"
        >
          <FaDownload className="text-[11px]" />
          Download Resume
        </a>
      </nav>

      <button
        type="button"
        className="flex flex-col justify-center gap-[5px] p-2 md:hidden"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle navigation menu"
      >
        <span className={`block h-[2px] w-5 origin-center bg-white/80 transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`block h-[2px] w-5 bg-white/80 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block h-[2px] w-5 origin-center bg-white/80 transition-all duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/95 p-4 text-sm md:hidden">
          {NAV_SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-4 py-2.5 transition ${
                active === id
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
          <a
            href={`${basePath}/resume/resume.pdf`}
            download
            onClick={() => setMenuOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            <FaDownload className="text-xs" />
            Download Resume
          </a>
        </div>
      )}
    </>
  );
}
