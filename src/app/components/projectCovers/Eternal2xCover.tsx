"use client";

const VIOLET = "#8B6FF5";
const CYAN = "#5BC8FA";
const PINK = "#D946EF";

export default function Eternal2xCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <linearGradient id="e2x-logoStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="50%" stopColor={VIOLET} />
          <stop offset="100%" stopColor={PINK} />
        </linearGradient>
        <radialGradient id="e2x-logoGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(139,111,245,0.55)" />
          <stop offset="60%" stopColor="rgba(139,111,245,0.10)" />
          <stop offset="100%" stopColor="rgba(139,111,245,0)" />
        </radialGradient>
        <linearGradient id="e2x-btn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={VIOLET} />
          <stop offset="100%" stopColor="#A788FF" />
        </linearGradient>
        <radialGradient id="e2x-amb" cx="20%" cy="15%" r="80%">
          <stop offset="0%" stopColor="rgba(91,200,250,0.06)" />
          <stop offset="60%" stopColor="rgba(91,200,250,0)" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill="#000000" />
      <rect width="800" height="450" fill="url(#e2x-amb)" />

      {/* Top nav bar — minimal */}
      <g>
        <line x1="0" y1="42" x2="800" y2="42" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <text x="28" y="26" fontSize="11" fill="#ffffff" fontWeight="700" letterSpacing="0.4">
          Eternal2x
        </text>
        <g fontSize="9" fill="rgba(255,255,255,0.55)" letterSpacing="1.5">
          <text x="640" y="26">ABOUT</text>
          <text x="690" y="26">HELP</text>
          <text x="730" y="26">DOCS</text>
        </g>
      </g>

      {/* Logo block (left) */}
      <g transform="translate(110, 150)">
        <circle cx="60" cy="60" r="90" fill="url(#e2x-logoGlow)" />
        <rect x="0" y="0" width="120" height="120" rx="14" fill="#0c0c10" stroke="url(#e2x-logoStroke)" strokeWidth="1.5" />
        <text
          x="60"
          y="76"
          textAnchor="middle"
          fontSize="48"
          fontWeight="800"
          fill="url(#e2x-logoStroke)"
          letterSpacing="-1"
        >
          E2x
        </text>
        <text x="60" y="146" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)" letterSpacing="1.8">
          SMART UPSCALE
        </text>
      </g>

      {/* Headline (right) */}
      <g transform="translate(280, 130)">
        <text fontSize="42" fill="#ffffff" fontWeight="700" letterSpacing="-1">
          <tspan x="0" y="38">Upscale</tspan>
          <tspan x="0" y="82">smarter.</tspan>
        </text>
        <text fontSize="12" fill="rgba(255,255,255,0.6)" letterSpacing="0.2">
          <tspan x="0" y="118">Motion-aware upscaling built directly into</tspan>
          <tspan x="0" y="135">your DaVinci Resolve timeline.</tspan>
        </text>
      </g>

      {/* Workflow steps */}
      <g transform="translate(0, 340)">
        <g fontFamily="var(--font-geist-mono), ui-monospace, monospace">
          {[
            { label: "DETECT", x: 130 },
            { label: "SEQUENCE", x: 290 },
            { label: "REGROUP", x: 460 },
            { label: "UPSCALE", x: 620 },
          ].map((step, i) => (
            <g key={step.label} transform={`translate(${step.x}, 0)`}>
              <circle cx="0" cy="0" r="11" fill="none" stroke={VIOLET} strokeWidth="1.4" />
              <text x="0" y="4" textAnchor="middle" fontSize="10" fill={VIOLET} fontWeight="700">
                {i + 1}
              </text>
              <text x="0" y="28" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.75)" letterSpacing="2">
                {step.label}
              </text>
              {i < 3 ? (
                <line
                  x1="14"
                  y1="0"
                  x2={
                    [290, 460, 620][i] - step.x - 14
                  }
                  y2="0"
                  stroke="rgba(139,111,245,0.35)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              ) : null}
            </g>
          ))}
        </g>
      </g>

      {/* Download CTA bottom-left */}
      <g transform="translate(40, 395)">
        <rect width="130" height="32" rx="9" fill="url(#e2x-btn)" />
        <text x="65" y="20" textAnchor="middle" fontSize="11" fill="#1a0f3d" fontWeight="700" letterSpacing="0.4">
          Download
        </text>
      </g>

      {/* Build tag bottom-right */}
      <text
        x="760"
        y="416"
        textAnchor="end"
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
        fill="rgba(255,255,255,0.35)"
        letterSpacing="2"
      >
        v0.2.0  ·  RESOLVE 18+
      </text>
    </svg>
  );
}
