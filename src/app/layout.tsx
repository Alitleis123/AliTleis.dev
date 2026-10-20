import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SITE_URL } from "./data";
import "./globals.css";
import SiteShell from "./components/SiteShell";

// What a search result and a link preview show, so it carries the same facts
// as the intro rather than lines that could sit on anyone's site.
const DESCRIPTION =
  "I'm a CS and Sociology student at Northeastern, on co-op at MIT Lincoln Laboratory, where I own the internal AI search 4,500+ engineers use. I also build Eternal2x and EternalMonitor's AMD GPU support.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ali Tleis · Portfolio",
  description: DESCRIPTION,
  keywords: [
    "Ali Tleis",
    "software engineer",
    "full-stack developer",
    "Northeastern University",
    "MIT Lincoln Laboratory",
    "React",
    "TypeScript",
    "Next.js",
  ],
  authors: [{ name: "Ali Tleis", url: SITE_URL }],
  creator: "Ali Tleis",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Ali Tleis",
    title: "Ali Tleis · Software Engineer",
    description: DESCRIPTION,
    locale: "en_US",
    // og:image is wired automatically from src/app/opengraph-image.png
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Tleis · Software Engineer",
    description: DESCRIPTION,
  },
  // No icons block on purpose. src/app/icon.png and src/app/apple-icon.png
  // are picked up by Next's file convention, which content-hashes them and
  // emits the sizes and type attributes. An explicit icons entry here
  // overrides that convention, which is what kept the old mark live after the
  // files were replaced.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head />
      <body className="relative min-h-screen bg-[var(--background)] font-sans text-[var(--text-strong)] antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
