import { describe, expect, it } from "vitest";
import {
  cleanContent,
  articleContent,
  safeUrl,
  wordCount,
  slugify,
} from "@/lib/cms/content";
import { analyzeSEO } from "@/lib/cms/seo";
import { archivePosts, blogRoutes, canIndexArchive } from "@/lib/cms/archives";
import type { PostRecord } from "@/lib/cms/types";
import type { BlogPost } from "@/stores/blogStore";

const record: PostRecord = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "accessible-web-design",
  title: "Accessible web design for growing businesses",
  excerpt:
    "Learn how accessible web design helps people use your website, with practical examples for thoughtful teams and growing businesses.",
  content:
    '<h2>Accessible web design</h2><p>Accessible web design helps people use a website. <a href="/web-development-sri-lanka">Explore web development.</a></p>',
  category: "Design",
  tags: ["Accessibility"],
  author: "Editor",
  image: "",
  image_alt: "",
  status: "draft",
  published: false,
  featured: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  seo: { primaryKeyword: "accessible web design" },
  media_ids: [],
};
const view = (id: string, words = 400): BlogPost => ({
  id,
  title: id,
  excerpt: "A useful article.",
  content: `<p>${"word ".repeat(words)}</p>`,
  category: "Design",
  tags: ["Accessibility"],
  author: "Editor",
  authorRole: "Author",
  image: "",
  date: "Jan 1, 2026",
  readTime: "2 min read",
  status: "published",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("CMS content security", () => {
  it("removes stored XSS, event handlers, dangerous URLs and CSS", () => {
    const html = cleanContent(
      '<script>alert(1)</script><p onclick="alert(1)" style="position:fixed">Safe</p><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)">link</a><svg onload="alert(1)"></svg>',
    );
    expect(html).not.toMatch(
      /script|onclick|onerror|onload|javascript:|style=/,
    );
    expect(html).toContain("Safe");
  });
  it("rejects unapproved embeds while preserving approved video and rich tables", () => {
    const html = cleanContent(
      '<iframe src="https://evil.example/embed"></iframe><iframe src="https://www.youtube-nocookie.com/embed/abc" title="Video"></iframe><table><tr><td>Cell</td></tr></table>',
    );
    expect(html).not.toContain("evil.example");
    expect(html).toContain("youtube-nocookie.com");
    expect(html).toContain("<td>Cell</td>");
  });
  it("preserves image metadata and captions without unsafe srcset values", () => {
    const html = cleanContent(
      '<figure><img src="https://example.com/p.webp" alt="People collaborating" width="960" height="640" srcset="javascript:alert(1) 400w, https://example.com/p.webp 960w" data-media-id="asset"><figcaption>Team workshop</figcaption></figure>',
    );
    expect(html).toContain('data-media-id="asset"');
    expect(html).toContain('width="960"');
    expect(html).toContain("<figcaption>Team workshop</figcaption>");
    expect(html).not.toContain("javascript:");
  });
  it("generates unique heading anchors and reserves H1 for the page title", () => {
    const result = articleContent(
      "<h1>Overview</h1><h2>Overview</h2><h3>Next steps</h3>",
    );
    expect(result.content).not.toContain("<h1");
    expect(result.headings.map((h) => h.id)).toEqual([
      "overview-1",
      "overview-2",
      "next-steps-3",
    ]);
  });
  it("counts text and normalizes readable slugs", () => {
    expect(wordCount("<p>Hello <strong>world</strong>.</p>")).toBe(2);
    expect(slugify("  Café & Design! ")).toBe("cafe-design");
    expect(safeUrl("data:text/html,test")).toBe(false);
  });
});
describe("editorial SEO guidance", () => {
  it("explains weak content and calculates a bounded score", () => {
    const result = analyzeSEO(record);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(
      result.checks.find((c) => c.label.includes("useful detail"))?.pass,
    ).toBe(false);
  });
  it("detects duplicate metadata and honours editable depth thresholds", () => {
    const post = {
      ...record,
      seo: {
        ...record.seo,
        analysisRules: { minWords: 10, titleMax: 65, descriptionMax: 160 },
      },
    };
    const result = analyzeSEO(post, [{ ...record, id: "other" }]);
    expect(
      result.checks.find((c) => c.label === "Unique title and description")
        ?.pass,
    ).toBe(false);
    expect(
      result.checks.find((c) => c.label.includes("useful detail"))?.pass,
    ).toBe(true);
  });
});
describe("crawlable archives", () => {
  it("excludes thin archives from indexing", () => {
    expect(canIndexArchive([view("one")])).toBe(false);
    expect(
      canIndexArchive([view("one", 50), view("two", 50), view("three", 50)]),
    ).toBe(false);
    expect(canIndexArchive([view("one"), view("two"), view("three")])).toBe(
      true,
    );
  });
  it("generates clean pagination and category/tag routes", () => {
    const posts = Array.from({ length: 8 }, (_, i) => view(`post-${i}`));
    const routes = blogRoutes(posts);
    expect(routes).toContainEqual({ path: "/blog/page/2", index: true });
    expect(routes).toContainEqual({
      path: "/blog/category/design/page/2",
      index: true,
    });
    expect(archivePosts(posts, "tag", "accessibility")).toHaveLength(8);
    expect(archivePosts(posts, "category", "unknown")).toHaveLength(0);
  });
});
