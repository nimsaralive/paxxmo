import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Clock, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useBlogStore } from "@/stores/blogStore";
import { cardHover, revealInView, revealTransition, tapScale } from "@/lib/motion";
import { Helmet } from "react-helmet-async";

const Blog = () => {
  const { getPublishedPosts, fetchPosts, isLoading, error } = useBlogStore();
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const blogPosts = getPublishedPosts();
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Paxxmo Blog",
    "description": "Insights on design, development, and digital marketing from Paxxmo",
    "url": "https://paxxmo.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Paxxmo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://paxxmo.com/logo.png"
      }
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Paxxmo Blog | Web Development, Digital Marketing & IT Services Sri Lanka</title>
        <meta name="description" content="Insights, tips, and news on web development, app development, digital marketing, and IT services in Sri Lanka from Paxxmo." />
        <meta name="keywords" content="web development Sri Lanka, digital marketing Sri Lanka, IT services Sri Lanka, Paxxmo blog, software company Sri Lanka" />
        <meta name="author" content="Paxxmo" />
        <meta property="og:title" content="Paxxmo Blog | Web Development, Digital Marketing & IT Services Sri Lanka" />
        <meta property="og:description" content="Insights, tips, and news on web development, app development, digital marketing, and IT services in Sri Lanka from Paxxmo." />
        <meta property="og:url" content="https://paxxmo.com/blog" />
        <meta property="og:type" content="blog" />
        <meta property="og:image" content="https://paxxmo.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Paxxmo Blog | Web Development, Digital Marketing & IT Services Sri Lanka" />
        <meta name="twitter:description" content="Insights, tips, and news on web development, app development, digital marketing, and IT services in Sri Lanka from Paxxmo." />
        <meta name="twitter:image" content="https://paxxmo.com/logo.png" />
      </Helmet>
      <SEO
        title="Blog - Insights & Updates"
        description="Stay updated with the latest insights on web design, branding, UX, SEO, and digital transformation from Paxxmo's expert team."
        keywords="web design blog, branding tips, UX design, SEO strategies, digital marketing insights, Paxxmo blog"
        ogType="blog"
        canonicalUrl="https://paxxmo.com/blog"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 px-6 lg:px-16 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <motion.div {...revealInView} transition={revealTransition}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mb-6">
                <span className="text-muted-foreground">Latest</span>
                <br />
                <span className="text-foreground">Insights & Updates</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Discover our latest thoughts on design, development, branding, and digital strategy. 
                We share practical insights to help you grow your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <section className="py-24 lg:py-32 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading articles...</p>
              </div>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <section className="py-24 lg:py-32 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => fetchPosts()}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && !error && blogPosts.length === 0 && (
          <section className="py-24 lg:py-32 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
            </div>
          </section>
        )}

        {/* Featured Post */}
        {!isLoading && !error && featuredPost && (
          <section className="py-16 lg:py-24 px-6 lg:px-16 border-b border-border">
            <div className="max-w-7xl mx-auto">
              <motion.div {...revealInView} transition={revealTransition}>
                <span className="text-sm text-primary font-medium mb-4 block">Featured Article</span>
              </motion.div>
              
              <Link to={`/blog/${featuredPost.id}`}>
                <motion.article
                  {...revealInView}
                  transition={{ ...revealTransition, delay: 0.1 }}
                  className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
                  whileHover={cardHover}
                >
                  <div className="overflow-hidden rounded-2xl bg-card">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl text-foreground group-hover:text-primary transition-colors duration-300 mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              </Link>
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        {!isLoading && !error && otherPosts.length > 0 && (
        <section className="py-16 lg:py-24 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              {...revealInView} 
              transition={revealTransition}
              className="font-display text-3xl md:text-4xl text-foreground mb-12"
            >
              All Articles
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map((post, index) => (
                <Link to={`/blog/${post.id}`} key={post.id}>
                  <motion.article
                    {...revealInView}
                    transition={{ ...revealTransition, delay: index * 0.1 }}
                    className="group"
                    whileHover={cardHover}
                    whileTap={tapScale}
                  >
                    <div className="overflow-hidden rounded-2xl mb-4 bg-card">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        {post.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Newsletter CTA */}
        <section className="py-16 lg:py-24 px-6 lg:px-16 border-t border-border bg-card">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...revealInView} transition={revealTransition}>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Stay in the Loop
              </h2>
              <p className="text-muted-foreground mb-8">
                Subscribe to our newsletter for the latest insights, tips, and updates delivered straight to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <motion.button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
