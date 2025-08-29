import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CANONICAL_DOMAIN } from "@/lib/i18n";

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
  localeHref?: string; // explicit canonical path if needed
}

export function SEO({ title, description, ogImage, noindex = true, localeHref }: SEOProps) {
  const loc = useLocation();
  useEffect(() => {
    if (title) document.title = title;

    function setMeta(name: string, content: string) {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    function setProp(property: string, content: string) {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    const canonicalHref = CANONICAL_DOMAIN + (localeHref ?? loc.pathname);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalHref);

    const robots = noindex ? "noindex, nofollow" : "index, follow";
    setMeta("robots", robots);

    if (description) setMeta("description", description);
    if (title) setProp("og:title", title);
    if (description) setProp("og:description", description);
    if (ogImage) setProp("og:image", ogImage);
    setProp("og:type", "website");
    setProp("og:url", canonicalHref);
  }, [title, description, ogImage, noindex, loc.pathname, localeHref]);

  return null;
}

export default SEO;
