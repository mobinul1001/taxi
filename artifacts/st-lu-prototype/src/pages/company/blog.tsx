import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { BLOG_AUTHOR, BLOG_CATS, POSTS, postPath, readMins, type BlogCat } from "./blogData";
import { Crumbs, crumbLd, useSeo, webPageLd } from "./seo";
import { FinalCta, Shell, useShell } from "./shell";
import { ROUTES } from "./routes";

const TITLE = "Taxi App Blog: Guides on Dispatch, Payments, Launch";
const DESC = "Practical guides for taxi and ride-hailing businesses: how dispatch works, what to build first, driver onboarding, payments and launching in a new market.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Blog", to: ROUTES.blog }];
export const fmtDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

function Body() {
  const { ask } = useShell();
  const [cat, setCat] = useState<BlogCat | "All">("All");
  useSeo({ title: TITLE, description: DESC, path: ROUTES.blog, ld: [crumbLd(CRUMBS), webPageLd(TITLE, DESC, ROUTES.blog)] });
  const [feat, ...rest] = POSTS;
  const list = (cat === "All" ? rest : POSTS.filter((p) => p.cat === cat));
  return (
    <>
      <section className="hero hero-l hero-svc" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <p className="eyebrow">Blog</p>
          <h1>The Taxi App Blog: <em>Guides for Operators and Start-Ups</em></h1>
          <p className="sub">Plain-English guides on running and building taxi and ride-hailing platforms, written by the {BLOG_AUTHOR}.</p>
        </div>
      </section>
      <section className="sec sec-white" id="posts" aria-labelledby="h-posts">
        <div className="wrap">
          {cat === "All" && (
            <article className="post-feat">
              <p className="eyebrow">Featured</p>
              <h2 className="h2" id="h-posts"><Link to={postPath(feat.slug)}>{feat.title}</Link></h2>
              <p className="lede">{feat.summary}</p>
              <p className="meta"><span className="chipc">{feat.cat}</span><span><Clock size={14} aria-hidden /> {readMins(feat)} min read</span><span>{fmtDate(feat.date)}</span></p>
              <Link className="link" to={postPath(feat.slug)}>Read the guide <ArrowRight size={16} aria-hidden /></Link>
            </article>
          )}
          <div className="feat-filter" role="group" aria-label="Filter posts by category">
            {(["All", ...BLOG_CATS] as const).map((c) => <button key={c} type="button" className={cat === c ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          {cat !== "All" && <h2 className="h2" id="h-posts" style={{ marginTop: 18 }}>{cat}</h2>}
          {list.length === 0 && <p className="note">No posts in this category yet.</p>}
          <ul className="post-grid">
            {list.map((p) => (
              <li key={p.slug}>
                <span className="chipc">{p.cat}</span>
                <h3><Link to={postPath(p.slug)}>{p.title}</Link></h3>
                <p>{p.summary}</p>
                <p className="meta"><span><Clock size={14} aria-hidden /> {readMins(p)} min read</span><span>{fmtDate(p.date)}</span></p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FinalCta title="Have a Question the Blog Does Not Answer?" text="Tell us about your taxi business and we will reply with a clear next step." startLabel="Ask the Team" consultLabel="Get a Quote" onStart={() => ask("Ask the team", { kind: "Not sure yet" })} onConsult={() => ask("Get a quote", { kind: "Not sure yet" })} />
    </>
  );
}

export default function Blog() {
  return <Shell testId="page-tad-blog"><Body /></Shell>;
}
