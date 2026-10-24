import { readFileSync } from "node:fs";
import path from "node:path";
import {
  LOCATION,
  RESUME_HREF,
  SITE_URL,
  aboutClearance,
  aboutHobbies,
  aboutLanguages,
  coreStack,
  featuredProjects,
  isCurrentEntry,
  offClockNote,
  offClockProfile,
  otherWork,
  socials,
  stackGroups,
  timeline,
  type Project,
} from "../data";

export const dynamic = "force-static";

/**
 * Everything the Ask panel's model knows about Ali, as one plain-text file.
 *
 * The answering function runs on Vercel, apart from this static site, and
 * reads this file from the live domain. Building it here from data.ts means
 * the model reads the same copy the page shows, and every Pages deploy,
 * including the monthly and TikTok rebuilds, refreshes it without touching
 * the function.
 *
 * askExtras.md is appended as-is. It holds things that are true but not on
 * the page, which the model is told to bring up only when asked.
 */
export function GET() {
  return new Response(profile(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

const line = (label: string, items: (string | undefined)[] | undefined) =>
  items?.length ? `${label}: ${items.filter(Boolean).join(", ")}` : null;

const links = (p: Project) =>
  line("Links", [p.demo, p.store, p.repo]);

function profile(): string {
  const out: (string | null)[] = [
    "# Ali Tleis",
    "",
    `Site: ${SITE_URL}`,
    `Location: ${LOCATION}`,
    `Security clearance: ${aboutClearance}`,
    line(
      "Spoken languages",
      aboutLanguages.map((l) => `${l.name} (${l.level})`),
    ),
    line("Off the clock", aboutHobbies.map((h) => h.name)),
    `Email: ${socials.email}`,
    `GitHub: ${socials.github}`,
    `LinkedIn: ${socials.linkedin}`,
    `TikTok: ${socials.tiktokLabel} (${socials.tiktok})`,
    `Resume PDF: ${SITE_URL}${RESUME_HREF}`,
    "",
    "## Experience and education",
  ];

  for (const e of timeline) {
    out.push(
      "",
      `### ${e.title}${e.subtitle ? `, ${e.subtitle}` : ""}`,
      [e.range, e.meta, isCurrentEntry(e) ? "current role" : null]
        .filter(Boolean)
        .join(" · "),
      e.desc,
      ...e.bullets.map((b) => `- ${b}`),
      line("Results", e.metrics?.map((m) => `${m.value} ${m.label.toLowerCase()}`)),
      line("Tech", e.tech),
      line("Facts", e.education?.stats.map((s) => `${s.label} ${s.value}`)),
      line("Coursework", e.education?.coursework),
      e.note ?? null,
    );
  }

  out.push("", "## Projects");
  for (const p of featuredProjects) {
    out.push(
      "",
      `### ${p.title}${p.subtitle ? ` (${p.subtitle})` : ""}`,
      p.range,
      p.desc,
      ...p.bullets.map((b) => `- ${b}`),
      line("Results", p.metrics?.map((m) => `${m.value} ${m.label}`)),
      line("Tech", p.tech),
      links(p),
    );
  }

  out.push("", "## Smaller projects");
  for (const p of otherWork) {
    out.push("", `### ${p.title}`, p.range, p.desc, line("Tech", p.tech), links(p));
  }

  out.push(
    "",
    "## Video editing",
    "",
    offClockNote,
    line(
      `TikTok ${offClockProfile.handle}`,
      offClockProfile.stats.map((s) => `${s.value} ${s.label.toLowerCase()}`),
    ),
    "",
    "## Tech stack",
    "",
    line("Core", coreStack.map((i) => i.name)),
    ...stackGroups.map((g) => line(g.title, g.items.map((i) => i.name))),
    "",
    "## Extras",
    "",
    // Comments are notes for whoever edits the file, not for the model.
    readFileSync(path.join(process.cwd(), "src/app/askExtras.md"), "utf8")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim(),
  );

  return out.filter((l) => l !== null).join("\n") + "\n";
}
