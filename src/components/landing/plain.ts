import type { HomePrices } from "@/lib/home-prices";
import { SITE } from "@/lib/seo";

/**
 * The homepage, in plain words: what ADMIRATE is, the six services, who it has
 * worked for, and five questions people ask before they get in touch.
 *
 * Why it exists: the rest of the homepage is brand voice and set-pieces, about
 * 340 words in the server HTML, none of which says "design agency in
 * Hyderabad", names a client or gives a price. Search engines and AI
 * assistants can only repeat facts that are written down as sentences, and the
 * questions Search Console showed arriving ("give me the numbers of the team
 * managing marketing and promotions") had nothing on this page to answer them.
 *
 * It renders through the service pages' long-form stylesheet
 * (shared/service-prose.ts) so it reads as the same site, and like that block
 * it is visible from first paint: no reveal on scroll for copy that exists to
 * be read and quoted.
 *
 * Rules, the same as shared/service-copy.ts: no invented numbers or clients.
 * Every project named here is already published on a service page, every
 * timeline is the range a service page FAQ states, and prices come from the
 * live rate card (see lib/home-prices.ts), never from this file.
 */

type Faq = { q: string; a: string };

const phoneDisplay = SITE.phone.replace("-", " ");

/* The prices carry a symbol and a tax label from the database, so they are
   escaped before they meet authored HTML. Everything else here is authored. */
const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SERVICES = [
  {
    href: "/services/identity",
    t: "Branding and logo design",
    d: "Logos and brand identities built to be recognised in half a second: the mark, the typography, the colour and the rules that keep them consistent, tested at favicon size and at signboard size.",
  },
  {
    href: "/services/design",
    t: "Graphic design and advertising",
    d: "Campaign creative, print ads, posters and digital ads, laid out on the path the eye actually travels, so the headline, the image and the call to action are seen in the order intended.",
  },
  {
    href: "/services/social-media",
    t: "Social media marketing",
    d: "Monthly planning, posts, reels, copy, publishing and reporting, with every piece routed to a profile visit, a page or an enquiry rather than left as a view count.",
  },
  {
    href: "/services/digital",
    t: "Website design and development",
    d: "Websites designed and built end to end, fast on an average phone, with booking, enquiry forms and payments wired in, and every enquiry landing somewhere you will see it.",
  },
  {
    href: "/services/video-production",
    t: "Video production",
    d: "Brand films, ads, event coverage and reels, scripted, shot and edited in-house, then cut into every version the film has to run in.",
  },
  {
    href: "/services/brand-collaterals",
    t: "Brochures and brand collaterals",
    d: "Brochures, company profiles, catalogues, visiting cards, packaging, signage and stationery, specified from one system and checked before they go to press.",
  },
];

/**
 * The five questions, as the page shows them and as FAQPage states them.
 * Answers may carry one authored anchor; the markup gets them tag-free.
 */
export function homeFaq(prices: HomePrices | null): Faq[] {
  const cost = prices
    ? `Website builds start at ${esc(prices.website)}, website care at ${esc(prices.care)} a month and digital retainers at ${esc(prices.retainer)} a month, ${esc(prices.tax)}. Logos, films and print are quoted per project against a written brief, and every published rate is on the <a href="/pricing" data-h>pricing page</a>.`
    : `Website builds, website care and monthly digital retainers have fixed rates published on the <a href="/pricing" data-h>pricing page</a>, shown before tax. Logos, films and print are quoted per project against a written brief.`;

  return [
    {
      q: `What does ${SITE.name} do?`,
      a: `${SITE.name} is a design and marketing agency in ${SITE.area}, ${SITE.city}. It designs brand identities and logos, advertising and social media creative, websites, films and reels, and printed brand collateral for businesses across ${SITE.country}.`,
    },
    {
      q: `How much does ${SITE.name} charge?`,
      a: cost,
    },
    {
      q: "How long does a project take?",
      a: "Most projects take three to seven weeks. A logo with a basic brand system typically takes three to four, a website five to seven, and a single-shoot film four to five; what sets the pace is how quickly content and decisions come back.",
    },
    {
      q: `Does ${SITE.name} work with businesses outside ${SITE.city}?`,
      a: `Yes. The studio works from ${SITE.area}, ${SITE.city}, with clients across ${SITE.country}, and most projects run over calls and shared reviews. Where a project needs people in a room, we say so at the brief stage.`,
    },
    {
      q: `How do I contact ${SITE.name}?`,
      a: `Call or WhatsApp ${phoneDisplay}, or email ${SITE.email}, and you will get a reply within one working day. Every channel is listed on the <a href="/contact" data-h>contact page</a>.`,
    },
  ];
}

