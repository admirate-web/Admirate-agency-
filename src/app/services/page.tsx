import type { Metadata } from "next";
import ServicesClient from "@/components/services/ServicesClient";
import { pageMeta } from "@/lib/seo";
import { servicesSchema, breadcrumbSchema, ld } from "@/lib/schema";

export const metadata: Metadata = pageMeta({
  /* Was "Design That Moves With You" — the page's headline, and a title no one
     searches for. The headline stays as the H1; the title names the services
     and the city so the hub can be found by them. */
  title: "Brand, Web, Social & Video Services in Hyderabad",
  // Kept under ~160 characters — past that Google truncates it mid-sentence.
  description:
    "Logos and brand identity, websites, social creatives, video production and brand collaterals — everything your brand needs to show up looking like itself.",
  path: "/services",
});

const jsonLd = [
  servicesSchema,
  breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ]),
];

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(jsonLd) }}
      />
      <ServicesClient />
    </>
  );
}
