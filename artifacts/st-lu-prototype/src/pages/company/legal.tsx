import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Crumbs, useSeo } from "./seo";
import { Shell, go } from "./shell";
import { ROUTES } from "./routes";

/** The date these pages were last reviewed and published. */
const UPDATED = "24 November 2026";

type Sec = { id: string; h: string; body: ReactNode };

function DocPage({ title, description, path, name, intro, sections, summary }: { title: string; description: string; path: string; name: string; intro: string; sections: Sec[]; summary: string[] }) {
  // Legal pages deliberately carry no structured data.
  useSeo({ title, description, path, ld: [] });
  const crumbs = [{ name: "Home", to: ROUTES.home }, { name, to: path }];
  return (
    <>
      <section className="docs-hero" id="top">
        <div className="wrap">
          <Crumbs items={crumbs} />
          <h1>{name}</h1>
          <p className="sub">{intro}</p>
          <p className="meta">Last updated: {UPDATED}</p>
        </div>
      </section>
      <section className="sec sec-white docs">
        <div className="wrap docs-grid">
          <nav className="toc" aria-label="On this page">
            <p>On this page</p>
            <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); go(s.id); }}>{s.h}</a></li>)}</ol>
          </nav>
          <article className="doc">
            <aside className="plain" aria-labelledby="plain-h"><h2 id="plain-h">In plain English</h2><ul>{summary.map((x) => <li key={x}>{x}</li>)}</ul><p>This summary is a shortcut, not part of the policy. The full text below applies.</p></aside>
            {sections.map((s) => <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}><h2 id={`${s.id}-h`}>{s.h}</h2>{s.body}</section>)}
          </article>
        </div>
      </section>
    </>
  );
}

const Contact = () => <>Contact us through the <Link to={ROUTES.contact}>contact page</Link>.</>;

