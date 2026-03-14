import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import caseStudy1 from "@/assets/case-study-1.png";
import caseStudy2 from "@/assets/case-study-2.png";
import caseStudy3 from "@/assets/case-study-3.png";

const caseStudies = [
  {
    image: caseStudy1,
    title: "Enterprise Website Redesign",
    tags: ["Web Design", "B2B"],
  },
  {
    image: caseStudy2,
    title: "Custom SaaS Platform",
    tags: ["Web App", "Full Stack"],
  },
  {
    image: caseStudy3,
    title: "Multi-Channel Marketing Campaign",
    tags: ["Strategy", "Paid Media"],
  },
];

type CursorPosition = {
  x: number;
  y: number;
};

const CaseStudies = () => {
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });

  const observerOptions = useMemo(
    () => ({
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.2,
    }),
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const rawIndex = entry.target.getAttribute("data-index");
        const index = rawIndex ? Number(rawIndex) : -1;

        if (index >= 0 && entry.isIntersecting) {
          setVisibleCards((prev) => ({ ...prev, [index]: true }));
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    cardRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [observerOptions]);

  const onCardMouseMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  return (
    <section id="case-study" className="py-24 lg:py-32 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 opacity-100 translate-y-0 transition-all duration-700">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            <span className="text-muted-foreground">Recent</span>
            <br />
            <span className="text-foreground">Case Studies</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study, index) => (
            <a
              href="#"
              key={study.title}
              ref={(element) => (cardRefs.current[index] = element)}
              data-index={index}
              className={`group block relative overflow-hidden rounded-2xl transition-all duration-700 ${
                visibleCards[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={onCardMouseMove}
            >
              <div className="overflow-hidden rounded-2xl mb-4 bg-card">
                <img
                  src={study.image}
                  alt={study.title}
                  className="w-full aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div
                className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-200 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
                style={{ left: cursorPosition.x, top: cursorPosition.y }}
              >
                <span className="px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-medium tracking-wide">
                  View
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
                    {study.title}
                  </h3>
                  <div className="flex gap-2">
                    {study.tags.map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex-shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
