/**
 * HOPE TRUST CRM — the work past the website, on /services/digital.
 *
 * The page argues that a site is a journey ending in a booking, a chat or a
 * lead. THE WORK proves the sites; this proves the rest of the journey with
 * the one client where we built all of it: a WhatsApp assistant, and the
 * intake console their team works from.
 *
 * Two drawings, both inline SVG so they stay sharp at any width and the page
 * can drive them:
 *
 *   PHONE    the conversation a bare "hi" starts, in the order the bot really
 *            runs it: the message is read (blue ticks), the assistant types,
 *            then sends two messages about a second apart. The words are the
 *            bot's own, from Hopetrust_CRM/src/engine.js (welcomeLead and
 *            welcomeAsk). If the bot's greeting changes, change LEAD and ASK.
 *   CONSOLE  a look-alike of the console's top half, in its own colours. The
 *            real one holds patient records, so it is redrawn with made-up
 *            names and numbers rather than shown, and it is never connected
 *            to the CRM. The one thing that moves is the Live activity card,
 *            which is where a bare "hi" really lands: a masked number and
 *            "intake questions", newest first.
 *
 * The markup ships the finished conversation. initCrm() clears it and plays it
 * while the phone is on screen; under reduced motion it never runs, so the
 * finished state is what those visitors get.
 *
 * Plain .mjs with no imports, so tests/crm-showcase.test.mjs can load it.
 */

/* The bot's two replies to a greeting, broken where they wrap in a 14px Lato
   bubble on this phone (measured in the browser, widest line 192px of 210). */
const LEAD = [
  "😊 Hi, welcome to Hope Trust.",
  "I'm an AI support assistant here",
  "to help you find the right",
  "support and resources. If you're",
  "in immediate danger, please",
  "contact emergency services.",
];
const ASK = ["Whenever you're ready, tell me", "your name and how I can help. 🤝"];

/**
 * When each part of the conversation appears, in ms from the start of a loop.
 * The gaps follow production: marking the message read takes the bot under a
 * second, and its two sends land about 1.1s apart.
 */
export const CRM_BEATS = [
  { at: 700, cls: "b-hi" },
  { at: 1600, cls: "b-read" },
  { at: 3500, cls: "b-lead" },
  { at: 4700, cls: "b-ask" },
  { at: 5300, cls: "b-log" },
];
/* The finished chat holds long enough to read the first reply, then fades. */
export const CRM_CLEAR_AT = 12500;
export const CRM_CYCLE = 13400;

const r1 = (n) => Math.round(n * 10) / 10;

/** A smooth line through evenly spaced values (Catmull-Rom as cubic Béziers). */
const curve = (vals, x0, x1, yAt) => {
  const p = vals.map((v, i) => [x0 + ((x1 - x0) * i) / (vals.length - 1), yAt(v)]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 2] || p[i - 1];
    const b = p[i - 1];
    const c = p[i];
    const e = p[i + 1] || c;
    d += `C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(
      c[0] - (e[0] - b[0]) / 6,
    )} ${r1(c[1] - (e[1] - b[1]) / 6)} ${r1(c[0])} ${r1(c[1])}`;
  }
  return d;
};
const area = (line, x0, x1, base) => `${line}L${x1} ${base}L${x0} ${base}Z`;

/* ---------- the console's sample data ----------
   Invented, and kept consistent with itself: "New this week" is the last seven
   days of the volume chart, its delta is against the seven before, and the
   triage ring adds up to the open enquiries. */
const VOLUME = [3, 4, 3, 5, 6, 4, 3, 6, 5, 4, 7, 5, 4, 5, 8, 6, 5, 7, 8, 6, 5, 7, 9, 6, 5, 8, 7, 9, 8, 9];
const VITALS = [
  { label: "OPEN ENQUIRIES", value: "38", sub: "people awaiting clinical contact" },
  { label: "OVERDUE CALLBACK", value: "3", sub: "booking link sent, no outcome recorded", warn: true },
  { label: "NEW THIS WEEK", value: "52", sub: "first contact in the last 7 days", delta: "11% on last week" },
  { label: "CLINICIANS FREE", value: "6", unit: "/9", sub: "available to take a referral now" },
];
const FEED = [
  ["Priya", "booking link sent", "6M AGO", "#ED7428"],
  ["Arjun", "clinician matched", "14M AGO", "#F7C948"],
  ["Kavya", "intake questions", "21M AGO", "#2ABFAB"],
  ["Farhan", "booking link sent", "33M AGO", "#ED7428"],
];
/* Masked even though it is made up: the console shows a number where it has
   no name, and a full number here would read as somebody's. */
