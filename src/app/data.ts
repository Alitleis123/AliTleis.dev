import { tiktokStats } from "./tiktokStats.ts";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Live TikTok counts, refreshed by scripts/fetch-tiktok-stats.mjs.
 *
 * Every place the audience size appears reads from here. It used to be typed
 * out in four: the stat tile, the image's alt text and two paragraphs, so a
 * new number meant finding all four and one of them always got missed.
 *
 * Top post views stay hand written below. The profile payload carries follower
 * and like totals but no per video play count, so that figure is only as fresh
 * as the screenshot beside it.
 */
export const tiktokFetchedAt = tiktokStats.fetchedAt;

/** 11800 to "11.8K", 1200000 to "1.2M", the way the app itself renders them. */
export function formatCount(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${k >= 10 ? k.toFixed(1).replace(/\.0$/, "") : k.toFixed(1)}K`;
  }
  return String(n);
}

export const followerLabel = formatCount(tiktokStats.followerCount);
export const likeLabel = formatCount(tiktokStats.heartCount);

/** Hand written, since the profile payload has no per video play count. */
const TOP_POST = "2.9M";

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
    desc: "Seven-month co-op. I own the Laboratory's internal AI search, used by 4,500+ engineers, from the technical proposal to the production release.",
    bullets: [
      "Wrote the technical proposal, then built and shipped the service to production, with Java and Spring Boot APIs and Python and FastAPI services.",
      "Retrieval combines Solr keyword and vector search, then reranks the candidates with Sentence Transformers before the model sees them. That cut query latency 70% and model tokens per request 40%.",
      "Search results and generated answers keep the source documents' access controls. Retrieval is permission-aware and tied to the lab's existing identity services.",
      "Norconex ingests content incrementally from SharePoint, internal documentation and the Laboratory's web properties, including pages behind authentication and pages rendered with JavaScript.",
      "Answers come from Llama, hosted internally on vLLM, with streamed responses, prompts grounded in the retrieved passages, and Redis caching for repeated queries.",
      "Runs as Docker containers on the lab's existing Kubernetes infrastructure, deployed with Helm and GitLab CI/CD. Automated integration tests and Prometheus and Grafana dashboards back the rollout and help diagnose failures.",
    ],
    metrics: [
      { value: "4,500+", label: "Engineers using it" },
      { value: "70%", label: "Lower query latency" },
      { value: "40%", label: "Fewer tokens per request" },
    ],
    note: "Security clearance under DoD investigation, in progress.",
    icon: withBasePath("/Timeline/MIT%20Lincoln%20Lab%20Logo.webp"),
    iconAlt: "MIT Lincoln Laboratory logo",
    iconText: "MIT LL",
    tech: [
      "Java",
      "Spring Boot",
      "Python",
      "FastAPI",
      "Apache Solr",
      "Sentence Transformers",
      "Norconex",
      "vLLM",
      "Redis",
      "Docker",
      "Kubernetes",
      "Helm",
      "GitLab CI/CD",
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
    desc: "Frontend internship that also covered the Express APIs, the MongoDB schema and the sync jobs behind them.",
    bullets: [
      "Built the client-intake and agent-dashboard workflows in Next.js from shared React and TypeScript components, so forms and layouts behave the same across the platform, and folded agent feedback into each production release.",
      "Added role-based access and document uploads to the Express APIs. Records live in MongoDB Atlas and uploaded files in Azure Blob Storage.",
      "Automated MongoDB synchronization with Python and C# Azure Functions, which cut manual reconciliation time 30%.",
      "Refactored the client and agent schemas to stop duplicate records. Unvalidated writes and inconsistent field names had been creating them, and the duplicates broke downstream queries.",
      "Added GitHub Actions workflows for builds, API tests and deployment checks.",
    ],
    metrics: [
      { value: "30%", label: "Less reconciliation time" },
    ],
    icon: withBasePath("/Timeline/Top%20Choice%20Realty.webp"),
    iconAlt: "Top Choice Realty logo",
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Express",
      "MongoDB Atlas",
      "Python",
      "C#",
      "Azure Functions",
      "Azure Blob Storage",
      "GitHub Actions",
    ],
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
    desc: "Workstation provisioning and inventory tooling for an office of 20+ machines.",
    bullets: [
      "Automated provisioning for 20+ workstations with PowerShell, covering software installs, account setup, and Windows and Linux configuration, so every machine came up the same way.",
      "Wrote a Python inventory utility that flags missing software, outdated systems and configuration differences between machines.",
      "Supported Microsoft Intune enrollment and Active Directory account administration.",
    ],
    metrics: [
      { value: "20+", label: "Workstations provisioned" },
    ],
    icon: withBasePath("/Timeline/RobertDe%20Falco.webp"),
    iconAlt: "Robert DeFalco Realty logo",
    tech: ["PowerShell", "Python", "Windows", "Linux", "Microsoft Intune", "Active Directory"],
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
  /** Headline outcomes, shown beside the subtitle without expanding the card. */
  metrics?: { value: string; label: string; icon?: "users" | "star" }[];
  icon?: string;
  iconAlt?: string;
  iconText?: string;
  demo?: string;
  /** Public listing, for something you install rather than visit. */
  store?: string;
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
    range: "Jan 2026 – Present",
    desc: "DaVinci Resolve plugin for hand-drawn animation. It finds the real drawings behind duplicated frames, then rebuilds the motion with optical flow.",
    bullets: [
      `This one came out of my own edits. I create anime edits for an audience of ${followerLabel}, Twixtor smears the held frames, and every other interpolator invented motion between two identical drawings, so I wrote the tool I actually wanted.`,
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
    id: "eternal-monitor",
    title: "EternalMonitor",
    subtitle: "eternalmonitor.dev",
    range: "Apr 2026 – Present",
    desc: "Turns an iPad into a second screen for Windows. Extend or mirror the desktop over Wi-Fi or USB, with touch, keyboard, Apple Pencil and PC audio sent both ways. I'm an open-source contributor and own its AMD GPU support.",
    metrics: [
      { value: "500+", label: "users", icon: "users" },
      { value: "175+", label: "GitHub stars", icon: "star" },
    ],
    bullets: [
      "My part is AMD support, end to end. I wrote the Rust and FFmpeg AMF encoding path for H.264 and HEVC, keyframe recovery, and a software fallback, then validated AMD streaming on physical Windows and iPad hardware through DXGI capture, GPU encoding, Wi-Fi and USB transport, VideoToolbox decoding and Metal rendering.",
      "The Windows host is Rust. It captures the desktop with DXGI and encodes on the graphics card through FFmpeg, with NVENC, AMF or Quick Sync, H.264 by default or HEVC, at 30 to 120 fps. The iPad app is native Swift. It decodes in hardware with VideoToolbox and draws NV12 frames with Metal.",
      "Each frame travels as numbered UDP fragments, and when one goes missing the iPad asks for that fragment again as soon as a later one shows the gap. The host keeps the last 96 frames, up to 12 MiB, to answer from, and the iPad waits an RTT-aware 8 to 25 ms before giving up and asking for a keyframe. One dropped packet rarely costs a frame, and the bitrate adapts between 4 and 50 Mbps from the iPad's loss and jitter reports.",
      "Over USB the same messages run through a length-framed tunnel that the host opens with Apple's device service. Plugging in a cable takes over a running Wi-Fi session, and unplugging falls back to the remembered Wi-Fi host without a manual reconnect.",
      "Extend mode adds a virtual display that exists only while the iPad is connected, so Windows never keeps a phantom monitor around. Touch maps to clicks, drags and two-finger scrolls. Apple Pencil arrives as Windows Ink pressure and tilt, and drawing mode ignores the palm resting on the canvas.",
      "PC audio is captured with WASAPI loopback and sent as 20 ms Opus packets. The iPad plays it through a jitter buffer that starts at 60 ms, grows to 120 ms after repeated underruns and shrinks again once playback is clean.",
      "First contact over Wi-Fi needs a six-digit code or a QR scan, which rotates after use and locks out a source after five failed tries in a minute. Later connections use a 128-bit token kept in the iPad's Keychain. The README says plainly that the stream itself is not encrypted, so it is meant for a network you trust.",
      "Rust and Swift check the wire protocol against shared golden vectors, and CI runs the Rust suites on Linux, macOS and Windows, the iPad tests, and a streaming system test on every pull request. On macOS the host streams a synthetic test pattern, so the whole pipeline is testable without a Windows machine. The v0.3.0 release held about 58 fps through 30-minute runs at 3440×1440 over Wi-Fi and 2732×2048 over USB on a physical iPad Pro.",
    ],
    icon: withBasePath("/projects/em-icon.webp"),
    iconAlt: "EternalMonitor icon",
    tech: ["Rust", "Swift", "FFmpeg", "VideoToolbox", "Metal", "DXGI", "UDP", "Opus"],
    demo: "https://eternalmonitor.dev/",
    repo: "https://github.com/sidebandstudio/EternalMonitor",
    coverKey: "eternalMonitor",
    gallery: [
      { src: withBasePath("/projects/em-site.webp"), alt: "EternalMonitor, the project site, with the Windows app streaming to an iPad" },
      { src: withBasePath("/projects/em-host.webp"), alt: "EternalMonitor, the Windows app streaming to an iPad Pro over USB at 60 fps, with latency, bitrate and repair stats" },
      { src: withBasePath("/projects/em-ipad.webp"), alt: "EternalMonitor, the iPad app's connect screen, with Connect, Scan QR code, Find PCs and recent PCs" },
    ],
  },
  {
    id: "eternal-summary",
    title: "Eternal Summary",
    subtitle: "Chrome Extension",
    range: "Sep 2023 – Present",
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
    store: "https://chromewebstore.google.com/detail/eternal-summary/cpdeianknlpdhlbfdgckdcgfglbhkjbf",
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
      "Six products with four of them live. Eternal2x (Resolve plugin), Eternal Summary (Chrome extension), EternalRichPresence (Discord rich presence for Apple Music and Spotify), and Signature Cuts 413 (barbershop booking). EternalMonitor, an iPad as a low-latency Windows display in Rust and Swift, is in public beta, and Exerly Fitness is in development.",
      "Co-founder and full-stack engineer. I own the web surface across the studio site and every product page, built on Next.js 14 with the App Router, TypeScript in strict mode, Tailwind, and Framer Motion.",
      "I also author the Python and Lua pipeline that ships as Eternal2x, driving DaVinci Resolve's scripting environment from an embedded Lua panel.",
      "The site carries an engineer roster rather than a single about page, a dossier per founder, generated from structured data, with products cross-linked to the people who built them.",
      "Playwright drives the pages in CI, alongside a copy-style check that fails the build on em dashes and semicolons in user-facing text, so four contributors cannot drift into four different voices.",
      "Started as Eternal Reverse and rebranded to Sideband in 2026, which meant moving a live site, its domain, and six product identities without breaking the existing links.",
    ],
    iconText: "SB",
    tech: ["TypeScript", "Next.js", "React", "Node.js", "Tailwind CSS", "Framer Motion", "Python", "Lua", "Playwright"],
    demo: "https://sideband.studio",
    repo: "https://github.com/sidebandstudio/sideband.studio",
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
  src: withBasePath("/offclock/tiktok-profile.webp"),
  alt: `TikTok profile for @.justlightt showing ${followerLabel} followers, ${likeLabel} likes, and a post grid led by ${TOP_POST} views`,
  href: "https://www.tiktok.com/@.justlightt",
  handle: "@.justlightt",
  stats: [
    { value: followerLabel, label: "Followers" },
    { value: likeLabel, label: "Likes" },
    { value: TOP_POST, label: "Top post" },
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
  `I create edits from anime, shows and movies for an audience of ${followerLabel}, and Eternal2x came out of doing it. The footage is drawn on 2s, every interpolator I tried smeared the held frames, so I wrote one that treats the duplicates as deliberate. The edits themselves are built in After Effects, with nulls driving parented transforms, compositing in 3D space with camera moves, effects stacked deep, easing hand-tuned on every move, and the sound designed to match the cut.`;

// ───────────────────────────────────────────────────────────────────
// About
// ───────────────────────────────────────────────────────────────────



/** Mirrors the clearance line on the resume. */
/**
 * The links that appear on the slate, the end card and the written page.
 *
 * These were written out three times with the LinkedIn vanity path spelled
 * differently in the display text than in the href, which is the kind of
 * thing that only breaks once the display text gets copied by hand.
 */
export const socials = {
  email: "tleis.a@northeastern.edu",
  github: "https://github.com/Alitleis123",
  githubLabel: "github.com/Alitleis123",
  linkedin: "https://www.linkedin.com/in/ali-tleis-091800247/",
  linkedinLabel: "linkedin.com/in/ali-tleis",
  tiktok: "https://www.tiktok.com/@.justlightt",
  tiktokLabel: "@.justlightt",
} as const;

/**
 * Where he is, in the words the resume uses.
 *
 * One export rather than a string typed into each surface, because the slate
 * and the end card were already drifting: one said the city, the other listed
 * hobbies in the slot a recruiter scans for a location.
 */
export const LOCATION = "Greater Boston";

export const aboutClearance = "DoD clearance investigation in progress";

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
  { name: "Java", iconKey: "FaJava" },
  { name: "Python", iconKey: "SiPython" },
  { name: "Rust", iconKey: "SiRust" },
  { name: "TypeScript", iconKey: "SiTypescript" },
  { name: "React", iconKey: "SiReact" },
  { name: "Next.js", iconKey: "SiNextdotjs" },
  { name: "Node.js", iconKey: "SiNodedotjs" },
  { name: "MongoDB", iconKey: "SiMongodb" },
];

export const stackGroups: StackGroup[] = [
  {
    title: "Languages",
    items: [
      { name: "TypeScript", iconKey: "SiTypescript" },
      { name: "JavaScript", iconKey: "SiJavascript" },
      { name: "Python", iconKey: "SiPython" },
      { name: "Java", iconKey: "FaJava" },
      { name: "Rust", iconKey: "SiRust" },
      { name: "C++", iconKey: "SiCplusplus" },
      { name: "C#", iconKey: "SiSharp" },
      { name: "Lua", iconKey: "SiLua" },
      { name: "SQL", iconKey: "TbDatabase" },
    ],
  },
  {
    title: "Frameworks & Frontend",
    items: [
      { name: "React", iconKey: "SiReact" },
      { name: "Next.js", iconKey: "SiNextdotjs" },
      { name: "Spring Boot", iconKey: "SiSpringboot" },
      { name: "FastAPI", iconKey: "SiFastapi" },
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
      { name: "JWT Auth", iconKey: "SiJsonwebtokens" },
      { name: "Git / GitHub", iconKey: "SiGithub" },
      { name: "Docker", iconKey: "SiDocker" },
      { name: "Kubernetes", iconKey: "SiKubernetes" },
      { name: "Helm", iconKey: "SiHelm" },
      { name: "GitLab CI/CD", iconKey: "SiGitlab" },
      { name: "GitHub Actions", iconKey: "SiGithubactions" },
      { name: "Prometheus", iconKey: "SiPrometheus" },
      { name: "Grafana", iconKey: "SiGrafana" },
      { name: "Linux", iconKey: "SiLinux" },
      { name: "OpenCV", iconKey: "SiOpencv" },
      { name: "FFmpeg", iconKey: "SiFfmpeg" },
      { name: "PowerShell", iconKey: "VscTerminalPowershell" },
      { name: "Azure Functions", iconKey: "VscAzure" },
      { name: "Jest", iconKey: "SiJest" },
      { name: "JUnit", iconKey: "SiJunit5" },
      { name: "Fly.io", iconKey: "SiFlydotio" },
    ],
  },
  {
    title: "Databases & Search",
    items: [
      { name: "MongoDB", iconKey: "SiMongodb" },
      { name: "PostgreSQL", iconKey: "SiPostgresql" },
      { name: "MySQL", iconKey: "SiMysql" },
      { name: "Redis", iconKey: "SiRedis" },
      { name: "Apache Solr", iconKey: "SiApachesolr" },
      { name: "Norconex", iconKey: "TbSpider" },
    ],
  },
  {
    title: "AI & ML",
    items: [
      { name: "LLM Integration", iconKey: "LuBrainCircuit" },
      { name: "Llama", iconKey: "SiMeta" },
      { name: "vLLM", iconKey: "TbServer" },
      { name: "Sentence Transformers", iconKey: "SiHuggingface" },
      { name: "Gemini API", iconKey: "SiGooglegemini" },
      { name: "Open-Weight LLMs", iconKey: "SiHuggingface" },
    ],
  },
];
