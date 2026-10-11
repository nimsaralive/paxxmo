import { slugify, wordCount } from "./content";
import type { BlogPost } from "@/stores/blogStore";
export const BLOG_PAGE_SIZE = 6;
export function archivePosts(posts: BlogPost[], type?: string, slug?: string) {
  return posts.filter(
    (p) =>
      p.status === "published" &&
      (!type ||
        (type === "category"
          ? slugify(p.category || "General") === slug
          : p.tags.some((t) => slugify(t) === slug))),
  );
}
export const canIndexArchive = (posts: BlogPost[]) =>
  posts.length >= 3 &&
  posts.reduce((n, p) => n + wordCount(p.content), 0) >= 1000;
export function blogRoutes(posts: BlogPost[]) {
  const entries: { path: string; index: boolean }[] = [
    { path: "/blog", index: true },
  ];
  const append = (base: string, rows: BlogPost[], index: boolean) => {
    for (let page = 2; page <= Math.ceil(rows.length / BLOG_PAGE_SIZE); page++)
      entries.push({ path: `${base}/page/${page}`, index });
  };
  append("/blog", posts, true);
  for (const type of ["category", "tag"]) {
    const names = [
      ...new Set(
        type === "category"
          ? posts.map((p) => p.category || "General")
          : posts.flatMap((p) => p.tags),
      ),
    ];
    for (const name of names) {
      const slug = slugify(name);
      if (!slug) continue;
      const rows = archivePosts(posts, type, slug);
      const index = canIndexArchive(rows);
      entries.push({ path: `/blog/${type}/${slug}`, index });
      append(`/blog/${type}/${slug}`, rows, index);
    }
  }
  return entries;
}
