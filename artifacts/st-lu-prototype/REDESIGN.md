# St Lu Taxi & Tours: UI redesign (v4)

Design-only pass. No route, flow, data field, validation, store key or `data-testid` was removed or renamed.
State keys are unchanged: `localStorage["stlu-store-v3"]`, `sessionStorage["stlu-session"]`, `localStorage["stlu-theme"]`.

## 1. Audit of the previous UI (what looked dated)

- Everything sat on a yellow-beige ground with brown-tinted shadows, so screens felt heavy and low contrast.
- Pill buttons everywhere, 1.5px green outlines, hard-coded hex colours in 100+ class names, radii from 10 to 44px with no scale.
- App headers were large green blocks; the service tiles and summary bars were cramped; tab bar was a floating pill.
- Admin: gradient sidebar, pill filters, a table with no header band, KPI cards without hierarchy.
- Many inputs had only a placeholder (no accessible name); several tap targets were 36 to 40px.

## 2. Design tokens (`src/index.css`, `@theme`)

| Group | Tokens |
| --- | --- |
| Brand | `green #0E6B45`, `green-deep #0A5436`, `green-dark #0A3D2B`, `green-night #072A1E`, `leaf #1BA874`, `orange #F5902B`, `orange-soft #FFC27A`, `orange-ink #231503`, `sea #2FB7A6` |
| Surfaces | `ground #F7F5EF`, `aground #F1EEE6`, `paper #FFFFFF`, `sand #EFE9DB`, `neutral #ECE8DE` |
| Text | `ink #0F1F18`, `neutral-ink #37453C`, `mute #55625A`, `faint #6E7A72` |
| Lines | `line #E6E2D7`, `line-strong #D3CEC0` |
| Status | `ok`, `warn` / `warn-ink` / `warn-soft`, `err` / `err-tint`, `info` / `info-ink`, `plate` |
| Type | Space Grotesk (display, -0.022em) + Inter (body). Scale 11 / 12 / 13 / 15 / 17 / 20 / 24 / 30 / 40 / 56 (`--text-2xs` to `--text-5xl`); fluid `clamp()` on headings |
| Spacing | 4px base; `--space-page`, `--space-section` fluid steps |
| Radius | `xs 6`, `sm 8`, `md 12`, `lg 16`, `xl 20`, `2xl 24`, `3xl 32`, `full` |
| Elevation | `--shadow-e1` hairline, `e2` card (`.shadow-card`), `e3` raised (`.shadow-pop`), `e4` overlay (`.shadow-float`) |
| Motion | `--dur-fast 120ms`, `--dur-base 200ms`, `--dur-slow 360ms`, `--ease-out-soft`; all animation is disabled under `prefers-reduced-motion` |

Dark theme overrides the same tokens under `html.dark` (passenger, driver, landing, hub). Admin stays light-only.

## 3. Components (`src/components`)

`kit.tsx`: Logo, Btn (primary / orange / outline / ghost / white / danger / soft; sm / md / lg), Card, Pill, StatusPill and DocPill (with status dot),
Avatar, BackBtn, ScreenHead, StepBars, ProgressSteps, Toaster, Skeleton (loading), Empty, ErrorState (with retry), OfflineBar, Field, `inputCls`,
Modal (bottom sheet on phones), Drawer, ChannelTags, AlertIcon, Switch, MapArt, ThemeRow, ThemeButton.
`bits.tsx`: RouteBlock, Row, ContactButtons, Sheet, NotifiedBanner, Counter.
`mobile.tsx`: PhoneFrame, Screen (fit-to-viewport body, pinned footer), TabBar.
`art.tsx`: Scene, HeroScene, CarArt and **`Media`**, the image slot. Add real photos to `PHOTOS` in `art.tsx`
(`{ pitons: importedUrl, bay: ..., ... }`) and every tile, tour card and price card switches from illustration to photo.
`admin-shell.tsx`: sidebar (active marker, pending badge), top bar, search, notifications.

## 4. Screen checklist (all restyled; rebuilt layouts marked *)

- Hub `/` *, Landing `/landing` *, Device lab `/lab`, Messages `/previews/messages`, Screen index `/screens`, Outside driver link `/job/:token`, 404
- App entry: Welcome *, Login * (sign-up sheet, reset sheet), Terms
- Passenger: Home *, Book route *, Choose tour, Round-trip details, Trip details *, Fare *, Payment *, Payment failed, Confirmed, Quote sheet, Quote sent,
  Trips, Trip detail, Cancel sheet, Trip cancelled, Live trip *, Rate trip, Receipt, Alerts, Flight delayed, Account (5 sheets), Add card, Log out sheet
- Driver: Jobs *, New trip, Trip detail, Progress, Done, All trips, Trip changed, Earnings *, Profile, Alerts, Renew insurance, Send renewal, Reminder banner
- Admin: Sign in *, Forgot password, Shell *, Dashboard *, Bookings * (quotes, new booking, assign modal, booking drawer, status and cancel modals),
  Live map, Drivers, Driver detail, Passengers, Passenger detail, Pricing, Refunds, Reports, Settings, Account menu

## 5. Behaviour notes

- Fit-to-viewport: screens shrink by at most 8% (`MIN_FIT = 0.92`, was 0.85) so 48px controls never drop under the 44px tap minimum.
  Short screens also hide helper text through `max-height` media queries.
