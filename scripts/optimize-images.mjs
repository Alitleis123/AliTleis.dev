/**
 * Resizes and re-encodes the images in public/ to WebP.
 *
 * Why this exists: `output: "export"` rules out Next's Image Optimization API,
 * so `images.unoptimized` is on and every <img> gets the raw file. The card
 * screenshots were ~2800px wide rendering into ~650px slots, which made
 * Chromium re-run a high-quality downscale of a ~6MP bitmap on every raster
 * pass — the main cause of choppy scrolling.
 *
 * Run after adding or replacing any image:  npm run optimize:images
 *
 * Idempotent: sources are matched by extension, so re-running only touches
 * newly added PNG/JPG files. Originals are deleted after a successful encode
 * (they stay recoverable in git history).
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");

/** maxWidth is chosen per directory from how large the images actually render. */
const TARGETS = [
  // Card heroes render ~650px wide but open full-screen in the lightbox.
  { dir: "projects", maxWidth: 1600 },
  // Logo tiles render at 64x64.
  { dir: "Timeline", maxWidth: 192 },
  // Hero portrait renders at most 20rem / 320px wide.
  { dir: "portrait", maxWidth: 900 },
];

/** Favicon/apple-icon must stay PNG — keep the format, just shrink it. */
const KEEP_AS_PNG = new Set(["Portfolio ICON.png"]);

const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg"]);
const kb = (bytes) => Math.round(bytes / 1024);

let totalBefore = 0;
let totalAfter = 0;
const rows = [];

for (const { dir, maxWidth } of TARGETS) {
  const abs = path.join(ROOT, dir);
  let entries;
  try {
    entries = await readdir(abs);
  } catch {
    console.log(`skip ${dir}/ (not found)`);
    continue;
  }

  for (const name of entries) {
    const ext = path.extname(name).toLowerCase();
    if (!SOURCE_EXT.has(ext)) continue;

    const src = path.join(abs, name);
    const before = (await stat(src)).size;
    const image = sharp(src);
    const { width, height } = await image.metadata();

    if (KEEP_AS_PNG.has(name)) {
      const buf = await image
        .resize({ width: Math.min(256, width), withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer();
      await sharp(buf).toFile(src);
      const after = (await stat(src)).size;
      totalBefore += before;
      totalAfter += after;
      rows.push([`${dir}/${name}`, `${width}x${height}`, kb(before), kb(after), "png"]);
      continue;
    }

    const outName = `${path.basename(name, path.extname(name))}.webp`;
    const out = path.join(abs, outName);

    await image
      .resize({ width: Math.min(maxWidth, width), withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(out);

    const after = (await stat(out)).size;
    const meta = await sharp(out).metadata();
    await unlink(src);

    totalBefore += before;
    totalAfter += after;
    rows.push([
      `${dir}/${outName}`,
      `${width}x${height} -> ${meta.width}x${meta.height}`,
      kb(before),
      kb(after),
      "webp",
    ]);
  }
}

if (rows.length === 0) {
  console.log("Nothing to optimize — no PNG/JPG sources found.");
} else {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    pad("file", 44) + pad("dimensions", 26) + "before".padStart(8) + "after".padStart(8),
  );
  for (const [file, dims, before, after] of rows) {
    console.log(pad(file, 44) + pad(dims, 26) + `${before}K`.padStart(8) + `${after}K`.padStart(8));
  }
  const saved = Math.round((1 - totalAfter / totalBefore) * 100);
  console.log(
    `\n${rows.length} images: ${kb(totalBefore)}K -> ${kb(totalAfter)}K (${saved}% smaller)`,
  );
  console.log("Remember: references in src/app/data.ts must use the .webp extension.");
}
