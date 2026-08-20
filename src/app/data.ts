const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const withBasePath = (path: string) => `${basePath}${path}`;

/** Canonical origin — matches public/CNAME. Used for metadata, sitemap, robots. */
export const SITE_URL = "https://alitleis.dev";

export type TimelineEntry = {
  id: string;
  /** Start month, "YYYY-MM". Also drives descending timeline order. */
  sortKey: string;
  /** End month, "YYYY-MM". Omit for an open-ended role. */
  endKey?: string;
  track: "experience" | "education";
  title: string;
  subtitle?: string;
  range: string;
  meta?: string;
  desc: string;
  bullets: string[];
  icon?: string;
  iconAlt?: string;
  iconText?: string;
  tech?: string[];
  badges?: { label: string; tone: "blue" | "green" | "amber" | "violet" }[];
  note?: string;
  /** Render education entry with stat-grid card layout. */
  education?: {
    stats: { label: string; value: string }[];
    coursework: string[];
  };
  /** Optional gallery shown when an entry is expanded. */
  images?: { src: string; alt: string }[];
};

export const timeline: TimelineEntry[] = [
  {
    id: "mit-ll-2026",
    sortKey: "2026-07",
    endKey: "2026-12",
    track: "experience",
    title: "MIT Lincoln Laboratory",
    subtitle: "Web Application Developer (AI Integration)",
    range: "Jul – Dec 2026",
    meta: "Lexington, MA",
    desc: "Six-month co-op building an AI-assisted search layer over the Laboratory's Apache Solr index.",
    bullets: [
      "Owning design and implementation of an AI-assisted search layer over the Laboratory's Apache Solr index, authoring the technical proposal and driving it through engineering review ahead of schedule.",
      "Built the ingestion layer on Norconex, handling authenticated access, JavaScript-rendered pages, and mixed document formats to normalize content from multiple Laboratory web properties and SharePoint into the Solr index.",
      "Engineered retrieval logic in Java that ranks and narrows candidate documents before model invocation, cutting query response time 70% and token consumption per request 40%.",
      "Delivered a working end-to-end prototype and demoed it to the group, unifying content from SharePoint, internal documentation, and the public Laboratory site behind a single search interface.",
      "Working across both frontier model APIs and self-hosted open-weight models, choosing per workload rather than defaulting to one provider, and keeping the retrieval layer independent of any single model.",
      "Designing and building AI-integrated internal web applications used daily by researchers, scientists, and engineers across classified and unclassified divisions of MIT Lincoln Laboratory.",
      "Building inside an established enterprise environment — ServiceNow, SharePoint, Jira, and Confluence — so new tooling has to fit systems already in daily use across the lab rather than sit beside them.",
      "Operating inside a federally funded R&D center on a competitive Northeastern co-op placement, selected for the Web Application Developer (AI Integration) role specifically.",
    ],
    note: "Security clearance: DoD investigation in progress.",
    icon: withBasePath("/Timeline/MIT%20Lincoln%20Lab%20Logo.webp"),
    iconAlt: "MIT Lincoln Laboratory logo",
    iconText: "MIT LL",
    tech: [
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "Java",
      "LLM Integration",
      "Apache Solr",
      "Norconex",
      "SharePoint",
      "Boomi",
    ],
  },
  {
    id: "tcr-intern-2025",
    sortKey: "2025-06",
    endKey: "2025-09",
    track: "experience",
    title: "Top Choice Realty",
    subtitle: "Frontend Developer Intern",
    range: "Jun – Sep 2025",
    meta: "Staten Island, NY",
    desc: "Full-stack work across UI patterns, schema integrity, and automation pipelines.",
    bullets: [
      "Embedded as a Frontend Developer Intern but operated well beyond that scope, touching backend integrations, database architecture, and automation infrastructure in addition to UI work throughout the engagement.",
      "Conducted a full audit of existing listing and client-management workflows from end to end, identified structural inefficiencies in both the UI layer and the underlying data pipeline, and proposed architectural improvements that were reviewed, approved, and adopted by the engineering team.",
      "Designed and implemented a comprehensive reusable component system in React and TypeScript to standardize dashboard layouts and client intake forms across the platform, eliminating UI inconsistency and significantly reducing the time required to ship new features.",
      "Diagnosed deep data integrity failures in the existing MongoDB schema caused by unvalidated writes and inconsistent field naming. Refactored the schema design to enforce strict consistency across all client and agent records, eliminating duplicate entries that were cascading into downstream query failures and incorrect data displays.",
      "Architected and deployed Python and C# automation pipelines to synchronize MongoDB records across multiple distributed virtualized environments that were previously managed manually, reducing reconciliation time by 30% and eliminating an entire category of manual error.",
      "Operated as a trusted contributor despite being an intern, proposing, designing, and shipping solutions that went into production and are still in use.",
    ],
    icon: withBasePath("/Timeline/Top%20Choice%20Realty.webp"),
    iconAlt: "Top Choice Realty logo",
    tech: ["React", "TypeScript", "MongoDB", "Python", "C#", "Azure DevOps"],
    images: [
      {
        src: withBasePath("/projects/Top%20choice%20image%201.webp"),
        alt: "Top Choice Realty platform — listings view",
      },
      {
        src: withBasePath("/projects/Top%20choice%20image%202.webp"),
        alt: "Top Choice Realty platform — agent dashboard",
      },
    ],
  },
  {
    id: "neu-edu",
    sortKey: "2024-09",
    endKey: "2028-05",
    track: "education",
    title: "Northeastern University",
    subtitle: "B.S. Computer Science",
    range: "2024 – 2028",
    meta: "Boston, MA",
    icon: withBasePath("/Timeline/nu-logo.webp"),
    iconAlt: "Northeastern University seal",
    iconText: "NU",
    desc: "B.S. Computer Science via Northeastern's co-op program — coursework alternated with full-time engineering placements.",
    bullets: [
      "Northeastern's signature co-op program integrates six-month full-time engineering placements directly into the degree, allowing immediate progression between coursework and production work.",
      "Working through core CS fundamentals (algorithms, systems, software design, OOD) while building independent projects and shipping internships in parallel to sharpen engineering skills outside the classroom.",
    ],
    education: {
      stats: [
        { label: "Degree", value: "B.S. CS" },
        { label: "Expected", value: "2028" },
        { label: "Program", value: "Co-op" },
        { label: "GPA", value: "3.5+" },
      ],
      coursework: [
        "Algorithms & Data Structures",
        "Object-Oriented Design",
        "Artificial Intelligence",
        "Discrete Structures",
        "Programming in C++",
        "Fundamentals of CS 1 & 2",
      ],
    },
  },
  {
    id: "rdr-intern-2023",
    sortKey: "2023-06",
    endKey: "2023-09",
    track: "experience",
    title: "Robert DeFalco Realty",
    subtitle: "Computer Technician Intern",
    range: "Jun – Sep 2023",
    meta: "Staten Island, NY",
    desc: "Workstation provisioning, automation scripting, and deployment standardization across 20+ systems.",
    bullets: [
      "Owned complete end-to-end workstation provisioning responsibility for 20+ employee systems across the office, with sole ownership of the deployment pipeline rather than an assistive role.",
      "Performed OS imaging using WinPE to build and deploy standardized Windows and Linux configurations from scratch across every machine, ensuring a consistent and reliable baseline across the entire office environment.",
      "Identified that the existing software deployment process was entirely manual and error-prone. Wrote a suite of PowerShell automation scripts to handle configuration, software installation, and environment setup tasks programmatically, improving consistency and cutting per-machine setup time significantly.",
      "Managed virtual machine configuration and setup for internal use cases, coordinated version control through Azure DevOps, and supported CI workflow setup and maintenance.",
      "First technical internship, building foundational fluency in systems administration, enterprise scripting, and deployment workflows that directly informed the architecture and automation decisions made in every subsequent role.",
    ],
    icon: withBasePath("/Timeline/RobertDe%20Falco.webp"),
    iconAlt: "Robert DeFalco Realty logo",
    tech: ["PowerShell", "Windows", "Linux", "Azure DevOps", "WinPE"],
  },
];

