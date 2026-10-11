import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import App from "./App";
import { supabase } from "./lib/supabase";
import { useBlogStore, type BlogPost } from "./stores/blogStore";
import { blogPosts } from "./data/blogPosts";
import { listPosts } from "./lib/cms/api";
import { publicPost } from "./stores/blogStoreSupabase";
export { blogRoutes } from "./lib/cms/archives";

export async function loadPublishedPosts() {
  // Only query public posts; optionally require live data in production.
  try { return (await listPosts()).map(publicPost); } catch (error) {
    if(process.env.SEO_REQUIRE_LIVE_BLOG==='1')throw error;
    console.warn(
      `Supabase unavailable: ${error instanceof Error ? error.message : String(error)}. Rendering the site's existing bundled fallback articles. Set SEO_REQUIRE_LIVE_BLOG=1 to require live data.`,
    );
    return blogPosts.map((post) => ({
      ...post,
      category: "Insights",
      imageAlt: post.title,
      status: "published" as const,
      createdAt: new Date(post.date).toISOString(),
      updatedAt: new Date(post.date).toISOString(),
    }));
  }
}

export async function loadSlugRedirects() {
  const { data, error } = await supabase
    .from("blog_slug_redirects")
    .select("old_slug,new_slug")
    .abortSignal(AbortSignal.timeout(15000));
  if (error) {
    if (process.env.SEO_REQUIRE_LIVE_BLOG === "1") throw error;
    return [];
  }
  return data || [];
}

export function render(path: string, posts: BlogPost[]) {
  useBlogStore.setState({ posts, isLoading: false });
  HelmetProvider.canUseDOM = false;
  const context = {};
  const Router = ({ children }: { children: ReactNode }) => (
    <StaticRouter location={path}>{children}</StaticRouter>
  );
  const html = renderToString(
    <HelmetProvider context={context}>
      <MotionConfig isStatic>
        <App router={Router} />
      </MotionConfig>
    </HelmetProvider>,
  );
  return {
    html,
    helmet: (
      context as {
        helmet: {
          title: { toString(): string };
          meta: { toString(): string };
          link: { toString(): string };
          script: { toString(): string };
        };
      }
    ).helmet,
  };
}
