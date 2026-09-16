import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SITE_URL } from "./data";
import "./globals.css";
import SiteShell from "./components/SiteShell";

const DESCRIPTION =
  "Personal portfolio of Ali Tleis. CS student at Northeastern, Web Application Developer (AI Integration) at MIT Lincoln Laboratory. Full-stack platforms, automation pipelines, and tooling that ships.";

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
  icons: {
    icon: "/portrait/Portfolio ICON.png",
    apple: "/portrait/Portfolio ICON.png",
  },
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
