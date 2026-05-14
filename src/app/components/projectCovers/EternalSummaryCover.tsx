"use client";

const PURPLE = "#A855F7";
const PINK = "#EC4899";

export default function EternalSummaryCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <linearGradient id="es-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1525" />
          <stop offset="100%" stopColor="#0a0810" />
        </linearGradient>
        <radialGradient id="es-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1525" />
          <stop offset="60%" stopColor="#0a0810" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <linearGradient id="es-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PINK} />
          <stop offset="100%" stopColor={PURPLE} />
        </linearGradient>
        <radialGradient id="es-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(168,85,247,0.55)" />
          <stop offset="50%" stopColor="rgba(168,85,247,0.18)" />
          <stop offset="100%" stopColor="rgba(168,85,247,0)" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill="url(#es-bg)" />

      {/* Browser chrome */}
      <g>
        <rect x="40" y="30" width="720" height="38" rx="8" fill="#2a2535" />
        <rect x="40" y="60" width="720" height="2" fill="#1a1525" />
        {/* Traffic lights */}
        <circle cx="62" cy="49" r="5.5" fill="#FF5F57" />
        <circle cx="82" cy="49" r="5.5" fill="#FEBC2E" />
        <circle cx="102" cy="49" r="5.5" fill="#28C840" />
        {/* Address bar */}
        <rect x="130" y="40" width="500" height="18" rx="9" fill="#1a1525" stroke="rgba(255,255,255,0.06)" />
        <text
          x="150"
          y="53"
          fontSize="10"
          fontFamily="var(--font-geist-mono), ui-monospace, monospace"
          fill="rgba(255,255,255,0.55)"
        >
          computerscience.org/resources/what-is-coding
        </text>
        {/* Tiny extension icon */}
        <g transform="translate(722, 41)">
          <rect width="22" height="16" rx="4" fill="#0a0810" stroke="url(#es-ring)" strokeWidth="1" />
          <text x="11" y="12" textAnchor="middle" fontSize="8" fontWeight="700" fill="url(#es-ring)">
            ES
          </text>
        </g>
      </g>

      {/* Faded page content background */}
      <g opacity="0.32">
        {/* Article heading skeleton */}
        <rect x="80" y="100" width="220" height="14" rx="3" fill="rgba(255,255,255,0.45)" />
        <rect x="80" y="124" width="140" height="8" rx="3" fill="rgba(255,255,255,0.25)" />
        {/* Image block right side */}
        <rect x="500" y="100" width="220" height="120" rx="6" fill="rgba(255,255,255,0.10)" />
        {/* Body paragraph */}
        <g fill="rgba(255,255,255,0.18)">
          <rect x="80" y="160" width="380" height="6" rx="2" />
          <rect x="80" y="174" width="360" height="6" rx="2" />
          <rect x="80" y="188" width="370" height="6" rx="2" />
          <rect x="80" y="202" width="320" height="6" rx="2" />
        </g>
      </g>

      {/* Dimming layer over page so the orb pops */}
      <rect x="40" y="68" width="720" height="362" fill="rgba(10,8,16,0.55)" />

      {/* The orb — extension at work */}
      <g transform="translate(400, 240)">
        <circle r="120" fill="url(#es-glow)" />
        <circle r="70" fill="url(#es-orb)" />
        {/* Outer ring (gradient) */}
        <circle r="62" fill="none" stroke="url(#es-ring)" strokeWidth="3" />
        {/* Inner subtle ring */}
        <circle r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* Center "ES" mark */}
        <text
          y="6"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="url(#es-ring)"
          letterSpacing="1"
        >
          ES
        </text>
      </g>

      {/* Summary text under orb */}
      <g transform="translate(400, 360)" textAnchor="middle">
        <text fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.92)" letterSpacing="3">
          ONE-CLICK SUMMARY
        </text>
        <g fill="rgba(255,255,255,0.55)" fontSize="9">
          <text y="22">Asynchronous OpenAI summarization · MV3</text>
          <text y="38">Server-side proxying · Resilient sanitization</text>
        </g>
      </g>
    </svg>
  );
}
