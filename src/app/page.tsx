import Contact from "./components/sections/Contact";
import Intro from "./components/sections/Intro";
import Projects from "./components/sections/Projects";
import Resume from "./components/sections/Resume";
import Stack from "./components/sections/Stack";
import Timeline from "./components/sections/Timeline";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Intro />
      <Projects />
      <Timeline />
      <Stack />
      <Resume />
      <Contact />
    </div>
  );
}
