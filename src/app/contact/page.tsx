import type { Metadata } from "next";
import LegalClient from "@/components/legal/LegalClient";
import { CONTACT } from "@/components/contact/doc";
import { pageMeta, SITE } from "@/lib/seo";
import { breadcrumbSchema, ld } from "@/lib/schema";

export const metadata: Metadata = pageMeta({
  title: CONTACT.metaTitle,
  description: CONTACT.description,
  path: `/${CONTACT.slug}`,
});

const url = `${SITE.url}/${CONTACT.slug}`;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}#webpage`,
    url,
    name: CONTACT.title,
    description: CONTACT.description,
    inLanguage: "en-IN",
    dateModified: CONTACT.updated,
    /* Points at the Organization the root layout already publishes, so the
       phone, email and profiles are stated once and this page is tied to them
       rather than repeating a second copy that could drift. */
    mainEntity: { "@id": `${SITE.url}/#organization` },
  },
  breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Contact", path: `/${CONTACT.slug}` },
  ]),
];

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(jsonLd) }}
      />
      <LegalClient doc={CONTACT} />
    </>
  );
}
