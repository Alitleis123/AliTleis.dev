import type { ComponentType } from "react";
import ExerlyCover from "../components/projectCovers/ExerlyCover";
import EternalMonitorCover from "../components/projectCovers/EternalMonitorCover";
import EternalSummaryCover from "../components/projectCovers/EternalSummaryCover";
import Upflow2xCover from "../components/projectCovers/Upflow2xCover";

/**
 * Purpose-drawn covers, keyed by a project's `coverKey`.
 *
 * Shared by the written page and the studio's source monitor. Each cover is an
 * absolutely positioned SVG built against a 800x450 viewBox, so it wants a
 * 16:9 box with `position: relative` around it and nothing else.
 */
export const COVER_MAP: Record<string, ComponentType> = {
  exerly: ExerlyCover,
  eternalMonitor: EternalMonitorCover,
  eternalSummary: EternalSummaryCover,
  upflow2x: Upflow2xCover,
};
