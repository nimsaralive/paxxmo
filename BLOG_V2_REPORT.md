# Paxxmo Blog System 2.0 — implementation and deployment

The blog has been rebuilt in the existing React/Vite + Supabase stack. No live database migration was run: the configured Supabase hostname fails DNS lookup, and no working replacement project or database session is available. Apply the migration and bootstrap CMS roles **before deploying the new administration UI**. Without them, access fails closed and saves/uploads show real errors.

## Delivered code

| Area                | Implemented behavior                                                                                                                                                                                                                                  | Verification boundary                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Dashboard           | Branded responsive sidebar, overview counts, search, category/author/status/date filters, sorting, pagination, bulk actions, publish/unpublish, review, duplicate, archive and confirmed deletion                                                     | Build/type checks; real account/database workflows blocked                     |
| Writing editor      | TipTap 3 with headings H1–H4, bold/italic/underline/strike/highlight, lists/checklists, quotes, syntax-highlighted code, tables, links, separators, image blocks/captions and approved YouTube/Vimeo embeds                                           | Real editor schema round-trip, undo/redo and highlighting tests                |
| Writing workflow    | 1.8-second debounced autosave, visible real save status, Ctrl/⌘ S, focus mode, browser fullscreen, desktop/mobile preview, word/character/read-time estimates, revisions, restoration and unsaved-change warnings                                     | Persistence-contract tests; live writes/revisions need Supabase                |
| Blocks              | Slash insertion menu for headings/images/tables/quotes/code, drag handles, Alt+ArrowUp/Down block reordering, keyboard link shortcut                                                                                                                  | Implementation/type checks; browser interaction QA pending                     |
| Live article safety | Published/scheduled edits autosave to a private working copy. Explicit publish applies changes. Stable UUIDs prevent duplicate draft insertion; database versions protect posts and working copies from stale writers                                 | Unit contract checks; transactional SQL tests provided, not run                |
| Media               | Multiple-device, drop and clipboard uploads; preview/alt review; actual XHR byte progress; MIME/signature/size/dimension checks; canvas WebP conversion; 480/960/1920px variants without upscaling; unpredictable names; Supabase Storage persistence | Code/type checks; real upload and canvas/browser QA blocked                    |
| Library             | Reusable gallery, search/dimension filters, upload date, dimensions/size, editable alt/caption, featured/inline selection and confirmed deletion                                                                                                      | Live storage integration pending                                               |
| Media integrity     | Backend references include canonical articles, working drafts and retained revisions. Deletion first marks an unused asset as deleting under a row lock; saves reject references to pending deletions. Interrupted deletions can be retried           | SQL implementation; database/storage concurrency test pending                  |
| Editorial SEO       | All requested SEO/social fields, slug, canonical, keywords, index toggle; eleven equally weighted checks; editable depth/title/description rules; search and social previews; relevant internal-link suggestions                                      | Unit tests; explicitly guidance, not Google's ranking score                    |
| Public journal      | Premium content-first listing, featured/latest article, search, clean pagination and topic links; readable article page, author/date/read time, responsive images, captions, breadcrumbs, TOC, related/adjacent posts and share/copy links            | Generated HTML checks; visual/mobile browser QA pending                        |
| Technical SEO       | Prerendering, article/breadcrumb JSON-LD, per-post SEO/social fields, main and blog sitemaps, thin-archive/noindex exclusion, historical 301s, missing-article 404s, private noindex                                                                  | Generated output and local HTTP checks; live redirects/deploy hook pending     |
| Authorization       | Roles come from protected cms_members rows, not editable auth profile metadata. Authors edit their drafts/review submissions; editors/admins publish; only admins assign roles                                                                        | SQL policies reviewed and staging test script provided; live RLS tests not run |
| Scheduling          | Supabase Cron publishes due posts every minute; optional pg_net/Vault trigger calls a real hosting deployment hook after public changes                                                                                                               | Requires migration 002, active Cron and a real hook; not an in-browser timer   |

