import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutStacking from "@/components/AboutStacking";
// import LogoMarquee from "@/components/LogoMarquee";
import Services from "@/components/Services";
import SoftwareSolutions from "@/components/SoftwareSolutions";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import BlogInsights from "@/components/BlogInsights";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Paxxmo | Web Development, App Development & Digital Marketing Sri Lanka</title>
        <meta name="description" content="Paxxmo is a Sri Lanka based IT company providing web development, mobile app development, digital marketing and social media marketing services for businesses and startups." />
        <meta name="keywords" content="Paxxmo, IT services Sri Lanka, web development Sri Lanka, app development Sri Lanka, digital marketing Sri Lanka, social media marketing Sri Lanka, software development Sri Lanka, web design Colombo" />
        <meta name="author" content="Paxxmo" />
        <meta property="og:title" content="Paxxmo IT Solutions Sri Lanka" />
        <meta property="og:description" content="All-in-one IT services including web development, app development and digital marketing." />
        <meta property="og:url" content="https://paxxmo.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paxxmo.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Paxxmo IT Solutions Sri Lanka" />
        <meta name="twitter:description" content="All-in-one IT services including web development, app development and digital marketing." />
        <meta name="twitter:image" content="https://paxxmo.com/logo.png" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <AboutStacking />
        {/* <LogoMarquee /> removed as requested */}
        <Services />
        <SoftwareSolutions />
        <WhyChooseUs />
        <Testimonials />
        <BlogInsights />
        <Contact />
        <Footer />
      </div>
    </>
  );
};

export default Index;