- Document-expiry banner (`banner-doc-expiry`) has three levels, exposed as `data-level`: 0 amber (15+ days), 1 orange (8 to 14 days), 2 red (7 days or fewer, or expired).
- Booking steps 2 to 4 share a sticky route + running total bar (`summary-bar` on Trip details).
- Fallbacks: `dvh` falls back to `vh`; `backdrop-filter` is inside `@supports` with a solid fallback and the `-webkit-` prefix;
  safe-area insets use `max(env(), clamp())`; native selects and date inputs are normalised with `appearance: none`.

## 6. Verification

See the delivery notes for exactly what was and was not tested. Scripts used are in `qa/` (Playwright, Python).

## 7. Stage 2 fixes (award-level brief, Part A)

- **A1** Buttons are single-line by rule (`whitespace-nowrap` in `Btn`); service tabs are an equal-width segmented control with icon + short label; rating tags are a 2x2 equal grid.
- **A2** A new booking starts clean: 1 passenger, 1 bag, no flight, child seat off, extra stop off (`lib/seed.ts`, post-payment reset, landing widget). Old saved drafts are cleaned on load.
- **A3** Driver earnings chart rebuilt: axis + gridlines, payout above each bar, trip count inside it, weekday + date, today highlighted, dotted zero days, tap/hover detail, legend, text summary and a screen-reader table.
- **A4** Rating: no stars and no tags pre-selected; submit is disabled until a star is tapped.
- **A6** Driver login is real: `lib/api.ts` (`AuthApi`) stores a salted SHA-256 hash (Web Crypto, JS fallback on `file://`), checks email + password, shows an inline error, forces "set your own password" on first login, and gives the admin "Reset password" and "Resend login details".
  Seeded demo drivers use the demo password `stlu-demo`. **Local only:** credentials live in this browser's localStorage, so an account created in one browser does not exist in another. Swap `api.auth` for a backend implementation to change that.
  Passenger login is still a prototype (any password of 4+ characters); only driver accounts are verified.

Still open from the brief: real photography + `media.ts` registry, Guided Demo (Part B), real map tiles, welcome redesign on photos, landing fleet/destinations/sticky CTA, admin command palette / sparklines / bulk actions, motion pass.

## 8. Stage 3: one design system, two themes (in progress)

- **Light = Golden Hour, Dark = Island Night.** Same layout, components, photos and copy; only tokens change (`src/index.css`: `@theme` for light, `html.dark` for dark).
  Theme preference is Light / Dark / System (`lib/theme.ts`, key `stlu-theme`), default System. Admin is light-only for now.
- **Type:** Fraunces (`.t-display`, `.t-title`, `font-serif`) for display headings only; Inter for everything functional. Space Grotesk removed.
- **Photography only.** `HeroScene`, `Scene`, `CarArt` are deleted. Photos: `photo-source/` (the supplied pack) -> `scripts/build-photos.py` -> `src/assets/photos` (AVIF + WebP + JPEG, 640 and full width, blur placeholders) -> registry `src/assets/media.ts` -> `<Photo slot="...">`.
  Crops follow the pack MANIFEST (`face-*`, `guest-*` squares; per-slot `pos`). People photos get a "Sample imagery" tag automatically.
- **Tokens added:** green and orange 50-900 ramps, `brand`/`brand-ink` (main action), `cta`/`cta-ink` (primary CTA: orange in light, white in dark), `hl` (headline highlight), photo scrims (`.scrim-*`, `.photo-foot`, `.glass-photo`).
- **Done on the new system:** welcome screen, landing page (hero + widget, trust bar, destinations, fleet, prices, how it works, reviews, FAQ, photo CTA, sticky mobile CTA, OpenGraph image), hub header.
- **Not yet rebuilt:** passenger app screens, driver app, admin, Guided Demo, passenger auth. They already use the new tokens and photos but keep the previous layouts.
- **QA added:** `qa/photo_contrast.py` measures text over photos against the lightest pixels behind it.

### Stage 3 revision (welcome + landing feedback)
- Tablet (768 to 1023): landing hero is two columns with a compact widget over the full photo; welcome is full-bleed with a centred 560px column.
- Headlines: `text-wrap: balance`; landing `.hero-h1` sizes per breakpoint; welcome `.welcome-h1` is always two lines (container units, 34px fallback).
- One header theme button (sun / moon / auto) with tooltip; the three-way selector stays in the landing footer, hub, Account and Profile.
- Placeholder claims are marked in the UI (`.demo-mark`): the rating line ("Sample"), "Licensed and insured" ("To confirm"), review names and cities. Reviews use initials, no photos.
- Fleet: three larger cards with "Transfers from" (lowest fixed fare: the data has no per-vehicle prices) and "Book this vehicle", which adds a vehicle request to the booking note.
- Dark theme: white primary CTA with hover, pressed and mint focus states; outline buttons are translucent.
- The ready build is `static-preview/` at the repository root (the copy inside `artifacts/st-lu-prototype` was removed to keep the zip smaller).

## Stage 4: Guided demo, welcome rebuild, demo bar (v7)

**Contact data.** The phones, address, manager and website in `src/lib/seed.ts` are the client's own
(confirmed from the client brief), so the "To confirm" marker next to "Licensed and insured" on the
landing page is gone. The "Sample" marks on the rating line and the reviews stay: those numbers and
quotes are still placeholders.

**Welcome.** `/app/welcome` no longer renders inside the phone mock-up at any size (`PhoneFrame`
renders it bare). Under 768px it is unchanged: full-bleed photo, content over the foot. From 768px up
it is a two-column screen, `.welcome-*` in `index.css`: photo 58%, content panel 42% with the logo,
headline (`clamp(36px, 4vw, 56px)`), two-line subtext, three trust chips in a row, full-width
Create account / Log in (52px) and Skip at the top right. The panel is narrow between 768 and 1119px,
so the chips use their short labels there (`.chip-short` / `.chip-long`).

