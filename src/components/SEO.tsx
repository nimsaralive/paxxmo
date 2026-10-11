import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
export const SITE_URL = "https://paxxmo.com";
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
interface SEOProps {
  title: string; description: string; keywords?: string; ogImage?: string;
  ogType?: string; canonicalUrl?: string; structuredData?: object; noindex?: boolean; socialTitle?: string; socialDescription?: string;
}
export default function SEO({ title, description, keywords, ogImage = "/og-image.png",
  ogType = "website", canonicalUrl, structuredData, noindex = false, socialTitle, socialDescription }: SEOProps) {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const canonical = canonicalUrl || absoluteUrl(path);
  const fullTitle = title.includes("Paxxmo") ? title : `${title} | Paxxmo`;
  const graph = [
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Paxxmo",
      url: `${SITE_URL}/`, logo: absoluteUrl("/paxxmo_logo_1.png") },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Paxxmo", url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#organization` } },
    { "@type": "WebPage", "@id": canonical, url: canonical, name: fullTitle, description,
      isPartOf: { "@id": `${SITE_URL}/#website` } },
    ...(path !== "/" && !noindex ? [{ "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...(path.startsWith("/blog/") ? [{ "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` }] : []),
      { "@type": "ListItem", position: path.startsWith("/blog/") ? 3 : 2, name: title, item: canonical },
    ] }] : []),
    ...(structuredData ? [structuredData] : []),
  ];
  return <Helmet>
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large"} />
    {(!noindex || pathname.startsWith("/blog")) && <link rel="canonical" href={canonical} />}
    <meta property="og:title" content={socialTitle || fullTitle} />
    <meta property="og:description" content={socialDescription || description} />
    <meta property="og:type" content={ogType} />
    <meta property="og:url" content={canonical} />
    <meta property="og:site_name" content="Paxxmo" />
    <meta property="og:image" content={absoluteUrl(ogImage)} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={socialTitle || fullTitle} />
    <meta name="twitter:description" content={socialDescription || description} />
    <meta name="twitter:image" content={absoluteUrl(ogImage)} />
    {!noindex && <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>}
  </Helmet>;
}