const ARRIVAL = ["91 98••• ••214", "intake questions", "0M AGO", "#2ABFAB"];
const PATHWAY = [
  ["Enquired", 212],
  ["In intake", 168],
  ["Clinician matched", 97],
  ["Booking link sent", 71],
  ["Consultation booked", 44],
];
const TRIAGE = [
  ["Immediate", 8, "#ED7428"],
  ["Elevated", 10, "#F7C948"],
  ["Routine", 20, "#4BB8C4"],
];

const POINTS = [
  {
    h: "Replies on the spot",
    p: "A hello gets an answer straight away. The assistant says it's an AI, and points anyone in danger to emergency services before anything else.",
  },
  {
    h: "A person when it matters",
    p: "Crisis messages, under-18s and requests for the coordinator are flagged to the team the moment they arrive.",
  },
  {
    h: "From hello to booking",
    p: "It asks for a name and what's going on, suggests therapists who fit, and sends a link to book with one of them.",
  },
  {
    h: "One desk for the team",
    p: "Every WhatsApp chat shows up on the dashboard as it happens, and staff can reply from there. DocPulse appointments flow in on their own.",
  },
];

export const CRM_CSS = String.raw`
/* ============ 6 — HOPE TRUST CRM ============ */
/* A dark band between light sections paints its own surface. The shared
   layer (#dgbg) changes colour when the next section's top crosses mid-screen,
   which would put this section's last lines, white type, on paper. So the
   band is dark by itself, and its data-bg keeps the layer light, or the
   neighbours' dark type would sit on black instead. */
#dcrm{background:#0B0B0C}
#dcrm .dgp{max-width:60ch}
.crm-stage{display:grid;grid-template-columns:clamp(236px,23vw,300px) minmax(0,1fr);gap:clamp(24px,3.4vw,48px);align-items:center;width:min(1180px,100%);margin-top:clamp(36px,6vh,64px)}
.crm-phone{display:flex;flex-direction:column;align-items:center;gap:16px;min-width:0}
.crm-phone .wa{display:block;width:100%;height:auto}
.crm-win{margin:0;min-width:0}
.crm-frame{border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:#EDF3F3;box-shadow:0 44px 100px -40px rgba(0,0,0,.9)}
.crm-bar{display:flex;align-items:center;gap:7px;padding:11px 14px;background:#161618;border-bottom:1px solid rgba(255,255,255,.07)}
.crm-bar i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:#3A3A3F}
.crm-bar i:first-child{background:var(--red)}
.crm-bar span{margin-left:9px;min-width:0;font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#8A8A8E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.crm-win .hc{display:block;width:100%;height:auto}
.crm-win figcaption{margin-top:14px;font-family:var(--mono);font-size:11px;line-height:1.6;letter-spacing:.06em;color:#8A8A8E}
#dcrm .pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:clamp(18px,2.6vw,34px);width:min(1180px,100%);margin-top:clamp(44px,7vh,80px)}
#dcrm .pillar{border-top-color:rgba(255,255,255,.22)}
#dcrm .pillar p{color:#A4A4A8}

/* The visitor can stop the loop: it repeats for as long as the phone is on
   screen, and a long first reply deserves the time to be read. */
.crm-toggle{display:inline-flex;align-items:center;gap:9px;min-height:36px;padding:0 16px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:none;color:#C9C9CC;font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;transition:border-color .2s ease,color .2s ease}
.crm-toggle[hidden]{display:none}
.crm-toggle svg{width:9px;height:9px;fill:currentColor}
.crm-toggle .i-play,.crm-toggle.held .i-pause{display:none}
.crm-toggle.held .i-play{display:inline}
@media (hover:hover) and (pointer:fine){.crm-toggle:hover{border-color:#fff;color:#fff}}

/* ---- the phone ---- */
.wa text{font-family:var(--body)}
.wa .body{fill:#141518;stroke:rgba(255,255,255,.16);stroke-width:1.5}
.wa .key{fill:#2A2B30}
.wa .hdf{fill:#fff}
.wa .bat{fill:none;stroke:#fff;stroke-width:1.2}
.wa .sb{font-size:12.5px;font-weight:700;fill:#fff}
.wa .nm{font-size:15px;font-weight:700;fill:#fff;transition:transform .32s cubic-bezier(.16,1,.3,1)}
.wa .st{font-size:11.5px;fill:#fff;fill-opacity:.82;opacity:0;transition:opacity .2s ease}
.wa .dt{font-size:11px;fill:#54656F}
.wa .tx{font-size:14px;fill:#111B21}
.wa .tm{font-size:10.5px;fill:#667781}
.wa .ph{font-size:14.5px;fill:#8696A0}
.wa .ib{fill:#8696A0}
.wa .sh{fill:#0B141A;fill-opacity:.1}
.wa .tk{fill:none;stroke:#8696A0;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round;transition:stroke .25s ease}
.wa .dot{fill:#8696A0;animation:crmdot 1.2s ease-in-out infinite paused}
@keyframes crmdot{0%,60%,100%{opacity:.4;transform:none}30%{opacity:1;transform:translateY(-3px)}}

/* Each part of the conversation is a class on the stage, added in order by
   initCrm(). Transitions rather than keyframes, so clearing the loop mid-way
   reverses whatever is in flight instead of snapping. A bubble grows from its
   sender's side. */
.wa .m{opacity:0;transform:translateY(10px) scale(.96);transform-box:fill-box;transform-origin:0 100%;transition:opacity .24s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1)}
.wa .m.out{transform-origin:100% 100%}
.crm-stage.b-hi .m-hi,.crm-stage.b-lead .m-lead,.crm-stage.b-ask .m-ask,.crm-stage.b-read:not(.b-lead) .m-typing{opacity:1;transform:none}
.crm-stage.b-read .tk{stroke:#53BDEB}
.crm-stage.b-read:not(.b-lead) .wa .nm{transform:translateY(-9px)}
.crm-stage.b-read:not(.b-lead) .wa .st{opacity:1}
.crm-stage.b-read:not(.b-lead) .dot{animation-play-state:running}

/* ---- the console ---- */
.hc text{font-family:var(--body);fill:#07242A}
.hc .mo{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
.hc .wm{font-size:15px;font-weight:700;fill:#F7F6F4}
.hc .sub{font-size:7.5px;letter-spacing:.16em;fill:#6E9298}
.hc .nv{font-size:12px;font-weight:700;fill:#9FBCBF}
.hc .nv.on{fill:#F7F6F4}
.hc .ni{fill:none;stroke:#9FBCBF;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round;opacity:.75}
.hc .ni.on{stroke:#2ABFAB;opacity:1}
.hc .cr{font-size:11px;fill:#92A9AC}
.hc .crb{font-weight:700;fill:#07242A}
.hc .lv{font-size:8px;letter-spacing:.1em;fill:#587478}
.hc .lvb{font-weight:700;fill:#07242A}
.hc .live{animation:crmbreathe 2.4s ease-in-out infinite}
@keyframes crmbreathe{50%{opacity:.35}}
.hc .ttl{font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:600;letter-spacing:-.02em}
.hc .nt{font-size:10.5px;fill:#587478}
.hc .rl{font-size:7.5px;letter-spacing:.15em;fill:#9FBCBF}
.hc .rv{font-size:30px;font-weight:700;letter-spacing:-.03em;fill:#F7F6F4}
.hc .rv.warn{fill:#FFD9BC}
.hc .rvs{font-size:14px;fill-opacity:.5}
.hc .rs{font-size:8.5px;fill:#6E9298}
.hc .dl{font-size:8.5px;font-weight:700;fill:#7FE6D4}
.hc .cd{fill:#fff;stroke:#E2EBEB}
.hc .gw{fill:#2ABFAB;fill-opacity:.12}
.hc .gl{fill:none;stroke:#0B8574;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
.hc .ch{font-size:12.5px;font-weight:700}
.hc .cn{font-size:9.5px;fill:#587478}
.hc .gr{stroke:#EDF2F2;stroke-dasharray:3 3}
.hc .ax{font-size:7.5px;letter-spacing:.1em;fill:#92A9AC}
.hc .fw{font-size:10.5px}
.hc .fwb{font-weight:700}
.hc .fwt{font-size:7.5px;letter-spacing:.1em;fill:#92A9AC}
.hc .sp{stroke:#E2EBEB}
.hc .sl{font-size:9.5px;fill:#587478}
.hc .sn{font-size:10px;font-weight:700}
.hc .dv{font-size:19px;font-weight:700;letter-spacing:-.03em}
.hc .dlb{font-size:6.5px;letter-spacing:.14em;fill:#92A9AC}
.hc .lg{font-size:10px;font-weight:700}
.hc .lq{font-size:8.5px;fill:#587478}
.hc .lp{font-size:8.5px;fill:#587478}

/* The console draws itself in once, when the section arrives, the way the
   real one does on load. */
.hc .ln{fill:none;stroke:#2ABFAB;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.8s cubic-bezier(.16,1,.3,1) .5s}
.hc .ln.tr{stroke-width:1.4;opacity:.5}
.hc .ar{opacity:0;transition:opacity 1.2s ease-out 1s}
.hc .br{transform:scaleX(0);transform-box:fill-box;transform-origin:0 50%;transition:transform 1s cubic-bezier(.16,1,.3,1)}
#dcrm.in .hc .ln{stroke-dashoffset:0}
#dcrm.in .hc .ar{opacity:1}
#dcrm.in .hc .br{transform:none}

/* The hello arriving: the feed moves down a row and the new entry settles in
   at the top, a beat later so it has somewhere to land. */
.hc .fd-old{transition:transform .5s cubic-bezier(.77,0,.175,1)}
.hc .fd-last{transition:opacity .3s ease-out}
.hc .fd-new{opacity:0;transform:translateY(-10px);transition:opacity .3s cubic-bezier(.16,1,.3,1) .22s,transform .45s cubic-bezier(.16,1,.3,1) .22s}
.hc .fd-wash{opacity:0}
.crm-stage.b-log .fd-old{transform:translateY(36px)}
.crm-stage.b-log .fd-last{opacity:0}
.crm-stage.b-log .fd-new{opacity:1;transform:none}
.crm-stage.b-log .fd-wash{animation:crmwash 2.8s ease-out .3s both}
@keyframes crmwash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}

@media (max-width:900px){
  /* Phone over console. The phone is the story on a small screen; the console
     follows at full width. */
  .crm-stage{grid-template-columns:minmax(0,1fr);justify-items:center}
  .crm-phone{width:min(300px,78vw)}
  .crm-win{width:100%}
}
`;

