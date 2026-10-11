import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { Search, ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/cms/ArticleCard";
import { useBlogStore } from "@/stores/blogStore";
import {
  archivePosts,
  canIndexArchive,
  BLOG_PAGE_SIZE,
} from "@/lib/cms/archives";
import { slugify } from "@/lib/cms/content";
import NotFound from "./NotFound";
export default function Blog() {
  const { slug, page: pageParam } = useParams(),
    location = useLocation(),
    [params, setParams] = useSearchParams();
  const type = location.pathname.includes("/category/")
    ? "category"
    : location.pathname.includes("/tag/")
      ? "tag"
      : undefined;
  const { getPublishedPosts, fetchPosts, isLoading, error } = useBlogStore();
  const posts = getPublishedPosts();
  const query = params.get("q") || "";
  const [search, setSearch] = useState(query);
  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);
  useEffect(() => setSearch(query), [query]);
  const rows = archivePosts(posts, type, slug);
  const matching = query
    ? rows.filter((p) =>
        `${p.title} ${p.excerpt} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : rows;
  const page = Number(pageParam || 1),
    total = Math.max(1, Math.ceil(matching.length / BLOG_PAGE_SIZE));
  const name =
    type === "category"
      ? rows[0]?.category
      : type === "tag"
        ? rows[0]?.tags.find((t) => slugify(t) === slug)
        : undefined;
  const base = type ? `/blog/${type}/${slug}` : "/blog";
  const link = (n: number) =>
    `${n === 1 ? base : `${base}/page/${n}`}${query ? `?q=${encodeURIComponent(query)}` : ""}`;
  const current = matching.slice(
    (page - 1) * BLOG_PAGE_SIZE,
    page * BLOG_PAGE_SIZE,
  );
  const featured =
    !type && !query && page === 1
      ? current.find((p) => p.featured) || current[0]
      : null;
  if (
    !isLoading &&
    posts.length &&
    (page < 1 ||
      !Number.isInteger(page) ||
      page > total ||
      (type && !rows.length))
  )
    return <NotFound />;
  const noindex = !!query || (!!type && !canIndexArchive(rows));
  return (
    <>
      <SEO
        title={
          type
            ? `${name || slug} ${type === "tag" ? "tagged stories" : "topic articles"}${page > 1 ? ` — Page ${page}` : ""} | Paxxmo Journal`
            : `Paxxmo Journal${page > 1 ? ` — Page ${page}` : ""} | Design, Development & Digital Strategy`
        }
        description={
          type
            ? `Explore ${name || slug} ${type === "tag" ? "tagged stories" : "topic articles"} from Paxxmo. Practical perspectives on design, development and digital strategy.${page > 1 ? ` Page ${page}.` : ""}`
            : `Fresh perspectives on web development, design and digital marketing. Read practical insights from the Paxxmo team.${page > 1 ? ` Page ${page}.` : ""}`
        }
        canonicalUrl={`https://paxxmo.com${page === 1 ? base : base + "/page/" + page}`}
        noindex={noindex}
        structuredData={{
          "@type": "Blog",
          name: "Paxxmo Journal",
          url: "https://paxxmo.com/blog",
        }}
      />
      <div className="journal">
        <Navbar />
        <main>
          <header className="journal-hero">
            <div className="journal-eyebrow">
              <span />
              THE PAXXMO JOURNAL
            </div>
            <h1>
              {type ? (
                <>
                  {name || slug}
                  <span>Ideas in focus.</span>
                </>
              ) : (
                <>
                  A fresh perspective.<span>Something to think about.</span>
                </>
              )}
            </h1>
            <div className="journal-hero-bottom">
              <p>
                Ideas, insights and practical know-how.
                <br />
                For the people building what comes next.
              </p>
              <form
                className="journal-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setParams(search.trim() ? { q: search.trim() } : {});
                }}
              >
                <Search size={18} />
                <input
                  aria-label="Search the journal"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find your next read…"
                />
                <button aria-label="Search articles">
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </header>
          <nav className="journal-categories" aria-label="Article categories">
            <Link className={!type ? "active" : ""} to="/blog">
              All stories
            </Link>
            {[...new Set(posts.map((p) => p.category || "General"))].map(
              (category) => (
                <Link
                  className={name === category ? "active" : ""}
                  key={category}
                  to={`/blog/category/${slugify(category)}`}
                >
                  {category}
                </Link>
              ),
            )}
          </nav>
          {isLoading && !posts.length ? (
            <div className="cms-state" role="status">
              Gathering the latest stories…
            </div>
          ) : error ? (
            <div className="cms-state error" role="alert">
              <h2>The journal is temporarily unavailable</h2>
              <p>{error}</p>
              <button className="cms-button" onClick={fetchPosts}>
                Try again
              </button>
            </div>
          ) : !current.length ? (
            <div className="cms-state">
              <h2>
                {query
                  ? "No stories match your search."
                  : "Our next chapter is on its way."}
              </h2>
              <p>
                {query
                  ? "Try another topic or explore all stories."
                  : "Check back for new perspectives from Paxxmo."}
              </p>
              {query && (
                <Link className="cms-button" to="/blog">
                  Explore all stories
                </Link>
              )}
            </div>
          ) : (
            <>
              {featured && (
                <section className="journal-featured">
                  <div className="journal-section-label">
                    {featured.featured ? "THE EDITOR’S PICK" : "LATEST STORY"}
                    <span>
                      01 / {featured.featured ? "FEATURED" : "LATEST"}
                    </span>
                  </div>
                  <ArticleCard post={featured} featured />
                </section>
              )}
              <section className="journal-stories">
                <div className="journal-section-label">
                  {query
                    ? `RESULTS FOR “${query}”`
                    : type
                      ? "EXPLORE THE TOPIC"
                      : "MORE GOOD READS"}
                  <span>{matching.length} STORIES</span>
                </div>
                <div className="journal-grid">
                  {current
                    .filter((p) => p.id !== featured?.id)
                    .map((p) => (
                      <ArticleCard key={p.id} post={p} />
                    ))}
                </div>
              </section>
              <nav className="journal-pagination" aria-label="Journal pages">
                {page > 1 ? (
                  <Link to={link(page - 1)}>
                    <ArrowLeft size={16} />
                    Previous
                  </Link>
                ) : (
                  <span />
                )}
                <div>
                  {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      to={link(n)}
                      aria-current={n === page ? "page" : undefined}
                    >
                      {n}
                    </Link>
                  ))}
                </div>
                {page < total ? (
                  <Link to={link(page + 1)}>
                    Next
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            </>
          )}
          <section className="journal-closing">
            <small>GOOD IDEAS DESERVE GOOD EXECUTION.</small>
            <h2>Let’s build your next chapter.</h2>
            <a href="/#contact">
              Start a conversation <ArrowUpRightIcon />
            </a>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
function ArrowUpRightIcon() {
  return <span aria-hidden="true">↗</span>;
}
