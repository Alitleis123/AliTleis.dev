"use client";

import { useId } from "react";

// Exerly's native dark theme, from apps/ios/Exerly/Theme/Colors.swift.
const PURPLE = "#8B5CF6";
const PINK = "#EC4899";
const MUTED = "#B2ADC2";

export default function ExerlyCover() {
  const id = useId();

  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <defs>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={PURPLE} />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
        <linearGradient id={`${id}-chart`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={PURPLE} stopOpacity="0.22" />
          <stop offset="1" stopColor={PURPLE} stopOpacity="0" />
        </linearGradient>
        <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#FFFFFF" strokeOpacity="0.025" />
        </pattern>
      </defs>

      <rect width="800" height="450" fill="#0A0A0F" />
      <rect width="800" height="450" fill={`url(#${id}-grid)`} />

      {/* The product name stays readable when the cover shrinks to a phone. */}
      <g transform="translate(40 48)">
        <rect width="38" height="38" rx="12" fill="#7C3AED" />
        <path d="M9 21h6l4-9 5 16 4-9h3" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="51" y="27" fill="white" fontSize="29" fontWeight="600" letterSpacing="-1">exerly</text>
        <text y="98" fill="white" fontSize="34" fontWeight="500" letterSpacing="-1.3">Find your rhythm.</text>
        <text y="125" fill={MUTED} fontSize="13">Nutrition, movement and recovery.</text>

        {/* A weight trend, drawn as an illustration rather than a result claim. */}
        <text y="185" fill={MUTED} fontSize="10" letterSpacing="2">ADAPTIVE NUTRITION</text>
        <path d="M0 210H272M0 250H272M0 290H272" stroke="white" strokeOpacity="0.07" />
        <path d="M0 214C18 214 22 233 42 228S68 217 87 238S113 230 135 248S155 239 180 255S210 251 229 269S252 264 272 275V306H0Z" fill={`url(#${id}-chart)`} />
        <path d="M0 214C18 214 22 233 42 228S68 217 87 238S113 230 135 248S155 239 180 255S210 251 229 269S252 264 272 275" fill="none" stroke={PURPLE} strokeWidth="3" strokeLinecap="round" />
        <circle cx="272" cy="275" r="5" fill="#A78BFA" stroke="#0A0A0F" strokeWidth="3" />
        <text y="327" fill="#9D96B0" fontSize="10">Daily logs. A clearer trend.</text>
      </g>

      {/* A compact native dashboard, using the app's surface and chart colours. */}
      <g transform="translate(374 26)">
        <rect width="228" height="396" rx="32" fill="#15151D" stroke="#373040" />
        <rect x="7" y="7" width="214" height="382" rx="26" fill="#101016" />
        <rect x="79" y="14" width="70" height="17" rx="9" fill="#0A0A0F" />
        <text x="24" y="65" fill={MUTED} fontSize="10">YOUR DAILY OVERVIEW</text>
        <text x="24" y="92" fill="#F7F8FA" fontSize="23" fontWeight="600" letterSpacing="-0.7">Today</text>
        <circle cx="114" cy="179" r="55" fill="none" stroke="#1B1B24" strokeWidth="12" />
        <circle cx="114" cy="179" r="55" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="12" strokeDasharray="259 346" strokeLinecap="round" transform="rotate(-90 114 179)" />
        <text x="114" y="178" textAnchor="middle" fill="#F7F8FA" fontSize="30" fontWeight="600" letterSpacing="-1">1,650</text>
        <text x="114" y="198" textAnchor="middle" fill={MUTED} fontSize="10">of 2,200 kcal</text>

        {[
          { label: "Protein", value: "124 g", color: PURPLE, width: 42 },
          { label: "Carbs", value: "186 g", color: PINK, width: 35 },
          { label: "Fat", value: "46 g", color: "#FBBF24", width: 30 },
        ].map((macro, i) => (
          <g key={macro.label} transform={`translate(${24 + i * 63} 265)`}>
            <text fill={MUTED} fontSize="9">{macro.label}</text>
            <text y="19" fill="white" fontSize="15" fontWeight="500">{macro.value}</text>
            <rect y="30" width="54" height="4" rx="2" fill="#1B1B24" />
            <rect y="30" width={macro.width} height="4" rx="2" fill={macro.color} />
          </g>
        ))}

        <rect x="20" y="326" width="188" height="39" rx="12" fill="#7C3AED" />
        <path d="M35 345h10m-5-5v10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <text x="119" y="350" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">Log a meal</text>
        <rect x="83" y="378" width="62" height="3" rx="2" fill="white" fillOpacity="0.35" />
      </g>

      <g transform="translate(620 94)">
        <rect width="150" height="105" rx="16" fill="#15151D" stroke="#373040" />
        <path d="M16 24h5l3-6 5 12 3-6h5" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="16" y="51" fill={MUTED} fontSize="10">Movement</text>
        <text x="16" y="78" fill="white" fontSize="21" fontWeight="500">Stay active.</text>

        <rect y="121" width="150" height="105" rx="16" fill="#15151D" stroke="#373040" />
        <path d="M29 138a10 10 0 1 0 9 14 10 10 0 0 1-9-14Z" fill="none" stroke="#A78BFA" strokeWidth="1.8" />
        <text x="16" y="172" fill={MUTED} fontSize="10">Recovery</text>
        <text x="16" y="199" fill="white" fontSize="21" fontWeight="500">Rest well.</text>
      </g>

      <g fill="#9D96B0" fontFamily="var(--font-geist-mono), ui-monospace, monospace" fontSize="9" letterSpacing="1.6">
        <text x="40" y="425">A SIDEBAND PRODUCT</text>
        <text x="760" y="425" textAnchor="end">SWIFTUI / REACT</text>
      </g>
    </svg>
  );
}
