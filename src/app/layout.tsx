import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import ResetAnimationsOnLoad from "./components/ResetAnimationsOnLoad";
import "./globals.css";
import BackgroundRings from "./components/BackgroundRings";
import NavBar from "./components/NavBar";
import ScrollToTop from "./components/ScrollToTop";

export const metadata: Metadata = {
  title: "Ali Tleis · Portfolio",
  description:
    "Personal portfolio of Ali Tleis — Lebanese-American developer based in Boston.",
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} scroll-smooth`}>
      <head />
      <body className="relative min-h-screen bg-black text-white antialiased">
        <ResetAnimationsOnLoad>
          <BackgroundRings />

          <header className="fixed top-4 left-1/2 z-20 w-[92%] max-w-6xl -translate-x-1/2 rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md">
            <div className="relative flex items-center justify-between px-6 py-3">
              <span className="text-sm font-semibold tracking-wide text-white/90">
                Ali Tleis
              </span>
              <NavBar />
            </div>
          </header>

          <main className="relative z-10 pt-28">{children}</main>

          <footer className="relative z-10 mt-20 border-t border-white/5 bg-black/40 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
              <span className="text-sm font-semibold tracking-wide text-white/80">Ali Tleis</span>
              <p className="text-xs text-zinc-500">
                Built with Next.js, Tailwind CSS &amp; Framer Motion
              </p>
              <p className="text-[11px] text-zinc-600">
                &copy; {new Date().getFullYear()} Ali Tleis. All rights reserved.
              </p>
            </div>
          </footer>

          <ScrollToTop />
        </ResetAnimationsOnLoad>
      </body>
    </html>
  );
}
