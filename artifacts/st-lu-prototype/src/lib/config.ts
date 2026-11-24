/**
 * Everything that changes when this prototype moves to its final address lives here.
 *
 * SITE_URL is the public address the prototype is served from. It is used for the absolute URLs that
 * social networks and search engines need (og:image, og:url, canonical, JSON-LD): those cannot be
 * relative, or WhatsApp and Facebook show a share card with no picture. It is a placeholder until the
 * domain is final — change this one line and every tag follows.
 */
export const SITE_URL = "https://demo.stluciantaxiandtours.com";

/** SITE_URL with any trailing slash removed, so `${SITE_ORIGIN}/og-share.jpg` is always well formed. */
export const SITE_ORIGIN = SITE_URL.replace(/\/+$/, "");

/** An absolute URL for a path inside the site, e.g. abs("/og-share.jpg"). */
export const abs = (path: string) => `${SITE_ORIGIN}/${path.replace(/^\/+/, "")}`;

/**
 * The address a link to a screen should carry when it leaves the app (a job link copied into an SMS).
 * The build serves a hash router, so the route has to sit after the "#" or the host answers 404.
 */
export const shareUrl = (route: string) => {
  const base = typeof window === "undefined" ? SITE_ORIGIN + "/" : window.location.origin + window.location.pathname;
  return `${base.replace(/\/+$/, "/")}#/${route.replace(/^\/+/, "")}`;
};
