# QA scripts (Python + Playwright, Chromium)

Build the static preview first, then pass its absolute folder:

    STATIC_PREVIEW=1 VITE_HASH_ROUTER=1 BASE_PATH=./ npx vite build --outDir /tmp/stlu --emptyOutDir
    python3 qa/e2e.py /tmp/stlu 390 844        # 25 end-to-end checks (booking, payment, dispatch, driver, rating...)
    python3 qa/audit.py /tmp/stlu 320,390,1440  # overflow, one h1, tap size >= 44px, input labels, clipped text
    python3 qa/fit.py /tmp/stlu                 # which fixed app screens scroll on 12 device sizes
    python3 qa/contrast.py /tmp/stlu [dark]     # WCAG AA text contrast on solid backgrounds
    python3 qa/shots.py /tmp/stlu ./shots all 320,375,390,768,1024,1280,1440,1920
