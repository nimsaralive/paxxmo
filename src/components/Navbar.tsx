import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cardHover, revealTransition, tapScale } from "@/lib/motion";

const navLinks = [
  { label: "About", href: "/#about", num: "01" },
  { label: "Services", href: "/#service", num: "02" },
  { label: "Solutions", href: "/#solutions", num: "03" },
  { label: "Blog", href: "/blog", num: "04" },
  { label: "Contact", href: "/#contact", num: "05" },
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

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false);
    if (href.includes("#")) {
      const hash = href.split("#")[1];
      if (isHomePage) {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      } else {
        e.preventDefault();
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
        }, 100);
      }
    }
  };

  return (
    <>
      {/* ── Navbar bar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...revealTransition, duration: 0.55 }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-4 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
            : "bg-background/60 backdrop-blur-sm"
        }`}
      >
        {/* Logo */}
        <motion.div whileHover={cardHover} whileTap={tapScale}>
          <Link to="/" className="flex items-center flex-shrink-0" onClick={() => setMobileOpen(false)}>
            <img src="/paxxmo_logo_1.png" alt="Paxxmo" className="h-8 w-auto" />
          </Link>
        </motion.div>

        {/* Desktop links */}
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

        {/* Mobile hamburger – animated bars → X with CSS only */}
        <button
          className="md:hidden relative z-[60] flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "hsl(36 20% 88%)",
              borderRadius: "2px",
              transformOrigin: "center",
              transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
              transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "hsl(36 20% 88%)",
              borderRadius: "2px",
              transition: "opacity 0.18s ease, transform 0.18s ease",
              opacity: mobileOpen ? 0 : 1,
              transform: mobileOpen ? "scaleX(0)" : "scaleX(1)",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "hsl(36 20% 88%)",
              borderRadius: "2px",
              transformOrigin: "center",
              transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
              transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </motion.nav>

      {/* ── Full-screen mobile overlay (CSS transitions, no framer-motion) ── */}
      <div
        className="md:hidden fixed inset-0 z-[55] flex flex-col"
        style={{
          background: "hsl(0 0% 5%)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, hsl(36 40% 60%), transparent)",
          }}
        />

        {/* Close button inside overlay */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          style={{
            position: "absolute",
            top: "18px",
            right: "20px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "hsl(36 20% 88%)",
            transition: "background 0.2s ease, border-color 0.2s ease",
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(-90deg)",
            transitionProperty: "opacity, transform, background, border-color",
            transitionDuration: "0.35s",
            transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: mobileOpen ? "0.15s" : "0s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
          }}
        >
          <X style={{ width: "18px", height: "18px" }} />
        </button>

        <div className="flex flex-col h-full pt-24 pb-10 px-8">
          {/* Nav links */}
          <nav className="flex flex-col flex-1 justify-center gap-0 -mt-8">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="group flex items-baseline gap-4 py-4 no-underline"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateX(0)" : "translateX(-24px)",
                  transition: `opacity 0.4s cubic-bezier(0.22,1,0.36,1) ${0.06 + i * 0.07}s, transform 0.4s cubic-bezier(0.22,1,0.36,1) ${0.06 + i * 0.07}s`,
                }}
              >
                {/* Index */}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "hsl(36 40% 60%)",
                    opacity: 0.75,
                    flexShrink: 0,
                  }}
                >
                  {link.num}
                </span>
                {/* Label */}
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(1.6rem, 7vw, 2.2rem)",
                    fontWeight: 600,
                    color: "hsl(36 20% 88%)",
                    letterSpacing: "-0.02em",
                    transition: "opacity 0.25s ease",
                  }}
                  className="group-hover:opacity-50"
                >
                  {link.label}
                </span>
                {/* Arrow */}
                <ArrowUpRight
                  style={{
                    marginLeft: "auto",
                    width: "18px",
                    height: "18px",
                    color: "hsl(36 40% 60%)",
                    opacity: 0,
                    transition: "opacity 0.25s ease",
                    flexShrink: 0,
                  }}
                  className="group-hover:!opacity-100"
                />
              </a>
            ))}
          </nav>

          {/* Bottom CTA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1) 0.42s, transform 0.4s cubic-bezier(0.22,1,0.36,1) 0.42s",
            }}
          >
            <a
              href="/#contact"
              onClick={(e) => handleLinkClick(e, "/#contact")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "14px 0",
                borderRadius: "9999px",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.03em",
                background: "hsl(36 20% 88%)",
                color: "hsl(0 0% 5%)",
                textDecoration: "none",
              }}
            >
              Start a Project
              <ArrowUpRight style={{ width: "16px", height: "16px" }} />
            </a>
            <p style={{ textAlign: "center", fontSize: "11px", color: "hsl(0 0% 38%)" }}>
              © {new Date().getFullYear()} Paxxmo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
