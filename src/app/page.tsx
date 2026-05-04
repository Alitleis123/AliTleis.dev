import About from "./components/sections/About";
import Contact from "./components/sections/Contact";
import Hero from "./components/sections/Hero";
import Resume from "./components/sections/Resume";
import SectionDivider from "./components/SectionDivider";
import Stack from "./components/sections/Stack";
import Timeline from "./components/sections/Timeline";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Hero />
      <About />
      <SectionDivider />
      <Timeline />
      <SectionDivider />
      <Stack />
      <SectionDivider />
      <Resume />
      <SectionDivider />
      <Contact />
    </div>
  );
}
