import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuClapperboard, LuAlignLeft } from "react-icons/lu";
import SpaceField from "./components/SpaceField";
import { SITE_URL, aboutClearance, LOCATION, withBasePath } from "./data";

/**
 * The chooser.
 *
 * Two complete front ends over one set of facts, so the bare domain asks which
 * one you want rather than picking for you. Each half is the world it opens:
 * the real starfield on the left, the end card's plate on the right, so the
 * choice is made by looking rather than by reading a label.
 *
 * The cards say what the trade actually is. "Choose a theme" would be asking
 * someone to pick a colour scheme sight unseen, and the difference here is not
 * colour: one is an application you scrub a timeline through, the other is a
 * page you scroll. Naming the cost on each side is what makes the choice
 * possible for someone who has seen neither, and it means a visitor who is
 * screening on a deadline can take the fast road without feeling they missed
 * the good one.
 *
 * This page also carries the identity block rather than only two links. A
 * chooser with no prose would make the most valuable URL on the domain a
 * doormat, and the name, the role and the clearance are what a search result
 * needs to be worth clicking.
 */

export const metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

export default function Choose() {
  return (
    <main className="choose-split relative flex min-h-[100dvh] flex-col md:flex-row">
      {/* Identity, centred on the seam so it belongs to both halves rather
          than to the one it happens to sit over. Pointer events off, so it
          never steals a click from the half underneath it.

          Overlaid only from md. Stacked on a phone the halves start at the top
          of the viewport, so an absolute header sat on top of the first one's
          copy: 98px of overlap at 360x640. In flow it takes its own space and
          the halves divide what is left. */}
      <header className="choose-enter-header pointer-events-none relative z-20 shrink-0 px-6 pt-6 text-center sm:px-10 sm:pt-11 md:absolute md:inset-x-0 md:top-0">
        <h1 className="font-mono text-[clamp(1.75rem,3.6vw,2.7rem)] font-medium leading-[0.94] tracking-[-0.045em] text-[var(--text-strong)] [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]">
          Ali Tleis<span className="text-[var(--accent-electric)]">.</span>
        </h1>
        <p className="mx-auto mt-2.5 max-w-[56ch] text-[14px] leading-[1.6] sm:text-[15px] text-white/72 [text-shadow:0_1px_14px_rgba(0,0,0,0.9)]">
          Web Application Developer at MIT Lincoln Laboratory, CS and Sociology
          at Northeastern. {aboutClearance}. {LOCATION}.
        </p>
      </header>

      {/* ── The portfolio ───────────────────────────────────────────── */}
      <Link
        href="/galaxy"
        className="choose-half choose-join-1 group relative flex flex-1 flex-col justify-end overflow-hidden md:min-h-[100dvh]"
      >
        {/* The galaxy route's own canvas, shooting stars and all.
            SpaceField sizes its canvas to the viewport rather than to its
            parent, so it gets a viewport-sized stage anchored at this half's
            top-left and the half clips it. Constraining the canvas itself
            would have meant changing the component the galaxy page depends
            on, to show the same picture. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="absolute left-0 top-0 block h-[100dvh] w-screen">
            <SpaceField />
          </span>
          {/* Warm light, matching the galaxy page's single source. */}
          <span
            className="absolute inset-0 block"
            style={{
              background:
                "radial-gradient(70% 55% at 22% 8%, rgba(var(--signal-rgb),0.07), transparent 64%)",
            }}
          />
        </span>

        <Half
          Icon={LuAlignLeft}
          eyebrow="Recruiter friendly"
          title="The portfolio"
          blurb="Everything in order, straight down the page. Roles, projects, stack and the resume, where you expect them to be."
          cost="Scroll it like any other site"
        />
      </Link>

      {/* ── The editing suite ───────────────────────────────────────── */}
      <Link
        href="/studio"
        className="choose-half choose-half-accent choose-join-2 group relative flex flex-1 flex-col justify-end overflow-hidden md:min-h-[100dvh]"
      >
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {/* The same plate the end card sits on, so this half is a frame from
              the thing it opens. */}
          <Image
            src={withBasePath("/studio/stage-end.webp")}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            /* The plate was composed with its left two thirds near empty so
               headline text could sit there. Cropped to half a viewport that
               framing puts the only lit part off the edge, so this pulls the
               glow back toward the middle. */
            className="object-cover object-[72%_50%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            priority
          />
        </span>

        <Half
          Icon={LuClapperboard}
          eyebrow="The creative one"
          title="The editing suite"
          blurb="The same work as a sequence in an editor. Scrub the timeline and every section composes itself to that moment, with the audio cut to match."
          cost="Slower to read, more to look at"
          accent
        />
      </Link>

      {/* The seam. Sits above both halves so neither one's scrim covers it. */}
      <span
        aria-hidden
        className="choose-seam pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 md:left-1/2 md:right-auto md:top-0 md:h-full md:w-px md:translate-y-0"
      />

    </main>
  );
}

/** The block of copy at the foot of a half. */
function Half({
  Icon,
  eyebrow,
  title,
  blurb,
  cost,
  accent = false,
}: {
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  eyebrow: string;
  title: string;
  blurb: string;
  cost: string;
  accent?: boolean;
}) {
  const tint = accent ? "text-[var(--accent-electric)]" : "text-white/70";

  return (
    <>
      {/* Scrim, so the copy holds over a photographic plate and a starfield
          alike without either being dimmed to mush. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[rgba(6,6,9,0.94)] via-[rgba(6,6,9,0.55)] to-transparent"
      />

      <span className="relative z-10 flex flex-col px-6 pb-7 sm:px-10 sm:pb-14">
        <span className="flex items-center gap-2">
          <Icon aria-hidden className={`text-[17px] ${tint}`} />
          <span className={`text-[13px] uppercase tracking-[0.16em] ${tint}`}>
            {eyebrow}
          </span>
        </span>

        <span className="mt-3 text-[clamp(1.7rem,3.25vw,2.5rem)] font-medium tracking-[-0.03em] text-[var(--text-strong)]">
          {title}
        </span>

        <span className="mt-3 max-w-[42ch] text-[17px] leading-[1.6] text-white/72">
          {blurb}
        </span>

        {/* The honest part. Both of these cost something, and a visitor cannot
            weigh them without being told what. */}
        <span className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[16px] font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-0.5 ${
              accent ? "text-[var(--accent-electric)]" : "text-[var(--text-strong)]"
            }`}
          >
            Open
            <LuArrowRight aria-hidden className="text-[16px]" />
          </span>
          <span className="text-[15px] text-white/45">{cost}</span>
        </span>
      </span>
    </>
  );
}
