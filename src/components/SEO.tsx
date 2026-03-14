import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

const SEO = ({
  title,
  description,
  keywords,
  ogImage = "/og-image.png",
  ogType = "website",
  canonicalUrl,
  structuredData,
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Paxxmo`;

    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Update meta tags
    updateMeta("description", description);
    if (keywords) updateMeta("keywords", keywords);
    
    // Open Graph tags
    updateMeta("og:title", `${title} | Paxxmo`, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:image", ogImage, true);
    
    // Twitter tags
    updateMeta("twitter:title", `${title} | Paxxmo`);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", canonicalUrl);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Cleanup structured data on unmount
      const script = document.querySelector('script[type="application/ld+json"]');
      if (script) script.remove();
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, structuredData]);

  return null;
};

export default SEO;
