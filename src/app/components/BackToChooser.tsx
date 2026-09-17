import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";

/**
 * The way back to the chooser.
 *
 * Both front ends sit one click behind the bare domain, and the only way back
 * was the browser's own button. That works for someone who came through the
 * chooser and does nothing at all for someone who arrived on a direct link,
 * because there is no history entry to go back to. The two views could reach
 * each other and neither could reach the page that offers them.
 *
 * Top left in both, opposite the view switch. The control that leaves the
 * pair sits apart from the one that moves between them, and it lands in the
 * corner where a visitor already looks for a way out.
 *
 * Built to read as a sibling of that switch rather than as a second kind of
 * button: same pill, same tones, same sizes.
 */
export default function BackToChooser({
  tone = "studio",
}: {
  /** Matches the palette of whichever route it is sitting in. */
  tone?: "studio" | "document";
}) {
  const shell =
    tone === "studio"
      ? "border-[var(--st-line-strong)] bg-[var(--st-panel)]"
      : "border-[var(--border-soft)] bg-white/[0.04]";

  const segment =
    tone === "studio"
      ? "text-[var(--st-dim)] hover:bg-[var(--st-hover)] hover:text-[var(--st-text)]"
      : "text-white/70 hover:bg-white/[0.07] hover:text-white";

  return (
    <div className={`flex shrink-0 items-center rounded-full border p-0.5 ${shell}`}>
      <Link
        href="/"
        // Named in full for a screen reader whatever the width, since the
        // word itself is dropped on a narrow bar.
        aria-label="Back to the main screen"
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11.5px] tracking-[-0.01em] transition-colors duration-150 ${segment}`}
      >
        <LuArrowLeft aria-hidden className="shrink-0 text-[13px]" />
        {/* Dropped below md, the same width the switch drops its label at.
            Two controls abbreviating at different points would leave the bar
            looking half finished at one size and not another. */}
        <span className="hidden md:inline">Main screen</span>
      </Link>
    </div>
  );
}
