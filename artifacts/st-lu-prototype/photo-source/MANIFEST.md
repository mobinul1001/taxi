# St Lu sample photos (35, AI-generated). Label as "sample imagery" in the demo.
Sizes: ~1408x768 landscape, welcome-portrait 768x1376. Upscale 2x before using full-bleed on 1920+ screens.

## Slots
hero-landing, hero-app-home, welcome-portrait, og-share      hero/welcome/share
svc-airport, svc-private-tour, svc-fullday, svc-roundtrip, svc-chauffeur, svc-delivery   service tiles
dest-pitons-dusk, dest-marigot, dest-rodney-bay, dest-castries, dest-soufriere, dest-airport-uvf   destinations
fleet-suv, fleet-minivan, fleet-sedan, fleet-interior       fleet
driver-1 .. driver-6                                          driver cards, profile, live trip (crop square, face centred)
pax-couple, pax-family, pax-business, pax-solo                passengers / reviews
driver-app-hero, empty-trips, admin-login, support-team, extra-taxi-pitons   misc

## KNOWN ISSUES (must handle in code or by cropping)
1. Real third-party brand names visible: "Jade Mountain" sign (svc-chauffeur, fleet-sedan, pax-business) and "Anse Chastanet Resort" sign (pax-couple, pax-family). Crop these out or do not use full frame; real resort names must not appear in a client product.
2. Wrong company branding: uniforms, ID badges and vehicle doors show "St. Lucia Premier Transfers / VIP Transfers" (driver-1..6, svc-private-tour, fleet-minivan, support-team, pax-solo). Client is "St Lu Taxi & Tours". Use tight face crops (hide badge and door text); never show driver-6 full frame (large door text). Replace with St Lu logo later when real photos exist.
3. svc-airport: handheld sign text is garbled. Crop it out or use driver-5 (readable "WELCOME: SMITH PARTY" is fine).
4. svc-delivery: shirt logo and parcel label are garbled; use as small tile only.
5. svc-private-tour: van logo text garbled.
6. Faces are AI-generated stand-ins, not real drivers. Never present as real staff.
7. Right-hand drive cars are correct for St Lucia (driver-6, driver-app-hero).
