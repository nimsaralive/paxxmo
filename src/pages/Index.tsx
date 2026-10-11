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
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <>
      <SEO title="Paxxmo | Web Development, App Development & Digital Marketing Sri Lanka" description="Paxxmo is a Sri Lanka based IT company providing web development, mobile app development, digital marketing and social media marketing services for businesses and startups." />
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
