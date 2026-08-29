"use client";

const CYAN = "#22D3EE";
const GREEN = "#34D399";
const AMBER = "#F59E0B";
const BG = "#07070A";

type Product = { name: string; status: "LIVE" | "DEV" };

const PRODUCTS: Product[] = [
  { name: "Eternal2x", status: "LIVE" },
  { name: "Eternal Summary", status: "LIVE" },
  { name: "EternalRichPresence", status: "LIVE" },
  { name: "Signature Cuts 413", status: "LIVE" },
  { name: "EternalMonitor", status: "DEV" },
  { name: "Exerly Fitness", status: "DEV" },
];

export default function EternalReverseCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <linearGradient id="er-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c0c12" />
          <stop offset="100%" stopColor={BG} />
        </linearGradient>
        <radialGradient id="er-glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.10)" />
          <stop offset="60%" stopColor="rgba(34,211,238,0.02)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill="url(#er-bg)" />
      <rect width="800" height="450" fill="url(#er-glow)" />

      {/* Top nav line */}
      <line x1="40" y1="42" x2="760" y2="42" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* Top brackets header */}
      <text
        x="40"
        y="28"
        fontSize="10"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fill={CYAN}
        letterSpacing="3"
      >
        [ ETERNAL REVERSE · EST. 2025 ]
      </text>

      {/* Nav links */}
      <g
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fontSize="9"
        fill="rgba(255,255,255,0.55)"
        letterSpacing="2"
      >
        <text x="540" y="28">PRODUCTS</text>
        <text x="620" y="28">ABOUT</text>
        <text x="670" y="28">GITHUB</text>
        <text x="730" y="28" fill={CYAN}>↗</text>
      </g>

      {/* Centered hero headline */}
      <g textAnchor="middle">
        <text x="400" y="148" fontSize="46" fontWeight="700" fill="#ffffff" letterSpacing="-1.2">
          Software that endures.
        </text>
        <text x="400" y="180" fontSize="13" fill="rgba(255,255,255,0.55)" letterSpacing="0.2">
          A two-person studio shipping technically ambitious products.
        </text>
      </g>

      {/* Hero CTA buttons */}
      <g transform="translate(400, 210)" textAnchor="middle">
        <g transform="translate(-90, 0)">
          <rect x="-65" y="0" width="130" height="34" rx="6" fill={CYAN} />
          <text y="22" fontSize="11" fill="#031318" fontWeight="700" letterSpacing="1.4">
            VIEW PRODUCTS  →
          </text>
        </g>
        <g transform="translate(90, 0)">
          <rect x="-65" y="0" width="130" height="34" rx="6" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <text y="22" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600" letterSpacing="1.4">
            OUR STORY
          </text>
        </g>
      </g>

      {/* Products section label */}
      <g transform="translate(40, 290)">
        <text
          fontSize="9"
          fontFamily="var(--font-geist-mono), ui-monospace, monospace"
          fill="rgba(255,255,255,0.45)"
          letterSpacing="3"
        >
          [ ACTIVE PRODUCTS · 06 ]
        </text>
        <line x1="180" y1="-4" x2="760" y2="-4" stroke="rgba(255,255,255,0.06)" strokeWidth="1" transform="translate(0, 0)" />
      </g>

      {/* Product pill grid: 3 cols × 2 rows */}
      <g transform="translate(40, 310)">
        {PRODUCTS.map((p, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = col * 246;
          const y = row * 56;
          const isLive = p.status === "LIVE";
          const dotColor = isLive ? GREEN : AMBER;
          const labelColor = isLive ? GREEN : AMBER;
          return (
            <g key={p.name} transform={`translate(${x},${y})`}>
              <rect
                width="226"
                height="44"
                rx="6"
                fill="rgba(255,255,255,0.025)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              {/* Status dot */}
              <circle cx="18" cy="22" r="4" fill={dotColor} />
              <circle cx="18" cy="22" r="7" fill="none" stroke={dotColor} strokeWidth="1" opacity="0.35" />
              {/* Product name */}
              <text x="34" y="20" fontSize="11" fill="#ffffff" fontWeight="600" letterSpacing="0.2">
                {p.name}
              </text>
              {/* Status label */}
              <text
                x="34"
                y="34"
                fontSize="8"
                fontFamily="var(--font-geist-mono), ui-monospace, monospace"
                fill={labelColor}
                letterSpacing="2.5"
              >
                {isLive ? "LIVE" : "IN DEV"}
              </text>
              {/* External arrow */}
              <text x="210" y="26" fontSize="11" fill="rgba(255,255,255,0.35)">
                ↗
              </text>
            </g>
          );
        })}
      </g>

      {/* Bottom marker */}
      <text
        x="40"
        y="438"
        fontSize="8.5"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fill="rgba(255,255,255,0.35)"
        letterSpacing="2.5"
      >
        BUILT TO LAST  ·  SHIPPED TO MATTER
      </text>
      <text
        x="760"
        y="438"
        textAnchor="end"
        fontSize="8.5"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fill={CYAN}
        letterSpacing="2.5"
      >
        ETERNALREVERSE.DEV
      </text>
    </svg>
  );
}
