/**
 * The homepage service tiles, rendered into the page's HTML on the server.
 *
 * These were built by the landing script after load, so the server response
 * carried an empty grid. Crawlers that do not run JavaScript (the ones behind
 * ChatGPT, Claude and Perplexity) therefore saw a homepage that offered no
 * services at all. The markup is unchanged from what the script produced.
 *
 * Ten is deliberate: the grid is 5-up on desktop and 2-up on mobile, so both
 * land on full rows. Every name needs a matching key in SERVICE_ICONS.
 *
 * Names are in sentence case on purpose: `.svcblock .nm` uppercases them in
 * CSS, so text readers get "Social media" rather than "SOCIAL MEDIA".
 *
 * Plain .mjs, like clientGrid.mjs, so `node --test` can read it.
 */
export const SERVICES = [
  "Branding",
  "Websites",
  "Social media",
  "Print ads",
  "Lead management systems",
  "Packaging",
  "Video production",
  "Brand collaterals",
  "Reels & shorts",
  "Digital automations",
];

export const SERVICE_ICONS = {
  Branding: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>',
  Websites: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/>',
  Packaging:
    '<path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  "Social media": '<path d="M21 12a9 9 0 11-4-7.5"/><path d="M21 3v6h-6"/>',
  "Video production":
    '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  "Print ads":
    '<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="1"/><path d="M6 17h12v4H6z"/>',
  "Brand collaterals":
    '<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/>',
  "Lead management systems": '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  "Reels & shorts":
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5"/>',
  "Digital automations":
    '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M13 7l-4 6h3l-1 4 4-6h-3l1-4z"/>',
};

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const renderServiceGrid = () =>
  SERVICES.map(
    (name, i) =>
      `<div class="svcblock" style="--i:${i}"><div class="svcin"><div class="srow"><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="ico"><svg viewBox="0 0 24 24">${SERVICE_ICONS[name]}</svg></span></div><div class="nm">${escapeHtml(name)}</div></div></div>`,
  ).join("");
