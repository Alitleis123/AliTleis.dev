import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Content hash of a file in the repo, used to cache-bust its URL.
 *
 * An asset at a fixed path will be served from cache for as long as the
 * browser likes, so replacing the bytes without changing the URL means a fresh
 * deploy can keep showing the old file. Appending ?v=<hash> changes the URL
 * only when the contents actually change.
 *
 * This bit the resume PDF first (Chrome's embedded viewer is especially
 * stubborn), then the off-clock device render, which was replaced in place and
 * kept rendering the previous orientation.
 */
function contentHash(relPath: string): string {
  try {
    const buf = readFileSync(path.join(process.cwd(), relPath));
    return createHash("sha256").update(buf).digest("hex").slice(0, 10);
  } catch {
    return "";
  }
}

/**
 * The day a PDF was made, as "Oct 19, 2026", read from its /CreationDate.
 *
 * The Resume repo pins pdfTeX's clock to the commit that last touched
 * resume.tex, so for the resume this is the day its content last changed, not
 * the day the site happened to be rebuilt.
 */
function pdfDate(relPath: string): string {
  try {
    const m = /\/CreationDate\s*\(D:(\d{4})(\d{2})(\d{2})/.exec(
      readFileSync(path.join(process.cwd(), relPath), "latin1"),
    );
    if (!m) return "";
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
    );
  } catch {
    return "";
  }
}

/**
 * The timeline's "Now" marker is resolved here rather than in the component so
 * the value is baked into both the server HTML and the client bundle at build
 * time. Calling `new Date()` inside the client component instead would drift
 * out of sync with the statically exported HTML and trip hydration.
 */
const buildDate = new Date();
const nowSortKey = `${buildDate.getFullYear()}-${String(
  buildDate.getMonth() + 1,
).padStart(2, "0")}`;
const nowLabel = buildDate.toLocaleDateString("en-US", {
  month: "short",
  year: "numeric",
});

const nextConfig: NextConfig = {
  // Next's dev badge anchors bottom-left, on top of the ambient-audio button.
  // Development only, but it makes that control unclickable while working.
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
    NEXT_PUBLIC_NOW_SORTKEY: nowSortKey,
    NEXT_PUBLIC_NOW_LABEL: nowLabel,
    NEXT_PUBLIC_BUILD_YEAR: String(buildDate.getFullYear()),
    NEXT_PUBLIC_RESUME_V: contentHash("public/resume/resume.pdf"),
    NEXT_PUBLIC_RESUME_DATE: pdfDate("public/resume/resume.pdf"),
    NEXT_PUBLIC_RESUME_PREVIEW_V: contentHash("public/studio/resume-page.webp"),
    NEXT_PUBLIC_PHONE_V: contentHash("public/offclock/phone.webp"),
  },
};

export default nextConfig;
