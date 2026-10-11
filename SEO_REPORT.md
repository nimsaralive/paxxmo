# Paxxmo SEO implementation and deployment checklist

The existing React 18 + Vite architecture, visual design, authentication and contact API are retained. Public pages now ship meaningful static HTML and page metadata before JavaScript runs. The browser mounts the existing React application and refreshes published content normally.

## Audit findings and implemented changes

- Replaced competing Helmet and DOM-effect metadata implementations with one Helmet component. Removed the stale home canonical, irrelevant San Francisco keyword, invented social-profile links in schema, and nonexistent logo.png URLs from the HTML shell.
- Added unique titles/descriptions, consistent https://paxxmo.com canonicals (root ends in /; other paths have no trailing slash), absolute Open Graph/Twitter images, social cards, and index directives for all public routes. Metadata is present in production HTML and updates during React navigation.
- Added build-time rendering through Vite's existing SSR loader and React's server renderer. No framework migration or dependencies were added. Production assets resolve through Vite's manifest; entrance animations are visible in static HTML, including without JavaScript.
- The build fetches only published Supabase posts, using the site's existing six bundled fallback articles if the query fails. A warning makes that fallback explicit. SEO_REQUIRE_LIVE_BLOG=1 makes a failed database query fail deployment. The configured Supabase hostname returned DNS ENOTFOUND during verification, so the current output uses fallback content; live records could not be audited.
- Generated dist/sitemap.xml from the same public routes and posts as the HTML. Article lastmod comes from stored modification dates; static pages do not receive invented freshness dates. Deleted the old hardcoded sitemap with stale dates and missing articles.
- robots.txt permits public content and crawling of noindex administration pages, and excludes API crawling. Login, administration and 404 HTML carry noindex; Vercel adds administration/API X-Robots-Tag headers. Private routes are absent from the sitemap. Noindex does not replace authentication.
- Replaced the broad homepage rewrite with Vercel clean URLs and an administration-only rewrite. Unknown URLs use the generated 404.html. Added equivalent Apache static routing and local preview handling. Vercel domain/trailing-slash redirects are permanent 308s; Apache uses 301s.
- Added Organization, WebSite, WebPage and public-page BreadcrumbList JSON-LD. Retained accurate service data; added blog/article data with absolute images, real dates and a valid publisher logo. No ratings, reviews, founding dates, prices or social accounts are invented. FAQ rich-result markup is omitted.
- Reduced two main image files from 1,411,905 bytes to 169,844 bytes (about 88%) with WebP at their original 640x640 dimensions. Added hero dimensions and fetch priority, noncritical image lazy loading/async decoding, font preconnects and stylesheet loading outside CSS @import. Administration/editor bundles load separately. Hashed assets receive immutable caching on Vercel.
- Consolidated the homepage's two H1s into one accessible H1 while preserving the two-line design. Added crawlable footer links to all five service pages. Missing articles render the custom not-found page instead of redirecting to the blog.
- Seeded browser blog state from public build data so articles stay visible while Supabase refreshes. A failed refresh keeps existing loaded content. Fixed three existing lint errors in UI type aliases and the Tailwind plugin import.

## Page-by-page checklist

Every public row below passed static checks for unique title/description, canonical, OG/Twitter tags, one H1, parseable JSON-LD, sitemap inclusion, and valid local navigation/assets. These are generated-output checks, not a live Google indexing guarantee.

