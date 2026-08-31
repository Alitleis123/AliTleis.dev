"use client";

import { useEffect, useRef } from "react";

/**
 * Orbital background — nebula wash, starfield, rings, bodies travelling them,
 * and the occasional meteor, all painted into a single canvas on one loop.
 *
 * The original version of this was ten absolutely-positioned divs, each with its
 * own infinite CSS keyframe, which promoted ten compositor layers that stayed
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
      sprite: HTMLCanvasElement; glint: boolean; spin: number;
    };
    let stars: Star[] = [];

    let w = 0, h = 0, dpr = 1;

    /**
     * Stars are blitted from a pre-baked soft sprite rather than stroked as
     * hard-edged arcs. A 1px `arc()` on a 2x canvas is two or three lit pixels
     * with nothing between them and the background, which is exactly why the
     * field looked pixelated; a radial falloff has no edge to alias. Baking it
     * once also means the size can animate for free, since scaling a blit is
     * smooth where re-rasterising a tiny circle every frame is not.
     */
    const makeGlow = (rgb: string) => {
      const S = 64;
      const cv = document.createElement("canvas");
      cv.width = S;
      cv.height = S;
      const g = cv.getContext("2d");
      if (!g) return cv;
      // The core has to be a large fraction of the sprite. An early falloff
      // reads fine at 64px but the sprite is drawn 6-10px wide, so a core at
      // 14% of the radius lands sub-pixel and the downscale filter averages it
      // straight into the dim skirt — which turns the whole field into fog.
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

    /**
     * A four-point sparkle for the handful of brightest stars. Built from two
     * soft lenses at right angles rather than drawn as a polygon: a polygon
     * gives hard tapered edges that alias at these sizes, where a squashed
     * radial gradient tapers to nothing on its own.
     */
    const makeSparkle = (rgb: string) => {
      const S = 96;
      const cv = document.createElement("canvas");
      cv.width = S;
      cv.height = S;
      const g = cv.getContext("2d");
      if (!g) return cv;
      const half = S / 2;
      const soft = (r: number, inner: number) => {
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
        gr.addColorStop(0, `rgba(${rgb},1)`);
        gr.addColorStop(inner, `rgba(${rgb},0.32)`);
        gr.addColorStop(1, `rgba(${rgb},0)`);
        return gr;
      };
      g.translate(half, half);
      // Arms. The 0.075 squash is what turns a disc into a taper.
      for (const [sx, sy] of [[1, 0.075], [0.075, 1]] as const) {
        g.save();
        g.scale(sx, sy);
        g.globalAlpha = 0.9;
        g.fillStyle = soft(half, 0.3);
        g.beginPath();
        g.arc(0, 0, half, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
      // Core last, so the arms read as coming out of a bright point.
      g.globalAlpha = 1;
      g.fillStyle = soft(half * 0.26, 0.42);
      g.beginPath();
      g.arc(0, 0, half * 0.26, 0, Math.PI * 2);
      g.fill();
      return cv;
    };

    // Read once. getComputedStyle inside the loop forced a style resolution on
    // every frame, and the accent cannot change without a reload anyway.
    const signal = getComputedStyle(document.documentElement)
      .getPropertyValue("--signal-rgb").trim() || "34, 211, 238";

    // Real starfields are not uniformly white. A few percent of warm and cool
    // stars is what stops a field this dense from reading as noise.
    const SPRITES = {
      neutral: makeGlow("237,237,234"),
      blue: makeGlow("188,212,255"),
      amber: makeGlow("255,217,176"),
    };
    const SPARKLES = {
      neutral: makeSparkle("237,237,234"),
      blue: makeSparkle("198,220,255"),
      amber: makeSparkle("255,222,186"),
    };
    const bodySprite = makeGlow(signal);

    /**
     * How much wider the drawn sprite is than the star's nominal core. Keep
     * this low: every increment spreads the same light over the square of the
     * area, and past ~2.5 the field stops reading as points and starts reading
     * as haze.
     */
    const HALO = 2.2;

    const starSprite = (spark: boolean) => {
      const set = spark ? SPARKLES : SPRITES;
      const t = Math.random();
      if (t < 0.08) return set.blue;    // hot blue-white
      if (t < 0.16) return set.amber;   // cool
      return set.neutral;
    };

    /**
     * The galactic plane. A uniform random scatter reads as noise or, worse, as
     * a CSS particle demo — real skies have a dense dusty band running through
     * them, and biasing a majority of the field onto one is the cheapest way to
     * get structure that says "sky" rather than "dots".
     */
    const BAND_Y = 0.56;      // band centre, fraction of viewport height
    const BAND_SLOPE = -0.38; // rises to the right, as a fraction of height
    const BAND_SIGMA = 0.115; // thickness (1 sd), fraction of height
    const BAND_SHARE = 0.58;  // fraction of the field drawn onto the band

    /** Box–Muller. A uniform spread gives the band hard edges; it needs a normal one. */
    const gauss = () => {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };

    const buildStars = () => {
      const n = Math.round(
        Math.min(340, Math.max(120, (window.innerWidth * window.innerHeight) / 5200)),
      );
      stars = Array.from({ length: n }, () => {
        const inBand = Math.random() < BAND_SHARE;
        const depth = rand(0.25, 1);
        // Bright, glinted stars are rare on purpose — they carry the depth cue,
        // and at more than a handful they flatten back into texture. Band stars
        // are dust, so they never glint.
        const glint = !inBand && Math.random() < 0.11;

        let x: number, y: number;
        if (inBand) {
          x = rand(-0.15, 1.15);
          y = BAND_Y + (x - 0.5) * BAND_SLOPE + gauss() * BAND_SIGMA;
        } else {
          x = Math.random();
          y = Math.random();
        }

        // Dust is small and dim; the sparse field outside the band carries the
        // brightness. Without that split the band just looks like a smear.
        const dim = inBand ? 0.55 : 1;
        return {
          x,
          y,
          // Depth offsets rather than multiplies: scaling radius and alpha by the
          // same factor once drove the far stars to a sub-pixel, near-zero-alpha
          // dot that was drawn every frame and visible in none of them.
          r: (0.9 + depth * 1.3) * (glint ? 1.6 : 1) * (inBand ? 0.7 : 1),
          vx: rand(-3, 3) * depth,
          vy: rand(-6, -2) * depth,
          depth,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.15, 0.5),
          base: (0.16 + depth * 0.42) * (glint ? 1.7 : 1) * dim,
          sprite: starSprite(glint),
          glint,
          // Sparkles all pointing the same way looks stamped on.
          spin: rand(-0.5, 0.5),
        };
      });
    };

    /**
     * Two nebula clouds, baked once into a quarter-resolution offscreen canvas
     * and blitted each frame. Evaluating two viewport-sized radial gradients
     * per frame is ~24M shaded pixels a frame at 2x DPR; a scaled blit of a
     * smooth gradient is visually identical and costs a fraction of that.
     */
    const NEBULA_SCALE = 0.25;
    let nebula: HTMLCanvasElement | null = null;
    const buildNebula = () => {
      const nw = Math.max(1, Math.round(w * NEBULA_SCALE));
      const nh = Math.max(1, Math.round(h * NEBULA_SCALE));
      const off = document.createElement("canvas");
      off.width = nw;
      off.height = nh;
      const g = off.getContext("2d");
      if (!g) return;
      const blob = (x: number, y: number, r: number, rgb: string, a: number) => {
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${rgb},${a})`);
        grad.addColorStop(0.55, `rgba(${rgb},${a * 0.35})`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, nw, nh);
      };
      const far = Math.max(nw, nh);
      blob(nw * 0.18, nh * 0.22, far * 0.55, "56,110,190", 0.075);
      blob(nw * 0.86, nh * 0.78, far * 0.45, "120,72,190", 0.055);
      nebula = off;
    };

    /**
     * Angular lighting for the rings as a single conic gradient, so the ring is
     * one seamless stroke. Falls back to a flat colour where createConicGradient
     * is unavailable — the ring loses its lit edge but keeps the soft profile.
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

    /** [lineWidth, alpha multiplier] — widest and faintest first. */
    const RING_PASSES: [number, number][] = [
      [3.2, 0.20],
      [1.7, 0.34],
      [0.9, 0.58],
    ];

    /**
     * Film grain, baked once at viewport size.
     *
     * This replaces a CSS `.noise-overlay` that tiled a 120x120 SVG across the
     * page. feTurbulence is deterministic, so every tile was pixel-identical —
     * twelve identical copies across a desktop viewport, which the eye reads as
     * a 120px lattice. That is the grid. Generating one non-repeating field at
     * viewport size has no period to lock onto.
     *
     * It also dithers the nebula: a gradient this dark bands into visible steps
     * without something breaking them up.
     */
    let grain: HTMLCanvasElement | null = null;
    let grainW = 0, grainH = 0;
    const buildGrain = () => {
      if (w === grainW && h === grainH) return;
      const cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(w));
      cv.height = Math.max(1, Math.round(h));
      const g = cv.getContext("2d");
      if (!g) return;
      const img = g.createImageData(cv.width, cv.height);
      const px = img.data;
      for (let i = 0; i < px.length; i += 4) {
        px[i] = 255;
        px[i + 1] = 255;
        px[i + 2] = 255;
        // Cubed so the field is sparse specks rather than a flat grey veil.
        const v = Math.random();
        px[i + 3] = v * v * v * 42;
      }
      g.putImageData(img, 0, 0);
      grain = cv;
      grainW = w;
      grainH = h;
    };

    /**
     * Meteors run as a small pool rather than one at a time, so streaks can
     * overlap. The cap is what keeps it a night sky instead of a screensaver.
     */
    const MAX_METEORS = 3;
    type Meteor = {
      x: number; y: number; vx: number; vy: number;
      life: number; decay: number; len: number; bright: number;
    };
    const meteors: Meteor[] = [];
    let nextMeteor = rand(0.5, 2.5);

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5;
      const speed = rand(420, 760);
      const ang = rand(0.35, 0.62);
      meteors.push({
        x: fromLeft ? rand(-0.1, 0.5) * w : rand(0.5, 1.1) * w,
        // Spread the entry band down the viewport so they are not all
        // clustered in the header.
        y: rand(-0.05, 0.6) * h,
        vx: Math.cos(ang) * speed * (fromLeft ? 1 : -1),
        vy: Math.sin(ang) * speed,
        life: 1,
        // Varied burn time — a field where every streak lasts the same
        // duration reads as a loop.
        decay: rand(0.6, 1.05),
        len: rand(70, 170),
        bright: rand(0.4, 0.7),
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
      if (!stars.length) buildStars();
      buildNebula();
      buildGrain();
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

      // ── nebula wash ──
      // Drawn oversized so it can drift and parallax without exposing an edge.
      // A static wash makes the whole field feel like a painted backdrop; the
      // drift is far too slow to notice directly, which is the point.
      if (nebula) {
        // Pad proportionally, not in fixed pixels. A flat 140px is 9% of a
        // desktop viewport but 36% of a phone, which shoved the second cloud
        // clean off the right edge on mobile.
        const pad = Math.max(48, Math.min(w, h) * 0.09);
        const lim = pad * 0.8;
        const clamp = (v: number) => Math.max(-lim, Math.min(lim, v));
        const nx = clamp(Math.sin(elapsed / 90) * pad * 0.2);
        const ny = clamp(Math.cos(elapsed / 130) * pad * 0.14 - scrollY * 0.02);
        ctx.globalAlpha = 1;
        ctx.drawImage(nebula, -pad + nx, -pad + ny, w + pad * 2, h + pad * 2);
      }
      if (grain) {
        ctx.globalAlpha = 1;
        ctx.drawImage(grain, 0, 0, w, h);
      }

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
        const twinkle = reduced ? 1 : 0.56 + 0.44 * (0.5 + 0.5 * tw);
        // Squared depth widens the spread between layers: near stars shift
        // ~7x further than the far ones, where the linear term gave 4x and
        // read as a single flat sheet sliding past. Near stars also travel
        // 3.7x further than before, so the depth is actually felt.
        const par = scrollY * (0.02 + s.depth * s.depth * 0.20);
        const py = (s.y * h - par) % (h + 40);
        const y = py < -20 ? py + h + 40 : py;
        const x = s.x * w;
        const a = s.base * twinkle;

        // Size breathes as well as brightness. Alpha alone at this scale is
        // nearly imperceptible — the growing and shrinking is what actually
        // reads as a star rather than a static dot.
        const scale = reduced ? 1 : 0.72 + 0.48 * (0.5 + 0.5 * tw);
        const rad = s.r * HALO * scale * (s.glint ? 2.6 : 1);

        ctx.globalAlpha = a;
        if (s.glint) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(s.spin);
          ctx.drawImage(s.sprite, -rad, -rad, rad * 2, rad * 2);
          ctx.restore();
        } else {
          ctx.drawImage(s.sprite, x - rad, y - rad, rad * 2, rad * 2);
        }
      }

      // ── meteors ──
      if (!reduced) {
        nextMeteor -= dt;
        if (nextMeteor <= 0) {
          if (meteors.length < MAX_METEORS) spawnMeteor();
          nextMeteor = rand(1.2, 4);
        }

        // Reverse walk so a splice does not skip the next entry.
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.life -= dt * m.decay;
          if (m.life <= 0 || m.y > h * 1.1 || m.x < -0.2 * w || m.x > 1.2 * w) {
            meteors.splice(i, 1);
            continue;
          }
          const sp = Math.hypot(m.vx, m.vy);
          const tx = m.x - (m.vx / sp) * m.len;
          const ty = m.y - (m.vy / sp) * m.len;
          const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
          g.addColorStop(0, `rgba(237,237,234,${m.bright * m.life})`);
          g.addColorStop(1, "rgba(237,237,234,0)");
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.lineCap = "butt";
        }
      }

      // ── orbits, centred above the fold and drifting slower than the page ──
      const cx = w * 0.5;
      const cy = h * 0.42 - scrollY * 0.04;
      const unit = Math.min(w, h);
      const sysAngle = (elapsed / SYSTEM_PERIOD) * Math.PI * 2;

      // Rings carry an angular falloff — brightest at the upper left, matching
      // the light source the rest of the page uses — because a perfectly even
      // circle reads as CAD linework.
      //
      // This used to be 40 separately-stroked segments, which is what made the
      // outer ring look pixelated: each 1px stroke at a 1075px radius has
      // almost no anti-aliasing gradient to work with, and the 0.006rad overlap
      // between segments was ~6.5px of double-compositing at every one of 40
      // joints, so the ring beaded. A conic gradient does the same falloff in a
      // single seamless stroke, and stroking it three times at falling widths
      // gives the edge a soft skirt instead of one hard pixel row.
      const conic = ringLight(cx, cy);
      if (conic) ctx.strokeStyle = conic;
      else ctx.strokeStyle = "rgba(237,237,234,0.65)";
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
        // travelling. Built from overlapping soft sprites, not hard circles —
        // 14 crisp discs spaced along an arc render as a dotted line, which is
        // what made the old trail look pixelated. These blend into each other.
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
    // what paints over what (light -> orbits -> grain -> vignette), instead of
    // a second negative z-index fighting the parent's stacking context.
    <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />
  );
}
