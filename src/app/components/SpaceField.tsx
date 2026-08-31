"use client";

import { useEffect, useRef } from "react";

/**
 * Page backdrop: measured rings, bodies tracking them, and a quiet field of
 * points, painted into one canvas on one animation loop.
 *
 * The restraint is deliberate. This site speaks in letterspaced mono labels,
 * zero-padded counters and slash notation, which is an instrument-panel
 * language. An earlier version of this file grew a nebula, a galactic band,
 * four-point sparkles, colour-tinted stars and a meteor every three seconds.
 * It was a different aesthetic wearing the same page, and it was louder than
 * the work it sits behind. What is left is the part that agrees with the rest
 * of the site: geometry, measured motion, and depth.
 *
 * There is deliberately no grain. A CSS `.noise-overlay` used to tile a
 * 120x120 SVG across the page, and feTurbulence is deterministic, so every
 * tile was pixel identical and the repetition read as a 120px lattice.
 * Regenerating it as one non-repeating viewport-sized field fixed the
 * lattice but kept the texture nobody wanted, so it is gone entirely.
 *
 * The original version was ten absolutely-positioned divs, each with its own
 * infinite CSS keyframe, which promoted ten compositor layers that stayed
 * resident behind every scroll. Its ring rotation also never ran at all: the
 * keyframe was bound to `.background-rings svg`, a class the component never
 * actually rendered. One canvas avoids both problems and costs a single paint.
 *
 * Honours prefers-reduced-motion by drawing one static frame, and suspends
 * entirely while the tab is hidden.
 */
