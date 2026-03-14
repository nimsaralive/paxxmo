import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cardHover, revealInView, revealTransition, tapScale } from "@/lib/motion";

const testimonials = [
  {
    quote:
      "Bold ideas deserve powerful execution. Paxxmo designs and builds digital experiences that help brands grow and lead.",
    name: "Nimsara Liyanage",
    role: "CEO & Founder",
    avatar: "/nimsara-liyanage.jpg",
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <motion.section className="py-24 lg:py-32 px-6 lg:px-16 border-y border-border" {...revealInView} transition={revealTransition}>
      <div className="max-w-4xl mx-auto">
        <div className="relative min-h-[280px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ ...revealTransition, duration: 0.45 }}
              className="w-full text-center"
            >
              <blockquote className="font-display text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed mb-8 italic">
                "{testimonials[current].quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[current].avatar}
                  alt={testimonials[current].name}
                  className="w-14 h-14 rounded-full object-cover object-top border-2 border-primary/30"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{testimonials[current].name}</p>
                  <p className="text-xs text-muted-foreground">{testimonials[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-10">
          <motion.button
            onClick={prev}
            className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-300"
            whileHover={cardHover}
            whileTap={tapScale}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-primary w-6" : "bg-muted-foreground/30"
                  }`}
              />
            ))}
          </div>
          <motion.button
            onClick={next}
            className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-300"
            whileHover={cardHover}
            whileTap={tapScale}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
