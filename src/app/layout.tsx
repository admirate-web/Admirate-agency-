import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import { Sora, Lato } from "next/font/google";
import { SITE } from "@/lib/seo";
import { organizationSchema, websiteSchema, ld } from "@/lib/schema";

/**
 * The type stack, self-hosted.
 *
 * These were once three families on one `<link rel="stylesheet">` to
 * fonts.googleapis.com. That link is render-blocking and cross-origin, so on a
 * throttled mobile connection the browser could not paint until it had done a
 * DNS lookup, a TLS handshake and a round trip to Google — then discovered the
 * CSS inside pointed at a *second* origin (fonts.gstatic.com) and had to
 * connect again before a single glyph existed. Lighthouse put the cost of that
 * chain at ~2.3s of blocked rendering, which was the largest single item on the
 * report by an order of magnitude.
 *
 * `next/font` downloads the files at build time and serves them from this
 * origin, so:
 *   - the CSS is inlined in the document — no blocking request at all
 *   - the font files are preloaded from a connection already open
 *   - the two preconnects and both Google hosts leave the CSP entirely
 *
 * `variable` exposes each family as a custom property. The page stylesheets map
 * their own `--display` / `--body` / `--mono` onto these, keeping the literal
 * family name behind it as a fallback so a page still renders in the right
 * shape if a font ever fails to load.
 */

/* Headings are Sora Bold, and only the 700 file is loaded: the page
   stylesheets ask for 800/900 on their headings, and with a single face the
   browser resolves every one of those to Bold without touching each rule.
   Sora has no width axis, so the pages' `font-stretch` values are ignored. */
const sora = Sora({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-display",
});

/* Body text and the small uppercase labels (the pages' `--mono`). Lato is not
   a variable font, so the weights are named: the pages' 500 resolves to 400,
   600 and up to 700. */
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-body",
});

const fontVars = `${sora.variable} ${lato.variable}`;

/**
 * GA4 measurement ID.
 *
 * A constant rather than typed twice, because the snippet Google hands you
 * repeats it — once in the loader URL and once in `gtag('config', …)` — and
 * those two silently disagreeing is the classic way to end up with a tag that
 * loads and reports nothing.
 *
 * Not in .env: this is public either way (it ships in the HTML of every page),
 * and an env var that must be present at build time for analytics to work is a
 * quieter failure than a literal that obviously is one.
 */
const GA_ID = "G-X6FY0NJT62";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: "/" },
  // No `icons` block on purpose. It used to point at the wordmark on
  // supabase.co — not square, so Google rejected it and showed the generic
  // globe. The square monogram in app/icon.tsx and app/apple-icon.tsx is picked
  // up by Next's file convention; declaring `icons` here would override it.

  // Pages override these through pageMeta() in lib/seo.ts. The og:image is not
  // set here — each route ships its own opengraph-image, which Next resolves
  // per page, so a share of /services no longer falls back to the homepage's.
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* One connected graph rather than a lone Organization: the WebSite points at
   the Organization as its publisher, and every article's author/publisher
   resolves to the same @id. */
const jsonLd = [organizationSchema, websiteSchema];

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The inline script below sets `class="no-loader"` on <html> before React
    // hydrates, so the server markup and the client DOM differ on this one
    // attribute by design. Without this, React logs a hydration mismatch.
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        {/* Decides, before the first paint, whether the landing loader runs.
            It is server-rendered markup, so removing it from an effect would
            flash the black terminal first. The nav links are real <a> hrefs,
            so returning Home is a full document load — without this, the whole
            boot sequence replays every single time.

            Plays on the first home-page load in a tab and on any reload (a hard
            refresh should show it again); skipped otherwise. The flag is set by
            the landing page itself, not here, so the intro is not consumed by a
            visitor who happened to land on /services first. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=performance.getEntriesByType('navigation')[0];if(sessionStorage.getItem('adm:booted')==='1'&&(!n||n.type!=='reload')){document.documentElement.classList.add('no-loader');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1001] focus:bg-red-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ld(jsonLd) }}
        />

        {/* Google Analytics 4, and Clarity below it.
            Google's copy-paste instructions say "immediately after <head>",
            which is advice for hand-written HTML. Both go through next/script
            instead.

            `lazyOnload`, not `afterInteractive`. At afterInteractive the gtag
            bundle — 167 KiB, the single largest script the site serves, and
            larger than the page's own JavaScript — was being fetched, parsed
            and executed while the browser was still laying out and painting
            the page it was measuring. Analytics that slows the visit it is
            recording is the wrong trade at any measurement fidelity.

            lazyOnload defers both tags until the browser is idle after `load`.
            `dataLayer` and the `gtag` shim are still defined here, at
            afterInteractive, so anything that queues an event before the
            bundle arrives is buffered rather than lost — that queue is the
            whole point of the shim, and it is why deferring the loader does
            not drop the pageview.

            What this costs: a visitor who leaves within a second or two of
            `load` may not be counted. That is a real number, not zero — if
            bounce-rate accuracy ever matters more than the load, move the two
            loaders back to afterInteractive and nothing else has to change. */}
        <Script id="ga4-config" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
        <Script
          id="ga4-loader"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />

        <Script id="ms-clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "u512498vm3");`}
        </Script>

        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