**Demo bar.** The four Simulate buttons are gone from the bar. They still exist, in the hub's Demo Mode
card, so screens N11, N12 and N17 are still reachable. Step names are never cut: under 1024px the bar
shows "Step n of 5" with the full title and arrows, from 1024px up every pill is shown in full in a
strip that scrolls the active step to the centre.

**Guided demo (`/demo`).** `src/pages/demo/`:
- `script.ts` holds three scenarios. Every step carries a COMPLETE state snapshot, so Back, the step
  list and Restart are exact replays rather than reverse side effects. This state is its own: running
  the demo never touches `stlu-store-v3`, so the client's bookings and revenue are not disturbed.
- `frames.tsx` renders the passenger phone, the driver phone and the admin panel from that one
  snapshot, which is what makes the three move together. `MapPanel` is a neutral route panel (no
  illustration); the live build draws Leaflet + OpenStreetMap in the same box.
- `index.tsx` is the layout: 1440+ Passenger | Admin | Driver, 1024-1439 Passenger | Driver with the
  admin collapsed to a compact feed, under 1024 one frame at a time with a tab switcher and the
  narrator on top. Auto-play with speed, Back / Next, a step list, Restart, and a message lane that
  keeps SMS and WhatsApp toasts off the frames.
- `?scenario=cancel&step=3&play=0` opens the demo at an exact point (review links, screenshots).
- `prefers-reduced-motion`: no auto-play, no pulses, no transitions; steps advance only on Next.
- Entry points: "Watch the demo" on the landing page and the welcome screen, a Guided Demo card on the
  hub, and a Guided demo button in the demo bar.

**Checked (Chromium only):** `qa/e2e.py` 37/37 at 320x568, 390x844, 768x1024 and 1440x900 (two new
tests cover the demo); `qa/audit.py` over 58 routes at 320, 375, 768, 1024, 1440, 1920: no overflow, no
tap target under 44px, no unlabelled input, one h1 per page; `qa/contrast.py` light and dark: 0 failing
pairs; `qa/photo_contrast.py`: 152 elements over photos, none below AA; the demo at 320-1920 in both
themes: no overflow, no clipped label, nothing under 12px.

## Stage 5: the real map, demo frames at a fixed design box (v9)

**Map chrome.** No Leaflet scale control and no attribution strip: the credit sits behind a small
circled i (44px tap area) that opens "© MapTiler © OpenStreetMap contributors" in a popover. The
button, the zoom pair and the recentre button are positioned from the `insets` the screen passes in,
so they always sit above the bottom sheet. `attributionControl` is off, so no Leaflet prefix anywhere.

**Tiles.** `public/map/tiles` holds the client's MapTiler pack (333 tiles, zoom 9-14, 2.9 MB) and
`scripts/build-routes.mjs` turns their `routes.json` into `src/assets/routes.gen.ts` (16 routes,
25,001 points simplified to 6,803 at about 6 m, which is under a pixel at zoom 14). `src/lib/roads.ts`
resolves a trip to a route: exact key, reverse key reversed, nearest endpoint pair, then the built-in
SVG map as the last resort. The hairline seam between tiles is closed with
`.leaflet-tile { outline: 1px solid rgba(132,202,249,.01) }`; the container background matches the
tile water colour in both themes so the area outside the pack reads as sea.

**Framing** (`frame()` in `src/components/tile-map.tsx`). A map zoomed out past about 12 shows no road
names, so a long trip is never framed end to end on a phone:
- plan a ride: both pins if that keeps zoom 12 or deeper, otherwise the pickup end with a
  "Show full route" chip;
- on the way: driver and pickup together, never further out than zoom 10, closing in as the driver nears;
- at pickup: zoom 15.5 on the pickup, with the car on the first point of the route;
- onboard: follows the car at zoom 14, centred a little ahead of it so the road ahead is visible;
- admin: the whole island until a trip is selected, then that trip.

**Teardown.** Every map move is guarded by Leaflet's own `_loaded` flag plus a connected-element
check, the map is built one tick after mount (a screen the user passes straight through never builds
one) and destroyed 400 ms after unmount, so anything Leaflet had already queued runs against a map
that is still whole. The e2e gate no longer ignores any JS error.

**Demo frames.** `src/pages/demo/frame-box.tsx`. Each frame lays its screen out at a fixed design
width (phone 360, admin 560 or 680, compact feed 300) and a design height that follows the room
available, then scales the whole box with a CSS transform. Columns share the width in proportion to
their design width, so every frame gets the same scale. Base text in the frames is 13px and the scale
never drops far below 1, so the smallest text measured on screen is 12.1px at 1024x768 and 12.4px at
1440x900. Nothing is cropped and nothing scrolls. On a 320px phone the frame is not scaled at all: it
renders at full size, where text stays at 13px. The tap ring is on the pressed element only.

## Stage 6: adaptive layouts, the demo bar, honest driver photos (v10)

**Desktop is no longer a phone on a desk.** From 1024px the app shell is two panes: the screen keeps a
column of 400-460px on the left and the map it is talking about fills the rest on the right
(`SideMap` in `src/components/mobile.tsx`). The map follows the person: the trip whose reference is in
the URL, else their next open trip, else the island. Driver screens get the same shape, so a dispatcher
on a laptop sees the job on the left and the road on the right. Between 768 and 1023 the app stays a
single column, with a taller map inside the screens. Below that nothing changed.

