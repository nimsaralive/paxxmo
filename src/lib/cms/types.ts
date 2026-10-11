export type PostStatus =
  "draft" | "in_review" | "scheduled" | "published" | "archived";
export type CMSRole = "admin" | "editor" | "author";
export interface ArticleSEO {
  title?: string;
  description?: string;
  canonical?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  socialTitle?: string;
  socialDescription?: string;
  image?: string;
  noindex?: boolean;
  analysisRules?: {
    minWords: number;
    titleMax: number;
    descriptionMax: number;
  };
}
export interface PostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  author_id?: string;
  category: string;
  tags: string[];
  image: string;
  published: boolean;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_at?: string | null;
  editor_json?: object;
  seo: ArticleSEO;
  featured: boolean;
  image_alt: string;
  image_width?: number | null;
  image_height?: number | null;
  image_srcset?: string;
  media_ids: string[];
}
export interface MediaAsset {
  state?: "active" | "deleting";
  id: string;
  owner_id: string;
  name: string;
  alt: string;
  caption: string;
  url: string;
  storage_paths: string[];
  srcset: string;
  width: number;
  height: number;
  size: number;
  mime_type: string;
  created_at: string;
}
export const statusLabels: Record<PostStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};
