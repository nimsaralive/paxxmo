import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cardHover, revealTransition, tapScale } from "@/lib/motion";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#service" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false);

    // If it's a hash link
    if (href.includes("#")) {
      const hash = href.split("#")[1];

      if (isHomePage) {
        // On homepage, just scroll to the section
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          // Use scrollTo instead of scrollIntoView for Lenis compatibility
          const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      } else {
        // On other pages, navigate to homepage with hash
        e.preventDefault();
        navigate("/");
        // Wait for navigation then scroll
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offsetTop, behavior: "smooth" });
          }
        }, 100);
      }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...revealTransition, duration: 0.55 }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-4 transition-all duration-500 ${scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-background/60 backdrop-blur-sm"
          }`}
      >
        {/* Logo */}
        <motion.div whileHover={cardHover} whileTap={tapScale}>
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/paxxmo_logo_1.png" alt="Paxxmo" className="h-8 w-auto" />
          </Link>
        </motion.div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...revealTransition, duration: 0.45, delay: 0.08 * i }}
              className="relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 px-3 py-2 rounded-md hover:bg-foreground/5 group"
              whileTap={tapScale}
            >
              {link.label}
              <span className="absolute inset-x-3 bottom-1.5 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.a>
          ))}
        </div>

        {/* Desktop CTA */}
        <motion.a
          href="/#contact"
          onClick={(e) => handleLinkClick(e, "/#contact")}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...revealTransition, duration: 0.45, delay: 0.45 }}
          className="hidden md:flex items-center gap-1.5 text-sm font-medium bg-foreground text-background hover:bg-foreground/85 transition-colors duration-300 px-4 py-2 rounded-full group"
          whileHover={{ scale: 1.03 }}
          whileTap={tapScale}
        >
          Start a Project
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </motion.a>

        {/* Mobile hamburger */}
        <motion.button
          className="md:hidden p-2 rounded-md text-foreground hover:bg-foreground/5 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          whileTap={tapScale}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-card border-l border-border shadow-2xl md:hidden flex flex-col pt-20 pb-8 px-6"
            >
              <nav className="flex flex-col gap-1 flex-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.3 }}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200 py-3 border-b border-border/50 last:border-0"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <motion.a
                href="/#contact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                onClick={(e) => handleLinkClick(e, "/#contact")}
                className="flex items-center justify-center gap-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/85 transition-colors duration-300 px-4 py-3 rounded-full"
              >
                Start a Project
                <ArrowUpRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
