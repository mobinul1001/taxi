import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Crumbs, useSeo } from "./seo";
import { Shell } from "./shell";
import { ROUTES } from "./routes";

/** A clearly marked gap: something only the business owner can supply. */
const PH = ({ children }: { children: ReactNode }) => <mark className="phold">[{children}]</mark>;

type Sec = { id: string; h: string; body: ReactNode };

function DocPage({ title, description, path, name, intro, sections }: { title: string; description: string; path: string; name: string; intro: string; sections: Sec[] }) {
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
          <p className="meta">Last updated: <PH>date to be added on publication</PH></p>
        </div>
      </section>
      <section className="sec sec-white docs">
        <div className="wrap docs-grid">
          <nav className="toc" aria-label="On this page">
            <p>On this page</p>
            <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{s.h}</a></li>)}</ol>
          </nav>
          <article className="doc">
            <aside className="draft" aria-label="Draft notice">
              <strong>Draft for review.</strong> This is a general website policy draft, not legal advice and not a substitute for jurisdiction-specific legal review. Items in <PH>square brackets</PH> are details we could not verify and must be completed before publication.
            </aside>
            {sections.map((s) => <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}><h2 id={`${s.id}-h`}>{s.h}</h2>{s.body}</section>)}
          </article>
        </div>
      </section>
    </>
  );
}

const Contact = () => <>Contact us through the <Link to={ROUTES.contact}>contact page</Link> or at <PH>contact email address</PH>.</>;