/* ---------- the phone ---------- */

const tspans = (lines, x) =>
  lines
    .map((line, i) => `<tspan x="${x}"${i ? ' dy="19"' : ""}>${line}</tspan>`)
    .join("");

/* Material icons (Apache 2.0), placed and scaled into the phone's header and
   composer. */
const ICON = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  video: "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z",
  call: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  mood: "M15.5 9.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M8.5 9.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2z",
  clip: "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z",
  mic: "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z",
};

/* An incoming bubble's tail covers its square top-left corner; an outgoing
   one's, the top-right. Consecutive messages from one side carry no tail. */
const PHONE = `<svg class="wa" viewBox="0 0 320 650" role="img" aria-labelledby="crmWaT crmWaD">
<title id="crmWaT">Hope Trust's WhatsApp assistant answering a hello</title>
<desc id="crmWaD">A person sends “hi”. The ticks turn blue, the assistant types, and replies: “${LEAD.join(
  " ",
)}” Then: “${ASK.join(" ")}”</desc>
<defs>
  <clipPath id="crmScr"><rect x="12" y="12" width="296" height="626" rx="34"/></clipPath>
  <clipPath id="crmAv"><circle cx="52" cy="70" r="16"/></clipPath>
  <pattern id="crmWall" width="64" height="64" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="#4A4A4A" stroke-opacity=".08" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="13" r="5"/><path d="M36 8l7 7m0-7l-7 7"/><path d="M6 44q7-8 14 0t14 0"/>
      <rect x="44" y="38" width="10" height="10" rx="3"/><path d="M30 58l4-6 4 6z"/>
    </g>
  </pattern>
</defs>
<rect class="body" x="4" y="4" width="312" height="642" rx="44"/>
<rect class="key" x="315.6" y="140" width="2.8" height="58" rx="1.4"/>
<rect class="key" x="315.6" y="214" width="2.8" height="34" rx="1.4"/>
<g clip-path="url(#crmScr)">
  <rect x="12" y="12" width="296" height="626" fill="#EFEAE2"/>
  <rect x="12" y="98" width="296" height="540" fill="url(#crmWall)"/>

  <rect x="12" y="12" width="296" height="86" fill="#008069"/>
  <circle cx="160" cy="27" r="5.5" fill="#08090A"/>
  <text class="sb" x="28" y="32">11:08</text>
  <path class="hdf" d="M246 33L257 22V33Z"/>
  <path class="hdf" d="M262.5 26.4a10 10 0 0 1 13 0L269 33.6z"/>
  <rect class="bat" x="281" y="23" width="17" height="10" rx="2.4"/>
  <rect class="hdf" x="282.8" y="24.8" width="10.5" height="6.4" rx="1.2"/>
  <rect class="hdf" x="298.6" y="26.2" width="1.6" height="3.6" rx=".8"/>

  <path class="hdf" transform="translate(15 61) scale(.75)" d="${ICON.back}"/>
  <circle cx="52" cy="70" r="17" fill="#fff"/>
  <image href="/crm/hopetrust-logo.png" x="36" y="54" width="32" height="32" clip-path="url(#crmAv)"/>
  <text class="nm" x="78" y="75">Hope Trust</text>
  <text class="st" x="78" y="84">typing…</text>
  <path class="hdf" transform="translate(199 61) scale(.75)" d="${ICON.video}"/>
  <path class="hdf" transform="translate(241 62) scale(.66)" d="${ICON.call}"/>
  <g class="hdf"><circle cx="291" cy="63.5" r="1.9"/><circle cx="291" cy="70" r="1.9"/><circle cx="291" cy="76.5" r="1.9"/></g>

  <rect x="137" y="110" width="46" height="20" rx="6" fill="#fff" fill-opacity=".92"/>
  <text class="dt" x="160" y="124" text-anchor="middle">Today</text>

  <g class="m m-hi out">
    <rect class="sh" x="214" y="141" width="82" height="31" rx="7.5"/>
    <rect x="214" y="140" width="82" height="31" rx="7.5" fill="#D9FDD3"/>
    <path d="M288 140h16l-8 10z" fill="#D9FDD3"/>
    <text data-msg="hi" class="tx" x="223" y="161"><tspan>hi</tspan></text>
    <text class="tm" x="270" y="162" text-anchor="end">11:08</text>
    <path class="tk" d="M272.6 158.6l3 3 6.4-6.8M278.5 161.6l6.4-6.8"/>
  </g>

  <g class="m m-typing">
    <rect class="sh" x="24" y="180" width="56" height="34" rx="7.5"/>
    <rect x="24" y="179" width="56" height="34" rx="7.5" fill="#fff"/>
    <path d="M32 179H16l8 10z" fill="#fff"/>
    <circle class="dot" cx="40" cy="196" r="3.2"/>
    <circle class="dot" cx="52" cy="196" r="3.2" style="animation-delay:.15s"/>
    <circle class="dot" cx="64" cy="196" r="3.2" style="animation-delay:.3s"/>
  </g>

  <g class="m m-lead">
    <rect class="sh" x="24" y="180" width="228" height="126" rx="7.5"/>
    <rect x="24" y="179" width="228" height="126" rx="7.5" fill="#fff"/>
    <path d="M32 179H16l8 10z" fill="#fff"/>
    <text data-msg="lead" class="tx" x="33" y="201">${tspans(LEAD, 33)}</text>
    <text class="tm" x="243" y="297" text-anchor="end">11:08</text>
  </g>

  <g class="m m-ask">
    <rect class="sh" x="24" y="309" width="232" height="63" rx="7.5"/>
    <rect x="24" y="308" width="232" height="63" rx="7.5" fill="#fff"/>
    <text data-msg="ask" class="tx" x="33" y="330">${tspans(ASK, 33)}</text>
    <text class="tm" x="247" y="365" text-anchor="end">11:08</text>
  </g>

  <rect x="18" y="584" width="238" height="38" rx="19" fill="#fff"/>
  <path class="ib" transform="translate(28.4 593.4) scale(.8)" d="${ICON.mood}"/>
  <text class="ph" x="56" y="608">Message</text>
  <path class="ib" transform="rotate(45 213 603) translate(204 594) scale(.75)" d="${ICON.clip}"/>
  <rect x="226" y="597" width="16" height="12" rx="3" fill="none" stroke="#8696A0" stroke-width="1.6"/>
  <circle cx="234" cy="603" r="3.1" fill="none" stroke="#8696A0" stroke-width="1.6"/>
  <circle cx="279" cy="603" r="19" fill="#00A884"/>
  <path class="hdf" transform="translate(269.4 593.4) scale(.8)" d="${ICON.mic}"/>
  <rect x="118" y="629.5" width="84" height="3.4" rx="1.7" fill="#111" fill-opacity=".45"/>
</g>
</svg>`;

