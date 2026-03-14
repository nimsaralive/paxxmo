import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useBlogStore } from "@/stores/blogStore";
import { revealInView, revealTransition } from "@/lib/motion";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPost, getPublishedPosts, fetchPosts, isLoading, posts } = useBlogStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const post = getPost(slug || "");
  const allPosts = getPublishedPosts();

  // Show loading while fetching
  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post || post.status !== "published") {
    return <Navigate to="/blog" replace />;
  }

  // Get related posts
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 2);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author,
      "jobTitle": post.authorRole
    },
    "publisher": {
      "@type": "Organization",
      "name": "Paxxmo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://paxxmo.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://paxxmo.com/blog/${post.id}`
    },
    "keywords": post.tags.join(", ")
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        ogType="article"
        canonicalUrl={`https://paxxmo.com/blog/${post.id}`}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Article Header */}
        <article>
          <header className="pt-32 pb-12 lg:pt-40 lg:pb-16 px-6 lg:px-16 border-b border-border">
            <div className="max-w-4xl mx-auto">
              <motion.div {...revealInView} transition={revealTransition}>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                  {post.title}
                </h1>

                <p className="text-xl text-muted-foreground mb-8">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </header>

          {/* Featured Image */}
          <motion.div
            {...revealInView}
            transition={{ ...revealTransition, delay: 0.1 }}
            className="px-6 lg:px-16 py-8"
          >
            <div className="max-w-5xl mx-auto">
              <img
                src={post.image}
                alt={post.title}
                className="w-full aspect-[21/9] object-cover rounded-2xl"
              />
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div
            {...revealInView}
            transition={{ ...revealTransition, delay: 0.2 }}
            className="px-6 lg:px-16 py-12 lg:py-16"
          >
            <div
              className="max-w-3xl mx-auto prose prose-lg prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>

          {/* Author Bio */}
          <motion.div
            {...revealInView}
            transition={{ ...revealTransition, delay: 0.3 }}
            className="px-6 lg:px-16 py-12 border-t border-border"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border">
                <img
                  src="/nimsara-liyanage.jpg"
                  alt={post.author}
                  className="w-16 h-16 rounded-full object-cover object-top border-2 border-primary/30"
                />
                <div>
                  <p className="font-medium text-foreground">{post.author}</p>
                  <p className="text-sm text-muted-foreground">{post.authorRole}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Passionate about creating digital experiences that make a difference.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 lg:py-24 px-6 lg:px-16 border-t border-border bg-card">
            <div className="max-w-5xl mx-auto">
              <motion.h2
                {...revealInView}
                transition={revealTransition}
                className="font-display text-2xl md:text-3xl text-foreground mb-8"
              >
                Related Articles
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <Link to={`/blog/${relatedPost.id}`} key={relatedPost.id}>
                    <motion.article
                      {...revealInView}
                      transition={{ ...revealTransition, delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="overflow-hidden rounded-2xl mb-4 bg-background">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{relatedPost.date}</p>
                      <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        {relatedPost.title}
                      </h3>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
