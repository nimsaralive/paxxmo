import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const aboutCards = [
  {
    title: "Built on Strategy",
    text: "We don't start with design—we start with understanding your goals, audience, and competitive landscape.",
  },
  {
    title: "Clean, Scalable Development",
    text: "Every project is built using modern frameworks and best practices to ensure long-term maintainability.",
  },
  {
    title: "Marketing With Measurable Impact",
    text: "Our performance marketing strategies are built around ROI, not vanity metrics.",
  },
  {
    title: "Long-Term Partnership",
    text: "We see ourselves as an extension of your team—accountable, responsive, and invested in your success.",
  },
];

type StackingCardProps = {
  title: string;
  text: string;
  index: number;
};

const StackingCard = ({ title, text, index }: StackingCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start center", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div ref={cardRef} className="h-[70vh] relative">
      <motion.article
        className="sticky top-24 rounded-3xl border border-border bg-card/90 backdrop-blur-sm p-8 md:p-12 shadow-2xl"
        style={{ scale, zIndex: 20 - index }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-4">
          About Paxxmo
        </p>
        <h3 className="text-3xl md:text-4xl leading-tight text-foreground font-body font-semibold mb-4">
          {title}
        </h3>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed font-body">
          {text}
        </p>
      </motion.article>
    </div>
  );
};

const AboutStacking = () => {
  return (
    <section id="about" className="py-24 lg:py-32 px-6 lg:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground font-body font-semibold">
            About
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl font-body">
            Who we are and how we work with you to build digital products that perform.
          </p>
        </div>

        <div className="relative">
          {aboutCards.map((card, index) => (
            <StackingCard key={card.title} title={card.title} text={card.text} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStacking;