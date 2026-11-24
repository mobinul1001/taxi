# St Lu Taxi And Tours

A frontend-only clickable prototype for a St Lucia taxi, airport transfer, and tour booking platform, intended for a client demo video.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

The prototype includes the Prototype Hub, phone frames, app shells, reusable component library, Component Gallery, centralized mock data, and passenger onboarding, simulated authentication, booking, simulated payment, confirmation, trips, live status simulation, alerts, refunds, receipts, ratings, and account controls.

No real backend, payments, SMS, or authentication. Authentication screens are simulations; never persist passwords.

Passenger and driver use the same mobile app under `/app/*`; login determines the role. Passenger accounts can sign up, but driver accounts are created by admin and have no sign-up.

The supplied Passenger + Driver App Screens PDFs are the authoritative visual references, including their admin artboards. The user confirmed that the HTML designs were supplied in PDF form. The existing prototype now works: add only explicitly requested missing screens and entry-point changes. Do not redo, restyle or rename existing screens, or change unrelated prices, copy, colors or demo records.

Demo today is always Monday 14 December 2026, independent of the real clock. Fixed prices are USD: Airport Transfer $89.25, Round-Trip $180, Private Tour $199, Full-Day Tour $300; child seat $5, extra stop $8, night pickup $10. Point-to-Point, Chauffeur and Delivery create dispatcher quote requests rather than payment.

Drivers cannot go online/offline or set availability. Driver tabs are Jobs, Earnings, Profile. There is no decline action anywhere in the product; outside drivers can only accept jobs. Trips complete automatically at the destination, never through a manual complete button.

Bookings, trips, statuses, and recipient alerts share one localStorage-backed mock store across passenger, driver, outside-driver job links, and admin views. Changes must remain synchronized across routes and browser tabs. Message previews are available under `/previews/messages`.

Passenger payment is Stripe-only and online payment is required; no cash option anywhere. Payment, refunds, SMS, and WhatsApp remain explicitly simulated. Never persist card numbers or CVCs. Passenger tabs remain Home, Trips, Account; Alerts is accessed from the header bell.

Cancellation more than 24 hours before pickup produces a simulated automatic full refund visible in admin Refunds. Inside 24 hours, show “Dispatcher will review” rather than an automatic refund.

## User preferences

Use React, TypeScript, Vite, Tailwind CSS, React Router, and lucide-react icons. No emojis anywhere in the UI.

Keep replies short, limit edits to the requested scope, and avoid repeated full-app verification or screenshot loops.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
