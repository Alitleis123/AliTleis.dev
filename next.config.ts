import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Content hash of the resume PDF, used to cache-bust its URL.
 *
 * The PDF lives at a fixed path, so browsers (and Chrome's embedded PDF viewer
 * especially) will happily serve a stale copy for as long as their cache
 * allows — meaning a freshly deployed resume can keep showing the old one.
 * Appending ?v=<hash> changes the URL only when the bytes change.
 */
function resumeVersion(): string {
  try {
    const buf = readFileSync(path.join(process.cwd(), "public/resume/resume.pdf"));
    return createHash("sha256").update(buf).digest("hex").slice(0, 10);
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
    NEXT_PUBLIC_RESUME_V: resumeVersion(),
  },
};

export default nextConfig;
