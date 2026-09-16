"use client";

import Image from "next/image";
import { withBasePath } from "../../data";

/**
 * The plate a comp sits on.
 *
 * Three comps were rendering straight onto flat panel grey, which is what made
 * them read as unstyled next to the two that had generated backdrops. This is
 * the same treatment in one place: a very dark image, a scrim over it, and a
 * vignette so the edges fall away from the content.
 *
 * `scrim` is the opacity of the flat wash between the image and the content.
 * Comps carrying long body copy want it high. A comp that is mostly headline
 * can afford less and let more of the image through.
 */
export default function Plate({
  src,
  scrim = 0.82,
}: {
  /** File name inside public/studio, without the directory. */
  src: string;
  scrim?: number;
}) {
  return (
    <div aria-hidden className="st-plate pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={withBasePath(`/studio/${src}`)}
        alt=""
        fill
        sizes="100vw"
        className="st-drift object-cover"
      />
      <span
        className="absolute inset-0 bg-[var(--st-stage)]"
        style={{ opacity: scrim }}
      />
      {/* Vignette, so the plate never competes with a panel edge. */}
      <span
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 40%, var(--st-stage) 100%)",
        }}
      />
    </div>
  );
}
