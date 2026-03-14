import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, CheckCircle, Code, Layers, Zap, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Code, title: "Custom-Built Websites", description: "Every site is purpose-built for your business — no generic templates. We code clean, scalable, and maintainable solutions." },
  { icon: Zap, title: "Fast & Optimised", description: "Lightning-fast load times with Core Web Vitals in mind. Our sites score high on Google PageSpeed for better SEO and UX." },
  { icon: Globe, title: "Mobile-First Design", description: "Every website we build is fully responsive across all screen sizes — phones, tablets, and desktops." },
  { icon: Shield, title: "Secure & Reliable", description: "SSL, secure hosting guidance, and best-practice code ensure your website is safe for your customers and your business." },
  { icon: Layers, title: "Full-Stack Capability", description: "From simple landing pages to complex web apps, we handle front-end, back-end, databases, and API integrations." },
  { icon: CheckCircle, title: "Ongoing Support", description: "We don't disappear after launch. Paxxmo offers maintenance, updates, and support to keep your site running smoothly." },
];

const reasons = [
  "Sri Lanka's fastest-growing IT company trusted by startups and SMEs",
  "Transparent pricing — no hidden costs",
  "Agile development with weekly progress updates",
  "Experienced team with international project exposure",
  "SEO-ready code from day one",
  "Post-launch training and documentation included",
];

const faqs = [
  { q: "How long does a website take to build?", a: "A standard business website typically takes 2–4 weeks. E-commerce and custom web apps can take 6–12 weeks depending on scope." },
  { q: "Do you build e-commerce websites in Sri Lanka?", a: "Yes. We build Shopify stores, WooCommerce sites, and fully custom e-commerce solutions integrated with local payment gateways like PayHere." },
  { q: "How much does web development cost in Sri Lanka?", a: "Prices vary based on requirements. A starter business website begins from LKR 35,000. Contact us for a free quote." },
  { q: "Will my website be optimised for Google?", a: "Absolutely. All our sites are built with SEO best practices: semantic HTML, fast loading, mobile responsiveness, and clean URL structures." },
];

export default function WebDevelopmentSriLanka() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web Development Services Sri Lanka",
    "provider": { "@type": "Organization", "name": "Paxxmo", "url": "https://paxxmo.com" },
    "areaServed": "Sri Lanka",
    "description": "Professional web development services in Sri Lanka. Custom websites, web apps, and e-commerce solutions.",
    "url": "https://paxxmo.com/web-development-sri-lanka",
  };

  return (
    <>
      <Helmet>
        <title>Web Development Sri Lanka | Custom Websites & Web Apps | Paxxmo</title>
        <meta name="description" content="Looking for the best web development company in Sri Lanka? Paxxmo builds fast, SEO-ready, mobile-first websites and web applications for businesses and startups. Get a free quote today." />
        <meta name="keywords" content="web development Sri Lanka, website development company Sri Lanka, custom website Sri Lanka, web design Colombo, affordable website Sri Lanka, ecommerce website Sri Lanka, Paxxmo" />
        <meta name="author" content="Paxxmo" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://paxxmo.com/web-development-sri-lanka" />
        <meta property="og:title" content="Web Development Sri Lanka | Paxxmo" />
        <meta property="og:description" content="Professional web development services in Sri Lanka. Custom sites, web apps & e-commerce solutions built by Paxxmo." />
        <meta property="og:url" content="https://paxxmo.com/web-development-sri-lanka" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paxxmo.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Web Development Sri Lanka | Paxxmo" />
        <meta name="twitter:description" content="Professional web development services in Sri Lanka. Custom sites, web apps & e-commerce solutions." />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="pt-36 pb-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-primary font-medium mb-4 tracking-widest uppercase">Web Development Sri Lanka</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              Websites That Work<br />
              <span className="text-muted-foreground">as Hard as You Do</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-10">
              Paxxmo builds custom, high-performance websites and web applications for businesses and startups across Sri Lanka. From landing pages to full-scale web platforms — we deliver digital excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/85 transition-colors">
                Get a Free Quote <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link to="/blog" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium hover:bg-foreground/5 transition-colors">
                See Our Work
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Why a Great Website Matters</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">In today's digital-first world, your website is your most powerful sales tool — available 24/7. We make sure it works for you.</p>
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

        {/* Why Paxxmo */}
        <section className="py-20 px-6 lg:px-16 border-b border-border bg-card">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Why Choose Paxxmo for Web Development?</h2>
              <p className="text-muted-foreground mb-8">We're not just developers — we're business partners. Paxxmo understands the Sri Lankan market and global standards, giving your business the digital edge it needs.</p>
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
              <p className="text-4xl font-bold text-foreground mb-1">50+</p>
              <p className="text-muted-foreground mb-6">Projects delivered across Sri Lanka</p>
              <p className="text-4xl font-bold text-foreground mb-1">98%</p>
              <p className="text-muted-foreground mb-6">Client satisfaction rate</p>
              <p className="text-4xl font-bold text-foreground mb-1">&lt;2s</p>
              <p className="text-muted-foreground">Average page load time on our builds</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
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

        {/* CTA */}
        <section className="py-20 px-6 lg:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Ready to Build Your Website?</h2>
            <p className="text-muted-foreground mb-8">Contact Paxxmo today for a free consultation and quote. We'll help you launch a website that drives real results.</p>
            <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/85 transition-colors text-sm">
              Start Your Project <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
