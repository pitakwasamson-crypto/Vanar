/* ==========================================================================
   Vanar OCP — mobile image header content

   Split out of mobile-chapters.js purely to keep that file under the 300-LOC
   cap; load this first. The bundle this was adapted from fetched the same data
   as chapters.json + narrative.json, which cost two blocking round trips ahead
   of mobile LCP.

   `chapters` carries the visual identity of each slide (image stem, accent,
   alt-text subject). `narrative` carries the copy, and tracks the desktop
   header's DEFAULT_NARRATIVE in ocp-video-scroller.js — when one changes, so
   does the other, or the two headers start telling different stories.

   `accentPhrase` is the run of words inside title + titleLineTwo that renders
   in the accent green; everything else in the heading stays white. Match it
   exactly (case-insensitively) against one of those two strings — a phrase
   that straddles both will not highlight.

   No scene carries an eyebrow. The location each one used to name (London,
   Bengaluru, Dubai, Manila) now lives in the chapter's `focus`, which is the
   image alt text, so removing the visible line did not drop it from the page
   for screen readers.
   ========================================================================== */

window.__VANAR_MOBILE_CHAPTERS = Object.freeze({
    chapters: Object.freeze([
        Object.freeze({
            id: "ocp",
            image: "00-ocp",
            accent: "#84f7c7",
            focus: "The OCP doorway"
        }),
        Object.freeze({
            id: "idea",
            image: "01-idea",
            accent: "#ff5a52",
            focus: "The Voidsec founder in London"
        }),
        Object.freeze({
            id: "service",
            image: "02-service",
            accent: "#f2aa37",
            focus: "The ChainCharter founders in Bengaluru"
        }),
        Object.freeze({
            id: "app",
            image: "03-app",
            accent: "#5b83ff",
            focus: "The Flowstate Pay founder in Dubai"
        }),
        Object.freeze({
            id: "team",
            image: "04-team",
            accent: "#32dbe8",
            focus: "The Tideline founding team in Manila"
        }),
    ]),

    narrative: Object.freeze([
        Object.freeze({
            id: "ocp",
            railNumber: "00",
            railLabel: "OCP",
            title: "Launch an AI\nOrganization.\nHire One.",
            titleLineTwo: "Back the Best.",
            accentPhrase: "Back the Best.",
            detailLead: "Chatbots answer. Agents do tasks. Vanar Orgs run the Organization.",
            detail: "The AI Organization has arrived, a real Organization with an AI workforce and a treasury, marketing, selling, supporting, and growing as one. Settled in USDC on Base.",
        }),
        Object.freeze({
            id: "idea",
            railNumber: "01",
            railLabel: "Idea",
            title: "Your idea becomes",
            titleLineTwo: "a running Organization.",
            accentPhrase: "Your idea",
            detail: "Describe what you want to build. Turn it into a live Organization with a product, AI workforce, payments, and the tools to market, sell, support, and grow from day one.",
        }),
        Object.freeze({
            id: "service",
            railNumber: "02",
            railLabel: "Service",
            title: "Your service becomes",
            titleLineTwo: "a scalable Organization.",
            accentPhrase: "Your service",
            detail: "Turn the service you already offer into a structured Organization buyers can order from. Package your expertise, handle intake, manage payments, and add AI workers for delivery and follow-up.",
        }),
        Object.freeze({
            id: "app",
            railNumber: "03",
            railLabel: "App",
            title: "Your vibe-coded app",
            titleLineTwo: "becomes a business.",
            accentPhrase: "vibe-coded app",
            detail: "You built the app. Now build the business around it. Add payments, support, marketing, growth workflows, and an AI workforce that helps turn users into customers.",
            platforms: [
                ["base44-wordmark.webp", "Base44"],
                ["codex.webp", "OpenAI Codex"],
                ["claude-wordmark.webp", "Claude"],
                ["cursor.webp", "Cursor"],
                ["lovable-wordmark.webp", "Lovable"],
                ["bolt-wordmark.webp", "Bolt.new"],
                ["replit-wordmark.webp", "Replit"],
            ],
        }),
        Object.freeze({
            id: "team",
            railNumber: "04",
            railLabel: "Team",
            title: "Give your team",
            titleLineTwo: "an AI workforce.",
            accentPhrase: "your team",
            detail: "Scale beyond your current headcount. Add specialist AI workers for marketing, sales, support, SEO, business development, and reporting, all learning from your Organization.",
        }),
    ]),
});