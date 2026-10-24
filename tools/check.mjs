import assert from "node:assert/strict";
import { readFile, stat, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
const root = fileURLToPath(new URL("../src/", import.meta.url));
const html = await readFile(path.join(root, "index.html"), "utf8");
assert.equal((html.match(/<h1\b/g) || []).length, 1, "Exactly one h1");
assert.equal(
  (html.match(/<meta\s+name="description"/g) || []).length,
  1,
  "Exactly one description",
);
assert.ok(html.includes('<html lang="ru">'));
const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/)[1];
assert.equal(canonical, "https://kachalovg.github.io/kachalova-lor-2/");
const schema = JSON.parse(
  html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
);
assert.ok(schema["@graph"].some((item) => item["@type"] === "Person"));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "Unique ids");
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g))
  assert.ok(ids.includes(anchor), "Anchor exists: " + anchor);
const files = new Set();
for (const [, file] of html.matchAll(
  /(?:src|href)="((?:assets|css|js)\/[^"#]+)"/g,
))
  files.add(file.split("?")[0]);
for (const [, set] of html.matchAll(/srcset="([^"]+)"/g))
  for (const item of set.split(",")) files.add(item.trim().split(" ")[0]);
for (const file of files) await access(path.join(root, file));
const css = await readFile(path.join(root, "css/styles.css"), "utf8");
for (const [, asset] of css.matchAll(/url\(["']([^"']+)["']\)/g))
  await access(path.resolve(root, "css", asset));
for (const [, tag] of html.matchAll(/(<img\b[^>]+>)/g)) {
  assert.match(tag, /alt="[^"]+"/);
  assert.match(tag, /width="\d+"/);
  assert.match(tag, /height="\d+"/);
}
const links = [
  "https://atmosphere-clinic.ru/kachalova",
  "https://ogni.clinic/doctors/kachalova_evgeniya_vladimirovna?clckid=d45f28a2",
];
for (const link of links)
  assert.equal(
    html.split('href="' + link + '"').length - 1,
    2,
    "User booking link exists in card and dialog",
  );
assert.ok(
  !/<script[^>]+src="https?:/.test(html),
  "No external runtime JavaScript",
);
const js = await readFile(path.join(root, "js/main.js"), "utf8");
assert.ok(Buffer.byteLength(js) < 5000, "JS budget < 5 KB");
const firstLoad = [
  "index.html",
  "css/styles.css",
  "js/main.js",
  "assets/images/portrait-880.webp",
  "assets/fonts/manrope.woff2",
  "assets/fonts/cormorant.woff2",
  "assets/fonts/cormorant-italic.woff2",
];
let bytes = 0;
for (const file of firstLoad) bytes += (await stat(path.join(root, file))).size;
console.log(
  "PASS: metadata, schema JSON, anchors, images, local assets, exact booking URLs, JS budget.",
);
console.log(
  "First-screen resource budget (uncompressed, excluding lazy images): " +
    Math.round(bytes / 1024) +
    " KiB",
);
console.log(
  "HTML + CSS + JS gzip: " +
    Math.round(
      gzipSync(html).length + gzipSync(css).length + gzipSync(js).length,
    ) +
    " bytes",
);
try {
  await access(path.resolve(root, "../dist"));
  console.log("NOTE: dist exists.");
} catch {
  console.log("dist is absent, as requested.");
}
