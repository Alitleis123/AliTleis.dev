import type { NextConfig } from "next";

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
  },
};

export default nextConfig;
