import type { ComponentType } from "react";
import ExerlyCover from "../components/projectCovers/ExerlyCover";
import Eternal2xCover from "../components/projectCovers/Eternal2xCover";
import EternalMonitorCover from "../components/projectCovers/EternalMonitorCover";
import EternalSummaryCover from "../components/projectCovers/EternalSummaryCover";

/**
 * Purpose-drawn covers, keyed by a project's `coverKey`.
 *
 * Shared by the written page and the studio's source monitor. Each cover is an
 * absolutely positioned SVG built against a 800x450 viewBox, so it wants a
 * 16:9 box with `position: relative` around it and nothing else.
 */
export const COVER_MAP: Record<string, ComponentType> = {
  exerly: ExerlyCover,
  eternal2x: Eternal2xCover,
  eternalMonitor: EternalMonitorCover,
  eternalSummary: EternalSummaryCover,
};