/* ---------------- Privacy Policy ---------------- */
function PrivacyBody() {
  return (
    <DocPage
      title="Privacy Policy | TaxiAppDevelopment.org"
      description="How TaxiAppDevelopment.org may collect, use, store and share personal information submitted through this website, and the choices you have."
      path={ROUTES.privacy} name="Privacy Policy"
      intro="This policy explains what personal information we may collect through this website, why, how it is handled and what choices you have."
      sections={[
        { id: "who", h: "Who we are", body: <><p>This website, TaxiAppDevelopment.org, is operated by <PH>legal entity name</PH> (&ldquo;we&rdquo;, &ldquo;us&rdquo;). Our registered address is <PH>registered address</PH>. For privacy questions, <Contact /></p></> },
        { id: "collect", h: "Information we may collect", body: <>
          <p>We collect only what is needed to run the website and respond to people who contact us. Depending on how you use the site, this may include:</p>
          <h3>Information you give us</h3>
          <ul><li>Contact and enquiry form details: your name, work email address, company name, type of business, what you want to build, your project stage and the notes you write.</li><li>Newsletter sign-up: your email address, if you use that form.</li><li>Anything else you choose to include when you write to us.</li></ul>
          <h3>Information collected automatically</h3>
          <p>Web servers and hosting services commonly record technical information such as IP address, browser and device type, pages requested and the time of the request. <PH>Confirm which technical logs the hosting provider keeps</PH></p>
          <p>Please do not send sensitive personal information, such as payment card numbers or government identification numbers, through the website forms.</p></> },
        { id: "use", h: "How we use information", body: <>
          <p>We may use the information above to:</p>
          <ul><li>read and reply to your enquiry and discuss a possible project;</li><li>prepare scopes, proposals and estimates you ask for;</li><li>send the newsletter, where you signed up for it;</li><li>keep the website secure and working, and understand how it is used;</li><li>meet legal obligations and protect our rights.</li></ul>
          <p>Where data protection law requires a legal basis for this use, we will rely on the basis that applies. <PH>Legal bases to be confirmed in legal review</PH></p></> },
        { id: "forms", h: "Contact and enquiry forms", body: <>
          <p>When you submit the contact form or the quote request, the details you enter are used to respond to you. Fields marked as required are needed for us to reply; the others are optional.</p>
          <p>Form submissions are sent to Formspree, a third-party form service, which passes them to us. Formspree handles that data under its own terms and privacy policy. <PH>Add where submissions are then stored (for example email or a CRM) and who can access them</PH></p></> },
        { id: "analytics", h: "Analytics and cookies", body: <>
          <p>At the time of writing, we have not configured analytics or advertising tools on the pages of this website. If we add them, we will update this policy and, where the law requires it, ask for your consent first.</p>
          <p>For details on cookies and similar technologies, see our <Link to={ROUTES.cookies}>Cookie Policy</Link>.</p></> },
        { id: "sharing", h: "How we share information", body: <>
          <p>We may share personal information with:</p>
          <ul><li>service providers that help us run the website and handle enquiries, such as hosting, email and similar tools (<PH>list providers once confirmed</PH>);</li><li>professional advisers, such as lawyers and accountants, where needed;</li><li>authorities, where the law requires it;</li><li>a successor business, if our business is sold or reorganised.</li></ul>
          <p>Where a provider handles information for us, it should do so only for the purpose we have given it.</p></> },
        { id: "storage", h: "Storage and security", body: <>
          <p>We aim to protect personal information with measures that suit its sensitivity, such as access limits. <PH>Describe the actual security measures once confirmed</PH> No method of transmission over the internet or of electronic storage is completely secure, so we cannot guarantee absolute security.</p>
          <p>Information may be stored in <PH>countries or regions where data is stored</PH>. Where information is transferred across borders, we will use the safeguards the law requires.</p></> },
        { id: "retention", h: "Data retention", body: <><p>We keep enquiry information for as long as it is needed to respond to you and to follow up on a possible project, and for <PH>retention period</PH> afterwards unless the law requires us to keep it longer. We then delete it or make it anonymous.</p></> },
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
      path={ROUTES.terms} name="Terms and Conditions"
      intro="These terms apply to your use of this website. They do not set the terms of any software development project, which are agreed separately in writing."
      sections={[
        { id: "accept", h: "Accepting these terms", body: <p>By using this website you agree to these terms. If you do not agree, please do not use the website. The website is operated by <PH>legal entity name</PH>.</p> },
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
        { id: "law", h: "Governing law", body: <p>These terms are governed by the laws of <PH>governing law and jurisdiction</PH>, and the courts of that place have jurisdiction over disputes, unless the law of your country gives you rights that cannot be waived.</p> },
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
      path={ROUTES.cookies} name="Cookie Policy"
      intro="This policy explains what cookies are and what this website does and does not use them for."
      sections={[
        { id: "what", h: "What cookies are", body: <p>Cookies are small text files that a website can place on your device. Similar technologies, such as local storage, can also keep information in your browser. They are used to make websites work, remember choices, and understand how a site is used.</p> },
        { id: "use", h: "How this website uses them", body: <>
          <p>When this policy was written, we reviewed the pages of this website and found that they do not set cookies of their own, do not write to your browser&rsquo;s local or session storage, and do not load analytics, advertising or social media tracking tools. <PH>Re-check this statement against the live deployment before publication</PH></p>
          <p>Our hosting provider and your browser may still handle technical data, such as server logs, as described in the <Link to={ROUTES.privacy}>Privacy Policy</Link>.</p></> },
        { id: "types", h: "Types of cookies", body: <>
          <h3>Essential cookies</h3><p>These make a website work, for example by keeping a secure session. This website does not currently need or set them.</p>
          <h3>Preference cookies</h3><p>These remember choices such as language. This website does not currently set preference cookies.</p>
          <h3>Analytics cookies</h3><p>These count visits and show how a site is used. None are configured on this website at the time of writing.</p>
          <h3>Advertising cookies</h3><p>These are used to show or measure advertising. None are configured on this website at the time of writing.</p></> },
        { id: "third", h: "Third-party content", body: <p>This website does not embed third-party widgets that set cookies, such as maps, video or social media buttons. If you follow a link to another website, that site may use cookies under its own policy.</p> },
        { id: "future", h: "If this changes", body: <p>If we add analytics or other tools that use cookies or similar technologies, we will list them here, say what each is for and how long it lasts, and where the law requires it we will ask for your consent before they are used. <PH>Add a table of cookies if any are introduced</PH></p> },
        { id: "control", h: "Managing cookies", body: <p>You can block or delete cookies in your browser settings. Doing so may affect how some websites work. Your browser&rsquo;s help pages explain how.</p> },
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
