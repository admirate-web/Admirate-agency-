import { SITE, SOCIALS, WHATSAPP, telHref } from "@/lib/seo";
import type { LegalDoc } from "@/components/legal/docs";

/**
 * The contact page, as content.
 *
 * Why it exists: Search Console showed people asking Google for exactly this —
 * "give me the numbers of the team managing marketing and promotions", "give me
 * facebook number of this company" — and the site ranked first for those
 * questions while having no page that states the answer. The phone number was
 * only in footers. A search engine or an AI assistant can repeat a fact only
 * when it is written down as a sentence somewhere it can quote.
 *
 * So every line here is one plain fact, and every fact resolves from SITE in
 * lib/seo.ts — the same source the footer, the structured data and the Google
 * Business Profile are meant to agree with. Nothing is typed twice.
 *
 * Deliberately absent: opening hours and a street address. The studio has no
 * walk-in premises (see ORG_TODO in lib/schema.ts), and hours that are not
 * kept are a claim Google and a caller can both contradict.
 *
 * It is a LegalDoc only in shape. The legal shell is a short page of numbered
 * sections with an index, which is what a contact page needs; `eyebrow`
 * relabels it.
 */

const phoneDisplay = SITE.phone.replace("-", " ");
const profiles = SOCIALS.filter((s) => s.profile);

export const CONTACT: LegalDoc = {
  slug: "contact",
  eyebrow: "CONTACT",
  title: `Contact ${SITE.name}`,
  metaTitle: "Contact: Phone, WhatsApp & Email in Hyderabad",
  description: `Call or WhatsApp ${SITE.name} on ${phoneDisplay}, or email ${SITE.email}. Design and marketing agency in ${SITE.area}, ${SITE.city}.`,
  updated: "2026-11-16",
  intro: `The direct ways to reach ${SITE.name}, the design and marketing agency in ${SITE.area}, ${SITE.city}. Every enquiry gets a reply within one working day.`,
  sections: [
    {
      h: "Phone and WhatsApp",
      body: [
        {
          t: "p",
          c: `Call ${SITE.name} on **[${phoneDisplay}](${telHref})**. The same number is on WhatsApp: [message ${SITE.name} on WhatsApp](${WHATSAPP}).`,
        },
        {
          t: "p",
          c: "One number reaches the whole studio, for new projects and for work already under way. There is no separate line for sales, marketing or support.",
        },
      ],
    },
    {
      h: "Email",
      body: [
        {
          t: "p",
          c: `Email **[${SITE.email}](mailto:${SITE.email})** for project enquiries, questions about ongoing work, and anything about your personal data.`,
        },
      ],
    },
    {
      h: "Start a project",
      body: [
        {
          t: "p",
          c: "If you already know what you need, the [project brief](/start-project) is the fastest route: pick a service and a plan, tell us about the project, and we reply within one working day.",
        },
        {
          t: "p",
          c: "Rates for digital retainers, website development and website care are published on the [pricing page](/pricing), so you can size the project before you speak to anyone.",
        },
      ],
    },
    {
      h: "Where we work",
      body: [
        {
          t: "p",
          c: `${SITE.name} is based in ${SITE.area}, ${SITE.city}, ${SITE.region}, and works with clients across ${SITE.country}.`,
        },
        {
          t: "p",
          c: "Most projects run over calls and shared reviews. Where a project needs people in a room, we say so at the brief stage and arrange it.",
        },
      ],
    },
    {
      h: "Social profiles",
      body: [
        {
          t: "p",
          c: `These are ${SITE.name}'s official profiles.`,
        },
        {
          t: "list",
          c: profiles.map(
            (p) => `**${p.label}** — [${p.href.replace("https://www.", "")}](${p.href})`,
          ),
        },
      ],
    },
  ],
};
