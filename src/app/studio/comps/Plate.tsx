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
 * could have helped: there was nothing behind the wash to let through. A pair
 * of very dim pools in the one accent reads as a lit stage rather than as an
 * unfinished one, and stays in the same family as the photographic plates,
 * which at these scrims are most of the way to being luminance fields anyway.
 *
 * The flat wash is skipped in that case. Laying 70% of the stage colour over a
 * gradient this faint would erase it.
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
            background:
              "radial-gradient(85% 65% at 78% 16%, rgba(var(--signal-rgb),0.07), transparent 60%), radial-gradient(75% 60% at 12% 90%, rgba(var(--signal-rgb),0.035), transparent 58%)",
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
