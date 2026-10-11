import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Handles missing static article URLs and historic published slugs; never exposes drafts.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader("X-Robots-Tag", "noindex, follow");
  const slug = typeof request.query.slug === "string" ? request.query.slug : "";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return notFound(response);
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    response.setHeader("Retry-After", "300");
    return response
      .status(503)
      .send("Article routing is temporarily unavailable.");
  }
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client
    .from("blog_slug_redirects")
    .select("new_slug")
    .eq("old_slug", slug)
    .maybeSingle();
  if (error) {
    response.setHeader("Retry-After", "300");
    return response.status(503).send("The journal is temporarily unavailable.");
  }
  if (data && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.new_slug)) {
    const { data: article, error } = await client
      .from("blog_posts")
      .select("slug")
      .eq("slug", data.new_slug)
      .eq("published", true)
      .maybeSingle();
    if (error)
      return response
        .status(503)
        .send("The journal is temporarily unavailable.");
    if (article) return response.redirect(301, `/blog/${article.slug}`);
  }
  return notFound(response);
}
function notFound(response: VercelResponse) {
  return response
    .status(404)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .send(
      '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Article not found | Paxxmo</title></head><body style="background:#0e0f10;color:#eeece7;font-family:system-ui;padding:15vh 8vw"><main><p>PAXXMO JOURNAL</p><h1>404 — This story could not be found.</h1><p>It may have been unpublished or removed.</p><a style="color:#d6c19c" href="/blog">Explore the journal</a></main></body></html>',
    );
}
