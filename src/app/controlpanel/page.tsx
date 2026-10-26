import type { Metadata } from "next";
import ControlPanel from "./ControlPanel";

// Kept out of search results. The page itself holds no data, only the lock.
export const metadata: Metadata = {
  title: "Control panel · Ali Tleis",
  robots: { index: false, follow: false },
};

export default function ControlPanelPage() {
  return <ControlPanel />;
}
