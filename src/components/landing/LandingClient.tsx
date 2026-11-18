"use client";

import RawPage from "@/components/RawPage";
import { LANDING_CSS, landingHtml } from "@/components/landing/content";
import initLanding from "@/components/landing/init";
import { NAV_CSS, navHtml, initNav } from "@/components/shared/nav";
import type { HomePrices } from "@/lib/home-prices";

export default function LandingClient({
  prices,
}: {
  /** Read on the server by app/page.tsx; null when the rate card is unreadable. */
  prices: HomePrices | null;
}) {
  return (
    <RawPage
      css={LANDING_CSS + NAV_CSS}
      html={navHtml("home", "/start-project") + landingHtml(prices)}
      init={() => {
        const stopNav = initNav();
        const stopPage = initLanding();
        return () => {
          stopNav();
          if (typeof stopPage === "function") stopPage();
        };
      }}
    />
  );
}
