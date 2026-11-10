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

## The log

`api/ask.js` logs every question that reaches a model, with the answer or the
error, the model, the time taken and why any earlier model missed.
`api/visit.js` logs the page views the site sends with `navigator.sendBeacon`.
Both go to an Upstash Redis database on the free plan, connected to this
project through the Vercel Marketplace as `KV_REST_API_URL` and
`KV_REST_API_TOKEN`. Each list keeps its newest 3,000 entries.

Each entry keeps the visitor's IP address, their network (a company or school
shows up by name, a home connection as its ISP, from api.ipapi.is), the city
from Vercel's headers, the device, and an id that ties one browser's views
together.

## Reading the log

The Site screen in Media Pool, Ali's own app on his tailnet, reads the log
straight from Upstash and keeps its notes there too: the `labels` hash of
names for visitors and the `links` hash of named links. Nothing on this site
reads them. `https://alitleis.dev/mediapool` is the way in. It sends a
browser that can reach Media Pool on to it and shows anyone else a lock.

- Whoever opens a named link is called by that link's name, on that visit
  and every later one from the same browser.
- A browser the /mediapool page sends on stops counting. `?notrack` does the
  same anywhere, and `?notrack=off` undoes it.
- Local and preview runs log to `dev:` keys, apart from production.

The tests run offline against a fake Upstash:

```bash
node --test ask/test/*.test.js
```

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