No AI provider is configured in this project, so no fake AI actions or generated-content replacement controls were added. Relevant internal-link suggestions work from actual loaded articles without an AI provider.

## Database migration and rollout

1. Restore the existing Supabase project, or configure a working replacement with the original data imported. Verify the existing blog_posts schema: the migration assumes a UUID id and the existing slug/title/excerpt/content/author/category/tags/image/published/created_at/updated_at columns. The database could not be inspected remotely.
2. Back up the database and Storage, then apply supabase/migrations/202610110001_blog_v2.sql in staging. It retains existing article content and image URLs, adds publishing/SEO/media columns, and creates cms_members, taxonomies, revisions, working copies, media references and slug redirects. Old blog policies are recorded in cms_policy_backup before replacing potentially permissive OR policies. Do not delete old columns or legacy assets.
3. Bootstrap your first admin with a real existing Supabase Auth account, replacing the sample expressions below:

```sql
insert into public.cms_members (user_id, role, display_name)
values ('YOUR_EXISTING_AUTH_USER_UUID', 'admin', 'YOUR_REAL_DISPLAY_NAME');
```

Existing credits remain intact. Legacy posts with null author_id are manageable by editors/admins; map them to actual authors deliberately if author-only access is needed. Do not trust raw_user_meta_data for permissions.

4. Run supabase/tests/blog_v2_security.sql against staging. It creates isolated fixtures inside a transaction and rolls them all back; assertions cover draft privacy, author publishing restrictions, optimistic conflicts, working-copy isolation, revisions and published slug redirects. This script has **not** been executed here.
5. Configure .env.local / hosting environment with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. The browser key must be public/anon, never service-role. Vercel's historical-slug handler needs SUPABASE_URL and SUPABASE_ANON_KEY (or the matching VITE variables). Local .env files are ignored by Git. An SMTP password was removed from .env.example; rotate it if it was a real credential.
6. Enable SEO_REQUIRE_LIVE_BLOG=1 and VITE_REQUIRE_LIVE_BLOG=1 for production. Current local HTML uses the retained six legacy bundled articles because Supabase is unreachable. Admin writes never fall back to local/mock persistence. Empty successful database results remain empty; they do not revive old articles.
7. Enable Supabase Cron and pg_net, then apply migration 002. Store your real Vercel deployment-hook URL in Vault under paxxmo_blog_deploy_hook. Without it, database publication can succeed but static pages/sitemaps will not automatically redeploy. Cron jobs and hook responses must be monitored in Supabase/hosting; delivery retries and deployment queue monitoring are operational follow-ups. The trigger can issue one hook per changed published row, so bulk operations may queue multiple deployments.
8. Deploy with npm run build, output directory dist, then run npm run seo:check. Verify publish/edit/unpublish/delete and schedule flows through an actual authorized account before production rollout.

## SEO and rendering behavior

- Public records are queried in bounded 200-row pages to avoid the default 1,000-row truncation. Dashboard filtering is currently client-side over that loaded workspace; move filtering/counts fully server-side for very large catalogs.
- Only published posts enter public rendering. SEO noindex posts and posts canonicalized elsewhere are excluded from sitemaps. Category/tag archives are prerendered but noindexed unless they contain at least three posts and 1,000 aggregate article words. This threshold is editable code policy, not a Google requirement.
- Pagination uses /blog/page/2 and archive /page/2 routes. Search queries receive noindex headers on Vercel and client metadata. Body H1s are rendered as H2 to reserve exactly one public-page H1 for the article title; the editor's analysis explains this hierarchy.
- Changed published slugs are recorded atomically. The Vercel missing-static-article handler verifies the target is published before returning 301; deleted/unpublished targets return 404. A database outage returns 503 instead of falsely claiming deletion. Apache redirects are generated at build time. Vite preview reads generated redirect data for local verification.
- Public HTML and social previews update when the build/deployment finishes. New or unpublished URLs can remain stale during that interval; static publishing is not instantaneous. A server-rendered architecture would be needed for zero-deploy-latency publication. Existing APIs and authentication remain in their original stack.
- HTML is sanitized on persistence and public/editor rendering. Scripts, event handlers, unsafe links/styles/SVG and unapproved video hosts are stripped. Images are re-encoded before upload; bucket rules limit MIME/size and write/delete access. Uploaded media is publicly served for published article delivery, so do not upload confidential images. Media metadata/library access is restricted.
- Stored editor JSON is preserved, while sanitized HTML is the authoritative public/round-trip representation. Existing custom HTML outside the safe/editor schema may need editorial review; original database content is retained until explicitly saved. Code, tables, captions and approved embeds have round-trip tests.
- CMS/editor/media modules are lazy-loaded. Animated scrolling is disabled on journal/CMS routes; chat remains on public pages. Images use sizes/srcset and stored dimensions. There are still sizeable JavaScript chunks; real Core Web Vitals have not been measured.

