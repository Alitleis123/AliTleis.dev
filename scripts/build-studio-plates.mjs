/**
 * Generates the backdrop plates for the two comps that have no art of their own.
 *
 * Five of the seven comps sit on a photographic plate. Resume and Off-clock had
 * nothing behind them, so they rendered onto flat stage black and read as
 * unstyled next to the rest. Lighting them with a CSS wash was not enough: a
 * gradient with no structure in it still looks like an empty panel, because
 * what sells a backdrop is detail you can almost resolve.
 *
 * These are built rather than shot. Both are fields of light and shadow with no
 * subject in them, which is what the existing plates amount to once they are
 * this dark and this far out of focus.
 *
 * Deterministic, so a rerun reproduces the same two files rather than quietly
 * reshuffling the art under a commit.
 *
 *   node scripts/build-studio-plates.mjs
 *
 * Peak brightness is held low on purpose. These sit under a scrim of about 0.6
 * in Plate.tsx, so anything that looks correct as a standalone image is far too
 * bright by the time it is behind body copy.
 */
import path from "node:path";
import sharp from "sharp";

const W = 1600;
const H = 900;
const OUT = path.join(process.cwd(), "public", "studio");

/** Seeded, so the art is a function of this file and not of the run. */
const rng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
};

/** Value noise on a lattice, bilinear between corners, a few octaves deep. */
const noiseField = (seed, cells) => {
  const rand = rng(seed);
  const g = [];
  for (let y = 0; y <= cells; y++) {
    const row = [];
    for (let x = 0; x <= cells; x++) row.push(rand());
    g.push(row);
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  return (u, v) => {
    const x = u * cells;
    const y = v * cells;
    const x0 = Math.min(cells, Math.floor(x));
    const y0 = Math.min(cells, Math.floor(y));
    const x1 = Math.min(cells, x0 + 1);
    const y1 = Math.min(cells, y0 + 1);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const a = g[y0][x0] + (g[y0][x1] - g[y0][x0]) * fx;
    const b = g[y1][x0] + (g[y1][x1] - g[y1][x0]) * fx;
    return a + (b - a) * fy;
  };
};

const octaves = (seed, base) => {
  const a = noiseField(seed, base);
  const b = noiseField(seed + 77, base * 2);
  const c = noiseField(seed + 911, base * 4);
  return (u, v) => a(u, v) * 0.6 + b(u, v) * 0.28 + c(u, v) * 0.12;
};

/** Stage black, the floor every plate sits on. */
const BASE = [0.022, 0.022, 0.036];
/** The warm the rest of the suite is graded to. */
const WARM = [1.0, 0.66, 0.36];
const COOL = [0.36, 0.45, 0.72];

/** Elliptical falloff, 1 at the centre and 0 past the radii. */
const bloom = (u, v, cx, cy, rx, ry) => {
  const dx = (u - cx) / rx;
  const dy = (v - cy) / ry;
  const d = Math.sqrt(dx * dx + dy * dy);
  return d >= 1 ? 0 : Math.pow(Math.cos((d * Math.PI) / 2), 2);
};

/**
 * A defocused highlight. Flat across most of its face and soft at the rim,
 * which is what a point of light actually becomes through a lens that is not
 * focused on it, and the reason the plates already here read as photographs
 * rather than as gradients.
 */
const disc = (u, v, cx, cy, r, aspect = 1) => {
  const dx = (u - cx) / r;
  const dy = (v - cy) / (r * aspect);
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d >= 1) return 0;
  if (d <= 0.62) return 1 - 0.12 * (d / 0.62);
  const t = (d - 0.62) / 0.38;
  return 0.88 * (1 - t * t * (3 - 2 * t));
};

/**
 * A light streak: a line at `angle` through (cx, cy), bright along its length
 * and falling off gaussian-wise across its thickness.
 */
const streak = (u, v, cx, cy, angle, len, thick) => {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const dx = u - cx;
  const dy = v - cy;
  const along = dx * ca + dy * sa;
  const across = -dx * sa + dy * ca;
  if (Math.abs(along) > len) return 0;
  const taper = Math.pow(Math.cos((along / len) * (Math.PI / 2)), 2);
  return taper * Math.exp(-(across * across) / (2 * thick * thick));
};

/**
 * Builds an RGB buffer from a per-pixel function returning warm and cool light
 * amounts.
 *
 * The curve is the whole trick. Measured against the plates already here, the
 * house look is a mean around 2 to 5 with peaks up to 200: almost entirely
 * black, carrying a few small highlights that are genuinely bright. Summing
 * soft falloffs linearly gives the opposite, an even grey haze that reads as a
 * flat panel no matter how much of it there is. Raising the light to a power
 * crushes everything mid and leaves only the cores standing.
 */
const CURVE = 3.5;
const PEAK = 0.82;

const render = (fn, grainSeed) => {
  const grain = rng(grainSeed);
  const buf = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const { warm, cool } = fn(u, v);
      // Soft ceiling. Highlights overlap, and a hard clip at white would take
      // the warm grade off exactly the parts of the plate that carry it.
      const knee = (t) => (t <= 0.7 ? t : 0.7 + (1 - Math.exp(-(t - 0.7) * 1.9)) * 0.34);
      const w = Math.pow(knee(Math.max(0, warm)), CURVE) * PEAK;
      const c = Math.pow(knee(Math.max(0, cool)), CURVE) * PEAK;
      // Vignette last, so it pulls every layer away from the panel edge.
      const vig =
        1 - 0.72 * Math.pow(Math.min(1, Math.hypot((u - 0.5) / 0.62, (v - 0.42) / 0.68)), 2.1);
      const n = (grain() - 0.5) * 0.008;
      const i = (y * W + x) * 3;
      for (let ch = 0; ch < 3; ch++) {
        const lit = BASE[ch] + WARM[ch] * w + COOL[ch] * c;
        buf[i + ch] = Math.max(0, Math.min(255, (lit * vig + n) * 255));
      }
    }
  }
  return buf;
};