/**
 * Resolved at build time in next.config.ts so the marker advances on every
 * deploy instead of being hand-edited. Fallbacks only apply if the env vars
 * are missing (e.g. a bare `next lint` run outside the normal build).
 */
export const NOW_MARKER_LABEL = `Now · ${
  process.env.NEXT_PUBLIC_NOW_LABEL || "Present"
}`;
export const NOW_MARKER_SORTKEY = process.env.NEXT_PUBLIC_NOW_SORTKEY || "9999-12";

/** Build year, for copyright lines. Advances via the monthly rebuild in pages.yml. */
export const BUILD_YEAR =
  process.env.NEXT_PUBLIC_BUILD_YEAR || String(new Date().getFullYear());

/**
 * A role is "current" when the build month falls inside its start/end window.
 * Derived rather than hand-flagged so the accent pill retires itself when the
 * co-op ends instead of needing an edit. Education is excluded — those entries
 * get their own badge, and a multi-year degree would otherwise always match.
 */
export const isCurrentEntry = (entry: TimelineEntry) =>
  entry.track === "experience" &&
  entry.sortKey.localeCompare(NOW_MARKER_SORTKEY) <= 0 &&
  (!entry.endKey || entry.endKey.localeCompare(NOW_MARKER_SORTKEY) >= 0);

