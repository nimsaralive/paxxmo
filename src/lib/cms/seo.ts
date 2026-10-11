import { plainText, wordCount, slugify } from "./content";
import type { PostRecord } from "./types";
export const DEFAULT_SEO_RULES = {
  minWords: 300,
  titleMax: 65,
  descriptionMax: 160,
};
export function analyzeSEO(post: PostRecord, others: PostRecord[] = []) {
  const rules = { ...DEFAULT_SEO_RULES, ...post.seo.analysisRules };
  const title = post.seo.title || post.title,
    description = post.seo.description || post.excerpt;
  const text = plainText(post.content),
    keyword = post.seo.primaryKeyword?.trim().toLowerCase() || "";
  const headings = [...post.content.matchAll(/<h([1-4])[^>]*>/g)].map((m) =>
    Number(m[1]),
  );
  const images = [...post.content.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
  const average = wordCount(post.content) / Math.max(1, sentences.length);
  const checks = [
    {
      label: "Title is descriptive and fits search previews",
      pass: title.length >= 20 && title.length <= rules.titleMax,
      help: `Aim for 20–${rules.titleMax} characters.`,
    },
    {
      label: "Meta description explains the article",
      pass:
        description.length >= 70 && description.length <= rules.descriptionMax,
      help: `Write a useful 70–${rules.descriptionMax} character summary.`,
    },
    {
      label: "Primary keyword matches the title and content",
      pass:
        !!keyword &&
        title.toLowerCase().includes(keyword) &&
        text.toLowerCase().includes(keyword),
      help: "Choose a relevant phrase and use it naturally.",
    },
    {
      label: "Logical article headings",
      pass:
        headings.length > 0 &&
        !headings.includes(1) &&
        headings.every((h, i) =>
          i === 0 ? h === 2 : h <= headings[i - 1] + 1,
        ),
      help: "The page title is H1. Start body sections at H2 without skipping levels.",
    },
    {
      label: "Content answers the topic with useful detail",
      pass: wordCount(post.content) >= rules.minWords,
      help: `Review depth; ${rules.minWords} words is editorial guidance, not a ranking requirement.`,
    },
    {
      label: "Links to relevant Paxxmo pages",
      pass: /href=["'](?:\/(?!\/)|https:\/\/paxxmo\.com\/)/.test(post.content),
      help: "Add at least one useful internal link.",
    },
    {
      label: "Informative images have meaningful alt text",
      pass:
        (!post.image || post.image_alt.trim().length >= 8) &&
        images.every((img) => /alt=["'][^"']{8,}["']/.test(img)),
      help: "Describe image content rather than repeating keywords.",
    },
    {
      label: "Readable sentence length",
      pass: average <= 25 && text.length > 0,
      help: "Review long sentences. This heuristic is English-focused.",
    },
    {
      label: "Clean, readable URL slug",
      pass:
        !!post.slug &&
        post.slug === slugify(post.slug) &&
        post.slug.length <= 80,
      help: "Use a short, lowercase slug with hyphens.",
    },
    {
      label: "Unique title and description",
      pass: !others.some(
        (p) =>
          p.id !== post.id &&
          ((p.seo.title || p.title) === title ||
            (p.seo.description || p.excerpt) === description),
      ),
      help: "Differentiate this article from existing metadata.",
    },
    {
      label: "Canonical URL resolves to the article",
      pass:
        !post.seo.canonical || /^https:\/\/[^\s]+$/.test(post.seo.canonical),
      help: "Blank uses the automatic self-canonical; overrides must be HTTPS.",
    },
  ];
  return {
    checks,
    score: Math.round(
      (checks.filter((c) => c.pass).length / checks.length) * 100,
    ),
    words: wordCount(post.content),
    characters: text.length,
    rules,
  };
}
