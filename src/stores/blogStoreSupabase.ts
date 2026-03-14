import { create } from "zustand";
import { supabase, BlogPost as SupabaseBlogPost } from "@/lib/supabase";
import { blogPosts as localBlogPosts } from "@/data/blogPosts";

export interface BlogPost {
  id: string;
  image: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  author: string;
  authorRole: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

// Default blog images
export const BLOG_IMAGES = {
  default1: "/blog/blog-1.png",
  default2: "/blog/blog-2.png",
};

interface BlogStore {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  addPost: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updatePost: (id: string, updates: Partial<BlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPost: (id: string) => BlogPost | undefined;
  getPublishedPosts: () => BlogPost[];
  getDraftPosts: () => BlogPost[];
  publishPost: (id: string) => Promise<void>;
  unpublishPost: (id: string) => Promise<void>;
}

// Generate URL-friendly slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Calculate read time from content
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, "");
  const wordCount = textContent.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

// Format date
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Transform Supabase post to local format
const transformFromSupabase = (post: SupabaseBlogPost): BlogPost => ({
  id: post.slug,
  image: post.image || BLOG_IMAGES.default1,
  date: formatDate(post.created_at),
  readTime: calculateReadTime(post.content),
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  tags: post.tags || [],
  author: post.author,
  authorRole: "Admin",
  status: post.published ? "published" : "draft",
  createdAt: post.created_at,
  updatedAt: post.updated_at,
});

export const useBlogStore = create<BlogStore>()((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const posts = (data || []).map(transformFromSupabase);
      set({ posts, isLoading: false });
    } catch (error) {
      console.error("Error fetching posts from Supabase, using local data:", error);
      // Fall back to local blog posts
      const fallbackPosts: BlogPost[] = localBlogPosts.map((post) => ({
        ...post,
        status: "published" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      set({ posts: fallbackPosts, isLoading: false, error: null });
    }
  },

  addPost: async (postData) => {
    const slug = generateSlug(postData.title) + "-" + Date.now().toString(36);
    
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          slug,
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          author: postData.author,
          category: postData.tags[0] || "General",
          tags: postData.tags,
          image: postData.image,
          published: postData.status === "published",
        })
        .select()
        .single();

      if (error) throw error;

      const newPost = transformFromSupabase(data);
      set((state) => ({
        posts: [newPost, ...state.posts],
      }));

      return slug;
    } catch (error) {
      console.error("Error adding post:", error);
      throw error;
    }
  },

  updatePost: async (id, updates) => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.excerpt) updateData.excerpt = updates.excerpt;
      if (updates.content) updateData.content = updates.content;
      if (updates.author) updateData.author = updates.author;
      if (updates.image) updateData.image = updates.image;
      if (updates.tags) {
        updateData.tags = updates.tags;
        updateData.category = updates.tags[0] || "General";
      }
      if (updates.status !== undefined) {
        updateData.published = updates.status === "published";
      }
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("slug", id);

      if (error) throw error;

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id
            ? {
                ...post,
                ...updates,
                readTime: updates.content
                  ? calculateReadTime(updates.content)
                  : post.readTime,
                updatedAt: new Date().toISOString(),
              }
            : post
        ),
      }));
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("slug", id);

      if (error) throw error;

      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  getPost: (id) => {
    return get().posts.find((post) => post.id === id);
  },

  getPublishedPosts: () => {
    return get().posts.filter((post) => post.status === "published");
  },

  getDraftPosts: () => {
    return get().posts.filter((post) => post.status === "draft");
  },

  publishPost: async (id) => {
    await get().updatePost(id, { status: "published", date: formatDate(new Date().toISOString()) });
  },

  unpublishPost: async (id) => {
    await get().updatePost(id, { status: "draft" });
  },
}));

// Helper exports
export const getRelatedPosts = (posts: BlogPost[], currentId: string, limit = 2) => {
  const currentPost = posts.find((p) => p.id === currentId);
  if (!currentPost) return [];
  return posts
    .filter((p) => p.id !== currentId && p.status === "published" && p.tags.some((tag) => currentPost.tags.includes(tag)))
    .slice(0, limit);
};
