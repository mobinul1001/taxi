
## v24b — three more agency landing pages (TaxiAppDevelopment.org)

Routes added (agency-only, isolated under `.tad`; St Lu design/colours/routes unchanged):

| Route | Primary keyword | Intent | Unique parts |
|---|---|---|---|
| `/white-label-taxi-app/` | white label taxi app development | buyer of a ready-made branded platform | live brand configurator, included/configure/extra matrix, you-vs-we launch list, trade-off table vs custom, provider checklist |
| `/uber-clone-app-development/` | uber like taxi app development | researcher: how to build a ride-hailing marketplace | marketplace loop, 16-row feature matrix with Rider/Driver/Admin filter, 3-stage roadmap, learn-vs-make-yours, real-time engine |
| `/taxi-dispatch-software/` | taxi dispatch app development | operator: dispatch and fleet | 4 dispatch modes table, interactive dispatch board, console/fleet tools, job lifecycle, channels, reports |

Anti-cannibalisation: booking = passenger flow, custom = decision quiz/scope, dev = pillar, white label = ready-made, Uber = how it works/features, dispatch = operator side. Cross-links use descriptive anchors.

Files: `src/pages/company/{white-label-taxi-app,uber-clone-app-development,taxi-dispatch-software}.tsx` (new), `routes.ts`, `shell.tsx` (nav/footer), `pages.css`, `index.tsx`, `taxi-app-development.tsx`, `custom-taxi-app-development.tsx`, `taxi-booking-app-development.tsx` (links only), `src/App.tsx` (routes), `public/company-sitemap.xml` (7 URLs).

Tested (Chromium/Playwright emulation only): title/meta ≤160, canonical, one h1, JSON-LD (BreadcrumbList, Service, FAQPage), configurator, filter chips, dispatch board assign/auto/none-free, nav + footer links, no console errors, cut-scan 320–1440, St Lu e2e 37/37, hosted + static builds. Mobile fix: channel/report grids now use `.fit4.c3/.c4` classes instead of inline columns.
Not tested: Safari/iOS/Firefox, real phones, Lighthouse.
Limits: SPA runtime meta (crawlers without JS see St Lu's index.html) — deploy agency domain separately or pre-render; canonical domain taxiappdevelopment.org is assumed; forms are front-end only.

## v24c — Services, Cost and Developers pages (TaxiAppDevelopment.org)

| Route | Primary keyword | Intent | Unique parts |
|---|---|---|---|
| `/taxi-app-development-services/` | taxi app development services | commercial: what do I get, which services | deliverables ledger hero, 6-service explorer (ARIA tabs, arrow keys), services-by-situation, stage/deliverable table, layered architecture, after-launch support |
| `/taxi-app-development-cost/` | taxi app development cost | informational/commercial: what drives the budget | cost formula hero, short answer, scope-level tool (relative guide, not a price; sends the summary to the contact form), cost-by-approach table, 8 drivers with impact tags, stage budget, non-development costs, planning steps |
| `/taxi-app-developers/` | taxi app developers | choosing/hiring a team | team-board hero, 6 roles with deliverables, technical areas table, 3 engagement models (radio cards), collaboration rhythm, evaluation checklist with warning signs, freelancer vs in-house vs specialist team |

No invented prices, statistics, client names or team counts: cost content is qualitative and the tool says it is a scope guide.
Cannibalisation: the pillar `/taxi-app-development/` keeps a short cost-factor section that now links to the cost guide, services and developers pages. Cost page is the only page that goes deep on budget; services page is deliverables, not price; developers page is team and hiring, not features.

Files: `src/pages/company/{taxi-app-development-services,taxi-app-development-cost,taxi-app-developers}.tsx` (new), `routes.ts` (3 routes + `taxi-app-developers` in `COMPANY_PATH`), `shell.tsx` (nav: 2 items; footer: services, developers, cost now a real link), `pages.css` (appended; architecture class named `.archx` to avoid the existing `.arch`), `taxi-app-development.tsx` (links only), `src/App.tsx` (3 routes), `public/company-sitemap.xml` (10 URLs), `tools/cut.py` (new routes).

Tested (Chromium/Playwright emulation): title/meta ≤160, canonical, one h1, BreadcrumbList/Service/FAQPage, tabs + arrow keys, scope tool levels and form prefill, model cards, nav and footer links, pillar link, St Lu title restored, no console errors, cut-scan 320–1440 (only hidden-table-header false positives and natural wraps), St Lu e2e 37/37, hosted + static build.
Not tested: Safari/iOS/Firefox, real phones, Lighthouse. Same SPA runtime-meta limit and unconfirmed canonical domain as before.

## v24d — Solutions, Contact and homepage (TaxiAppDevelopment.org)

| Route | Primary keyword | Notes |
|---|---|---|
| `/taxi-app-solutions/` | taxi app development solutions | dark hero with 6 business-type tiles, solution finder (business × fleet size → apps, modules, approach, dispatch, link, prefilled enquiry), 6 business-model cards, operational-need table, fleet-growth path, links to services/cost/developers/dev pillar |
| `/contact/` | taxi app development company contact / consultation | full enquiry form (name, work email, company, business type, what to build, stage, notes), accessible inline validation with error summary and focus on the first error, success state, what-happens-next steps, illustrative brief card, preparation links, FAQ, ContactPage schema |
| `/taxi-app-development-company/` (agency homepage; `/` in production) | taxi app development company | existing homepage kept. Only changes: H1 now carries the primary keyword, new "Explore" section linking to solutions, services, cost, developers and contact |

`/` in this prototype is still the St Lu hub (unchanged). The agency homepage lives at `/taxi-app-development-company/` and its canonical points to `https://taxiappdevelopment.org/`.

Contact form: uses the same fields and the same front-end-only behaviour as the existing enquiry dialog (which is untouched and still opens from "Get a Quote"); nothing is sent anywhere. No email address, phone number or office address was invented, so none is shown.

Files: `taxi-app-solutions.tsx`, `contact.tsx` (new); `routes.ts`, `App.tsx`, `shell.tsx` (nav Contact + Solutions item, footer links, mobile menu), `pages.css` (appended; also styles the mobile-menu links), `index.tsx` (H1 + Explore), `company-sitemap.xml` (12 URLs), `tools/cut.py`.
Tested (Chromium/Playwright): SEO tags, finder, form validation (empty, bad email, success), nav/footer/mobile-menu links, dialog still works, St Lu title restored, no console errors, cut-scan, St Lu e2e 37/37, hosted and static builds. Not tested: Safari/iOS/Firefox, real phones, Lighthouse, real form delivery.