**The demo bar changes the data, not just the page.** `src/components/demo-bar.tsx` is one compact bar:
"Demo · Step n of 5 · <what happens>", Back, Next, Guided demo and a close button. Next applies the step
to the booking the tour is following - assign a driver, drive to the pickup, complete the trip, rate it -
so step 4 can never still read "Awaiting driver". The tour locks onto one booking at step 2 and keeps it
to the end. Back walks back through the screens without rewinding the trip, because a trip that has been
driven cannot be un-driven. The bar sets `--demo-bar` to its own height and the app shell is
`calc(100dvh - var(--demo-bar))` tall, so it never covers the phone's bottom nav.

**Zoom is capped at the tile pack.** The deepest tiles are zoom 14, so the map's `maxZoom` is 14 and
`zoomSnap` is 1. Nothing is ever enlarged past the detail that exists, and whole-number zoom means the
browser never resamples a tile - which is what left a hairline seam between tiles. `qa/seam.py` checks
for seams pixel by pixel inside the map on Plan your ride, Live trip, Driver progress and the Admin Live
Map, light and dark.

**Demo frames fit by trimming, never by cutting.** Rows marked `data-trim="1|2|3"` come off level by
level as the frame gets shorter, and a frame measures its own content after every render and drops
another level if it still does not fit. `qa/framecheck.py` walks all ten steps at six window sizes and
fails if any frame's content is taller than its box, if a control is covered or below the fold, or if
any text would land under 12px.

**Driver portraits.** Drivers show their photo from the pack (`Face` + `driverFace`) on the live trip,
the trip detail, the driver's own jobs and profile, the admin driver list and detail, and the assign
dialog. Every screen that shows one carries the line "Driver photos are AI-generated sample imagery."
Passengers keep initials: the pack has no passenger portraits.

**404.** One branded page for all three shells: logo, the coast-road photo full bleed, "This road does
not lead anywhere.", "Plan a ride" and "Back to home", the dispatch number +1 758-732-4553 and the
Morne Fortune address. Inside /admin it keeps the admin shell and the top bar says "Page not found"
instead of "Dashboard".

## Stage 7: full responsive pass (v11)

**Tablets get the whole window.** The centred 760px column is gone, so between 768 and 999 there are no
gutters down the sides. The two-pane desktop layout now starts at 1000px rather than 1024, because a
"1024" browser window is 1009px wide once the scrollbar is counted. The pane width is one CSS variable
(`--pane`), so the layout and anything positioned beside it always agree. On a tablet the Explore grid
is three across and two down, capped at 520px tall, instead of six photo cards 440px high.

**The side map follows the page, it does not pick a trip.** Home, Trips and Account show the island with
six named places (UVF, SLU, Castries, Rodney Bay, Soufriere, Pitons); Plan your ride shows the island
until both places are chosen and then the whole route, live, as they change; a trip page shows that trip
and nothing else. The pill above the map says what is on it. The zoom floor that keeps roads readable is
a phone rule, so the side map passes `fitAll` and always shows the whole route.

**Tile seams.** The seam people saw was the hairline `outline` that had been added to close it: at a
device pixel ratio of 2 an outline (and equally a 257px or 258px stretch, with or without a compositing
hint) renders as a white line between tiles. Tiles are back at their own 256px with no outline and no
transform; whole-number zoom is what actually keeps the grid on exact pixels. `qa/seamreal.py` checks
this in a real, headful Chrome at dpr 1 and dpr 2, at 1367px and 390px, light and dark.

**Text is never shrunk.** `FitBody` used to scale a screen down by up to 8% to avoid a scrollbar, which
turned 12px labels into 11px ones on short phones. MIN_FIT is now 1: screens scroll instead, and the
responsive gate measures effective text size including any zoom or transform above an element.

**The responsive gate** (`qa/respgate.py`) walks 18 devices from iPhone SE to 2560, light and dark,
across 26 pages plus all ten demo steps - 1,296 page states - and checks: horizontal overflow, tablet
gutters, button-over-button overlap, clipped text, text under 12px effective, text squeezed to a sliver,
tap targets under 44px (counting the invisible `::after` that several controls use to extend their hit
box) and JS errors.

## Stage 8: one map per screen, admin dark, the job link (v12)

**One map per screen.** From 1000px the passenger live trip, Plan your ride and the driver's progress
screen no longer render their own map at all - the block is not hidden, it is not built. The back button
and the status pill move into a plain header, and the pane below it is all content. Below 1000px the
in-page map is there as before and the side pane is not. `qa/respgate.py` counts visible Leaflet
containers per page and fails if a page ever shows two.

**Admin dark mode is real.** `forceLight` is gone from the admin shell, the few hard-coded whites (live
map cards, the account menu, the booking drawer header and its status select) now use the paper token,
and the Light / Dark / System control sits in the admin top bar. The gate samples the background of
every visible element in dark mode and fails on a light card or panel; the white primary button is the
dark theme's CTA and is excluded by design.

**Admin filters stay a row.** The bookings toolbar is one grid: search and New booking share the top row
from 768 up, the four filters sit under it in four equal columns, all 44px tall. On a phone: search, a
2x2 grid of filters, then the button. The gate fails if three or more selects in one container end up on
more than one row above 768.

**The job link.** Below 1000px the map is a full-width picture under the job (16:10, up to 360px tall)
rather than a 194px strip beside the text; from 1000px it is a tall column next to a 520px content
column. It fits the whole route with both ends labelled. Under 400px Call and WhatsApp share a row and
Maps takes its own, each 56px tall.

