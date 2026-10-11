import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const origin = "https://paxxmo.com";
const publicPaths = [
  "/",
  "/blog",
  ...[
    "web-development",
    "app-development",
    "digital-marketing",
    "social-media-marketing",
    "software-development",
  ].map((name) => `/${name}-sri-lanka`),
];
const escapeXml = (value) =>
  value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { render, loadPublishedPosts, blogRoutes, loadSlugRedirects } =
    await vite.ssrLoadModule("/src/entry-server.tsx");
  const posts = await loadPublishedPosts();
  for (const post of posts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.id))
      throw new Error(`Invalid public blog slug: ${post.id}`);
  }
  const archives = blogRoutes(posts);
  const routes = [
    ...new Set([
      ...publicPaths,
      ...archives.map((entry) => entry.path),
      ...posts.map((post) => `/blog/${post.id}`),
    ]),
  ];
  const indexedRoutes = routes.filter((route) => {
    const archive = archives.find((entry) => entry.path === route);
    if (archive && !archive.index) return false;
    const post = posts.find((post) => route === `/blog/${post.id}`);
    return (
      !post?.seo?.noindex &&
      (!post?.seo?.canonical || post.seo.canonical === origin + route)
    );
  });
  const template = await readFile("dist/index.html", "utf8");
  const manifest = JSON.parse(
    await readFile("dist/.vite/manifest.json", "utf8"),
  );
  for (const route of [...routes, "/px-portal", "/404"]) {
    const { html, helmet } = render(route, posts);
    const head =
      helmet.title.toString() +
      helmet.meta.toString() +
      helmet.link.toString() +
      helmet.script.toString();
    // The browser still mounts the existing SPA; the snapshot gives all clients meaningful initial HTML.
    // Vite's development SSR loader emits source asset paths; resolve those to production files.
    // Show entrance-animation content in the static snapshot, including when JavaScript is disabled.
    const visibleHtml = html
      .replace(/(?:src|href)="(\/src\/[^"?#]+)"/g, (match, asset) => {
        const entry = manifest[asset.slice(1)];
        if (!entry) throw new Error(`No production asset for ${asset}`);
        return match.replace(asset, `/${entry.file}`);
      })
      .replace(/style="([^"]*)"/g, (match, style) => {
        if (!/(?:^|;)opacity:0(?:;|$)/.test(style)) return match;
        return `style="${style.replace(/opacity:0(?=;|$)/, "opacity:1").replace(/transform:[^;]+/, "transform:none")}"`;
      });
    const snapshot = template
      .replace("</head>", `${head}</head>`)
      .replace('<div id="root"></div>', `<div id="root">${visibleHtml}</div>`)
      .replace(
        "</body>",
        `<script id="public-blog-data" type="application/json">${JSON.stringify(posts).replace(/</g, "\\u003c")}</script></body>`,
      );
    const file = route === "/" ? "dist/index.html" : `dist${route}.html`;
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, snapshot);
  }
  // A separate noindex shell preserves authenticated deep links without serving home metadata.
  await writeFile(
    "dist/admin.html",
    template.replace(
      "</head>",
      '<title>Paxxmo administration</title><meta name="robots" content="noindex, follow" /></head>',
    ),
  );
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexedRoutes
    .map((route) => {
      const post = posts.find((p) => route === `/blog/${p.id}`);
      return `  <url><loc>${escapeXml(origin + route)}</loc>${post ? `<lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>` : ""}</url>`;
    })
    .join("\n")}\n</urlset>\n`;
  await writeFile("dist/sitemap.xml", sitemap);
  const blogSitemap = sitemap.replace(
    /  <url><loc>(.*?)<\/loc>.*?<\/url>\n/g,
    (entry, loc) => (loc.startsWith(origin + "/blog") ? entry : ""),
  );
  await writeFile("dist/blog-sitemap.xml", blogSitemap);
  const robots = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\nSitemap: ${origin}/blog-sitemap.xml\n`;
  await writeFile("dist/robots.txt", robots);
  await writeFile("dist/seo-routes.json", JSON.stringify(routes));
  await writeFile("dist/seo-index-routes.json", JSON.stringify(indexedRoutes));
  const redirects = await loadSlugRedirects();
  const publishedSlugs = new Set(posts.map((post) => post.id));
  const activeRedirects = redirects.filter(
    (item) =>
      publishedSlugs.has(item.new_slug) &&
      /^[a-z0-9-]+$/.test(item.old_slug) &&
      /^[a-z0-9-]+$/.test(item.new_slug),
  );
  await writeFile("dist/blog-redirects.json", JSON.stringify(activeRedirects));
  const apache = await readFile("dist/.htaccess", "utf8");
  await writeFile(
    "dist/.htaccess",
    apache.replace(
      "  RewriteEngine On",
      "  RewriteEngine On\n" +
        activeRedirects
          .map(
            (item) =>
              `  RewriteRule ^blog/${item.old_slug}$ /blog/${item.new_slug} [R=301,L]`,
          )
          .join("\n"),
    ),
  );
  console.log(
    `Prerendered ${routes.length} public pages, login and 404; generated sitemap and robots.txt.`,
  );
} finally {
  await vite.close();
}
