import test from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const moduleUrl = pathToFileURL(resolve(here, "../src/lib/home-prices.ts")).href;

let homePrices;
try {
  ({ homePrices } = await import(moduleUrl));
} catch {
  // Reported by the explicit function assertion in each test.
}

const INR = {
  code: "INR",
  symbol: "₹",
  authored: true,
  rate: null,
  round_to: 1,
  tax_rate: 0.18,
  tax_label: "GST",
  active: true,
};

const plan = (id, family) => ({ id, family });

/* Shaped like the live card on 2026-11-17, with the plans deliberately out of
   price order so "first plan" and "cheapest plan" are not the same answer. */
const payload = (overrides = {}) => ({
  currencies: [INR],
  plans: [
    plan("w-growth", "website"),
    plan("w-launch", "website"),
    plan("w-ent", "website"),
    plan("c-grow", "care"),
    plan("c-care", "care"),
    plan("r-launch", "retainer"),
    plan("r-scale", "retainer"),
  ],
  amounts: [
    { plan_id: "w-growth", currency_code: "INR", amount: 215000 },
    { plan_id: "w-launch", currency_code: "INR", amount: 138000 },
    { plan_id: "w-ent", currency_code: "INR", amount: 359000 },
    { plan_id: "c-grow", currency_code: "INR", amount: 50000 },
    { plan_id: "c-care", currency_code: "INR", amount: 14000 },
    { plan_id: "r-launch", currency_code: "INR", amount: 102000 },
    { plan_id: "r-scale", currency_code: "INR", amount: 246000 },
    { plan_id: "c-care", currency_code: "AED", amount: 600 },
  ],
  features: [],
  ...overrides,
});

test("quotes the cheapest rupee plan in each family, grouped in lakhs, with GST", () => {
  assert.equal(typeof homePrices, "function", "homePrices is missing");
  assert.deepEqual(homePrices(payload()), {
    website: "₹1,38,000",
    care: "₹14,000",
    retainer: "₹1,02,000",
    tax: "plus 18% GST",
  });
});

test("says 'before tax' when the card records no tax rate", () => {
  assert.equal(typeof homePrices, "function", "homePrices is missing");
  const untaxed = homePrices(payload({ currencies: [{ ...INR, tax_rate: null }] }));
  assert.equal(untaxed.tax, "before tax");
});

test("returns null rather than a partial answer when a family has no rupee price", () => {
  assert.equal(typeof homePrices, "function", "homePrices is missing");
  const noCare = payload();
  noCare.amounts = noCare.amounts.filter(
    (a) => !(a.plan_id.startsWith("c-") && a.currency_code === "INR"),
  );
  assert.equal(homePrices(noCare), null);
  assert.equal(homePrices(payload({ currencies: [] })), null);
});
