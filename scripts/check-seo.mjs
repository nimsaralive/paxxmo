import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
const routes = JSON.parse(await readFile("dist/seo-routes.json", "utf8"));
const indexedRoutes = JSON.parse(
  await readFile("dist/seo-index-routes.json", "utf8"),
);
const titles = new Set();
const descriptions = new Set();
const sitemap = await readFile("dist/sitemap.xml", "utf8");
for (const route of routes) {
  const html = await readFile(
    route === "/" ? "dist/index.html" : `dist${route}.html`,
    "utf8",
  );
  const title = html.match(/<title[^>]*>(.*?)<\/title>/)?.[1];
  const description = html.match(/name="description" content="([^"]+)"/)?.[1];
  assert(title && !titles.has(title), `${route}: missing/duplicate title`);
  assert(
    description && !descriptions.has(description),
    `${route}: missing/duplicate description`,
  );
  titles.add(title);
  descriptions.add(description);
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    `${route}: expected one H1`,
  );
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  const data=JSON.parse(html.match(/<script id="public-blog-data" type="application\/json">(.*?)<\/script>/s)?.[1]||'[]');
  const article=data.find(post=>route===`/blog/${post.id}`);
  const expectedCanonical=article?.seo?.canonical||`https://paxxmo.com${route}`;
  assert(
    html.includes(`href="${expectedCanonical.replace(/&/g,'&amp;')}"`),
    `${route}: incorrect canonical`,
  );
  const indexed = indexedRoutes.includes(route);
  assert(
    indexed
      ? !/name="robots" content="noindex/.test(html)
      : /name="robots" content="noindex/.test(html) ||
          /rel="canonical" href="https:\/\//.test(html),
    `${route}: indexing policy`,
  );
  assert(
    !/style="[^"]*(?:^|;)opacity:0(?:;|")/.test(html),
    `${route}: hidden static content`,
  );
  assert.equal(
    sitemap.includes(`<loc>https://paxxmo.com${route}</loc>`),
    indexed,
  );
  for (const name of [
    "og:title",
    "og:description",
    "og:url",
    "og:image",
    "twitter:card",
    "twitter:image",
  ]) {
    assert(html.includes(`="${name}"`), `${route}: missing ${name}`);
  }
  for (const match of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
  )) {
    const schema = JSON.parse(match[1]);
    assert.equal(schema["@context"], "https://schema.org");
    assert(schema["@graph"].some((node) => node["@type"] === "WebPage"));
  }
  for (const match of html.matchAll(
    /(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g,
  )) {
    const target = match[1];
    if (target === "/" || target.startsWith("/px-")) continue;
    if (routes.includes(target)) continue;
    await access(`dist${target}`).catch(() => {
      throw new Error(`${route}: missing local link/asset ${target}`);
    });
  }
}
for (const file of ["404", "px-portal", "admin"]) {
  const html = await readFile(`dist/${file}.html`, "utf8");
  assert(html.includes("noindex"), `${file}: missing noindex`);
  assert(!sitemap.includes(`<loc>https://paxxmo.com/${file}</loc>`));
}
assert(
  (await readFile("dist/robots.txt", "utf8")).includes(
    "Sitemap: https://paxxmo.com/sitemap.xml",
  ),
);
console.log(
  `SEO checks passed: ${routes.length} pages, unique metadata, one H1, canonical URLs, JSON-LD, sitemap, private directives and local links/assets.`,
);