/* ---------- the console ---------- */

const CHART = { x0: 240, x1: 704, base: 432 };
const volumeLine = curve(VOLUME, CHART.x0, CHART.x1, (v) => CHART.base - v * 12.4);
const TRACE = { x0: 220, x1: 980, base: 226 };
const traceLine = curve(VOLUME, TRACE.x0, TRACE.x1, (v) => TRACE.base - 4 - v * 5);

const vital = (v, i) => {
  const x = 240 + i * 190;
  const delta = v.delta
    ? `<rect x="${x + 42}" y="160" width="88" height="17" rx="8.5" fill="#2ABFAB" fill-opacity=".16"/>
    <path d="M${x + 49} 171.5l3.2-5 3.2 5z" fill="#7FE6D4"/>
    <text class="dl" x="${x + 59}" y="171.5">${v.delta}</text>`
    : "";
  return `<text class="mo rl" x="${x}" y="142">${v.label}</text>
    <text class="rv${v.warn ? " warn" : ""}" x="${x}" y="176">${v.value}${
      v.unit ? `<tspan class="rvs">${v.unit}</tspan>` : ""
    }</text>${delta}
    <text class="rs" x="${x}" y="193">${v.sub}</text>`;
};

const feedRow = ([who, step, when, tone], y) => `<g>
      <circle cx="754" cy="${y - 3.5}" r="6.6" fill="${tone}" fill-opacity=".18"/>
      <circle cx="754" cy="${y - 3.5}" r="3.6" fill="${tone}"/>
      <text class="fw" x="768" y="${y}"><tspan class="fwb">${who}</tspan> — ${step}</text>
      <text class="mo fwt" x="768" y="${y + 13}">${when}</text>
    </g>`;
