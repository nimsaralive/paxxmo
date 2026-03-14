import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealInView, revealTransition } from "@/lib/motion";
import heroImage from "@/assets/hero-collaboration.png";

gsap.registerPlugin(ScrollTrigger);

const heroLines = [
  { text: "Build With Clarity", className: "text-muted-foreground" },
  { text: "Scale With Paxxmo", className: "text-foreground" },
];

type MaskedLineProps = {
  text: string;
  className: string;
  lineIndex: number;
};

const MaskedLine = ({ text, className, lineIndex }: MaskedLineProps) => {
  const characters = text.split("");

  return (
    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1]">
      {characters.map((char, charIndex) => (
        <span key={`${lineIndex}-${charIndex}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={`inline-block ${className}`}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              ...revealTransition,
              duration: 0.72,
              delay: 0.18 + lineIndex * 0.18 + charIndex * 0.03,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </span>
      ))}
    </h1>
  );
};

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const videoContainer = videoContainerRef.current;

    if (!section || !videoContainer) return;

    // Set initial state - small with rounded corners
    gsap.set(videoContainer, {
      scale: 0.55,
      borderRadius: "24px",
    });

    // Scroll-triggered animation: scale up and remove border radius
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.to(videoContainer, {
      scale: 1,
      borderRadius: "0px",
      ease: "none",
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="h-screen relative overflow-hidden px-6">
      {/* Header content */}
      <div className="pt-28 pb-8 text-center relative z-10">
        <div className="space-y-1">
          {heroLines.map((line, index) => (
            <MaskedLine key={line.text} text={line.text} className={line.className} lineIndex={index} />
          ))}
        </div>
      </div>

      {/* Video/Image container - positioned in center with text on sides */}
      <div className="relative w-full max-w-7xl mx-auto flex items-start justify-between gap-6 px-4">
        {/* Left text */}
        <motion.p
          {...revealInView}
          transition={{ ...revealTransition, duration: 0.65, delay: 0.6 }}
          className="text-base md:text-lg max-w-xs text-muted-foreground leading-relaxed flex-shrink-0 pt-4 hidden md:block"
        >
          Paxxmo is a full-service IT and digital solutions partner helping businesses build powerful web, app, and marketing systems that scale.
        </motion.p>

        {/* Center video/image container */}
        <div
          ref={videoContainerRef}
          className="flex-1 max-w-xl mx-auto overflow-hidden bg-card"
          style={{ willChange: "transform, border-radius" }}
        >
          <img
            src={heroImage}
            alt="Business professionals collaborating"
            className="w-full aspect-[4/3] object-cover"
          />
        </div>


      </div>

      {/* Mobile text - shown below video on small screens */}
      <div className="md:hidden w-full max-w-6xl mx-auto mt-8 flex flex-col gap-6 px-4">
        <motion.p
          {...revealInView}
          transition={{ ...revealTransition, duration: 0.65, delay: 0.6 }}
          className="text-base text-muted-foreground leading-relaxed"
        >
          Paxxmo is a full-service IT and digital solutions partner helping businesses build powerful web, app, and marketing systems that scale.
        </motion.p>


      </div>
    </section>
  );
};

export default Hero;
