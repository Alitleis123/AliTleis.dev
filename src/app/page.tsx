import Contact from "./components/sections/Contact";
import Intro from "./components/sections/Intro";
import Projects from "./components/sections/Projects";
import Resume from "./components/sections/Resume";
import Stack from "./components/sections/Stack";
import Timeline from "./components/sections/Timeline";

export default function Home() {
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
      <Resume />
      <Contact />
    </div>
  );
}