const ROW = 36;
const FEED_TOP = 314;
const spine = (y) => `<path class="sp" d="M754 ${y + 3.5}V${y + ROW - 10.5}"/>`;

const pathwayRow = ([stage, people], i) => {
  const y = 538 + i * 24;
  const w = r1((people / PATHWAY[0][1]) * 230);
  return `<text class="sl" x="236" y="${y}">${stage}</text>
    <rect class="br" x="360" y="${y - 8}" width="${w}" height="10" rx="5" fill="url(#crmBar)" style="transition-delay:${(
      0.55 +
      i * 0.07
    ).toFixed(2)}s"/>
    <text class="sn" x="${r1(360 + w + 8)}" y="${y}">${people}</text>`;
};

/* The ring is drawn as dashes along one circle per band, each starting where
   the last stopped, with a hair of canvas between them. */
const RING = { cx: 730, cy: 578, r: 38 };
const ringTotal = TRIAGE.reduce((sum, t) => sum + t[1], 0);
const ringC = 2 * Math.PI * RING.r;
let ringAt = 0;
const ring = TRIAGE.map(([, people, colour]) => {
  const len = (people / ringTotal) * ringC;
  const seg = `<circle cx="${RING.cx}" cy="${RING.cy}" r="${RING.r}" fill="none" stroke="${colour}" stroke-width="12" stroke-dasharray="${r1(
    len - 2.4,
  )} ${r1(ringC - len + 2.4)}" stroke-dashoffset="${r1(-ringAt)}" transform="rotate(-90 ${RING.cx} ${RING.cy})"/>`;
  ringAt += len;
  return seg;
}).join("\n    ");
const legend = TRIAGE.map(([band, people, colour], i) => {
  const y = 548 + i * 28;
  return `<rect x="790" y="${y - 8}" width="9" height="9" rx="2.5" fill="${colour}"/>
    <text class="lg" x="806" y="${y}">${band}</text>
    <text class="lq" x="806" y="${y + 12}">${people} people</text>
    <text class="mo lp" x="964" y="${y}" text-anchor="end">${Math.round((people / ringTotal) * 100)}%</text>`;
}).join("\n    ");

