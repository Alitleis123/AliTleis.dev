# Ask backend

One Vercel function, `api/ask.js`, that answers questions in the Ask panel on
`/galaxy`. It reads the profile the site publishes at
`https://alitleis.dev/ask-context.txt` (built from `src/app/data.ts` and
`src/app/askExtras.md`) and sends it to Gemini with the question.

Both halves are free. Vercel's Hobby plan hosts the function, and Gemini's free
tier answers. Neither needs a card.

## Setup

1. Get a Gemini key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. On [vercel.com/new](https://vercel.com/new), import this repo.
   - Project name: `alitleis-ask`, so the URL matches the one in
     `src/app/components/CommandPalette.tsx`.
   - Root Directory: `ask`
   - Framework Preset: Other
   - Environment variable: `GEMINI_API_KEY` set to the key from step 1.
3. Deploy. The endpoint is `https://alitleis-ask.vercel.app/api/ask`.

If Vercel gives the project a different URL, update `ASK_API` in
`CommandPalette.tsx` to match.

## Editing what it knows

- Site content comes from `src/app/data.ts`, the same as the page.
- Easter eggs go in `src/app/askExtras.md`. The model mentions them only when
  asked.

Either change reaches the function after the next Pages deploy, within ten
minutes.

## Check it

```bash
curl -s https://alitleis-ask.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What do you do at MIT Lincoln Lab?"}'
```