**What the gate checks, as of v12.** `qa/respgate.py` walks 18 devices (320x568 up to 2560x1440),
light and dark, across 26 pages plus all ten demo steps and reports: horizontal overflow, tablet
gutters, button-over-button overlap, clipped text, text under 12px effective, text squeezed to a
sliver, tap targets under 44px, visible maps per screen, filter rows that break into several rows
above 768px, light panels in dark mode, and JS errors. `qa/framecheck.py` checks the demo frames,
`qa/seamreal.py` checks tile seams in a real headful Chrome at dpr 1 and 2, `qa/contrast.py` checks
text contrast in both themes, and `qa/e2e.py` runs the 37 flows at eight window sizes.

## v13 - the start page speaks plain English

The client opens the subdomain alone, with nobody to guide them, so every word on the first screen now
explains itself. Nothing about how the prototype works has changed: the same switch, the same four
events, the same reset, the same logins.

**A welcome line.** The page opens with one sentence saying what this is and that nothing here is real -
no payments are taken and no messages are sent.

**"Demo Mode" is now "Guided tour".** Under the title: follow 5 steps to see a full trip from booking to
rating. The switch is labelled "Show tour bar" in visible text, not only for screen readers. The five
steps are rows you can click: an icon, the step number and title, one line saying what happens in plain
words ("You book a ride and pay"), and an arrow on the right. The step you are on is highlighted.

**The "Simulate ..." buttons are gone.** In their place, "See what happens next" - four equal cards:
New trip alert, Passenger arrives, Flight delayed, Driver reminder. Each has a one-line gist. Clicking
one shows a message saying what happened and a link to the screen where you can see it ("Open the driver
app"). With the tour bar off the four cards are disabled and a line under them says to turn it on.

**"Demo data" is now "Sample data"**, with one sentence: everything you see is sample data, saved only in
this browser. The button says "Reset sample data" and keeps its confirmation. The three logins became a
"Try as" row of chips - Passenger Maria Thompson, Driver Marcus Joseph, Admin Samuel Green - that log you
in as that person in one tap.

**The tour bar reads itself.** The "DEMO" badge became "Tour - Step 5 of 5" with the step's plain-words
line beside it. On a phone the bar is two rows: the step above, then Back / Next / Exit tour as three
equal 44px buttons. "Guided demo" became "Full tour", and the close X now carries the words "Exit tour".

**Nothing hides under the bar.** The tour bar is fixed to the bottom of the window, so every page that is
not inside the app shell now reserves its height (`.bar-clear`), the landing page's sticky "Book now" bar
and the desktop "Back to start" pill sit above it, the admin sidebar ends above it, and the 404 page
clears it too. A new check walks 11 pages at six widths with the bar on, scrolled to the bottom, and
fails if any button or link ends up underneath it: 66 states, all clear.

## v16 - the fix list, worked through

A batch of the audit findings, in the order the client would meet them.

**The start page and the way around.** "Create account" on the welcome screen opened nothing: the hosted
build runs on a hash router, so the query string lives in the hash and `location.search` is empty.
Reading it with `useSearchParams` fixes it for both router shapes. The job link the office copies for an
outside driver pointed at `https://host./job/<token>` - no `#`, so the host answered 404; `shareUrl()`
in `src/lib/config.ts` now builds it from the real origin and path.

**Nothing claims to send anything.** The start page promises no messages are sent, so the screens that
said "A receipt was sent by email", "Reset link sent by email" and "Sent by SMS and WhatsApp to ..." now
say what the real app would do and that nothing is sent here.

**All screens reads as a page, not a test matrix.** The N01-N24 codes and the bracketed "(drawer,
Cancel)" notes are gone from the cards, the heading is "All screens", and the two sections called "New
screens" are now "More passenger screens" and "More driver screens".

**Search and social.** The prototype is `noindex, nofollow`: it should not compete with the company's
real site. `SITE_URL` in `src/lib/config.ts` is the one place the address lives, and the canonical link,
the Open Graph and Twitter tags and the JSON-LD `TaxiService` block are built from it, absolute, so a
link shared on WhatsApp carries its picture. Every route sets its own `<title>`.

**First paint.** The page used to be blank for 27 seconds on a 3G connection: nothing could draw until
1.3 MB of JavaScript had arrived, because the CSS was inside it. Now `index.html` carries a small
branded splash that needs no stylesheet and no script, the stylesheet loads off the critical path
(`media="print"`, swapped in by `main.tsx` before the first render), and the admin panel, the guided
tour, the device lab, the screen index and the map library are separate chunks.

| connection | splash | start page usable |
| --- | --- | --- |
| fast | 0.04s | 0.2s |
| slow 3G (400 kbps) | 0.6s (was 27s) | 17s (was 30s) |
| 2G (150 kbps) | 1.0s | 44s (was 70s) |

**One control per thing.** The account screen had a "Dark mode" switch above an Appearance segment that
set the same value; the start page and the landing page each had two theme controls. One each now.

**Forms say what is wrong, where it is wrong.** The route step, the payment step and the landing quote
form put the message under the field in red with `aria-invalid`, the way the login screen always did,
instead of a toast that appears elsewhere and fades. Payment also formats the card number in fours and
the expiry as MM / YY, and checks the month, the length and the name.

**The landing page.** The native date and time controls are gone: they drew differently in every browser
and showed the date US-style. In their place, selects that read "Mon 14 Dec 2026" and "3:00 PM". The
header carries a call button on a phone. Under the hero: fixed price, no cash, free cancellation 24h.
The "Sample" chip has left the rating line for a footnote. On a phone three steps of "How it works" sit
just under the hero rather than four screens down, and the header's "Book now" stands down while the
sticky price bar is up.

**Recovery.** A stored state with the right version but the wrong shape used to throw on every load, and
the error screen's "Try again" could not help. `load()` checks the shape, and the error screen offers
"Reset sample data and reload".

