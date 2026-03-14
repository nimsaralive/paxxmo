/**
 * =====================================================
 * PAXXMO BLOG POSTS DATA
 * =====================================================
 * 
 * HOW TO ADD A NEW BLOG POST:
 * 
 * 1. Add a new object to the blogPosts array below
 * 2. Follow the template structure
 * 3. Save the file - your post will appear automatically
 * 
 * TEMPLATE:
 * {
 *   id: "url-friendly-slug",      // No spaces, use hyphens
 *   image: "/blog/your-image.jpg", // Place image in public/blog/
 *   date: "Mar 5, 2026",
 *   readTime: "5 min read",
 *   title: "Your Blog Title",
 *   excerpt: "Brief description for listings (1-2 sentences)",
 *   content: `<p>Your HTML content here</p>`,
 *   tags: ["Tag1", "Tag2"],
 *   author: "Nimsara Liyanage",
 *   authorRole: "CEO & Founder",
 * }
 * 
 * CONTENT HTML TAGS YOU CAN USE:
 * - <p>Paragraph text</p>
 * - <h2>Section heading</h2>
 * - <h3>Sub-section heading</h3>
 * - <ul><li>List item</li></ul>
 * - <ol><li>Numbered list</li></ol>
 * - <strong>Bold text</strong>
 * - <em>Italic text</em>
 * - <a href="url">Link text</a>
 * - <blockquote>Quote text</blockquote>
 * 
 * =====================================================
 */

export interface BlogPost {
  id: string;
  image: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  author: string;
  authorRole: string;
}

// Default blog images (you can add more to public/blog/)
export const BLOG_IMAGES = {
  default1: "/blog/blog-1.png",
  default2: "/blog/blog-2.png",
};

/**
 * =====================================================
 * ADD YOUR BLOG POSTS BELOW
 * =====================================================
 */

