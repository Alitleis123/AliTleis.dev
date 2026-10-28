"use client";

const AMBER = "#F2A93B";
const INK = "#1B1C21";
const PAPER = "#F4F4F1";

/**
 * Two strips of film, the way the plugin sees a shot. The top one is as drawn
 * on 2s, each drawing held for two frames. The bottom one is what Upflow2x
 * renders, with the repeats replaced by amber in-betweens and the last drawing
 * held, since it has nothing after it to move toward.
 */
const AS_DRAWN = [0, 0, 1, 1, 2, 2];
const REBUILT = [0, 0.5, 1, 1.5, 2, 2];

function Strip({ y, frames }: { y: number; frames: number[] }) {
  const cell = 45;
  const gap = 6;
  return (
    <g transform={`translate(450, ${y})`}>
      <rect width="300" height="60" rx="8" fill={PAPER} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} fill={INK}>
          <rect x={9 + i * 24.5} y="4" width="10" height="5" rx="1.5" />
          <rect x={9 + i * 24.5} y="51" width="10" height="5" rx="1.5" />
        </g>
      ))}
      {frames.map((pos, i) => {
        const tween = pos % 1 !== 0;
        return (
          <g key={i} transform={`translate(${i * (cell + gap)}, 12)`}>
            <rect width={cell} height="36" rx="5" fill={tween ? AMBER : INK} />
            <circle cx={11 + pos * 11.5} cy="18" r="6" fill={tween ? INK : PAPER} />
          </g>
        );
      })}
    </g>
  );
}

export default function Upflow2xCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <radialGradient id="uf2x-glow" cx="76%" cy="44%" r="46%">
          <stop offset="0%" stopColor="rgba(242,169,59,0.14)" />
          <stop offset="100%" stopColor="rgba(242,169,59,0)" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill="#111215" />
      <rect width="800" height="450" fill="url(#uf2x-glow)" />

      {/* Wordmark, below the card's corner badge. The mark is the site's
          icon: three frames, the amber one drawn between the other two. */}
      <g transform="translate(40, 62)">
        <rect width="24" height="24" rx="6" fill={INK} stroke="rgba(255,255,255,0.12)" />
        <rect x="3" y="7" width="18" height="10" rx="1.5" fill={PAPER} />
        <rect x="4.5" y="9" width="4.5" height="6" rx="0.8" fill={INK} />
        <rect x="9.75" y="9" width="4.5" height="6" rx="0.8" fill={AMBER} />
        <rect x="15" y="9" width="4.5" height="6" rx="0.8" fill={INK} />
        <text x="32" y="17" fontSize="14" fontWeight="600" fill="#ffffff">
          Upflow
        </text>
        <rect x="87" y="5" width="20" height="14" rx="3" fill={AMBER} />
        <text x="97" y="15.5" textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>
          2X
        </text>
      </g>

      {/* Headline, as on upflow2x.com */}
      <g transform="translate(40, 128)">
        <text fontSize="34" fontWeight="600" letterSpacing="-1" fill="#ffffff">
          <tspan x="0" y="0">Upscale and</tspan>
          <tspan x="0" y="40">
            smooth <tspan fill={AMBER}>anime in</tspan>
          </tspan>
          <tspan x="0" y="80" fill={AMBER}>
            Resolve.
          </tspan>
        </text>
        <text fontSize="12" fill="rgba(244,244,241,0.66)">
          <tspan x="0" y="114">Draws the frames between the drawings,</tspan>
          <tspan x="0" y="131">then redraws every frame at 2x, inside</tspan>
          <tspan x="0" y="148">DaVinci Resolve Studio.</tspan>
        </text>
      </g>

      <g transform="translate(40, 296)">
        <rect width="116" height="30" rx="6" fill={AMBER} />
        <text x="58" y="19.5" textAnchor="middle" fontSize="11" fontWeight="600" fill={INK}>
          Download, free
        </text>
        <rect x="124" width="104" height="30" rx="6" fill="none" stroke="rgba(255,255,255,0.18)" />
        <text x="176" y="19.5" textAnchor="middle" fontSize="11" fontWeight="600" fill="#ffffff">
          How to install
        </text>
      </g>

      {/* The idea, in two strips of film */}
      <rect x="430" y="80" width="340" height="256" rx="12" fill="#17181C" stroke="rgba(242,169,59,0.35)" />
      <text x="450" y="108" fontSize="11" fill="rgba(244,244,241,0.6)">
        As drawn, on 2s
      </text>
      <Strip y={118} frames={AS_DRAWN} />
      <text x="450" y="206" fontSize="11" fill={AMBER}>
        From Upflow2x
      </text>
      <Strip y={216} frames={REBUILT} />
      <g fontSize="10" fontFamily="var(--font-geist-mono), ui-monospace, monospace">
        <rect x="450" y="294" width="112" height="22" rx="5" fill="none" stroke="rgba(242,169,59,0.45)" />
        <text x="506" y="309" textAnchor="middle" fill={AMBER}>
          RIFE IN-BETWEENS
        </text>
        <rect x="570" y="294" width="104" height="22" rx="5" fill="none" stroke="rgba(255,255,255,0.18)" />
        <text x="622" y="309" textAnchor="middle" fill="rgba(244,244,241,0.8)">
          REAL-ESRGAN 2X
        </text>
      </g>
    </svg>
  );
}