Also: the admin card says it opens signed in as Samuel Green with no password; the dashboard's two
cards end at the same height; the two Tailwind default shadows are brand tokens; the dead hidden block
in the booking screen is gone; the reset dialog no longer quotes a count that the card beside it
contradicts; the two logo lockups on the landing page have ids of their own; the driver's waiting timer
counts from a clock instead of adding one a second; the signup phone is required; app screens have a
`main` landmark; and the old-browser probe now tests `@property`, `:has()` and `dvh`, which Firefox 113
to 127 passed without.

## v17 - phone sizes and the client's own page

**Home, phone.** The Explore cards are at least 140px tall (163x140 at 375, 170x140 at 390, 190x140 at 430),
the title is 16px and the price 18.5px. A single-column 16:9 variant was built and compared; it showed only
about two cards per screen, so the two-column grid stayed. "Photos are AI-generated samples." sits under the cards.

**Admin Settings, 320.** A team row stacks below 480px: the name and email take the full width, the role
select and delete button sit below. The SMS and WhatsApp template boxes grow with their text
(`AutoTextarea`), so no template is cut off at 320.

**Landing, phone.** The sticky price bar hides while a field in the quote form has focus, and it is out of the
tab order while hidden. The page already had bottom padding for the bar.

**No invented reviews.** The "Sample reviews" cards (made-up names) are gone from the client's page. In their
place a four-item "Why book with us" strip: fixed price per vehicle, free cancellation for 24h, licensed and
insured drivers, card payment with no cash. These are the business rules, not claims about people.

**Start page.** The destination mosaic is unchanged.

Checked: respgate (all zero), e2e at 320/375/390/768/1009/1280/1440/1920 (37/37 each), framecheck (0 bad of 60),
contrast (0 failing). Seen in the Viewport Resizer extension in Chrome, see the report for the device list.
Not tested: Firefox, Safari, real devices, Lighthouse.

## v18 - the reviewer's list (43 device sizes)

**Sign-in, welcome, 404: one screen, no map.** From 1000px the welcome screen no longer renders the side map
under itself (that was the second screen of scroll). Login and terms keep their two-column layout but the
right column is a photograph, not a map. Checked on all 44 sizes: scrollHeight <= viewport, zero maps.

**The island map.** Place labels are now placed in screen pixels on the free side of each dot (preferred side,
then the others, never over another label, a dot or the map edge) and redone at every zoom. The island view
frames the island to fill the container (a quarter-step zoom, only in this view) and does not allow zooming out
past it, so the neighbouring islands never show. The "Back to start" pill and the credits button keep apart.

**Short windows.** When the visible map above a sheet is under 300px, its buttons (Show full route, zoom,
recentre) sit in a row along its foot instead of a column that ran up into the Live pill. Under 400px height
nothing is pinned: the screen, its footer button and its tab bar scroll together (payment, plan your ride,
live trip, driver progress). Driver progress and plan your ride keep a map of at least 180px.

**Landing header.** Solid, with blur, once scrolled: nothing shows through it.

**Very large screens.** From 2400px the whole page scales 1.25x, from 3400px 1.5x (`--z`; the full-height
rules divide by it because viewport units are not zoomed). The two panes are wider there too. From 1400px the
Explore cards are 180px tall, three across.

**Guided demo.** Frames are no longer scaled down: below 960 wide the old scale put 13px text at 8-10px. A
frame lays out at the width it has and the stage scrolls when it is shorter than the frame.

**A seam found on the way.** On a 2x screen a 1px bright line could cross the map when the centred shell sat on
a half pixel (it was in v17 too). The shell's left edge is now rounded to a whole pixel pair.

