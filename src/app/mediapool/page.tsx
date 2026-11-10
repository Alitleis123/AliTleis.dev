import type { Metadata } from "next";
import Door from "./Door";

// Kept out of search results. The page holds nothing of Media Pool, only the way in.
export const metadata: Metadata = {
  title: "Media Pool · Ali Tleis",
  robots: { index: false, follow: false },
};

export default function MediaPoolPage() {
  return <Door />;
}
