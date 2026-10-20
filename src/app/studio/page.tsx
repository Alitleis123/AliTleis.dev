import type { Metadata } from "next";
import Studio from "./Studio";

export const metadata: Metadata = {
  title: "Ali Tleis · Editing suite",
  description:
    "Ali Tleis's engineering work, laid out as a video editor's timeline. Scrub between the roles and projects, or press play for a guided run through them.",
  alternates: { canonical: "/studio/" },
};

export default function StudioPage() {
  return <Studio />;
}