Checked: respgate on 44 sizes (the user's list plus 1009, 344x882, 673x841) x light/dark x 26 pages + 10 demo
steps: all zero after the fixes (one 320x240 map under 160px was found and fixed); welcome/login/404 one screen;
e2e 37/37 at 8 sizes; framecheck 0/60; contrast 0 failing; real-Chrome seam check 0 rows.
Not tested: Firefox, Safari, real devices, Lighthouse.

## v19 - last two fixes

1. **Pin label vs controls on short maps (768x576, 800x600, 960x540).** Cause: the map's `maxBounds` is the island, so
   a pickup near the southern tip (Hewanorra, UVF) could not be panned up above the control row. On short maps
   (`rowStack`) the bounds now get a sea margin (`BOUNDS.pad(0.3)`, the container's own sea colour), and framing
   centres the pin in the free area above the controls (`fpad`, `view()`). Checked: live trip, Driver progress, Plan your ride.
2. **4K.** At 3400px and above the page zooms 1.75 (2.0 from 4200px) and the admin content max-width is 2000px, so the
   dashboard fills the screen. Landing, start page and app home were re-checked at 3840x2160 and 4500x3000.

Auth is a front-end mock (hardcoded demo driver password, no passenger check). Must be rebuilt server-side (hashed passwords, HttpOnly cookie, random expiring job tokens, CSP headers) before production.

## v20 - landing form truncation + header at 320-360

**Fix 1 - Landing hero form (Date was cut at 390-430px).** Date options now use the short label (`Fri 18 Dec`, no year). Pickup/Drop-off options use short names (`Charles Airport`, `Pointe Seraphine`) and sit in a single column. Date and Time stack below 390px and at 768-1023px, so no select value shows an ellipsis. Measured widest option vs field width at 344, 360, 375, 390, 393, 412, 430, 768, 1009 (light and dark).

**Found during the Viewport Resizer pass (Chrome emulation):**
- The `St Lu` wordmark wrapped to two lines at 344 and 360. `Logo` now uses `whitespace-nowrap`.
- Header `Book now` overflowed at 320. It is hidden below 340px (the sticky bottom bar already carries the Book now CTA there).

**Method note.** The extension only resizes the viewport; screenshots taken straight after a resize can show the previous layout for about a second (React re-renders on the media-query change). Pages were judged after a 2 second wait. Chrome only: no Safari/iOS, Firefox or real-phone testing, and no Lighthouse run.

No functionality, route, data or copy change other than the short option labels. `SITE_URL` is still the placeholder. README auth line unchanged.

## v21 — four visual fixes (design only)
1. Admin tables (Drivers, Passengers + detail, Refunds, Reports, Quotes): each renders as a card list when its own container is too narrow (hook `useBoxWidth`), the real table otherwise. Never a table with a cut column or a sideways scroller.
2. Demo page on phones: short "Start" label under 420px, scenario dropdown on its own full-width row, full step description (no line clamp), bottom step select shows the full title.
3. Admin Settings reminder selects: auto-fit grid so the full value ("24 hours before", "1 hour 30 minutes before") shows.
4. Map labels: tile-baked town names (Vieux Fort, Soufriere, Castries) are blurred under every pin/dot (own Leaflet pane `knock`), so the pin label is the only name there.
Also: Home "Airport, hotel, beach or tour" no longer truncated at 344px. New QA tool `qa/cut.py` (cut selects, sideways scrollers, ellipsis text).
Tested with Chrome emulation only (Playwright), not Safari/iOS/Firefox/real phones.

## v22 — phone-width fixes (320–360), design only
1. Driver Earnings chart: "Today" label never wraps (nowrap + tighter tracking under 380px).
2. Admin Passengers cards: email on its own full-width row under the name. Also fixed: Account email (own row), Account "Call dispatcher" row (number moves under the label under 380px), Driver detail email (stacked header under 480px, email overflowed the card), Driver detail "Payouts" figure (fluid size), Landing "per vehicle" (own line under 380px).
3. Maps: bigger blur patch under every pin/dot (Live trip 768 "Vieux Fort" gone), and a 30px soft rim on every map edge so a cut place name never shows as a fragment; pin labels keep 30px from the edge.
4. Admin Settings: Address is a growing field (two lines when needed, Enter blocked), Website field gets tighter padding under 340px, so the full value always shows.
QA: tools/cut.py now also finds words broken mid-word and text inputs that cut their value.
Chrome emulation only (Playwright). Not tested: Safari/iOS/Firefox, real phone, Lighthouse.

## v23 — button label and stacked-button fixes (design only)
1. Driver progress / Live trip / Trip detail contact row: second button label is now "Navigate" (was "Google Maps", wrapped at 320-375); same link. Buttons never wrap (nowrap), Call and Navigate stay equal.
2. Admin Driver detail actions: full-width equal stack under 480px, 2x2 equal grid from 480px, one row of four from 1500px. Mark unavailable keeps its red style. Email never leaves the card (v22 stacked header).
3. Start page: pill "Everything is dated Mon 14 Dec 2026" has a short form "Dated Mon 14 Dec 2026" under 380px (it wrapped); the Try as chips and Reset button are equal full-width under 480px.
4. Map rim: wider, softly tinted vignette (58px sides, 40px top/bottom) so cut place names at the map edge fade out; pin labels keep clear of it.
QA: tools/cut.py now also reports button/pill labels that wrap and stacked buttons with ragged widths.
Chrome emulation only. Not tested: Safari/iOS/Firefox, real phone, Lighthouse.

## v24 — TaxiAppDevelopment.org pages (mother company)
- Routes (all lazy, files in `src/pages/company/`): `/taxi-app-development-company/` (homepage; in production this is `/`), `/taxi-app-development/`, `/taxi-booking-app-development/`, `/custom-taxi-app-development/`.
- Own palette (navy / electric blue / cyan, Inter), all CSS scoped under `.tad`, so St Lu colours and the St Lu light/dark toggle are untouched. Shared parts: `shell.tsx` (header, footer, dialog, FAQ, CTA), `seo.tsx` (title, meta, canonical, JSON-LD, breadcrumbs), `routes.ts`.
- Keywords: homepage "taxi app development company"; page 1 "taxi app development" (pillar: parts, business types, cost factors, process); page 2 "taxi booking app development" (booking flow + dispatch); page 3 "custom taxi app development" (custom vs white label, scope builder, phases, architecture). Each links to the other two with descriptive anchors.
- SEO is set at runtime per route and restored on leave: title, meta description, canonical (`https://taxiappdevelopment.org/...`), og/twitter text, JSON-LD (BreadcrumbList, Service, FAQPage; Organization + WebPage on the homepage). Because this is a client-side app, crawlers that do not run JavaScript still see St Lu's static tags; the agency pages need their own deployment or pre-rendering to be indexed properly.
- `public/company-sitemap.xml` lists the four agency URLs (to be served at the agency domain's `/sitemap.xml`).
- Edits to existing files: `src/App.tsx` (lazy imports, 4 routes, title guard) and `src/pages/hub.tsx` (one small link line). No dependency added, no backend/auth/data change, `SITE_URL` unchanged.
- Contact / quote / newsletter are front-end only. About, Blog, Privacy, Terms show "not part of this prototype yet".
- Checked (Chrome/Playwright emulation only): cut-scan at 10 sizes x light/dark, keyboard and interaction tests, St Lu e2e 37/37. Not checked: Safari/iOS/Firefox, real phones, Lighthouse.

## v27: legal and supporting pages (TaxiAppDevelopment.org)

New routes (all lazy, all under `.tad`): `/privacy-policy/`, `/terms-and-conditions/`, `/cookie-policy/`, `/disclaimer/`, `/about-us/`, `/faq/`, `/sitemap/`, `/thank-you/`.

- `legal.tsx`: shared `DocPage` (TOC, draft notice, "Last updated" placeholder) plus Privacy, Terms, Cookies, Disclaimer. No JSON-LD on legal pages.
- `pageIndex.ts`: `PAGE_INFO` is typed against `ROUTES`, so a new route cannot be added without classifying it. The HTML sitemap is generated from it (thank-you is `hidden`).
- `formFlow.ts`: `submitEnquiry()` + `DELIVERY_LIVE`. The contact page and the "Get a Quote" dialog both call it; success goes to `/thank-you/` with router state, failure shows an inline error. `DELIVERY_LIVE = false` still, so the thank-you page says plainly that nothing was sent. Direct visits show "No enquiry has been sent".
- `seo.tsx`: optional `robots` param (thank-you uses `noindex, follow`; restored on leave).
- Footer: About, Sitemap, Privacy, Terms, Cookie, Disclaimer, FAQ are now real links.
- `public/company-sitemap.xml`: 7 URLs added (not thank-you).

Placeholders `[...]` (class `.phold`) that need the owner: legal entity, registered address, contact email, dates, governing law, retention period, providers, security measures, storage location, data-protection legal bases. Legal pages are general drafts, not legal advice.

Remember: `index.html` still has the prototype's global `noindex, nofollow`; remove it on a real agency deployment.

## v28: SEO audit and fixes (agency pages)

Crawled all 20 agency routes in a real browser (title, meta, H1-H3, in-body links, JSON-LD, word count).

- Metadata: Dispatch title/H1/description/Service schema now lead with "taxi dispatch software" (matches URL and intent, no longer overlaps the "taxi app development" cluster). Contact title/H1/description no longer target "taxi app development company" (that belongs to the homepage). About title no longer repeats it either.
- Internal links: new `related.tsx` (`<Related page=... />`) adds a "Related pages" block with descriptive, varied anchors and a contact link to the homepage, About and the 9 service pages. Map is in `MAP` in that file.
- Content: Dispatch page gets "Accounts, invoicing and driver payouts"; About gets "Who we build for". No statistics, prices or client claims added.
- Verified: no duplicate titles/descriptions, all descriptions <=160, no broken internal links, XML sitemap matches routes (homepage is `/`), thank-you stays noindex and unlisted.

## v29: Formspree wired in

`formFlow.ts` now posts enquiries as JSON to `https://formspree.io/f/xkjrpado` (plain `fetch`, no new dependency) and `DELIVERY_LIVE = true`, so the thank-you page no longer shows the prototype note. Used by the contact page form and the "Get a Quote" dialog. Failure (HTTP error or network) keeps the visitor on the form with an inline error. Footer newsletter form is still front-end only. Privacy policy form section updated to name Formspree.
Fixed: hooks in `ContactDialog` were declared after the early return, which stopped the dialog from opening.

## v30: technical SEO infrastructure (agency build)

- `src/pages/company/routePaths.ts` (pure data) feeds both the app routes and the build plugin; `routes.ts` re-exports it and sets `ROUTES.home` to "/" in the agency build.
- `src/AgencyApp.tsx` + `src/main-agency.tsx`: agency-only app (own 404 page, noindex). `scripts/agency-site.ts`: build plugin (head swap, sitemap.xml, robots.txt, _headers, _redirects, assets). `qa/prerender_agency.py`: per-page head. `public-agency/`: agency favicon and 1200x630 share image.
- `src/lib/box-width.ts`: `useBoxWidth` moved out of the St Lu mobile module so the agency bundle no longer pulls in the St Lu map and 205 photos (16 MB to 1.4 MB). `components/mobile.tsx` re-exports it, so St Lu code is unchanged.
- Links from agency pages to the St Lu prototype use `StluLink` (router link in the prototype, normal link to the demo host on the agency site).
- Schema: Organization and WebSite now carry `@id`s and are on the homepage; pages reference the same WebSite.
- The St Lu prototype build is untouched: its `index.html`, `noindex` and `SITE_URL` are as before.

## v31: Contact and Get a Quote are one page
- Footer line "Client project: St Lu Taxi & Tours" removed (`shell.tsx`).
- Every "Get a Quote" / "Contact" / quote CTA now goes to `/contact/` (same page). The quote dialog is no longer opened (code kept, unused).
- A CTA that carries a project type or notes pre-fills the contact form (`kind`, message) via router state. On the contact page itself the button scrolls to and focuses the form.
- Other St Lu mentions (home "Featured project", About client-project section) untouched.

## v32
- Case study hosting: the St Lu prototype is built (hash router) into `agency-build/st-lucia-taxi-app/`. "Open the St Lu prototype" = `/st-lucia-taxi-app/`, "View the St Lu website" = `/st-lucia-taxi-app/#/landing`. Marked noindex via `_headers`. `npm run build:agency` builds both.
- Legal pages: no placeholders or draft banner. Legal entity "Taxi App Development", no postal address, no email, no governing-law section. Services disclosed: Netlify, Formspree, Microsoft Clarity. No cookie banner.
- Footer rebuilt: brand, social icons (unlinked until official URLs exist), Services, Company, Contact (form link and working hours Mon to Fri 9 to 5 ET), newsletter wired to Formspree, legal links in the bottom bar.
- Blog button removed until a real blog exists. Fake admin.example.com URL bar removed from the mockup.
