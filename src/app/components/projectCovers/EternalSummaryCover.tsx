"use client";

const PURPLE = "#A855F7";
const PINK = "#EC4899";
const CYAN = "#60A5FA";
const SIDEBAR_BG = "#0d0d12";
const MAIN_BG = "#000000";

type NavItem = { label: string; icon: "home" | "star" | "play" | "gear" | "down" | "info"; active?: boolean };

const NAV: NavItem[] = [
  { label: "Home", icon: "home", active: true },
  { label: "Features", icon: "star" },
  { label: "Demo", icon: "play" },
  { label: "How It Works", icon: "gear" },
  { label: "Install", icon: "down" },
  { label: "About", icon: "info" },
];

function NavIcon({ kind, color }: { kind: NavItem["icon"]; color: string }) {
  const sw = 1.4;
  const common = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "home":
      return (
        <g {...common}>
          <path d="M-6 0 L0 -6 L6 0 L6 6 L-6 6 Z" />
          <line x1="-2" y1="6" x2="-2" y2="2" />
          <line x1="2" y1="6" x2="2" y2="2" />
        </g>
      );
    case "star":
      return (
        <g {...common}>
          <path d="M0 -6 L1.8 -1.8 L6 -1.8 L2.6 1.2 L4 5.6 L0 3 L-4 5.6 L-2.6 1.2 L-6 -1.8 L-1.8 -1.8 Z" />
        </g>
      );
    case "play":
      return (
        <g {...common}>
          <path d="M-4 -5 L5 0 L-4 5 Z" />
        </g>
      );
    case "gear":
      return (
        <g {...common}>
          <circle r="2.5" />
          <path d="M0 -7 L0 -5 M0 5 L0 7 M-7 0 L-5 0 M5 0 L7 0 M-5 -5 L-3.5 -3.5 M3.5 3.5 L5 5 M-5 5 L-3.5 3.5 M3.5 -3.5 L5 -5" />
        </g>
      );
    case "down":
      return (
        <g {...common}>
          <line x1="0" y1="-5" x2="0" y2="3" />
          <path d="M-3 0 L0 3 L3 0" />
          <line x1="-5" y1="6" x2="5" y2="6" />
        </g>
      );
    case "info":
      return (
        <g {...common}>
          <circle r="6" />
          <line x1="0" y1="-2" x2="0" y2="4" />
          <circle cx="0" cy="-4" r="0.4" fill={color} />
        </g>
      );
  }
}

