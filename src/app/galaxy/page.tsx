import Contact from "../components/sections/Contact";
import Intro from "../components/sections/Intro";
import OffClock from "../components/sections/OffClock";
import Projects from "../components/sections/Projects";
import Resume from "../components/sections/Resume";
import Stack from "../components/sections/Stack";
import Timeline from "../components/sections/Timeline";

/**
 * The reading view.
 *
 * Scrolling is a thing every visitor already knows how to do, so this is the
 * one to send anybody who is screening rather than browsing. The bare domain
 * is a chooser now, and this sits one click behind it.
 */
export default function Galaxy() {
  // overflow-x-clip, not overflow-hidden: `hidden` makes this a scroll
  // container, which silently disables `position: sticky` for every descendant
  // (the timeline's meta column). `clip` still prevents sideways scroll
  // without creating that container.
  return (
    <div className="relative min-h-screen overflow-x-clip text-white">
      <Intro />
      <Projects />
      <Timeline />
      <Stack />
      <OffClock />
      <Resume />
      <Contact />
    </div>
  );
}
