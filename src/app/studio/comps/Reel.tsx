"use client";

import Image from "next/image";
import Plate from "./Plate";
import { LuExternalLink } from "react-icons/lu";
import { offClockProfile, offClockFrames, offClockNote } from "../../data";

/**
 * Off-clock as a source monitor.
 *
 * This is the one comp whose document layout already suited a viewer, so the
 * change is smaller. The frames become a thumbnail strip with the device
 * beside them rather than a grid inside a centred column.
 */
export default function Reel() {
  return (
    <div className="st-seq relative flex h-full min-h-full flex-col justify-center gap-4 px-[4%] py-[2%] xl:flex-row xl:gap-10 xl:items-center">
      <Plate />

      <div className="relative min-w-0 flex-1">
        <span className="st-eyebrow">Footage</span>
        <p className="st-body mt-2.5 max-w-[58ch]">
          {offClockNote}
        </p>

        <div className="mt-3.5 grid grid-cols-3 gap-2 sm:gap-2.5">
          {offClockFrames.map((f, i) => (
            <div key={f.id}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[3px] border border-[var(--st-line-strong)] bg-black">
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(min-width: 1280px) 220px, 30vw"
                  className="object-cover saturate-[0.85]"
                />
                <span className="st-tc absolute left-1 top-1 rounded-[2px] bg-black/70 px-1 text-[8.5px] text-white/85">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <span className="st-label mt-2 block leading-[1.5]">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Program monitor, the account as it is actually watched.
          The device sat above the stats in one tall column, which pushed the
          handle past the bottom of the frame and made the one link out of this
          comp the only thing you had to scroll to find. Phone and figures are
          side by side now, and the handle is a button rather than a 10px
          uppercase label. */}
      <div className="relative flex shrink-0 items-center gap-5 xl:w-[350px]">
        <div className="relative w-[128px] shrink-0 sm:w-[150px]">
          <Image
            src={offClockProfile.device}
            alt={offClockProfile.alt}
            width={760}
            height={1713}
            sizes="150px"
            className="h-auto w-full"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="st-label">Program</span>
          <div className="mt-2.5 flex flex-col gap-2">
            {offClockProfile.stats.map((s) => (
              <div key={s.label}>
                <div className="st-metric-v text-[clamp(1.1rem,1.6vw,1.5rem)]">
                  {s.value}
                </div>
                <div className="st-label">{s.label}</div>
              </div>
            ))}
          </div>
          <a
            href={offClockProfile.href}
            target="_blank"
            rel="noopener noreferrer"
            className="st-btn mt-4 w-full gap-1.5 px-2.5 text-[11px] tracking-[-0.01em]"
          >
            <LuExternalLink aria-hidden className="shrink-0 text-[12px]" />
            {offClockProfile.handle}
          </a>
        </div>
      </div>
    </div>
  );
}