export const blogPosts: BlogPost[] = [
  // ─────────────────────────────────────────────────────
  // POST 1: The Power of Branding
  // ─────────────────────────────────────────────────────
  {
    id: "power-of-branding",
    image: BLOG_IMAGES.default1,
    date: "Apr 23, 2025",
    readTime: "5 min read",
    title: "The Power of Branding: Crafting Memorable Identities",
    excerpt: "Discover how strategic branding can transform your business, create lasting impressions, and build meaningful connections with your audience.",
    content: `
      <p>In today's crowded marketplace, a strong brand identity is more crucial than ever. It's not just about having a logo or a catchy tagline—it's about creating a cohesive experience that resonates with your audience on a deeper level.</p>
      
      <h2>Why Branding Matters</h2>
      <p>Your brand is the promise you make to your customers. It tells them what they can expect from your products and services, and it differentiates your offering from your competitors.</p>
      
      <h2>Key Elements of Strong Branding</h2>
      <ul>
        <li><strong>Visual Identity:</strong> Consistent colors, typography, and imagery that represent your brand</li>
        <li><strong>Voice & Tone:</strong> How you communicate with your audience across all channels</li>
        <li><strong>Values:</strong> The principles that guide your business decisions</li>
        <li><strong>Experience:</strong> Every touchpoint a customer has with your brand</li>
      </ul>
      
      <h2>Building Your Brand Strategy</h2>
      <p>A successful brand strategy starts with understanding your target audience, defining your unique value proposition, and creating consistent messaging across all platforms.</p>
    `,
    tags: ["Branding", "Design", "Strategy"],
    author: "Nimsara Liyanage",
    authorRole: "CEO & Founder",
  },

  // ─────────────────────────────────────────────────────
  // POST 2: Powerful Illustrations
  // ─────────────────────────────────────────────────────
  {
    id: "powerful-illustrations",
    image: BLOG_IMAGES.default2,
    date: "Apr 14, 2025",
    readTime: "4 min read",
    title: "Why Powerful Illustrations Matter for Your Brand",
    excerpt: "Learn how custom illustrations can elevate your brand's visual storytelling and create unique, memorable experiences for your users.",
    content: `
      <p>In the digital age, standing out requires more than stock photos and generic graphics. Custom illustrations offer a unique way to communicate your brand's personality and values.</p>
      
      <h2>The Impact of Custom Illustrations</h2>
      <p>Illustrations can convey complex ideas simply, evoke emotions, and create a distinctive visual language that sets your brand apart from competitors.</p>
      
      <h2>Benefits of Illustration in Design</h2>
      <ul>
        <li><strong>Uniqueness:</strong> No other brand will have the same visuals</li>
        <li><strong>Flexibility:</strong> Can be adapted for any medium or context</li>
        <li><strong>Storytelling:</strong> Perfect for explaining complex concepts</li>
        <li><strong>Memorability:</strong> Creates lasting impressions</li>
      </ul>
      
      <h2>Incorporating Illustrations</h2>
      <p>From hero sections to micro-interactions, illustrations can enhance every aspect of your digital presence when used strategically.</p>
    `,
    tags: ["Illustration", "Design", "Visual Identity"],
    author: "Nimsara Liyanage",
    authorRole: "CEO & Founder",
  },

  // ─────────────────────────────────────────────────────
  // POST 3: Web Design Trends
  // ─────────────────────────────────────────────────────
  {
    id: "web-design-trends-2025",
    image: BLOG_IMAGES.default1,
    date: "Mar 28, 2025",
    readTime: "6 min read",
    title: "Web Design Trends Shaping 2025 and Beyond",
    excerpt: "Explore the cutting-edge design trends that are defining the future of web experiences, from AI-driven personalization to immersive 3D elements.",
    content: `
      <p>The web design landscape continues to evolve rapidly. Staying ahead of trends isn't just about aesthetics—it's about creating experiences that meet user expectations and business goals.</p>
      
      <h2>Top Trends for 2025</h2>
      <ul>
        <li><strong>AI-Powered Personalization:</strong> Tailored experiences based on user behavior</li>
        <li><strong>Immersive 3D Elements:</strong> WebGL and Three.js creating depth</li>
        <li><strong>Micro-Interactions:</strong> Delightful details that enhance UX</li>
        <li><strong>Dark Mode Everything:</strong> User preference controls</li>
        <li><strong>Accessibility First:</strong> Inclusive design as standard</li>
      </ul>
      
      <h2>Implementation Tips</h2>
      <p>When adopting new trends, always prioritize performance and accessibility. A beautiful site that loads slowly or excludes users defeats its purpose.</p>
    `,
    tags: ["Web Design", "Trends", "UX"],
    author: "Nimsara Liyanage",
    authorRole: "CEO & Founder",
  },

  // ─────────────────────────────────────────────────────
  // POST 4: UX Psychology
  // ─────────────────────────────────────────────────────
  {
    id: "ux-psychology",
    image: BLOG_IMAGES.default2,
    date: "Mar 15, 2025",
    readTime: "7 min read",
    title: "The Psychology Behind Great UX Design",
    excerpt: "Understanding cognitive principles and human behavior is key to creating intuitive, user-friendly digital experiences that convert.",
    content: `
      <p>Great UX design isn't just about making things look good—it's about understanding how people think, behave, and make decisions.</p>
      
      <h2>Key Psychological Principles</h2>
      <ul>
        <li><strong>Cognitive Load:</strong> Reduce mental effort required</li>
        <li><strong>Hick's Law:</strong> More choices = longer decisions</li>
        <li><strong>Fitts's Law:</strong> Size and distance affect usability</li>
        <li><strong>Visual Hierarchy:</strong> Guide attention naturally</li>
      </ul>
      
      <h2>Applying Psychology to Design</h2>
      <p>By understanding these principles, designers can create interfaces that feel intuitive and help users accomplish their goals effortlessly.</p>
    `,
    tags: ["UX", "Psychology", "Design"],
    author: "Nimsara Liyanage",
    authorRole: "CEO & Founder",
  },

  // ─────────────────────────────────────────────────────
  // POST 5: SEO Strategies
  // ─────────────────────────────────────────────────────
  {
    id: "seo-strategies-2025",
    image: BLOG_IMAGES.default1,
    date: "Mar 5, 2025",
    readTime: "8 min read",
    title: "SEO Strategies That Actually Work in 2025",
    excerpt: "Cut through the noise with proven SEO techniques that drive organic traffic and improve your search engine rankings effectively.",
    content: `
      <p>SEO continues to evolve as search engines become smarter. Here's what's actually working in 2025 to improve your organic visibility.</p>
      
      <h2>Core SEO Fundamentals</h2>
      <ul>
        <li><strong>E-E-A-T:</strong> Experience, Expertise, Authority, Trust</li>
        <li><strong>Core Web Vitals:</strong> Performance metrics matter</li>
        <li><strong>Semantic Search:</strong> Context over keywords</li>
        <li><strong>Mobile-First:</strong> Responsive is non-negotiable</li>
      </ul>
      
      <h2>Advanced Techniques</h2>
      <p>Schema markup, internal linking strategies, and content clustering continue to provide competitive advantages for those who implement them correctly.</p>
    `,
    tags: ["SEO", "Marketing", "Strategy"],
    author: "Nimsara Liyanage",
    authorRole: "CEO & Founder",
  },

  // ─────────────────────────────────────────────────────
  // POST 6: Digital Transformation
  // ─────────────────────────────────────────────────────
  {
    id: "digital-transformation",
    image: BLOG_IMAGES.default2,
    date: "Feb 20, 2025",
    readTime: "5 min read",
    title: "Digital Transformation: A Practical Guide for Businesses",
    excerpt: "Navigate the complexities of digital transformation with actionable insights and strategies for modernizing your business operations.",
    content: `
      <p>Digital transformation isn't just about technology—it's about reimagining how your business creates value in the digital age.</p>
      
      <h2>Pillars of Digital Transformation</h2>
      <ul>
        <li><strong>Customer Experience:</strong> Digital-first interactions</li>
        <li><strong>Operational Efficiency:</strong> Automation and optimization</li>
        <li><strong>Business Model Innovation:</strong> New revenue streams</li>
        <li><strong>Data-Driven Decisions:</strong> Analytics at the core</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>Start small, measure results, and scale what works. Digital transformation is a journey, not a destination.</p>
    `,
    tags: ["Digital Transformation", "Business", "Strategy"],
    author: "Nimsara Liyanage",
    authorRole: "CEO & Founder",
  },

  // ─────────────────────────────────────────────────────
  // ADD NEW POSTS BELOW THIS LINE
  // Copy the template and fill in your content
  // ─────────────────────────────────────────────────────

];

/**
 * Helper function to get a post by ID
 */
export const getPostById = (id: string): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

/**
 * Helper function to get related posts
 */
export const getRelatedPosts = (currentId: string, limit: number = 2): BlogPost[] => {
  const currentPost = getPostById(currentId);
  if (!currentPost) return [];
  
  return blogPosts
    .filter(post => post.id !== currentId && post.tags.some(tag => currentPost.tags.includes(tag)))
    .slice(0, limit);
};

/**
 * Helper function to get posts by tag
 */
export const getPostsByTag = (tag: string): BlogPost[] => {
  return blogPosts.filter(post => post.tags.includes(tag));
};

/**
 * Get all unique tags
 */
export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  blogPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags);
};
