import { createRoot } from 'react-dom/client';
import { initTheme } from './lib/theme';
initTheme();

import App from './AgencyApp';
import { ErrorBoundary } from '@/components/error-boundary';

// Entry for the agency build (VITE_SITE=agency). The plugin in scripts/agency-site.ts points index.html here,
// so the St Lu app is never imported and never reaches the agency bundle.

import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import './index.css';

/**
 * The build loads the stylesheet with media="print" so it does not hold up the boot splash. That means
 * the app must not render until the sheet is in, or the first frame would be unstyled. Wait for every
 * marked link, but never longer than a moment: a stylesheet that fails is no reason to show nothing.
 */
const styles = () => {
  const links = [...document.querySelectorAll<HTMLLinkElement>('link[data-app-css]')];
  if (!links.length) return Promise.resolve();
  return Promise.race([
    Promise.all(links.map((l) => (l.sheet ? null : new Promise((r) => { l.addEventListener('load', r, { once: true }); l.addEventListener('error', r, { once: true }); })))),
    new Promise((r) => setTimeout(r, 4000)),
  ]);
};

/**
 * The prerendered pages (qa/prerender_agency.py) already hold the page body in #root[data-pre], so text shows at
 * once and crawlers read it. The live app is drawn in a second, invisible container; when its page is on screen
 * it replaces the static copy in one step. Without data-pre (dev server, 404 fallback) it renders into #root.
 */
void styles().then(() => {
  document.getElementById('boot')?.remove();
  const root = document.getElementById('root')!;
  const pre = root.hasAttribute('data-pre');
  let host = root;
  if (pre) {
    host = document.createElement('div');
    host.setAttribute('style', 'position:absolute;top:0;left:0;right:0;visibility:hidden;pointer-events:none');
    root.after(host);
    const y = window.scrollY;
    let done = false;
    const swap = () => {
      if (done) return; done = true; mo.disconnect();
      root.remove(); host.removeAttribute('style'); host.id = 'root';
      if (y > 0) window.scrollTo(0, y);
    };
    const mo = new MutationObserver(() => { if (host.querySelector('h1')) requestAnimationFrame(swap); });
    mo.observe(host, { childList: true, subtree: true });
    setTimeout(swap, 6000);
  }

  createRoot(host, {
    // Keeps caught errors off reportError(), which would raise the dev overlay.
    onCaughtError: (error, errorInfo) => {
      console.error(error, errorInfo.componentStack);
    },
  }).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
});