/**
 * Scatters defocused highlights over a region, brightest where the light is.
 *
 * `weight` decides both how likely a highlight is to survive and how hard it
 * burns, so the field thins out into the dark corners on its own rather than
 * being masked off afterwards.
 */
const scatter = (seed, count, weight, gainScale = 1) => {
  const rand = rng(seed);
  const out = [];
  for (let k = 0; k < count; k++) {
    const cx = rand();
    const cy = rand();
    const r = 0.008 + Math.pow(rand(), 2.2) * 0.055;
    const roll = rand();
    const w = weight(cx, cy);
    if (roll > w * 1.35) continue;
    out.push({ cx, cy, r, aspect: 0.8 + rand() * 0.5, gain: (0.12 + rand() * 0.34) * w * gainScale });
  }
  return out;
};

/**
 * Resume. A lamp over a desk in a room with things in it, thrown well out of
 * focus. The light is off to one side so the plate has a direction rather than
 * a glow parked in the middle of the frame.
 *
 * The highlights are the point. A single falloff, however well tuned, still
 * reads as an empty panel, because what sells a backdrop is detail the eye
 * almost resolves.
 */
const resume = () => {
  const n = octaves(20260917, 3);
  const lampX = 0.31;
  const lampY = 0.3;
  // Denser and hotter near the lamp, gone by the far corners.
  const near = (x, y) => {
    const d = Math.hypot((x - lampX) / 0.72, (y - lampY) / 0.8);
    return Math.max(0, 1 - d);
  };
  const specks = scatter(9901, 190, (x, y) => Math.pow(near(x, y), 1.3));
  return (u, v) => {
    const field = 0.8 + 0.2 * n(u, v);

    let warm = 0.07 + 0.05 * n(u * 1.3, v * 1.3);
    warm += bloom(u, v, lampX, lampY, 0.54, 0.6) * 0.26 * field;
    warm += bloom(u, v, lampX, lampY, 0.13, 0.15) * 0.34;
    warm += bloom(u, v, 0.79, 0.75, 0.36, 0.32) * 0.13 * field;

    for (const p of specks) {
      const d = disc(u, v, p.cx, p.cy, p.r, p.aspect);
      if (d > 0) warm += d * p.gain;
    }

    const cool = bloom(u, v, 0.89, 0.13, 0.42, 0.46) * 0.22;
    return { warm, cool };
  };
};

/**
 * Off-clock. A night street thrown equally out of focus, which is close enough
 * to what a reel of personal work already is. Lights along a low band with the
 * trails of things that moved while the shutter was open.
 */
const offclock = () => {
  const n = octaves(864213, 3);
  const fine = octaves(77123, 11);
  const rand = rng(31337);
  // Lights gather along a band rather than filling the frame, so the plate
  // keeps a horizon and does not read as scattered confetti.
  const band = (x, y) => {
    const h = Math.exp(-Math.pow((y - 0.44) / 0.26, 2));
    const across = 0.55 + 0.45 * Math.sin(x * 4.1 + 1.2);
    return Math.max(0, h * across);
  };
  const lights = scatter(4477, 210, (x, y) => Math.pow(band(x, y), 1.1), 2.1);
  const trails = Array.from({ length: 5 }, () => ({
    cx: 0.1 + rand() * 0.8,
    cy: 0.18 + rand() * 0.64,
    angle: -0.3 + (rand() - 0.5) * 0.16,
    len: 0.2 + rand() * 0.36,
    thick: 0.009 + rand() * 0.016,
    gain: 0.34 + rand() * 0.3,
  }));
  return (u, v) => {
    const field = 0.78 + 0.22 * n(u, v);

    let warm = 0.06 + 0.05 * n(u * 1.4, v * 1.4);
    warm += bloom(u, v, 0.46, 0.46, 0.7, 0.6) * 0.1 * field;

    for (const p of lights) {
      const d = disc(u, v, p.cx, p.cy, p.r, p.aspect);
      if (d > 0) warm += d * p.gain;
    }
    for (const t of trails) {
      const st = streak(u, v, t.cx, t.cy, t.angle, t.len, t.thick);
      if (st > 0) warm += st * t.gain * (0.8 + 0.2 * fine(u, v));
    }

    const cool = bloom(u, v, 0.1, 0.12, 0.48, 0.52) * 0.2;
    return { warm, cool };
  };
};

const build = async (name, fn, grainSeed) => {
  const raw = render(fn, grainSeed);
  const file = path.join(OUT, name);
  await sharp(raw, { raw: { width: W, height: H, channels: 3 } })
    // Out of focus, the way every other plate here is. The blur is what turns
    // procedural edges into something that reads as photographed.
    .blur(5)
    .webp({ quality: 82 })
    .toFile(file);
  const { mean, max } = (await sharp(file).stats()).channels[0];
  console.log(
    `${name}  mean=${mean.toFixed(1)}  max=${max}  ${(await sharp(file).metadata()).size / 1024 | 0}KB`,
  );
};

await build("plate-resume.webp", resume(), 4242);
await build("plate-offclock.webp", offclock(), 8888);
