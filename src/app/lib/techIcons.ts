import type { ComponentType } from "react";
import { FaJava } from "react-icons/fa";
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiCplusplus,
  SiSharp,
  SiLua,
  SiRust,
  SiSpringboot,
  SiFastapi,
  SiNextdotjs,
  SiNodedotjs,
  SiTailwindcss,
  SiFramer,
  SiVite,
  SiReactrouter,
  SiGithub,
  SiGithubactions,
  SiGitlab,
  SiDocker,
  SiKubernetes,
  SiHelm,
  SiPrometheus,
  SiGrafana,
  SiLinux,
  SiOpencv,
  SiFfmpeg,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiJsonwebtokens,
  SiJest,
  SiJunit5,
  SiGooglegemini,
  SiMeta,
  SiHuggingface,
  SiApachesolr,
  SiFlydotio,
} from "react-icons/si";
import { LuBrainCircuit } from "react-icons/lu";
// Norconex and vLLM have no brand glyph in simple-icons, so these stand in
// semantically: a spider for Norconex's crawler, a server for vLLM's inference
// engine.
import { TbApi, TbServer, TbSpider, TbDatabase } from "react-icons/tb";
import { VscTerminalPowershell, VscAzure } from "react-icons/vsc";

/**
 * Brand glyphs and colours for the tech stack, shared by the written page and
 * the studio's preset panel.
 *
 * This lived inside the document's Stack section. The studio needs exactly the
 * same registry, and two copies of a forty entry lookup keyed by name would
 * drift the first time an entry was added to one and not the other.
 */
type IconCmp = ComponentType<{ className?: string; style?: React.CSSProperties }>;

export const ICON_MAP: Record<string, IconCmp> = {
  SiReact, SiTypescript, SiJavascript, SiPython, SiCplusplus, SiSharp, SiLua,
  SiRust, SiSpringboot, SiFastapi, SiNextdotjs, SiNodedotjs, SiTailwindcss,
  SiFramer, SiVite, SiReactrouter, SiGithub, SiGithubactions, SiGitlab,
  SiDocker, SiKubernetes, SiHelm, SiPrometheus, SiGrafana, SiLinux, SiOpencv,
  SiFfmpeg, SiMongodb, SiPostgresql, SiMysql, SiRedis, SiJsonwebtokens, SiJest,
  SiJunit5, SiGooglegemini, SiMeta, SiHuggingface, SiApachesolr, SiFlydotio,
  FaJava, LuBrainCircuit, TbApi, TbServer, TbSpider, TbDatabase,
  VscTerminalPowershell, VscAzure,
};

// Brand colors, applied to icons for personality.
const ICON_COLOR: Record<string, string> = {
  React: "#61DAFB",
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#FFD43B",
  "Next.js": "#FFFFFF",
  "Node.js": "#5FA04E",
  "Tailwind CSS": "#06B6D4",
  MongoDB: "#47A248",
  Java: "#EA2D2E",
  "C++": "#00599C",
  "C#": "#9B4F96",
  Lua: "#74C7EC",
  Rust: "#F74C00",
  SQL: "#94A3B8",
  "Framer Motion": "#FFFFFF",
  Vite: "#646CFF",
  "React Router": "#CA4245",
  "Spring Boot": "#6DB33F",
  FastAPI: "#009688",
  "Node.js / Express": "#5FA04E",
  "REST APIs": "#F472B6",
  "JWT Auth": "#FB7185",
  "Git / GitHub": "#FFFFFF",
  Docker: "#2496ED",
  Kubernetes: "#326CE5",
  Helm: "#5B7BF0",
  "GitLab CI/CD": "#FC6D26",
  "GitHub Actions": "#2088FF",
  Prometheus: "#E6522C",
  Grafana: "#F46800",
  Linux: "#FCC624",
  OpenCV: "#5C3EE8",
  FFmpeg: "#65C77D",
  PowerShell: "#5391FE",
  PostgreSQL: "#4169E1",
  MySQL: "#4479A1",
  Redis: "#FF4438",
  "Azure Functions": "#0078D7",
  Jest: "#C21325",
  JUnit: "#25A162",
  "Gemini API": "#8E75E2",
  "Fly.io": "#8B5CF6",
  "LLM Integration": "#A78BFA",
  Llama: "#0081FB",
  vLLM: "#30A2FF",
  "Sentence Transformers": "#FFD21E",
  "Open-Weight LLMs": "#FFD21E",
  "Apache Solr": "#D9411E",
  Norconex: "#F59E0B",
};


/** Falls back to a neutral grey, so an unmapped name still renders. */
export function techColor(name: string): string {
  return ICON_COLOR[name] ?? "#E5E7EB";
}

export type { IconCmp };
