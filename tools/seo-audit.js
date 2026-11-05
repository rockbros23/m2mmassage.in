#!/usr/bin/env node
/**
 * SEO health check for m2mmassage.com
 * Usage: node tools/seo-audit.js
 *
 * No dependencies. Checks metadata, headings, internal links, images,
 * structured data, sitemap coverage and robots.txt.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IGNORE = new Set(["404.html"]);
const errors = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function firstMatch(html, re) {
  const m = html.match(re);
  return m ? decodeEntities(m[1].trim()) : "";
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1] : "";
}

const files = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith(".html"))
  .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));

const pages = new Map();

for (const file of files) {
  const html = read(file);
  const title = firstMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const description = firstMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = firstMatch(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const robots = firstMatch(html, /<meta\s+name="robots"\s+content="([^"]*)"/i).toLowerCase();
  const noindex = robots.includes("noindex");
  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  const og = {};
  for (const m of html.matchAll(/<meta\s+property="og:([^"]+)"\s+content="([^"]*)"/gi)) {
    og[m[1]] = decodeEntities(m[2]);
  }
  const twitter = {};
  for (const m of html.matchAll(/<meta\s+name="twitter:([^"]+)"\s+content="([^"]*)"/gi)) {
    twitter[m[1]] = decodeEntities(m[2]);
  }
  const jsonLd = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1]
  );

  pages.set(file, { file, html, title, description, canonical, robots, noindex, h1s, og, twitter, jsonLd });

  if (!noindex) {
    if (!title) errors.push(`${file}: missing <title>`);
    else if (title.length < 15) warnings.push(`${file}: title is short (${title.length} chars)`);
    else if (title.length > 60) warnings.push(`${file}: title is long (${title.length} chars, aim for 60)`);

    if (!description) errors.push(`${file}: missing meta description`);
    else if (description.length < 70) warnings.push(`${file}: description is short (${description.length} chars)`);
    else if (description.length > 160) warnings.push(`${file}: description is long (${description.length} chars, aim for 160)`);

    if (!canonical) errors.push(`${file}: missing canonical URL`);
    if (h1s !== 1) errors.push(`${file}: expected one <h1>, found ${h1s}`);

    for (const key of ["title", "description", "url", "image", "image:width", "image:height", "image:alt", "locale"]) {
      if (!og[key]) warnings.push(`${file}: missing og:${key}`);
    }
    for (const key of ["card", "title", "description", "image"]) {
      if (!twitter[key]) warnings.push(`${file}: missing twitter:${key}`);
    }
  } else if (h1s !== 1) {
    errors.push(`${file}: expected one <h1>, found ${h1s}`);
  }

  // Images must have alt text.
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=/.test(m[0])) errors.push(`${file}: <img> without alt: ${m[0].slice(0, 80)}`);
  }

  // Structured data must parse.
  for (const [i, block] of jsonLd.entries()) {
    try {
      const data = JSON.parse(block);
      if (!data["@context"] || !data["@type"]) {
        errors.push(`${file}: JSON-LD block ${i + 1} missing @context or @type`);
      }
    } catch (e) {
      errors.push(`${file}: invalid JSON-LD block ${i + 1} (${e.message})`);
    }
  }
}

// Duplicate titles and descriptions.
for (const field of ["title", "description"]) {
  const seen = new Map();
  for (const page of pages.values()) {
    if (page.noindex || !page[field]) continue;
    if (seen.has(page[field])) {
      warnings.push(`${page.file}: duplicate ${field} with ${seen.get(page[field])}`);
    } else {
      seen.set(page[field], page.file);
    }
  }
}

// Internal links and anchors.
for (const page of pages.values()) {
  for (const m of page.html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    const href = decodeEntities(m[1]);
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href) || href === "#") continue;
    const [rawPath, rawHash] = href.split("#");
    const targetFile = rawPath === "" ? page.file : rawPath.split("?")[0];
    if (!targetFile.endsWith(".html")) continue;
    const full = path.join(ROOT, targetFile);
    if (!fs.existsSync(full)) {
      errors.push(`${page.file}: broken internal link -> ${href}`);
      continue;
    }
    if (rawHash) {
      const targetHtml = fs.readFileSync(full, "utf8");
      const id = rawHash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`\\bid="${id}"`).test(targetHtml)) {
        errors.push(`${page.file}: link points to missing anchor -> ${href}`);
      }
    }
  }
}

// Sitemap coverage and canonical consistency.
let sitemap = "";
try {
  sitemap = read("sitemap.xml");
} catch {
  errors.push("sitemap.xml is missing");
}
const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
const sitemapFiles = new Set(
  sitemapPaths.map((url) => {
    const p = new URL(url).pathname;
    return p === "/" ? "index.html" : p.replace(/^\//, "");
  })
);

for (const url of sitemapPaths) {
  let file;
  try {
    const p = new URL(url).pathname;
    file = p === "/" ? "index.html" : p.replace(/^\//, "");
  } catch {
    errors.push(`sitemap.xml: invalid URL ${url}`);
    continue;
  }
  if (!fs.existsSync(path.join(ROOT, file))) errors.push(`sitemap.xml: URL has no file -> ${url}`);
  const page = pages.get(file);
  if (page && page.noindex) errors.push(`sitemap.xml: includes noindex page -> ${url}`);
  if (page && page.canonical && page.canonical !== url) {
    warnings.push(`sitemap.xml: canonical mismatch for ${file} (${page.canonical})`);
  }
}

for (const page of pages.values()) {
  if (!page.noindex && !IGNORE.has(page.file) && !sitemapFiles.has(page.file)) {
    errors.push(`${page.file}: indexable page missing from sitemap.xml`);
  }
}

// robots.txt should point at the sitemap.
try {
  const robotsTxt = read("robots.txt");
  if (!/^\s*Sitemap:\s*https?:\/\//im.test(robotsTxt)) {
    errors.push("robots.txt: missing absolute Sitemap directive");
  }
} catch {
  errors.push("robots.txt is missing");
}

// PWA / installable app checks.
let pwaSummary = "PWA checks skipped";
try {
  const manifestRaw = read("manifest.webmanifest");
  const manifest = JSON.parse(manifestRaw);
  const required = [
    ["name", manifest.name],
    ["short_name", manifest.short_name],
    ["start_url", manifest.start_url],
    ["display", manifest.display],
    ["theme_color", manifest.theme_color],
    ["background_color", manifest.background_color],
  ];
  for (const [key, value] of required) {
    if (!value) errors.push(`manifest.webmanifest: missing ${key}`);
  }
  if (manifest.display && manifest.display !== "standalone") {
    warnings.push(`manifest.webmanifest: display is "${manifest.display}", expected "standalone"`);
  }

  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  const need = [
    ["192x192", "any"],
    ["512x512", "any"],
    ["512x512", "maskable"],
  ];
  for (const [size, purpose] of need) {
    const icon = icons.find(
      (i) => i.sizes === size && (i.purpose || "any").split(/\s+/).includes(purpose)
    );
    if (!icon) {
      errors.push(`manifest.webmanifest: missing ${size} ${purpose} icon`);
      continue;
    }
    const iconPath = icon.src.replace(/^\//, "");
    const full = path.join(ROOT, iconPath);
    if (!fs.existsSync(full)) {
      errors.push(`manifest.webmanifest: icon file not found -> ${icon.src}`);
      continue;
    }
    const buf = fs.readFileSync(full);
    const isPng = buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (!isPng) {
      warnings.push(`manifest.webmanifest: ${icon.src} is not a PNG`);
    } else {
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      const [ew, eh] = size.split("x").map(Number);
      if (w !== ew || h !== eh) {
        errors.push(`manifest.webmanifest: ${icon.src} is ${w}x${h}, expected ${size}`);
      }
    }
  }

  if (!fs.existsSync(path.join(ROOT, "assets/img/apple-touch-icon.png"))) {
    errors.push("missing assets/img/apple-touch-icon.png");
  }
  if (!fs.existsSync(path.join(ROOT, "sw.js"))) errors.push("sw.js is missing");
  else {
    const sw = read("sw.js");
    if (!/addEventListener\("fetch"/.test(sw)) errors.push("sw.js: missing fetch handler");
    if (!/offline\.html/.test(sw)) errors.push("sw.js: offline.html is not precached");
  }
  if (!fs.existsSync(path.join(ROOT, "offline.html"))) errors.push("offline.html is missing");
  const js = read("assets/js/main.js");
  if (!/serviceWorker\.register/.test(js)) errors.push("main.js: service worker is not registered");

  for (const page of pages.values()) {
    if (!/rel="manifest"/.test(page.html)) errors.push(`${page.file}: missing manifest link`);
    if (!/apple-touch-icon/.test(page.html)) errors.push(`${page.file}: missing apple-touch-icon`);
    if (!/viewport-fit=cover/.test(page.html)) {
      warnings.push(`${page.file}: viewport is missing viewport-fit=cover`);
    }
  }
  pwaSummary = `manifest OK, ${icons.length} icon(s), service worker present`;
} catch (e) {
  errors.push(`PWA setup: ${e.message}`);
}

// Report.
console.log("SEO audit - m2mmassage.com\n");
for (const page of pages.values()) {
  const flags = [];
  if (page.noindex) flags.push("noindex");
  console.log(
    `${page.file.padEnd(16)} title:${String(page.title.length).padStart(3)} desc:${String(
      page.description.length
    ).padStart(3)} h1:${page.h1s} jsonld:${page.jsonLd.length} ${flags.join(" ")}`
  );
}

console.log(`\nPWA: ${pwaSummary}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length})`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (errors.length) {
  console.log(`\nErrors (${errors.length})`);
  for (const e of errors) console.log(`  x ${e}`);
  process.exitCode = 1;
} else {
  console.log(`\nNo blocking SEO errors. ${warnings.length} warning(s).`);
}
