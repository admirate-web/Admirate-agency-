/**
 * When each hand-authored public page last genuinely changed.
 *
 * This replaces a single `PAGES_UPDATED` constant that stamped every static
 * page with one date. It went stale twice: once when the August title rewrite
 * shipped and the sitemap kept reporting July, and again when the Digital page
 * gained a case study in October and the sitemap still said 6 August. One date
 * for eleven pages also teaches Google to discount the field, because a
 * `lastmod` that moves for every URL at once is not telling it which URL to
 * re-crawl.
 *
 * A date here moves only when that page's copy, title, description or schema
 * changes. Posts and legal documents are not listed: they carry their own
 * dates in their own data.
 *
 * Plain .mjs, like the other catalogs, so `node --test` can read it without a
 * TypeScript step.
 */
export const PAGE_UPDATED = {
  /* 2026-11-17: the homepage gained its plain-language block (services,
     clients, a five-question FAQ) and its two grids moved into the server
     HTML. 2026-11-16: its "what and where" line; titles were rewritten to the
     phrase people search, and each service page's H1 keyword line changed to
     match. */
  "/": "2026-11-17",
  "/services": "2026-11-16",
  "/pricing": "2026-11-16",
  "/start-project": "2026-08-06",
  "/contact": "2026-11-16",
  /* The HTML sitemap gained the Contact link the same day. */
  "/sitemap": "2026-11-16",
  "/services/identity": "2026-11-16",
  "/services/design": "2026-11-16",
  "/services/social-media": "2026-11-16",
  "/services/digital": "2026-11-16",
  "/services/video-production": "2026-11-16",
  "/services/brand-collaterals": "2026-11-16",
};

/**
 * Throws rather than falling back to a default.
 *
 * A fallback date is how the old constant went stale without anyone noticing.
 * The XML route is statically generated, so a page added without a date here
 * fails the build instead of shipping a sitemap that lies about it.
 */
export function pageUpdated(path) {
  const iso = PAGE_UPDATED[path];
  if (!iso) {
    throw new Error(
      `No last-modified date for "${path}". Add it to PAGE_UPDATED in src/components/sitemap/page-dates.mjs.`,
    );
  }
  return new Date(iso);
}
