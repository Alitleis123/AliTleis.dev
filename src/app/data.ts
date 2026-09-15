const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const withBasePath = (path: string) => `${basePath}${path}`;

/** Canonical origin, matches public/CNAME. Used for metadata, sitemap, robots. */
export const SITE_URL = "https://alitleis.dev";

/**
 * Resume URL, cache-busted by the PDF's own content hash (computed at build
 * time in next.config.ts). Without this, browsers keep serving the previously
 * cached PDF from the unchanged path after a new resume ships.
 */
export const RESUME_HREF = (() => {
  const base = withBasePath("/resume/resume.pdf");
  const v = process.env.NEXT_PUBLIC_RESUME_V;
  return v ? `${base}?v=${v}` : base;
})();

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
  /** Headline outcomes, surfaced without expanding the entry. */
  metrics?: { value: string; label: string }[];
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
    sortKey: "2026-06",
    // Last day is Jan 1 2027, so December is the final full working month.
    // Jun–Dec inclusive derives the 7-month duration, and the "Current" badge
    // retires in January.
    endKey: "2026-12",
    track: "experience",
    title: "MIT Lincoln Laboratory",
    subtitle: "Web Application Developer (AI Integration)",
    range: "Jun 2026 – Jan 2027",
    meta: "Lexington, MA",
    desc: "Seven-month co-op building an LLM-backed search layer over the Laboratory's Apache Solr index.",
    bullets: [
      "Owning design and implementation of an LLM-backed search layer over the Laboratory's Apache Solr index, authoring the technical proposal and driving it through engineering review ahead of schedule.",
      "Built the ingestion layer on Norconex, handling authenticated access, JavaScript-rendered pages, and mixed document formats to normalize content from multiple Laboratory web properties and SharePoint into the Solr index.",
      "Engineered retrieval logic in Java that ranks and narrows candidate documents before model invocation, cutting query response time 70% and token consumption per request 40%.",
      "Delivered a working end-to-end prototype and demoed it to the group, unifying content from SharePoint, internal documentation, and the public Laboratory site behind a single search interface.",
      "Working across both frontier model APIs and self-hosted open-weight models, choosing per workload rather than defaulting to one provider, and keeping the retrieval layer independent of any single model.",
      "Designing and building AI-integrated internal web applications used daily by researchers, scientists, and engineers across classified and unclassified divisions of MIT Lincoln Laboratory.",
      "Building inside an established enterprise environment of ServiceNow, SharePoint, Jira, and Confluence, so new tooling has to fit systems already in daily use across the lab rather than sit beside them.",
      "Operating inside a federally funded R&D center on a competitive Northeastern co-op placement, selected for the Web Application Developer (AI Integration) role specifically.",
    ],
    metrics: [
      { value: "70%", label: "Faster query response" },
      { value: "40%", label: "Fewer tokens per request" },
    ],
    note: "Security clearance under DoD investigation, in progress.",
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
    metrics: [
      { value: "30%", label: "Less reconciliation time" },
      { value: "0", label: "Duplicate records after refactor" },
    ],
    icon: withBasePath("/Timeline/Top%20Choice%20Realty.webp"),
    iconAlt: "Top Choice Realty logo",
    tech: ["React", "TypeScript", "MongoDB", "Python", "C#", "Azure DevOps"],
    images: [
      {
        src: withBasePath("/projects/Top%20choice%20image%201.webp"),
        alt: "Top Choice Realty platform, listings view",
      },
      {
        src: withBasePath("/projects/Top%20choice%20image%202.webp"),
        alt: "Top Choice Realty platform, agent dashboard",
      },
    ],
  },
  {
    id: "neu-edu",
    sortKey: "2024-09",
    endKey: "2028-08",
    track: "education",
    title: "Northeastern University",
    subtitle: "B.S. Computer Science & Sociology",
    range: "2024 – 2028",
    meta: "Boston, MA",
    icon: withBasePath("/Timeline/nu-logo.webp"),
    iconAlt: "Northeastern University seal",
    iconText: "NU",
    desc: "B.S. Computer Science and Sociology via Northeastern's co-op program, with coursework alternating against full-time engineering placements.",
    bullets: [
      "Northeastern's signature co-op program integrates full-time engineering placements directly into the degree, allowing immediate progression between coursework and production work.",
      "Working through core CS fundamentals (algorithms, systems, software design, OOD) while building independent projects and shipping internships in parallel to sharpen engineering skills outside the classroom.",
      "Combined major pairing Computer Science with Sociology, alongside the Video Editing Club and the Arab Student Association.",
    ],
    education: {
      stats: [
        { label: "Degree", value: "CS & Sociology" },
        { label: "Expected", value: "Aug 2028" },
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
    metrics: [
      { value: "20+", label: "Workstations provisioned" },
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
 * co-op ends instead of needing an edit. Education is excluded, because those entries
 * get their own badge, and a multi-year degree would otherwise always match.
 */
export const isCurrentEntry = (entry: TimelineEntry) =>
  entry.track === "experience" &&
  entry.sortKey.localeCompare(NOW_MARKER_SORTKEY) <= 0 &&
  (!entry.endKey || entry.endKey.localeCompare(NOW_MARKER_SORTKEY) >= 0);

/**
 * Inclusive month span, derived from the start/end keys rather than written by
 * hand. Returns null when it can't produce something sensible, for example if the
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
  /** Headline outcomes, shown on the card without expanding it. */
  metrics?: { value: string; label: string }[];
  icon?: string;
  iconAlt?: string;
  iconText?: string;
  demo?: string;
  repo?: string;
  comingSoon?: boolean;
  iconKey?: string;
  /** Key referencing a custom SVG cover component (used when there's no gallery hero). */
  coverKey?: string;
  /** Gallery, first image is shown as the card's showcase, rest available in lightbox. */
  gallery?: { src: string; alt: string }[];
};

export const featuredProjects: Project[] = [
  {
    id: "eternal2x",
    title: "Eternal2x",
    subtitle: "eternal2x.com",
    range: "Feb 2026 – Present",
    desc: "DaVinci Resolve plugin for hand-drawn animation. It finds the real drawings behind duplicated frames, then rebuilds the motion with optical flow.",
    bullets: [
      "This one came out of my own edits. I create anime edits for an audience of 11.8k, Twixtor smears the held frames, and every other interpolator invented motion between two identical drawings, so I wrote the tool I actually wanted.",
      "Anime is drawn on 2s or 3s. Twelve drawings a second, each held for two or three frames to fill 24fps. Most neighbouring frames are therefore identical, which is why running the footage straight through a frame interpolator does nothing. There is no motion between the frames to interpolate. Eternal2x recovers the unique drawings first, then rebuilds the shot at the original length and frame rate.",
      "Frame-difference scoring finds the duplicates and infers whether a clip is on 1s, 2s or 3s, so the hold pattern is read off the footage rather than typed in. If a clip has no duplicated frames the plugin says so and stops, instead of inventing motion that was never drawn.",
      "In-betweens come from DIS optical flow and a per-pixel remap. Where forward and backward motion disagree, which is exactly where flow normally tears, it fades to a soft dissolve instead of emitting a broken frame. Deliberate held poses stay still, and cuts snap rather than blending two shots together.",
      "The Lua panel is a thin wrapper over the Python modules, so every button has a command-line equivalent and --video runs the whole pipeline without opening Resolve at all.",
      "362 tests run green against a faked Resolve API, covering the bridge, the installer, the release builder and the site, so CI needs no copy of Resolve Studio. The Lua UI is driven from Python through an embedded Lua runtime.",
      "Ships a one-click installer that provisions its own Python when the machine has none, plus a startup updater that verifies each download against a SHA-256 checksum before applying it.",
    ],
    icon: withBasePath("/projects/eternal2x%20about.webp"),
    iconAlt: "Eternal2x icon",
    tech: ["Python", "Lua", "OpenCV", "NumPy", "DaVinci Resolve", "pytest"],
    demo: "https://eternal2x.com",
    repo: "https://github.com/Alitleis123/Eternal2x.com",
    coverKey: "eternal2x",
    gallery: [
      { src: withBasePath("/projects/eternal2x%20about.webp"), alt: "Eternal2x, about page" },
      { src: withBasePath("/projects/eternal2x%20download.webp"), alt: "Eternal2x, download page" },
    ],
  },
  {
    id: "tcr-platform",
    title: "Top Choice Realty Platform",
    range: "Jun – Sep 2025",
    desc: "Full-stack real estate platform with session auth, role-based access control, and a scalable component architecture.",
    bullets: [
      "Role-based access control is enforced in API middleware rather than in the UI, so the frontend cannot grant itself a permission it was not issued. Auth is session-based, with bcrypt-hashed credentials, sessions persisted to MongoDB through connect-mongo so a restart does not sign everyone out, and secure cookies.",
      "Every request body is parsed through a shared Zod schema at the route boundary, with sanitizing string, email and phone types underneath it and an error handler that turns a schema failure into a field-level 400. That is what keeps unvalidated writes off the collections, which is the failure mode that had produced the duplicate client records in the first place.",
      "A reusable component architecture carries listing views, agent dashboards, and client intake flows, so new screens compose rather than duplicate.",
      "Laid out as a pnpm workspace holding a React and Vite web app, an Express and Mongoose API, and shared infrastructure, with typecheck, lint and format running across both apps from the root.",
      "Inquiries submitted from the public site notify the listing agent over SMTP, with helmet and per-IP rate limiting in front of the public endpoints.",
      "Solo across the entire stack, meaning schema, API, auth, frontend architecture, deployment, and ongoing maintenance.",
    ],
    icon: withBasePath("/projects/Top%20choice%20image%201.webp"),
    iconAlt: "Top Choice Realty thumbnail",
    tech: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Zod", "REST APIs"],
    demo: "https://alitleis123.github.io/topchoicerealty/",
    repo: "https://github.com/alitleis123/topchoicerealty",
    coverKey: "topChoiceRealty",
    gallery: [
      { src: withBasePath("/projects/Top%20choice%20image%201.webp"), alt: "Top Choice Realty, main listings page" },
      { src: withBasePath("/projects/Top%20choice%20image%202.webp"), alt: "Top Choice Realty, agent dashboard" },
      { src: withBasePath("/projects/Top%20choice%20image%203.webp"), alt: "Top Choice Realty, listing detail" },
      { src: withBasePath("/projects/Top%20choice%20image%204.webp"), alt: "Top Choice Realty, admin view" },
      { src: withBasePath("/projects/Top%20choice%20image%205.webp"), alt: "Top Choice Realty, client intake" },
    ],
  },
  {
    id: "eternal-summary",
    title: "Eternal Summary",
    subtitle: "Chrome Extension",
    range: "Oct 2025 – Present",
    desc: "Chrome extension that summarizes the page you are reading, explains what you highlight, and answers follow-ups in a rail beside the article.",
    bullets: [
      "The panel is not a popup. It renders in a shadow root with its own stylesheet, inset beside the article, so a host rule like * { line-height: 1 !important } cannot collapse its text and it cannot leak styles back onto the page. The test fixture ships that CSS deliberately, along with uppercased buttons and forced letter spacing, to hold the boundary.",
      "Page-context code never sees the backend address. It names an endpoint, the content script forwards that to the MV3 service worker, and the worker checks the name against an allow list before it fetches anything. Gemini credentials live in Fly.io runtime secrets and .env is excluded from the image, so no key ships in a build or reaches the client.",
      "Every answer cites the passages it drew on. Clicking a source scrolls to that passage and highlights it in place without closing the panel, and the highlight is cleaned up afterwards rather than left on the page.",
      "Four modes, summary and bullets and key points and plain English, plus thirteen output languages independent of whatever the page is written in, a reading-time estimate, and a one-line verdict on whether the page is worth reading at all. Switching mode re-reads the page and appends, so the conversation above it survives. Summaries cache in extension storage for thirty minutes.",
      "69 end-to-end tests drive real Chrome over the DevTools Protocol. Only the chrome.* surface and the network are stubbed, so they exercise the real path, page to content script to service worker to backend. Coverage includes style isolation, cache expiry, focus trapping, rate-limit paths, and a check that repeated opens strand nothing on the page.",
      "The backend reads truncated and non-JSON model replies rather than dropping them, keeping the prose the model did manage to write instead of leaking raw JSON into the panel, and retries a busy model with backoff. A per-IP throttle sits in front, because an open endpoint on a metered key is an easy way to burn quota.",
    ],
    icon: withBasePath("/Timeline/eternal%20summary%20icon.webp"),
    iconAlt: "Eternal Summary icon",
    tech: [
      "JavaScript",
      "Chrome Extensions MV3",
      "Shadow DOM",
      "Gemini API",
      "Node.js",
      "Express",
      "Docker",
      "Fly.io",
      "Chrome DevTools Protocol",
    ],
    demo: "https://alitleis123.github.io/Eternal-Summary/",
    repo: "https://github.com/Alitleis123/Eternal-Summary",
    coverKey: "eternalSummary",
    gallery: [
      { src: withBasePath("/projects/es-panel.webp"), alt: "Eternal Summary, the rail open beside an article, with the reading time, the worth-reading verdict, the four modes, and numbered sources" },
      { src: withBasePath("/projects/es-bullets.webp"), alt: "Eternal Summary, bullets mode rendering the summary as a list" },
      { src: withBasePath("/projects/es-chat.webp"), alt: "Eternal Summary, a follow-up conversation in the same rail" },
      { src: withBasePath("/projects/es-trigger.webp"), alt: "Eternal Summary, the floating Summarize button beside a highlight" },
      { src: withBasePath("/projects/es-selection.webp"), alt: "Eternal Summary, the selection card anchored to the highlighted passage" },
    ],
  },
  {
    id: "sideband",
    title: "Sideband",
    subtitle: "sideband.studio",
    range: "2025 – Present",
    desc: "Independent Boston software studio, four founders, shipping six products across desktop, browser, and web on a shared Next.js surface.",
    bullets: [
      "Six products with four of them live. Eternal2x (Resolve plugin), Eternal Summary (Chrome extension), EternalRichPresence (Discord rich presence for Apple Music and Spotify), and Signature Cuts 413 (barbershop booking). EternalMonitor, an iPad as a low-latency Windows display in Rust and Swift, and Exerly Fitness are both in development.",
      "Co-founder and full-stack engineer. I own the web surface across the studio site and every product page, built on Next.js 14 with the App Router, TypeScript in strict mode, Tailwind, and Framer Motion.",
      "I also author the Python and Lua pipeline that ships as Eternal2x, driving DaVinci Resolve's scripting environment from an embedded Lua panel.",
      "The site carries an engineer roster rather than a single about page, a dossier per founder, generated from structured data, with products cross-linked to the people who built them.",
      "Playwright drives the pages in CI, alongside a copy-style check that fails the build on em dashes and semicolons in user-facing text, so four contributors cannot drift into four different voices.",
      "Started as Eternal Reverse and rebranded to Sideband in 2026, which meant moving a live site, its domain, and six product identities without breaking the existing links.",
    ],
    iconText: "SB",
    tech: ["TypeScript", "Next.js", "React", "Node.js", "Tailwind CSS", "Framer Motion", "Python", "Lua", "Playwright"],
    demo: "https://sideband.studio",
    repo: "https://github.com/whoisaldo/sideband.studio",
    coverKey: "sideband",
    gallery: [
      { src: withBasePath("/projects/sideband-hero.webp"), alt: "Sideband, the studio home page, with the product marks and the interactive terminal" },
      { src: withBasePath("/projects/sideband-products.webp"), alt: "Sideband, the stack row and the products close, six products and counting" },
      { src: withBasePath("/projects/sideband-engineers.webp"), alt: "Sideband, the engineer dossiers, one card per founder" },
    ],
  },
];

export const otherWork: Project[] = [
  {
    id: "calorie-calculator",
    title: "CalorieCalculator",
    range: "2024",
    desc: "Calorie target calculator. Mifflin-St Jeor for BMR, an activity multiplier for TDEE, then a goal adjustment.",
    bullets: [],
    tech: ["React", "Vite"],
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
    id: "neu-calendar-ics",
    title: "NEU Academic Calendar → ICS",
    range: "2026 – Present",
    desc: "Northeastern publishes its academic calendar only as a PDF. This scrapes it weekly and republishes a subscribable .ics feed filtered to Boston-campus undergraduates, with no dependencies and standard library only.",
    bullets: [],
    tech: ["Python", "GitHub Actions", "iCalendar"],
    repo: "https://github.com/Alitleis123/neu-academic-calendar-ics",
    iconKey: "calendar",
  },
  {
    id: "better-canvas",
    title: "Better Canvas",
    range: "2026 – In progress",
    desc: "Canvas LMS customizer for Chrome and Firefox. Skins, a kanban planner, Pomodoro, GPA and rubric predictors, and a command palette, all local with no accounts and no telemetry.",
    bullets: [],
    tech: ["JavaScript", "Chrome MV3", "Firefox"],
    repo: "https://github.com/Alitleis123/Better-Canvas",
    iconKey: "puzzle",
  },
];

// ───────────────────────────────────────────────────────────────────
// Off-clock
// ───────────────────────────────────────────────────────────────────

export type OffClockFrame = {
  id: string;
  /** Short label under the frame. */
  label: string;
  src: string;
  alt: string;
};

/**
 * The account, shown in a device frame rather than as a flat card, because a
 * phone screenshot in a landscape card has to give up either the identity or
 * the post grid.
 */
export const offClockProfile = {
  /**
   * A photoreal device render with the real screenshot composited onto it,
   * generated rather than faked in CSS. Transparent, so it sits on the page
   * background instead of inside a panel.
   */
  device: (() => {
    const base = withBasePath("/offclock/phone.webp");
    const v = process.env.NEXT_PUBLIC_PHONE_V;
    return v ? `${base}?v=${v}` : base;
  })(),
  src: withBasePath("/offclock/anime-editing-full.webp"),
  alt: "TikTok profile for @.justlightt showing 11.8K followers, 1.2M likes, and a post grid with 2.8M, 1.6M and 767.4K views",
  href: "https://www.tiktok.com/@.justlightt",
  handle: "@.justlightt",
  stats: [
    { value: "11.8K", label: "Followers" },
    { value: "1.2M", label: "Likes" },
    { value: "2.8M", label: "Top post" },
  ],
};

/** The craft behind the posts, meaning project files rather than finished videos. */
export const offClockFrames: OffClockFrame[] = [
  {
    id: "eye-edit",
    label: "Masks and effects",
    src: withBasePath("/offclock/eye-edit.webp"),
    alt: "After Effects composition for the AOT edit, timeline and keyframes below the preview",
  },
  {
    id: "rengoku-edit",
    label: "Saber and overlays",
    src: withBasePath("/offclock/rengoku-edit.webp"),
    alt: "After Effects composition for the Rengoku edit, fire-lettered title over the character",
  },
  {
    id: "eye-flow",
    label: "Flow graph and compositing",
    src: withBasePath("/offclock/eye-flow.webp"),
    alt: "The Flow panel open on a custom easing curve, 0.20 0.60 0.96 0.56, beside a composited hand shot",
  },
];

/** Extra frames worth a look up close, but not worth a slot on the page. */
export const offClockExtras = [
  {
    src: withBasePath("/offclock/eye-flowers.webp"),
    alt: "The same AOT project on the flowers shot, nulls and keyframed transforms in the timeline",
  },
];

/**
 * The causal link leads, because it is the part that is rare. Plenty of people
 * edit well. Editing well enough to notice a problem and then ship a tested
 * tool for it is the claim worth making first, so the craft detail follows as
 * the evidence for how you would know.
 */
export const offClockNote =
  "I create edits from anime, shows and movies for an audience of 11.8k, and Eternal2x came out of doing it. The footage is drawn on 2s, every interpolator I tried smeared the held frames, so I wrote one that treats the duplicates as deliberate. The edits themselves are built in After Effects, with nulls driving parented transforms, compositing in 3D space with camera moves, effects stacked deep, easing hand-tuned on every move, and the sound designed to match the cut.";

// ───────────────────────────────────────────────────────────────────
// About
// ───────────────────────────────────────────────────────────────────



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
      { name: "SQL", iconKey: "TbDatabase" },
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
