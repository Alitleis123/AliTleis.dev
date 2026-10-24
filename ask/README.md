# Ask backend

One Vercel function, `api/ask.js`, that answers questions in the Ask panel on
`/galaxy`. It reads the profile the site publishes at
`https://alitleis.dev/ask-context.txt` (built from `src/app/data.ts` and
`src/app/askExtras.md`) and sends it to Gemini with the question.

Both halves are free. Vercel's Hobby plan hosts the function, and Gemini's free
tier answers. Neither needs a card.

## Deploying

The Vercel project is `alitleis-ask` on the Hobby plan, at
`https://alitleis-ask.vercel.app/api/ask`, the URL `ASK_API` in
`src/app/components/CommandPalette.tsx` points at.

It is deployed from this folder with the Vercel CLI and is not connected to
Git. Site content reaches it through `/ask-context.txt`, so only an edit to
this folder needs a deploy:

```bash
cd ask
npx vercel deploy --prod
```

The key is the `GEMINI_API_KEY` production variable, from
[aistudio.google.com/apikey](https://aistudio.google.com/apikey). To replace
it, run `npx vercel env add GEMINI_API_KEY --environment production --sensitive --force`
here and paste the new key, then deploy again.

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
