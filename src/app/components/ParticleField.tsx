"use client";

import { useEffect, useRef } from "react";

/**
 * Slow drifting point field.
 *
 * One canvas and one rAF loop rather than a DOM node per particle: the earlier
 * version used ten blurred divs, each with its own infinite keyframe, which
 * promoted ten compositor layers that stayed resident behind every scroll.
 * A canvas draws the same thing in a single paint.
 *
 * The points sit on a slight parallax so the field has depth against the fixed
 * grid, and each one breathes on its own phase so the motion never pulses in
 * unison. Honours prefers-reduced-motion by drawing a single static frame, and
 * suspends entirely while the tab is hidden.
 */
export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type P = {
      x: number; y: number;   // 0..1, resolution-independent
      r: number;              // radius, css px
      vx: number; vy: number; // css px per second
      depth: number;          // parallax factor
      phase: number;          // twinkle offset
      speed: number;          // twinkle rate
      base: number;           // base alpha
    };

    let w = 0, h = 0, dpr = 1;
    let points: P[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const build = () => {
      // Fewer on small screens: same visual density, far less overdraw.
      const target = Math.round(
        Math.min(72, Math.max(22, (window.innerWidth * window.innerHeight) / 26000)),
      );
      points = Array.from({ length: target }, () => {
        const depth = rand(0.25, 1);
        return {
          x: Math.random(),
          y: Math.random(),
          // Depth offsets these rather than multiplying them. Scaling radius
          // AND alpha by the same 0.25..1 factor drove the far points to a
          // 0.125px radius at 0.008 alpha — drawn every frame, visible never.
          r: 0.6 + depth * 1.1,
          vx: rand(-3, 3) * depth,
          vy: rand(-7, -2) * depth, // a gentle upward bias reads as air, not rain
          depth,
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.15, 0.5),
          base: 0.12 + depth * 0.3,
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!points.length) build();
    };

    let scrollY = window.scrollY;
    const onScroll = () => { scrollY = window.scrollY; };

    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab switches
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (const p of points) {
        if (!reduced) {
          p.x += (p.vx * dt) / w;
          p.y += (p.vy * dt) / h;
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
          if (p.y < -0.02) p.y = 1.02;
          if (p.y > 1.02) p.y = -0.02;
        }

        const twinkle = reduced
          ? 1
          : 0.72 + 0.28 * Math.sin(now / 1000 * p.speed + p.phase);

        // Parallax: nearer points shift more as the page scrolls.
        const py = (p.y * h - scrollY * p.depth * 0.06) % (h + 40);
        const y = py < -20 ? py + h + 40 : py;

        ctx.globalAlpha = p.base * twinkle;
        ctx.beginPath();
        ctx.arc(p.x * w, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ededea";
        ctx.fill();
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

    if (reduced) draw(performance.now()); // one static frame
    else start();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
