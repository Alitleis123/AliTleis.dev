const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const withBasePath = (path: string) => `${basePath}${path}`;

export type TimelineEntry = {
  /** Stable identifier used as React key. */
  id: string;
  /** Sort key — newer dates first. ISO-ish string used for ordering only. */
  sortKey: string;
  /** Track this entry belongs to. */
  track: "experience" | "project";
  /** Headline (company or project name). */
  title: string;
  /** Short qualifier shown next to the title, e.g. role. */
  subtitle?: string;
  /** Date range as displayed. */
  range: string;
  /** Location or org line shown under the date range. */
  meta?: string;
  /** One-line description shown collapsed. */
  desc: string;
  /** Bullet points shown on expand. */
  bullets: string[];
  /** Path to a small icon/logo (square). */
  icon?: string;
  /** Alt text for the icon. */
  iconAlt?: string;
  /** Text fallback when no icon is set (e.g. monogram). */
  iconText?: string;
  /** Tech stack chips shown on expand. */
  tech?: string[];
  /** Live demo URL — only for project track. */
  demo?: string;
  /** GitHub repo URL — only for project track. */
  repo?: string;
  /** Pill-style badges rendered inline with the title (e.g. "Live Product"). */
  badges?: { label: string; tone: "blue" | "green" | "amber" | "violet" }[];
  /** Additional descriptive footer note shown below desc. */
  note?: string;
  /** Special "incoming" treatment with electric-blue glow. */
  incoming?: boolean;
};

/**
 * Single timeline source ordered newest → oldest.
 * The Timeline component splits this into two tracks (experience / project) for desktop
 * and stacks them on mobile.
 */
export const timeline: TimelineEntry[] = [
  // — EXPERIENCE —
  {
    id: "mit-ll-2026",
    sortKey: "2026-06",
    track: "experience",
    title: "MIT Lincoln Laboratory",
    subtitle: "Web Application Developer (AI Integration)",
    range: "Jun – Dec 2026",
    meta: "Lexington, MA",
    desc: "Incoming co-op building AI-integrated internal web tools at MIT Lincoln Laboratory.",
    bullets: [
      "Incoming Web Application Developer building AI-integrated internal web tools for federally funded research operations.",
      "Selected through a competitive co-op process from Northeastern University.",
      "Role focuses on full-stack web development with AI integration at one of the most prestigious research institutions in the country.",
    ],
    iconText: "MIT LL",
    tech: ["React", "TypeScript", "Next.js", "Node.js", "AI Integration"],
    badges: [{ label: "Incoming", tone: "blue" }],
    incoming: true,
  },
  {
    id: "tcr-intern-2025",
    sortKey: "2025-06",
    track: "experience",
    title: "Top Choice Realty",
    subtitle: "Frontend Developer Intern",
    range: "Jun – Sep 2025",
    desc: "Delivered full-stack improvements across UI flows, data reliability, and backend integrations.",
    bullets: [
      "Identified inefficiencies in listing and client-management workflows, proposed architectural improvements adopted by the team.",
      "Architected reusable React and TypeScript component patterns to standardize dashboard and intake workflows, improving UI consistency and accelerating feature iteration.",
      "Refactored MongoDB schema design to enforce data consistency across client and agent records, eliminating duplicate entries and improving query reliability.",
      "Designed Python and C# automation pipelines to synchronize distributed MongoDB records across virtualized environments, reducing manual reconciliation time by 30%.",
    ],
    icon: withBasePath("/Timeline/Top%20Choice%20Realty.jpg"),
    iconAlt: "Top Choice Realty logo",
    tech: ["React", "TypeScript", "MongoDB", "Python", "C#", "Azure DevOps"],
  },
  {
    id: "rdr-intern-2023",
    sortKey: "2023-06",
    track: "experience",
    title: "Robert DeFalco Realty",
    subtitle: "Computer Technician Intern",
    range: "Jun – Sep 2023",
    meta: "New York",
    desc: "Configured and automated workstation imaging and baseline setups to standardize deployments.",
    bullets: [
      "Led workstation provisioning across 20+ employee systems, performing OS imaging with WinPE and deploying standardized Windows and Linux configurations.",
      "Developed PowerShell scripts to automate configuration and software deployment tasks, improving deployment consistency and reducing setup time.",
      "Supported virtual machine configuration and utilized Azure DevOps for version control and CI workflow coordination.",
    ],
    icon: withBasePath("/Timeline/RobertDe%20Falco.png"),
    iconAlt: "Robert DeFalco Realty logo",
    tech: ["PowerShell", "Windows", "Linux", "Azure DevOps", "WinPE"],
  },

  // — PROJECTS —
  {
    id: "eternal2x-2026",
    sortKey: "2026-01",
    track: "project",
    title: "DaVinci Resolve Smart Upscale Plugin",
    subtitle: "eternal2x.com",
    range: "Jan 2026 – Present",
    desc: "Python video pipeline that detects, segments, and reconstructs DaVinci Resolve timelines with 4K upscaling.",
    bullets: [
      "Engineered a Python-based video processing pipeline using OpenCV and FFmpeg to detect motion frames, restructure timelines, and upscale footage to 4K.",
      "Implemented threshold-based frame detection to isolate active motion segments and remove redundant frames before interpolation.",
      "Automated marker placement, clip segmentation, and timeline reconstruction within DaVinci Resolve using custom Lua scripting.",
      "Deployed as a live commercial product at eternal2x.com.",
    ],
    icon: withBasePath("/projects/eternal2x%20about.png"),
    iconAlt: "Eternal2x icon",
    tech: ["Python", "Lua", "OpenCV", "FFmpeg", "DaVinci Resolve"],
    demo: "https://eternal2x.com",
    repo: "https://github.com/Alitleis123/DaVinchi-Resolve-Smart-Upscale-Plugin",
  },
  {
    id: "tcr-platform-2025",
    sortKey: "2025-06-15",
    track: "project",
    title: "Top Choice Realty Platform",
    range: "Jun – Sep 2025",
    desc: "Production-ready real estate platform with authenticated APIs and schema-driven data.",
    bullets: [
      "Developed and launched a full-stack real estate management platform to streamline property listings, agent workflows, and client data access.",
      "Implemented secure RESTful APIs with authentication and role-based access control for property and user management.",
      "Designed reusable frontend architecture optimized for performance, scalability, and maintainability.",
    ],
    icon: withBasePath("/projects/Top%20choice%20image%201.png"),
    iconAlt: "Top Choice Realty platform thumbnail",
    tech: ["React", "TypeScript", "Node.js", "MongoDB", "REST APIs"],
    demo: "https://alitleis123.github.io/topchoicerealty/",
    repo: "https://github.com/alitleis123/topchoicerealty",
    note: "Built during internship",
  },
  {
    id: "eternal-summary-2024",
    sortKey: "2023-09",
    track: "project",
    title: "Eternal Summary",
    subtitle: "Chrome Extension",
    range: "Sep 2023 – Nov 2024",
    desc: "MV3 Chrome extension with async backend summarization and resilient parsing.",
    bullets: [
      "Built an MV3 Chrome extension that extracts live webpage content using browser APIs and content scripts.",
      "Integrated the OpenAI API to generate real-time summaries through async client-side requests.",
      "Implemented resilient content-script parsing with sanitization to handle messy real-world HTML reliably.",
      "Queued async requests to keep responses stable under variable network latency.",
    ],
    icon: withBasePath("/Timeline/eternal%20summary%20icon.png"),
    iconAlt: "Eternal Summary icon",
    tech: ["JavaScript", "Chrome Extensions MV3", "OpenAI API", "Node.js", "Express"],
    demo: "https://alitleis123.github.io/Eternal-Summary/",
    repo: "https://github.com/Alitleis123/Eternal-Summary",
  },
];

