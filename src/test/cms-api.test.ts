import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: mock }));
import { savePost, normalizePost, removeMedia } from "@/lib/cms/api";
import type { MediaAsset } from "@/lib/cms/types";
beforeEach(() => vi.clearAllMocks());
describe("real persistence contracts", () => {
  it("uses the atomic RPC with a stable UUID and expected database version", async () => {
    const post = normalizePost({
      id: "00000000-0000-4000-8000-000000000001",
      slug: "my-story",
      title: "My story",
      content: '<p onclick="bad()">Safe</p>',
      excerpt: "Summary",
      status: "draft",
      updated_at: "2026-10-01T00:00:00Z",
    });
    mock.rpc.mockResolvedValue({ data: post, error: null });
    await savePost(post, post.updated_at);
    expect(mock.rpc).toHaveBeenCalledWith(
      "save_blog_post",
      expect.objectContaining({
        expected_updated_at: post.updated_at,
        payload: expect.objectContaining({
          id: post.id,
          content: "<p>Safe</p>",
        }),
      }),
    );
  });
  it("propagates backend conflicts instead of claiming success", async () => {
    mock.rpc.mockResolvedValue({
      data: null,
      error: { message: "Conflict: article changed" },
    });
    await expect(
      savePost(
        normalizePost({
          slug: "my-story",
          title: "Story",
          content: "<p>Text</p>",
        }),
        "old",
      ),
    ).rejects.toEqual({ message: "Conflict: article changed" });
  });
  it("rejects an unsafe canonical before persistence", async () => {
    await expect(
      savePost(
        normalizePost({
          slug: "story",
          title: "Story",
          seo: { canonical: "javascript:alert(1)" },
        }),
      ),
    ).rejects.toThrow("Canonical");
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("refuses to delete an image with usage references", async () => {
    mock.rpc.mockResolvedValue({ data: [{ post_id: "used" }], error: null });
    await expect(removeMedia({ id: "asset" } as MediaAsset)).rejects.toThrow(
      "used in an article",
    );
  });
});
