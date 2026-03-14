import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cardHover, revealInView, revealTransition, tapScale } from "@/lib/motion";

const navigationLinks = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#service" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "X (Twitter)", href: "https://x.com" },
];

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.includes("#")) return;

    const hash = href.split("#")[1];

    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }
      return;
    }

    e.preventDefault();
    navigate("/");
    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <footer className="py-20 px-6 lg:px-16 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          <motion.div
            {...revealInView}
            transition={{ ...revealTransition, duration: 0.6 }}
          >
            <img src="/paxxmo_logo_1.png" alt="Paxxmo" className="h-10 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Paxxmo – Digital Solutions That Scale.
            </p>
          </motion.div>

          <motion.div
            {...revealInView}
            transition={{ ...revealTransition, duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    whileHover={cardHover}
                    whileTap={tapScale}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            {...revealInView}
            transition={{ ...revealTransition, duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">
              Social
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    whileHover={cardHover}
                    whileTap={tapScale}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Paxxmo. All rights reserved.
          </p>
          <motion.a
            href="/#contact"
            onClick={(e) => handleLinkClick(e, "/#contact")}
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors duration-300 group"
            whileHover={cardHover}
            whileTap={tapScale}
          >
            Let's Build Together
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
