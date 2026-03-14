import { motion } from "framer-motion";
import { 
  Monitor, 
  ShoppingCart, 
  Warehouse, 
  Users, 
  BarChart3, 
  CreditCard,
  Package,
  FileText,
  ArrowRight
} from "lucide-react";
import { cardHover, revealInView, revealTransition, staggerContainer, staggerItem, tapScale } from "@/lib/motion";

const solutions = [
  {
    icon: ShoppingCart,
    title: "POS System",
    description: "Complete point-of-sale solution for retail stores, restaurants, and service businesses with inventory tracking and sales analytics.",
    features: ["Real-time Sales Tracking", "Inventory Management", "Multi-location Support", "Offline Mode"],
  },
  {
    icon: Warehouse,
    title: "Inventory Management",
    description: "Track stock levels, manage suppliers, and automate reordering with our intelligent inventory management system.",
    features: ["Stock Alerts", "Barcode Scanning", "Purchase Orders", "Stock Reports"],
  },
  {
    icon: Users,
    title: "CRM System",
    description: "Build stronger customer relationships with our comprehensive customer relationship management solution.",
    features: ["Contact Management", "Sales Pipeline", "Email Integration", "Customer Analytics"],
  },
  {
    icon: BarChart3,
    title: "ERP Solutions",
    description: "Integrate all your business processes into one unified system for better efficiency and decision-making.",
    features: ["Financial Management", "HR Module", "Supply Chain", "Business Intelligence"],
  },
  {
    icon: CreditCard,
    title: "Billing & Invoicing",
    description: "Streamline your billing process with automated invoicing, payment tracking, and financial reporting.",
    features: ["Auto Invoicing", "Payment Gateway", "Tax Management", "Multi-currency"],
  },
  {
    icon: Package,
    title: "Order Management",
    description: "Manage orders from multiple channels in one place with real-time tracking and fulfillment automation.",
    features: ["Multi-channel Orders", "Shipment Tracking", "Returns Management", "Order Analytics"],
  },
];

const SoftwareSolutions = () => {
  return (
    <section id="solutions" className="py-24 lg:py-32 px-6 lg:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          {...revealInView}
          transition={revealTransition}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Monitor className="w-4 h-4" />
            Software Solutions
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-muted-foreground">Enterprise</span>{" "}
            <span className="text-foreground">Software Solutions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful, scalable software systems designed to streamline your business operations and drive growth. From POS to ERP, we've got you covered.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              variants={staggerItem}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors"
              whileHover={cardHover}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <solution.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl text-foreground mb-3">
                {solution.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {solution.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {solution.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById("contact");
                  if (element) {
                    const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: offsetTop, behavior: "smooth" });
                  }
                }}
                className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                whileTap={tapScale}
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          {...revealInView}
          transition={{ ...revealTransition, delay: 0.3 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl bg-card border border-border">
            <div className="text-left">
              <h3 className="font-display text-xl text-foreground mb-1">
                Need a Custom Solution?
              </h3>
              <p className="text-muted-foreground text-sm">
                We build tailored software systems to match your unique business requirements.
              </p>
            </div>
            <motion.a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("contact");
                if (element) {
                  const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: offsetTop, behavior: "smooth" });
                }
              }}
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={tapScale}
            >
              Get a Quote
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SoftwareSolutions;
