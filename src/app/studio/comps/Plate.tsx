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
 *
 * With no `src` the plate lights itself instead. Two comps have no plate art of
 * their own and were rendering onto flat stage black, which no amount of scrim
 * could have helped: there was nothing behind the wash to let through.
 *
 * Four layers rather than a wash, because one smooth pool over black is what
 * reads as a plain background even once it is bright enough to see. A key high
 * on the right, a dimmer fill low on the left, a cool pocket between them so
 * the whole thing is not one temperature, and a slow diagonal sweep to break
 * the symmetry the pools would otherwise have. That is roughly how the
 * photographic plates behave once their scrim is on, so the two kinds of comp
 * sit together.
 *
 * The flat wash is skipped in this case. Laying 70% of the stage colour over
 * gradients this faint would erase them.
 */
export default function Plate({
  src,
  scrim = 0.82,
}: {
  /** File name inside public/studio, without the directory. Omit it for a comp
      that has no plate art. */
  src?: string;
  scrim?: number;
}) {
  return (
    <div aria-hidden className="st-plate pointer-events-none absolute inset-0 overflow-hidden">
      {src ? (
        <>
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
        </>
      ) : (
        <span
          className="absolute inset-0"
          style={{
            background: [
              // Key, high right.
              "radial-gradient(68% 55% at 76% 10%, rgba(var(--signal-rgb),0.17), transparent 63%)",
              // Fill, low left.
              "radial-gradient(62% 52% at 8% 94%, rgba(var(--signal-rgb),0.085), transparent 60%)",
              // A cooler pocket, so the stage is not lit in one temperature.
              "radial-gradient(52% 46% at 34% 34%, rgba(126,156,214,0.055), transparent 66%)",
              // Sweep, to break the symmetry of two opposed pools.
              "linear-gradient(118deg, transparent 36%, rgba(var(--signal-rgb),0.05) 52%, transparent 68%)",
            ].join(", "),
          }}
        />
      )}
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
