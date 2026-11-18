// Builds dist/ from src/ and css/.
//
// Two kinds of output:
//  - hosted:  page modules (every src/*.js except core) -> dist/*.min.js, loaded from jsDelivr
//             at a pinned version. dist/manifest.json lists their URL and SRI hash.
//  - inline:  core.js (site-wide) and every css/*.css -> dist/inline/*.html, ready to paste into
//             Webflow Custom Code. They stay inline so the site never waits on, or breaks with, the CDN.
import { build } from "esbuild";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const REPO = process.env.OPTIO_REPO || "OWNER/optio-site"; // set to the real GitHub owner/repo
const version = pkg.version;
const INLINE_JS = ["core"]; // site-wide, small: pasted into Site settings > Custom code > Footer

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/inline", { recursive: true });

const entries = [
  ...readdirSync("src").filter((f) => f.endsWith(".js")).map((f) => `src/${f}`),
  ...readdirSync("css").filter((f) => f.endsWith(".css")).map((f) => `css/${f}`),
];

await build({
  entryPoints: entries,
  outdir: "dist",
  entryNames: "[name].min",
  minify: true,
  target: ["es2018"],
  legalComments: "none",
  logLevel: "info",
});

const sri = (buf) => "sha384-" + createHash("sha384").update(buf).digest("base64");
const manifest = { version, repo: REPO, hosted: {}, inline: {} };

for (const f of readdirSync("dist").filter((f) => f.endsWith(".min.js")).sort()) {
  const name = f.replace(".min.js", "");
  const buf = readFileSync(`dist/${f}`);
  if (INLINE_JS.includes(name)) {
    const out = `inline/${name}.footer.html`;
    writeFileSync(
      `dist/${out}`,
      `<!-- Optio ${name}.js v${version} (site-wide). Source: src/${name}.js in ${REPO}. Edit there, rebuild, paste here. -->\n<script>${buf.toString().trim()}</script>\n`,
    );
    manifest.inline[name] = { where: "Site settings > Custom code > Footer", file: `dist/${out}`, bytes: buf.length };
  } else {
    manifest.hosted[name] = {
      bytes: buf.length,
      url: `https://cdn.jsdelivr.net/gh/${REPO}@${version}/dist/${f}`,
      integrity: sri(buf),
    };
  }
}

for (const f of readdirSync("dist").filter((f) => f.endsWith(".min.css")).sort()) {
  const name = f.replace(".min.css", "");
  const out = `inline/${name}.head.html`;
  const where = name === "site" ? "Site settings > Custom code > Head" : `${name} page > Custom code > Head`;
  writeFileSync(
    `dist/${out}`,
    `<!-- Optio ${name}.css v${version}. Source: css/${name}.css in ${REPO}. Edit there, rebuild, paste here. -->\n<style>${readFileSync(`dist/${f}`, "utf8").trim()}</style>\n`,
  );
  manifest.inline[`${name}.css`] = { where, file: `dist/${out}` };
}

writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`v${version}: ${Object.keys(manifest.hosted).length} hosted, ${Object.keys(manifest.inline).length} inline snippets`);
