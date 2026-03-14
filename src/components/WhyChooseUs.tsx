import { motion } from "framer-motion";
import { cardHover, revealInView, revealTransition, tapScale } from "@/lib/motion";

const reasons = [
  {
    title: "Strategy-Driven Execution",
    description:
      "Every project starts with understanding your market, audience, and goals. No fluff, no wasted effort.",
  },
  {
    title: "Design That Performs",
    description:
      "Our UI/UX work isn't just beautiful—it's built to convert and retain.",
  },
  {
    title: "Reliable & Scalable Systems",
    description:
      "We build clean codebases that scale as you grow—no technical debt.",
  },
  {
    title: "Clear Communication",
    description:
      "We keep you in the loop at every stage. No black box. No surprises.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="why-us" className="py-24 lg:py-32 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...revealInView}
          transition={revealTransition}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            <span className="text-muted-foreground">Why</span>
            <br />
            <span className="text-foreground">Choose Us</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              {...revealInView}
              transition={{ ...revealTransition, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500"
              whileHover={cardHover}
              whileTap={tapScale}
            >
              <h3 className="font-display text-xl md:text-2xl text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
