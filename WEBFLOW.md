# Connecting optio-site to Webflow

Today the code still runs **inline** in Webflow exactly as before.
Nothing in Webflow changes until the steps below are done, so the site keeps working meanwhile.

## 1. Publish the repo (you)

jsDelivr only serves **public** GitHub repos. The code has no secrets (it already ships to every visitor).
Make sure the GitHub account you push with has write access to the repo's owner.

```bash
cd optio-site
OPTIO_REPO=OWNER/optio-site npm run build      # writes the real URLs into dist/
git add -A
git commit -m "optio-site 1.0.0"
git tag v1.0.0
git remote add origin git@github.com:OWNER/optio-site.git   # create the empty public repo first
git push -u origin main --follow-tags
```

Check one file loads: `https://cdn.jsdelivr.net/gh/OWNER/optio-site@1.0.0/dist/home.min.js`

## 2. Swap Webflow over (Claude can do this through the API)

**Inline, site-wide**

- Site settings > Custom code > Footer: replace the current Optio shared `<script>` with `dist/inline/core.footer.html`.
- Site settings > Custom code > Head: the Optio `<style>` blocks become `dist/inline/site.head.html`. Leave anything else in Webflow as is (e.g. the `noindex` script).

**Hosted, per page** (footer, from `dist/manifest.json` → `hosted`: URL, integrity, version)

| Page | Scripts |
|---|---|
| Home | belt, reviews, map, home |
| About | faq |
| Work | reviews, work |
| Decks template | deck |
| Free | free |
| Call | call (keep the Calendly `widget.js` tag) |
| Scorecard | scorecard |

Register each as a hosted script with its SRI hash and apply it to the page footer,
then remove that page's old inline `<script>` block. Page `<style>` blocks are replaced with `dist/inline/<page>.head.html`
(same content, just minified).

**Then** publish to **webflow.io only**, check every page, and publish to production when approved.

## Rolling back

- Hosted: point the script back to the previous version and its hash from that version's `dist/manifest.json`.
- Inline: paste the snippet from the previous commit's `dist/inline/`.