/** "Now" marker placement — entries with sortKey >= this go above the line. */
export const NOW_MARKER_LABEL = "Now · May 2026";
export const NOW_MARKER_SORTKEY = "2026-05";

// ───────────────────────────────────────────────────────────────────
// Tech Stack
// ───────────────────────────────────────────────────────────────────

export type StackItem = {
  name: string;
  /** Optional react-icons component reference imported in Stack.tsx. */
  iconKey?: string;
};

export type StackGroup = {
  title: string;
  items: StackItem[];
};

export const coreStack: StackItem[] = [
  { name: "React", iconKey: "SiReact" },
  { name: "TypeScript", iconKey: "SiTypescript" },
  { name: "Next.js", iconKey: "SiNextdotjs" },
  { name: "Node.js", iconKey: "SiNodedotjs" },
  { name: "Python", iconKey: "SiPython" },
  { name: "MongoDB", iconKey: "SiMongodb" },
  { name: "Tailwind CSS", iconKey: "SiTailwindcss" },
  { name: "Git", iconKey: "SiGit" },
];

export const stackGroups: StackGroup[] = [
  {
    title: "Languages",
    items: [
      { name: "TypeScript", iconKey: "SiTypescript" },
      { name: "JavaScript", iconKey: "SiJavascript" },
      { name: "Python", iconKey: "SiPython" },
      { name: "Java", iconKey: "FaJava" },
      { name: "C++", iconKey: "SiCplusplus" },
      { name: "C#", iconKey: "SiSharp" },
      { name: "Lua", iconKey: "SiLua" },
      { name: "Kotlin", iconKey: "SiKotlin" },
    ],
  },
  {
    title: "Frameworks & Frontend",
    items: [
      { name: "React", iconKey: "SiReact" },
      { name: "Next.js", iconKey: "SiNextdotjs" },
      { name: "Tailwind CSS", iconKey: "SiTailwindcss" },
      { name: "Framer Motion", iconKey: "SiFramer" },
      { name: "MUI", iconKey: "SiMui" },
      { name: "Vite", iconKey: "SiVite" },
      { name: "React Router", iconKey: "SiReactrouter" },
    ],
  },
  {
    title: "Backend & Tools",
    items: [
      { name: "Node.js / Express", iconKey: "SiNodedotjs" },
      { name: "REST APIs", iconKey: "TbApi" },
      { name: "JWT Auth", iconKey: "SiJsonwebtokens" },
      { name: "Git / GitHub", iconKey: "SiGithub" },
      { name: "Docker", iconKey: "SiDocker" },
      { name: "Linux", iconKey: "SiLinux" },
      { name: "OpenCV", iconKey: "SiOpencv" },
      { name: "FFmpeg", iconKey: "SiFfmpeg" },
      { name: "PowerShell", iconKey: "VscTerminalPowershell" },
    ],
  },
  {
    title: "Databases",
    items: [
      { name: "MongoDB", iconKey: "SiMongodb" },
      { name: "PostgreSQL", iconKey: "SiPostgresql" },
      { name: "MySQL", iconKey: "SiMysql" },
    ],
  },
  {
    title: "AI & ML",
    items: [
      { name: "OpenAI API", iconKey: "SiOpenai" },
      { name: "Anthropic", iconKey: "SiAnthropic" },
      { name: "LLM Integration", iconKey: "LuBrainCircuit" },
      { name: "Prompt Engineering", iconKey: "LuSparkles" },
    ],
  },
];
