import { Link } from "react-router-dom";
import { Crumbs, useSeo } from "./seo";
import { Shell } from "./shell";
import { ROUTES } from "./routes";
import { sitemapGroups } from "./pageIndex";

const TITLE = "Sitemap | TaxiAppDevelopment.org";
const DESC = "All public pages of TaxiAppDevelopment.org: services, solutions, resources, company information and legal pages.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Sitemap", to: ROUTES.sitemap }];

function Body() {
  useSeo({ title: TITLE, description: DESC, path: ROUTES.sitemap, ld: [] });
  return (
    <>
      <section className="docs-hero" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <h1>Sitemap</h1>
          <p className="sub">Every public page on this website, grouped by topic.</p>
        </div>
      </section>
      <section className="sec sec-white">
        <div className="wrap smap">
          {sitemapGroups().map((g) => (
            <section key={g.group} aria-labelledby={`sm-${g.group.replace(/\s/g, "")}`}>
              <h2 id={`sm-${g.group.replace(/\s/g, "")}`}>{g.group}</h2>
              <ul>{g.pages.map((p) => <li key={p.to}><Link to={p.to}>{p.label}</Link><span>{p.desc}</span></li>)}</ul>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

export default function SitemapPage() {
  return <Shell testId="page-tad-sitemap"><Body /></Shell>;
}
