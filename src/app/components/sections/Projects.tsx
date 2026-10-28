"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, type ComponentType } from "react";
import {
  FaChrome,
  FaGithub,
  FaArrowUpRightFromSquare,
  FaMagnifyingGlassPlus,
  FaChevronDown,
  FaStar,
  FaUsers,
} from "react-icons/fa6";
import { TbCalculator, TbCalendarEvent, TbHome, TbPuzzle } from "react-icons/tb";
import { SiCplusplus } from "react-icons/si";
import { COVER_MAP } from "../../lib/projectCovers";
import { fadeUp, staggerParent, staggerChild } from "../../lib/animations";
import { featuredProjects, otherWork, type Project } from "../../data";
import Lightbox, { type LightboxState } from "../Lightbox";

type IconCmp = ComponentType<{ className?: string }>;

const METRIC_ICON: Record<string, IconCmp> = {
  users: FaUsers,
  star: FaStar,
};

const OTHER_ICON: Record<string, IconCmp> = {
  calculator: TbCalculator,
  calendar: TbCalendarEvent,
  cplusplus: SiCplusplus,
  home: TbHome,
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
      </div>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        // Collapsed cards stretch to the taller one in their row, so a longer
        // description does not leave the pair uneven. While any card's notes
        // are mounted, closing animation included, they all size to their own
        // content, or the open card would drag the one beside it down with it.
        className="grid grid-cols-1 gap-5 md:grid-cols-2 [&:has([data-build-notes])]:items-start"
      >
        {featuredProjects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onOpenGallery={() => openLightbox(p, 0)}
          />
        ))}
      </motion.div>

      {/* Other Work */}
      <div className="mt-24">
        <div className="mb-8 flex items-center gap-3 text-[13px] font-medium text-[var(--text-dim)]">
          <span>Other work</span>
          <span className="block h-px flex-1 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {otherWork.map((p) => {
            const Icon = p.iconKey ? OTHER_ICON[p.iconKey] : null;
            return (
              <div
                key={p.id}
                className="surface-lift group relative flex items-center gap-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-soft)] hover:bg-[var(--surface-2)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-2)] text-white/85 transition-colors duration-200 group-hover:text-white">
                  {Icon ? <Icon className="text-[22px]" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    {/* Links can't nest. The title stretches over the card
                        (.card-link), and the store icon sits above it. */}
                    <a
                      href={p.repo ?? p.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link text-[15px] font-medium tracking-tight text-white"
                    >
                      {p.title}
                    </a>
                    <span className="flex items-center gap-3">
                      {p.store ? (
                        <a
                          href={p.store}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${p.title} on the Chrome Web Store`}
                          title="Chrome Web Store"
                          className="relative z-10 -m-1.5 p-1.5 text-white/45 transition-colors duration-200 group-hover:text-white"
                        >
                          <FaChrome className="text-[14px]" />
                        </a>
                      ) : null}
                      {p.repo ? (
                        <FaGithub className="text-[14px] text-white/45 transition-colors duration-200 group-hover:text-white" />
                      ) : (
                        <FaArrowUpRightFromSquare className="text-[12px] text-white/45 transition-colors duration-200 group-hover:text-white" />
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--text-dim)]">
                    <span>{p.range}</span>
                    {p.tech?.length ? (
                      <>
                        <span className="text-[var(--text-faint)]">·</span>
                        <span className="text-white/70">{p.tech.join(" · ")}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
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
    <div className="flex items-center gap-3 text-[12px] font-medium text-[var(--text-dim)]">
      <span>{children}</span>
      <span className="block h-px flex-1 bg-white/10" />
    </div>
  );
}

function ProjectCard({
  project,
  onOpenGallery,
}: {
  project: Project;
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
              <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[12px] font-medium text-white/85 backdrop-blur-md">
                {galleryCount} screens
              </span>
            ) : null}

            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">
                <FaMagnifyingGlassPlus className="text-[11px]" />
                View screens
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
            <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[12px] font-medium text-white/85 backdrop-blur-md">
              1 of {galleryCount}
            </span>
          ) : null}

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">
              <FaMagnifyingGlassPlus className="text-[11px]" />
              Expand
            </span>
          </span>
        </button>
      ) : null}

      <div className="relative flex flex-1 flex-col gap-4 p-6">
        {/* Header rail */}
        <div className="flex items-center justify-between gap-3 text-[13px] text-[var(--text-dim)]">
          <span>{project.range}</span>
          {isComing ? (
            <span className="rounded-full border border-[var(--border-hairline)] px-2.5 py-1 text-[12px] font-medium">
              Soon
            </span>
          ) : null}
        </div>

        {/* Identity

            A fixed min-height, so both descriptions in a row start on the
            same line whether or not a card has a subtitle or metrics. */}
        <div className="min-h-[4.15rem]">
          <h3 className="text-[19px] font-medium leading-tight tracking-tight text-white md:text-[21px]">
            {project.title}
          </h3>
          {/* Metrics share the subtitle's line, so a card that has them
              stays the height of the one beside it. In the narrow two-column
              range the words would wrap that line, so only the icon and the
              number show there, and the label moves to the tooltip. */}
          {project.subtitle || project.metrics?.length ? (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {project.subtitle ? (
                <span className="text-[13px] text-[var(--text-muted)]">
                  {project.subtitle}
                </span>
              ) : null}
              {project.metrics?.map((m) => {
                const Icon = m.icon ? METRIC_ICON[m.icon] : null;
                return (
                  <span
                    key={m.label}
                    title={`${m.value} ${m.label}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(var(--signal-rgb),0.28)] bg-[rgba(var(--signal-rgb),0.07)] px-2.5 py-0.5 text-[12px]"
                  >
                    {Icon ? <Icon aria-hidden className="text-[11px] text-[var(--signal)]" /> : null}
                    <span className="tabular-figures font-medium text-white">{m.value}</span>
                    <span className="text-[var(--text-muted)] md:max-xl:sr-only">{m.label}</span>
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Description, in full. The grid evens out the row instead. */}
        <p className="min-h-[2.75rem] text-[13px] leading-[1.7] text-[var(--text-muted)]">
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
              <span className="text-[13px] text-[var(--text-dim)] transition-colors duration-200 group-hover/det:text-[var(--text-muted)]">
                How it was built
              </span>
              <span className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors duration-200 group-hover/det:border-[var(--border-soft)] group-hover/det:bg-[var(--surface-2)] group-hover/det:text-white">
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
                  data-build-notes
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
                              className="rounded-full border border-[var(--border-hairline)] bg-white/[0.02] px-2.5 py-0.5 text-[12px] tracking-tight text-white/80"
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
                  {/* Every one of these is the project's own site, not a
                      sandbox, so "demo" promised something it was not. */}
                  Website
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
