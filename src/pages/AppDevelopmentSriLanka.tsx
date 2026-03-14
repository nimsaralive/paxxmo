import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, CheckCircle, Smartphone, Cpu, RefreshCw, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Smartphone, title: "iOS & Android", description: "We build native and cross-platform apps for both iOS and Android — one codebase, maximum reach." },
  { icon: Cpu, title: "High Performance", description: "Smooth 60fps experiences and offline capability. Apps built for real-world Sri Lankan network conditions." },
  { icon: RefreshCw, title: "API & Backend Integration", description: "Seamless integration with REST APIs, payment gateways (PayHere, Stripe), and third-party services." },
  { icon: Star, title: "Beautiful UI/UX", description: "Intuitive, engaging interfaces that users love — designed to reduce churn and increase retention." },
  { icon: Users, title: "User Testing & QA", description: "Rigorous testing across real devices before launch so you ship with confidence." },
  { icon: CheckCircle, title: "App Store Submission", description: "We handle Google Play and Apple App Store submission, review compliance, and post-launch updates." },
];

const reasons = [
  "Experienced in Flutter, React Native, and Swift/Kotlin",
  "Deep understanding of Sri Lankan user behaviour",
  "Agile sprints with fortnightly demos",
  "Full NDA protection and IP ownership transfer",
  "Scalable architecture — ready to grow with your business",
  "Dedicated project manager throughout development",
];

const faqs = [
  { q: "How much does app development cost in Sri Lanka?", a: "Simple apps start from LKR 75,000. Feature-rich apps with custom backends typically range from LKR 200,000–600,000+. Contact us for a detailed estimate." },
  { q: "How long does it take to build a mobile app?", a: "A basic app takes 6–10 weeks. Complex apps with custom backends and admin panels can take 3–6 months." },
  { q: "Do you build apps for both Android and iPhone?", a: "Yes. We use cross-platform frameworks like Flutter and React Native to deliver apps on both platforms efficiently." },
  { q: "Can you integrate local payment gateways?", a: "Absolutely. We integrate PayHere, iPay, and international gateways like Stripe and Razorpay." },
];

export default function AppDevelopmentSriLanka() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mobile App Development Services Sri Lanka",
    "provider": { "@type": "Organization", "name": "Paxxmo", "url": "https://paxxmo.com" },
    "areaServed": "Sri Lanka",
    "description": "Professional mobile app development services in Sri Lanka for iOS and Android.",
    "url": "https://paxxmo.com/app-development-sri-lanka",
  };

  return (
    <>
      <Helmet>
        <title>Mobile App Development Sri Lanka | iOS & Android Apps | Paxxmo</title>
        <meta name="description" content="Top mobile app development company in Sri Lanka. Paxxmo builds custom iOS and Android apps for startups and businesses. Flutter, React Native, and native development. Get a free quote." />
        <meta name="keywords" content="mobile app development Sri Lanka, iOS app development Sri Lanka, Android app development Sri Lanka, Flutter app Sri Lanka, custom app development, Paxxmo" />
        <meta name="author" content="Paxxmo" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://paxxmo.com/app-development-sri-lanka" />
        <meta property="og:title" content="Mobile App Development Sri Lanka | Paxxmo" />
        <meta property="og:description" content="Custom iOS and Android app development in Sri Lanka. Built by Paxxmo for startups and businesses." />
        <meta property="og:url" content="https://paxxmo.com/app-development-sri-lanka" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paxxmo.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <section className="pt-36 pb-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-primary font-medium mb-4 tracking-widest uppercase">App Development Sri Lanka</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              Mobile Apps Built<br />
              <span className="text-muted-foreground">for Real Results</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-10">
              From concept to App Store — Paxxmo builds high-quality iOS and Android mobile applications for Sri Lankan businesses and startups. We turn your idea into a polished product users love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/85 transition-colors">
                Get a Free Quote <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link to="/blog" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium hover:bg-foreground/5 transition-colors">
                Read Our Blog
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">What We Deliver</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">Every app we build is engineered for performance, security, and a great user experience — from first tap to loyal user.</p>
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
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Why Paxxmo for App Development?</h2>
              <p className="text-muted-foreground mb-8">We combine technical expertise with business understanding to build apps that don't just work — they grow your business.</p>
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
              <p className="text-4xl font-bold text-foreground mb-1">30+</p>
              <p className="text-muted-foreground mb-6">Apps shipped to production</p>
              <p className="text-4xl font-bold text-foreground mb-1">4.7★</p>
              <p className="text-muted-foreground mb-6">Average app store rating</p>
              <p className="text-4xl font-bold text-foreground mb-1">2 Platforms</p>
              <p className="text-muted-foreground">iOS & Android from a single codebase</p>
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
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Have an App Idea?</h2>
            <p className="text-muted-foreground mb-8">Tell us about your project. We offer a free discovery call to understand your goals and recommend the best approach.</p>
            <a href="/#contact" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/85 transition-colors text-sm">
              Let's Build It <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
