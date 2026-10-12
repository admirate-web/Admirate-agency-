import test from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const moduleUrl = pathToFileURL(
  resolve(here, "../src/components/service/digital/crm.mjs"),
).href;
let crm = {};

try {
  crm = await import(moduleUrl);
} catch {
  // The RED run reaches the explicit assertions below.
}

/* What the Hope Trust bot actually sends, copied by hand from
   Hopetrust_CRM/src/engine.js (welcomeLead / welcomeAsk) on 2026-10-12. The
   phone on /services/digital claims to show this conversation, so it has to
   say exactly this. */
const SAYS = {
  hi: "hi",
  lead:
    "😊 Hi, welcome to Hope Trust. I'm an AI support assistant here to help you find the right support and resources. If you're in immediate danger, please contact emergency services.",
  ask: "Whenever you're ready, tell me your name and how I can help. 🤝",
};

/** The words a bubble draws: its <tspan> lines, read top to bottom. */
const drawn = (html, key) => {
  const m = html.match(
    new RegExp(`<text[^>]*data-msg="${key}"[^>]*>([\\s\\S]*?)</text>`),
  );
  if (!m) return null;
  const lines = [...m[1].matchAll(/<tspan[^>]*>([\s\S]*?)<\/tspan>/g)].map(
    (l) => l[1].trim(),
  );
  return lines.join(" ");
};

test("the phone draws the bot's greeting word for word", () => {
  assert.equal(typeof crm.CRM_HTML, "string", "CRM_HTML is missing");

  for (const [key, words] of Object.entries(SAYS)) {
    assert.equal(drawn(crm.CRM_HTML, key), words, `bubble "${key}"`);
  }
});

test("a screen reader hears the whole conversation", () => {
  assert.equal(typeof crm.CRM_HTML, "string", "CRM_HTML is missing");

  const phone = crm.CRM_HTML.match(/<svg[^>]*class="wa"[\s\S]*?<\/svg>/);
  assert.ok(phone, "the phone svg is missing");
  const desc = phone[0].match(/<desc[^>]*>([\s\S]*?)<\/desc>/);
  assert.ok(desc, "the phone has no description");

  for (const words of Object.values(SAYS)) {
    assert.ok(desc[1].includes(words), `description lacks: ${words}`);
  }
});

test("the sample console never shows a full phone number", () => {
  assert.equal(typeof crm.CRM_HTML, "string", "CRM_HTML is missing");

  /* Text a visitor can read or hear: the markup with its tags removed, plus
     every label an assistive technology reads out. Attributes are left out on
     purpose, since SVG geometry is long runs of numbers. */
  const read = [
    crm.CRM_HTML.replace(/<[^>]*>/g, " "),
    ...[...crm.CRM_HTML.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]),
  ].join(" ");

  /* Ten digits, spaces or dashes allowed between them: an Indian mobile
     number with or without its country code. */
  const full = read.match(/(?:\d[\s-]?){10,}/);
  assert.equal(full, null, `a full number is on the page: ${full && full[0]}`);
});

test("the conversation plays in the order the bot has it", () => {
  assert.ok(Array.isArray(crm.CRM_BEATS), "CRM_BEATS is missing");

  const at = Object.fromEntries(crm.CRM_BEATS.map((b) => [b.cls, b.at]));
  assert.ok(at["b-hi"] < at["b-read"], "read before the hi was sent");
  assert.ok(at["b-read"] < at["b-lead"], "replied before reading");
  assert.ok(at["b-lead"] < at["b-ask"], "the ask came before the welcome");
  assert.ok(at["b-hi"] < at["b-log"], "the console logged a chat not yet had");

  const last = Math.max(...crm.CRM_BEATS.map((b) => b.at));
  assert.ok(last < crm.CRM_CLEAR_AT, "the loop clears before the last beat");
  assert.ok(crm.CRM_CLEAR_AT < crm.CRM_CYCLE, "the loop restarts before clearing");
});
