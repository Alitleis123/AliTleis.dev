# alitleis.dev

Ali Tleis's portfolio. A Next.js site statically exported to GitHub Pages, with a small Vercel backend in `ask/`.

**Live:** [alitleis.dev](https://alitleis.dev)

## Pages

- `/` is a chooser between the two views below.
- `/galaxy/` is the reading view, one scrolling page with Intro, Projects, Timeline, Stack, Off-clock, Resume and Contact. Its command palette searches the site and holds the Ask panel.
- `/studio/` lays the same content out as a video editing suite, with a timeline to scrub and a reel to play.
- `/mediapool/` is the owner's way into Media Pool, his own app, where the log of visits and Ask questions is read. It sends a browser that can reach the app on to it, shows anyone else a lock, and asks search engines not to index it.

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
npm run build   # static export to ./out
```

The build checks that `public/studio/resume-page.webp` was drawn from the current `public/resume/resume.pdf`. A mismatch fails the build in CI and only warns locally. Redraw it with `python scripts/render-resume-preview.py`.

## Structure

```
src/app/
  data.ts                  # all site content: timeline, projects, stack, about
  tiktokStats.ts           # TikTok counts, rewritten by a weekly workflow
  layout.tsx               # metadata (OG/Twitter), fonts, SiteShell
  page.tsx                 # the chooser at /
  galaxy/                  # the reading view
  studio/                  # the editing suite view
  mediapool/               # the lock in front of Media Pool
  ask-context.txt/         # plain-text profile the Ask backend reads
  opengraph-image.png      # 1200x630 share card (+ .alt.txt for alt text)
  sitemap.ts / robots.ts   # generated as static files on export
  globals.css              # design tokens, keyframes, studio and door styles
  components/
    SiteShell.tsx          # nav, footer and command palette for the reading view
    sections/              # the reading view's sections
    projectCovers/         # hand-built SVG covers per project
  lib/                     # shared hooks and helpers
ask/                       # Vercel functions for Ask and visits
scripts/                   # image, search index, resume preview and TikTok helpers
public/
  resume/resume.pdf        # linked from the navbar and Resume section
  projects/ timeline/ portrait/ offclock/ studio/
```

### Editing content

Nearly all copy lives in `src/app/data.ts`, including the timeline entries, project cards, tech stack groups and about details. Components read from it, so content changes rarely require touching JSX.

Two things to know:

- **`current: true`** on a timeline entry drives the accent rail node, the
  pulsing "Current" pill, and the amber border on its logo tile. Only one entry
  should have it.
- **The timeline's "Now" marker** is derived at build time in `next.config.ts`
  and exposed via `NEXT_PUBLIC_NOW_LABEL` / `NEXT_PUBLIC_NOW_SORTKEY`. It
  advances on every deploy, so don't hardcode it.

The share card is a static `opengraph-image.png` rather than a generated route. GitHub Pages sets `Content-Type` from the file extension, so an extensionless `/opengraph-image` route gets served as `application/octet-stream` and scrapers like LinkedIn reject it.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which builds the
static export and publishes `./out` to GitHub Pages. The custom domain is set
via `public/CNAME`. The same workflow rebuilds at 07:00 UTC on the 1st of each
month, so the "Now" marker and copyright year keep moving.

`.github/workflows/tiktok-stats.yml` refreshes `src/app/tiktokStats.ts` every
Monday and commits it when the numbers change.

`ask/` deploys on its own with the Vercel CLI. Merging to `main` does not
deploy it. See `ask/README.md`.
