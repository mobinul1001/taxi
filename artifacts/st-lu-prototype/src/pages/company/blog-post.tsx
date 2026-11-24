import { Link, useParams } from "react-router-dom";
import { Clock, ListChecks } from "lucide-react";
import { BLOG_PATH, BLOG_AUTHOR, POSTS, postPath, readMins } from "./blogData";
import { fmtDate } from "./blog";
import { Crumbs, crumbLd, orgRef, useSeo } from "./seo";
import { FinalCta, Shell, useShell } from "./shell";
import { ROUTES, ORIGIN, canonicalOf } from "./routes";
import { Cover } from "./covers";

function Missing() {
  useSeo({ title: "Post not found | TaxiAppDevelopment.org", description: "This blog post does not exist.", path: BLOG_PATH, ld: [], robots: "noindex, follow" });
  return (
    <section className="docs-hero thanks" id="top"><div className="wrap">
      <h1>Post not found</h1>
      <p className="sub">That blog post does not exist. The blog lists every guide we have published.</p>
      <div className="hero-btns"><Link className="btn btn-primary" to={BLOG_PATH}>Go to the blog</Link></div>
    </div></section>
  );
}

function Post({ slug }: { slug: string }) {
  const { ask } = useShell();
  const post = POSTS.find((p) => p.slug === slug)!;
  const path = postPath(post.slug);
  const crumbs = [{ name: "Home", to: ROUTES.home }, { name: "Blog", to: BLOG_PATH }, { name: post.title, to: path }];
  useSeo({
    title: post.title, description: post.desc, path,
    ld: [crumbLd(crumbs), {
      "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.desc,
      author: { "@type": "Organization", name: BLOG_AUTHOR, url: `${ORIGIN}/` }, publisher: orgRef,
      datePublished: post.date, dateModified: post.date, mainEntityOfPage: canonicalOf(path), image: `${ORIGIN}/og-agency.jpg`,
    }],
  });
  const rel = [...post.related, ...POSTS.map((p) => p.slug).filter((s) => s !== post.slug && !post.related.includes(s))].slice(0, 3).map((s) => POSTS.find((p) => p.slug === s)!);
  return (
    <>
      <section className="hero hero-l hero-svc" id="top">
        <div className="wrap">
          <Crumbs items={crumbs} />
          <p className="eyebrow">{post.cat}</p>
          <h1>{post.title}</h1>
          <p className="sub">{post.summary}</p>
          <p className="meta"><span>By {BLOG_AUTHOR}</span><span>Published {fmtDate(post.date)}</span><span>Updated {fmtDate(post.date)}</span><span><Clock size={14} aria-hidden /> {readMins(post)} min read</span></p>
        </div>
      </section>
      <section className="sec sec-white">
        <div className="wrap post-wrap">
          <aside className="post-toc" aria-label="On this page">
            <p><b>On this page</b></p>
            <ol>{post.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.h}</a></li>)}</ol>
          </aside>
          <article className="post-body">
            <figure className="post-cover"><Cover slug={post.slug} size="lg" eager /></figure>
            <div className="takeaways"><h2><ListChecks size={20} aria-hidden /> Key takeaways</h2><ul>{post.takeaways.map((t) => <li key={t}>{t}</li>)}</ul></div>
            {post.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`}>
                <h2 id={`h-${s.id}`}>{s.h}</h2>
                {s.p.map((t) => <p key={t}>{t}</p>)}
                {s.list && <ul>{s.list.map((t) => <li key={t}>{t}</li>)}</ul>}
              </section>
            ))}
            <div className="post-cta"><p>{post.cta.text} <Link to={ROUTES[post.cta.to]}>{post.cta.label}</Link>.</p>
              <button type="button" className="btn btn-primary" onClick={() => ask("Get a quote", { kind: "Not sure yet" })}>Get a Quote</button></div>
          </article>
        </div>
      </section>
      <section className="sec sec-gray" aria-labelledby="h-more">
        <div className="wrap">
          <p className="eyebrow">Keep reading</p>
          <h2 className="h2 wide" id="h-more">More guides from the blog</h2>
          <ul className="post-grid">{rel.map((p) => <li key={p.slug}><Link to={postPath(p.slug)} tabIndex={-1} aria-hidden className="cover-link"><Cover slug={p.slug} /></Link><span className="chipc">{p.cat}</span><h3><Link to={postPath(p.slug)}>{p.title}</Link></h3><p>{p.summary}</p></li>)}</ul>
        </div>
      </section>
      <FinalCta title="Planning a Taxi App or Dispatch Platform?" text="Tell us about your business and we reply with questions and a suggested next step." startLabel="Get a Quote" consultLabel="Request a Demo" onStart={() => ask("Get a quote", { kind: "Not sure yet" })} onConsult={() => ask("Request a demo", { kind: "Request a demo" })} />
    </>
  );
}

export default function BlogPost() {
  const { slug = "" } = useParams();
  return <Shell testId="page-tad-blog-post">{POSTS.some((p) => p.slug === slug) ? <Post key={slug} slug={slug} /> : <Missing />}</Shell>;
}
