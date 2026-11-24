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

void styles().then(() => {
  // Take the splash out ourselves rather than relying on React to clear the container.
  document.getElementById('boot')?.remove();

  createRoot(document.getElementById('root')!, {
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