export default function SpaceField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    /** Orbit radius as a fraction of the smaller viewport axis. */
    const ORBITS = [
      { r: 0.30, alpha: 0.055, period: 40 },
      { r: 0.42, alpha: 0.042, period: 68 },
      { r: 0.56, alpha: 0.032, period: 96 },
    ];
    /** Seconds for the whole system to turn once. */
    const SYSTEM_PERIOD = 180;

    type Body = { orbit: number; phase: number; radius: number };
    const bodies: Body[] = [
      { orbit: 0, phase: rand(0, Math.PI * 2), radius: 2.0 },
      { orbit: 1, phase: rand(0, Math.PI * 2), radius: 3.2 },
      { orbit: 2, phase: rand(0, Math.PI * 2), radius: 1.8 },
      { orbit: 2, phase: rand(0, Math.PI * 2) + Math.PI, radius: 1.4 },
    ];

    type Star = {
      x: number; y: number; r: number;
      vx: number; vy: number; depth: number;
      phase: number; speed: number; base: number;
    };
    let stars: Star[] = [];

    let w = 0, h = 0, dpr = 1;

    /**
     * Stars are blitted from a pre-baked soft sprite rather than stroked as
     * hard-edged arcs. A 1px `arc()` on a 2x canvas is two or three lit pixels
     * with nothing between them and the background, which is why the field used
     * to look pixelated; a radial falloff has no edge to alias. Baking it once
     * also means the size can animate for free, since scaling a blit is smooth
     * where re-rasterising a tiny circle every frame is not.
     *
     * The core has to be a large fraction of the sprite. An early falloff reads
     * fine at 64px but the sprite is drawn 6-10px wide, so a core at 14% of the
     * radius lands sub-pixel and the downscale filter averages it straight into
     * the dim skirt, which turns the whole field into fog.
     */
    const makeGlow = (rgb: string) => {
      const S = 64;
      const cv = document.createElement("canvas");
      cv.width = S;
      cv.height = S;
      const g = cv.getContext("2d");
      if (!g) return cv;
      const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      grad.addColorStop(0, `rgba(${rgb},1)`);
      grad.addColorStop(0.30, `rgba(${rgb},0.95)`);
      grad.addColorStop(0.46, `rgba(${rgb},0.42)`);
      grad.addColorStop(0.68, `rgba(${rgb},0.10)`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
      return cv;
    };

    // Read once. getComputedStyle inside the loop forced a style resolution on
    // every frame, and the accent cannot change without a reload anyway.
    const signal = getComputedStyle(document.documentElement)
      .getPropertyValue("--signal-rgb").trim() || "34, 211, 238";

    // One neutral sprite. Tinted stars were a cosmic cue, not an instrument
    // one, and at this opacity the hue was barely legible anyway.
    const starSprite = makeGlow("237,237,234");
    const bodySprite = makeGlow(signal);

    /**
     * How much wider the drawn sprite is than the star's nominal core. Keep
     * this low: every increment spreads the same light over the square of the
     * area, and past ~2.5 the field stops reading as points and starts reading
     * as haze.
     */
    const HALO = 2.2;

    const buildStars = () => {
      // Sparse on purpose. This is a depth cue behind body copy, not a feature.
      const n = Math.round(
        Math.min(150, Math.max(70, (window.innerWidth * window.innerHeight) / 11000)),
      );
      stars = Array.from({ length: n }, () => {
        const depth = rand(0.25, 1);
        return {
          x: Math.random(),
          y: Math.random(),
          // Depth offsets rather than multiplies: scaling radius and alpha by
          // the same factor once drove the far stars to a sub-pixel, near-zero
          // alpha dot that was drawn every frame and visible in none of them.
          r: 0.9 + depth * 1.3,
          vx: rand(-3, 3) * depth,
          vy: rand(-6, -2) * depth,
          depth,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.15, 0.5),
          base: 0.16 + depth * 0.42,
        };
      });
    };

    /**
     * Angular lighting for the rings as a single conic gradient, so each ring
     * is one seamless stroke. This used to be 40 separately-stroked segments,
     * which is what made the outer ring look pixelated: a 1px stroke at a
     * 1075px radius has almost no anti-aliasing gradient to work with, and the
     * overlap between segments was ~6.5px of double-compositing at every one of
     * 40 joints, so the ring beaded.
     *
     * Falls back to a flat colour where createConicGradient is unavailable. The
     * ring loses its lit edge but keeps the soft profile.
     */
    const hasConic = typeof ctx.createConicGradient === "function";
    const ringLight = (x: number, y: number) => {
      if (!hasConic) return null;
      // Start the sweep at the upper left so t=0 is the brightest point.
      const cg = ctx.createConicGradient(Math.PI * 1.25, x, y);
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const lit = 0.3 + 0.7 * (0.5 + 0.5 * Math.cos(t * Math.PI * 2));
        cg.addColorStop(t, `rgba(237,237,234,${lit.toFixed(3)})`);
      }
      return cg;
    };

    /** [lineWidth, alpha multiplier], widest and faintest first. */
    const RING_PASSES: [number, number][] = [
      [3.2, 0.20],
      [1.7, 0.34],
      [0.9, 0.58],
    ];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!stars.length) buildStars();
    };

    let scrollY = window.scrollY;
    const onScroll = () => { scrollY = window.scrollY; };

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab switches
      last = now;
      if (!reduced) elapsed += dt;

      ctx.clearRect(0, 0, w, h);

      // ── stars, in screen space so they do not turn with the system ──
      for (const s of stars) {
        if (!reduced) {
          s.x += (s.vx * dt) / w;
          s.y += (s.vy * dt) / h;
          if (s.x < -0.02) s.x = 1.02;
          if (s.x > 1.02) s.x = -0.02;
          if (s.y < -0.02) s.y = 1.02;
          if (s.y > 1.02) s.y = -0.02;
        }
        // Two out-of-phase sines rather than one. A single sine makes the whole
        // field breathe in visible lockstep; summing an incommensurate second
        // one gives each star a long, non-repeating cycle.
        const tw = reduced
          ? 1
          : 0.6 * Math.sin(elapsed * s.speed * 2 + s.phase) +
            0.4 * Math.sin(elapsed * s.speed * 3.7 + s.phase * 1.7);
        const twinkle = reduced ? 1 : 0.68 + 0.32 * (0.5 + 0.5 * tw);

        // Squared depth widens the spread between layers: near stars shift ~7x
        // further than the far ones, where a linear term gave 4x and read as a
        // single flat sheet sliding past.
        const par = scrollY * (0.02 + s.depth * s.depth * 0.20);
        const py = (s.y * h - par) % (h + 40);
        const y = py < -20 ? py + h + 40 : py;
        const x = s.x * w;

        // Size breathes as well as brightness, but gently. Alpha alone at this
        // scale is imperceptible; the earlier 0.72-1.20 swing was a pulse.
        const scale = reduced ? 1 : 0.88 + 0.16 * (0.5 + 0.5 * tw);
        const rad = s.r * HALO * scale;

        ctx.globalAlpha = s.base * twinkle;
        ctx.drawImage(starSprite, x - rad, y - rad, rad * 2, rad * 2);
      }

      // ── rings, centred above the fold and drifting slower than the page ──
      const cx = w * 0.5;
      const cy = h * 0.42 - scrollY * 0.04;
      const unit = Math.min(w, h);
      const sysAngle = (elapsed / SYSTEM_PERIOD) * Math.PI * 2;

      // Rings carry an angular falloff, brightest at the upper left to match
      // the light source the rest of the page uses, because a perfectly even
      // circle reads as CAD linework. Three passes at falling widths give the
      // edge a soft skirt instead of one hard pixel row.
      const conic = ringLight(cx, cy);
      ctx.strokeStyle = conic ?? "rgba(237,237,234,0.65)";
      for (const o of ORBITS) {
        const rx = unit * o.r;
        for (const [lw, m] of RING_PASSES) {
          ctx.globalAlpha = o.alpha * m;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, rx, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      for (const b of bodies) {
        const o = ORBITS[b.orbit];
        const rx = unit * o.r;
        // Inner orbits complete faster, so the system never looks locked.
        const a = b.phase + sysAngle + (elapsed / o.period) * Math.PI * 2;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * rx;

        // A fading arc behind each body. Without it the bodies read as dots
        // parked on a ring; the trail is what makes them look like they are
        // travelling. Built from overlapping soft sprites, not hard circles:
        // crisp discs spaced along an arc render as a dotted line.
        if (!reduced) {
          const N = 26;
          for (let i = N; i >= 1; i--) {
            const ta = a - i * 0.0075;
            const f = 1 - i / N;
            // Squared falloff on both size and alpha tapers it to a point
            // instead of ending in a blunt stub.
            const tr = b.radius * HALO * (0.25 + 0.75 * f * f);
            ctx.globalAlpha = 0.34 * f * f;
            ctx.drawImage(
              bodySprite,
              cx + Math.cos(ta) * rx - tr,
              cy + Math.sin(ta) * rx - tr,
              tr * 2,
              tr * 2,
            );
          }
        }

        // Halo from the same sprite rather than shadowBlur: shadowBlur is a
        // per-draw gaussian on the CPU and it banded visibly at these radii.
        const hr = b.radius * HALO * 1.35;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(bodySprite, x - hr, y - hr, hr * 2, hr * 2);
      }

      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => cancelAnimationFrame(raf);
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // Paint one frame synchronously before handing off to rAF. A backgrounded
    // or bfcache-restored tab throttles rAF indefinitely, and without this the
    // canvas would sit completely empty until the tab was focused.
    draw(performance.now());
    if (!reduced) start();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    // Absolute inside the already-fixed backdrop: document order then decides
    // what paints over what (light -> orbits -> vignette), instead of a second
    // negative z-index fighting the parent's stacking context.
    <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />
  );
}
