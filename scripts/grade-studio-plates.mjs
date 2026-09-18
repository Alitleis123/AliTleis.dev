/**
 * Grades the studio comp backdrops down to plate brightness.
 *
 * Each comp's plate is the same scene as its clip on the timeline. They used to
 * be unrelated art, so the clip you clicked showed a city and the comp it
 * opened showed a server room, and the timeline stopped reading as footage of
 * anything. The plate and the strip are now the same place.
 *
 * The sources are generated, not shot, at 16:9 and full exposure. They are too
 * bright to use directly: a backdrop has to lose to the copy in front of it,
 * and a plate that looks correct on its own is far too loud behind text. This
 * scales each one to a target mean and re-encodes it at plate size.
 *
 *   npm run grade:plates [sourceDir]     (default ../plate-src relative to cwd)
 *
 * Sources are not committed, because five full-exposure PNGs are about 8MB
 * against 60KB of output. Regenerate them with the codex-image skill and the
 * prompts below, then rerun this. Each was generated with the comp's existing
 * strip passed as a reference image, which is what keeps the scene matched:
 *
 *   projects    Extreme out-of-focus night city lights seen through a window.
 *               Dense field of warm amber, gold and soft white bokeh circles.
 *   experience  Long empty laboratory corridor at night, far out of focus.
 *               Warm overhead lighting receding, polished floor reflecting it.
 *   stack       Extreme macro of a circuit board under warm light, out of
 *               focus. Components as soft glinting shapes, gold traces.
 *   offclock    Long exposure of warm light trails sweeping across the frame
 *               at a shallow angle, smooth motion blur, deep black.
 *   resume      Raking warm lamplight across rough concrete, close and out of
 *               focus. Grain catching light one side, deep black the other.
 *
 * All five ask for no people, no text and no logos, since anything legible
 * behind body copy is noise and generated lettering is gibberish anyway.
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const W = 1600;
const H = 900;
const OUT = path.join(process.cwd(), "public", "studio");
const SRC = path.resolve(process.argv[2] ?? path.join(process.cwd(), "..", "plate-src"));

/**
 * Mean luminance to grade every plate to.
 *
 * Chosen from the other end, the screen rather than the file. What a visitor
 * sees is roughly the plate's mean times the light the scrim lets past, and
 * the plates this replaced worked out to about 1 of 255 that way, which is the
 * reason they read as flat black. At 27 under a 0.55 scrim this lands nearer
 * 12: present at a glance, still well under the copy.
 *
 * Grading them all to one number is also what keeps the comps looking like one
 * set. Matching by eye drifted, because a frame of small bright highlights and
 * a frame of broad soft light read differently at the same exposure.
 */
const TARGET_MEAN = 27;

const build = async (name, file) => {
  const src = sharp(file).resize(W, H, { fit: "cover", position: "centre" });
  const { channels } = await src.clone().stats();
  // Rec. 709 luma, so a warm plate is not judged by its red channel alone.
  const luma =
    channels[0].mean * 0.2126 + channels[1].mean * 0.7152 + channels[2].mean * 0.0722;
  const scale = TARGET_MEAN / luma;

  const out = path.join(OUT, `plate-${name}.webp`);
  await src.linear(scale, 0).webp({ quality: 82 }).toFile(out);

  const after = await sharp(out).stats();
  const mean = after.channels.map((c) => c.mean.toFixed(1)).join("/");
  const max = after.channels.map((c) => c.max).join("/");
  const kb = Math.round((await stat(out)).size / 1024);
  console.log(
    `plate-${name}  x${scale.toFixed(3)}  mean ${mean.padEnd(18)} max ${max.padEnd(14)} ${kb}KB`,
  );
};

const files = (await readdir(SRC)).filter((f) => /^plate-.*\.(png|jpe?g|webp)$/i.test(f));
if (!files.length) {
  console.error(`No plate-*.png sources in ${SRC}`);
  process.exit(1);
}
for (const f of files.sort()) {
  await build(f.replace(/^plate-/, "").replace(/\.[^.]+$/, ""), path.join(SRC, f));
}
