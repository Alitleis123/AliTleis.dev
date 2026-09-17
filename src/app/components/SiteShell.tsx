"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clearSwitchArrival, isSwitchArrival } from "../lib/switchArrival";
import { BUILD_YEAR } from "../data";
import BackgroundRings from "./BackgroundRings";
import NavBar from "./NavBar";
import ResumeButton from "./ResumeButton";
import ScrollToTop from "./ScrollToTop";
import AmbientAudio from "./AmbientAudio";
import CommandPalette from "./CommandPalette";

/**
 * The document chrome, which the studio does not want.
 *
 * The studio is a full viewport application shell rather than a page, so a nav
 * bar, a footer and a set of floating controls would all be fighting it for
 * the same edges. A nested layout cannot remove a parent's chrome, so the
 * parent asks where it is instead.
 *
 * The test names the studio rather than the reading view, because the reading
 * view is the root route. Matching on "/" would match every path there is.
 *
 * The starfield stays on this route. Stripping it when the studio arrived was
 * a mistake: these are two presentations over one dataset rather than one
 * theme in two skins, so there is no consistency to enforce between them and
 * each gets its own atmosphere. The canvas draws a single static frame under
 * prefers-reduced-motion and its edge falloff is tuned so it never competes
 * with the reading column, so it costs legibility nothing.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /**
   * Arrived from the editing suite.
   *
   * Read here rather than in NavBar because consuming the flag clears it and
   * there has to be exactly one reader per navigation.
   *
   * Keyed on the pathname rather than held in useState, because the root
   * layout keeps this component mounted across every route, so a state
   * initialiser runs once for the life of the tab and never again. Read
   * during render rather than from an effect, or the page paints at full
   * opacity and then jumps back to zero to animate.
   *
   * A cold open does not fade. This is the page a recruiter lands on, and
   * ramping the hero up from nothing delays the only thing they came for.
   */
  const entering = isSwitchArrival(pathname);

  // Retire it once this arrival has rendered, so a later reload does not
  // inherit the animation. An effect, because render has to stay pure.
  useEffect(() => {
    if (entering) clearSwitchArrival();
  }, [entering, pathname]);
  // Two routes bring their own frame. The suite is a full viewport
  // application, and the chooser is a single screen that would look absurd
  // under a nav offering to take you to the page you are choosing between.
  const bare =
    pathname?.startsWith("/studio") || pathname === "/" || pathname === "";

  if (bare) return <>{children}</>;

  return (
    <>
      <BackgroundRings />
      <NavBar entering={entering} />

      <main
        className={`relative z-10 pt-32 ${entering ? "enter-page" : ""}`}
      >
        {children}
      </main>

      <footer className="relative z-10 border-t border-[var(--border-hairline)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-12 text-center">
          <span className="text-[13px] font-medium tracking-tight text-white/85">
            Ali Tleis
          </span>
          <p className="text-[12px] text-[var(--text-dim)]">
            Built with Next.js, Tailwind CSS, and Framer Motion.
          </p>
          <p className="text-[11px] text-[var(--text-faint)]">
            © {BUILD_YEAR} Ali Tleis. All rights reserved.
          </p>
        </div>
      </footer>

      <ResumeButton />
      <ScrollToTop />
      <AmbientAudio />
      <CommandPalette />
    </>
  );
}
