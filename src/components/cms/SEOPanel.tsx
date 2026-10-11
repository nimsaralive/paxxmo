import type { PostRecord } from "@/lib/cms/types";
import { analyzeSEO, DEFAULT_SEO_RULES } from "@/lib/cms/seo";
import { CheckCircle2, Circle, Link2 } from "lucide-react";
import { useState } from "react";
export default function SEOPanel({
  post,
  others,
  onChange,
}: {
  post: PostRecord;
  others: PostRecord[];
  onChange: (post: PostRecord) => void;
}) {
  const analysis = analyzeSEO(post, others),
    [preview, setPreview] = useState("desktop");
  const set = (key: string, value: unknown) =>
    onChange({ ...post, seo: { ...post.seo, [key]: value } });
  const suggestions = others
    .filter(
      (p) =>
        p.id !== post.id &&
        p.status === "published" &&
        (p.category === post.category ||
          p.tags.some((t) => post.tags.includes(t))),
    )
    .slice(0, 4);
  return (
    <div className="cms-seo-panel cms-form">
      <div className="cms-score">
        <strong>
          {analysis.score}
          <span>/100</span>
        </strong>
        <div>
          <h3>Editorial SEO guidance</h3>
          <p>This checklist is not a Google ranking score.</p>
        </div>
      </div>
      <label>
        SEO title
        <input
          value={post.seo.title || ""}
          placeholder={post.title || "A useful, specific article title"}
          onChange={(e) => set("title", e.target.value)}
        />
        <small>{(post.seo.title || post.title).length} characters</small>
      </label>
      <label>
        Meta description
        <textarea
          rows={3}
          value={post.seo.description || ""}
          placeholder={post.excerpt || "What will readers learn?"}
          onChange={(e) => set("description", e.target.value)}
        />
        <small>
          {(post.seo.description || post.excerpt).length} characters
        </small>
      </label>
      <label>
        URL slug
        <input
          value={post.slug}
          onChange={(e) => onChange({ ...post, slug: e.target.value })}
        />
        <small>paxxmo.com/blog/{post.slug}</small>
      </label>
      <label>
        Canonical URL
        <input
          value={post.seo.canonical || ""}
          placeholder={`https://paxxmo.com/blog/${post.slug}`}
          onChange={(e) => set("canonical", e.target.value)}
        />
        <small>Blank uses the automatic article canonical.</small>
      </label>
      <label>
        Primary keyword
        <input
          value={post.seo.primaryKeyword || ""}
          onChange={(e) => set("primaryKeyword", e.target.value)}
        />
      </label>
      <label>
        Secondary keywords
        <input
          value={post.seo.secondaryKeywords?.join(", ") || ""}
          placeholder="Separate with commas"
          onChange={(e) =>
            set(
              "secondaryKeywords",
              e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            )
          }
        />
      </label>
      <label>
        Social sharing title
        <input
          value={post.seo.socialTitle || ""}
          placeholder={post.title}
          onChange={(e) => set("socialTitle", e.target.value)}
        />
      </label>
      <label>
        Social sharing description
        <textarea
          value={post.seo.socialDescription || ""}
          placeholder={post.excerpt}
          onChange={(e) => set("socialDescription", e.target.value)}
        />
      </label>
      <label>
        Social image URL
        <input
          value={post.seo.image || ""}
          placeholder={post.image || "Use the featured image"}
          onChange={(e) => set("image", e.target.value)}
        />
      </label>
      <label className="cms-check-label">
        <input
          type="checkbox"
          checked={post.seo.noindex || false}
          onChange={(e) => set("noindex", e.target.checked)}
        />
        Exclude this article from search indexing
      </label>
      <div className="cms-preview-tabs">
        {["desktop", "mobile", "facebook", "twitter"].map((v) => (
          <button
            key={v}
            type="button"
            className={preview === v ? "active" : ""}
            onClick={() => setPreview(v)}
          >
            {v === "twitter" ? "X / Twitter" : v}
          </button>
        ))}
      </div>
      <div className={`cms-search-preview ${preview}`}>
        <small>
          {preview === "facebook"
            ? "paxxmo.com"
            : preview === "twitter"
              ? "Paxxmo · paxxmo.com"
              : `Paxxmo › blog › ${post.slug}`}
        </small>
        {["facebook", "twitter"].includes(preview) &&
          (post.seo.image || post.image) && (
            <img src={post.seo.image || post.image} alt="Social card preview" />
          )}
        <h4>
          {(["facebook", "twitter"].includes(preview)
            ? post.seo.socialTitle
            : post.seo.title) ||
            post.title ||
            "Your article title"}
        </h4>
        <p>
          {(["facebook", "twitter"].includes(preview)
            ? post.seo.socialDescription
            : post.seo.description) ||
            post.excerpt ||
            "Your article summary will appear here."}
        </p>
      </div>
      <h3>Your optimization checklist</h3>
      <ul className="cms-seo-checks">
        {analysis.checks.map((c) => (
          <li key={c.label}>
            {c.pass ? <CheckCircle2 size={17} /> : <Circle size={17} />}
            <div>
              <strong>{c.label}</strong>
              {!c.pass && <small>{c.help}</small>}
            </div>
          </li>
        ))}
      </ul>
      <details>
        <summary>Adjust editorial rules</summary>
        <div className="space-y-3 mt-3">
          {Object.entries(DEFAULT_SEO_RULES).map(([key, value]) => (
            <label key={key}>
              {key}
              <input
                type="number"
                min={1}
                max={5000}
                value={
                  post.seo.analysisRules?.[
                    key as keyof typeof DEFAULT_SEO_RULES
                  ] ?? value
                }
                onChange={(e) =>
                  set("analysisRules", {
                    ...DEFAULT_SEO_RULES,
                    ...post.seo.analysisRules,
                    [key]: Math.max(1, Number(e.target.value)),
                  })
                }
              />
            </label>
          ))}
          <small>
            Each checklist item has equal weight. Scores guide review; avoid
            padding content to chase a score.
          </small>
        </div>
      </details>
      <h3>Relevant internal links</h3>
      {suggestions.length ? (
        suggestions.map((p) => (
          <a
            key={p.id}
            href={`/blog/${p.slug}`}
            target="_blank"
            rel="noreferrer"
            className="cms-link-suggestion"
          >
            <Link2 size={14} />
            <span>
              {p.title}
              <small>/blog/{p.slug}</small>
            </span>
          </a>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          Add categories and tags to find related published articles.
        </p>
      )}
    </div>
  );
}
