# optio-site

Custom JavaScript and CSS for **optio.io**, built in Webflow (Client-First).
The code lives here instead of only in Webflow's Custom Code boxes so it has history, review and rollback.

## How it is split

| Kind | What | How it reaches the site |
|---|---|---|
| **Inline** | `core.js` (site-wide) and all `css/*.css` | Minified snippet pasted into Webflow Custom Code. Small, needed everywhere or needed before paint, so it never waits on (or breaks with) the CDN. |
| **Hosted** | page modules (`home`, `work`, `deck`, …) | Loaded from jsDelivr at a **pinned version**, only on the pages that use them, with an SRI hash. |

The repo is the source of truth for both. Never edit the code directly in Webflow:
edit here, rebuild, then paste (inline) or bump the version (hosted).

## Layout

```
src/            JS source, one module per feature (readable, edit these)
css/            CSS source for JS-driven states
dist/           build output (commit this)
  *.min.js        hosted modules
  inline/*.html   ready-to-paste snippets: core.footer.html, <page>.head.html
  manifest.json   hosted URLs + SRI hashes, and where each inline snippet goes
build.mjs       builds dist/
test/           local test harness (staging pages with the inline scripts swapped for dist/)
```

## Modules

| Module | What it does | Pages | Kind |
|---|---|---|---|
| `core.js` | nav active state, count-ups, typed lines | every page | inline (Site settings > Custom code > Footer) |
| `belt.js` | client logo belt | Home | hosted |
| `reviews.js` | reviews pile | Home, Work | hosted |
| `map.js` | founders dot map | Home | hosted |
| `faq.js` | FAQ accordion | About | hosted |
| `home.js` | hero ring of slides | Home | hosted |
| `work.js` | Work hero cloud and gallery | Work | hosted |
| `deck.js` | deck viewer | Decks template (`/decks/*`) | hosted |
| `free.js` | library window, filters, memo, scorecard band | Free | hosted |
| `call.js` | tabs, placeholders, Roast-my-deck upload | Call (Calendly `widget.js` stays as its own tag) | hosted |
| `scorecard.js` | pitch deck scorecard | Scorecard | hosted |

| CSS | Where it is pasted |
|---|---|
| `site.css` | Site settings > Custom code > Head |
| `home.css`, `work.css`, `deck.css`, `free.css`, `call.css`, `scorecard.css` | that page > Custom code > Head |

Every module is a self-contained IIFE and only acts if its `data-*` hook is on the page.
Small one-off code that is not ours to version (the `noindex` script for webflow.io, analytics tags) stays in Webflow.

## Making a change

```bash
npm install                                  # first time only
# edit src/*.js or css/*.css
npm run format
```

**Inline (core or CSS):**

```bash
OPTIO_REPO=OWNER/optio-site npm run build
git add -A && git commit -m "core: …" && git push
```

Paste the matching file from `dist/inline/` into the place listed in `dist/manifest.json` (replace the old block), publish.

**Hosted (page modules):** bump `"version"` in `package.json` (1.0.0 → 1.0.1), then:

```bash
OPTIO_REPO=OWNER/optio-site npm run build
git add -A && git commit -m "work: …" && git tag v1.0.1 && git push --follow-tags
```

Update the hosted scripts in Webflow to the new version and SRI hash from `dist/manifest.json` (see `WEBFLOW.md`).
Never point Webflow at `@latest` or a branch: a pinned version can't change under you,
and the SRI hash makes the browser refuse a file that doesn't match.

## Testing locally

```bash
python3 -I test/make.py   # downloads the staging pages and swaps the inline scripts for dist/
node test/serve.mjs       # http://localhost:8765/test/home.html (also about, work, free, call, scorecard, deck, privacy)
```