/* ---------------- Privacy Policy ---------------- */
function PrivacyBody() {
  return (
    <DocPage
      title="Privacy Policy | TaxiAppDevelopment.org"
      description="How TaxiAppDevelopment.org may collect, use, store and share personal information submitted through this website, and the choices you have."
      summary={["We collect what you type into our forms, plus basic usage data from our analytics tool.", "Forms go through Formspree, the site is hosted on Netlify and analytics come from Microsoft Clarity.", "We use your details to reply to you and to run and secure the website. There is no advertising tracking.", "You can ask to see, correct or delete your information through the contact page."]}
      path={ROUTES.privacy} name="Privacy Policy"
      intro="This policy explains what personal information we may collect through this website, why, how it is handled and what choices you have."
      sections={[
        { id: "who", h: "Who we are", body: <><p>This website, TaxiAppDevelopment.org, is operated by Taxi App Development (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We do not publish a postal address on this website. For privacy questions, <Contact /></p></> },
        { id: "collect", h: "Information we may collect", body: <>
          <p>We collect only what is needed to run the website and respond to people who contact us. Depending on how you use the site, this may include:</p>
          <h3>Information you give us</h3>
          <ul><li>Contact and enquiry form details: your name, work email address, company name, type of business, what you want to build, your project stage and the notes you write.</li><li>Newsletter sign-up: your email address, if you use the form in the page footer. It is sent through Formspree.</li><li>Anything else you choose to include when you write to us.</li></ul>
          <h3>Information collected automatically</h3>
          <p>Web servers and hosting services commonly record technical information such as IP address, browser and device type, pages requested and the time of the request. Our hosting provider, Netlify, may keep such logs. Our analytics tool, Microsoft Clarity, also collects usage information, as described under Analytics and cookies below.</p>
          <p>Please do not send sensitive personal information, such as payment card numbers or government identification numbers, through the website forms.</p></> },
        { id: "use", h: "How we use information", body: <>
          <p>We may use the information above to:</p>
          <ul><li>read and reply to your enquiry and discuss a possible project;</li><li>prepare scopes, proposals and estimates you ask for;</li><li>send occasional taxi software news, if you signed up for it;</li><li>keep the website secure and working, and understand how it is used;</li><li>meet legal obligations and protect our rights.</li></ul>
          <p>Where data protection law requires a legal basis for this use, we rely on the one that fits: steps you ask us to take before a project agreement, our legitimate interests in running and securing the website and replying to enquiries, a legal obligation, or your consent where the law requires it.</p></> },
        { id: "forms", h: "Contact and enquiry forms", body: <>
          <p>When you submit the contact form or the quote request, the details you enter are used to respond to you. Fields marked as required are needed for us to reply; the others are optional.</p>
          <p>Form submissions are sent to Formspree, a third-party form service, which passes them to us. Formspree handles that data under its own terms and privacy policy, and may keep a copy of submissions in the form&rsquo;s dashboard, which we use to read and manage enquiries. Access is limited to the people who handle enquiries.</p></> },
        { id: "analytics", h: "Analytics and cookies", body: <>
          <p>This website uses Microsoft Clarity, an analytics tool, to understand how visitors use the pages, for example which pages are opened, where people click and scroll, and where they leave. Clarity may collect device and browser type, screen size, approximate location (country or region), referring page and interaction data such as clicks, scrolling and mouse movement, and it may create session recordings and heatmaps. It may set cookies or use browser storage to do this. Microsoft processes this data under its own privacy statement (<a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">privacy.microsoft.com/privacystatement</a>).</p>
          <p>We do not use advertising tools on this website. We do not show a cookie banner. If you do not want analytics, you can block cookies and scripts in your browser settings or with a content blocker.</p>
          <p>For details on cookies and similar technologies, see our <Link to={ROUTES.cookies}>Cookie Policy</Link>.</p></> },
        { id: "sharing", h: "How we share information", body: <>
          <p>We may share personal information with:</p>
          <ul><li>service providers that help us run the website and handle enquiries, namely Netlify (website hosting), Formspree (contact and enquiry forms) and Microsoft Clarity (analytics);</li><li>professional advisers, such as lawyers and accountants, where needed;</li><li>authorities, where the law requires it;</li><li>a successor business, if our business is sold or reorganised.</li></ul>
          <p>Where a provider handles information for us, it should do so only for the purpose we have given it.</p></> },
        { id: "storage", h: "Storage and security", body: <>
          <p>We aim to protect personal information with measures that suit its sensitivity, such as serving the website over an encrypted HTTPS connection and limiting access to enquiries to the people who handle them. No method of transmission over the internet or of electronic storage is completely secure, so we cannot guarantee absolute security.</p>
          <p>Our service providers may process information in the United States and in other countries where they operate. Where information is transferred across borders, we use the safeguards the law requires.</p></> },
        { id: "retention", h: "Data retention", body: <><p>We retain personal information only for as long as reasonably necessary for the purpose it was collected, including responding to enquiries, running our business, meeting legal obligations and resolving disputes where applicable. When it is no longer needed, we delete it or make it anonymous.</p></> },
        { id: "rights", h: "Your rights", body: <>
          <p>Depending on where you live, you may have the right to:</p>
          <ul><li>ask what personal information we hold about you and receive a copy;</li><li>ask us to correct information that is wrong;</li><li>ask us to delete information, or to restrict or stop certain uses;</li><li>object to certain uses, or withdraw consent where we rely on it;</li><li>ask for your information in a portable format;</li><li>complain to your local data protection authority.</li></ul>
          <p>To make a request, <Contact /> We may need to confirm your identity before acting on it.</p></> },
        { id: "children", h: "Children", body: <><p>This website is written for businesses and is not intended for children. We do not knowingly collect personal information from children.</p></> },
        { id: "links", h: "Links to other websites", body: <><p>The website may link to other sites. We do not control them and are not responsible for their privacy practices. Please read their policies.</p></> },
        { id: "changes", h: "Changes to this policy", body: <><p>We may update this policy from time to time. The date at the top shows when it was last changed.</p></> },
        { id: "contact", h: "Contact", body: <p>Questions about this policy: <Contact /></p> },
      ]}
    />
  );
}

/* ---------------- Terms and Conditions ---------------- */
function TermsBody() {
  return (
    <DocPage
      title="Terms and Conditions | TaxiAppDevelopment.org"
      description="Terms for using the TaxiAppDevelopment.org website: permitted use, intellectual property, external links, limits on liability and general terms."
      summary={["These terms cover using this website only, not a software project.", "A project is governed only by a separate written agreement.", "Sending an enquiry does not create a contract.", "Please use the site lawfully and do not copy its content at scale without permission."]}
      path={ROUTES.terms} name="Terms and Conditions"
      intro="These terms apply to your use of this website. They do not set the terms of any software development project, which are agreed separately in writing."
      sections={[
        { id: "accept", h: "Accepting these terms", body: <p>By using this website you agree to these terms. If you do not agree, please do not use the website. The website is operated by Taxi App Development.</p> },
        { id: "about", h: "About the website and our services", body: <>
          <p>This website describes taxi app, ride-hailing and custom software development services. The descriptions are for general information. Any actual project, including its scope, timeline, price and ownership of the work, is governed only by a separate written agreement signed by both parties.</p>
          <p>Sending an enquiry, using a tool on the site or receiving a reply does not create a contract or a commitment to provide services.</p></> },
        { id: "use", h: "Permitted use", body: <>
          <p>You may use the website for lawful purposes, to learn about our services and to contact us. You may view and print pages for your own business use.</p></> },
        { id: "prohibited", h: "What you must not do", body: <ul><li>use the website in a way that is unlawful or infringes anyone's rights;</li><li>try to gain unauthorised access to the website, its servers or related systems;</li><li>introduce malware or interfere with the website's operation;</li><li>scrape or copy the website's content on a large scale without our permission;</li><li>submit false, misleading or abusive information through our forms.</li></ul> },
        { id: "ip", h: "Intellectual property", body: <>
          <p>The text, design, graphics, illustrations and other content of this website belong to us or our licensors and are protected by intellectual property laws. You may not copy, republish, sell or create derivative works from them without our written permission, except as permitted by law.</p>
          <p>Product names, logos and trademarks of other companies belong to their owners. Illustrations and sample screens on this website are examples and do not represent real clients unless stated.</p>
          <p>Ownership of software and materials produced in a project is set out in the project agreement, not in these terms.</p></> },
        { id: "submissions", h: "Information you send us", body: <p>You are responsible for the accuracy of what you submit. We use submitted information as described in our <Link to={ROUTES.privacy}>Privacy Policy</Link>. Please do not send confidential information you are not willing to share before a written agreement is in place.</p> },
        { id: "links", h: "External links", body: <p>The website may link to third-party websites. We do not control them, and a link is not an endorsement. We are not responsible for their content, availability or practices.</p> },
        { id: "info", h: "Accuracy of information", body: <p>We try to keep the website accurate and current, but we do not promise that it is complete, error-free or up to date. See our <Link to={ROUTES.disclaimer}>Disclaimer</Link> for how to read the information on the site.</p> },
        { id: "liability", h: "Limitation of liability", body: <p>To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use of, or inability to use, the website or from relying on its content. Nothing in these terms limits liability that cannot be limited by law.</p> },
        { id: "changes", h: "Changes to the website and terms", body: <p>We may change, suspend or remove any part of the website, and update these terms, at any time. The updated terms apply from the date shown on this page. Continuing to use the website means you accept the updated terms.</p> },
        { id: "general", h: "General", body: <p>If any part of these terms is found unenforceable, the rest remains in effect. Our failure to enforce a term is not a waiver of it. These terms are the entire agreement about use of the website, and do not replace any separate written agreement for services.</p> },
        { id: "contact", h: "Contact", body: <p>Questions about these terms: <Contact /></p> },
      ]}
    />
  );
}

/* ---------------- Cookie Policy ---------------- */
function CookieBody() {
  return (
    <DocPage
      title="Cookie Policy | TaxiAppDevelopment.org"
      description="What cookies and similar technologies are, and how they are used or not used on the TaxiAppDevelopment.org website."
      summary={["The pages set no cookies of their own and show no advertising or social tracking.", "Microsoft Clarity analytics may set cookies such as _clck and _clsk.", "There is no cookie banner. You can block cookies or scripts in your browser or with a content blocker."]}
      path={ROUTES.cookies} name="Cookie Policy"
      intro="This policy explains what cookies are and what this website does and does not use them for."
      sections={[
        { id: "what", h: "What cookies are", body: <p>Cookies are small text files that a website can place on your device. Similar technologies, such as local storage, can also keep information in your browser. They are used to make websites work, remember choices, and understand how a site is used.</p> },
        { id: "use", h: "How this website uses them", body: <>
          <p>The pages of this website do not set cookies of their own and do not load advertising or social media tracking tools. They do load Microsoft Clarity for analytics, which may set cookies and use your browser&rsquo;s storage to tell visits apart and to record how pages are used. Microsoft lists the cookies Clarity uses, and how long each lasts, in its Clarity documentation. We do not show a cookie banner.</p>
          <p>The St Lu case study (the clickable prototype opened from this website) keeps its demo data and your light or dark choice in your browser&rsquo;s local or session storage on this website&rsquo;s domain. It uses no analytics of its own and sends nothing to a server.</p>
          <p>Our hosting provider and your browser may still handle technical data, such as server logs, as described in the <Link to={ROUTES.privacy}>Privacy Policy</Link>.</p></> },
        { id: "types", h: "Types of cookies", body: <>
          <h3>Essential cookies</h3><p>These make a website work, for example by keeping a secure session. This website does not currently need or set them.</p>
          <h3>Preference cookies</h3><p>These remember choices such as language. This website does not currently set preference cookies.</p>
          <h3>Analytics cookies</h3><p>These count visits and show how a site is used. This website uses Microsoft Clarity for this. It may set cookies such as <code>_clck</code> and <code>_clsk</code>.</p>
          <h3>Advertising cookies</h3><p>These are used to show or measure advertising. None are used on this website.</p></> },
        { id: "third", h: "Third-party content", body: <p>This website does not embed third-party widgets such as maps, video or social media buttons. The Clarity script loads from Microsoft&rsquo;s servers, and contact forms are sent to Formspree when you submit them. If you follow a link to another website, that site may use cookies under its own policy.</p> },
        { id: "future", h: "If this changes", body: <p>If we add or change analytics or other tools that use cookies or similar technologies, we will update this page and say what each is for.</p> },
        { id: "control", h: "Managing cookies", body: <p>You can block or delete cookies in your browser settings, or use a content blocker to stop analytics scripts. Doing so may affect how some websites work. Your browser&rsquo;s help pages explain how.</p> },
        { id: "contact", h: "Contact", body: <p>Questions about this policy: <Contact /></p> },
      ]}
    />
  );
}

/* ---------------- Disclaimer ---------------- */
function DisclaimerBody() {
  return (
    <DocPage
      title="Disclaimer | TaxiAppDevelopment.org"
      description="Website information is general. Project timelines, features, costs and results depend on your requirements and a written agreement."
      summary={["The site gives general information, not an offer or a promise.", "Timelines, features, costs and results depend on your scope and a written agreement.", "Sample screens and tools are illustrations, not real client results.", "Nothing here is legal advice."]}
      path={ROUTES.disclaimer} name="Disclaimer"
      intro="The information on this website is general. Please read it as a starting point for a conversation, not as an offer or a promise."
      sections={[
        { id: "general", h: "General information only", body: <p>Everything on this website, including the descriptions of services, features, solutions and the examples and tools, is provided for general information. It is not professional advice and it does not take your particular circumstances into account.</p> },
        { id: "projects", h: "Projects depend on your requirements", body: <>
          <p>Timelines, features, costs and outcomes for any project depend on its scope, the choices made, third-party services and the written agreement between you and us. In particular:</p>
          <ul><li>Descriptions of what a taxi app, dispatch system or white label product can include describe typical options, not a commitment to deliver them.</li><li>Cost guidance and the scope tools on the website show what influences a budget. They are not quotes or prices.</li><li>Timelines are agreed for a specific project once its scope is known.</li><li>Business results, such as bookings, revenue or growth, depend on many factors outside software and cannot be promised.</li></ul></> },
        { id: "examples", h: "Examples and illustrations", body: <p>Sample screens, dashboards, diagrams and the selector and estimator tools on this website are illustrative. They are not live products or real client results unless clearly stated.</p> },
        { id: "third", h: "Third-party services", body: <p>Projects commonly rely on services provided by others, such as maps, payment providers, messaging and app stores. Their availability, pricing and rules are set by those providers and may change.</p> },
        { id: "legal", h: "Licensing and regulation", body: <p>Rules for operating taxi and ride-hailing services, and for handling payments and personal data, differ by country and region. Nothing on this website is legal advice. Please take advice on the rules that apply to your business.</p> },
        { id: "links", h: "External links", body: <p>We are not responsible for the content or accuracy of other websites that we link to.</p> },
        { id: "liability", h: "Limits", body: <p>We try to keep this website accurate, but we do not promise that it is complete or current. To the extent the law allows, we are not responsible for decisions made on the basis of its content. See the <Link to={ROUTES.terms}>Terms and Conditions</Link> for more.</p> },
        { id: "contact", h: "Contact", body: <p>If you have a question about a project, <Contact /></p> },
      ]}
    />
  );
}

export const Privacy = () => <Shell testId="page-tad-privacy"><PrivacyBody /></Shell>;
export const Terms = () => <Shell testId="page-tad-terms"><TermsBody /></Shell>;
export const Cookies = () => <Shell testId="page-tad-cookies"><CookieBody /></Shell>;
export const Disclaimer = () => <Shell testId="page-tad-disclaimer"><DisclaimerBody /></Shell>;
