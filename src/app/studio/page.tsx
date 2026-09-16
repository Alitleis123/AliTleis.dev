import type { Metadata } from "next";
import Studio from "./Studio";

export const metadata: Metadata = {
  title: "Ali Tleis · Editing suite",
  description:
    "Ali Tleis's portfolio as a video editor. Scrub a timeline to move between compositions, or press play for a guided run through the work.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return <Studio />;
}
