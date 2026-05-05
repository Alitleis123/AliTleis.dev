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
    desc: "Incoming co-op building AI-integrated internal web applications at MIT Lincoln Laboratory.",
    bullets: [
      "Incoming on a competitive co-op placement from Northeastern University into one of the most prestigious federally funded research institutions in the country. MIT Lincoln Laboratory is a Department of Defense research and development center operated by MIT.",
      "Selected from a competitive applicant pool specifically for the Web Application Developer role with an AI integration focus, not a general software placement.",
      "Role centers on designing and building AI-integrated internal web applications used daily by researchers, scientists, and engineers operating across classified and unclassified research divisions.",
      "Will work across the full stack with a primary focus on integrating LLM and AI workflows into production-grade internal web tooling, bridging the gap between research-grade AI capabilities and usable software interfaces.",
      "Commuting to Lexington, MA from Boston for the full six-month co-op starting June 2026.",
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
    desc: "Full-stack work across UI patterns, schema integrity, and automation pipelines.",
    bullets: [
      "Embedded as a Frontend Developer Intern but operated well beyond that scope, touching backend integrations, database architecture, and automation infrastructure in addition to UI work throughout the engagement.",
      "Conducted a full audit of existing listing and client-management workflows from end to end, identified structural inefficiencies in both the UI layer and the underlying data pipeline, and proposed architectural improvements that were reviewed, approved, and adopted by the engineering team.",
      "Designed and implemented a comprehensive reusable component system in React and TypeScript to standardize dashboard layouts and client intake forms across the platform, eliminating UI inconsistency and significantly reducing the time required to ship new features.",
      "Diagnosed deep data integrity failures in the existing MongoDB schema caused by unvalidated writes and inconsistent field naming. Refactored the schema design to enforce strict consistency across all client and agent records, eliminating duplicate entries that were cascading into downstream query failures and incorrect data displays.",
      "Architected and deployed Python and C# automation pipelines to synchronize MongoDB records across multiple distributed virtualized environments that were previously managed manually, reducing reconciliation time by 30% and eliminating an entire category of manual error.",
      "Operated as a trusted contributor despite being an intern, proposing, designing, and shipping solutions that went into production and are still in use.",
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
    desc: "Workstation provisioning, automation scripting, and deployment standardization across 20+ systems.",
    bullets: [
      "Owned complete end-to-end workstation provisioning responsibility for 20+ employee systems across the office, with sole ownership of the deployment pipeline rather than an assistive role.",
      "Performed OS imaging using WinPE to build and deploy standardized Windows and Linux configurations from scratch across every machine, ensuring a consistent and reliable baseline across the entire office environment.",
      "Identified that the existing software deployment process was entirely manual and error-prone. Wrote a suite of PowerShell automation scripts to handle configuration, software installation, and environment setup tasks programmatically, improving consistency and cutting per-machine setup time significantly.",
      "Managed virtual machine configuration and setup for internal use cases, coordinated version control through Azure DevOps, and supported CI workflow setup and maintenance.",
      "First technical internship, building foundational fluency in systems administration, enterprise scripting, and deployment workflows that directly informed the architecture and automation decisions made in every subsequent role.",
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
    desc: "Python and Lua pipeline that automates motion detection, timeline reconstruction, and 4K upscaling inside DaVinci Resolve.",
    bullets: [
      "Identified a specific painful and time-consuming manual workflow inside DaVinci Resolve and engineered a complete automated pipeline to eliminate it.",
      "Built a Python-based video processing pipeline from scratch using OpenCV to perform threshold-based motion detection across raw footage. The algorithm automatically identifies and isolates active motion segments while filtering out redundant static frames before the upscaling pass begins.",
      "Wrote custom Lua scripting to automate the entire DaVinci Resolve timeline management layer. Marker placement, clip segmentation, and full timeline reconstruction all happen programmatically after the detection stage, with no manual editing required inside the application.",
      "Piped the motion-detected and segmented output through an FFmpeg 4K upscaling and frame interpolation pipeline integrated with the detection output, automating the entire process from raw footage to finished upscaled timeline.",
      "Architected the system to work within DaVinci Resolve's plugin scripting environment, which has significant constraints and limited documentation, requiring deep reverse engineering of the API and scripting environment.",
      "Shipped as a live commercial product at eternal2x.com with real paying users.",
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
    desc: "Full-stack real estate management platform with authenticated APIs and a scalable component architecture.",
    bullets: [
      "Designed and built a complete full-stack real estate management platform from the ground up. A production-ready system built to handle real property listings, agent workflows, and client data access for an active real estate operation.",
      "Architected the entire backend API layer with secure RESTful endpoints, JWT-based authentication, and granular role-based access control. Agent and admin permission levels are separated cleanly at the API layer so no client-side permission logic is relied upon for security.",
      "Built the complete frontend around a scalable reusable component architecture that operates consistently across listing views, agent dashboards, and client intake flows, with every view sharing the same underlying component system.",
      "Handled the full scope of a senior full-stack developer as a solo project. Schema design, API design, authentication system, frontend architecture, deployment, and ongoing maintenance all owned independently.",
      "Built in parallel with the internship at Top Choice Realty, with learnings from each feeding directly into improvements in the other.",
    ],
    icon: withBasePath("/projects/Top%20choice%20image%201.png"),
    iconAlt: "Top Choice Realty platform thumbnail",
    tech: ["React", "TypeScript", "Node.js", "MongoDB", "REST APIs"],
    demo: "https://alitleis123.github.io/topchoicerealty/",
    repo: "https://github.com/alitleis123/topchoicerealty",
  },
  {
    id: "eternal-summary-2024",
    sortKey: "2023-09",
    track: "project",
    title: "Eternal Summary",
    subtitle: "Chrome Extension",
    range: "Sep 2023 – Nov 2024",
    desc: "MV3 Chrome extension with async OpenAI summarization, sanitization, and a Node + Express backend.",
    bullets: [
      "Built on the Chrome MV3 architecture, the latest and most restrictive extension standard, which fundamentally changed how background processing, content scripts, and API calls must be handled compared to the older MV2 approach that most extension tutorials and examples still use.",
      "Implemented a content-script-based page extraction system with custom sanitization logic designed specifically to handle the extreme variation in real-world HTML structure encountered across different websites. Naive extraction approaches failed on a large percentage of sites, requiring a more robust parsing strategy.",
      "Built a lightweight Node.js and Express backend to handle OpenAI API calls server-side, keeping the API key off the client entirely, managing response latency gracefully, and allowing request queuing and error handling that is not possible in a pure client-side extension.",
      "Implemented client-side async request queuing to prevent UI lockup and keep the extension fully responsive under variable network conditions and slow API responses.",
      "Handled the full complexity of Chrome extension message passing between content scripts, background service workers, and the popup UI. The MV3 architecture makes this significantly more complex than MV2 due to the ephemeral nature of service workers.",
      "First project involving LLM API integration. The architecture decisions, async patterns, and backend proxy approach made here directly informed the AI tooling direction that followed in subsequent projects.",
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
