import LandingClient from "@/components/landing/LandingClient";
import { homeFaqSchema } from "@/components/landing/plain";
import { homePrices, type HomePrices } from "@/lib/home-prices";
import { getPricing } from "@/lib/pricing-data";
import { ld } from "@/lib/schema";

/**
 * The rate card, read so the homepage FAQ can quote real figures in the server
 * HTML. Same cached payload, same `pricing` tag, as /pricing and
 * /start-project, so a price corrected in the dashboard moves here too.
 *
 * Null rather than a throw when the card cannot be read. /pricing lets a failed
 * read reach the error boundary, which is right for a page whose whole job is
 * the figures. The homepage's job is not, so a failed read costs one answer its
 * numbers (it falls back to pointing at /pricing) instead of costing the site
 * its homepage.
 */
async function readPrices(): Promise<HomePrices | null> {
  try {
    return homePrices(await getPricing());
  } catch {
    return null;
  }
}

export default async function Home() {
  const prices = await readPrices();

  return (
    <>
      {/* Built from the same function the visible FAQ is, so the markup can
          never ask a question the page does not show. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(homeFaqSchema(prices)) }}
      />
      <LandingClient prices={prices} />
    </>
  );
}