export function homeFaqSchema(prices: HomePrices | null) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE.url}/#faq`,
    mainEntity: homeFaq(prices).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a.replace(/<[^>]+>/g, ""),
      },
    })),
  };
}

/** Homepage-only additions to the shared long-form stylesheet. */
export const HOME_PLAIN_CSS = String.raw`
/* ---- homepage plain-language block (landing/plain.ts) ---- */
#svp{background:var(--paper)}
#svp .svpdi h3 a{color:inherit;text-decoration:none;transition:color .2s}
#svp .svpdi h3 a::after{content:"\2192";display:inline-block;margin-left:8px;color:var(--red);transition:transform .2s}
#svp .svpdi h3 a:hover{color:var(--red)}
#svp .svpdi h3 a:hover::after{transform:translateX(3px)}
`;

/**
 * The section itself. `class="sec"` enrols it in the homepage's section rail
 * (landing/init.ts collects every `.sec` for the dots); it is deliberately not
 * `.full`, because it is as tall as its copy rather than one screen.
 */
export function homePlainHtml(prices: HomePrices | null): string {
  return `
<!-- S8b PLAIN WORDS (landing/plain.ts) -->
<section id="svp" class="sec">
  <div class="svpin">

    <div class="svpb">
      <div class="svpeb">${SITE.name}, in plain words</div>
      <h2 class="svph">A design and marketing agency in ${SITE.city}</h2>
      <p class="svpp">${SITE.name} is a design and marketing studio in ${SITE.area}, ${SITE.city}, working with businesses across ${SITE.country}. We design the brand, build the website, run the social media, shoot the films and specify the print, so every piece a customer meets looks like the same business.</p>
      <p class="svpp">Rates for websites, website care and monthly retainers are <a href="/pricing" data-h>published</a>, so you can size a project before you speak to anyone.</p>
    </div>

    <div class="svpb">
      <h2 class="svph">What we do</h2>
      <div class="svpd">
        ${SERVICES.map(
          (s) =>
            `<div class="svpdi"><h3><a href="${s.href}" data-h>${s.t}</a></h3><p>${s.d}</p></div>`,
        ).join("\n        ")}
      </div>
    </div>

    <div class="svpb">
      <h2 class="svph">Who we have worked with</h2>
      <p class="svpp">Clients include South Glass, Patil Group, Hope Trust India, Hitex, Hitex SportExpo, Our Sacred Space and Samyoga Studio.</p>
      <p class="svpp">For South Glass, a premium glass and facades business, we built the identity and then the website on top of it. Patil Group's website and corporate documents carry fifty years of railway infrastructure work. Hope Trust India has its website, printed material and campaign creative from the studio, and Sportex.in handled visitor registration for one of India's largest sports and fitness expos.</p>
    </div>

    <div class="svpb">
      <h2 class="svph">Questions people ask us</h2>
      <div class="svpf">
        ${homeFaq(prices)
          .map((f) => `<div class="svpq"><h3>${f.q}</h3><p>${f.a}</p></div>`)
          .join("\n        ")}
      </div>
    </div>

  </div>
</section>
`;
}
