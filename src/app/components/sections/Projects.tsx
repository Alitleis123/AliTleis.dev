"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import {
  FaGithub,
  FaArrowUpRightFromSquare,
  FaChevronLeft,
  FaChevronRight,
  FaXmark,
  FaMagnifyingGlassPlus,
  FaChevronDown,
} from "react-icons/fa6";
import { TbCalculator, TbPuzzle } from "react-icons/tb";
import { SiCplusplus } from "react-icons/si";
import { fadeUp, staggerParent, staggerChild } from "../../lib/animations";
import { featuredProjects, otherWork, type Project } from "../../data";
import EternalReverseCover from "../projectCovers/EternalReverseCover";
import Eternal2xCover from "../projectCovers/Eternal2xCover";
import TopChoiceRealtyCover from "../projectCovers/TopChoiceRealtyCover";
import EternalSummaryCover from "../projectCovers/EternalSummaryCover";

type IconCmp = ComponentType<{ className?: string }>;

const OTHER_ICON: Record<string, IconCmp> = {
  calculator: TbCalculator,
  cplusplus: SiCplusplus,
  puzzle: TbPuzzle,
};

const COVER_MAP: Record<string, ComponentType> = {
  eternalReverse: EternalReverseCover,
  eternal2x: Eternal2xCover,
  topChoiceRealty: TopChoiceRealtyCover,
  eternalSummary: EternalSummaryCover,
};

type LightboxState = {
  images: { src: string; alt: string }[];
  index: number;
  title: string;
} | null;

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
        // beside it — grid rows default to equal height and the sibling was
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

      {/* Cover area — custom SVG cover takes precedence over screenshot hero.
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

        {/* Description — clamped so a long one cannot outgrow a short one. */}
        <p className="line-clamp-2 min-h-[2.75rem] text-[13px] leading-[1.7] text-[var(--text-muted)]">
          {project.desc}
        </p>

        {/* Build notes — the per-project write-ups already in data.ts, which
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
          {!isComing && (project.demo || project.repo) ? (
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

function Lightbox({
  state,
  onClose,
  onIndexChange,
}: {
  state: LightboxState;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = !!state;
  const total = state?.images.length ?? 0;

  const prev = useCallback(() => {
    if (!state) return;
    onIndexChange((state.index - 1 + total) % total);
  }, [state, total, onIndexChange]);

  const next = useCallback(() => {
    if (!state) return;
    onIndexChange((state.index + 1) % total);
  }, [state, total, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, prev, next]);

  return (
    <AnimatePresence>
      {open && state ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-white/85">
              <span>{state.title.toUpperCase()}</span>
              <span className="text-white/40">·</span>
              <span>
                {String(state.index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-white/35 hover:bg-white/[0.10] hover:text-white"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>

          {/* Prev */}
          {total > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-white/35 hover:bg-white/[0.10] hover:text-white sm:left-6"
            >
              <FaChevronLeft className="text-[14px]" />
            </button>
          ) : null}

          {/* Image */}
          <motion.div
            key={state.images[state.index].src}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[72vh] max-w-[78vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={state.images[state.index].src}
              alt={state.images[state.index].alt}
              decoding="async"
              className="max-h-[72vh] max-w-[78vw] rounded-2xl border border-white/10 object-contain shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            />
            <div className="mt-3 max-w-[60ch] text-center text-[12px] tracking-tight text-white/70">
              {state.images[state.index].alt}
            </div>
          </motion.div>

          {/* Next */}
          {total > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-white/35 hover:bg-white/[0.10] hover:text-white sm:right-6"
            >
              <FaChevronRight className="text-[14px]" />
            </button>
          ) : null}

          {/* Thumbnail strip */}
          {total > 1 ? (
            <div className="absolute inset-x-0 bottom-5 flex justify-center">
              <div
                className="flex max-w-[92vw] gap-2 overflow-x-auto rounded-full border border-white/10 bg-black/55 px-2 py-2 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                {state.images.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => onIndexChange(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border transition-all duration-200 ${
                      i === state.index
                        ? "border-white/70 ring-1 ring-white/40"
                        : "border-white/10 opacity-55 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
