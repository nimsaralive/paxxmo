import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, CheckCircle, TrendingUp, Search, Mail, BarChart2, Target, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Search, title: "SEO (Search Engine Optimization)", description: "Rank higher on Google for your target keywords. We build a data-driven SEO strategy that drives sustained organic traffic." },
  { icon: TrendingUp, title: "Google & Facebook Ads", description: "Paid advertising campaigns managed by certified experts. Get maximum ROI from every rupee you spend." },
  { icon: Mail, title: "Email Marketing", description: "Convert leads into loyal customers with targeted email campaigns, automation flows, and personalised messaging." },
  { icon: BarChart2, title: "Analytics & Reporting", description: "Monthly performance reports with clear KPIs. Know exactly how your marketing budget is working for you." },
  { icon: Target, title: "Conversion Rate Optimisation", description: "We analyse user behaviour and optimise your website and funnels to turn more visitors into paying customers." },
  { icon: Globe, title: "Content Marketing", description: "Blog posts, videos, and infographics that educate your audience, build trust, and improve search rankings." },
];

const reasons = [
  "Google-certified digital marketing professionals",
  "Strategies tailored to Sri Lankan consumer behaviour",
  "Transparent monthly reporting — no fluff, just results",
  "Serving businesses in Colombo, Kandy, Galle, and beyond",
  "Combined SEO + Ads + Social for maximum digital presence",
  "Proven track record in e-commerce, hospitality, and B2B sectors",
];

const faqs = [
  { q: "How long before I see results from digital marketing?", a: "SEO results typically take 3–6 months. Paid ads (Google/Facebook) deliver results within the first few weeks of launch." },
  { q: "What is your minimum monthly budget for ads?", a: "We recommend a minimum ad spend of LKR 30,000/month for Google Ads and LKR 20,000/month for Facebook/Instagram Ads to see meaningful results." },
  { q: "Do you offer digital marketing packages for small businesses?", a: "Yes. Our starter packages are designed specifically for small and medium businesses in Sri Lanka with limited marketing budgets." },
  { q: "Can you manage our Google and Facebook ads together?", a: "Absolutely. We offer integrated campaign management across Google, Facebook, Instagram, and YouTube." },
];

export default function DigitalMarketingSriLanka() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Digital Marketing Services Sri Lanka",
    "provider": { "@type": "Organization", "name": "Paxxmo", "url": "https://paxxmo.com" },
    "areaServed": "Sri Lanka",
    "description": "Professional digital marketing agency in Sri Lanka offering SEO, Google Ads, Facebook Ads, and content marketing.",
    "url": "https://paxxmo.com/digital-marketing-sri-lanka",
  };

  return (
    <>
      <Helmet>
        <title>Digital Marketing Sri Lanka | SEO, Google Ads & Social Media | Paxxmo</title>
        <meta name="description" content="Best digital marketing agency in Sri Lanka. Paxxmo offers SEO, Google Ads, Facebook Ads, email marketing and content marketing services for Sri Lankan businesses. Get measurable results." />
        <meta name="keywords" content="digital marketing Sri Lanka, digital marketing agency Sri Lanka, SEO Sri Lanka, Google Ads Sri Lanka, Facebook Ads Sri Lanka, online marketing Sri Lanka, Paxxmo" />
        <meta name="author" content="Paxxmo" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://paxxmo.com/digital-marketing-sri-lanka" />
        <meta property="og:title" content="Digital Marketing Sri Lanka | Paxxmo" />
        <meta property="og:description" content="SEO, Google Ads, Facebook Ads and content marketing services in Sri Lanka. Drive real results with Paxxmo." />
        <meta property="og:url" content="https://paxxmo.com/digital-marketing-sri-lanka" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paxxmo.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <section className="pt-36 pb-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-primary font-medium mb-4 tracking-widest uppercase">Digital Marketing Sri Lanka</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              Grow Your Business<br />
              <span className="text-muted-foreground">Online — Predictably</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-10">
              Paxxmo is a results-driven digital marketing agency in Sri Lanka. We combine SEO, paid ads, and content strategy to grow your online visibility and revenue — not just vanity metrics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/85 transition-colors">
                Get a Free Strategy Call <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link to="/blog" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium hover:bg-foreground/5 transition-colors">
                Marketing Insights
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Our Digital Marketing Services</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">We offer a full digital marketing suite — from search to social — designed to bring the right customers to your business.</p>
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
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Why Paxxmo for Digital Marketing?</h2>
              <p className="text-muted-foreground mb-8">We focus on real business outcomes — more leads, more sales, lower customer acquisition costs. Every strategy is backed by data, not guesswork.</p>
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
              <p className="text-4xl font-bold text-foreground mb-1">3x</p>
              <p className="text-muted-foreground mb-6">Average ROI increase for our clients</p>
              <p className="text-4xl font-bold text-foreground mb-1">Top 3</p>
              <p className="text-muted-foreground mb-6">Google rankings achieved for client keywords</p>
              <p className="text-4xl font-bold text-foreground mb-1">40+</p>
              <p className="text-muted-foreground">Businesses grown across Sri Lanka</p>
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
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Ready to Grow Online?</h2>
            <p className="text-muted-foreground mb-8">Book a free strategy session with our digital marketing team. We'll audit your current presence and show you exactly how to improve it.</p>
            <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/85 transition-colors text-sm">
              Book Free Strategy Call <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
