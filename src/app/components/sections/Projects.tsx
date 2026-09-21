"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, type ComponentType } from "react";
import {
  FaChrome,
  FaGithub,
  FaArrowUpRightFromSquare,
  FaMagnifyingGlassPlus,
  FaChevronDown,
} from "react-icons/fa6";
import { TbCalculator, TbCalendarEvent, TbPuzzle } from "react-icons/tb";
import { SiCplusplus } from "react-icons/si";
import { COVER_MAP } from "../../lib/projectCovers";
import { fadeUp, staggerParent, staggerChild } from "../../lib/animations";
import { featuredProjects, otherWork, type Project } from "../../data";
import Lightbox, { type LightboxState } from "../Lightbox";

type IconCmp = ComponentType<{ className?: string }>;

const OTHER_ICON: Record<string, IconCmp> = {
  calculator: TbCalculator,
  calendar: TbCalendarEvent,
  cplusplus: SiCplusplus,
  puzzle: TbPuzzle,
};

export default function Projects() {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const openLightbox = useCallback(
    (project: Project, startIndex = 0) => {
      if (!project.gallery?.length) return;
      setLightbox({
        images: project.gallery,
        index: startIndex,
        title: project.title,
      });
    },
    [],
  );

  return (
    <motion.section
      id="projects"
      className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-32"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[var(--text-dim)]">
          02
        </span>
        <span className="block h-px w-10 bg-white/15" />
        <span className="section-eyebrow">Projects</span>
      </div>

      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-2xl text-[2rem] font-light leading-[1.15] tracking-[-0.025em] text-white md:text-[2.4rem]">
          Featured work.
        </h2>
        <span className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-dim)]">
          {String(featuredProjects.length).padStart(2, "0")} PROJECTS
        </span>
      </div>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        // items-start, so expanding one card no longer stretches the one
        // beside it, since grid rows default to equal height and the sibling was
        // growing to match.
        className="grid grid-cols-1 items-start gap-5 md:grid-cols-2"
      >
        {featuredProjects.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={i + 1}
            onOpenGallery={() => openLightbox(p, 0)}
          />
        ))}
      </motion.div>

      {/* Other Work */}
      <div className="mt-24">
        <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
          <span>Other work</span>
          <span className="block h-px flex-1 bg-white/10" />
          <span>{String(otherWork.length).padStart(2, "0")}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {otherWork.map((p) => {
            const Icon = p.iconKey ? OTHER_ICON[p.iconKey] : null;
            return (
              <a
                key={p.id}
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="surface-lift group flex items-center gap-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-soft)] hover:bg-[var(--surface-2)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-2)] text-white/85 transition-colors duration-200 group-hover:text-white">
                  {Icon ? <Icon className="text-[22px]" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-medium tracking-tight text-white">
                      {p.title}
                    </span>
                    <FaGithub className="text-[14px] text-white/45 transition-colors duration-200 group-hover:text-white" />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-[0.18em] text-[var(--text-dim)]">
                    <span>{p.range.toUpperCase()}</span>
                    {p.tech?.length ? (
                      <>
                        <span className="text-[var(--text-faint)]">·</span>
                        <span className="text-white/70">{p.tech.join(" · ")}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <Lightbox state={lightbox} onClose={() => setLightbox(null)} onIndexChange={(i) => setLightbox((s) => (s ? { ...s, index: i } : s))} />
    </motion.section>
  );
}

/** Small section rule inside an expanded card. */
function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-dim)]">
      <span>{children}</span>
      <span className="block h-px flex-1 bg-white/10" />
    </div>
  );
}

function ProjectCard({
  project,
  index,
  onOpenGallery,
}: {
  project: Project;
  index: number;
  onOpenGallery: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isComing = project.comingSoon;
  const hero = project.gallery?.[0];
  const galleryCount = project.gallery?.length ?? 0;
  const Cover = project.coverKey ? COVER_MAP[project.coverKey] : null;
  const hasClickableGallery = !!project.gallery?.length;

  return (
    <motion.div
      variants={staggerChild}
      className="surface-lift group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] transition-[border-color,background-color,box-shadow] duration-300 hover:border-[var(--border-soft)] hover:bg-[var(--surface-2)] hover:shadow-[0_0_60px_rgba(var(--signal-rgb),0.06)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(70% 60% at 100% 0%, rgba(var(--signal-rgb),0.06), transparent 60%)",
        }}
      />

      {/* Cover area, custom SVG cover takes precedence over screenshot hero.
          If a gallery exists, the cover is clickable to open the lightbox of real screenshots. */}
      {Cover ? (
        hasClickableGallery ? (
          <button
            type="button"
            onClick={onOpenGallery}
            className="group/hero relative block aspect-[16/9] w-full overflow-hidden border-b border-[var(--border-hairline)] bg-black/40"
            aria-label={`Open ${project.title} gallery`}
          >
            <div className="absolute inset-0 transition-transform duration-500 group-hover/hero:scale-[1.02]">
              <Cover />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/hero:bg-black/25" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />

            <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/90 backdrop-blur-md transition-[border-color,background-color,transform] duration-200 group-hover/hero:scale-110 group-hover/hero:border-white/40 group-hover/hero:bg-black/75">
              <FaMagnifyingGlassPlus className="text-[12px]" />
            </span>

            {galleryCount > 1 ? (
              <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] text-white/85 backdrop-blur-md">
                {String(galleryCount).padStart(2, "0")} SCREENS
              </span>
            ) : null}

            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.22em] text-white backdrop-blur-md">
                <FaMagnifyingGlassPlus className="text-[11px]" />
                VIEW SCREENS
              </span>
            </span>
          </button>
        ) : (
          <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-[var(--border-hairline)] bg-black/40">
            <Cover />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />
          </div>
        )
      ) : hero ? (
        <button
          type="button"
          onClick={onOpenGallery}
          className="group/hero relative block aspect-[16/9] w-full overflow-hidden border-b border-[var(--border-hairline)] bg-black/40"
          aria-label={`Open ${project.title} gallery`}
        >
          <img
            src={hero.src}
            alt={hero.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-500 group-hover/hero:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/hero:bg-black/30" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />

          <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/90 backdrop-blur-md transition-[border-color,background-color,transform] duration-200 group-hover/hero:scale-110 group-hover/hero:border-white/40 group-hover/hero:bg-black/75">
            <FaMagnifyingGlassPlus className="text-[12px]" />
          </span>

          {galleryCount > 1 ? (
            <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] text-white/85 backdrop-blur-md">
              01 / {String(galleryCount).padStart(2, "0")}
            </span>
          ) : null}

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.22em] text-white backdrop-blur-md">
              <FaMagnifyingGlassPlus className="text-[11px]" />
              EXPAND
            </span>
          </span>
        </button>
      ) : null}

      <div className="relative flex flex-1 flex-col gap-4 p-6">
        {/* Header rail */}
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.22em] text-[var(--text-dim)]">
          <div className="flex items-center gap-3">
            <span>P/{String(index).padStart(2, "0")}</span>
            <span className="block h-px w-8 bg-white/15" />
            <span>{project.range.toUpperCase()}</span>
          </div>
          {isComing ? (
            <span className="rounded-full border border-[var(--border-hairline)] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em]">
              Soon
            </span>
          ) : null}
        </div>

        {/* Identity

            Fixed min-heights rather than grid stretch. Equal-height rows would
            make an expanding card drag its neighbour taller again; reserving
            space for a two-line title, an optional subtitle and a two-line
            description keeps every collapsed card identical on its own. */}
        <div className="min-h-[4.15rem]">
          <h3 className="text-[19px] font-medium leading-tight tracking-tight text-white md:text-[21px]">
            {project.title}
          </h3>
          {project.subtitle ? (
            <div className="mt-1 text-[13px] text-[var(--text-muted)]">
              {project.subtitle}
            </div>
          ) : null}
        </div>

        {/* Description, clamped so a long one cannot outgrow a short one. */}
        <p className="line-clamp-2 min-h-[2.75rem] text-[13px] leading-[1.7] text-[var(--text-muted)]">
          {project.desc}
        </p>

        {/* Build notes, the per-project write-ups already in data.ts, which
            were never rendered. Collapsed by default so the grid stays scannable,
            and numbered to match the timeline's expanded list. */}
        {project.bullets?.length ? (
          <div className="flex flex-col">
            {/* Same affordance as the timeline: one full-width control, a
                labelled pill on the right, rotating chevron. Two different
                disclosure patterns on one page taught the reader nothing. */}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="group/det -mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-dim)] transition-colors duration-200 group-hover/det:text-[var(--text-muted)]">
                How it was built
                <span className="text-[var(--text-faint)]">
                  {String(project.bullets.length).padStart(2, "0")}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors duration-200 group-hover/det:border-[var(--border-soft)] group-hover/det:bg-[var(--surface-2)] group-hover/det:text-white">
                {open ? "Less" : "More"}
                <motion.span
                  aria-hidden
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex"
                >
                  <FaChevronDown className="text-[10px]" />
                </motion.span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 flex flex-col gap-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--background)] p-4">
                    <div>
                      <PanelLabel>How it was built</PanelLabel>
                      <ul className="max-w-[62ch] text-[13px] leading-[1.75] text-[var(--text-muted)]">
                    {project.bullets.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.08 + i * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="group/row flex gap-4 border-t border-[var(--border-hairline)] py-3 first:border-t-0"
                      >
                        <span
                          aria-hidden
                          className="tabular-figures mt-[3px] shrink-0 font-mono text-[10px] tracking-[0.16em] text-[var(--text-faint)] transition-colors duration-200 group-hover/row:text-[var(--accent-electric)]"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{b}</span>
                      </motion.li>
                    ))}
                      </ul>
                    </div>

                    {project.tech?.length ? (
                      <div>
                        <PanelLabel>Stack</PanelLabel>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-[var(--border-hairline)] bg-white/[0.02] px-2.5 py-0.5 text-[11px] tracking-tight text-white/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}

        {/* Footer: tech + links */}
        <div className="mt-auto flex flex-col gap-5 pt-1">
          {!isComing && (project.demo || project.store || project.repo) ? (
            <div className="flex flex-wrap gap-2">
              {project.demo ? (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-medium text-black transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.18)]"
                >
                  <FaArrowUpRightFromSquare className="text-[10px]" />
                  Live Demo
                </a>
              ) : null}
              {/* Where to install it, which is a different errand from the
                  demo: one shows you the thing, the other puts it in your
                  browser. */}
              {project.store ? (
                <a
                  href={project.store}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] px-4 py-2 text-[12px] font-medium text-white/85 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  <FaChrome className="text-[12px]" />
                  Chrome Web Store
                </a>
              ) : null}
              {project.repo ? (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] px-4 py-2 text-[12px] font-medium text-white/85 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  <FaGithub className="text-[12px]" />
                  GitHub
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
