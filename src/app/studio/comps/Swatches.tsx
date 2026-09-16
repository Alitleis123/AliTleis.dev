"use client";

import { stackGroups, type StackItem } from "../../data";
import { ICON_MAP, techColor } from "../../lib/techIcons";
import Plate from "./Plate";

/**
 * Stack as the effects panel.
 *
 * The first pass dropped the brand glyphs and rendered forty capabilities as
 * three columns of grey text with a small square beside each one, which read
 * as a directory listing and needed most of a screen of scrolling to get
 * through. The icons already exist in the project and they are the whole
 * reason this reads at a glance, so they are back, and the categories run down
 * a rail on the left the way an effects panel groups its plugins.
 *
 * The separate "presets" row of eight favourites is gone. Every item in it
 * also appeared in a group below, so it was the same information twice and it
 * was the reason this comp could not fit the frame.
 */

function Chip({ item }: { item: StackItem }) {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] : null;
  const color = techColor(item.name);
  return (
    <span className="group inline-flex items-center gap-[7px] rounded-[4px] border border-[var(--st-line-strong)] bg-[var(--st-panel)] px-2 py-1 text-[12px] sm:py-[5px] tracking-[-0.01em] text-[var(--st-dim)] transition-colors duration-150 hover:border-[var(--st-sel-line)] hover:bg-[var(--st-sel)] hover:text-[var(--st-text)]">
      {Icon ? (
        <Icon
          aria-hidden
          className="shrink-0 text-[13px] transition-transform duration-200 group-hover:scale-110"
          style={{ color }}
        />
      ) : null}
      {item.name}
    </span>
  );
}

export default function Swatches() {
  return (
    <div className="st-seq relative flex h-full min-h-full flex-col px-[4%] py-[3%]">
      <Plate src="plate-stack.webp" />
      <div className="relative flex items-baseline gap-3">
        <span className="st-eyebrow">Effects panel</span>
        <span className="st-label">
          {stackGroups.reduce((n, g) => n + g.items.length, 0)} installed
        </span>
      </div>

      <div className="relative mt-4 flex min-h-0 flex-1 flex-col justify-center gap-2.5 sm:gap-5">
        {stackGroups.map((g) => (
          <section
            key={g.title}
            className="grid gap-x-6 gap-y-1.5 border-t border-[var(--st-line)] pt-3 sm:gap-y-2 sm:pt-4 sm:grid-cols-[8.5rem_minmax(0,1fr)]"
          >
            <div className="flex items-baseline gap-2 sm:flex-col sm:gap-1">
              <h3 className="text-[12.5px] font-medium leading-[1.3] tracking-[-0.01em] text-[var(--st-text)]">
                {g.title}
              </h3>
              <span className="st-tc text-[10px] text-[var(--st-faint)]">
                {String(g.items.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((i) => (
                <Chip key={i.name} item={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
