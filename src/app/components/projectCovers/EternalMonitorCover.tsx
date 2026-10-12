"use client";

import { withBasePath } from "../../data";

// Tokens from the project's docs/design.md, shared by both apps and the site.
const CANVAS = "#0A0A0B";
const SURFACE = "#121214";
const RAISED = "#1A1A1D";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#F4F4F5";
const MUTED = "#A1A1AA";
const FAINT = "#71717A";
const LIME = "#E8FF47";
const ON_LIME = "#0C0D04";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const LOGO = withBasePath("/projects/em-icon.webp");

const STATS = [
  { label: "Frame rate", value: "60", unit: "fps" },
  { label: "Latency", value: "18", unit: "ms" },
  { label: "Bitrate", value: "14.8", unit: "Mbps" },
];

const SIDEBAR = ["Stream", "Performance", "Settings"];

export default function EternalMonitorCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <radialGradient id="em-glow" cx="22%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(232,255,71,0.11)" />
          <stop offset="55%" stopColor="rgba(232,255,71,0.02)" />
          <stop offset="100%" stopColor="rgba(232,255,71,0)" />
        </radialGradient>
        <radialGradient id="em-live" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(232,255,71,0.35)" />
          <stop offset="100%" stopColor="rgba(232,255,71,0)" />
        </radialGradient>
        <clipPath id="em-window">
          <rect x="410" y="92" width="350" height="300" rx="10" />
        </clipPath>
        <clipPath id="em-screen">
          <rect x="650" y="206" width="118" height="168" rx="8" />
        </clipPath>
      </defs>

      <rect width="800" height="450" fill={CANVAS} />
      <rect width="800" height="450" fill="url(#em-glow)" />

      {/* Site nav */}
      <g>
        <line x1="0" y1="42" x2="800" y2="42" stroke={BORDER} strokeWidth="1" />
        <image href={LOGO} x="28" y="12" width="18" height="18" />
        <text x="54" y="25" fontSize="11" fontWeight="600" fill={TEXT}>
          EternalMonitor
        </text>
        <g fontSize="9" fill={MUTED}>
          <text x="540" y="25">Features</text>
          <text x="590" y="25">How it works</text>
          <text x="658" y="25">FAQ</text>
        </g>
        <rect x="700" y="13" width="72" height="18" rx="5" fill={LIME} />
        <text x="736" y="25" textAnchor="middle" fontSize="8.5" fontWeight="600" fill={ON_LIME}>
          Download
        </text>
      </g>

      {/* Hero copy */}
      <g transform="translate(40, 0)">
        <rect x="0" y="92" width="168" height="20" rx="10" fill={RAISED} stroke={BORDER} />
        <circle cx="12" cy="102" r="2.5" fill={LIME} />
        <text x="21" y="105" fontSize="8" fill={MUTED}>
          v0.3.0 · Free and open source
        </text>

        <g fontSize="34" fontWeight="600" letterSpacing="-1.2">
          <text x="0" y="160" fill={TEXT}>
            Your iPad, as a
          </text>
          <text x="0" y="200" fill={LIME}>
            second screen
          </text>
          <text x="0" y="240" fill={TEXT}>
            for Windows.
          </text>
        </g>

        <g fontSize="10.5" fill={MUTED}>
          <text x="0" y="274">Extend or mirror your desktop over Wi-Fi or USB,</text>
          <text x="0" y="289">then tap, type and draw on it to control the PC.</text>
        </g>

        <rect x="0" y="312" width="128" height="30" rx="7" fill={LIME} />
        <text x="64" y="331" textAnchor="middle" fontSize="10" fontWeight="600" fill={ON_LIME}>
          Download for Windows
        </text>
        <rect x="138" y="312" width="104" height="30" rx="7" fill={RAISED} stroke={BORDER} />
        <text x="190" y="331" textAnchor="middle" fontSize="10" fontWeight="500" fill={TEXT}>
          View on GitHub
        </text>

        <g fontFamily={MONO} fontSize="8" fill={FAINT}>
          <text x="0" y="374">Rust host · Swift iPad app · NVENC · AMF · Quick Sync</text>
        </g>
      </g>

      {/* The Windows app */}
      <g clipPath="url(#em-window)">
        <rect x="410" y="92" width="350" height="300" fill={CANVAS} />
        <rect x="410" y="92" width="350" height="22" fill={SURFACE} />
        <image href={LOGO} x="419" y="97" width="12" height="12" />
        <text x="437" y="106" fontSize="7.5" fill={MUTED}>
          EternalMonitor
        </text>
        <g stroke={FAINT} strokeWidth="1">
          <line x1="712" y1="103" x2="718" y2="103" />
          <rect x="728" y="100" width="6" height="6" fill="none" />
          <path d="M744 100 L750 106 M750 100 L744 106" />
        </g>

        {/* Sidebar */}
        <rect x="410" y="114" width="84" height="278" fill={SURFACE} />
        <line x1="494" y1="114" x2="494" y2="392" stroke={BORDER} />
        {SIDEBAR.map((label, i) => {
          const y = 136 + i * 22;
          const on = i === 0;
          return (
            <g key={label}>
              {on ? (
                <>
                  <rect x="416" y={y - 10} width="72" height="17" rx="4" fill={RAISED} />
                  <rect x="416" y={y - 7} width="2" height="11" rx="1" fill={LIME} />
                </>
              ) : null}
              <text x="426" y={y + 1} fontSize="7.5" fontWeight={on ? 600 : 400} fill={on ? TEXT : MUTED}>
                {label}
              </text>
            </g>
          );
        })}
        <rect x="416" y="352" width="72" height="28" rx="5" fill={RAISED} stroke={BORDER} />
        <circle cx="425" cy="366" r="2.5" fill={LIME} />
        <text x="432" y="364" fontSize="6.5" fontWeight="600" fill={TEXT}>
          Streaming
        </text>
        <text x="432" y="373" fontSize="5.5" fill={MUTED}>
          iPad Pro · USB
        </text>

        {/* Stream card */}
        <rect x="506" y="126" width="244" height="110" rx="8" fill={SURFACE} stroke={BORDER} />
        <circle cx="526" cy="150" r="13" fill="url(#em-live)" />
        <circle cx="526" cy="150" r="9" fill="none" stroke="rgba(232,255,71,0.35)" />
        <circle cx="526" cy="150" r="4" fill={LIME} />
        <text x="544" y="148" fontSize="10" fontWeight="600" fill={TEXT}>
          Streaming to iPad Pro
        </text>
        <text x="544" y="160" fontSize="6.5" fill={MUTED}>
          USB · 1920 × 1080 · 60 fps · H.264 · NVENC
        </text>
        <line x1="516" y1="176" x2="740" y2="176" stroke={BORDER} />
        {STATS.map((s, i) => (
          <g key={s.label} transform={`translate(${518 + i * 74}, 0)`}>
            <text y="194" fontSize="6.5" fill={MUTED}>
              {s.label}
            </text>
            <text y="218" fontFamily={MONO} fontSize="16" fill={TEXT}>
              {s.value}
              <tspan fontSize="6.5" fill={MUTED} dx="2">
                {s.unit}
              </tspan>
            </text>
          </g>
        ))}

        {/* Connect card */}
        <rect x="506" y="246" width="128" height="134" rx="8" fill={SURFACE} stroke={BORDER} />
        <text x="518" y="266" fontSize="8.5" fontWeight="600" fill={TEXT}>
          Connect an iPad
        </text>
        <text x="518" y="292" fontSize="5.5" letterSpacing="0.8" fill={FAINT}>
          ADDRESS
        </text>
        <text x="518" y="306" fontFamily={MONO} fontSize="9" fill={TEXT}>
          192.168.1.20:9876
        </text>
        <text x="518" y="328" fontSize="5.5" letterSpacing="0.8" fill={FAINT}>
          PAIRING CODE
        </text>
        <text x="518" y="343" fontFamily={MONO} fontSize="11" fill={TEXT}>
          790 363
        </text>
      </g>
      <rect x="410" y="92" width="350" height="300" rx="10" fill="none" stroke={BORDER} />

      {/* The iPad, picking up the stream */}
      <g>
        <rect x="638" y="190" width="146" height="196" rx="18" fill="none" stroke="rgba(232,255,71,0.22)" strokeWidth="1.2" />
        <rect x="644" y="200" width="130" height="180" rx="13" fill="#050506" stroke="#2A2A2E" strokeWidth="1.5" />
        <g clipPath="url(#em-screen)">
          <rect x="650" y="206" width="118" height="168" fill={CANVAS} />
          <image href={LOGO} x="699" y="230" width="20" height="20" />
          <text x="709" y="262" textAnchor="middle" fontSize="7.5" fontWeight="600" fill={TEXT}>
            EternalMonitor
          </text>
          <text x="709" y="271" textAnchor="middle" fontSize="4.2" fill={MUTED}>
            Use this iPad as a second screen.
          </text>
          <rect x="660" y="280" width="98" height="64" rx="5" fill={SURFACE} stroke={BORDER} />
          <text x="666" y="291" fontSize="5" fontWeight="600" fill={TEXT}>
            Connect to a PC
          </text>
          <rect x="666" y="296" width="86" height="12" rx="3" fill={CANVAS} stroke={BORDER} />
          <text x="670" y="304.5" fontFamily={MONO} fontSize="4.5" fill={TEXT}>
            192.168.1.20
          </text>
          <rect x="666" y="313" width="86" height="12" rx="3" fill={LIME} />
          <text x="709" y="321.5" textAnchor="middle" fontSize="5" fontWeight="600" fill={ON_LIME}>
            Connect
          </text>
          <rect x="666" y="329" width="41" height="10" rx="3" fill={RAISED} />
          <rect x="711" y="329" width="41" height="10" rx="3" fill={RAISED} />
          <rect x="660" y="350" width="98" height="16" rx="4" fill={SURFACE} stroke={BORDER} />
          <text x="666" y="360.5" fontSize="4.5" fill={TEXT}>
            USB cable
          </text>
          <text x="752" y="360.5" textAnchor="end" fontSize="4.5" fill={LIME}>
            USB
          </text>
        </g>
      </g>
    </svg>
  );
}