const NAV = [
  ["Intake console", "M22 117h4.6v4.6H22zM28.4 117H33v4.6h-4.6zM22 123.4h4.6V128H22zM28.4 123.4H33V128h-4.6z"],
  ["Appointments", "M22 152h11v10.5H22zM22 155.5h11M25 150v3.5M30 150v3.5"],
  ["Clinical insights", "M23 196v-5M27.5 196v-9.5M32 196v-7"],
  ["Chats", "M22 220.5a2.5 2.5 0 0 1 2.5-2.5h6a2.5 2.5 0 0 1 2.5 2.5v4a2.5 2.5 0 0 1-2.5 2.5H26l-3 2.6v-2.9a2.5 2.5 0 0 1-1-2.2z"],
];

const CONSOLE = `<svg class="hc" viewBox="0 0 1000 640" role="img" aria-label="Sample view of the Hope Trust intake console: clinic vitals, enquiry volume, live activity, the admission pathway and the triage mix. Every name and number in it is made up.">
<defs>
  <linearGradient id="crmBand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#023840"/><stop offset=".78" stop-color="#001217"/></linearGradient>
  <radialGradient id="crmGlowA" cx=".08" cy="0" r=".9"><stop offset="0" stop-color="#2ABFAB" stop-opacity=".22"/><stop offset="1" stop-color="#2ABFAB" stop-opacity="0"/></radialGradient>
  <radialGradient id="crmGlowB" cx=".96" cy="1" r=".8"><stop offset="0" stop-color="#ED7428" stop-opacity=".16"/><stop offset="1" stop-color="#ED7428" stop-opacity="0"/></radialGradient>
  <linearGradient id="crmMint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2ABFAB" stop-opacity=".22"/><stop offset="1" stop-color="#2ABFAB" stop-opacity="0"/></linearGradient>
  <linearGradient id="crmBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2ABFAB"/><stop offset="1" stop-color="#7FE6D4"/></linearGradient>
  <linearGradient id="crmFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDF3F3" stop-opacity="0"/><stop offset="1" stop-color="#EDF3F3"/></linearGradient>
  <clipPath id="crmBandClip"><rect x="220" y="118" width="760" height="108" rx="16"/></clipPath>
  <clipPath id="crmFeedClip"><rect x="740" y="292" width="236" height="154"/></clipPath>
  <clipPath id="crmLogo"><circle cx="34" cy="38" r="14"/></clipPath>
</defs>

<rect width="196" height="640" fill="#002A30"/>
<circle cx="34" cy="38" r="15" fill="#fff"/>
<image href="/crm/hopetrust-logo.png" x="20" y="24" width="28" height="28" clip-path="url(#crmLogo)"/>
<text class="wm" x="57" y="43">Hope <tspan fill="#ED7428">Trust</tspan></text>
<text class="mo sub" x="57" y="58">INTAKE CONSOLE</text>
<text class="mo sub" x="18" y="98">CLINICAL</text>
<rect x="10" y="108" width="176" height="30" rx="9" fill="#2ABFAB" fill-opacity=".14" stroke="#2ABFAB" stroke-opacity=".26"/>
<rect x="0" y="115" width="3" height="16" rx="1.5" fill="#2ABFAB"/>
${NAV.map(
  ([label, icon], i) => `<path class="ni${i ? "" : " on"}" d="${icon}"/>
