import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/stores/blogStore";
export default function ArticleCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  return (
    <article className={`journal-card ${featured ? "featured" : ""}`}>
      <Link to={`/blog/${post.id}`} className="journal-card-image">
        {post.image ? (
          <img
            src={post.image}
            srcSet={post.imageSrcset}
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 60vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            alt={post.imageAlt || post.title}
            width={post.imageWidth}
            height={post.imageHeight}
            loading={featured ? "eager" : "lazy"}
            decoding="async"
            {...(featured ? { fetchpriority: "high" } : {})}
          />
        ) : (
          <div className="journal-image-pattern" aria-hidden="true">
            <span>P.</span>
          </div>
        )}
      </Link>
      <div className="journal-card-copy">
        <div className="journal-card-meta">
          <span>{post.category || "Insights"}</span>
          <span>{post.readTime}</span>
        </div>
        <Link to={`/blog/${post.id}`}>
          <h2>{post.title}</h2>
        </Link>
        <p>{post.excerpt}</p>
        <div className="journal-card-bottom">
          <small>
            {post.author} · {post.date}
          </small>
          <Link to={`/blog/${post.id}`} aria-label={`Read ${post.title}`}>
            <ArrowUpRight size={21} />
          </Link>
        </div>
      </div>
    </article>
  );
}
