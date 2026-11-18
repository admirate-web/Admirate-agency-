import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const moduleUrl = pathToFileURL(
  resolve(here, "../src/components/sitemap/page-dates.mjs"),
).href;

const { PAGE_UPDATED, pageUpdated } = await import(moduleUrl);

/* The service slugs are read out of the registry source rather than imported:
   it is TypeScript, and this suite runs on plain node. */
const registry = readFileSync(
  resolve(here, "../src/components/service/registry.ts"),
  "utf8",
);
const serviceSlugs = [...registry.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);

test("every hand-authored public page has its own last-modified date", () => {
  assert.equal(serviceSlugs.length, 6, "expected six services in the registry");

  const paths = [
    "/",
    "/services",
    "/pricing",
    "/start-project",
    "/contact",
    "/sitemap",
    ...serviceSlugs.map((slug) => `/services/${slug}`),
  ];

  for (const path of paths) {
    const date = pageUpdated(path);
    assert.ok(!Number.isNaN(date.getTime()), `${path} has an invalid date`);
    assert.ok(date <= new Date(), `${path} is dated in the future`);
    assert.match(PAGE_UPDATED[path], /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("a page without a recorded date fails loudly instead of borrowing one", () => {
  assert.throws(() => pageUpdated("/services/not-a-service"), /No last-modified date/);
});
