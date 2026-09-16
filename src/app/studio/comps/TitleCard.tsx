"use client";

import Image from "next/image";
import {
  LuGithub,
  LuLanguages,
  LuLinkedin,
  LuMapPin,
  LuShieldCheck,
} from "react-icons/lu";
import {
  withBasePath,
  aboutClearance,
  aboutLanguages,
  LOCATION,
  socials,
} from "../../data";

/**
 * Intro as a slate.
 *
 * The document version is a hero with a portrait beside a paragraph. In a
 * viewer that reads as a web page someone dropped into a panel, so this is
 * built as the card an editor would actually cut first.
 *
 * The six row metadata table is gone. Role and company were the only two lines
 * anyone reads first and they now sit in a status pill above the name, study
 * went into the one sentence underneath, and what is left is three facts with
 * a glyph each. The plate behind all of this was being hidden under an almost
 * opaque scrim, so the one piece of real artwork on the comp was doing no
 * work: the scrim now clears the right third and lets the edit suite show.
 */
export default function TitleCard() {
  return (
    <div className="relative flex h-full min-h-full items-center px-[6%] py-[6%]">
      <div aria-hidden className="st-plate absolute inset-0 overflow-hidden">
        <Image
          src={withBasePath("/studio/stage-title.webp")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="st-drift object-cover"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-[var(--st-stage)] via-[var(--st-stage)]/80 to-transparent" />
      </div>

      <div className="relative flex w-full items-center gap-[5%]">
        <div className="st-seq min-w-0 flex-1">
          {/* Status pill, and on a narrow screen the portrait travels with it.
              The framed version to the right is the first thing a phone drops
              for want of width, which left the one photograph of the person
              this page is about visible only on a laptop. */}
          <div className="flex items-center gap-3">
            <span className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full border border-[var(--st-line-strong)] bg-black sm:hidden">
              <Image
                src={withBasePath(
                  "/portrait/36B2F96D-AEC4-4C74-BA04-B7D58EE30BE0.webp",
                )}
                alt="Ali Tleis"
                fill
                sizes="52px"
                className="object-cover object-[50%_15%]"
              />
            </span>

            <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-[14px] border border-[var(--st-sel-line)] bg-[var(--st-sel)] px-3 py-1.5 sm:rounded-full">
              <span aria-hidden className="current-dot relative h-1.5 w-1.5" />
              <span className="text-[12px] tracking-[-0.01em] text-[var(--st-text)]">
                Web Application Developer
              </span>
              <span className="st-tc text-[var(--st-faint)]">@</span>
              <span className="text-[12px] tracking-[-0.01em] text-[var(--st-dim)]">
                MIT Lincoln Laboratory
              </span>
            </span>
          </div>

          {/* Two clipped lines rather than one heading with a <br>: the wipe
              needs each line to have its own bottom edge to ride up from. The
              accent lands after both, on a spring, so it reads as a keyframe
              rather than as part of the text. */}
          <h1 className="st-title mt-6 font-mono text-[clamp(2.4rem,6.4vw,5.4rem)] font-medium leading-[0.86] tracking-[-0.055em] text-[var(--st-text)]">
            <span className="st-wipe block overflow-hidden pb-[0.04em]">
              <span className="block">Ali</span>
            </span>
            <span className="st-wipe block overflow-hidden pb-[0.04em]">
              <span className="block">
                Tleis
                <span className="st-pop inline-block text-[var(--st-accent)]">
                  .
                </span>
              </span>
            </span>
          </h1>

          <p className="st-lede mt-6 max-w-[42ch]">
            CS and Sociology at Northeastern, on a seven-month co-op building
            LLM-backed search at Lincoln Laboratory.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Fact icon={<LuShieldCheck aria-hidden />} value={aboutClearance} />
            <Fact
              icon={<LuLanguages aria-hidden />}
              value={aboutLanguages.map((l) => l.name).join(", ")}
            />
            <Fact icon={<LuMapPin aria-hidden />} value={LOCATION} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="st-btn st-btn-primary gap-1.5 px-3"
            >
              <LuLinkedin aria-hidden className="text-[13px]" />
              LinkedIn
            </a>
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="st-btn gap-1.5 px-3"
            >
              <LuGithub aria-hidden className="text-[13px]" />
              GitHub
            </a>
          </div>
        </div>

        {/* The portrait, cropped to the face rather than to the whole shot.
            A 3:4 frame of the full photo put most of its area on a jacket and
            a shopfront, which is why the one picture of the person whose
            portfolio this is read as a thumbnail. */}
        <figure className="hidden w-[210px] shrink-0 sm:block lg:w-[248px] xl:w-[286px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] border border-[var(--st-line-strong)] bg-black shadow-[0_30px_70px_-24px_rgba(0,0,0,0.95)]">
            <Image
              src={withBasePath(
                "/portrait/36B2F96D-AEC4-4C74-BA04-B7D58EE30BE0.webp",
              )}
              alt="Ali Tleis"
              fill
              sizes="(min-width: 1280px) 286px, 248px"
              className="st-ken object-cover object-[50%_18%] saturate-[0.95]"
            />
          </div>
          <figcaption className="st-label mt-2.5 block">
            portrait.webp
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/** A single fact, glyph then value. Label-free, because the glyph is the label. */
function Fact({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[13px] text-[var(--st-accent)]">
        {icon}
      </span>
      <span className="text-[12.5px] tracking-[-0.01em] text-[var(--st-dim)]">
        {value}
      </span>
    </span>
  );
}
