import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ORIGIN, canonicalOf } from "./routes";

type Json = Record<string, unknown>;

/**
 * Page-level SEO for one agency route: title, description, canonical, Open Graph / Twitter text and JSON-LD.
 * Every tag it touches is put back (or removed) when the route closes, so the St Lu pages keep their own tags.
 */
export function useSeo({ title, description, path, ld, robots }: { title: string; description: string; path: string; ld: Json[]; robots?: string }) {
  const key = JSON.stringify(ld);
  useEffect(() => {
    const undo: Array<() => void> = [];
    const prevTitle = document.title;
    document.title = title;
    undo.push(() => { document.title = prevTitle; });

    const url = canonicalOf(path);
    const meta = (attr: "name" | "property", name: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (el) { const prev = el.content; el.content = value; undo.push(() => { el!.content = prev; }); }
      else { el = document.createElement("meta"); el.setAttribute(attr, name); el.content = value; document.head.appendChild(el); undo.push(() => el!.remove()); }
    };
    meta("name", "description", description);
    if (robots) meta("name", "robots", robots);
    meta("property", "og:title", title);
    meta("property", "og:description", description);
    meta("property", "og:url", url);
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", description);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) { const prev = link.href; link.href = url; undo.push(() => { link!.href = prev; }); }
    else { link = document.createElement("link"); link.rel = "canonical"; link.href = url; document.head.appendChild(link); undo.push(() => link!.remove()); }

    for (const item of JSON.parse(key) as Json[]) {
      const s = document.createElement("script");
      s.type = "application/ld+json"; s.dataset.tad = "1"; s.text = JSON.stringify(item);
      document.head.appendChild(s); undo.push(() => s.remove());
    }
    return () => undo.reverse().forEach((f) => f());
  }, [title, description, path, key, robots]);
}

export type Crumb = { name: string; to: string };

export function crumbLd(items: Crumb[]): Json {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: canonicalOf(c.to) })),
  };
}
export const faqLd = (items: [string, string][]): Json => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});
export const orgRef: Json = { "@type": "Organization", "@id": `${ORIGIN}/#organization`, name: "TaxiAppDevelopment.org", url: `${ORIGIN}/` };
export const siteRef: Json = { "@type": "WebSite", "@id": `${ORIGIN}/#website`, name: "TaxiAppDevelopment.org", url: `${ORIGIN}/` };
export const serviceLd = (name: string, description: string, path: string, serviceType: string): Json => ({
  "@context": "https://schema.org", "@type": "Service", name, description, serviceType, url: canonicalOf(path), provider: orgRef,
});
export const webPageLd = (name: string, description: string, path: string): Json => ({
  "@context": "https://schema.org", "@type": "WebPage", name, description, url: canonicalOf(path), isPartOf: siteRef,
});

export function Crumbs({ items, dark }: { items: Crumb[]; dark?: boolean }) {
  return (
    <nav className={`crumbs${dark ? " dark" : ""}`} aria-label="Breadcrumb">
      <ol>
        {items.map((c, i) => (
          <li key={c.name}>
            {i < items.length - 1 ? <Link to={c.to}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
            {i < items.length - 1 && <ChevronRight size={14} aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
