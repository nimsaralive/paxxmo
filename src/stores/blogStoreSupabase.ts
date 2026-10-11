import { create } from "zustand";
import { blogPosts as localPosts } from "@/data/blogPosts";
import { listPosts } from "@/lib/cms/api";
import { cleanContent, readingTime } from "@/lib/cms/content";
import type { PostRecord, ArticleSEO, PostStatus } from "@/lib/cms/types";
export interface BlogPost {
  id: string;
  rowId?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  tags: string[];
  author: string;
  authorRole: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  category?: string;
  seo?: ArticleSEO;
  featured?: boolean;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageSrcset?: string;
}
export const BLOG_IMAGES = {
  default1: "/blog/blog-1.png",
  default2: "/blog/blog-2.png",
};
export function publicPost(row: PostRecord): BlogPost {
  const published = row.published_at || row.created_at;
  return {
    id: row.slug,
    rowId: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: cleanContent(row.content),
    image: row.image || "",
    date: new Date(published).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    readTime: readingTime(row.content),
    tags: row.tags || [],
    author: row.author,
    authorRole: "Author",
    status: row.status,
    createdAt: published,
    updatedAt: row.updated_at,
    category: row.category || "General",
    seo: row.seo || {},
    featured: row.featured,
    imageAlt: row.image_alt || row.title,
    imageWidth: row.image_width || undefined,
    imageHeight: row.image_height || undefined,
    imageSrcset: row.image_srcset,
  };
}
export const fallbackPublicPosts = () =>
  localPosts.map((post) => ({
    ...post,
    content: cleanContent(post.content),
    status: "published" as const,
    category: "Insights",
    seo: {},
    imageAlt: post.title,
    createdAt: new Date(post.date).toISOString(),
    updatedAt: new Date(post.date).toISOString(),
  }));
interface BlogStore {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  getPost: (slug: string) => BlogPost | undefined;
  getPublishedPosts: () => BlogPost[];
}
export const useBlogStore = create<BlogStore>()((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  fetchPosts: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      set({ posts: (await listPosts()).map(publicPost), isLoading: false });
    } catch (error) {
      if (get().posts.length) {
        set({ isLoading: false });
        return;
      }
      // Retained legacy articles are real existing content, never fabricated admin records.
      if (import.meta.env.VITE_REQUIRE_LIVE_BLOG === "1") {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : "Blog unavailable",
        });
        return;
      }
      set({ posts: fallbackPublicPosts(), isLoading: false });
    }
  },
  getPost: (slug) =>
    get().posts.find((p) => p.id === slug && p.status === "published"),
  getPublishedPosts: () => get().posts.filter((p) => p.status === "published"),
}));
export const getRelatedPosts = (posts: BlogPost[], id: string, limit = 3) => {
  const current = posts.find((p) => p.id === id);
  return posts
    .filter(
      (p) =>
        p.id !== id &&
        p.status === "published" &&
        (p.category === current?.category ||
          p.tags.some((tag) => current?.tags.includes(tag))),
    )
    .slice(0, limit);
};
