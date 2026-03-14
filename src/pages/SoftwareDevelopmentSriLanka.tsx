import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, CheckCircle, Database, Cloud, Settings, Lock, GitBranch, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Database, title: "Custom Software Development", description: "Bespoke software solutions built to your exact requirements — ERP, CRM, inventory, HR, and more." },
  { icon: Cloud, title: "Cloud-Based Solutions", description: "Scalable SaaS applications and cloud deployments on AWS, Google Cloud, and Azure for reliability and performance." },
  { icon: Settings, title: "System Integration", description: "Connect your existing tools and platforms with custom APIs and middleware for seamless data flow across your business." },
  { icon: Lock, title: "Enterprise Security", description: "Role-based access control, encrypted data storage, and audit trails built into every system we deliver." },
  { icon: GitBranch, title: "Agile Development", description: "Fortnightly sprints with working demos. You stay in control — adjust priorities as your business needs evolve." },
  { icon: LifeBuoy, title: "Long-Term Maintenance", description: "We're not a one-off vendor. Paxxmo offers SLAs, bug fixes, and feature additions as your business grows." },
];

const reasons = [
  "10+ years combined engineering experience on the team",
  "Technology-agnostic — we choose the best stack for your problem",
  "Full intellectual property ownership transferred to you",
  "Detailed technical documentation on every delivery",
  "Serving manufacturing, logistics, healthcare, and finance sectors",
  "Government and enterprise project experience",
];

const faqs = [
  { q: "What types of software do you build?", a: "We build web-based software, desktop applications, APIs, admin dashboards, ERP/CRM systems, inventory management, and custom automation tools." },
  { q: "How do you ensure software quality?", a: "We use automated testing, code reviews, staging environments, and user acceptance testing (UAT) before every release." },
  { q: "Can you take over an existing software project?", a: "Yes. We regularly take over legacy codebases, audit them, and continue development or perform a full rewrite where needed." },
  { q: "Do you sign NDAs for software projects?", a: "Always. Every project starts with an NDA to protect your business idea and confidential data." },
];

export default function SoftwareDevelopmentSriLanka() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Software Development Services Sri Lanka",
    "provider": { "@type": "Organization", "name": "Paxxmo", "url": "https://paxxmo.com" },
    "areaServed": "Sri Lanka",
    "description": "Custom software development company in Sri Lanka. ERP, CRM, SaaS, and enterprise solutions.",
    "url": "https://paxxmo.com/software-development-sri-lanka",
  };

  return (
    <>
      <Helmet>
        <title>Software Development Sri Lanka | Custom ERP, CRM & SaaS | Paxxmo</title>
        <meta name="description" content="Leading software development company in Sri Lanka. Paxxmo builds custom ERP, CRM, SaaS, and enterprise software for businesses. Agile development, NDA-protected, IP ownership transfer. Get a free consultation." />
        <meta name="keywords" content="software development Sri Lanka, custom software Sri Lanka, ERP development Sri Lanka, CRM development Sri Lanka, SaaS development Sri Lanka, enterprise software Sri Lanka, Paxxmo" />
        <meta name="author" content="Paxxmo" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://paxxmo.com/software-development-sri-lanka" />
        <meta property="og:title" content="Software Development Sri Lanka | Paxxmo" />
        <meta property="og:description" content="Custom ERP, CRM, and SaaS software development in Sri Lanka. Built by Paxxmo for Sri Lankan enterprises and startups." />
        <meta property="og:url" content="https://paxxmo.com/software-development-sri-lanka" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paxxmo.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <section className="pt-36 pb-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-primary font-medium mb-4 tracking-widest uppercase">Software Development Sri Lanka</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              Software Engineered<br />
              <span className="text-muted-foreground">for Your Business</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-10">
              Paxxmo is a custom software development company in Sri Lanka delivering enterprise-grade solutions — from SaaS platforms and ERP systems to APIs and automation tools. Built right, the first time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/85 transition-colors">
                Start Your Project <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link to="/blog" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium hover:bg-foreground/5 transition-colors">
                Tech Insights
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">What We Build</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">From internal tools to customer-facing platforms, we engineer software that solves real operational challenges and scales with your business.</p>
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
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Why Paxxmo for Software Development?</h2>
              <p className="text-muted-foreground mb-8">We've built mission-critical systems for businesses across multiple industries. Our process is rigorous, our code is clean, and our support is ongoing.</p>
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
              <p className="text-4xl font-bold text-foreground mb-1">20+</p>
              <p className="text-muted-foreground mb-6">Enterprise software systems delivered</p>
              <p className="text-4xl font-bold text-foreground mb-1">99.9%</p>
              <p className="text-muted-foreground mb-6">Uptime SLA on production systems</p>
              <p className="text-4xl font-bold text-foreground mb-1">100%</p>
              <p className="text-muted-foreground">IP ownership transferred to clients</p>
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
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Have a Software Project in Mind?</h2>
            <p className="text-muted-foreground mb-8">Talk to our engineering team. We'll assess your requirements, recommend the right technology, and give you a transparent proposal.</p>
            <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/85 transition-colors text-sm">
              Get a Free Proposal <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
