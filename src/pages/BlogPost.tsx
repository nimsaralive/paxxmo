import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { absoluteUrl } from "@/components/SEO";
import ArticleCard from "@/components/cms/ArticleCard";
import { useBlogStore, getRelatedPosts } from "@/stores/blogStore";
import { articleContent, slugify } from "@/lib/cms/content";
import NotFound from "./NotFound";
export default function BlogPost() {
  const { slug } = useParams();
  const { getPost, getPublishedPosts, fetchPosts, isLoading } = useBlogStore();
  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);
  const post = getPost(slug || "");
  const posts = getPublishedPosts();
  if (isLoading && !posts.length)
    return (
      <main className="cms-state min-h-screen" role="status">
        Opening your story…
      </main>
    );
  if (!post) return <NotFound />;
  const { content, headings } = articleContent(post.content),
    related = getRelatedPosts(posts, post.id, 3),
    position = posts.findIndex((p) => p.id === post.id),
    previous = posts[position - 1],
    next = posts[position + 1];
  const url = `https://paxxmo.com/blog/${post.id}`,
    schema = {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      ...(post.image ? { image: absoluteUrl(post.image) } : {}),
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      author: { "@type": "Person", name: post.author },
      publisher: { "@id": "https://paxxmo.com/#organization" },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    };
  return (
    <>
      <SEO
        title={post.seo?.title || post.title}
        description={post.seo?.description || post.excerpt}
        canonicalUrl={post.seo?.canonical || url}
        ogType="article"
        ogImage={post.seo?.image || post.image || "/og-image.png"}
        socialTitle={post.seo?.socialTitle}
        socialDescription={post.seo?.socialDescription}
        noindex={post.seo?.noindex}
        structuredData={schema}
      />
      <div className="journal">
        <Navbar />
        <main className="journal-article">
          <nav className="journal-breadcrumbs" aria-label="Breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/blog">Journal</Link>
            <span>/</span>
            <span aria-current="page">{post.title}</span>
          </nav>
          <header className="journal-article-header">
            <Link
              to={`/blog/category/${slugify(post.category || "General")}`}
              className="journal-eyebrow"
            >
              {post.category || "Insights"}
            </Link>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <div className="journal-byline">
              <div className="journal-author-initial" aria-hidden="true">
                {post.author.slice(0, 1)}
              </div>
              <div>
                <strong>{post.author}</strong>
                <small>
                  <time dateTime={post.createdAt}>{post.date}</time> ·{" "}
                  {post.readTime}
                  {post.updatedAt.slice(0, 10) !== post.createdAt.slice(0, 10)
                    ? ` · Updated ${new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`
                    : ""}
                </small>
              </div>
              <div className="journal-share">
                <button
                  aria-label="Copy article link"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      toast.success("Article link copied.");
                    } catch {
                      toast.error(
                        "Could not copy the link. Copy the address from your browser.",
                      );
                    }
                  }}
                >
                  <Link2 size={17} />
                </button>
                <a
                  aria-label="Share on X"
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  𝕏
                </a>
                <a
                  aria-label="Share on LinkedIn"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  in
                </a>
              </div>
            </div>
          </header>
          {post.image && (
            <figure className="journal-article-image">
              <img
                src={post.image}
                srcSet={post.imageSrcset}
                sizes="(max-width: 1024px) 100vw, 1100px"
                alt={post.imageAlt || post.title}
                width={post.imageWidth}
                height={post.imageHeight}
                decoding="async"
                {...{ fetchpriority: "high" }}
              />
            </figure>
          )}
          <div className="journal-reading-layout">
            {headings.length > 0 && (
              <aside className="journal-toc">
                <small>IN THIS ARTICLE</small>
                <nav aria-label="Table of contents">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={h.level > 2 ? "indented" : ""}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </aside>
            )}
            <article className="journal-body cms-prose">
              <div dangerouslySetInnerHTML={{ __html: content }} />
              <div className="journal-tags">
                {post.tags.map((tag) => (
                  <Link to={`/blog/tag/${slugify(tag)}`} key={tag}>
                    #{tag}
                  </Link>
                ))}
              </div>
              <div className="journal-author-card">
                <div className="journal-author-initial">
                  {post.author.slice(0, 1)}
                </div>
                <div>
                  <small>WRITTEN BY</small>
                  <h2>{post.author}</h2>
                  <p>A contributor to the Paxxmo journal.</p>
                </div>
              </div>
            </article>
          </div>
          <nav className="journal-next-stories" aria-label="Adjacent articles">
            {previous ? (
              <Link to={`/blog/${previous.id}`}>
                <small>
                  <ArrowLeft size={14} />
                  PREVIOUS STORY
                </small>
                <strong>{previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/blog/${next.id}`}>
                <small>
                  NEXT STORY
                  <ArrowRight size={14} />
                </small>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
          {related.length > 0 && (
            <section className="journal-stories related">
              <div className="journal-section-label">
                KEEP YOUR CURIOSITY GOING <Link to="/blog">ALL STORIES ↗</Link>
              </div>
              <div className="journal-grid">
                {related.map((p) => (
                  <ArticleCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
