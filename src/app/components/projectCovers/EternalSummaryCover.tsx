"use client";

// Straight from the project site's tokens (sidebandstudio.github.io/Eternal-Summary).
const BG = "#100F14";
const RAISE = "#17161C";
const RAISE_2 = "#201F27";
const INK = "#EDEAE4";
const DIM = "#A8A3AE";
const FAINT = "#857F8D";
const LINE = "rgba(237,234,228,0.11)";
const ACCENT = "#7B8CFF";
const SERIF = "Newsreader, 'Iowan Old Style', Charter, Georgia, serif";

// The site's mark, drawn on a 48x28 box.
const INFINITY = "M13 5c9 0 13 18 22 18 9 0 11-18 0-18-9 0-13 18-22 18-9 0-11-18 0-18z";

function Mark({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <path
      d={INFINITY}
      transform={`translate(${x}, ${y}) scale(${scale})`}
      fill="none"
      stroke="url(#es-mark)"
      strokeWidth="3.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

/** A line of placeholder text in the rail. */
function Line({ x, y, w, o = 0.32 }: { x: number; y: number; w: number; o?: number }) {
  return <rect x={x} y={y} width={w} height="4" rx="2" fill={INK} opacity={o} />;
}

export default function EternalSummaryCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <linearGradient id="es-mark" x1="4" y1="5" x2="44" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset=".5" stopColor={ACCENT} />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="es-lit" x1="0" y1="0" x2="1" y2="0.2">
          <stop stopColor="#38BDF8" />
          <stop offset=".45" stopColor={ACCENT} />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
        <radialGradient id="es-glow" cx="78%" cy="52%" r="45%">
          <stop offset="0%" stopColor="rgba(123,140,255,0.13)" />
          <stop offset="100%" stopColor="rgba(123,140,255,0)" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill={BG} />
      <rect width="800" height="450" fill="url(#es-glow)" />

      {/* Hero, as on the site: the mark, the serif headline, two actions. */}
      <Mark x={40} y={66} scale={1.3} />

      <text fontFamily={SERIF} fontSize="46" letterSpacing="-1.2" fill={INK}>
        <tspan x="40" y="152">Read the page,</tspan>
        <tspan x="40" y="200">
          <tspan fill="url(#es-lit)" fontStyle="italic">
            not all of it
          </tspan>
          .
        </tspan>
      </text>

      <text fontFamily={SERIF} fontSize="15" fill={DIM}>
        <tspan x="40" y="240">One click summarizes the page you&apos;re on,</tspan>
        <tspan x="40" y="260">with sources you can check.</tspan>
      </text>

      <g transform="translate(40, 282)">
        <rect width="126" height="34" rx="17" fill={INK} />
        <circle cx="21" cy="17" r="7" fill="#EA4335" />
        <path d="M21 10 A7 7 0 0 1 27.06 20.5 L21 17 Z" fill="#FBBC05" />
        <path d="M27.06 20.5 A7 7 0 0 1 14.94 20.5 L21 17 Z" fill="#34A853" />
        <circle cx="21" cy="17" r="3" fill="#4285F4" stroke="#fff" strokeWidth="1.2" />
        <text x="36" y="21.5" fontSize="12" fontWeight="500" fill={BG}>
          Add to Chrome
        </text>
        <rect x="136" width="116" height="34" rx="17" fill="none" stroke={LINE} strokeWidth="1.2" />
        <path d="M153 12 L161 17 L153 22 Z" fill={INK} />
        <text x="169" y="21.5" fontSize="12" fontWeight="500" fill={INK}>
          Watch it work
        </text>
      </g>
      <text y="342" fontSize="11" fill={FAINT}>
        <tspan x="40">Free</tspan>
        <tspan x="78">No account</tspan>
      </text>

      {/* The rail, open beside a page. */}
      <g transform="translate(486, 72)">
        <rect width="276" height="300" rx="12" fill={RAISE} stroke={LINE} />

        <Mark x={14} y={16} scale={0.5} />
        <text x="44" y="26" fontSize="10.5" fontWeight="600" fill={INK}>
          Eternal Summary
        </text>
        <text x="44" y="39" fontSize="8.5" fill={FAINT}>
          2 min read
        </text>
        <g transform="translate(236, 25)" fill="none" stroke={FAINT} strokeWidth="1.2" strokeLinecap="round">
          <circle r="2.6" />
          <path d="M0 -5.5V-4M0 4V5.5M-5.5 0H-4M4 0H5.5M-3.9 -3.9L-2.8 -2.8M2.8 2.8L3.9 3.9M-3.9 3.9L-2.8 2.8M2.8 -2.8L3.9 -3.9" />
        </g>
        <path d="M252 21 L259 28 M259 21 L252 28" stroke={FAINT} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="0" y1="52" x2="276" y2="52" stroke={LINE} />

        <text x="14" y="70" fontSize="9" fontWeight="600" fill={ACCENT}>
          Worth reading
        </text>
        <Line x={82} y={64} w={150} o={0.22} />
        <line x1="0" y1="84" x2="276" y2="84" stroke={LINE} />

        <rect x="12" y="94" width="252" height="24" rx="12" fill={BG} />
        <rect x="14" y="96" width="62" height="20" rx="10" fill={RAISE_2} />
        <g fontSize="8.5" textAnchor="middle">
          <text x="45" y="109" fill={INK}>Summary</text>
          <text x="104" y="109" fill={DIM}>Bullets</text>
          <text x="160" y="109" fill={DIM}>Key points</text>
          <text x="226" y="109" fill={DIM}>Plain English</text>
        </g>

        <text x="14" y="140" fontSize="8.5" fill={FAINT}>
          Summary
        </text>
        <rect x="14" y="150" width="2" height="88" rx="1" fill={ACCENT} opacity="0.6" />
        {[240, 228, 244, 220, 236, 232, 246, 150].map((w, i) => (
          <Line key={i} x={24} y={152 + i * 11} w={w - 6} />
        ))}

        <text x="14" y="262" fontSize="8.5" fill={FAINT}>
          Sources
        </text>
        {[1, 2, 3].map((n, i) => (
          <g key={n} transform={`translate(${60 + i * 18}, 259)`}>
            <circle r="6.5" fill={RAISE_2} stroke={LINE} />
            <text y="3" fontSize="7.5" textAnchor="middle" fill={DIM}>
              {n}
            </text>
          </g>
        ))}
        <line x1="0" y1="278" x2="276" y2="278" stroke={LINE} />
        <text x="14" y="293" fontSize="8.5" fill={FAINT}>
          Ask about this page
        </text>
      </g>
    </svg>
  );
}
