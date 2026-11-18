import { formatPrice, planAmount, type Currency } from "@/lib/pricing";
/* Type-only, so this module stays free of next/cache and node --test can
   load it. The cached read itself lives in app/page.tsx. */
import type { PricingPayload } from "@/lib/pricing-data";

/**
 * The lowest published rupee price in each family, formatted for a sentence.
 *
 * The homepage FAQ answers "how much does ADMIRATE charge?" with real figures,
 * because a figure is what a search engine or an AI assistant quotes back and an
 * adjective is not. They are read from the same rate card /pricing renders,
 * never typed into copy: the card is edited from the dashboard without a
 * deployment, and a second hand-kept copy is the one that drifts (the
 * `PRICE_RANGE` constant in lib/schema.ts already had, to a floor of ₹18,000
 * that the card no longer offered).
 *
 * Always rupees, whoever is reading. /pricing localises its visible figures by
 * country, so a crawler in the US is shown dollars there; this answer is the
 * one place every reader gets the studio's own currency.
 */
export type HomePrices = {
  /** Cheapest one-time website build. */
  website: string;
  /** Cheapest website care plan, per month. */
  care: string;
  /** Cheapest digital retainer, per month. */
  retainer: string;
  /** "plus 18% GST", or "before tax" when no rate is recorded. */
  tax: string;
};

export function homePrices(payload: PricingPayload): HomePrices | null {
  const currencies = payload.currencies as unknown as Currency[];
  const inr = currencies.find((c) => c.code === "INR");
  if (!inr) return null;

  const floor = (family: "website" | "care" | "retainer") => {
    const amounts = payload.plans
      .filter((plan) => plan.family === family)
      .map((plan) => planAmount(plan.id, inr, payload.amounts))
      .filter((amount): amount is number => amount !== null && amount > 0);
    return amounts.length ? formatPrice(Math.min(...amounts), inr) : null;
  };

  const website = floor("website");
  const care = floor("care");
  const retainer = floor("retainer");
  /* All three or none: an answer quoting two families and silently dropping
     the third would read as though the third has no published price. */
  if (!website || !care || !retainer) return null;

  const rate = inr.tax_rate;
  const tax =
    typeof rate === "number" && rate > 0
      ? `plus ${Math.round(rate * 1000) / 10}% ${inr.tax_label ?? "tax"}`
      : "before tax";

  return { website, care, retainer, tax };
}
