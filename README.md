# alitleis.dev

Personal portfolio — a single-page site built with Next.js and statically exported to GitHub Pages.

**Live:** [alitleis.dev](https://alitleis.dev)

## Stack

- **Next.js 16** (App Router, `output: "export"`)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Framer Motion** for scroll and stagger animations
- **Geist** Sans / Mono
- **react-icons** for stack and social glyphs

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build   # static export → ./out
```

## Structure

```
src/app/
  data.ts                  # all site content — timeline, projects, stack, about
  layout.tsx               # metadata (OG/Twitter), fonts, nav, footer
  page.tsx                 # section composition
  opengraph-image.png      # 1200x630 share card (+ .alt.txt for alt text)
  sitemap.ts / robots.ts   # generated as static files on export
  globals.css              # design tokens + keyframes
  components/
    sections/              # Intro, Projects, Timeline, Stack, Resume, Contact
    projectCovers/         # hand-built SVG covers per project
public/
  resume/resume.pdf        # linked from the navbar and Resume section
  projects/ Timeline/ portrait/
```

### Editing content

Nearly all copy lives in `src/app/data.ts` — the timeline entries, project cards,
tech stack groups, and about-section pillars. Components read from it, so
content changes rarely require touching JSX.

Two things to know:

- **`current: true`** on a timeline entry drives the accent rail node, the
  pulsing "Current" pill, and the indigo logo tile. Only one entry should have it.
- **The timeline's "Now" marker** is derived at build time in `next.config.ts`
  and exposed via `NEXT_PUBLIC_NOW_LABEL` / `NEXT_PUBLIC_NOW_SORTKEY`. It
  advances on every deploy — don't hardcode it.

The share card is a static `opengraph-image.png` rather than a generated route,
because GitHub Pages sets `Content-Type` from the file extension — an
extensionless `/opengraph-image` route gets served as `application/octet-stream`
and scrapers like LinkedIn reject it.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which builds the
static export and publishes `./out` to GitHub Pages. The custom domain is set
via `public/CNAME`.