## Verification

Run npm.cmd run build, npm.cmd run seo:check, npm.cmd test, npm.cmd run lint, and TypeScript checks for tsconfig.app.json and tsconfig.node.json.

The security/content/SEO/archives/persistence tests passed, and the real TipTap tests passed after correcting a caption duplication issue. Final command results are recorded in the chat handoff. Public generated HTML is checked for unique metadata, H1 count, canonicals, structured-data parsing, sitemap decisions and local links/assets. Local HTTP checks cover public pages, thin archives, admin shells, sitemaps and missing-route 404s.

Verified locally: 18 tests across four files passed; both TypeScript projects passed; production build and SEO checks passed for 27 prerendered public pages. Lint passed with zero errors and 16 Fast Refresh warnings. HTTP checks passed for all 27 pages, both sitemaps, robots.txt, missing-route 404s and admin noindex headers. A temporary generated-data fixture verified the local 301 response and was restored; thin archive HTML was verified as noindex. Git diff whitespace checks passed.

Compatible dependency fixes reduced the audit from 49 to 25 advisories (9 moderate, 14 high, 2 critical). Remaining fixes include breaking toolchain/dependency upgrades and require a separate migration and validation; the dependency audit is not clean. Build warnings also flag large JavaScript chunks.

Unverified: live database migration syntax/execution, RLS/Storage policies against the real project, real saves/uploads/revisions/role changes, scheduling/deployment hook delivery, production 301/404 behavior, authenticated browser workflows, responsive visual QA, and field Core Web Vitals. The browser connection timed out; no screenshots or visual-passing claims are fabricated.

## Main files changed

- src/pages/AdminDashboard.tsx, BlogEditor.tsx, Blog.tsx, BlogPost.tsx; new CMSMedia.tsx and CMSTeam.tsx.
- src/components/cms/: AdminShell, ArticleCard, MediaLibrary, RichEditor and SEOPanel.
- src/lib/cms/: api, types, content sanitizer, media upload, SEO analysis and archive policy.
- src/contexts/AuthContext.tsx; src/components/ProtectedRoute.tsx; src/lib/supabase.ts; src/stores/blogStoreSupabase.ts.
- src/components/SEO.tsx; src/entry-server.tsx; src/App.tsx; src/index.css; vite.config.ts; vercel.json; api/blog-route.ts; scripts/prerender.mjs and check-seo.mjs.
- supabase/migrations/202610110001_blog_v2.sql and 202610110002_blog_scheduler.sql; supabase/tests/blog_v2_security.sql.
- src/test/cms.test.ts, cms-api.test.ts and rich-editor.test.ts; package.json/package-lock.json; .env.example/.gitignore; this report.

## Primary documentation

[Tiptap StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit), [Tiptap tables](https://tiptap.dev/docs/editor/extensions/nodes/table), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Supabase Cron](https://supabase.com/docs/guides/cron), [scheduled functions and Vault](https://supabase.com/docs/guides/functions/schedule-functions).