export default function EternalSummaryCover() {
  const SIDEBAR_W = 150;
  const mainCenterX = SIDEBAR_W + (800 - SIDEBAR_W) / 2;

  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <linearGradient id="es-logoStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="50%" stopColor={PURPLE} />
          <stop offset="100%" stopColor={PINK} />
        </linearGradient>
        <linearGradient id="es-headlineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={PURPLE} />
          <stop offset="100%" stopColor={PINK} />
        </linearGradient>
        <radialGradient id="es-ambient" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="rgba(168,85,247,0.22)" />
          <stop offset="55%" stopColor="rgba(168,85,247,0.04)" />
          <stop offset="100%" stopColor="rgba(168,85,247,0)" />
        </radialGradient>
        <radialGradient id="es-orbCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1525" />
          <stop offset="60%" stopColor="#0a0610" />
          <stop offset="100%" stopColor="#050308" />
        </radialGradient>
        <radialGradient id="es-orbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(236,72,153,0.45)" />
          <stop offset="55%" stopColor="rgba(168,85,247,0.18)" />
          <stop offset="100%" stopColor="rgba(168,85,247,0)" />
        </radialGradient>
        <linearGradient id="es-btn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Main background */}
      <rect width="800" height="450" fill={MAIN_BG} />
      <rect x={SIDEBAR_W} y="0" width={800 - SIDEBAR_W} height="450" fill="url(#es-ambient)" />

      {/* Sidebar */}
      <g>
        <rect width={SIDEBAR_W} height="450" fill={SIDEBAR_BG} />
        <line x1={SIDEBAR_W} y1="0" x2={SIDEBAR_W} y2="450" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Brand: ES logo + wordmark */}
        <g transform="translate(20, 30)">
          {/* Logo mark — infinity-like ring */}
          <g transform="translate(13, 13)">
            <circle r="11" fill="none" stroke="url(#es-logoStroke)" strokeWidth="1.5" />
            <path
              d="M -5 0 C -5 -3, -2 -3, 0 0 C 2 3, 5 3, 5 0 C 5 -3, 2 -3, 0 0 C -2 3, -5 3, -5 0 Z"
              fill="none"
              stroke="url(#es-logoStroke)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
          <text x="34" y="18" fontSize="11" fontWeight="700" fill="#ffffff" letterSpacing="0.1">
            Eternal Summary
          </text>
        </g>

        {/* Nav items */}
        {NAV.map((item, i) => {
          const y = 90 + i * 32;
          const labelColor = item.active ? "#ffffff" : "rgba(180,180,200,0.55)";
          const iconColor = item.active ? "#ffffff" : "rgba(180,180,200,0.55)";
          return (
            <g key={item.label} transform={`translate(0, ${y})`}>
              {item.active ? (
                <rect x="10" y="-10" width={SIDEBAR_W - 20} height="22" rx="5" fill="rgba(168,85,247,0.10)" />
              ) : null}
              <g transform="translate(24, 1)">
                <NavIcon kind={item.icon} color={iconColor} />
              </g>
              <text x="40" y="5" fontSize="10" fontWeight={item.active ? 600 : 500} fill={labelColor} letterSpacing="0.2">
                {item.label}
              </text>
            </g>
          );
        })}

        {/* Sidebar footer */}
        <g transform="translate(20, 395)">
          <text fontSize="8.5" fill="rgba(168,85,247,0.85)" fontWeight="500">
            GitHub Repository
          </text>
          <text y="14" fontSize="7.5" fill="rgba(180,180,200,0.45)">
            © 2026 Ali Tleis
          </text>
          <text y="25" fontSize="7.5" fill="rgba(180,180,200,0.45)">
            CS @ Northeastern University
          </text>
        </g>
      </g>

      {/* Centered orb */}
      <g transform={`translate(${mainCenterX}, 130)`}>
        {/* Outer glow halo */}
        <circle r="62" fill="url(#es-orbGlow)" />
        {/* Outer ring */}
        <circle r="38" fill="none" stroke="url(#es-logoStroke)" strokeWidth="2.5" />
        {/* Inner dark sphere */}
        <circle r="33" fill="url(#es-orbCenter)" />
        {/* Infinity-style mark inside */}
        <g>
          <path
            d="M -10 0 C -10 -6, -4 -6, 0 0 C 4 6, 10 6, 10 0 C 10 -6, 4 -6, 0 0 C -4 6, -10 6, -10 0 Z"
            fill="none"
            stroke="url(#es-logoStroke)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* Headline */}
      <g textAnchor="middle">
        <text x={mainCenterX} y="230" fontSize="36" fontWeight="800" fill="#ffffff" letterSpacing="-1">
          Summarize any page
        </text>
        <text x={mainCenterX} y="272" fontSize="36" fontWeight="800" fill="url(#es-headlineGrad)" letterSpacing="-1">
          in one click.
        </text>
      </g>

      {/* Subtitle */}
      <g textAnchor="middle" fill="rgba(180,180,200,0.65)" fontSize="11">
        <text x={mainCenterX} y="306">
          Eternal Summary uses AI to instantly distill web pages
        </text>
        <text x={mainCenterX} y="322">
          into clear, concise summaries.
        </text>
      </g>

      {/* Get Started button */}
      <g transform={`translate(${mainCenterX - 60}, 348)`}>
        <rect width="120" height="34" rx="17" fill="url(#es-btn)" />
        <rect width="120" height="34" rx="17" fill="none" stroke="rgba(236,72,153,0.4)" strokeWidth="1" />
        <text x="60" y="22" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff" letterSpacing="0.3">
          Get Started
        </text>
      </g>

      {/* Tab-style URL bar at top right (subtle browser hint) */}
      <g transform="translate(620, 18)" fontFamily="var(--font-geist-mono), ui-monospace, monospace">
        <text fontSize="8" fill="rgba(180,180,200,0.35)" letterSpacing="0.5">
          alitleis123.github.io/Eternal-Summary
        </text>
      </g>
    </svg>
  );
}