<text class="nv${i ? "" : " on"}" x="44" y="${127 + i * 34}">${label}</text>`,
).join("\n")}

<rect x="196" width="804" height="640" fill="#EDF3F3"/>
<rect x="196" width="804" height="46" fill="#E8F0F0"/>
<path d="M196 46.5H1000" stroke="#E2EBEB"/>
<text class="cr" x="220" y="28">Hope Trust<tspan dx="7">/</tspan><tspan class="crb" dx="7">Intake console</tspan></text>
<rect x="842" y="12" width="138" height="22" rx="11" fill="#fff" stroke="#E2EBEB"/>
<circle class="live" cx="856" cy="23" r="6" fill="#2ABFAB" fill-opacity=".18"/>
<circle cx="856" cy="23" r="3" fill="#2ABFAB"/>
<text class="mo lv" x="866" y="26">LIVE <tspan class="lvb">11:08 AM</tspan> IST</text>

<text class="ttl" x="220" y="84">Intake console</text>
<text class="nt" x="220" y="103">Who has reached out, where their intake stalled, and who the desk should contact next.</text>

<rect x="220" y="118" width="760" height="108" rx="16" fill="url(#crmBand)"/>
<rect x="220" y="118" width="760" height="108" rx="16" fill="url(#crmGlowA)"/>
<rect x="220" y="118" width="760" height="108" rx="16" fill="url(#crmGlowB)"/>
<g clip-path="url(#crmBandClip)">
  <path class="ar" d="${area(traceLine, TRACE.x0, TRACE.x1, TRACE.base)}" fill="url(#crmMint)"/>
  <path class="ln tr" d="${traceLine}" pathLength="1"/>
</g>
<path d="M410 134V210M600 134V210M790 134V210" stroke="#9FBCBF" stroke-opacity=".13"/>
${VITALS.map(vital).join("\n")}

<rect class="cd" x="220" y="238" width="500" height="220" rx="14"/>
<rect class="gw" x="236" y="254" width="24" height="24" rx="7"/>
<path class="gl" d="M241 271l4.5-6 4 3.5 5.5-7"/>
<text class="ch" x="270" y="265">Enquiry volume</text>
<text class="cn" x="270" y="279">New conversations by day of first contact.</text>
<path class="gr" d="M240 312H704M240 352H704M240 392H704M240 432H704"/>
<path class="ar" d="${area(volumeLine, CHART.x0, CHART.x1, CHART.base)}" fill="url(#crmMint)"/>
<path class="ln" d="${volumeLine}" pathLength="1"/>
<text class="mo ax" x="240" y="448">30 DAYS AGO</text>
<text class="mo ax" x="704" y="448" text-anchor="end">TODAY</text>

<rect class="cd" x="732" y="238" width="248" height="220" rx="14"/>
<rect class="gw" x="748" y="254" width="24" height="24" rx="7"/>
<path class="gl" d="M752 266.5h3.5l2.2-4.5 3.6 9 2.4-4.5h4.3"/>
<text class="ch" x="782" y="265">Live activity</text>
<text class="cn" x="782" y="279">Every step the bot logged, newest first.</text>
<g clip-path="url(#crmFeedClip)">
  <g class="fd-new">
    <rect class="fd-wash" x="744" y="${FEED_TOP - 17}" width="228" height="34" rx="8" fill="#2ABFAB" fill-opacity=".1"/>
    ${feedRow(ARRIVAL, FEED_TOP)}
    ${spine(FEED_TOP)}
  </g>
  <g class="fd-old">
    ${FEED.slice(0, 3)
      .map((row, i) => feedRow(row, FEED_TOP + i * ROW) + spine(FEED_TOP + i * ROW))
      .join("\n    ")}
    <g class="fd-last">${feedRow(FEED[3], FEED_TOP + 3 * ROW)}</g>
  </g>
</g>

<rect class="cd" x="220" y="470" width="430" height="200" rx="14"/>
<rect class="gw" x="236" y="486" width="24" height="24" rx="7"/>
<path class="gl" d="M242 504v-5.5a3 3 0 0 1 3-3h7.5M249.5 492.5l3 3-3 3"/>
<text class="ch" x="270" y="497">Admission pathway</text>
<text class="cn" x="270" y="511">Booked is what staff marked, plus DocPulse bookings made after a link.</text>
${PATHWAY.map(pathwayRow).join("\n")}

<rect class="cd" x="662" y="470" width="318" height="200" rx="14"/>
<rect class="gw" x="678" y="486" width="24" height="24" rx="7"/>
<circle class="gl" cx="690" cy="498" r="6"/>
<path class="gl" d="M690 492v6h6"/>
<text class="ch" x="712" y="497">Triage mix</text>
<text class="cn" x="712" y="511">How the open queue is banded.</text>
<circle cx="${RING.cx}" cy="${RING.cy}" r="${RING.r}" fill="none" stroke="#EDF2F2" stroke-width="12"/>
${ring}
<text class="dv" x="${RING.cx}" y="${RING.cy + 4}" text-anchor="middle">${ringTotal}</text>
<text class="mo dlb" x="${RING.cx}" y="${RING.cy + 15}" text-anchor="middle">OPEN</text>
${legend}

<rect x="196" y="580" width="804" height="60" fill="url(#crmFade)"/>
</svg>`;

