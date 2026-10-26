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

## The control panel

The log is read at `https://alitleis.dev/controlpanel`, which unlocks with a
passkey: Face ID on the iPhone, Touch ID on a Mac, Windows Hello on a PC. The
page holds no data. `api/panel.js` sends the log only to a session that
`api/auth.js` started from a stored passkey. `lib/owner.js` explains how the
parts fit together.

- The first device sets up with the `ADMIN_PASSWORD` production variable,
  and only while no passkey is stored. After that the password opens nothing.
- A Mac on the same Apple ID gets the iPhone's passkey through iCloud
  Keychain. Any other device pairs with a one-time code from Devices on a
  signed-in one.
- Lost every device: delete the `passkeys` hash in the Upstash console, and
  setup opens to the password again.
- Named links come from Links in the panel. Whoever opens one is called by
  that name, on that visit and every later one from the same browser.
- Signing in stops counting that browser's visits. `?notrack` does the same
  on a browser that never signs in, and `?notrack=off` undoes it.
- Local and preview runs log to `dev:` keys, apart from production, and need
  `PANEL_ORIGIN` set to the page's origin, like `http://localhost:3000`.

The tests run offline against a fake Upstash and real P-256 and Ed25519 keys:

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
