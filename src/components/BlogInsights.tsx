import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogStore } from "@/stores/blogStore";
import { cardHover, revealInView, revealTransition, tapScale } from "@/lib/motion";

const BlogInsights = () => {
  const { getPublishedPosts, fetchPosts } = useBlogStore();
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Get the 2 most recent published posts for the homepage
  const posts = getPublishedPosts().slice(0, 2);

  return (
    <section id="blog" className="py-24 lg:py-32 px-6 lg:px-16 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...revealInView}
          transition={revealTransition}
          className="mb-16 flex items-end justify-between"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            <span className="text-muted-foreground">Latest</span>
            <br />
            <span className="text-foreground">Insights & Updates</span>
          </h2>
          <Link
            to="/blog"
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View All Articles
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, index) => (
            <Link to={`/blog/${post.id}`} key={post.id}>
              <motion.article
                {...revealInView}
                transition={{ ...revealTransition, delay: index * 0.1 }}
                className="group block"
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
                <p className="text-xs text-muted-foreground mb-2">{post.date}</p>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex-shrink-0 mt-1" />
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

        <Link
          to="/blog"
          className="md:hidden flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View All Articles
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default BlogInsights;