/* Every beat is on in the markup: the finished conversation is what a visitor
   who never sees it play (reduced motion) is shown. */
export const CRM_HTML = `<!-- 6 — HOPE TRUST CRM -->
<section class="dgs dark" id="dcrm" data-bg="#FFFFFF" data-label="Hope Trust CRM">
  <h2 class="dgh up" style="--d:.08s">Chat, booking, CRM — <em>live</em> at Hope Trust.</h2>
  <p class="dgp up" style="--d:.14s">The website was the start. For Hope Trust India we also built what happens next: a WhatsApp assistant that answers the moment someone writes, and an intake console where their team sees every enquiry, how urgent it is, and who to call next.</p>
  <div class="crm-stage ${CRM_BEATS.map((b) => b.cls).join(" ")} up" id="crmStage" style="--d:.2s">
    <div class="crm-phone" id="crmPhone">
      ${PHONE}
      <button class="crm-toggle" id="crmToggle" type="button" hidden>
        <svg viewBox="0 0 10 10" aria-hidden="true"><path class="i-pause" d="M2 1h2v8H2zM6 1h2v8H6z"/><path class="i-play" d="M2 1l7 4-7 4z"/></svg>
        <span id="crmToggleLabel">Pause chat</span>
      </button>
    </div>
    <figure class="crm-win">
      <div class="crm-frame">
        <div class="crm-bar" aria-hidden="true"><i></i><i></i><i></i><span>Hope Trust · Intake console</span></div>
        ${CONSOLE}
      </div>
      <figcaption>Sample data. The real console holds patient records, so none of it is shown here.</figcaption>
    </figure>
  </div>
  <div class="pillars up" style="--d:.26s">
    ${POINTS.map((p) => `<div class="pillar"><h3>${p.h}</h3><p>${p.p}</p></div>`).join("\n    ")}
  </div>
</section>`;

/**
 * Plays the conversation while the phone is on screen. Returns a cleanup that
 * stops every timer and detaches every listener.
 */
export function initCrm() {
  const stage = document.getElementById("crmStage");
  const phone = document.getElementById("crmPhone");
  const toggle = document.getElementById("crmToggle");
  const label = document.getElementById("crmToggleLabel");
  if (!stage || !phone) return () => {};

  /* Reduced motion keeps the finished conversation the markup ships with. */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const BEATS = CRM_BEATS.map((b) => b.cls);
  let timers = [];
  let held = false;
  let seen = false;

  const show = (all) => {
    stage.classList.remove(...BEATS);
    if (all) stage.classList.add(...BEATS);
  };
  const stop = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const play = () => {
    stop();
    show(false);
    for (const b of CRM_BEATS) timers.push(setTimeout(() => stage.classList.add(b.cls), b.at));
    timers.push(setTimeout(() => show(false), CRM_CLEAR_AT));
    timers.push(setTimeout(play, CRM_CYCLE));
  };

  /* Start from an empty chat. The section is below the fold at mount, so the
     finished state fades out before anyone is looking. */
  show(false);

  /* Half the phone in view, so the hello is not sent to an empty room. Off
     screen it stops and resets, so it always starts from the beginning. */
  const io = new IntersectionObserver(
    ([e]) => {
      seen = e.isIntersecting;
      if (held) return;
      if (seen) play();
      else {
        stop();
        show(false);
      }
    },
    { threshold: 0.5 },
  );
  io.observe(phone);

  /* Paused shows the whole conversation rather than freezing it mid-beat. */
  const onToggle = () => {
    held = !held;
    toggle.classList.toggle("held", held);
    if (label) label.textContent = held ? "Play chat" : "Pause chat";
    if (held) {
      stop();
      show(true);
    } else if (seen) play();
    else show(false);
  };
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener("click", onToggle);
  }

  return function cleanup() {
    stop();
    io.disconnect();
    if (toggle) toggle.removeEventListener("click", onToggle);
  };
}
