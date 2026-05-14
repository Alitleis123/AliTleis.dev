"use client";

const GOLD = "#C8A85A";
const GOLD_DIM = "#9A803F";
const BG = "#0a0a0a";

export default function TopChoiceRealtyCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), Georgia, serif" }}
    >
      <defs>
        <linearGradient id="tcr-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1408" />
          <stop offset="55%" stopColor={BG} />
          <stop offset="100%" stopColor="#0a0805" />
        </linearGradient>
        <radialGradient id="tcr-spot" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="rgba(200,168,90,0.18)" />
          <stop offset="60%" stopColor="rgba(200,168,90,0.03)" />
          <stop offset="100%" stopColor="rgba(200,168,90,0)" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill="url(#tcr-bg)" />
      <rect width="800" height="450" fill="url(#tcr-spot)" />

      {/* Top nav bar */}
      <g>
        <rect x="0" y="0" width="800" height="42" fill="rgba(0,0,0,0.55)" />
        {/* Tiny logo + brand on left */}
        <g transform="translate(28, 13)">
          <path d="M0 12 L9 4 L18 12 L18 18 L0 18 Z" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinejoin="round" />
          <text x="26" y="11" fontSize="9" fill="#fff" letterSpacing="1.8" fontWeight="700">
            TOP CHOICE
          </text>
          <text x="26" y="22" fontSize="6.5" fill={GOLD} letterSpacing="2">
            REALTY LLC
          </text>
        </g>
        {/* Nav links centered */}
        <g fontSize="9" fill="rgba(255,255,255,0.85)" letterSpacing="2.2">
          <text x="335" y="26">HOME</text>
          <text x="395" y="26">LISTINGS</text>
          <text x="475" y="26">AGENTS</text>
        </g>
        {/* Agent Login pill right */}
        <rect x="700" y="11" width="72" height="20" rx="10" fill={GOLD} />
        <text x="736" y="25" textAnchor="middle" fontSize="8.5" fill="#1a1408" letterSpacing="1.4" fontWeight="700">
          AGENT LOGIN
        </text>
      </g>

      {/* Center: gold roof badge */}
      <g transform="translate(400, 175)">
        <circle r="46" fill="none" stroke={GOLD} strokeWidth="1.8" />
        <circle r="46" fill="rgba(200,168,90,0.04)" />
        {/* House roof glyph */}
        <g stroke={GOLD} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M-22 8 L0 -16 L22 8" />
          <path d="M-16 8 L-16 22 L16 22 L16 8" />
          <rect x="-5" y="11" width="10" height="11" />
        </g>
      </g>

      {/* Brand wordmark */}
      <g textAnchor="middle">
        <text x="400" y="262" fontSize="36" fontWeight="800" letterSpacing="1.5">
          <tspan fill={GOLD}>TOP CHOICE </tspan>
          <tspan fill="#ffffff">REALTY</tspan>
        </text>
        <text x="400" y="282" fontSize="10" letterSpacing="5" fill="rgba(200,168,90,0.85)" fontWeight="600">
          REALTY LLC
        </text>
      </g>

      {/* Tagline */}
      <text x="400" y="320" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.92)" letterSpacing="0.5">
        Our Passion is Our Clients
      </text>

      {/* CTA row */}
      <g transform="translate(400, 348)">
        <rect x="-110" y="0" width="100" height="32" rx="16" fill={GOLD} />
        <text x="-60" y="20" textAnchor="middle" fontSize="11" fill="#1a1408" fontWeight="700" letterSpacing="0.6">
          Browse Listings
        </text>
        <rect x="10" y="0" width="120" height="32" rx="16" fill="none" stroke={GOLD} strokeWidth="1.2" />
        <text x="70" y="20" textAnchor="middle" fontSize="11" fill={GOLD} fontWeight="600" letterSpacing="1">
          929-488-3666
        </text>
      </g>

      {/* Stats strip bottom */}
      <g transform="translate(0, 405)">
        <rect width="800" height="45" fill="#070705" />
        <line x1="0" y1="0" x2="800" y2="0" stroke={GOLD_DIM} strokeWidth="0.6" opacity="0.6" />
        <g textAnchor="middle" fontFamily="var(--font-geist-sans), sans-serif">
          <g transform="translate(200, 0)">
            <text y="22" fontSize="16" fill={GOLD} fontWeight="700">10+</text>
            <text y="36" fontSize="8" fill="rgba(255,255,255,0.65)" letterSpacing="1.8">YEARS</text>
          </g>
          <g transform="translate(400, 0)">
            <text y="22" fontSize="16" fill={GOLD} fontWeight="700">500+</text>
            <text y="36" fontSize="8" fill="rgba(255,255,255,0.65)" letterSpacing="1.8">FAMILIES</text>
          </g>
          <g transform="translate(600, 0)">
            <text y="22" fontSize="16" fill={GOLD} fontWeight="700">100%</text>
            <text y="36" fontSize="8" fill="rgba(255,255,255,0.65)" letterSpacing="1.8">SATISFACTION</text>
          </g>
        </g>
      </g>
    </svg>
  );
}
