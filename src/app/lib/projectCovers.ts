import type { ComponentType } from "react";
import SidebandCover from "../components/projectCovers/SidebandCover";
import Eternal2xCover from "../components/projectCovers/Eternal2xCover";
import TopChoiceRealtyCover from "../components/projectCovers/TopChoiceRealtyCover";
import EternalSummaryCover from "../components/projectCovers/EternalSummaryCover";

/**
 * Purpose-drawn covers, keyed by a project's `coverKey`.
 *
 * Shared by the written page and the studio's source monitor. Each cover is an
 * absolutely positioned SVG built against a 800x450 viewBox, so it wants a
 * 16:9 box with `position: relative` around it and nothing else.
 */
export const COVER_MAP: Record<string, ComponentType> = {
  sideband: SidebandCover,
  eternal2x: Eternal2xCover,
  topChoiceRealty: TopChoiceRealtyCover,
  eternalSummary: EternalSummaryCover,
};
