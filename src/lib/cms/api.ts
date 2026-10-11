import { supabase } from "../supabase";
import { cleanContent, safeUrl, slugify } from "./content";
import type { PostRecord, PostStatus, MediaAsset } from "./types";

export const messageFor = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
      ? String(error.message)
      : "The request failed. Please try again.";
export function normalizePost(row: Partial<PostRecord>): PostRecord {
  return {
    ...row,
    category: row.category || "General",
    tags: row.tags || [],
    status: row.status || (row.published ? "published" : "draft"),
    seo: row.seo || {},
    featured: row.featured || false,
    media_ids: row.media_ids || [],
    image_alt: row.image_alt || row.title || "",
    content: cleanContent(row.content || ""),
  } as PostRecord;
}
export async function listPosts(admin = false) {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  if (!admin) query = query.eq("published", true);
  // PostgREST defaults to 1,000 rows. Fetch bounded pages so older articles are not hidden.
  const rows: PostRecord[] = [];
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await query
      .range(offset, offset + 199)
      .abortSignal(AbortSignal.timeout(20000));
    if (error) throw error;
    rows.push(...(data || []).map(normalizePost));
    if (!data || data.length < 200) break;
  }
  return rows;
}
export async function savePost(post: PostRecord, expected?: string) {
  if (!post.title.trim() || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(post.slug))
    throw new Error("A title and a valid URL slug are required.");
  if (post.image && !safeUrl(post.image))
    throw new Error("Use an HTTPS image URL or a local image path.");
  if (
    post.seo.canonical &&
    (!safeUrl(post.seo.canonical) || !post.seo.canonical.startsWith("https://"))
  )
    throw new Error("Canonical URL must use HTTPS.");
  if (["published", "scheduled"].includes(post.status)) {
    if (
      !post.excerpt.trim() ||
      !cleanContent(post.content).trim() ||
      (post.image && post.image_alt.trim().length < 8)
    )
      throw new Error(
        "Add a useful excerpt, content and meaningful featured-image alt text before publishing.",
      );
    const missingAlt = [...post.content.matchAll(/<img\b[^>]*>/gi)].some(
      ([tag]) => !/\balt\s*=\s*["'][^"']{8,}["']/i.test(tag),
    );
    if (missingAlt)
      throw new Error(
        "Add meaningful alt text to every informative article image before publishing.",
      );
  }
  const payload = {
    ...post,
    content: cleanContent(post.content),
    scheduled_at: post.scheduled_at || null,
    image_width: post.image_width || null,
    image_height: post.image_height || null,
  };
  const { data, error } = await supabase.rpc("save_blog_post", {
    payload,
    expected_updated_at: expected || null,
  });
  if (error) throw error;
  return normalizePost(data);
}
export async function setPostStatus(post: PostRecord, status: PostStatus) {
  return savePost({ ...post, status }, post.updated_at);
}
export async function deletePost(id: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (!data?.length)
    throw new Error(
      "The article was not deleted. Check your permission or reload.",
    );
}
export async function duplicatePost(post: PostRecord) {
  return savePost({
    ...post,
    id: crypto.randomUUID(),
    slug: `${slugify(post.title).slice(0, 120)}-${crypto.randomUUID().slice(0, 8)}`,
    title: `${post.title.slice(0, 193)} (copy)`,
    status: "draft",
    published: false,
    featured: false,
    scheduled_at: null,
    published_at: undefined,
    seo: { ...post.seo, canonical: "", title: "" },
  });
}
export async function revisions(postId: string) {
  const { data, error } = await supabase
    .from("blog_revisions")
    .select("id,snapshot,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data as { id: string; snapshot: PostRecord; created_at: string }[];
}
export async function saveWorkingCopy(
  post: PostRecord,
  baseVersion: string,
  expectedCopyVersion?: string,
) {
  const { data, error } = await supabase.rpc("save_blog_working_copy", {
    payload: { ...post, content: cleanContent(post.content) },
    base_version: baseVersion,
    expected_copy_version: expectedCopyVersion || null,
  });
  if (error) throw error;
  return data as string;
}
export async function workingCopy(id: string) {
  const { data, error } = await supabase
    .from("blog_working_copies")
    .select("payload,updated_at,base_updated_at")
    .eq("post_id", id)
    .maybeSingle();
  if (error) throw error;
  return data as {
    payload: PostRecord;
    updated_at: string;
    base_updated_at: string;
  } | null;
}
export async function clearWorkingCopy(id: string, expectedVersion?: string) {
  if (!expectedVersion) return;
  const { error } = await supabase
    .from("blog_working_copies")
    .delete()
    .eq("post_id", id)
    .eq("updated_at", expectedVersion);
  if (error) throw error;
}
export async function listMedia() {
  const { data, error } = await supabase
    .from("blog_media")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as MediaAsset[];
}
export async function updateMedia(id: string, alt: string, caption: string) {
  if (!alt.trim())
    throw new Error("Describe what this informative image shows.");
  const { data, error } = await supabase
    .from("blog_media")
    .update({ alt, caption })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as MediaAsset;
}
export async function mediaUsage(id: string) {
  const { data, error } = await supabase.rpc("cms_media_usage", {
    asset_id: id,
  });
  if (error) throw error;
  return data || [];
}
export async function removeMedia(asset: MediaAsset) {
  if ((await mediaUsage(asset.id)).length)
    throw new Error(
      "This image is used in an article. Remove the article reference first.",
    );
  const { error: claimError } = await supabase.rpc(
    "begin_blog_media_deletion",
    { asset_id: asset.id },
  );
  if (claimError) throw claimError;
  // Storage RLS rechecks references at deletion time; FK restrict protects metadata too.
  const { error: storageError } = await supabase.storage
    .from("blog-media")
    .remove(asset.storage_paths);
  if (storageError) throw storageError;
  const { error } = await supabase
    .from("blog_media")
    .delete()
    .eq("id", asset.id);
  if (error) throw error;
}
