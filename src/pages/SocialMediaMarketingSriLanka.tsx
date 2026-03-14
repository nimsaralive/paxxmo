import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, CheckCircle, Instagram, Facebook, Youtube, MessageSquare, TrendingUp, Camera } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Instagram, title: "Instagram & Facebook Management", description: "Consistent, on-brand content creation and posting schedules that grow your following and engagement." },
  { icon: TrendingUp, title: "Paid Social Advertising", description: "Targeted Facebook and Instagram ad campaigns that reach your ideal customers and drive conversions." },
  { icon: Youtube, title: "YouTube & TikTok Strategy", description: "Short-form and long-form video strategies to capture attention on the fastest-growing platforms." },
  { icon: Camera, title: "Content Creation", description: "Graphic design, video editing, and copywriting tailored to each platform's format and audience." },
  { icon: MessageSquare, title: "Community Management", description: "Timely responses to comments, DMs, and reviews. We keep your audience engaged and your brand reputation strong." },
  { icon: CheckCircle, title: "Monthly Analytics Reports", description: "Clear reports showing reach, engagement, follower growth, and ad performance so you always know your ROI." },
];

const reasons = [
  "Platform-certified social media specialists",
  "Content calendars planned 30 days in advance",
  "Crisis management and reputation monitoring included",
  "Bilingual content support (English & Sinhala)",
  "Serving hospitality, retail, healthcare, and e-commerce",
  "Consistent brand voice across all platforms",
];

const faqs = [
  { q: "Which social media platforms do you manage?", a: "We manage Facebook, Instagram, YouTube, TikTok, LinkedIn, and Twitter/X. We'll recommend the right mix based on your target audience." },
  { q: "How many posts per week do you create?", a: "Our standard packages include 3–7 posts per week depending on the platform and plan. Custom packages are available." },
  { q: "Do you create the content (graphics and captions)?", a: "Yes. Everything is handled in-house — graphic design, video editing, caption writing, and hashtag research." },
  { q: "Can you run paid ads alongside organic posts?", a: "Absolutely. We offer integrated organic + paid social management for maximum impact and reach." },
];

export default function SocialMediaMarketingSriLanka() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Social Media Marketing Services Sri Lanka",
    "provider": { "@type": "Organization", "name": "Paxxmo", "url": "https://paxxmo.com" },
    "areaServed": "Sri Lanka",
    "description": "Professional social media marketing services in Sri Lanka for Facebook, Instagram, YouTube and TikTok.",
    "url": "https://paxxmo.com/social-media-marketing-sri-lanka",
  };

  return (
    <>
      <Helmet>
        <title>Social Media Marketing Sri Lanka | Facebook, Instagram & TikTok | Paxxmo</title>
        <meta name="description" content="Top social media marketing agency in Sri Lanka. Paxxmo manages Facebook, Instagram, TikTok and YouTube for Sri Lankan businesses. Content creation, paid ads, and community management. Get a free quote." />
        <meta name="keywords" content="social media marketing Sri Lanka, Facebook marketing Sri Lanka, Instagram marketing Sri Lanka, social media agency Colombo, TikTok marketing Sri Lanka, Paxxmo" />
        <meta name="author" content="Paxxmo" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://paxxmo.com/social-media-marketing-sri-lanka" />
        <meta property="og:title" content="Social Media Marketing Sri Lanka | Paxxmo" />
        <meta property="og:description" content="Expert social media management and paid advertising for Sri Lankan businesses. Facebook, Instagram, TikTok and more." />
        <meta property="og:url" content="https://paxxmo.com/social-media-marketing-sri-lanka" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paxxmo.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <section className="pt-36 pb-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-primary font-medium mb-4 tracking-widest uppercase">Social Media Marketing Sri Lanka</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              Social Media That<br />
              <span className="text-muted-foreground">Builds Real Brands</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-10">
              Paxxmo manages your social media presence end-to-end — strategy, content, ads, and analytics. We grow your following, boost engagement, and convert followers into customers across Sri Lanka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/85 transition-colors">
                Get a Free Audit <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link to="/blog" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium hover:bg-foreground/5 transition-colors">
                Social Media Tips
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">What's Included</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">From content creation to paid campaigns, we handle every aspect of your social presence so you can focus on running your business.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((b) => (
                <div key={b.title} className="p-6 rounded-2xl border border-border bg-card">
                  <b.icon className="w-6 h-6 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16 border-b border-border bg-card">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Why Paxxmo for Social Media?</h2>
              <p className="text-muted-foreground mb-8">We don't just post — we build communities. Our social media strategies are rooted in audience insights and aligned with your business goals.</p>
              <ul className="space-y-3">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-background p-8">
              <p className="text-4xl font-bold text-foreground mb-1">200%</p>
              <p className="text-muted-foreground mb-6">Average engagement increase in 3 months</p>
              <p className="text-4xl font-bold text-foreground mb-1">5+ Platforms</p>
              <p className="text-muted-foreground mb-6">Managed simultaneously for clients</p>
              <p className="text-4xl font-bold text-foreground mb-1">24hr</p>
              <p className="text-muted-foreground">Response time for community management</p>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-b border-border pb-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Let's Grow Your Social Presence</h2>
            <p className="text-muted-foreground mb-8">Get a free social media audit today. We'll analyse your current accounts and give you a roadmap to grow faster.</p>
            <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/85 transition-colors text-sm">
              Get Free Social Audit <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
