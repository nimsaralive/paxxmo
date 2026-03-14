import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import cyberpunkPerson from "@/assets/cyberpunk-person.png";
import { cardHover, revealInView, revealTransition, tapScale } from "@/lib/motion";

const services = [
  {
    title: "Web Design & Development",
    tags: ["UI/UX Design", "Frontend Development", "E-Commerce", "Custom Platforms"],
  },
  {
    title: "Mobile App Development",
    tags: ["iOS Apps", "Android Apps", "React Native", "App Strategy"],
  },
  {
    title: "Social Media Marketing",
    tags: ["Content Strategy", "Community Management", "Platform Growth"],
  },
  {
    title: "Digital Marketing",
    tags: ["SEO", "SEM/PPC", "Email Marketing", "Funnel Optimization"],
  },
  {
    title: "eBusiness Consulting",
    tags: ["Process Automation", "Tech Advisory", "Workflow Optimization"],
  },
];

const Services = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="service" className="py-24 lg:py-32 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...revealInView}
          transition={revealTransition}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            <span className="text-muted-foreground">Our</span>
            <br />
            <span className="text-foreground">Services</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-0">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                {...revealInView}
                transition={{ ...revealTransition, duration: 0.55, delay: index * 0.08 }}
                className="border-b border-border"
                whileHover={cardHover}
                whileTap={tapScale}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex items-center justify-between w-full py-6 text-left group"
                >
                  <h3 className="font-display text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pb-6">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...revealInView}
            transition={{ ...revealTransition, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <img
              src={cyberpunkPerson}
              alt="Cyberpunk person with glowing visor"
              className="w-full max-w-md h-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Services;