| Route | Indexing | Structured data beyond Organization/WebSite/WebPage | Verification |
| --- | --- | --- | --- |
| / | index, follow | None | Passed |
| /blog | index, follow | Blog, breadcrumbs | Passed |
| /web-development-sri-lanka | index, follow | Service, breadcrumbs | Passed |
| /app-development-sri-lanka | index, follow | Service, breadcrumbs | Passed |
| /digital-marketing-sri-lanka | index, follow | Service, breadcrumbs | Passed |
| /social-media-marketing-sri-lanka | index, follow | Service, breadcrumbs | Passed |
| /software-development-sri-lanka | index, follow | Service, breadcrumbs | Passed |
| /blog/power-of-branding | index, follow | BlogPosting, breadcrumbs | Passed |
| /blog/powerful-illustrations | index, follow | BlogPosting, breadcrumbs | Passed |
| /blog/web-design-trends-2025 | index, follow | BlogPosting, breadcrumbs | Passed |
| /blog/ux-psychology | index, follow | BlogPosting, breadcrumbs | Passed |
| /blog/seo-strategies-2025 | index, follow | BlogPosting, breadcrumbs | Passed |
| /blog/digital-transformation | index, follow | BlogPosting, breadcrumbs | Passed |
| /px-portal | noindex, follow | None | HTML verified |
| /px-manage and protected descendants | noindex, follow | None | Shell/header configuration verified; live auth pending |
| Unknown URLs / missing posts | noindex, follow | None | Custom 404 HTML verified; local 404 status verified; production pending |
| /api/* | noindex header; robots exclusion | None | Configuration verified; API behavior not changed |

## Verification and limits

Commands: npm.cmd run build; npm.cmd run seo:check; npm.cmd run lint; npm.cmd test; npx.cmd tsc --noEmit -p tsconfig.app.json; npx.cmd tsc --noEmit -p tsconfig.node.json.

Build and all 13 public-page SEO checks passed. TypeScript checks passed. The existing one-test suite passed. Lint has zero errors and 14 Fast Refresh warnings. The build still warns about an approximately 894 KB main JavaScript bundle and an old Browserslist dataset. Broader route/library splitting remains a performance opportunity.

Local preview verified HTTP 200 for public/login/admin routes and HTTP 404 with noindex for unknown paths and missing articles. Local HTTP checks confirmed correct page metadata for the homepage, blog, service page, article, and login; robots and sitemap are served as their own resources. In-app browser connection timed out twice, so visual/mobile interaction checks and real authentication/contact flows are unverified. JSON-LD was parsed and its structure checked locally; Google Rich Results Test has not been run. Core Web Vitals, Lighthouse scores, real-user INP/CLS/LCP, external-link availability and production status codes have not been measured.

## Required deployment actions

1. Confirm paxxmo.com is the intended production domain. Attach both paxxmo.com and www.paxxmo.com to Vercel and enable HTTPS. The code assumes the existing non-www domain. On Apache, deploy dist with AllowOverride/rewrite support; API hosting must remain configured separately.
2. Restore or correct the Supabase project hostname in src/lib/supabase.ts and confirm public read permissions for published posts. Set SEO_REQUIRE_LIVE_BLOG=1 in production after it is reachable. Do not deploy fallback articles if they are no longer intended public content.
3. Deploy with npm run build and output directory dist. Rebuild/redeploy after publishing, editing or unpublishing posts so static HTML, social previews and sitemap stay synchronized. Automate that through your hosting deployment hook if publishing frequently. New published URLs will not exist as static pages until rebuilding.
4. Verify deployed public pages return 200, an invented path and unpublished article return 404, www/HTTPS/trailing-slash variants redirect permanently, and protected deep links load the admin shell. Hosting HTTP status/redirect rules cannot be proven by the Vite development server.
5. Verify the domain in Google Search Console and submit https://paxxmo.com/sitemap.xml. Inspect the homepage, all service routes and sample blog posts with URL Inspection. Check article/service markup with Google's Rich Results Test.
6. Run mobile/desktop Lighthouse and review Search Console Core Web Vitals after field data is available. Targets are LCP <=2.5s, INP <=200ms, CLS <=0.1 at the 75th percentile; these targets are not currently measured or guaranteed.
7. Review short bundled articles, dated 2025 content, and existing service claims (project counts, satisfaction percentages, delivery timelines, prices and performance claims) for current evidence. Generic social-network links in the footer need your real profile URLs. Existing author biographies should be checked against actual database authors. No business facts were invented during this change.

## Sources informing the implementation

- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) explains why prerendering helps crawlers and why crawlable noindex/status handling matters.
- [Vercel: static configuration](https://vercel.com/docs/project-configuration/vercel-json) documents clean URLs, redirects, headers and rewrites.
- [Vercel: custom 404 pages](https://vercel.com/kb/guide/custom-404-page) documents static 404.html handling.

## Files

New: src/entry-server.tsx; scripts/prerender.mjs; scripts/check-seo.mjs; src/assets/hero-collaboration.webp; src/assets/cyberpunk-person.webp; SEO_REPORT.md.

Modified: index.html; package.json; vite.config.ts; vercel.json; public/.htaccess; public/robots.txt; src/App.tsx; src/main.tsx; src/index.css; src/components/SEO.tsx; src/components/Hero.tsx; src/components/Footer.tsx; src/components/BlogInsights.tsx; src/components/Services.tsx; src/components/Testimonials.tsx; src/pages/Index.tsx; src/pages/Blog.tsx; src/pages/BlogPost.tsx; src/pages/NotFound.tsx; all five Sri Lanka service page files; src/stores/blogStoreSupabase.ts; src/components/ui/command.tsx; src/components/ui/textarea.tsx; tailwind.config.ts.

Deleted: public/sitemap.xml (replaced by generated production sitemap).

Generated, untracked build output: dist/*.html, dist/blog/*.html, dist/admin.html, dist/404.html, dist/robots.txt, dist/sitemap.xml, dist/seo-routes.json and Vite assets/manifest.
