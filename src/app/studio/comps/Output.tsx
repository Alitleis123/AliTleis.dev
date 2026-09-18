"use client";

import Image from "next/image";
import Plate from "./Plate";
import { useState } from "react";
import {
  LuArrowUpRight,
  LuCheck,
  LuCopy,
  LuGithub,
  LuLinkedin,
  LuMail,
  LuMapPin,
} from "react-icons/lu";
import { LOCATION, RESUME_HREF, socials, withBasePath } from "../../data";

/**
 * Resume as the render queue. One output, one format, one action.
 *
 * The output frame is on screen rather than described. A four row table
 * floating in an otherwise empty stage left about two thirds of the frame
 * blank and asked a recruiter to take the file on trust, when the page itself
 * is the single most useful thing this comp can show.
 *
 * resume-page.webp is a render of page one of the PDF. Regenerate it whenever
 * the resume changes:
 *   qlmanage -t -s 1600 -o /tmp public/resume/resume.pdf
 * then resize to 900px wide and save as public/studio/resume-page.webp.
 */
export function DocPanel() {
  return (
    <div className="st-seq relative flex h-full min-h-full flex-col px-[4%] py-[3%]">
      {/* Less scrim than the others carry. The rendered page is a large white
          rectangle, and next to it a plate at 0.6 reads as flat black however
          much is actually behind the wash. */}
      <Plate src="plate-resume.webp" />

      <span className="st-eyebrow relative shrink-0">Render queue</span>

      <div className="relative mt-4 grid min-h-0 flex-1 gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-center">
        {/* The rendered page. A white plate in a dark application is exactly
            what an output frame looks like, so it is framed rather than
            tinted to blend in. */}
        <a
          href={RESUME_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative mx-auto block h-full max-h-full w-auto overflow-hidden rounded-[3px] border border-[var(--st-line-strong)] bg-white shadow-[0_28px_70px_-24px_rgba(0,0,0,0.92)] transition-colors duration-200 hover:border-[var(--st-sel-line)]"
        >
          <Image
            src={withBasePath("/studio/resume-page.webp")}
            alt="Page one of Ali Tleis's resume"
            width={900}
            height={1165}
            sizes="(min-width: 1024px) 46vh, 90vw"
            className="h-full max-h-full w-auto object-contain"
          />
          <span className="st-label absolute right-2 top-2 rounded-[2px] bg-black/75 px-1.5 py-1 text-[rgba(244,244,241,0.85)]">
            Page 1 of 1
          </span>
        </a>

        <div className="min-w-0">
          <div className="rounded-[3px] border border-[var(--st-line-strong)]">
            <div className="flex items-center gap-3 border-b border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2">
              <span className="st-label">Output module</span>
              <span className="st-tc ml-auto flex items-center gap-1.5 text-[10px] text-[var(--st-audio)]">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-[var(--st-audio)]"
                />
                Ready
              </span>
            </div>
            {[
              ["File", "resume.pdf"],
              ["Format", "PDF, single page"],
              ["Includes", "Experience, education, stack, clearance"],
              ["Updated", "Cache busted by content hash"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline gap-4 border-b border-[var(--st-line)] px-3 py-2.5 last:border-b-0"
              >
                <span className="st-label w-[92px] shrink-0">{k}</span>
                <span className="text-[13.5px] tracking-[-0.01em] text-[rgba(244,244,241,0.9)]">
                  {v}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <a
              href={RESUME_HREF}
              download
              className="st-btn-play px-4 text-[12px] font-medium tracking-[-0.01em]"
            >
              Download PDF
            </a>
            <a
              href={RESUME_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="st-btn px-3 text-[11px]"
            >
              Open in a tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Contact as the end card. Nothing after this, so it holds the frame. */
export function EndCard() {
  return (
    <div className="st-seq relative flex h-full min-h-full flex-col justify-center px-[6%] py-[6%]">
      {/* The last frame of the reel, so the end card has something behind it
          rather than ending on flat panel grey. */}
      <div aria-hidden className="st-plate absolute inset-0 overflow-hidden">
        <Image
          src={withBasePath("/studio/stage-end.webp")}
          alt=""
          fill
          sizes="100vw"
          className="st-drift object-cover"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-[var(--st-stage)] via-[var(--st-stage)]/85 to-transparent" />
      </div>

      <span className="st-eyebrow relative">End card</span>
      <h2 className="st-h relative mt-5">
        Open to co-op
        <br />
        and project work.
      </h2>

      {/* Three ways to take an address, because people want different ones.
          The glyph opens it, the text itself can be selected and copied by
          hand, and the button on the right puts it on the clipboard. */}
      <div className="relative mt-8 max-w-[34rem]">
        {[
          {
            label: "Email",
            text: socials.email,
            href: `mailto:${socials.email}`,
            Icon: LuMail,
          },
          {
            label: "GitHub",
            text: socials.githubLabel,
            href: socials.github,
            Icon: LuGithub,
          },
          {
            label: "LinkedIn",
            text: socials.linkedinLabel,
            href: socials.linkedin,
            Icon: LuLinkedin,
          },
        ].map(({ label, text, href, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3.5 border-t border-[var(--st-line)] py-3"
          >
            {/* Only the glyph navigates.
                The whole row used to be one anchor, which meant dragging
                across the address started a link drag instead of a selection,
                so the one thing most people want to do with an email address
                was the one thing you could not do. */}
            <a
              href={href}
              aria-label={`${label}: ${text}`}
              {...(href.startsWith("mailto:")
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-[var(--st-line-strong)] bg-[var(--st-panel)] text-[13px] text-[var(--st-dim)] transition-colors duration-150 hover:border-[var(--st-sel-line)] hover:bg-[var(--st-sel)] hover:text-[var(--st-accent)]"
            >
              <Icon aria-hidden />
              <LuArrowUpRight
                aria-hidden
                className="pointer-events-none absolute translate-x-[9px] translate-y-[-9px] text-[9px] text-[var(--st-accent)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              />
            </a>
            <span className="st-label w-[4.75rem] shrink-0">{label}</span>
            {/* Selectable, and wide enough to select cleanly. */}
            <span className="min-w-0 flex-1 select-text truncate text-[14px] tracking-[-0.01em] text-[rgba(244,244,241,0.9)]">
              {text}
            </span>
            <CopyButton value={text} label={label} />
          </div>
        ))}

        {/* Location, not hobbies. This is the row a recruiter scans for
            "can they work here", and it was spending that slot on a list of
            pastimes that the off-clock comp already covers in full. */}
        <div className="flex items-center gap-3.5 border-y border-[var(--st-line)] py-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-[var(--st-line-strong)] bg-[var(--st-panel)] text-[13px] text-[var(--st-dim)]">
            <LuMapPin aria-hidden />
          </span>
          <span className="st-label w-[4.75rem] shrink-0">Location</span>
          <span className="min-w-0 flex-1 select-text text-[14px] tracking-[-0.01em] text-[rgba(244,244,241,0.9)]">
            {LOCATION}
          </span>
        </div>
      </div>

      <a
        href={`mailto:${socials.email}`}
        className="st-btn-play relative mt-7 w-fit gap-2 px-4 text-[12px] font-medium tracking-[-0.01em]"
      >
        <LuMail aria-hidden className="text-[13px]" />
        Get in touch
      </a>
    </div>
  );
}

/**
 * Copy to clipboard, for the third kind of visitor.
 *
 * The glyph beside each row redirects and the address itself can be selected
 * by hand. This covers the person who wants the string without either.
 */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(
          () => {
            setDone(true);
            window.setTimeout(() => setDone(false), 1400);
          },
          () => {
            /* Clipboard denied, which is the browser's call to make. */
          },
        );
      }}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-transparent text-[12px] text-[var(--st-faint)] transition-colors duration-150 hover:border-[var(--st-line-strong)] hover:text-[var(--st-text)]"
    >
      {done ? (
        <LuCheck aria-hidden className="text-[var(--st-audio)]" />
      ) : (
        <LuCopy aria-hidden />
      )}
    </button>
  );
}