/**
 * Inclusive month span, derived from the start/end keys rather than written by
 * hand. Returns null when it can't produce something sensible — e.g. if the
 * build-time NOW fallback is in play, an open-ended entry would compute an
 * absurd span.
 */
export const entryDuration = (entry: TimelineEntry): string | null => {
  const [sy, sm] = entry.sortKey.split("-").map(Number);
  const [ey, em] = (entry.endKey || NOW_MARKER_SORTKEY).split("-").map(Number);
  if ([sy, sm, ey, em].some(Number.isNaN)) return null;

  const months = (ey - sy) * 12 + (em - sm) + 1;
  if (months < 1 || months > 240) return null;

  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (months < 12) return plural(months, "mo");

  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${plural(years, "yr")} ${plural(rest, "mo")}` : plural(years, "yr");
};

// ───────────────────────────────────────────────────────────────────
// Projects
// ───────────────────────────────────────────────────────────────────

export type Project = {
  id: string;
  title: string;
  subtitle?: string;
  range: string;
  desc: string;
  bullets: string[];
  tech?: string[];
  icon?: string;
  iconAlt?: string;
  iconText?: string;
  demo?: string;
  repo?: string;
  comingSoon?: boolean;
  iconKey?: string;
  /** Key referencing a custom SVG cover component (used when there's no gallery hero). */
  coverKey?: string;
  /** Gallery — first image is shown as the card's showcase, rest available in lightbox. */
  gallery?: { src: string; alt: string }[];
};

export const featuredProjects: Project[] = [
  {
    id: "eternal2x",
    title: "DaVinci Resolve Smart Upscale Plugin",
    subtitle: "eternal2x.com",
    range: "Jan 2026 – Present",
    desc: "Python and Lua pipeline that automates motion detection, timeline reconstruction, and 4K upscaling inside DaVinci Resolve.",
    bullets: [
      "Identified a specific painful, time-consuming manual workflow inside DaVinci Resolve and engineered a complete automated pipeline to eliminate it.",
      "Built a Python video processing pipeline using OpenCV for threshold-based motion detection, isolating active segments and filtering redundant static frames before upscaling.",
      "Wrote custom Lua scripting to fully automate DaVinci Resolve's timeline layer: marker placement, clip segmentation, and timeline reconstruction all happen programmatically.",
      "Piped detection output through an FFmpeg 4K upscaling and frame interpolation pipeline, automating the path from raw footage to finished timeline.",
      "Architected the system within DaVinci Resolve's plugin scripting environment, requiring deep reverse engineering of the API given limited official documentation.",
      "Live at eternal2x.com as a public release.",
    ],
    icon: withBasePath("/projects/eternal2x%20about.webp"),
    iconAlt: "Eternal2x icon",
    tech: ["Python", "Lua", "OpenCV", "FFmpeg", "DaVinci Resolve"],
    demo: "https://eternal2x.com",
    repo: "https://github.com/Alitleis123/DaVinchi-Resolve-Smart-Upscale-Plugin",
    coverKey: "eternal2x",
    gallery: [
      { src: withBasePath("/projects/eternal2x%20about.webp"), alt: "Eternal2x — about page" },
      { src: withBasePath("/projects/eternal2x%20download.webp"), alt: "Eternal2x — download page" },
    ],
  },
  {
    id: "tcr-platform",
    title: "Top Choice Realty Platform",
    range: "Jun – Sep 2025",
    desc: "Full-stack real estate management platform with JWT auth, role-based access control, and a scalable component architecture.",
    bullets: [
      "Designed and built a complete full-stack real estate management platform from the ground up, production-ready for property listings, agent workflows, and client data.",
      "Architected the backend API layer with secure RESTful endpoints, JWT-based authentication, and granular role-based access control separated cleanly at the API layer.",
      "Built the frontend around a scalable reusable component architecture used consistently across listing views, agent dashboards, and client intake flows.",
      "Handled the full scope of a senior full-stack developer as a solo project: schema, API, auth, frontend architecture, deployment, and ongoing maintenance.",
      "Built in parallel with the internship at Top Choice Realty, with learnings from each feeding directly into the other.",
    ],
    icon: withBasePath("/projects/Top%20choice%20image%201.webp"),
    iconAlt: "Top Choice Realty thumbnail",
    tech: ["React", "TypeScript", "Node.js", "MongoDB", "REST APIs"],
    demo: "https://alitleis123.github.io/topchoicerealty/",
    repo: "https://github.com/alitleis123/topchoicerealty",
    coverKey: "topChoiceRealty",
    gallery: [
      { src: withBasePath("/projects/Top%20choice%20image%201.webp"), alt: "Top Choice Realty — main listings page" },
      { src: withBasePath("/projects/Top%20choice%20image%202.webp"), alt: "Top Choice Realty — agent dashboard" },
      { src: withBasePath("/projects/Top%20choice%20image%203.webp"), alt: "Top Choice Realty — listing detail" },
      { src: withBasePath("/projects/Top%20choice%20image%204.webp"), alt: "Top Choice Realty — admin view" },
      { src: withBasePath("/projects/Top%20choice%20image%205.webp"), alt: "Top Choice Realty — client intake" },
    ],
  },
  {
    id: "eternal-summary",
    title: "Eternal Summary",
    subtitle: "Chrome Extension",
    range: "Sep 2023 – Present",
    desc: "MV3 Chrome extension with one-click AI summaries, backed by a containerized Node and Express proxy on Fly.io that keeps Gemini credentials off the client.",
    bullets: [
      "Built on Chrome MV3, the most restrictive extension standard, which fundamentally changed how background processing and API calls are handled compared to MV2.",
      "Used a background service worker with injected content scripts to extract live page text and return one-click AI-generated summaries.",
      "Implemented content-script extraction with custom sanitization logic designed for the extreme variation in real-world HTML structure across websites.",
      "Deployed a containerized Node and Express backend on Fly.io to proxy Gemini API calls, scoping host permissions to the backend origin and keeping credentials in runtime secrets.",
      "Implemented client-side async request queuing to keep the extension responsive under variable network conditions and slow API responses.",
      "Handled the full complexity of MV3 message passing between content scripts, ephemeral background service workers, and the popup UI.",
      "First project involving LLM API integration, directly informing the AI tooling direction of subsequent work.",
    ],
    icon: withBasePath("/Timeline/eternal%20summary%20icon.webp"),
    iconAlt: "Eternal Summary icon",
    tech: [
      "JavaScript",
      "Chrome Extensions MV3",
      "Gemini API",
      "Node.js",
      "Express",
      "Docker",
      "Fly.io",
    ],
    demo: "https://alitleis123.github.io/Eternal-Summary/",
    repo: "https://github.com/Alitleis123/Eternal-Summary",
    coverKey: "eternalSummary",
    gallery: [
      { src: withBasePath("/projects/EternalSummary.webp"), alt: "Eternal Summary — main page" },
      { src: withBasePath("/projects/EternalSummary%20image%201.webp"), alt: "Eternal Summary — extension popup" },
      { src: withBasePath("/projects/EternalSummary%20image%202.webp"), alt: "Eternal Summary — summary output" },
      { src: withBasePath("/projects/EternalSummary%20Image%203.webp"), alt: "Eternal Summary — settings panel" },
      { src: withBasePath("/projects/EternalSummary%20Image%204.webp"), alt: "Eternal Summary — in-page integration" },
    ],
  },
  {
    id: "eternal-reverse",
    title: "Eternal Reverse",
    subtitle: "eternalreverse.dev",
    range: "2025 – Present",
    desc: "Independent dev studio with a shared Next.js / Node web surface and a Python / Lua / FFmpeg media pipeline, shipping six products across desktop, browser, and full-stack web — a Resolve upscaling plugin, a Discord rich-presence client, a Chrome summarizer, a barbershop booking platform, and two cross-platform apps in development.",
    bullets: [
      "Co-founded eternalreverse.dev as an independent two-person dev studio, housing multiple shipping software products across systems, web, and mobile under a single umbrella.",
      "Own the web-facing surface — Next.js, TypeScript, React, Node.js, and Tailwind — for the studio site and per-product pages.",
      "Author the Python, Lua, and FFmpeg pipeline that ships as Eternal2x under the studio, integrating with DaVinci Resolve's scripting environment.",
      "Studio houses six products at different stages: Eternal2x (Resolve plugin, live), Eternal Summary (Chrome extension, live), EternalRichPresence (Discord client, live beta), Signature Cuts 413 (booking platform, live), EternalMonitor (display receiver, in dev), and Exerly Fitness (in dev).",
      "Live at eternalreverse.dev.",
    ],
    iconText: "ER",
    tech: ["TypeScript", "Next.js", "React", "Node.js", "Python", "Lua", "MongoDB", "FFmpeg"],
    demo: "https://eternalreverse.dev",
    repo: "https://github.com/whoisaldo/EternalReverse-dev",
    coverKey: "eternalReverse",
  },
];

export const otherWork: Project[] = [
  {
    id: "calorie-calculator",
    title: "CalorieCalculator",
    range: "2024",
    desc: "Simple calorie tracking web app.",
    bullets: [],
    tech: ["React", "HTML", "CSS"],
    repo: "https://github.com/Alitleis123/CalorieCalculator",
    iconKey: "calculator",
  },
  {
    id: "cs3520",
    title: "CS3520 Coursework",
    range: "Summer 1 · 2025",
    desc: "C++ coursework from Summer 1 semester at Northeastern.",
    bullets: [],
    tech: ["C++"],
    repo: "https://github.com/Alitleis123/CS3520-Summer-2025",
    iconKey: "cplusplus",
  },
  {
    id: "better-canvas",
    title: "Better Canvas",
    range: "2026",
    desc: "Privacy-focused browser extension that customizes the Canvas LMS — dark mode, dashboard redesign, planner widget, and a GPA calculator, with no telemetry or external servers.",
    bullets: [],
    tech: ["JavaScript", "CSS", "HTML"],
    repo: "https://github.com/Alitleis123/Better-Canvas",
    iconKey: "puzzle",
  },
];

// ───────────────────────────────────────────────────────────────────
// About
// ───────────────────────────────────────────────────────────────────

export const aboutPillars = [
  {
    label: "Full-Stack Web",
    desc: "Production platforms end-to-end — schema, auth, APIs, and the interface on top.",
  },
  {
    label: "Tooling & Automation",
    desc: "Python, Lua, and PowerShell pipelines that eliminate the manual parts of real workflows.",
  },
  {
    label: "Shipping to Users",
    desc: "Software with real people on the other side. Public releases, daily operators, classified workflows.",
  },
];

/** Mirrors the clearance line on the resume. */
export const aboutClearance = "DoD investigation in progress";

export const aboutLanguages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "Fluent" },
];

export const aboutHobbies = [
  { name: "Coding", glyph: "{ }" },
  { name: "Weight Lifting", glyph: "△" },
  { name: "Video Editing", glyph: "▶" },
];

// ───────────────────────────────────────────────────────────────────
// Tech Stack
// ───────────────────────────────────────────────────────────────────

export type StackItem = {
  name: string;
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
      { name: "Vite", iconKey: "SiVite" },
      { name: "React Router", iconKey: "SiReactrouter" },
    ],
  },
  {
    title: "Backend & Tools",
    items: [
      { name: "Node.js / Express", iconKey: "SiNodedotjs" },
      { name: "REST APIs", iconKey: "TbApi" },
      { name: "Boomi", iconKey: "TbPlugConnected" },
      { name: "JWT Auth", iconKey: "SiJsonwebtokens" },
      { name: "Git / GitHub", iconKey: "SiGithub" },
      { name: "Docker", iconKey: "SiDocker" },
      { name: "Linux", iconKey: "SiLinux" },
      { name: "OpenCV", iconKey: "SiOpencv" },
      { name: "FFmpeg", iconKey: "SiFfmpeg" },
      { name: "PowerShell", iconKey: "VscTerminalPowershell" },
      { name: "Azure DevOps", iconKey: "VscAzureDevops" },
      { name: "Jest", iconKey: "SiJest" },
      { name: "JUnit", iconKey: "SiJunit5" },
      { name: "Fly.io", iconKey: "SiFlydotio" },
      { name: "Heroku", iconKey: "SiHeroku" },
      { name: "Arduino", iconKey: "SiArduino" },
    ],
  },
  {
    title: "Databases & Search",
    items: [
      { name: "MongoDB", iconKey: "SiMongodb" },
      { name: "PostgreSQL", iconKey: "SiPostgresql" },
      { name: "MySQL", iconKey: "SiMysql" },
      { name: "Apache Solr", iconKey: "SiApachesolr" },
      { name: "Norconex", iconKey: "TbSpider" },
    ],
  },
  {
    title: "AI & ML",
    items: [
      { name: "LLM Integration", iconKey: "LuBrainCircuit" },
      { name: "Gemini API", iconKey: "SiGooglegemini" },
      { name: "DeepSeek", iconKey: "TbBrain" },
      { name: "Open-Weight LLMs", iconKey: "SiHuggingface" },
    ],
  },
];
