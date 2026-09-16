"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { LuAlignLeft, LuClapperboard } from "react-icons/lu";
import { withBasePath } from "../data";

/**
 * The switch between the two ways to read this site.
 *
 * Both destinations are named on screen, with the current one marked. A single
 * button cannot do that: "Read as document" told you a format and not a
 * destination, and "Change theme" would promise a recolour and deliver a
 * different navigation model. The fix for "I did not know what it did" is to
 * stop asking anyone to guess what is on the other side.
 *
 * These are not themes. One is an application with a timeline for navigation,
 * the other is a page you scroll, so they are labelled for what they are.
 *
 * The two surfaces need different densities, so `hideCurrent` exists. The
 * studio is the unfamiliar interface and has to advertise that a plain page
 * exists at all, which takes both labels. The reading view does not need to
 * tell you that you are reading, and its nav bar is already carrying seven
 * section links, Ask AI and a resume button, so there it is one link out.
 *
 * The previews are real screenshots of each route rather than drawn mockups,
 * regenerated from the running site:
 *   chrome --headless=new --window-size=1440,900 --screenshot=… /?c=intro
 *   chrome --headless=new --window-size=1440,900 --screenshot=… /document/
 * then resized to 360x225 into public/switch.
 */

const VIEWS = [
  {
    href: "/studio",
    label: "Editing suite",
    hint: "Scrub a timeline",
    Icon: LuClapperboard,
    shot: "/switch/studio.webp",
  },
  {
    href: "/galaxy",
    label: "Reading view",
    hint: "One page, scroll it",
    Icon: LuAlignLeft,
    shot: "/switch/reading.webp",
  },
] as const;

export default function ViewSwitch({
  tone = "studio",
  hideCurrent = false,
}: {
  /** Matches the palette of whichever route it is sitting in. */
  tone?: "studio" | "document";
  /** Render only the way out, for bars with no room for both. */
  hideCurrent?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const onStudio = pathname?.startsWith("/studio") ?? false;

  /**
   * Navigate inside a view transition, so the two bars morph.
   *
   * The elements are named in globals.css, but naming alone does nothing:
   * something has to call startViewTransition around the navigation, and
   * Next's experimental.viewTransition flag only enables React's
   * ViewTransition component rather than wrapping router pushes. Verified by
   * listening for animations on the pseudo-elements, which never fired.
   *
   * startViewTransition takes its "after" snapshot when the callback settles,
   * and router.push resolves long before React has committed the new route,
   * so the promise is held open until the pathname actually changes.
   */
  const commitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    commitRef.current?.();
    commitRef.current = null;
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Let the browser handle anything that is not a plain left click, and
      // fall back to a normal navigation where the API is missing.
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        typeof document.startViewTransition !== "function" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      e.preventDefault();
      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            commitRef.current = resolve;
            router.push(href);
            // A push that never commits would otherwise leave the page frozen
            // under a snapshot with no way out.
            window.setTimeout(() => {
              commitRef.current = null;
              resolve();
            }, 1200);
          }),
      );

      // A skipped transition rejects `ready`, and an unhandled rejection is a
      // console error for something that is working as intended: the browser
      // declined to animate and the navigation went through regardless. Seen
      // for real in an unfocused tab, where every call aborts with
      // InvalidStateError.
      transition.ready.catch(() => {});
    },
    [router],
  );

  const shell = hideCurrent
    ? ""
    : `rounded-full border p-0.5 ${
        tone === "studio"
          ? "border-[var(--st-line-strong)] bg-[var(--st-panel)]"
          : "border-[var(--border-soft)] bg-white/[0.04]"
      }`;

  return (
    <div className={`vt-switch flex shrink-0 items-center gap-0.5 ${shell}`}>
      {VIEWS.map((v) => {
        const current = v.href === "/studio" ? onStudio : !onStudio;
        const Icon = v.Icon;

        /*
         * Only the side you are not on spells itself out.
         *
         * Both labels came to 218px, which made this the widest control in
         * either bar and wider than the resume button beside it, for something
         * secondary. The current view does not need naming, because you are
         * looking at it: a marked glyph says "here" and the word says where
         * the other one goes. That reads the same and costs about 90px.
         */
        const body = (
          <>
            <Icon aria-hidden className="shrink-0 text-[13px]" />
            {current ? null : (
              <span className="hidden md:inline">{v.label}</span>
            )}
          </>
        );

        /*
         * Preview of the view this segment stands for.
         *
         * On both segments, not only the link. The current one was a bare
         * glyph with a native title tooltip, so pointing at it produced an OS
         * label that opened over the custom preview of the other side rather
         * than a picture of anything.
         *
         * Hover and focus, and never on a touch screen, where there is no
         * hover and the tap should just navigate.
         *
         * Anchored to the right edge so it opens leftward, back across the
         * bar. It hung off the left edge while the switch lived beside the
         * logo, and once the switch moved to the top right that sent a 240px
         * box past the edge of the page: invisible at rest but not
         * display:none, so it still counted toward scrollWidth and produced
         * 145px of horizontal page scroll at 1024 with nothing on screen to
         * explain it.
         */
        const preview = (
          <span
            aria-hidden
            className="st-switch-preview pointer-events-none absolute right-0 top-[calc(100%+8px)] z-50 hidden w-[240px] origin-top-right scale-95 overflow-hidden rounded-[4px] border border-[var(--st-line-strong)] bg-black opacity-0 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)] transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 [@media(hover:hover)]:block"
          >
            <Image
              src={withBasePath(v.shot)}
              alt=""
              width={360}
              height={225}
              sizes="240px"
              className="h-auto w-full"
            />
            <span className="block px-2 py-1.5 text-[10.5px] leading-tight text-[var(--st-dim)]">
              {current ? `You are here. ${v.hint}.` : v.hint}
            </span>
          </span>
        );

        // The current view is not a link to itself.
        if (current) {
          if (hideCurrent) return null;
          return (
            <span
              key={v.href}
              aria-current="page"
              className={`group relative flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11.5px] tracking-[-0.01em] ${
                tone === "studio"
                  ? "bg-[var(--st-sel)] text-[var(--st-text)]"
                  : "bg-white/10 text-white"
              }`}
            >
              {body}
              <span className="sr-only">(current view)</span>
              {preview}
            </span>
          );
        }

        return (
          <Link
            key={v.href}
            href={v.href}
            onClick={navigate(v.href)}
            className={`group relative flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11.5px] tracking-[-0.01em] transition-colors duration-150 ${
              tone === "studio"
                ? "text-[var(--st-dim)] hover:bg-[var(--st-hover)] hover:text-[var(--st-text)]"
                : "text-white/70 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            {body}
            {preview}
          </Link>
        );
      })}
    </div>
  );
}
